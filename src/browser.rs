/**
 *  * Opens file in default browser
 *  * This module provides functionality to open files in the system's default web browser.
 */
use crate::errors::PeekError;
use anyhow::Result;
use std::path::Path;
use std::process::Command;

/// Opens a file or directory in the default browser
pub fn open_in_browser(path: &Path) -> Result<()> {
    if !path.exists() {
        return Err(PeekError::FileNotFound(path.display().to_string()).into());
    }

    // Convert to absolute path for better browser compatibility
    let absolute_path = path.canonicalize()
        .map_err(|e| PeekError::IoError(format!("Failed to resolve path: {}", e)))?;

    // Convert to file:// URL to ensure browser opens
    let url = format!("file://{}", absolute_path.display());

    // Try to open with browser directly on Linux
    #[cfg(target_os = "linux")]
    {
        if open_with_browser(&url).is_err() {
            // Fallback to xdg-open if browser detection fails
            open::that(&absolute_path)
                .map_err(|e| PeekError::BrowserError(format!("Failed to open: {}", e)))?;
        }
    }

    // Use default opener on other platforms
    #[cfg(not(target_os = "linux"))]
    {
        open::that(&absolute_path)
            .map_err(|e| PeekError::BrowserError(format!("Failed to open: {}", e)))?;
    }

    // Provide user feedback
    if absolute_path.is_dir() {
        println!("📂 Opening directory: {}", absolute_path.display());
    } else {
        println!("📄 Opening file: {}", absolute_path.display());
    }

    Ok(())
}

/// Try to open URL directly in browser (Linux-specific)
#[cfg(target_os = "linux")]
fn open_with_browser(url: &str) -> Result<()> {
    // List of common browsers in priority order
    let browsers = [
        "firefox",
        "google-chrome",
        "chromium",
        "brave-browser",
        "microsoft-edge",
        "opera",
        "vivaldi",
        "librewolf",
    ];

    // Try each browser
    for browser in &browsers {
        if let Ok(status) = Command::new(browser)
            .arg(url)
            .stdin(std::process::Stdio::null())
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null())
            .spawn()
        {
            // Browser found and launched
            drop(status); // Detach the process
            return Ok(());
        }
    }

    // No browser found
    Err(PeekError::BrowserError("No browser found".to_string()).into())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::File;
    use tempfile::tempdir;

    #[test]
    fn test_open_nonexistent_file() {
        let result = open_in_browser(Path::new("/nonexistent/file.pdf"));
        assert!(result.is_err());
    }

    #[test]
    fn test_path_validation() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test.txt");
        File::create(&file_path).unwrap();

        assert!(file_path.exists());
        assert!(!Path::new("/fake/path").exists());
    }

    #[test]
    fn test_url_generation() {
        let dir = tempdir().unwrap();
        let path = dir.path();
        let url = format!("file://{}", path.display());
        assert!(url.starts_with("file://"));
    }
}
