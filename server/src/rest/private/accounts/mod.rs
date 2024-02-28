use actix_session::Session;
use actix_web::{get, post, web, HttpResponse};
use serde_json::json;

use crate::{
    httpkit, kit,
    models::{BaseUser, IChangePassword, IEditProfile, IProfilePhoto, ISetUsername, UserModel},
};

#[get("/current_user")]
async fn get_current_user(
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

    let this_user: Option<UserModel> = sqlx::query_as("SELECT * FROM Users WHERE id = ?")
        .bind(&my_base.id)
        .fetch_optional(&manager.pool)
        .await?;

    let user = match this_user {
        Some(user) => user,
        None => return httpkit::http_json_error("What?"),
    };

    let private_user = user.to_private_user();
    let private_user_json = serde_json::to_value(&private_user)?;
    return httpkit::send_json(200, private_user_json);
}

#[post("/edit_profile")]
async fn edit_profile(
    session: Session,
    manager: web::Data<crate::Manager>,
    requested_profile: web::Json<IEditProfile>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let this_user: Option<UserModel> = sqlx::query_as("SELECT * FROM Users WHERE id = ?")
        .bind(&my_base.id)
        .fetch_optional(&manager.pool)
        .await?;

    match this_user {
        Some(_) => {}
        None => return httpkit::http_json_error("What?"),
    };

    let mut requested_profile = requested_profile.into_inner();
    requested_profile.username = requested_profile.username.to_lowercase();
    requested_profile.email = requested_profile.email.to_lowercase();

    if !kit::is_username_ok(&requested_profile.username)
        || !kit::is_username_available(&manager, &requested_profile.username, Some(my_base.id))
            .await?
    {
        return httpkit::http_json_error(
            "The username you have provided will not work. Please change it.",
        );
    }

    if !kit::is_email_ok(&requested_profile.email)
        || !kit::is_email_available(&manager, &requested_profile.email, Some(my_base.id)).await?
    {
        return httpkit::http_json_error(
            "The email you have provided will not work. Please change it.",
        );
    }

    let result = sqlx::query("UPDATE Users SET name = ?, username = ?, email = ?, bio = ?, website = ?, gender = ? WHERE id = ?")
        .bind(&requested_profile.full_name)
        .bind(&requested_profile.username)
        .bind(&requested_profile.email)
        .bind(&requested_profile.bio)
        .bind(&requested_profile.website)
        .bind(&requested_profile.gender)
        .bind(&my_base.id)
        .execute(&manager.pool)
        .await?;

    if result.rows_affected() == 0 {
        return httpkit::http_json_error("There was an error with this request.");
    }

    return httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    );
}

#[post("/set_username")]
async fn set_username(
    session: Session,
    manager: web::Data<crate::Manager>,
    requested_username: web::Json<ISetUsername>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let this_user: Option<UserModel> = sqlx::query_as("SELECT * FROM Users WHERE id = ?")
        .bind(&my_base.id)
        .fetch_optional(&manager.pool)
        .await?;

    match this_user {
        Some(_) => {}
        None => {
            session.purge();
            return httpkit::http_json_error("What?");
        }
    };

    let mut request = requested_username.into_inner();
    request.username = request.username.to_lowercase();

    if !kit::is_username_ok(&request.username)
        || !kit::is_username_available(&manager, &request.username, Some(my_base.id)).await?
    {
        return httpkit::http_json_error(
            "The username you have provided will not work. Please change it.",
        );
    }

    let result = sqlx::query("UPDATE Users SET username = ? WHERE id = ?")
        .bind(&request.username)
        .bind(&my_base.id)
        .execute(&manager.pool)
        .await?;

    if result.rows_affected() == 0 {
        return httpkit::http_json_error("There was an error with this request.");
    }

    return httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    );
}

#[post("/change_password")]
async fn change_password(
    session: Session,
    manager: web::Data<crate::Manager>,
    request: web::Json<IChangePassword>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let this_user: Option<UserModel> = sqlx::query_as("SELECT * FROM Users WHERE id = ?")
        .bind(&my_base.id)
        .fetch_optional(&manager.pool)
        .await?;

    let user = match this_user {
        Some(user) => user,
        None => {
            session.purge();
            return httpkit::http_json_error("What?");
        }
    };

    if !kit::cmp_password(&request.old_password, &user.salt, &user.hashed_password) {
        return httpkit::http_json_error(
            "The old password provided was invalid. Please try again.",
        );
    }

    let salt = kit::create_salt_sha256();
    let hashed_password = kit::hash_password(&request.new_password, &salt);

    sqlx::query("UPDATE Users SET hashed_password = ?, salt = ? WHERE id = ?")
        .bind(&hashed_password)
        .bind(&salt)
        .bind(&my_base.id)
        .execute(&manager.pool)
        .await?;

    session.remove("b");
    session.insert(
        "b",
        BaseUser {
            id: my_base.id,
        },
    )?;

    return httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    );
}

#[post("/change_profile_photo")]
async fn change_profile_photo(
    session: Session,
    manager: web::Data<crate::Manager>,
    ipfp: web::Json<IProfilePhoto>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let mut pfp = ipfp.into_inner();

    if !kit::ensure_pfp_is_good(&mut pfp) {
        return httpkit::http_json_error("Profile photo is not suitable.");
    }

    sqlx::query("UPDATE Users SET profile_photo = ? WHERE id = ?")
        .bind(&pfp.photo)
        .bind(&my_base.id)
        .execute(&manager.pool)
        .await?;

    return httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    );
}

#[get("/signout")]
async fn signout(session: Session) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    session.purge();
    return httpkit::redirect("/");
}
