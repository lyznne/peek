//! Main module for Peek tool.
//!
//! This module initializes the application and coordinates between different components.

use clap::{Parser, Subcommand};

pub const PEEK_ABOUT: &str = "Open files and directories in your default browser";
pub const PEEK_LONG_ABOUT: &str = "A fast CLI tool to quicky open PDFs, images, videos, and text files in your default web browser directly from the command line.";

#[derive(Parser, Debug)]
#[command(name = "peek")]
#[command(author, version, about= PEEK_ABOUT, long_about = PEEK_LONG_ABOUT)]
#[command(after_help = "EXAMPLES:
  peek .                   Browse current directory
  peek ~/Documents         Browse a directory
  peek report.pdf          Open a file in the UI
  peek --no-server doc.pdf Open with system default (file://)
  peek --kill              Stop the background peek daemon
  peek --status            Show whether a daemon is running
  peek serve               Foreground server (logs visible For debugging only)
")]
pub struct Cli {
    pub path: Option<String>,
    #[arg(short = 'n', long)]
    pub no_server: bool,

    /// Preferred port (ignored if already in use; OS picks a free one)
    #[arg(short = 'p', long, default_value = "0")]
    pub port: u16,

    #[arg(long)]
    pub kill: bool,

    #[arg(long)]
    pub status: bool,

    #[command(subcommand)]
    pub command: Option<Commands>,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    Serve {
        #[arg(short = 'H', long, default_value = "127.0.0.1")]
        host: String,
        #[arg(short = 'p', long, default_value = "8080")]
        port: u16,
        path: Option<String>,
    },
}
