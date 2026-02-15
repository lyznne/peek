/**
 * * Services module for file operations
 * * This module provides various file-related services such as searching and browsing.
 */
use crate::errors::PeekError;
use crate::models::FileItem;
use crate::security;
use crate::services::create_file_item;
use std::path::Path;
use walkdir::WalkDir;

pub fn list_directory(
    path: &Path,
    recursive: bool,
    show_hidden: bool ,
) -> Result<Vec<FileItem>, PeekError> {
    if !path.is_dir() {
        return Err(PeekError::BadRequest("Path is not a directory".to_string()));
    }

    let mut items = Vec::new();

    if recursive {
        for entry in WalkDir::new(path)
            .max_depth(3)
            .into_iter()
            .filter_entry(|e| {
                // Only filter hidden files if show_hidden is false
                if show_hidden {
                    true
                } else {
                    !security::is_hidden(e.path())
                }
            })
            .filter_map(|e| e.ok())
        {
            if let Ok(item) = create_file_item(entry.path()) {
                items.push(item);
            }
        }
    } else {
        let entries = std::fs::read_dir(path)?;

        for entry in entries.filter_map(|e| e.ok()) {
            let entry_path = entry.path();

            // Skip hidden files unless show_hidden is true
            if !show_hidden && security::is_hidden(&entry_path) {
                continue;
            }

            if let Ok(item) = create_file_item(&entry_path) {
                items.push(item);
            }
        }
    }

    // Sort: directories first, then alphabetically
    items.sort_by(|a, b| match (a.is_dir, b.is_dir) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });

    Ok(items)
}

pub fn search_files(
    path: &Path,
    query: &str,
    max_results: usize,
) -> Result<Vec<FileItem>, PeekError> {
    let query_lower = query.to_lowercase();
    let mut matches = Vec::new();
    let max = if max_results == 0 { 100 } else { max_results };

    for entry in WalkDir::new(path)
        .max_depth(5)
        .into_iter()
        .filter_entry(|e| !security::is_hidden(e.path()))
        .filter_map(|e| e.ok())
    {
        if matches.len() >= max {
            break;
        }

        let file_name = entry
            .file_name()
            .to_string_lossy()
            .to_lowercase();

        if file_name.contains(&query_lower) {
            if let Ok(item) = create_file_item(entry.path()) {
                matches.push(item);
            }
        }
    }

    Ok(matches)
}
