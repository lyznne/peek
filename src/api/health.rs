/**
 *  * API module for health checks
 *  * This module provides endpoints to check the health status of the application.
 */
use actix_web::HttpResponse;
use serde_json::json;


pub async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(json!({
        "status": "healthy",
        "version": "1.0.0",
        "service": "peek"
    }))
}
