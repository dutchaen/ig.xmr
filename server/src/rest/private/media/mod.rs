use std::vec;

use actix_session::Session;
use actix_web::{get, post, web, HttpResponse};
use chrono::Utc;
use serde_json::json;
use sqlx::Row;

use crate::{
    httpkit, kit,
    models::{
        CommentModel, 
        IComment, 
        IMedia, 
        PostInfo
    },
};



#[get("/timeline")]
async fn get_timeline(
    session: Session,
    manager: web::Data<crate::Manager>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let base_optional = Some(my_base.clone());

    let user_timeline_table_name = format!("USER_{}_TIMELINE", my_base.id);

    let timeline_ids = sqlx::query(&format!(
        "SELECT id, owner_id FROM {}",
        user_timeline_table_name
    ))
    .fetch_all(&manager.pool)
    .await
    .unwrap_or(vec![])
    .iter()
    .map(|x| {
        let id: u64 = x.get(0);
        let owner_id: u64 = x.get(1);

        (id as u64, owner_id as u64)
    })
    .collect::<Vec<_>>();

    println!("{:#?}", timeline_ids);

    let mut posts = vec![];

    for (id, owner_id) in timeline_ids.iter() {
        let post_info: Option<PostInfo> =
            sqlx::query_as("SELECT * FROM Posts WHERE id = ? AND posted_by = ?")
                .bind(&id)
                .bind(&owner_id)
                .fetch_optional(&manager.pool)
                .await?;

        if let Some(post) = post_info {
            let base_post = post.to_base_post_info(&base_optional, &manager).await?;
            posts.push(base_post);
        }
    }

    posts.reverse();

    let posts_json = serde_json::to_value(&posts)?;

    return httpkit::send_json(200, posts_json);
}

#[post("/create")]
async fn create(
    session: Session,
    manager: web::Data<crate::Manager>,
    media: web::Json<IMedia>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let mut media = media.into_inner();
    if !kit::ensure_media_is_good(&mut media) {
        return httpkit::http_json_error("The media provided is not presentable.");
    }

    let short_code = kit::create_short_code(&manager).await?;
    let now = Utc::now();

    let result = sqlx::query("INSERT INTO Posts (short_code, media_source, posted_by, caption, created_at) VALUES (?, ?, ?, ?, ?)")
        .bind(&short_code)
        .bind(&media.media_base64)
        .bind(my_base.id)
        .bind(&media.caption)
        .bind(&now)
        .execute(&manager.pool)
        .await?;

    let post_info: Option<PostInfo> = sqlx::query_as("SELECT * FROM Posts WHERE id = ?")
        .bind(&result.last_insert_id())
        .fetch_optional(&manager.pool)
        .await?;

    let post = match post_info {
        Some(post) => post,
        _ => return httpkit::http_json_error("The media provided is not presentable."),
    };

    let user_followers_table_name = format!("USER_{}_FOLLOWERS", my_base.id);
    let follower_ids = sqlx::query(&format!("SELECT id FROM {}", user_followers_table_name))
        .fetch_all(&manager.pool)
        .await
        .unwrap_or(vec![])
        .iter()
        .map(|x| x.get::<u64, usize>(0))
        .collect::<Vec<_>>();

    for id in follower_ids {
        let user_timeline_table_name = format!("USER_{}_TIMELINE", id);

        sqlx::query(&format!(
            "INSERT INTO {} VALUES (?, ?, ?)",
            user_timeline_table_name
        ))
        .bind(&post.id)
        .bind(&my_base.id)
        .bind(&now)
        .execute(&manager.pool)
        .await?;
    }



    let post_likes_table_name = format!("POST_{}_LIKES", post.id);
    let post_comments_table_name = format!("POST_{}_COMMENTS", post.id);

    sqlx::query(&format!(
        r#"
            CREATE TABLE {} (
                id BIGINT UNSIGNED PRIMARY KEY
            );
            "#,
        post_likes_table_name
    ))
    .execute(&manager.pool)
    .await?;


    sqlx::query(&format!(
        r#"
            CREATE TABLE {} (
                id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                owner_id BIGINT UNSIGNED,
                content TEXT NOT NULL,
                created_at DATETIME NOT NULL
            );
            "#,
        post_comments_table_name
    ))
    .execute(&manager.pool)
    .await?;

    httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    )
}

