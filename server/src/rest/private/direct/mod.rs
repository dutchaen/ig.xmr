use actix_session::Session;
use actix_web::{get, post, web, HttpResponse};
use chrono::Utc;
use serde_json::json;
use sqlx::Row;

use crate::{
    httpkit, kit,
    models::{
        DirectMessage, 
        ICreateThread, 
        ITextMessage, 
        Inbox, 
        PreviewThread, 
        PrivateIDModel,
        PrivateMessage,
    },
    ws::{
        LiveMessageEvent, 
        WsEvent
    },
};

#[get("/inbox")]
async fn inbox(
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

    let mut inbox = Inbox { threads: vec![] };

    let inbox_table_name = format!("USER_{}_INBOX", my_base.id);

    let inbox_thread_ids: Vec<PrivateIDModel> =
        sqlx::query_as(&format!("SELECT * FROM {}", inbox_table_name))
            .fetch_all(&manager.pool)
            .await?;

    for thread_id in inbox_thread_ids.iter() {
        let thread_members_table_name = format!("IG_THREAD_{}_MEMBERS", thread_id.id);
        let thread_messages_table_name = format!("IG_THREAD_{}_MESSAGES", thread_id.id);

        let member_ids: Vec<PrivateIDModel> =
            sqlx::query_as(&format!("SELECT * FROM {}", thread_members_table_name))
                .fetch_all(&manager.pool)
                .await?;

        let other_person_id = member_ids
            .iter()
            .find(|x| x.id != my_base.id)
            .and_then(|x| Some(x.id))
            .unwrap();

        let last_message: Option<PrivateMessage> = sqlx::query_as(&format!(
            "SELECT * FROM {} ORDER BY created_at DESC",
            thread_messages_table_name
        ))
        .fetch_optional(&manager.pool)
        .await?;

        match last_message {
            Some(last_message) => {
                let preview_user = PreviewThread::from_id(last_message.owner_id, &manager).await?;
                let reciptent = PreviewThread::from_id(other_person_id, &manager).await?;

                let preview_thread = PreviewThread {
                    id: thread_id.id,
                    preview_message: last_message.text.to_owned(),
                    is_preview_mine: last_message.owner_id == my_base.id,
                    preview_sender: preview_user,
                    reciptent,
                };

                inbox.threads.push(preview_thread);
            }
            None => {}
        };
    }

    let inbox_json = serde_json::to_value(&inbox)?;
    httpkit::send_json(200, inbox_json)
}

#[post("/thread/create")]
async fn create_thread(
    session: Session,
    manager: web::Data<crate::Manager>,
    with_data: web::Json<ICreateThread>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let payload = with_data.into_inner();

    if payload.with == my_base.id {
        return httpkit::http_json_error(
            "You cannot create a thread with yourself. Try messaging somebody else!",
        );
    }

    if !kit::user_id_exists(&manager, payload.with).await? {
        return httpkit::http_json_error("Who is this? #Ghost");
    }

    let my_inbox_table_name = format!("USER_{}_INBOX", my_base.id);

    let inbox_thread_ids: Vec<PrivateIDModel> =
        sqlx::query_as(&format!("SELECT * FROM {}", my_inbox_table_name))
            .fetch_all(&manager.pool)
            .await?;

    let thread_ids = inbox_thread_ids.iter().map(|x| x.id).collect::<Vec<_>>();

    for thread_id in thread_ids {
        let thread_members_table_name = format!("IG_THREAD_{}_MEMBERS", thread_id);

        let row = sqlx::query(&format!(
            "SELECT * FROM {} WHERE id = ?",
            thread_members_table_name
        ))
        .bind(&payload.with)
        .fetch_optional(&manager.pool)
        .await?;

        if let Some(_) = row {
            return httpkit::send_json(
                200,
                json!({
                    "existing_thread_id": thread_id
                }),
            );
        }
    }

    let now = Utc::now();

    let thread = sqlx::query("INSERT INTO Threads (created_at) VALUES (?)")
        .bind(&now)
        .execute(&manager.pool)
        .await?;

    let thread_id = thread.last_insert_id();

    let thread_messages_table_name = format!("IG_THREAD_{}_MESSAGES", thread_id);
    let thread_members_table_name = format!("IG_THREAD_{}_MEMBERS", thread_id);

    sqlx::query(&format!(
        r#"
            CREATE TABLE {} (
                id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                text TEXT NOT NULL,
                owner_id BIGINT UNSIGNED NOT NULL,
                created_at DATETIME NOT NULL,
                is_heart BOOLEAN NOT NULL
            );
            "#,
        thread_messages_table_name
    ))
    .execute(&manager.pool)
    .await?;

    sqlx::query(&format!(
        r#"
            CREATE TABLE {} (
                id BIGINT UNSIGNED PRIMARY KEY
            );
            "#,
        thread_members_table_name
    ))
    .execute(&manager.pool)
    .await?;

    sqlx::query(&format!(
        "INSERT INTO {} (id) VALUES (?)",
        thread_members_table_name
    ))
    .bind(my_base.id)
    .execute(&manager.pool)
    .await?;

    sqlx::query(&format!(
        "INSERT INTO {} (id) VALUES (?)",
        thread_members_table_name
    ))
    .bind(payload.with)
    .execute(&manager.pool)
    .await?;

    let their_inbox_table_name = format!("USER_{}_INBOX", payload.with);

    sqlx::query(&format!(
        "INSERT INTO {} (id) VALUES (?)",
        my_inbox_table_name
    ))
    .bind(thread_id)
    .execute(&manager.pool)
    .await?;

    sqlx::query(&format!(
        "INSERT INTO {} (id) VALUES (?)",
        their_inbox_table_name
    ))
    .bind(thread_id)
    .execute(&manager.pool)
    .await?;

    return httpkit::send_json(
        200,
        json!({
            "created_thread_id": thread_id
        }),
    );
}

