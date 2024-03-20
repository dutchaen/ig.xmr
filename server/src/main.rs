mod httpkit;
mod kit;
mod models;
mod rest;
mod ws;
mod www;

use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use actix_cors::Cors;
use actix_files::Files;
use actix_session::storage::CookieSessionStore;
use actix_session::SessionMiddleware;
use actix_web::cookie::Key;
use actix_web::middleware::Logger;
use actix_web::web;
use actix_web::App;
use actix_web::HttpServer;
use sqlx::mysql::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;

// use openssl::ssl::{
//     SslAcceptor, 
//     SslFiletype, 
//     SslMethod
// };

#[derive(Clone)]
struct Manager {
    pool: MySqlPool,
    ws_conns: Arc<Mutex<HashMap<u64, Vec<actix_ws::Session>>>>,
    create_account_lock: Arc<Mutex<()>>,
}

impl Manager {
    pub fn ws_add_conn(&self, ws: actix_ws::Session, user_id: u64) {
        let mut ws_conns = self.ws_conns.lock().unwrap();

        if let Some(conns) = ws_conns.get_mut(&user_id) {
            conns.push(ws);
        } else {
            ws_conns.insert(user_id, vec![ws]);
        }
    }

    #[allow(unused_must_use)]
    pub async fn ws_send_message_to_id(&self, user_id: u64, text: &str) {
        let mut websockets = {
            let ws_conns = self.ws_conns.lock().unwrap();
            ws_conns.clone()
        };

        if let Some(conns) = websockets.get_mut(&user_id) {
            for conn in conns {
                conn.text(text).await;
            }
        }
    }
}



#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Hello, world!");
    
    let secret_key: Vec<u8> = (0..512)
        .map(|_| { rand::random::<u8>() })
        .collect();


    let host = dotenv::var("HOST")?;
    let port = dotenv::var("PORT")?
        .parse::<u16>()?;
    let db_url = dotenv::var("DB_URL")?;

    let manager = Manager {
        pool: MySqlPoolOptions::new()
            .connect(&db_url)
            .await?,
        ws_conns: Arc::new(Mutex::new(HashMap::new())),
        create_account_lock: Arc::new(Mutex::new(())),
    };

    println!("Starting .XMR Server...");

    // let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    // builder
    //     .set_private_key_file("key.pem", SslFiletype::PEM)
    //     .unwrap();
    // builder.set_certificate_chain_file("cert.pem").unwrap();

    HttpServer::new(move || {
        let server = web::Data::new(manager.clone());

        App::new()
            .wrap(
                SessionMiddleware::builder(CookieSessionStore::default(), Key::from(&secret_key))
                    .cookie_name("sessionid".to_owned())
                    .cookie_secure(false)
                    .cookie_same_site(actix_web::cookie::SameSite::Lax)
                    .build(),
            )
            .wrap(Logger::default())
            .wrap(Cors::default().allow_any_origin())
            .service(Files::new("/static", "static").prefer_utf8(true))
            .service(www::direct)
            .service(www::get_profile)
            .service(www::get_settings)
            .service(www::index)
            .service(www::login_page)
            .service(www::signup_page)
            .service(rest::guest::user::get_username_avatar_by_username)
            .service(www::get_default_profile_photo)
            .service(web::resource("/direct/ws/join").route(web::get().to(ws::poll_ws_route)))
            .service(
                web::scope("/rest")
                    .service(
                        web::scope("/guest")
                            .service(rest::guest::login) 
                            .service(rest::guest::web_ajax_signup) 
                            .service(
                                web::scope("/user")
                                    .service(rest::guest::user::get_user_id_info) 
                                    .service(rest::guest::user::get_username_info) 
                                    .service(rest::guest::user::search_for_users) 
                                    .service(rest::guest::user::get_medias), 
                            )
                            .service(
                                web::scope("/media")
                                    .service(rest::guest::media::get_post_media) 
                                    .service(rest::guest::media::get_post_info_via_id) 
                                    .service(rest::guest::media::get_post_info_via_shortcode) 
                                    .service(rest::guest::media::get_post_comments), 
                            ),
                    )
                    .service(
                        web::scope("/private")
                            .service(
                                web::scope("/user")
                                    .service(rest::private::user::create_friendship) 
                                    .service(rest::private::user::destroy_friendship), 
                            )
                            .service(
                                web::scope("/media")
                                    .service(rest::private::media::create) 
                                    .service(rest::private::media::destroy) 
                                    .service(rest::private::media::like) 
                                    .service(rest::private::media::unlike) 
                                    .service(rest::private::media::create_comment) 
                                    .service(rest::private::media::destroy_comment) 
                                    .service(rest::private::media::like_comment) 
                                    .service(rest::private::media::unlike_comment) 
                                    .service(rest::private::media::get_timeline), 
                            )
                            .service(
                                web::scope("/direct")
                                    .service(rest::private::direct::inbox) 
                                    .service(rest::private::direct::create_thread)
                                    .service(rest::private::direct::get_messages) 
                                    .service(rest::private::direct::get_messages_before) 
                                    .service(rest::private::direct::send_text) 
                                    .service(rest::private::direct::like_message) 
                                    .service(rest::private::direct::unlike_message) 
                                    .service(rest::private::direct::delete_message) 
                                    .service(rest::private::direct::send_heart)
                                    .service(rest::private::direct::seen_message),
                            )
                            .service(
                                web::scope("/accounts")
                                    .service(rest::private::accounts::get_current_user) 
                                    .service(rest::private::accounts::edit_profile) 
                                    .service(rest::private::accounts::set_username) 
                                    .service(rest::private::accounts::change_password) 
                                    .service(rest::private::accounts::signout) 
                                    .service(rest::private::accounts::change_profile_photo), 
                            ),
                    ),
            )
            .app_data(server)
    })
    //.bind_openssl((HOST, PORT), builder)?
    .bind((host, port))?
    .run()
    .await?;

    Ok(())
}
