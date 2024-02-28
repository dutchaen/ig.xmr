use actix_session::Session;
use actix_web::{post, web, HttpResponse};
use serde_json::json;

use crate::{httpkit, kit, models::UserModel};

#[post("/{user_id}/create_friendship")]
async fn create_friendship(
    session: Session,
    manager: web::Data<crate::Manager>,
    user_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let my_user = match my_base.to_user_model(&manager).await? {
        Some(u) => u,
        _ => {
            return httpkit::send_json(
                404,
                json!({
                    "error": "User not found :("
                }),
            );
        }
    };

    let their_user = match UserModel::from_id(user_id.into_inner(), &manager).await? {
        Some(u) => u,
        _ => {
            return httpkit::send_json(
                404,
                json!({
                    "error": "User not found :("
                }),
            );
        }
    };

    if my_user.id == their_user.id {
        return httpkit::send_json(
            404,
            json!({
                "error": "You cannot follow yourself. Try finding other Instagram users to follow. #DoItForTheGram!"
            }),
        );
    }

    let insert_following_table = format!("USER_{}_FOLLOWINGS", my_user.id);
    let insert_followers_table = format!("USER_{}_FOLLOWERS", their_user.id);


    sqlx::query(&format!(
        "INSERT INTO {} VALUES (?)",
        insert_following_table
    ))
    .bind(their_user.id)
    .execute(&manager.pool)
    .await?;

    sqlx::query(&format!(
        "INSERT INTO {} VALUES (?)",
        insert_followers_table
    ))
    .bind(my_user.id)
    .execute(&manager.pool)
    .await?;

    httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    )
}

#[post("/{user_id}/destroy_friendship")]
async fn destroy_friendship(
    session: Session,
    manager: web::Data<crate::Manager>,
    user_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let my_user = match my_base.to_user_model(&manager).await? {
        Some(u) => u,
        _ => {
            return httpkit::send_json(
                404,
                json!({
                    "error": "User not found :("
                }),
            );
        }
    };

    let their_user = match UserModel::from_id(user_id.into_inner(), &manager).await? {
        Some(u) => u,
        _ => {
            return httpkit::send_json(
                404,
                json!({
                    "error": "User not found :("
                }),
            );
        }
    };

    if my_user.id == their_user.id {
        return httpkit::send_json(
            404,
            json!({
                "error": "You cannot unfollow yourself. #DoItForTheGram!"
            }),
        );
    }

    let insert_following_table = format!("USER_{}_FOLLOWINGS", my_user.id);
    let insert_followers_table = format!("USER_{}_FOLLOWERS", their_user.id);

    #[allow(unused_must_use)]
    {
        let result = sqlx::query(&format!(
            "DELETE FROM {} WHERE id = ?",
            insert_following_table
        ))
        .bind(their_user.id)
        .execute(&manager.pool)
        .await;

        if let Err(_) = result {
            return httpkit::send_json(
                500,
                json!({
                    "error": "?"
                }),
            );
        }

        let result = sqlx::query(&format!(
            "DELETE FROM {} WHERE id = ?",
            insert_followers_table
        ))
        .bind(my_user.id)
        .execute(&manager.pool)
        .await;

        if let Err(_) = result {
            return httpkit::send_json(
                500,
                json!({
                    "error": "?"
                }),
            );
        }
    }

    httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    )
}
