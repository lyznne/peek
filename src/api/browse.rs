/**
 * Browse API module
 * This module provides browsing functionality for files and directories.
 */
// File: src/api/browse.rs

use crate::config::Settings;
use crate::errors::PeekError;
use crate::models::{BrowseQuery, BrowseResponse, DocumentQuery, FileInfoResponse};
use crate::security;
use crate::services::{create_file_item, file_service};
use actix_web::{web, HttpResponse, Result as ActixResult};
use std::sync::Arc;

pub async fn browse_directory(
    query: web::Query<BrowseQuery>,
    settings: web::Data<Arc<Settings>>,
) -> Result<HttpResponse, PeekError> {
    tracing::debug!(
        "Browsing directory: {} (show_hidden: {})",
        query.path,
        query.show_hidden
    );

    let path = security::validate_path(&query.path, &settings)?;
    let items = file_service::list_directory(&path, query.recursive, query.show_hidden)?;

    let total_size: u64 = items.iter().filter(|i| !i.is_dir).map(|i| i.size).sum();
    let total_items = items.len(); // capture before items is moved into the struct

    let response = BrowseResponse {
        current_path: path.display().to_string(),
        items,
        total_size,
        total_items,
        can_navigate_up: path.parent().is_some(),
    };

    Ok(HttpResponse::Ok().json(response))
}

pub async fn file_info(
    query: web::Query<BrowseQuery>,
    settings: web::Data<Arc<Settings>>,
) -> Result<HttpResponse, PeekError> {
    let path = security::validate_path(&query.path, &settings)?;
    let item = create_file_item(&path)?;
    let parent_path = path.parent().map(|p| p.display().to_string());
    let metadata = path.metadata()?;

    #[cfg(unix)]
    let (readable, writable, executable) = {
        use std::os::unix::fs::PermissionsExt;
        let mode = metadata.permissions().mode();
        (mode & 0o400 != 0, mode & 0o200 != 0, mode & 0o100 != 0)
    };

    #[cfg(not(unix))]
    let (readable, writable, executable) = (true, !metadata.permissions().readonly(), false);

    let response = FileInfoResponse {
        item,
        parent_path,
        readable,
        writable,
        executable,
    };

    Ok(HttpResponse::Ok().json(response))
}

pub async fn view_document(
    query: web::Query<DocumentQuery>,
    settings: web::Data<Arc<Settings>>,
) -> ActixResult<HttpResponse> {
    // resolves and validates the path
    let target_path = security::validate_path(&query.path, &settings)
        .map_err(actix_web::error::ErrorForbidden)?;

    if !target_path.exists() {
        return Err(actix_web::error::ErrorNotFound(format!(
            "File not found: {}",
            query.path
        )));
    }

    if !target_path.is_file() {
        return Err(actix_web::error::ErrorBadRequest("Not a file"));
    }

    let content = tokio::fs::read(&target_path)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    let mime_type = mime_guess::from_path(&target_path)
        .first_or_octet_stream()
        .to_string();

    Ok(HttpResponse::Ok()
        .content_type(mime_type)
        .append_header(("Content-Disposition", "inline"))
        .append_header(("Cache-Control", "public, max-age=3600"))
        .body(content))
}

/// GET /api/initial-path
/// Returns the directory the CLI was invoked with so the frontend
/// can navigate there on first load.
pub async fn api_initial_path(
    state: web::Data<Arc<Settings>>,  
) -> HttpResponse {
    let path = state
        .initial_path
        .clone()
        .unwrap_or_else(|| "/".to_string());

    HttpResponse::Ok().json(serde_json::json!({ "path": path }))
}
