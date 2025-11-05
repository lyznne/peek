/**
 * File search module for the Peek tool.
 * This module provides functionality to search for files and directories based on user queries.
 */
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

/// Supported file extensions for browser viewing.
const SUPPORTED_EXTENSIONS: &[&str] = &[
    "pdf", "html", "htm", "xml", "json", "txt", "md",
    "jpg", "jpeg", "png", "gif", "svg", "webp", "bmp",
    "mp4", "webm", "ogg", "mp3", "wav",
];

/// Search for a file in the given directory.
/// Returns the first matching file path.
pub fn search_file(dir: &Path, pattern: &str) -> Option<PathBuf> {
    let pattern_lower = pattern.to_lowercase();

    // Quick check: if pattern is exactly a filename in current dir
    let direct_match = dir.join(pattern);
    if direct_match.exists() && is_supported_file(&direct_match) {
        return Some(direct_match);
    }

    // Search in current directory (non-recursive for performance)
    WalkDir::new(dir)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
        .find(|entry| {
            let path = entry.path();

            // Skip the directory itself
            if path == dir {
                return false;
            }

            // Check if filename matches pattern
            if let Some(filename) = path.file_name() {
                let filename_str = filename.to_string_lossy().to_lowercase();

                // Exact match or contains pattern
                if filename_str == pattern_lower || filename_str.contains(&pattern_lower) {
                    // Check if it's a supported file type
                    return is_supported_file(path);
                }
            }

            false
        })
        .map(|entry| entry.path().to_path_buf())
}

/// Check if a file has a supported extension or is a directory.
fn is_supported_file(path: &Path) -> bool {
    if path.is_dir() {
        return true;
    }

    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| SUPPORTED_EXTENSIONS.contains(&ext.to_lowercase().as_str()))
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::{self, File};
    use tempfile::tempdir;

    #[test]
    fn test_search_file_exact_match() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test.pdf");
        File::create(&file_path).unwrap();

        let result = search_file(dir.path(), "test.pdf");
        assert!(result.is_some());
    }

    #[test]
    fn test_search_file_partial_match() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("report_2025.pdf");
        File::create(&file_path).unwrap();

        let result = search_file(dir.path(), "report");
        assert!(result.is_some());
    }

    #[test]
    fn test_search_file_unsupported_extension() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test.exe");
        File::create(&file_path).unwrap();

        let result = search_file(dir.path(), "test.exe");
        assert!(result.is_none());
    }

    #[test]
    fn test_is_supported_file() {
        assert!(is_supported_file(Path::new("test.pdf")));
        assert!(is_supported_file(Path::new("image.png")));
        assert!(!is_supported_file(Path::new("script.exe")));
    }

    #[test]
    fn test_search_directory() {
        let dir = tempdir().unwrap();
        let subdir = dir.path().join("mydir");
        fs::create_dir(&subdir).unwrap();

        let result = search_file(dir.path(), "mydir");
        assert!(result.is_some());
    }

    #[test]
    fn test_case_insensitive_search() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("Document.PDF");
        File::create(&file_path).unwrap();

        let result = search_file(dir.path(), "document");
        assert!(result.is_some());
    }

    #[test]
    fn test_partial_match_priority() {
        let dir = tempdir().unwrap();
        File::create(dir.path().join("report_final.pdf")).unwrap();
        File::create(dir.path().join("report_draft.pdf")).unwrap();

        let result = search_file(dir.path(), "report");
        assert!(result.is_some());
        // Should match one of them (first found)
    }
}
