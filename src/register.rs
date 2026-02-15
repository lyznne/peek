use anyhow::{bail, Context, Result};
use std::path::PathBuf;
use std::process::Command;


// ─────────────────────────────────────────────────────────────────────────────
// Public entry point — call once at startup
// ─────────────────────────────────────────────────────────────────────────────

/// Register peek:// silently.
/// • Skips if already registered with the current binary path.
/// • Logs errors via tracing but never panics — a failed registration
///   is non-fatal; peek still works via localhost URLs.
pub fn ensure_registered() {
    match is_registered() {
        Ok(true) => return,
        Ok(false) => {}
        Err(e) => {
            tracing::debug!("Could not check registration status: {}", e);
        }
    }

    if let Err(e) = register() {
        tracing::warn!(
            "peek:// protocol registration failed (non-fatal): {}",
            e
        );
    } else {
        tracing::info!("peek:// protocol handler registered successfully.");
    }
}




// ─────────────────────────────────────────────────────────────────────────────
// Linux implementation
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(target_os = "linux")]
fn desktop_file_path() -> PathBuf {
    dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("~/.local/share"))
        .join("applications")
        .join("peek-handler.desktop")
}

#[cfg(target_os = "linux")]
fn current_exe_path() -> Result<String> {
    std::env::current_exe()
        .context("Failed to get current exe path")?
        .display()
        .to_string()
        .pipe_ok()
}

#[cfg(target_os = "linux")]
fn is_registered() -> Result<bool> {
    let desktop = desktop_file_path();
    if !desktop.exists() { return Ok(false); }

    // Re-register if the binary path has changed (e.g. after an update)
    let content = std::fs::read_to_string(&desktop)?;
    let exe = current_exe_path()?;
    Ok(content.contains(&exe))
}

#[cfg(target_os = "linux")]
fn register() -> Result<()> {
    let exe = current_exe_path()?;
    let desktop_path = desktop_file_path();

    // Create ~/.local/share/applications/ if it doesn't exist
    std::fs::create_dir_all(desktop_path.parent().unwrap())
        .context("Failed to create applications directory")?;

    // Write the .desktop file
    let content = format!(
        "[Desktop Entry]\n\
         Name=Peek File Browser\n\
         Comment=Open files and directories with the Peek UI\n\
         Exec={exe} %u\n\
         Terminal=false\n\
         Type=Application\n\
         Icon=system-file-manager\n\
         MimeType=x-scheme-handler/peek;\n\
         Categories=System;FileManager;\n\
         NoDisplay=true\n",
        exe = exe
    );

    std::fs::write(&desktop_path, content)
        .with_context(|| format!("Failed to write {}", desktop_path.display()))?;

    // Register with XDG MIME system
    // xdg-mime default  — tells the MIME database which app handles peek://
 let _ = run_silent("xdg-mime", &[
    "default",
    "peek-handler.desktop",
    "x-scheme-handler/peek",
]);

    // Refresh the desktop database so the OS picks up the new entry
   let _ = run_silent("update-desktop-database", &[
    &dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("~/.local/share"))
        .join("applications")
        .display()
        .to_string(),
]);

    Ok(())
}

// ─────────────────────────────────────────────────────────────────────────────
// Windows implementation
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(target_os = "windows")]
fn is_registered() -> Result<bool> {
    use winreg::enums::HKEY_CURRENT_USER;
    use winreg::RegKey;

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let Ok(key) = hkcu.open_subkey(r"Software\Classes\peek\shell\open\command") else {
        return Ok(false);
    };

    let registered_exe: String = key.get_value("").unwrap_or_default();
    let current_exe = std::env::current_exe()?
        .display().to_string();

    Ok(registered_exe.contains(&current_exe))
}

#[cfg(target_os = "windows")]
fn register() -> Result<()> {
    use winreg::enums::{HKEY_CURRENT_USER, KEY_WRITE};
    use winreg::RegKey;

    let exe = std::env::current_exe()?
        .display().to_string();

    // The command Windows passes to peek when a peek:// URI is activated.
    let command = format!("\"{}\" \"%1\"", exe);

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);

    // HKCU\Software\Classes\peek
    let (root, _) = hkcu
        .create_subkey(r"Software\Classes\peek")
        .context("Failed to create peek registry key")?;
    root.set_value("", &"URL:Peek Protocol")?;
    root.set_value("URL Protocol", &"")?;

    // HKCU\Software\Classes\peek\DefaultIcon
    let (icon_key, _) = root
        .create_subkey("DefaultIcon")
        .context("Failed to create DefaultIcon key")?;
    icon_key.set_value("", &format!("\"{}\",0", exe))?;

    // HKCU\Software\Classes\peek\shell\open\command
    let (cmd_key, _) = root
        .create_subkey(r"shell\open\command")
        .context("Failed to create command key")?;
    cmd_key.set_value("", &command)
        .context("Failed to write command value")?;

    tracing::info!("peek:// registered in HKCU\\Software\\Classes\\peek");
    Ok(())
}

// ─────────────────────────────────────────────────────────────────────────────
// macOS stub
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(not(any(target_os = "linux", target_os = "windows")))]
fn is_registered() -> Result<bool> { Ok(true) }

#[cfg(not(any(target_os = "linux", target_os = "windows")))]
fn register() -> Result<()> { Ok(()) }

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

/// Run a command silently
fn run_silent(cmd: &str, args: &[&str]) -> Result<()> {
    let status = Command::new(cmd)
        .args(args)
        .stdin(std::process::Stdio::null())
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .status()
        .context("Failed to execute command")?;

    if !status.success() {
        bail!("Command failed with exit code: {:?}", status.code());
    }
    Ok(())
}

// Little helper so we don't need a separate trait import
trait PipeOk: Sized {
    fn pipe_ok(self) -> Result<Self>;
}
impl PipeOk for String {
    fn pipe_ok(self) -> Result<Self> { Ok(self) }
}
