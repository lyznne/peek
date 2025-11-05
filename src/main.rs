//! Main module for Peek tool.
//!
//! This module initializes the application and coordinates between different components.

mod browser;
mod cli;
mod errors;
mod utils;
mod file_search;

use anyhow::Result;
use clap::Parser;
use cli::Cli;
use errors::PeekError;
use std::path::PathBuf;


fn main() {
    if let Err(e) = run() {
        eprintln!("Error: {}", e);
        std::process::exit(1);
    }
}

fn run() -> Result<()> {
    let cli = Cli::parse();

    let target = if let Some(path) = cli.path {
        resolve_target(&path)?
    } else {
        // Default to current directory if no path provided
        std::env::current_dir()
            .map_err(|e| PeekError::IoError(format!("Failed to get current directory: {}", e)))?
    };

    browser::open_in_browser(&target)?;

    Ok(())
}

fn resolve_target(input: &str) -> Result<PathBuf> {
    let path = PathBuf::from(input);

    // Check if it's a direct path that exists
    if path.exists() {
        return utils::canonicalize_path(&path);
    }

    // If it doesn't exist, search for it in current directory
    let current_dir = std::env::current_dir()
        .map_err(|e| PeekError::IoError(format!("Failed to get current directory: {}", e)))?;

    file_search::search_file(&current_dir, input)
        .ok_or_else(|| PeekError::FileNotFound(input.to_string()).into())
}