#[post("/{post_id}/destroy")]
async fn destroy(
    session: Session,
    manager: web::Data<crate::Manager>,
    post_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let post_id = post_id.into_inner();

    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let post_info: Option<PostInfo> =
        sqlx::query_as("SELECT * FROM Posts WHERE id = ? AND posted_by = ?")
            .bind(post_id)
            .bind(&my_base.id)
            .fetch_optional(&manager.pool)
            .await?;

    if let None = post_info {
        return httpkit::http_json_error("What?");
    }

    let post = post_info.unwrap();
    if post.posted_by != my_base.id {
        return httpkit::http_json_error("What?");
    }

    let post_table_prefix = format!("POST_{}%", post.id);

    let post_table_names = sqlx::query("SHOW TABLES LIKE ?")
        .bind(&post_table_prefix)
        .fetch_all(&manager.pool)
        .await?
        .iter()
        .map(|x| x.get::<String, usize>(0))
        .collect::<Vec<_>>();

    for table_name in post_table_names.iter() {
        sqlx::query(&format!("DROP TABLE {}", table_name))
            .execute(&manager.pool)
            .await?;
    }

    let user_followers_table_name = format!("USER_{}_FOLLOWERS", my_base.id);

    let follower_ids = sqlx::query(&format!("SELECT id FROM {}", user_followers_table_name))
        .fetch_all(&manager.pool)
        .await
        .unwrap_or(vec![])
        .iter()
        .map(|x| x.get::<u64, usize>(0))
        .collect::<Vec<_>>();

    for id in follower_ids {
        let user_timeline_table_name = format!("USER_{}_TIMELINE", id);

        let _ = sqlx::query(&format!(
            "DELETE FROM {} WHERE id = ? AND owner_id = ?",
            user_timeline_table_name
        ))
        .bind(&post.id)
        .bind(&my_base.id)
        .execute(&manager.pool)
        .await;
    }

    let result = sqlx::query("DELETE FROM Posts WHERE id = ? AND posted_by = ?")
        .bind(&post.id)
        .bind(&my_base.id)
        .execute(&manager.pool)
        .await;

    if let Err(_) = result {
        return httpkit::send_json(
            200,
            json!({
                "error": "Unable to delete this post."
            }),
        );
    }

    httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    )
}

#[post("/{post_id}/like")]
async fn like(
    session: Session,
    manager: web::Data<crate::Manager>,
    post_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let post_info: Option<PostInfo> = sqlx::query_as("SELECT * FROM Posts WHERE id = ?")
        .bind(post_id.into_inner())
        .fetch_optional(&manager.pool)
        .await?;

    if let None = post_info {
        return httpkit::http_json_error("What?");
    }

    let post = post_info.unwrap();

    let post_table_name = format!("POST_{}_LIKES", post.id);

    sqlx::query(&format!("INSERT INTO {} VALUES (?)", post_table_name))
        .bind(my_base.id)
        .execute(&manager.pool)
        .await?;


    httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    )
}

#[post("/{post_id}/unlike")]
async fn unlike(
    session: Session,
    manager: web::Data<crate::Manager>,
    post_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let post_info: Option<PostInfo> = sqlx::query_as("SELECT * FROM Posts WHERE id = ?")
        .bind(post_id.into_inner())
        .fetch_optional(&manager.pool)
        .await?;

    if let None = post_info {
        return httpkit::http_json_error("What?");
    }

    let post = post_info.unwrap();

    let post_table_name = format!("POST_{}_LIKES", post.id);

    sqlx::query(&format!("DELETE FROM {} WHERE id = ?", post_table_name))
        .bind(my_base.id)
        .execute(&manager.pool)
        .await?;

    httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    )
}

#[post("/{post_id}/create_comment")]
async fn create_comment(
    session: Session,
    manager: web::Data<crate::Manager>,
    post_id: web::Path<u64>,
    comment: web::Json<IComment>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let post_info: Option<PostInfo> = sqlx::query_as("SELECT * FROM Posts WHERE id = ?")
        .bind(post_id.into_inner())
        .fetch_optional(&manager.pool)
        .await?;

    if let None = post_info {
        return httpkit::http_json_error("What?");
    }

    let post = post_info.unwrap();
    let post_comments_table_name = format!("POST_{}_COMMENTS", post.id);

    let comment_model = sqlx::query(&format!(
        "INSERT INTO {} (owner_id, content, created_at) VALUES (?, ?, ?)",
        post_comments_table_name
    ))
    .bind(my_base.id)
    .bind(&comment.comment)
    .bind(Utc::now())
    .execute(&manager.pool)
    .await?;

    let post_comment_likes_table_name = format!(
        "POST_{}_COMMENT_{}_LIKES",
        post.id,
        comment_model.last_insert_id()
    );

    sqlx::query(&format!(
        "CREATE TABLE {} ( id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT )",
        post_comment_likes_table_name
    ))
    .execute(&manager.pool)
    .await?;

    httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    )
}