#[get("/thread/{thread_id}/messages")]
async fn get_messages(
    session: Session,
    manager: web::Data<crate::Manager>,
    thread_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let inbox_table_name = format!("USER_{}_INBOX", my_base.id);

    let inbox_thread_ids: Vec<PrivateIDModel> =
        sqlx::query_as(&format!("SELECT * FROM {}", inbox_table_name))
            .fetch_all(&manager.pool)
            .await?;

    let thread_id = thread_id.into_inner();

    let in_inbox = inbox_thread_ids
        .iter()
        .find(|x| x.id == thread_id)
        .is_some();

    if !in_inbox {
        return httpkit::http_json_error("What?");
    }

    let thread_messages_table = format!("IG_THREAD_{}_MESSAGES", thread_id);

    let messages: Vec<PrivateMessage> = sqlx::query_as(&format!(
        "SELECT * FROM {} ORDER BY created_at DESC LIMIT 100",
        thread_messages_table
    ))
    .fetch_all(&manager.pool)
    .await?;

    let mut direct_msgs = vec![];
    for message in messages.iter() {
        let is_mine = message.owner_id == my_base.id;
        if message.is_heart {
            let direct_msg = DirectMessage {
                id: message.id,
                text: message.text.to_owned(),
                owner_id: message.owner_id,
                created_at: message.created_at.to_owned(),
                is_mine: is_mine,
                likers: vec![],
                is_seen: None,
                is_heart: message.is_heart,
            };

            direct_msgs.push(direct_msg);
            continue;
        }

        let thread_message_likes_table =
            format!("IG_THREAD_{}_MESSAGE_{}_LIKES", thread_id, message.id);
        let thread_message_viewedby_table =
            format!("IG_THREAD_{}_MESSAGE_{}_VIEWEDBY", thread_id, message.id);

        let liker_models: Vec<PrivateIDModel> =
            sqlx::query_as(&format!("SELECT * FROM {}", thread_message_likes_table))
                .fetch_all(&manager.pool)
                .await?;

        let likers = liker_models.iter().map(|x| x.id).collect::<Vec<_>>();

        let viewers: Vec<PrivateIDModel> =
            sqlx::query_as(&format!("SELECT * FROM {}", thread_message_viewedby_table))
                .fetch_all(&manager.pool)
                .await?;

        let is_seen = match is_mine {
            true => Some(viewers.iter().find(|x| x.id != my_base.id).is_none()),
            false => None,
        };

        let direct_msg = DirectMessage {
            id: message.id,
            text: message.text.to_owned(),
            owner_id: message.owner_id,
            created_at: message.created_at.to_owned(),
            is_mine: is_mine,
            likers: likers,
            is_seen: is_seen,
            is_heart: message.is_heart,
        };

        direct_msgs.push(direct_msg);
    }

    let messages_json = serde_json::to_value(&direct_msgs)?;

    return httpkit::send_json(200, messages_json);
}

