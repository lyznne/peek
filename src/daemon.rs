use anyhow::{Context, Result};
use std::fs;
use std::net::TcpListener;
use std::path::PathBuf;


// ─────────────────────────────────────────────────────────────────────────────
// PID file helpers
// ─────────────────────────────────────────────────────────────────────────────

/// Returns  ~/.cache/peek/peek.pid
pub fn pid_file_path() -> PathBuf {
    dirs::cache_dir()
        .unwrap_or_else(|| PathBuf::from("/tmp"))
        .join("peek")
        .join("peek.pid")
}

#[derive(Debug)]
pub struct DaemonInfo {
    pub pid: u32,
    pub port: u16,
}

/// Read an existing PID file.  Returns None if the file doesn't exist or is
/// malformed.
pub fn read_pid_file() -> Option<DaemonInfo> {
    let content = fs::read_to_string(pid_file_path()).ok()?;
    let mut lines = content.lines();
    let pid: u32 = lines.next()?.trim().parse().ok()?;
    let port: u16 = lines.next()?.trim().parse().ok()?;
    Some(DaemonInfo { pid, port })
}

/// Write pid + port to the PID file, creating the directory if needed.
pub fn write_pid_file(pid: u32, port: u16) -> Result<()> {
    let path = pid_file_path();
    fs::create_dir_all(path.parent().unwrap())
        .context("Failed to create ~/.cache/peek directory")?;
    fs::write(&path, format!("{}\n{}\n", pid, port))
        .context("Failed to write PID file")?;
    Ok(())
}

/// Remove the PID file (called by the server on clean shutdown).
pub fn remove_pid_file() {
    let _ = fs::remove_file(pid_file_path());
}

// ─────────────────────────────────────────────────────────────────────────────
// Kill any running daemon
// ─────────────────────────────────────────────────────────────────────────────


pub fn kill_existing() {
    let Some(info) = read_pid_file() else { return };

    #[cfg(unix)]
    {
        use std::time::{Duration, Instant};

        // SIGTERM
        unsafe { libc::kill(info.pid as libc::pid_t, libc::SIGTERM) };

        // Wait up to 2 s for it to die
        let deadline = Instant::now() + Duration::from_secs(2);
        while Instant::now() < deadline {
            // kill(pid, 0) returns -1
            let alive = unsafe {
                libc::kill(info.pid as libc::pid_t, 0) == 0
            };
            if !alive {
                break;
            }
            std::thread::sleep(Duration::from_millis(100));
        }
    }

    #[cfg(not(unix))]
    {
        // Windows: just try to open and kill the process

        let _ = info;
    }

    remove_pid_file();
}

// ─────────────────────────────────────────────────────────────────────────────
// Ephemeral port
// ─────────────────────────────────────────────────────────────────────────────

pub fn find_free_port() -> Result<u16> {
    let listener = TcpListener::bind("127.0.0.1:0")
        .context("Failed to find a free port")?;
    let port = listener.local_addr()?.port();
    Ok(port)
}


#[cfg(unix)]
pub fn daemonize(port: u16) -> Result<()> {
    let pid = unsafe { libc::fork() };

    match pid {
        -1 => anyhow::bail!("fork() failed"),

        0 => {

            unsafe { libc::setsid() };

            let devnull = fs::OpenOptions::new()
                .read(true)
                .write(true)
                .open("/dev/null")
                .context("Failed to open /dev/null")?;

            use std::os::unix::io::IntoRawFd;
            let fd = devnull.into_raw_fd();
            unsafe {
                libc::dup2(fd, 0); // stdin
                libc::dup2(fd, 1); // stdout
                libc::dup2(fd, 2); // stderr
                if fd > 2 { libc::close(fd); }
            }

            // Write PID file from child so the PID is correct
            write_pid_file(std::process::id(), port)?;

            // Child returns — caller continues to start the server
            Ok(())
        }

        child_pid => {
            // ── print info and exit ───────────────────────────────
            println!("✓ peek  •  running on port {}  •  pid {}", port, child_pid);
            println!("   Use `peek --kill` to stop the background server.");
            std::process::exit(0);
        }
    }
}

#[cfg(not(unix))]
pub fn daemonize(port: u16) -> Result<()> {
    write_pid_file(std::process::id(), port)?;
    Ok(())
}