#[post("/{post_id}/comment/{comment_id}/destroy")]
async fn destroy_comment(
    session: Session,
    manager: web::Data<crate::Manager>,
    post_id: web::Path<u64>,
    comment_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let post_info: Option<PostInfo> = sqlx::query_as("SELECT * FROM Posts WHERE id = ?")
        .bind(post_id.into_inner())
        .fetch_optional(&manager.pool)
        .await?;

    if let None = post_info {
        return httpkit::http_json_error("What?");
    }

    let post = post_info.unwrap();
    let post_comments_table_name = format!("POST_{}_COMMENTS", post.id);

    let comment_id = comment_id.into_inner();

    let comment_model: Option<CommentModel> = sqlx::query_as(&format!(
        "SELECT * FROM {} WHERE id = ? AND owner_id = ?",
        post_comments_table_name
    ))
    .bind(comment_id)
    .bind(my_base.id)
    .fetch_optional(&manager.pool)
    .await?;

    if let None = comment_model {
        return httpkit::http_json_error("What?");
    }

    let comment = comment_model.unwrap();

    sqlx::query(&format!(
        "DELETE FROM {} WHERE id = ? AND owner_id = ?",
        post_comments_table_name
    ))
    .bind(comment_id)
    .bind(my_base.id)
    .execute(&manager.pool)
    .await?;

    let post_comment_likes_table_name = format!("POST_{}_COMMENT_{}_LIKES", post.id, comment.id);

    sqlx::query(&format!("DROP TABLE {}", post_comment_likes_table_name))
        .bind(my_base.id)
        .execute(&manager.pool)
        .await?;

    httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    )
}

#[post("/{post_id}/comments/{comment_id}/like")]
async fn like_comment(
    session: Session,
    manager: web::Data<crate::Manager>,
    post_id: web::Path<u64>,
    comment_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let post_info: Option<PostInfo> = sqlx::query_as("SELECT * FROM Posts WHERE id = ?")
        .bind(post_id.into_inner())
        .fetch_optional(&manager.pool)
        .await?;

    if let None = post_info {
        return httpkit::http_json_error("What?");
    }

    let post = post_info.unwrap();
    let post_comments_table_name = format!("POST_{}_COMMENTS", post.id);

    let comment_id = comment_id.into_inner();

    let comment_model: Option<CommentModel> = sqlx::query_as(&format!(
        "SELECT * FROM {} WHERE id = ?",
        post_comments_table_name
    ))
    .bind(comment_id)
    .fetch_optional(&manager.pool)
    .await?;

    if let None = comment_model {
        return httpkit::http_json_error("What?");
    }

    let comment = comment_model.unwrap();
    let post_comment_likes_table_name = format!("POST_{}_COMMENT_{}_LIKES", post.id, comment.id);

    sqlx::query(&format!(
        "INSERT INTO {} VALUES (?)",
        post_comment_likes_table_name
    ))
    .bind(my_base.id)
    .execute(&manager.pool)
    .await?;

    httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    )
}

#[post("/{post_id}/comments/{comment_id}/unlike")]
async fn unlike_comment(
    session: Session,
    manager: web::Data<crate::Manager>,
    post_id: web::Path<u64>,
    comment_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let post_info: Option<PostInfo> = sqlx::query_as("SELECT * FROM Posts WHERE id = ?")
        .bind(post_id.into_inner())
        .fetch_optional(&manager.pool)
        .await?;

    if let None = post_info {
        return httpkit::http_json_error("What?");
    }

    let post = post_info.unwrap();
    let post_comments_table_name = format!("POST_{}_COMMENTS", post.id);

    let comment_id = comment_id.into_inner();

    let comment_model: Option<CommentModel> = sqlx::query_as(&format!(
        "SELECT * FROM {} WHERE id = ?",
        post_comments_table_name
    ))
    .bind(comment_id)
    .fetch_optional(&manager.pool)
    .await?;

    if let None = comment_model {
        return httpkit::http_json_error("What?");
    }

    let comment = comment_model.unwrap();
    let post_comment_likes_table_name = format!("POST_{}_COMMENT_{}_LIKES", post.id, comment.id);

    sqlx::query(&format!(
        "DELETE FROM {} WHERE id = ?",
        post_comment_likes_table_name
    ))
    .bind(my_base.id)
    .execute(&manager.pool)
    .await?;

    httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    )
}
