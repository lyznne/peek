use crate::{api, config, websocket::{self, broadcaster::Broadcaster}};
use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer};
use anyhow::Result;
use std::sync::Arc;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};
use crate::services::{spa};



pub fn start_server(host: String, port: u16, initial_path: Option<String>) -> Result<()> {
    let _ = tracing_subscriber::registry()
    .with(
        EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| EnvFilter::new("info,peek=debug")),
    )
    .with(tracing_subscriber::fmt::layer())
    .try_init();

    let mut settings = config::Settings::new()?;

    let resolved_path = initial_path
        .as_deref()
        .map(|p| {
            std::fs::canonicalize(p)
                .map(|c| c.display().to_string())
                .unwrap_or_else(|_| p.to_string())
        })
        .or_else(|| {
            std::env::current_dir()
                .ok()
                .map(|c| c.display().to_string())
        });

    settings.initial_path = resolved_path.clone();
    let state = Arc::new(settings);

    // Shared broadcaster — navigate events from POST /api/navigate fan out to
    // all connected WebSocket clients
    let broadcaster = Broadcaster::new();

    let addr = format!("{}:{}", host, port);

    tracing::info!("🚀 Peek File Browser Server");
    tracing::info!("📡 Running at http://{}", addr);
    if let Some(ref p) = resolved_path {
        tracing::info!("📁 Initial path: {}", p);
    }

    actix_web::rt::System::new().block_on(async move {
        HttpServer::new(move || {
            let cors = Cors::default()
                .allow_any_origin()
                .allow_any_method()
                .allow_any_header()
                .max_age(3600);

            App::new()
                .app_data(web::Data::new(state.clone()))
                // Inject broadcaster so both /ws and /api/navigate can use it
                .app_data(web::Data::new(broadcaster.clone()))
                .wrap(cors)
                .wrap(Logger::default())
                .wrap(actix_web::middleware::Compress::default())
                .service(
                    web::scope("/api")
                        .route("/browse",        web::get().to(api::browse::browse_directory))
                        .route("/preview",       web::get().to(api::preview::preview_file))
                        .route("/search",        web::get().to(api::search::search_files))
                        .route("/info",          web::get().to(api::browse::file_info))
                        .route("/view",          web::get().to(api::browse::view_document))
                        .route("/initial-path",  web::get().to(api::browse::api_initial_path))

                        .route("/navigate",      web::post().to(api::navigate::navigate)),
                )
                .route("/ws",        web::get().to(websocket::handler::websocket_handler))
                .route("/health",    web::get().to(api::health::health_check))
                .route("/ui-health", web::get().to(spa::ui_health))
                // SPA catch-all must be last
                .service(spa::spa_handler)
        })
        .bind(&addr)?
        .workers(4)
        .run()
        .await
    })?;

    Ok(())
}
