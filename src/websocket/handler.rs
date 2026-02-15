use crate::websocket::broadcaster::Broadcaster;
use actix_web::{web, Error, HttpRequest, HttpResponse};
use actix_ws::Message;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Duration;
use std::sync::Arc;


static ACTIVE_CONNECTIONS: AtomicUsize = AtomicUsize::new(0);
const SHUTDOWN_GRACE_MS: u64 = 2_000;

pub async fn websocket_handler(
    req: HttpRequest,
    stream: web::Payload,
    broadcaster: web::Data<Arc<Broadcaster>>,
) -> Result<HttpResponse, Error> {
    let (response, mut session, mut msg_stream) = actix_ws::handle(&req, stream)?;

    let prev = ACTIVE_CONNECTIONS.fetch_add(1, Ordering::SeqCst);
    tracing::debug!("WS connected — active: {}", prev + 1);

    // Subscribe to server-side broadcast events (e.g. navigate)
    let mut broadcast_rx = broadcaster.subscribe();

    actix_web::rt::spawn(async move {
        let mut ping_interval = tokio::time::interval(Duration::from_secs(30));

        loop {
            tokio::select! {
                // ── Incoming from browser ────────────────────────────────────
                Some(Ok(msg)) = msg_stream.recv() => {
                    match msg {
                        Message::Text(text) => handle_text(&text, &mut session).await,
                        Message::Ping(b)    => { let _ = session.pong(&b).await; }
                        Message::Close(_)   => break,
                        _ => {}
                    }
                }

                // ── Outgoing from server (navigate, file_changed, etc.) ───────
                Ok(broadcast_msg) = broadcast_rx.recv() => {
                    if session.text(broadcast_msg).await.is_err() {
                        break; // client gone
                    }
                }

                // ── Keep-alive ───────────────────────────────────────────────
                _ = ping_interval.tick() => {
                    if session.ping(b"").await.is_err() { break; }
                }

                else => break,
            }
        }

        let remaining = ACTIVE_CONNECTIONS.fetch_sub(1, Ordering::SeqCst) - 1;
        tracing::debug!("WS disconnected — active: {}", remaining);

        if remaining == 0 {
            tokio::spawn(async move {
                tracing::info!("No active connections. Shutting down in {}ms…", SHUTDOWN_GRACE_MS);
                tokio::time::sleep(Duration::from_millis(SHUTDOWN_GRACE_MS)).await;
                if ACTIVE_CONNECTIONS.load(Ordering::SeqCst) == 0 {
                    crate::daemon::remove_pid_file();
                    std::process::exit(0);
                }
            });
        }
    });

    Ok(response)
}

async fn handle_text(text: &str, session: &mut actix_ws::Session) {
    let Ok(cmd) = serde_json::from_str::<serde_json::Value>(text) else { return };
    match cmd.get("type").and_then(|v| v.as_str()) {
        Some("ping") => {
            let _ = session.text(r#"{"type":"pong"}"#).await;
        }
        Some("watch") => {
            if let Some(path) = cmd.get("path").and_then(|v| v.as_str()) {
                tracing::debug!("Watching: {}", path);
                let _ = session.text(
                    serde_json::json!({"type":"watch_started","path":path}).to_string()
                ).await;
            }
        }
        _ => {}
    }
}
