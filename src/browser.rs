use crate::daemon;
use crate::errors::PeekError;
use crate::server;
use anyhow::{Context, Result};
use std::path::Path;
use std::thread;
use std::time::Duration;



/// Open with system default (original CLI behavior)
pub fn open_with_system(path: &Path) -> Result<()> {
    if !path.exists() {
        return Err(PeekError::FileNotFound(path.display().to_string()).into());
    }

    let absolute = path
        .canonicalize()
        .with_context(|| format!("Failed to resolve path: {}", path.display()))?;

    let target = if absolute.is_file() {
        path_to_file_url(&absolute)?
    } else {
        absolute.display().to_string()
    };

    println!("📂 Opening: {}", target);
    open::that(&target)
        .with_context(|| format!("Failed to open: {}", target))?;

    Ok(())
}


/// Open with Peek UI server // Peek UI mode:
pub fn open_with_server(path: &Path, _hint_port: u16) -> Result<()> {
    if !path.exists() {
        return Err(PeekError::FileNotFound(path.display().to_string()).into());
    }

    let absolute = path
        .canonicalize()
        .with_context(|| format!("Failed to resolve path: {}", path.display()))?;

    // Which directory does the server root to?
    let (serve_root, file_hint) = if absolute.is_file() {
        let parent = absolute
            .parent()
            .map(|p| p.display().to_string())
            .unwrap_or_else(|| "/".to_string());
        let name = absolute
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();
        (parent, Some(name))
    } else {
        (absolute.display().to_string(), None)
    };

    // Kill any leftover daemon so there are no port leaks
    daemon::kill_existing();

    // Pick a free OS-assigned port
    let port = daemon::find_free_port()
        .context("Could not find a free port")?;

    // Fork.  On Unix the parent prints and exits here; only the child
    // continues past this point.  On Windows this is a no-op.
    daemon::daemonize(port)?;

    // ── Everything below runs only in the child (or on Windows) ──────────────

    // Spawn the actix server on a background thread inside the child process
    let serve_root_clone = serve_root.clone();
    thread::spawn(move || {
        if let Err(e) = server::start_server(
            "127.0.0.1".to_string(),
            port,
            Some(serve_root_clone),
        ) {
            // stderr is /dev/null in the daemon, but log via tracing anyway
            tracing::error!("Server exited with error: {}", e);
        }
        // Clean up PID file when the server stops
        daemon::remove_pid_file();
    });

    wait_for_server(port, 5)?;


    let url = build_ui_url(port, &serve_root, file_hint.as_deref());

    // Open the system default browser
    open::that(&url)
        .with_context(|| format!("Failed to open browser at {}", url))?;

    loop {
        thread::sleep(Duration::from_secs(3600));
    }
}

fn build_ui_url(port: u16, dir: &str, file: Option<&str>) -> String {
    let encoded = urlencoding::encode(dir);
    let mut url = format!("http://localhost:{}?path={}", port, encoded);
    if let Some(f) = file {
        url.push_str(&format!("&file={}", urlencoding::encode(f)));
    }
    url
}


fn path_to_file_url(path: &Path) -> Result<String> {
    let absolute = path.canonicalize()?;
    #[cfg(target_os = "windows")]
    {
        let s = absolute.display().to_string().replace('\\', "/");
        Ok(format!("file:///{}", s))
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(format!("file://{}", absolute.display()))
    }
}


/// Poll TCP until the server is listening or we time out.
fn wait_for_server(port: u16, timeout_secs: u64) -> Result<()> {
    let deadline =
        std::time::Instant::now() + Duration::from_secs(timeout_secs);
    loop {
        if std::net::TcpStream::connect(format!("127.0.0.1:{}", port)).is_ok() {
            return Ok(());
        }
        if std::time::Instant::now() > deadline {
            return Err(anyhow::anyhow!(
                "Server did not start within {} seconds",
                timeout_secs
            ));
        }
        thread::sleep(Duration::from_millis(100));
    }
}