#[derive(Debug, serde::Deserialize)]
pub struct BeforeDirectRequest {
    before: u64,
}

#[get("/thread/{thread_id}/previous_messages")]
async fn get_messages_before(
    session: Session,
    manager: web::Data<crate::Manager>,
    thread_id: web::Path<u64>,
    before_request: web::Query<BeforeDirectRequest>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let inbox_table_name = format!("USER_{}_INBOX", my_base.id);

    let inbox_thread_ids: Vec<PrivateIDModel> =
        sqlx::query_as(&format!("SELECT * FROM {}", inbox_table_name))
            .fetch_all(&manager.pool)
            .await?;

    let thread_id = thread_id.into_inner();

    let in_inbox = inbox_thread_ids
        .iter()
        .find(|x| x.id == thread_id)
        .is_some();

    if !in_inbox {
        return httpkit::http_json_error("What?");
    }

    let thread_messages_table = format!("IG_THREAD_{}_MESSAGES", thread_id);
    let message_id = before_request.into_inner().before;

    // ORDER BY created_at ASC
    let messages: Vec<PrivateMessage> = sqlx::query_as(&format!(
        "SELECT * FROM {} WHERE id < ? ORDER BY created_at DESC LIMIT 100",
        thread_messages_table
    ))
    .bind(&message_id)
    .fetch_all(&manager.pool)
    .await?;

    let mut direct_msgs = vec![];
    for message in messages.iter() {
        let thread_message_likes_table =
            format!("IG_THREAD_{}_MESSAGE_{}_LIKES", thread_id, message.id);
        let thread_message_viewedby_table =
            format!("IG_THREAD_{}_MESSAGE_{}_VIEWEDBY", thread_id, message.id);

        let liker_models: Vec<PrivateIDModel> =
            sqlx::query_as(&format!("SELECT * FROM {}", thread_message_likes_table))
                .fetch_all(&manager.pool)
                .await?;

        let likers = liker_models.iter().map(|x| x.id).collect::<Vec<_>>();

        let viewers: Vec<PrivateIDModel> =
            sqlx::query_as(&format!("SELECT * FROM {}", thread_message_viewedby_table))
                .fetch_all(&manager.pool)
                .await?;

        let is_mine = message.owner_id == my_base.id;
        let is_seen = match is_mine {
            true => Some(viewers.iter().find(|x| x.id != my_base.id).is_none()),
            false => None,
        };

        let direct_msg = DirectMessage {
            id: message.id,
            text: message.text.to_owned(),
            owner_id: message.owner_id,
            created_at: message.created_at.to_owned(),
            is_mine: is_mine,
            likers: likers,
            is_seen: is_seen,
            is_heart: message.is_heart,
        };

        direct_msgs.push(direct_msg);
    }

    let messages_json = serde_json::to_value(&direct_msgs)?;

    return httpkit::send_json(200, messages_json);
}

#[post("/thread/{thread_id}/send_text")]
async fn send_text(
    session: Session,
    manager: web::Data<crate::Manager>,
    thread_id: web::Path<u64>,
    message: web::Json<ITextMessage>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let inbox_table_name = format!("USER_{}_INBOX", my_base.id);

    let inbox_thread_ids: Vec<PrivateIDModel> =
        sqlx::query_as(&format!("SELECT * FROM {}", inbox_table_name))
            .fetch_all(&manager.pool)
            .await?;

    let thread_id = thread_id.into_inner();

    let in_inbox = inbox_thread_ids
        .iter()
        .find(|x| x.id == thread_id)
        .is_some();

    if !in_inbox {
        return httpkit::http_json_error("What?");
    }

    let thread_members_table = format!("IG_THREAD_{}_MEMBERS", thread_id);
    let thread_messages_table = format!("IG_THREAD_{}_MESSAGES", thread_id);
    let message = message.into_inner();

    let now = Utc::now();

    let result = sqlx::query(&format!(
        "INSERT INTO {} (text, owner_id, created_at, is_heart) VALUES (?, ?, ?, ?)",
        thread_messages_table
    ))
    .bind(&message.text)
    .bind(my_base.id)
    .bind(&now)
    .bind(false)
    .execute(&manager.pool)
    .await?;

    let message_id = result.last_insert_id();

    let tables = [
        format!("IG_THREAD_{}_MESSAGE_{}_LIKES", thread_id, message_id),
        format!("IG_THREAD_{}_MESSAGE_{}_VIEWEDBY", thread_id, message_id),
    ];

    for table in tables {
        sqlx::query(&format!(
            r#"
                CREATE TABLE {} (
                    id BIGINT UNSIGNED PRIMARY KEY
                );
                "#,
            table
        ))
        .execute(&manager.pool)
        .await?;
    }

    let other_user: PrivateIDModel = sqlx::query_as(&format!(
        "SELECT * FROM {} WHERE id != ?",
        thread_members_table
    ))
    .bind(&my_base.id)
    .fetch_one(&manager.pool)
    .await?;

    let event = LiveMessageEvent {
        event: "new_message",
        thread_id: thread_id,
        data: DirectMessage {
            id: message_id,
            text: message.text.to_owned(),
            owner_id: my_base.id,
            created_at: now.to_owned(),
            is_mine: false,
            likers: vec![],
            is_seen: Some(false),
            is_heart: false,
        },
    };

    let msg = event.to_string();

    tokio::spawn(async move { manager.ws_send_message_to_id(other_user.id, &msg).await });

    return httpkit::send_json(
        200,
        json!({
            "message": DirectMessage {
                id: message_id,
                text: message.text.to_owned(),
                owner_id: my_base.id,
                created_at: now.to_owned(),
                is_mine: true,
                likers: vec![],
                is_seen: Some(false),
                is_heart: false
            }
        }),
    );
}

