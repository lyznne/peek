mod api;
mod browser;
mod cli;
mod config;
mod daemon;
mod protocol;
mod register;
mod errors;
mod file_search;
mod models;
mod security;
mod server;
mod services;
mod utils;
mod websocket;

use protocol::PeekAction;
use anyhow::{Context, Result};
use clap::Parser;
use cli::{Cli, Commands};
use std::path::PathBuf;

fn main() {
    if let Err(e) = run() {
        eprintln!("Error: {}", e);
        std::process::exit(1);
    }
}

fn run() -> Result<()> {
    // register
    register::ensure_registered();

    let cli = Cli::parse();

    // ── kill  and exit
    if cli.kill {
        match daemon::read_pid_file() {
            Some(info) => {
                println!(" Stopping peek daemon (pid {}, port {})…", info.pid, info.port);
                daemon::kill_existing();
                println!(" Done.");
            }
            None => println!("ℹ  No peek daemon is currently running."),
        }
        return Ok(());
    }

    // ── status
    if cli.status {
        match daemon::read_pid_file() {
            Some(info) => println!(
                " peek daemon running  •  pid {}  •  http://localhost:{}",
                info.pid, info.port
            ),
            None => println!("  No peek daemon is currently running."),
        }
        return Ok(());
    }




    match cli.command {
        Some(Commands::Serve { host, port, path }) => {
            println!("🚀 Starting Peek in foreground server mode…");
            server::start_server(host, port, path)?;
        }

        None => {
            let raw_arg = cli.path.as_deref().unwrap_or("");

            match protocol::parse_uri(raw_arg)? {
                // ── OS invoked us as a protocol handler ───────────────────────
                Some(PeekAction::Open(path)) => {
                    handle_open(&path, cli.no_server, cli.port)?;
                }
                Some(PeekAction::Kill) => {
                    daemon::kill_existing();
                }
                Some(PeekAction::Status) => {
                    match daemon::read_pid_file() {
                        Some(i) => println!("running  pid={}  port={}", i.pid, i.port),
                        None    => println!("not running"),
                    }
                }

                // ── Normal CLI invocation: peek [path] ────────────────────────
                None => {
                    let target = if raw_arg.is_empty() {
                        std::env::current_dir()
                            .context("Failed to get current directory")?
                    } else {
                        resolve_target(raw_arg)?
                    };

                    if cli.no_server {
                        browser::open_with_system(&target)?;
                    } else {
                        browser::open_with_server(&target, cli.port)?;
                    }
                }
            }
        }
    }

    Ok(())
}

fn handle_open(path: &str, no_server: bool, hint_port: u16) -> Result<()> {
    let target = PathBuf::from(path);

    if !no_server {
        if let Some(info) = daemon::read_pid_file() {
            if send_navigate(info.port, path).is_ok() {
                return Ok(());
            }
            daemon::remove_pid_file();
        }
    }

    if no_server {
        browser::open_with_system(&target)?;
    } else {
        browser::open_with_server(&target, hint_port)?;
    }

    Ok(())
}


fn send_navigate(port: u16, path: &str) -> Result<()> {
    use std::io::{Read, Write};
    use std::net::TcpStream;

    let body = serde_json::json!({ "path": path }).to_string();
    let request = format!(
        "POST /api/navigate HTTP/1.0\r\n\
         Host: localhost:{port}\r\n\
         Content-Type: application/json\r\n\
         Content-Length: {len}\r\n\
         Connection: close\r\n\
         \r\n\
         {body}",
        port = port,
        len  = body.len(),
        body = body
    );

    let mut stream = TcpStream::connect(format!("127.0.0.1:{}", port))
        .context("Could not connect to running daemon")?;
    stream.write_all(request.as_bytes())?;

    // Read just enough to confirm 200 OK
    let mut response = [0u8; 64];
    let _ = stream.read(&mut response);
    let response_str = std::str::from_utf8(&response).unwrap_or("");

    if response_str.starts_with("HTTP/1") && response_str.contains("200") {
        Ok(())
    } else {
        anyhow::bail!("navigate rejected: {}", response_str.trim())
    }
}

fn resolve_target(input: &str) -> Result<PathBuf> {
    if let Some(stripped) = input.strip_prefix("file://") {
        let path = PathBuf::from(stripped);
        if path.exists() { return utils::canonicalize_path(&path); }
        anyhow::bail!("File URL path does not exist: {}", stripped);
    }

    let path = PathBuf::from(input);
    if path.exists() { return utils::canonicalize_path(&path); }

    let cwd = std::env::current_dir().context("Failed to get current directory")?;
    file_search::search_file(&cwd, input)
        .ok_or_else(|| anyhow::anyhow!("File not found: {}", input))
}
