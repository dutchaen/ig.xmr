use std::collections::HashMap;

use actix_session::Session;
use actix_web::{web, HttpResponse};
use serde_json::json;

use crate::{
    httpkit, kit,
    models::{CommentModel, PostInfo, UserModel, ViewableComment, ViewableUser},
};
use actix_web::get;

#[get("/{short_code}")]
async fn get_post_media(
    manager: web::Data<crate::Manager>,
    short_code: web::Path<String>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let post: Option<PostInfo> = sqlx::query_as("SELECT * FROM Posts WHERE short_code = ?")
        .bind(&short_code.into_inner())
        .fetch_optional(&manager.pool)
        .await?;

    return match post {
        Some(post) => {
            let (content_type, image_bytes) = kit::parse_base64_image(&post.media_source);

            Ok(HttpResponse::Ok()
                .content_type(content_type)
                .body(image_bytes))
        }
        None => httpkit::send_json(
            400,
            json!({
                "error": "Huh?"
            }),
        ),
    };
}

#[get("/{short_code}/shortcode/info")]
async fn get_post_info_via_shortcode(
    session: Session,
    manager: web::Data<crate::Manager>,
    short_code: web::Path<String>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let base_user = kit::is_logged_in(&session);
    if let None = base_user {
        session.purge();
    }

    let post: Option<PostInfo> = sqlx::query_as("SELECT * FROM Posts WHERE short_code = ?")
        .bind(&short_code.into_inner())
        .fetch_optional(&manager.pool)
        .await?;

    return match post {
        Some(post) => {
            let base_info = post.to_base_post_info(&base_user, &manager).await?;
            let json_data = serde_json::to_value(base_info)?;

            httpkit::send_json(200, json_data)
        }
        None => httpkit::send_json(
            400,
            json!({
                "error": "Huh?"
            }),
        ),
    };
}

#[get("/{post_id}/id/info")]
async fn get_post_info_via_id(
    session: Session,
    manager: web::Data<crate::Manager>,
    post_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let base_user = kit::is_logged_in(&session);

    if let None = base_user {
        session.purge();
    }

    let post: Option<PostInfo> = sqlx::query_as("SELECT * FROM Posts WHERE id = ?")
        .bind(&post_id.into_inner())
        .fetch_optional(&manager.pool)
        .await?;

    return match post {
        Some(post) => {
            let base_info = post.to_base_post_info(&base_user, &manager).await?;
            let json_data = serde_json::to_value(base_info)?;

            httpkit::send_json(200, json_data)
        }
        None => httpkit::send_json(
            400,
            json!({
                "error": "Huh?"
            }),
        ),
    };
}

#[get("/{post_id}/comments")]
async fn get_post_comments(
    session: Session,
    manager: web::Data<crate::Manager>,
    post_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let base_user = kit::is_logged_in(&session);

    if let None = base_user {
        session.purge();
    }

    let post: Option<PostInfo> = sqlx::query_as("SELECT * FROM Posts WHERE id = ?")
        .bind(&post_id.into_inner())
        .fetch_optional(&manager.pool)
        .await?;

    let post = match post {
        Some(post) => post,
        None => {
            return httpkit::send_json(200, json!([]));
        }
    };

    let post_comments_table_name = format!("POST_{}_COMMENTS", post.id);

    let comments: Vec<CommentModel> =
        sqlx::query_as(&format!("SELECT * FROM {}", post_comments_table_name))
            .fetch_all(&manager.pool)
            .await?;

    let mut viewable_comments = vec![];
    let mut map: HashMap<u64, ViewableUser> = HashMap::new();

    for comment in comments.iter() {
        match map.get(&comment.owner_id) {
            Some(viewable_user) => {
                let comment = ViewableComment {
                    id: comment.id,
                    owner: viewable_user.to_owned(),
                    content: comment.content.to_owned(),
                };

                viewable_comments.push(comment);
            }
            None => {
                let mut is_following: Option<bool> = None;
                let um = UserModel::from_id(comment.owner_id, &manager).await?;
                if let None = um {
                    continue;
                }

                let user_model = um.unwrap();

                if let Some(base) = &base_user {
                    is_following =
                        Some(kit::is_following(base.id, comment.owner_id, &manager).await?);
                }

                let viewable = user_model.to_viewable_user(is_following, &manager).await?;
                map.insert(comment.owner_id, viewable.to_owned());

                let comment = ViewableComment {
                    id: comment.id,
                    owner: viewable.to_owned(),
                    content: comment.content.to_owned(),
                };
                viewable_comments.push(comment);
            }
        }
    }

    let comments_json = serde_json::to_value(&viewable_comments)?;
    return httpkit::send_json(200, comments_json);
}