#[post("/thread/{thread_id}/message/{message_id}/like")]
async fn like_message(
    session: Session,
    manager: web::Data<crate::Manager>,
    thread_id: web::Path<u64>,
    message_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let inbox_table_name = format!("USER_{}_INBOX", my_base.id);

    let inbox_thread_ids: Vec<PrivateIDModel> =
        sqlx::query_as(&format!("SELECT * FROM {}", inbox_table_name))
            .fetch_all(&manager.pool)
            .await?;

    let thread_id = thread_id.into_inner();

    let in_inbox = inbox_thread_ids
        .iter()
        .find(|x| x.id == thread_id)
        .is_some();

    if !in_inbox {
        return httpkit::http_json_error("What?");
    }

    let thread_messages_table = format!("IG_THREAD_{}_MESSAGES", thread_id);
    let message_id = message_id.into_inner();

    let private_message: Option<PrivateMessage> = sqlx::query_as(&format!(
        "SELECT * FROM {} WHERE id = ?",
        thread_messages_table
    ))
    .bind(&message_id)
    .fetch_optional(&manager.pool)
    .await?;

    let message = match private_message {
        Some(private_message) => private_message,
        None => return httpkit::http_json_error("What?"),
    };

    let thread_message_likes_table =
        format!("IG_THREAD_{}_MESSAGE_{}_LIKES", thread_id, message.id);

    sqlx::query(&format!(
        "INSERT INTO {} VALUES (?)",
        thread_message_likes_table
    ))
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

#[post("/thread/{thread_id}/message/{message_id}/unlike")]
async fn unlike_message(
    session: Session,
    manager: web::Data<crate::Manager>,
    thread_id: web::Path<u64>,
    message_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let inbox_table_name = format!("USER_{}_INBOX", my_base.id);

    let inbox_thread_ids: Vec<PrivateIDModel> =
        sqlx::query_as(&format!("SELECT * FROM {}", inbox_table_name))
            .fetch_all(&manager.pool)
            .await?;

    let thread_id = thread_id.into_inner();

    let in_inbox = inbox_thread_ids
        .iter()
        .find(|x| x.id == thread_id)
        .is_some();

    if !in_inbox {
        return httpkit::http_json_error("What?");
    }

    let thread_messages_table = format!("IG_THREAD_{}_MESSAGES", thread_id);
    let message_id = message_id.into_inner();

    let private_message: Option<PrivateMessage> = sqlx::query_as(&format!(
        "SELECT * FROM {} WHERE id = ?",
        thread_messages_table
    ))
    .bind(&message_id)
    .fetch_optional(&manager.pool)
    .await?;

    let message = match private_message {
        Some(private_message) => private_message,
        None => return httpkit::http_json_error("What?"),
    };

    let thread_message_likes_table =
        format!("IG_THREAD_{}_MESSAGE_{}_LIKES", thread_id, message.id);

    sqlx::query(&format!(
        "DELETE FROM {} WHERE id = ?",
        thread_message_likes_table
    ))
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

#[post("/thread/{thread_id}/message/{message_id}/delete")]
async fn delete_message(
    session: Session,
    manager: web::Data<crate::Manager>,
    thread_id: web::Path<u64>,
    message_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let inbox_table_name = format!("USER_{}_INBOX", my_base.id);

    let inbox_thread_ids: Vec<PrivateIDModel> =
        sqlx::query_as(&format!("SELECT * FROM {}", inbox_table_name))
            .fetch_all(&manager.pool)
            .await?;

    let thread_id = thread_id.into_inner();

    let in_inbox = inbox_thread_ids
        .iter()
        .find(|x| x.id == thread_id)
        .is_some();

    if !in_inbox {
        return httpkit::http_json_error("What?");
    }

    let thread_messages_table = format!("IG_THREAD_{}_MESSAGES", thread_id);
    let message_id = message_id.into_inner();

    let private_message: Option<PrivateMessage> = sqlx::query_as(&format!(
        "SELECT * FROM {} WHERE id = ? AND sender = ?",
        thread_messages_table
    ))
    .bind(&message_id)
    .bind(&my_base.id)
    .fetch_optional(&manager.pool)
    .await?;

    let message = match private_message {
        Some(private_message) => private_message,
        None => return httpkit::http_json_error("What?"),
    };

    sqlx::query(&format!(
        "DELETE FROM {} WHERE id = ? AND sender = ?",
        thread_messages_table
    ))
    .bind(&message_id)
    .bind(&my_base.id)
    .execute(&manager.pool)
    .await?;

    let table_names = sqlx::query("SHOW TABLES LIKE ?")
        .bind(&format!("IG_THREAD_{}_MESSAGE_{}%", thread_id, message.id))
        .fetch_all(&manager.pool)
        .await
        .unwrap_or(vec![])
        .iter()
        .map(|x| x.get::<String, usize>(0))
        .collect::<Vec<_>>();

    for name in table_names {
        sqlx::query(&format!("DROP TABLE {}", name))
            .execute(&manager.pool)
            .await?;
    }

    return httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    );
}

#[post("/thread/{thread_id}/heart")]
async fn send_heart(
    session: Session,
    manager: web::Data<crate::Manager>,
    thread_id: web::Path<u64>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let my_base = match kit::is_logged_in(&session) {
        Some(base_user) => base_user,
        None => {
            session.purge();
            return httpkit::redirect("/");
        }
    };

    let inbox_table_name = format!("USER_{}_INBOX", my_base.id);

    let inbox_thread_ids: Vec<PrivateIDModel> =
        sqlx::query_as(&format!("SELECT * FROM {}", inbox_table_name))
            .fetch_all(&manager.pool)
            .await?;

    let thread_id = thread_id.into_inner();

    let in_inbox = inbox_thread_ids
        .iter()
        .find(|x| x.id == thread_id)
        .is_some();

    if !in_inbox {
        return httpkit::http_json_error("What?");
    }

    let thread_messages_table = format!("IG_THREAD_{}_MESSAGES", thread_id);

    let now = Utc::now();

    let result = sqlx::query(&format!(
        "INSERT INTO {} (text, owner_id, created_at, is_heart) VALUES (?, ?, ?, ?)",
        thread_messages_table
    ))
    .bind("")
    .bind(my_base.id)
    .bind(&now)
    .bind(true)
    .execute(&manager.pool)
    .await?;

    let thread_members_table = format!("IG_THREAD_{thread_id}_MEMBERS");

    let other_user: PrivateIDModel = sqlx::query_as(&format!(
        "SELECT * FROM {} WHERE id != ?",
        thread_members_table
    ))
    .bind(&my_base.id)
    .fetch_one(&manager.pool)
    .await?;

    let message_id = result.last_insert_id();

    let event = LiveMessageEvent {
        event: "new_message",
        thread_id: thread_id,
        data: DirectMessage {
            id: message_id,
            text: "".to_owned(),
            owner_id: my_base.id,
            created_at: now.to_owned(),
            is_mine: false,
            likers: vec![],
            is_seen: Some(false),
            is_heart: true,
        },
    };

    let msg = serde_json::to_string(&event)?;
    tokio::spawn(async move { manager.ws_send_message_to_id(other_user.id, &msg).await });

    return httpkit::send_json(
        200,
        json!({
            "error": null
        }),
    );
}
