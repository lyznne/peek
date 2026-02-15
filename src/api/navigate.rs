


use crate::config::Settings;
use crate::errors::PeekError;
use crate::security;
use actix_web::{web, HttpResponse};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct NavigateRequest {
    pub path: String,
}

pub async fn navigate(
    body: web::Json<NavigateRequest>,
    settings: web::Data<Arc<Settings>>,
    broadcaster: web::Data<crate::websocket::broadcaster::Broadcaster>,
) -> Result<HttpResponse, PeekError> {
    // Validate the path before broadcasting it
    let resolved = security::validate_path(&body.path, &settings)?;
    let resolved_str = resolved.display().to_string();

    // Tell every connected browser tab to navigate there
    broadcaster
        .send(serde_json::json!({
            "type": "navigate",
            "path": resolved_str
        }).to_string())
        .await;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "ok": true,
        "path": resolved_str
    })))
}
