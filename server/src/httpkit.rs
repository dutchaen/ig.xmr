use actix_web::{http::StatusCode, HttpResponse, HttpResponseBuilder};
use serde_json::json;

pub fn http_json_error(msg: &'static str) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    return Ok(HttpResponse::BadRequest().json(json!({
        "error": msg
    })));
}

pub fn send_json(
    status_code: u16,
    json: serde_json::Value,
) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let actix_status = StatusCode::from_u16(status_code)?;
    let mut builder = HttpResponseBuilder::new(actix_status);
    return Ok(builder.json(json));
}

pub fn redirect(path: &'static str) -> Result<HttpResponse, Box<dyn std::error::Error>> {
    let response = HttpResponse::Found()
        .insert_header(("Location", path))
        .finish();

    return Ok(response);
}
