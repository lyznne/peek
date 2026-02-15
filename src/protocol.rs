use anyhow::{Context, Result};


#[derive(Debug, Clone, PartialEq)]
pub enum PeekAction {
    /// Browse a file or directory in the UI
    Open(String),
    /// Stop the running daemon
    Kill,
    /// Print daemon status
    Status,
}


/// Returns Some(action) if the argument looks like a peek:// URI,
/// None if it is an ordinary path.
pub fn parse_uri(arg: &str) -> Result<Option<PeekAction>> {
    let Some(rest) = arg.strip_prefix("peek://") else {
        return Ok(None);
    };

    // peek://kill  or  peek://status  (no path component)
    if rest.eq_ignore_ascii_case("kill")   { return Ok(Some(PeekAction::Kill));   }
    if rest.eq_ignore_ascii_case("status") { return Ok(Some(PeekAction::Status)); }

    // peek://open/<path>
    let path_part = rest
        .strip_prefix("open/")
        .or_else(|| rest.strip_prefix("open"))   // peek://open  alone
        .with_context(|| format!("Unknown peek:// action in URI: {}", arg))?;

    // Decode percent-encoded characters (%20, etc.)
    let decoded = percent_decode(path_part);

    // Normalise: ensure leading slash on Unix, leave Windows paths as-is
    let path = normalise_path(&decoded);

    Ok(Some(PeekAction::Open(path)))
}


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

fn percent_decode(s: &str) -> String {

    urlencoding::decode(s)
        .map(|c| c.into_owned())
        .unwrap_or_else(|_| s.to_string())
}

fn normalise_path(path: &str) -> String {
    // Windows: "C:/Users/..." — keep as-is
    if cfg!(target_os = "windows") {
        return path.to_string();
    }

    // Unix: ensure leading slash
    if path.is_empty() {
        "/".to_string()
    } else if path.starts_with('/') {
        path.to_string()
    } else {
        format!("/{}", path)
    }
}

#[allow(dead_code)]
pub fn to_uri(path: &str) -> String {
    let encoded = urlencoding::encode(path.trim_start_matches('/'));
    format!("peek://open/{}", encoded)
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_open_absolute() {
        let r = parse_uri("peek://open/home/user/Documents").unwrap();
        assert_eq!(r, Some(PeekAction::Open("/home/user/Documents".into())));
    }



    #[test]
    fn parse_open_root() {
        let r = parse_uri("peek://open/").unwrap();
        assert_eq!(r, Some(PeekAction::Open("/".into())));
    }

    #[test]
    fn parse_kill() {
        let r = parse_uri("peek://kill").unwrap();
        assert_eq!(r, Some(PeekAction::Kill));
    }

    #[test]
    fn parse_status() {
        let r = parse_uri("peek://status").unwrap();
        assert_eq!(r, Some(PeekAction::Status));
    }

    #[test]
    fn plain_path_returns_none() {
        let r = parse_uri("/home/user/file.txt").unwrap();
        assert_eq!(r, None);
    }

    #[test]
    fn percent_encoded_spaces() {
        let r = parse_uri("peek://open/home/user/my%20folder").unwrap();
        assert_eq!(r, Some(PeekAction::Open("/home/user/my folder".into())));
    }

    #[test]
    fn roundtrip() {
        let path = "/home/user/my docs/report.pdf";
        let uri  = to_uri(path);
        let back = parse_uri(&uri).unwrap().unwrap();
        assert_eq!(back, PeekAction::Open(path.to_string()));
    }
}
