use actix_web::{rt, web, Error, HttpRequest, HttpResponse};
use serde::{Deserialize, Serialize};

use crate::kit;

pub trait WsEvent: Sized {
    fn to_string(&self) -> String;
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LiveMessageEvent<'a, T>
where
    T: serde::Serialize,
{
    pub event: &'a str,
    pub thread_id: u64,
    pub data: T,
}

impl<T: serde::Serialize> WsEvent for LiveMessageEvent<'_, T> {
    fn to_string(&self) -> String {
        return serde_json::to_string(&self).unwrap();
    }
}

pub async fn poll_ws_route(
    req: HttpRequest,
    web_session: actix_session::Session,
    manager: web::Data<crate::Manager>,
    stream: web::Payload,
) -> Result<HttpResponse, Error> {
    let (res, session, msg_stream) = actix_ws::handle(&req, stream)?;

    let base = match kit::is_logged_in(&web_session) {
        Some(base) => base,
        None => {
            #[allow(unused_must_use)]
            {
                session.close(None).await;
            }

            return Ok(res);
        }
    };

    manager.ws_add_conn(session.clone(), base.id);
    rt::spawn(handler::poll_ws(session, msg_stream));

    Ok(res)
}

pub mod handler {
    use actix_ws::Message;
    use futures_util::StreamExt as _;

    pub async fn poll_ws(mut session: actix_ws::Session, mut msg_stream: actix_ws::MessageStream) {
        let close_reason = loop {
            match msg_stream.next().await {
                Some(Ok(msg)) => {
                    match msg {
                        Message::Text(text) => {
                            session.text(text).await.unwrap();
                        }

                        Message::Binary(bin) => {
                            session.binary(bin).await.unwrap();
                        }

                        Message::Close(reason) => {
                            break reason;
                        }

                        Message::Ping(bytes) => {
                            let _ = session.pong(&bytes).await;
                        }

                        Message::Pong(_) => {}

                        Message::Continuation(_) => {
                            dbg!("no support for continuation frames");
                        }

                        Message::Nop => {}
                    };
                }

                _ => break None,
            }
        };

        let _ = session.close(close_reason).await;
    }
}
