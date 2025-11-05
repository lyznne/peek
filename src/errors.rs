/**
 *  * Error handling module for the Peek tool.
 * * This module defines custom error types and handling mechanisms.
 */
use thiserror::Error;

#[derive(Error, Debug)]
pub enum PeekError {
    #[error("File or Directory not found: {0}")]
    FileNotFound(String),

    #[error("Failled to open in browser: {0}")]
    BrowserError(String),

    #[error("IO error: {0}")]
    IoError(String),

    #[error("Invalid Path: {0}")]
    InvalidPath(String),
    // #[error("No Supported files found matching: {0}")]
    // NoMatchFound(String),

    // #[error("Permission Denied: {0}")]
    // PermissionDenied(String),

    // #[error("Unknown error occurred")]
    // Unknown,
}
