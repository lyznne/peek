#![allow(dead_code)]

/**
 *  * Peek
 *  *
 */
use anyhow::{Context, Result};
use std::path::{Path, PathBuf};


 pub fn get_file_extension(path: &Path) -> Option<String> {
     path.extension()
         .and_then(|ext| ext.to_str())
         .map(|s| s.to_lowercase())
 }



 pub fn format_size(bytes: u64) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB", "TB"];

    if bytes == 0 {
        return "0 B".to_string();
    }

    let base = 1024_f64;
    let exp = (bytes as f64).log(base).floor() as usize;
    let exp = exp.min(UNITS.len() - 1);

    let size = bytes as f64 / base.powi(exp as i32);
    format!("{:.1} {}", size, UNITS[exp])
 }

 /// canonicalize a path, providing better error messages
 pub fn canonicalize_path(path: &Path) -> Result<PathBuf> {
    std::fs::canonicalize(path)
        .with_context(|| format!("Failed to canonicalize path: {}", path.display()))
}


 #[cfg(test)]
 mod tests {
    use super::*;

    #[test]
    fn test_format_size() {
        assert_eq!(format_size(0), "0 B");
        assert_eq!(format_size(1024), "1.0 KB");
        assert_eq!(format_size(1048576), "1.0 MB");
        assert_eq!(format_size(1073741824), "1.0 GB");
        assert_eq!(format_size(1099511627776), "1.0 TB");
    }
 }
