/**
 *  * Utility function for Peek tool.
 * * This module provides helper functions used across the application.
 */
use crate::errors::PeekError;
use anyhow::Result;
use std::path::{Path, PathBuf};

/// canonicalize a path, providing better error messages
pub fn canonicalize_path(path: &Path) -> Result<PathBuf> {
    path.canonicalize()
        .map_err(|e| PeekError::InvalidPath(format!("{}: {}", path.display(), e)).into())
}

/// check if a path is safe to open (basic sec check).
#[allow(dead_code)]
pub fn is_safe_path(path: &Path) -> bool {
    //  prevent opening system-critical directories
    let path_str = path.to_string_lossy();

    #[cfg(unix)]
    {
        let unsafe_paths = [
            "/etc", "/bin", "/usr/bin", "/sbin", "/var", "/root", "/lib", "/lib64", "/boot",
            "/dev", "/proc", "/sys",
        ];

        if unsafe_paths.iter().any(|&p| path_str.starts_with(p)) {
            return false;
        }
    }

    #[cfg(windows)]
    {
        let unsafe_paths = [
            "C:\\Windows",
            "C:\\Program Files",
            "C:\\Program Files (x86)",
            "C:\\System32",
        ];

        if unsafe_paths.iter().any(|&p| path_str.starts_with(p)) {
            return false;
        }
    }

    true
}

/// Format file size for display
#[allow(dead_code)]
pub fn format_size(bytes: u64) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB", "TB"];
    let mut size = bytes as f64;
    let mut unit_index = 0;

    while size >= 1024.0 && unit_index < UNITS.len() - 1 {
        size /= 1024.0;
        unit_index += 1;
    }

    format!("{:.2} {}", size, UNITS[unit_index])
}



#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_safe_path() {
        assert!(is_safe_path(Path::new("/home/user/document.pdf")));
        assert!(is_safe_path(Path::new("./local/file.txt")));


        #[cfg(unix)]
        {
            assert!(!is_safe_path(Path::new("/etc/passwd")));
            assert!(is_safe_path(Path::new("/home/user/documents")));
            assert!(!is_safe_path(Path::new("/sys/kernel")));
        }

        #[cfg(windows)]
        {
            assert!(!is_safe_path(Path::new("C:\\Windows\\System32")));
            assert!(is_safe_path(Path::new("C:\\Users\\User\\Documents")));
        }
    }

    #[test]
    fn test_format_size() {
        assert_eq!(format_size(500), "500.00 B");
        assert_eq!(format_size(2048), "2.00 KB");
        assert_eq!(format_size(5_242_880), "5.00 MB");
        assert_eq!(format_size(10_737_418_240), "10.00 GB");
    }
}
