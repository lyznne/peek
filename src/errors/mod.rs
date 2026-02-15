use actix_web::{error::ResponseError, http::StatusCode, HttpResponse};
use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub details: Option<String>,
}

#[allow(dead_code)]
#[derive(Debug)]
pub enum PeekError {
    NotFound(String),
    Forbidden(String),
    BadRequest(String),
    Internal(String),
    IoError(std::io::Error),
    FileNotFound(String),
    BrowserError(String),
    InvalidPath(String),
}

impl fmt::Display for PeekError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            PeekError::NotFound(msg) => write!(f, "Not found: {}", msg),
            PeekError::Forbidden(msg) => write!(f, "Forbidden: {}", msg),
            PeekError::BadRequest(msg) => write!(f, "Bad request: {}", msg),
            PeekError::Internal(msg) => write!(f, "Internal error: {}", msg),
            PeekError::IoError(err) => write!(f, "IO error: {}", err),
            PeekError::FileNotFound(msg) => write!(f, "File not found: {}", msg),
            PeekError::BrowserError(msg) => write!(f, "Browser error: {}", msg),
            PeekError::InvalidPath(msg) => write!(f, "Invalid path: {}", msg),
        }
    }
}

//  std::error::Error trait
impl std::error::Error for PeekError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            PeekError::IoError(err) => Some(err),
            _ => None,
        }
    }
}

impl From<std::io::Error> for PeekError {
    fn from(err: std::io::Error) -> Self {
        PeekError::IoError(err)
    }
}

impl ResponseError for PeekError {
    fn error_response(&self) -> HttpResponse {
        let (status, error_message) = match self {
            PeekError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            PeekError::Forbidden(msg) => (StatusCode::FORBIDDEN, msg.clone()),
            PeekError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            PeekError::BrowserError(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            PeekError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.clone()),
            PeekError::IoError(err) => (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()),
            PeekError::FileNotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            PeekError::InvalidPath(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
        };

        HttpResponse::build(status).json(ErrorResponse {
            error: error_message,
            details: None,
        })
    }
}
