use actix_session::Session;
use actix_web::{web, HttpResponse};
use serde_json::json;

use crate::{
    httpkit, kit,
    models::{PostInfo, UserModel},
};
use actix_web::get;


#[get("/{user_id}/medias")]
async fn get_medias(
    session: Session,
    manager: web::Data<crate::Manager>,
    user_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let user_id = user_id.clone();

    let base_user = kit::is_logged_in(&session);
    if let None = base_user {
        session.purge();
    }

    let user_model = match UserModel::from_id(user_id, &manager).await? {
        Some(model) => model,
        _ => return httpkit::http_json_error("This user does not exist."),
    };

    let posts: Vec<PostInfo> = sqlx::query_as("SELECT * FROM Posts WHERE posted_by = ?")
        .bind(&user_model.id)
        .fetch_all(&manager.pool)
        .await?;

    println!("{:#?}", posts);

    let mut base_posts = vec![];

    for post in posts.iter() {
        if let Ok(base_post) = post.to_base_post_info(&base_user, &manager).await {
            base_posts.push(base_post);
        }
    }

    let json_object = serde_json::to_value(&base_posts)?;
    return httpkit::send_json(200, json_object);
}

#[get("/{username}/username/info")]
async fn get_username_info(
    session: Session,
    manager: web::Data<crate::Manager>,
    username: web::Path<String>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let mut is_following: Option<bool> = None;
    let user: Option<UserModel> = sqlx::query_as("SELECT * FROM Users WHERE username = ?")
        .bind(&username.into_inner())
        .fetch_optional(&manager.pool)
        .await?;

    return match user {
        Some(user) => {
            match kit::is_logged_in(&session) {
                Some(base) => {
                    is_following = Some(kit::is_following(base.id, user.id, &manager).await?);
                }
                _ => {}
            }

            let viewable_user = user.to_viewable_user(is_following, &manager).await?;
            let response = serde_json::to_value(&viewable_user)?;
            httpkit::send_json(200, response)
        }
        None => httpkit::send_json(
            404,
            json!({
                "error": "User not found :("
            }),
        ),
    };
}

#[get("/{user_id}/id/info")]
async fn get_user_id_info(
    session: Session,
    manager: web::Data<crate::Manager>,
    user_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let mut is_following: Option<bool> = None;

    let user: Option<UserModel> = sqlx::query_as("SELECT * FROM Users WHERE id = ?")
        .bind(&user_id.into_inner())
        .fetch_optional(&manager.pool)
        .await?;

    return match user {
        Some(user) => {
            match kit::is_logged_in(&session) {
                Some(base) => {
                    is_following = Some(kit::is_following(base.id, user.id, &manager).await?);
                }
                _ => {}
            }

            let viewable_user = user.to_viewable_user(is_following, &manager).await?;
            let response = serde_json::to_value(&viewable_user)?;
            httpkit::send_json(200, response)
        }
        None => httpkit::send_json(
            404,
            json!({
                "error": "User not found :("
            }),
        ),
    };
}

#[get("/{username}/avatar")]
async fn get_username_avatar_by_username(
    manager: web::Data<crate::Manager>,
    username: web::Path<String>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let user: Option<UserModel> = sqlx::query_as("SELECT * FROM Users WHERE username = ?")
        .bind(&username.into_inner())
        .fetch_optional(&manager.pool)
        .await?;

    return match user {
        Some(user) => {
            let (content_type, image_bytes) = kit::parse_base64_image(&user.profile_photo);

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

#[derive(Debug, serde::Deserialize)]
pub struct SearchRequest {
    pub query: String,
}

#[get("/search")]
async fn search_for_users(
    manager: web::Data<crate::Manager>,
    query_request: web::Query<SearchRequest>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let query = query_request.into_inner();

    let query_text = format!("{}%", query.query.to_ascii_lowercase());

    let users: Vec<UserModel> =
        sqlx::query_as("SELECT * FROM Users WHERE username LIKE ? LIMIT 20")
            .bind(&query_text)
            .fetch_all(&manager.pool)
            .await?;

    let mut found_users = vec![];
    for user in users {
        let x = user.to_viewable_user(None, &manager).await?;
        found_users.push(x);
    }

    let json_body = serde_json::to_value(&found_users)?;
    return httpkit::send_json(200, json_body);
}
