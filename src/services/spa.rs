use crate::config::Settings;
use actix_web::{get, web, HttpRequest, HttpResponse, Result};
use include_dir::{include_dir, Dir};
use std::sync::Arc;

static DIST_DIR: Dir<'static> = include_dir!("$CARGO_MANIFEST_DIR/frontend/dist");

// ─────────────────────────────────────────────────────────────────────────────
// Core helper
// ─────────────────────────────────────────────────────────────────────────────

fn serve_embedded(path: &str, initial_path: &str) -> Result<HttpResponse> {
    let path = path.trim_start_matches('/');

    // Guard: if an api/ws path somehow leaks through, return 404 cleanly.
    if path.starts_with("api/") || path.starts_with("ws") {
        return Ok(HttpResponse::NotFound()
            .content_type("application/json")
            .body(r#"{"error":"not found"}"#));
    }

    let path = if path.is_empty() { "index.html" } else { path };

    // ── Exact static asset (JS/CSS/fonts/images with content-hash names) ──────
    if path != "index.html" {
        if let Some(file) = DIST_DIR.get_file(path) {
            let mime = mime_guess::from_path(path).first_or_octet_stream();
            return Ok(HttpResponse::Ok()
                .content_type(mime.as_ref())
                .append_header(("Cache-Control", "public, max-age=31536000, immutable"))
                .body(file.contents().to_vec()));
        }
    }

    // ── index.html — inject __PEEK_INITIAL_PATH__ then serve ─────────────────
    let index = DIST_DIR.get_file("index.html").ok_or_else(|| {
        actix_web::error::ErrorInternalServerError(
            "UI not embedded. Run `pnpm build` inside frontend/ first.",
        )
    })?;

    let html = std::str::from_utf8(index.contents()).map_err(|_| {
        actix_web::error::ErrorInternalServerError("index.html is not valid UTF-8")
    })?;

    // Escape the path so it is safe to embed inside a JS string literal.
    let safe_path = initial_path
        .replace('\\', "\\\\")
        .replace('"', "\\\"")
        .replace('\n', "\\n")
        .replace('\r', "\\r");

    let injected = html.replacen(
        "</head>",
        &format!(r#"<script>window.__PEEK_INITIAL_PATH__="{safe_path}";</script></head>"#),
        1,
    );

    Ok(HttpResponse::Ok()
        .append_header(("Cache-Control", "no-cache, no-store, must-revalidate"))
        .content_type("text/html; charset=utf-8")
        .body(injected))
}

// ─────────────────────────────────────────────────────────────────────────────
// Actix handlers
// ─────────────────────────────────────────────────────────────────────────────

#[get("/{tail:.*}")]
pub async fn spa_handler(
    req: HttpRequest,
    state: web::Data<Arc<Settings>>,
) -> Result<HttpResponse> {
    let tail = req.match_info().query("tail");
    let initial_path = state.initial_path.as_deref().unwrap_or("/");
    serve_embedded(tail, initial_path)
}

pub async fn ui_health() -> HttpResponse {
    if DIST_DIR.get_file("index.html").is_some() {
        HttpResponse::Ok().body("✓ UI embedded successfully")
    } else {
        HttpResponse::InternalServerError().body("✗ UI not embedded")
    }
}