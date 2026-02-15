use crate::errors::PeekError;
use crate::models::PreviewResponse;
use std::path::Path;

const MAX_TEXT_PREVIEW: usize = 100_000; // 100KB for text files
const MAX_LINES: usize = 1000;

pub struct PreviewService;

impl PreviewService {
    pub async fn generate_preview(
        path: &Path,
        max_size: u64,
    ) -> Result<PreviewResponse, PeekError> {
        let metadata = path.metadata()?;
        let size = metadata.len();

        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        let modified = metadata
            .modified()?
            .duration_since(std::time::SystemTime::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        let mime_type = mime_guess::from_path(path)
            .first()
            .map(|m| m.to_string())
            .unwrap_or_else(|| "application/octet-stream".to_string());

        let extension = path
            .extension()
            .and_then(|e| e.to_str())
            .map(|s| s.to_lowercase());

        // Determine file type
        let is_image = mime_type.starts_with("image/");
        let is_text = Self::is_text_file(&mime_type, extension.as_deref());
        let is_code = Self::is_code_file(extension.as_deref());

        // Generate preview based on type
        let (content, truncated, language, lines, encoding) = if is_text || is_code {
            Self::preview_text(path, size, max_size, extension.as_deref()).await?
        } else if is_image {
            // For images, we don't load content but provide metadata
            (None, false, None, None, None)
        } else {
            (None, false, None, None, None)
        };

        // Generate thumbnail for images (base64 data URL)
        let thumbnail = if is_image && size < 5_000_000 {
            // Only generate thumbnails for images < 5MB
            Self::generate_thumbnail(path).await.ok()
        } else {
            None
        };

        Ok(PreviewResponse {
            r#type: mime_type.split('/').next().unwrap_or("file").to_string(),
            name,
            path: path.display().to_string(),
            size,
            mime_type,
            modified,
            content,
            thumbnail,
            is_text,
            is_image,
            is_code,
            truncated,
            language,
            lines,
            encoding,
        })
    }

    fn is_text_file(mime_type: &str, extension: Option<&str>) -> bool {
        // Check MIME type
        if mime_type.starts_with("text/") {
            return true;
        }

        // Check common text file extensions
        if let Some(ext) = extension {
            matches!(
                ext,
                "txt" | "md" | "markdown" | "rst" | "log" | "cfg" | "conf" | "ini"
                | "yml" | "yaml" | "toml" | "json" | "xml" | "csv" | "tsv"
                | "sh" | "bash" | "zsh" | "fish" | "bat" | "ps1"
                | "env" | "gitignore" | "dockerignore" | "editorconfig"
            )
        } else {
            false
        }
    }

    fn is_code_file(extension: Option<&str>) -> bool {
        if let Some(ext) = extension {
            matches!(
                ext,
                // Programming languages
                "rs" | "py" | "js" | "ts" | "jsx" | "tsx" | "java" | "c" | "cpp"
                | "cc" | "cxx" | "h" | "hpp" | "cs" | "go" | "rb" | "php" | "swift"
                | "kt" | "scala" | "r" | "m" | "mm" | "dart" | "lua" | "perl" | "pl"
                // Web
                | "html" | "htm" | "css" | "scss" | "sass" | "less" | "vue" | "svelte"
                // Shell & Scripts
                | "sh" | "bash" | "zsh" | "fish" | "bat" | "ps1" | "psm1"
                // Config & Data
                | "json" | "yaml" | "yml" | "toml" | "xml" | "sql" | "graphql" | "proto"
                // Documentation
                | "md" | "rst" | "tex" | "adoc"
                // Other
                | "vim" | "el" | "lisp" | "clj" | "ex" | "exs" | "erl" | "hrl"
                | "hs" | "ml" | "fs" | "fsx" | "nim" | "v" | "zig"
            )
        } else {
            false
        }
    }

    fn detect_language(extension: Option<&str>) -> Option<String> {
        extension.and_then(|ext| {
            Some(match ext {
                "rs" => "rust",
                "py" => "python",
                "js" | "jsx" => "javascript",
                "ts" | "tsx" => "typescript",
                "java" => "java",
                "c" | "h" => "c",
                "cpp" | "cc" | "cxx" | "hpp" => "cpp",
                "cs" => "csharp",
                "go" => "go",
                "rb" => "ruby",
                "php" => "php",
                "swift" => "swift",
                "kt" => "kotlin",
                "scala" => "scala",
                "html" | "htm" => "html",
                "css" => "css",
                "scss" | "sass" => "scss",
                "json" => "json",
                "yaml" | "yml" => "yaml",
                "toml" => "toml",
                "xml" => "xml",
                "sql" => "sql",
                "sh" | "bash" | "zsh" => "bash",
                "md" | "markdown" => "markdown",
                _ => return None,
            }.to_string())
        })
    }

    async fn preview_text(
        path: &Path,
        size: u64,
        max_size: u64,
        extension: Option<&str>,
    ) -> Result<(Option<String>, bool, Option<String>, Option<usize>, Option<String>), PeekError> {
        // Don't preview files larger than max_size
        if size > max_size {
            return Ok((
                Some(format!("[File too large for preview: {}]", Self::format_size(size))),
                true,
                None,
                None,
                None,
            ));
        }

        // Try to read the file
        let content = match tokio::fs::read(path).await {
            Ok(bytes) => bytes,
            Err(_) => {
                return Ok((
                    Some("[Unable to read file]".to_string()),
                    false,
                    None,
                    None,
                    None,
                ));
            }
        };

        // Check if it's valid UTF-8
        let text = match String::from_utf8(content.clone()) {
            Ok(text) => text,
            Err(_) => {
                // Try to detect encoding and convert
                return Ok((
                    Some("[Binary file - not valid UTF-8]".to_string()),
                    false,
                    None,
                    None,
                    Some("binary".to_string()),
                ));
            }
        };

        // Count lines
        let total_lines = text.lines().count();

        // Truncate if needed
        let (display_text, truncated) = if text.len() > MAX_TEXT_PREVIEW {
            let truncated_text = text.chars().take(MAX_TEXT_PREVIEW).collect::<String>();
            (truncated_text, true)
        } else if total_lines > MAX_LINES {
            let truncated_text = text.lines().take(MAX_LINES).collect::<Vec<_>>().join("\n");
            (truncated_text, true)
        } else {
            (text, false)
        };

        let language = Self::detect_language(extension);

        Ok((
            Some(display_text),
            truncated,
            language,
            Some(total_lines),
            Some("utf-8".to_string()),
        ))
    }

    async fn generate_thumbnail(path: &Path) -> Result<String, PeekError> {
        // Read image file
        let bytes = tokio::fs::read(path).await?;

        // Convert to base64 data URL
        let mime_type = mime_guess::from_path(path)
            .first()
            .map(|m| m.to_string())
            .unwrap_or_else(|| "image/jpeg".to_string());

        let base64 = base64_encode(&bytes);
        Ok(format!("data:{};base64,{}", mime_type, base64))
    }

    fn format_size(bytes: u64) -> String {
        const UNITS: &[&str] = &["B", "KB", "MB", "GB"];
        let mut size = bytes as f64;
        let mut unit_idx = 0;

        while size >= 1024.0 && unit_idx < UNITS.len() - 1 {
            size /= 1024.0;
            unit_idx += 1;
        }

        format!("{:.1} {}", size, UNITS[unit_idx])
    }
}

// Simple base64 encoding
fn base64_encode(data: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = Vec::new();

    for chunk in data.chunks(3) {
        let b1 = chunk[0];
        let b2 = chunk.get(1).copied().unwrap_or(0);
        let b3 = chunk.get(2).copied().unwrap_or(0);

        result.push(CHARS[(b1 >> 2) as usize]);
        result.push(CHARS[(((b1 & 0x03) << 4) | (b2 >> 4)) as usize]);

        if chunk.len() > 1 {
            result.push(CHARS[(((b2 & 0x0f) << 2) | (b3 >> 6)) as usize]);
        } else {
            result.push(b'=');
        }

        if chunk.len() > 2 {
            result.push(CHARS[(b3 & 0x3f) as usize]);
        } else {
            result.push(b'=');
        }
    }

    String::from_utf8(result).unwrap()
}
