use actix_files::NamedFile;
use actix_session::Session;
use actix_web::{get, web, HttpRequest, HttpResponse};
use askama::Template;
use chrono::Utc;

use crate::{httpkit, kit};

#[derive(Template)]
#[template(path = "index.html", escape = "none")]
struct IndexTemplate<'a> {
    render_code: &'a str,
    t: u64,
}

#[get("/")]
pub async fn index(session: Session) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    match kit::is_logged_in(&session) {
        Some(_) => Ok(HttpResponse::Ok().content_type("text/html").body(
            IndexTemplate {
                render_code: r#"
                            async function Action() {
                                let me = await xmr.Private.Accounts.get_current_user();
                                let timeline = await xmr.Private.Media.timeline();
                                //let timeline = [];
                                Page_RenderHomePage( me, timeline );
                            }
                            "#,
                t: Utc::now().timestamp() as u64,
            }
            .render()
            .expect(""),
        )),
        _ => httpkit::redirect("/accounts/login"),
    }
}

#[get("/accounts/login")]
pub async fn login_page(
    req: HttpRequest,
    session: Session,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    match kit::is_logged_in(&session) {
        None => Ok(NamedFile::open("templates/login.html")?.into_response(&req)),
        Some(_) => httpkit::redirect("/"),
    }
}

#[get("/accounts/signup")]
pub async fn signup_page(
    req: HttpRequest,
    session: Session,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    match kit::is_logged_in(&session) {
        None => Ok(NamedFile::open("templates/signup.html")?.into_response(&req)),
        Some(_) => httpkit::redirect("/"),
    }
}

#[get("/direct")]
pub async fn direct(session: Session) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    match kit::is_logged_in(&session) {
        Some(_) => {
            Ok(
                HttpResponse::Ok()
                    .content_type("text/html")
                    .body(
                        IndexTemplate {
                            render_code: r#"
                            async function Action() {

                                let ws = new WebSocket("ws://127.0.0.1:3000/direct/ws/join");
                                ws.onmessage = (event) => {
                                    let json = JSON.parse(event.data);

                                    switch (json['event']) {
                                        case 'new_message':

                                            let message_list_div = document.getElementsByClassName('instagram-direct-message-list-container')[0];
                                            let contact_list_div = document.getElementsByClassName('instagram-contact-list-container')[0];

                                            let target_thread_element = undefined;
                                            for (let i = 0; i < contact_list_div.children.length; i++) {
                                                let child = contact_list_div.children.item(i);

                                                if (child.id === `instagram-contact-${json['thread_id']}`) {
                                                    target_thread_element = child;
                                                    contact_list_div.removeChild(child);
                                                }
                                            };

                                            contact_list_div.insertBefore(target_thread_element, contact_list_div.children.item(0));
                                            let snippet_element = target_thread_element.getElementsByClassName('instagram-contact-msg-snippet-unopened')[0];
                                            snippet_element.innerText = json['data']['text'];


                                            if (message_list_div !== undefined) {
                                                let selected_contact_id = message_list_div.getAttribute('xmr-contact-id');

                                                if (selected_contact_id === `${json['thread_id']}`) {

                                                    console.log(json['data']['is_heart']);
                                                    if (json['data']['is_heart']) {
                                                        let instagram_direct_message0 = document.createElement("div");
                                                        instagram_direct_message0.className = 'instagram-direct-their-heart';
            
                                                        instagram_direct_message0.appendChild(IG_RenderDirectHeart());
                                                        message_list_div.appendChild(instagram_direct_message0);
                                                    }
                                                    else {
                                                        let instagram_direct_message0 = document.createElement("div");
                                                        instagram_direct_message0.className = 'instagram-direct-their-message';
            
                                                        let var_003 = document.createElement("a");
                                                        var_003.innerText = json['data']['text'];
            
                                                        instagram_direct_message0.appendChild(var_003);
                                                        message_list_div.appendChild(instagram_direct_message0);
                                                    }
                                                    
                                                    message_list_div.scroll(0, message_list_div.scrollHeight);
                                                }
                                            }
                                            

                                            //window.location.href = '/direct';
                                            break;
                                    }
                                }

                                inbox = await xmr.Private.Direct.inbox();
                                let threads = IGPreviewThread.from_json(inbox);
                                Page_RenderDirectV1Page( threads ); 
                            }
                            "#,
                            t: Utc::now().timestamp() as u64,
                        }
                        .render()
                        .expect("")
                    )
            )
        },
        _ => httpkit::redirect("/accounts/login")
    }
}

#[get("/{username}")]
pub async fn get_profile(
    username: web::Path<String>,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let code = r#"
    async function Action() {
        let json = await xmr.Guest.User.get_username_info('"#
        .to_owned()
        + &username.into_inner()
        + r#"')
            .catch((e) => {
                console.log(e);
            });

        if (json === undefined || json['error'] === null) {
            Page_ShowMessageBox('Uh oh.', 'It looks like this account could not be displayed. :(', [
                new MsgBoxUIEvent('Go Back', () => { window.location.href = '/'} )
            ]);
            return;
        }
        else {
            console.log(json);
            let posts = await xmr.Guest.User.get_medias_via_user_id(json['id']);
            Page_RenderProfile( new IGProfile(json), posts.reverse() ); 
        }
    }
    "#;

    Ok(HttpResponse::Ok().content_type("text/html").body(
        IndexTemplate {
            render_code: code.as_str(),
            t: Utc::now().timestamp() as u64,
        }
        .render()
        .expect(""),
    ))
}

#[get("/accounts/settings")]
pub async fn get_settings(session: Session) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    match kit::is_logged_in(&session) {
        Some(_) => {
            let code = r#"
            async function Action() {
                let json = await xmr.Private.Accounts.get_current_user();
                if (json['error'] === null) {
                    window.location.href = '/';
                }
                else {
                    Page_RenderSettingsPage( new IGCurrentUser( json ) );
                    Page_Settings_RenderEditProfileScreen( new IGCurrentUser( json ) ); 
                }
            }
            "#;

            Ok(HttpResponse::Ok().content_type("text/html").body(
                IndexTemplate {
                    render_code: code,
                    t: Utc::now().timestamp() as u64,
                }
                .render()
                .expect(""),
            ))
        }
        None => httpkit::redirect("/"),
    }
}

#[get("/default-profile-photo")]
pub async fn get_default_profile_photo() -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let (content_type, image_bytes) = kit::parse_base64_image(&kit::DEFAULT_PROFILE_PHOTO);

    Ok(HttpResponse::Ok()
        .content_type(content_type)
        .body(image_bytes))
}
