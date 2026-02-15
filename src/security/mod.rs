use crate::config::Settings;
use crate::errors::PeekError;
use std::path::{Path, PathBuf};

pub fn validate_path(path_str: &str, settings: &Settings) -> Result<PathBuf, PeekError> {
    let path = PathBuf::from(path_str);

    // Check if path exists
    if !path.exists() {
        return Err(PeekError::NotFound(format!(
            "Path does not exist: {}",
            path_str
        )));
    }

    // Canonicalize to resolve .. and symlinks (prevents path traversal)
    let canonical = path.canonicalize().map_err(|e| {
        PeekError::BadRequest(format!("Invalid path: {}", e))
    })?;

    // If allowed paths are configured, check access
    if !settings.security.allowed_paths.is_empty() {
        let is_allowed = settings.security.allowed_paths.iter().any(|allowed| {
            canonical.starts_with(allowed) || allowed.starts_with(&canonical)
        });

        if !is_allowed {
            return Err(PeekError::Forbidden(
                "Access denied: path not in allowed directories".to_string(),
            ));
        }
    }

    Ok(canonical)
}

pub fn is_hidden(path: &Path) -> bool {
    path.file_name()
        .and_then(|name| name.to_str())
        .map(|name| name.starts_with('.'))
        .unwrap_or(false)
}
