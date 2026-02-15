pub mod file_service;
pub mod preview_service;
pub mod spa;

use crate::errors::PeekError;
use crate::models::FileItem;
use crate::security;
use std::path::Path;
use std::time::SystemTime;

pub fn create_file_item(path: &Path) -> Result<FileItem, PeekError> {
    let metadata = path.metadata()?;

    let name = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    let modified = metadata
        .modified()?
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let mime_type = if metadata.is_file() {
        mime_guess::from_path(path).first().map(|m| m.to_string())
    } else {
        None
    };

    let extension = path
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_string());

    let children_count = if metadata.is_dir() {
        std::fs::read_dir(path).ok().map(|entries| entries.count())
    } else {
        None
    };

    let is_hidden = security::is_hidden(path);

    Ok(FileItem {
        name,
        path: path.display().to_string(),
        is_dir: metadata.is_dir(),
        size: metadata.len(),
        modified,
        mime_type,
        children_count,
        extension,
        is_hidden,
    })
}
