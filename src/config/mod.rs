#![allow(dead_code)]

use serde::Deserialize;
use std::env;
use std::path::PathBuf;


#[derive(Debug, Clone, Deserialize)]
pub struct Settings {
    pub server: ServerConfig,
    pub security: SecurityConfig,
    pub features: FeaturesConfig,
    pub initial_path: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SecurityConfig {
    pub allowed_paths: Vec<PathBuf>,
    pub max_file_size: u64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct FeaturesConfig {
    pub enable_file_watch: bool,
    pub enable_search: bool,
    pub max_preview_size: u64,
}
impl Settings {
    pub fn new() -> Result<Self, anyhow::Error> {
        let host = env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
        let port = env::var("SERVER_PORT")
            .unwrap_or_else(|_| "8080".to_string())
            .parse()
            .unwrap_or(8080);

        let allowed_paths_str = env::var("ALLOWED_PATHS").unwrap_or_default();
        let allowed_paths = if allowed_paths_str.is_empty() {
            vec![]
        } else {
            allowed_paths_str
                .split(',')
                .map(|s| PathBuf::from(s.trim()))
                .collect()
        };

        let max_file_size = env::var("MAX_FILE_SIZE")
            .unwrap_or_else(|_| "10485760".to_string())
            .parse()
            .unwrap_or(10485760);

        let max_preview_size = env::var("MAX_PREVIEW_SIZE")
            .unwrap_or_else(|_| "1048576".to_string())
            .parse()
            .unwrap_or(1048576);

        Ok(Settings {
            server: ServerConfig { host, port },
            security: SecurityConfig {
                allowed_paths,
                max_file_size,
            },
            features: FeaturesConfig {
                enable_file_watch: env::var("ENABLE_FILE_WATCH")
                    .unwrap_or_else(|_| "true".to_string())
                    == "true",
                enable_search: env::var("ENABLE_SEARCH")
                    .unwrap_or_else(|_| "true".to_string())
                    == "true",
                max_preview_size,
            },
            initial_path: None,
        })
    }
}
