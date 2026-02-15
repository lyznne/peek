/**
 * * Search API module
 * * This module provides search functionality for files and directories.
 */
 use crate::config::Settings;
 use crate::errors::PeekError;
 use crate::models::{SearchQuery, SearchResponse};
 use crate::security;
 use crate::services::file_service;
 use actix_web::{web, HttpResponse};
 use std::sync::Arc;
 use std::time::Instant;


 pub async fn search_files(
    query: web::Query<SearchQuery>,
    settings: web::Data<Arc<Settings>>,
) -> Result<HttpResponse, PeekError> {
    if !settings.features.enable_search {
        return Err(PeekError::Forbidden("Search feature disabled".to_string()));
    }

    let start = Instant::now();
    let path = security::validate_path(&query.path, &settings)?;

    let matches = file_service::search_files(&path, &query.query, query.max_results)?;

    let search_time_ms = start.elapsed().as_millis() as u64;

    let response = SearchResponse {
        total_matches: matches.len(),
        matches,
        search_time_ms,
    };

    Ok(HttpResponse::Ok().json(response))
}
