/**
 *  * Preview module
 *  * This module provides file preview functionality.
 */
use crate::config::Settings;
use crate::errors::PeekError;
use crate::models::BrowseQuery;
use crate::security;
use actix_web::{web, HttpResponse};
use std::sync::Arc;
use crate::services::preview_service::PreviewService;

pub async fn preview_file(
    query: web::Query<BrowseQuery>,
    settings: web::Data<Arc<Settings>>,
) -> Result<HttpResponse, PeekError> {
    let path = security::validate_path(&query.path, &settings)?;

    if !path.is_file() {
        return Err(PeekError::BadRequest("Not a file".to_string()));
    }

    let preview = PreviewService::generate_preview(
        &path,
        settings.features.max_preview_size,
    ).await?;

    Ok(HttpResponse::Ok().json(preview))
}
