<div align="center">

# <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><g fill="none"><path stroke="#70fb9e" stroke-linecap="round" stroke-width="1.5" d="m13.306 18.298l-5.069 1.689c-2.765.922-4.148 1.383-4.878.653s-.269-2.113.653-4.878l1.69-5.069c.766-2.298 1.149-3.447 2.055-3.66c.906-.215 1.763.642 3.475 2.355l3.38 3.379c1.712 1.713 2.569 2.569 2.355 3.475"/><path stroke="#70fb9e" stroke-linecap="round" stroke-width="1.5" d="M12.235 18.346s-.758-2.281-.758-3.79c0-1.51.758-3.792.758-3.792m-4.17 8.72s-.64-2.753-.758-4.55c-.195-2.969.758-7.581.758-7.581m6.445 2.653l.143-.72c.146-.727.67-1.32 1.373-1.554a2.07 2.07 0 0 0 1.372-1.555l.144-.72m.028 7.796l.212.123c.657.38 1.483.296 2.051-.207a1.76 1.76 0 0 1 1.876-.297L22 13M9.795 2.779A1.4 1.4 0 0 0 10 4.5l.098.098c.393.393.538.97.377 1.503"/><path fill="#70fb9e" d="M6.928 3.94a.536.536 0 1 1 .758.76a.536.536 0 0 1-.758-.76m5.229 3.217a.536.536 0 1 1 .759.759a.536.536 0 0 1-.759-.759m5 3a.536.536 0 1 1 .759.759a.536.536 0 0 1-.759-.759m1.901 5.156a.536.536 0 1 1 .759.759a.536.536 0 0 1-.759-.759"/><path stroke="#70fb9e" stroke-linejoin="round" d="M19.362 7.714c-.67.67-.19 2.614-.19 2.614s1.944.481 2.614-.19c.71-.71.308-1.64-.786-1.638c.003-1.094-.929-1.496-1.639-.786Z" stroke-width="1"/><path stroke="#70fb9e" d="m15.188 3.417l-.027.098c-.03.106-.046.16-.038.212c.007.052.035.098.093.189l.052.082c.202.32.303.48.234.611s-.262.146-.648.176l-.1.008c-.11.009-.164.013-.212.038s-.083.068-.155.155l-.064.079c-.251.304-.376.456-.52.437c-.142-.02-.208-.198-.34-.555l-.034-.092c-.037-.102-.056-.152-.093-.19c-.037-.036-.087-.055-.189-.092l-.092-.034c-.357-.132-.535-.198-.555-.34c-.02-.144.133-.27.437-.52l.079-.065c.086-.07.13-.106.155-.154s.03-.103.038-.213l.008-.1c.03-.385.045-.578.176-.647c.13-.069.29.032.61.234l.083.052c.091.058.137.086.189.093s.106-.008.212-.038l.098-.027c.375-.107.563-.16.663-.06s.047.288-.06.663Z" stroke-width="1"/></g></svg> peek-cli
*A lightning-fast CLI tool that instantly opens any file or folder in your browser — no bloat, no waiting.*

<span style="display: inline-block; margin: 8px 4px 0 4px;">
  <a href="https://github.com/lyznne/peek/actions/workflows/release.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/lyznne/peek/release.yml?style=for-the-badge&label=Release&color=70fb9e" alt="Release">
  </a>
</span>
<span style="display: inline-block; margin: 8px 4px 0 4px;">
  <img src="https://img.shields.io/github/last-commit/lyznne/peek?style=for-the-badge&color=70fb9e" alt="Last Commit">
</span>
<span style="display: inline-block; margin: 8px 4px 0 4px;">
  <a href="https://crates.io/crates/peek-cli">
    <img src="https://img.shields.io/crates/v/peek-cli?style=for-the-badge&color=70fb9e" alt="Crates.io Version">
  </a>
</span>
<span style="display: inline-block; margin: 8px 4px 0 4px;">
  <img src="https://img.shields.io/github/actions/workflow/status/lyznne/peek/release.yml?style=for-the-badge&label=Build&color=70fb9e" alt="Build Status">
</span>
<span style="display: inline-block; margin: 8px 4px 0 4px;">
  <a href="https://www.buymeacoffee.com/lyznne">
    <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-%E2%98%95%EF%B8%8F-FFD93D?style=for-the-badge&color=70fb9e" alt="Buy Me a Coffee">
  </a>
</span>

</div>

<div align="center">
  <img src="https://raw.githubusercontent.com/lyznne/peek/main/screenshots/peek-light.png" alt="Peek CLI in action" width="800" style="border-radius:12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin: 2rem 0;">
  <p style="font-size:1.1em; color:#70fb9e; margin-top:1rem;">
    Instantly preview PDFs, images, videos, code, markdown — right in your browser.
  </p>
</div>

---

## <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#70fb9e" fill-rule="evenodd" d="m15.502 14.367l5.03-5.014c.724-.722 1.087-1.083 1.277-1.543C22 7.351 22 6.84 22 5.82v-.49c0-1.57 0-2.355-.49-2.843C21.022 2 20.235 2 18.659 2h-.489c-1.024 0-1.537 0-1.997.19s-.823.551-1.547 1.274l-5.03 5.014c-.846.844-1.371 1.367-1.574 1.873c-.064.16-.097.317-.097.483c0 .69.557 1.245 1.671 2.356l.15.149l1.754-1.78a.645.645 0 0 1 .919.906l-1.76 1.785l.119.117c1.114 1.11 1.67 1.666 2.362 1.666q.228 0 .447-.081c.519-.191 1.048-.72 1.916-1.585m2.363-5.888c-.652.65-1.71.65-2.363 0a1.66 1.66 0 0 1 0-2.356c.653-.65 1.71-.65 2.363 0s.653 1.705 0 2.356M2.774 12.481a.76.76 0 0 1 0 1.074l-.156.155a.34.34 0 0 0 0 .48a.34.34 0 0 0 .483 0l1.713-1.71a.76.76 0 0 1 1.072 1.075l-1.712 1.71a1.86 1.86 0 0 1-2.629 0a1.857 1.857 0 0 1 0-2.629l.156-.155a.76.76 0 0 1 1.073 0m4.523 4.215c.293.3.288.78-.012 1.073l-1.73 1.692a.759.759 0 0 1-1.061-1.085l1.73-1.692a.76.76 0 0 1 1.073.012m4.184 1.422a.76.76 0 0 1 0 1.074l-1.713 1.71a.34.34 0 0 0 0 .48c.134.133.35.133.484 0l.156-.155A.759.759 0 0 1 11.48 22.3l-.155.155a1.86 1.86 0 0 1-2.63 0a1.857 1.857 0 0 1 0-2.629l1.713-1.71a.76.76 0 0 1 1.073.001" clip-rule="evenodd"/><path fill="#70fb9e" d="M10.846 5.41L8.658 7.59c-.402.401-.77.769-1.062 1.101a5 5 0 0 0-.532.706l-.022-.021l-.08-.08a4.2 4.2 0 0 0-1.319-.865l-.106-.042l-.325-.13a.658.658 0 0 1-.223-1.077c.963-.96 2.12-2.114 2.679-2.346a2.9 2.9 0 0 1 1.537-.197c.47.07.915.311 1.641.77m3.736 11.484c.176.18.293.306.399.44q.21.268.373.567c.123.223.218.462.408.939c.155.388.67.491.968.193l.073-.072c.963-.96 2.12-2.114 2.353-2.67a2.9 2.9 0 0 0 .197-1.534c-.07-.468-.312-.912-.772-1.636l-2.195 2.189c-.411.41-.789.786-1.13 1.08a5 5 0 0 1-.674.504m-6.896-2.33a.759.759 0 1 0-1.073-1.073L4.47 15.632a.759.759 0 1 0 1.074 1.074zm2.809 2.806a.759.759 0 1 0-1.073-1.073l-2.128 2.127a.76.76 0 0 0 1.074 1.074z" opacity="0.5"/></svg> What is peek-cli?

**peek-cli** is a tiny Rust command-line tool that lets you instantly preview **any file** (PDFs, images, videos, code, markdown, documents, archives...) directly in your default web browser — from the terminal.

Just type:

```bash
peek report.pdf
peek photo.jpg
peek code.rs
peek docs/
```

→ Your browser opens with a clean, fast preview UI — no installing heavy software, no waiting for apps to load.

Perfect for developers, designers, writers, sysadmins — anyone who needs quick file glances without context switching.

---

<div align="center">
  <img src="https://raw.githubusercontent.com/lyznne/peek/main/screenshots/peek-dark.png" alt="Multiple file types preview" width="800" style="border-radius:12px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); margin: 1.5rem 0;">
  <p style="font-size:1.1em; color:#70fb9e; margin:1rem 0;">
    PDFs • Images • Videos • Code • Markdown • All in one clean interface
  </p>
</div>

---

## <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#70fb9e" d="M9.153 5.408C10.42 3.136 11.053 2 12 2s1.58 1.136 2.847 3.408l.328.588c.36.646.54.969.82 1.182s.63.292 1.33.45l.636.144c2.46.557 3.689.835 3.982 1.776c.292.94-.546 1.921-2.223 3.882l-.434.507c-.476.557-.715.836-.822 1.18c-.107.345-.071.717.001 1.46l.066.677c.253 2.617.38 3.925-.386 4.506s-1.918.051-4.22-1.009l-.597-.274c-.654-.302-.981-.452-1.328-.452s-.674.15-1.328.452l-.596.274c-2.303 1.06-3.455 1.59-4.22 1.01c-.767-.582-.64-1.89-.387-4.507l.066-.676c.072-.744.108-1.116 0-1.46c-.106-.345-.345-.624-.821-1.18l-.434-.508c-1.677-1.96-2.515-2.941-2.223-3.882S3.58 8.328 6.04 7.772l.636-.144c.699-.158 1.048-.237 1.329-.45s.46-.536.82-1.182z"/></svg> Features

- Instant preview of **PDFs, images, videos, code, markdown, text, archives** and more
- Beautiful browser-based UI — no external viewers needed
- Smart file detection & syntax highlighting for code
- Cross-platform: Linux, macOS, Windows
- Written in **Rust** — fast, safe, tiny binary (~5–10 MB)
- Works offline — no cloud upload
- Available on **AUR**, **Crates.io**, **GitHub Releases**

<div align="center">
  <img src="https://raw.githubusercontent.com/lyznne/peek/main/screenshots/code-preview.png" alt="Code with syntax highlighting" width="720" style="border-radius:10px; margin: 1.5rem 0;">
  <p style="color:#70fb9e;">Syntax-highlighted Rust, Python, JS, Markdown & more</p>
</div>

---

## <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="#70fb9e" fill-rule="evenodd" clip-rule="evenodd"><path d="M9.632 9.022c-.303.04-.398.106-.45.16c-.054.052-.12.147-.16.45c-.044.322-.045.76-.045 1.438v1.86c0 .678.001 1.116.045 1.438c.04.303.106.398.16.45c.052.054.147.12.45.16c.322.044.76.045 1.438.045h1.86c.678 0 1.116-.001 1.438-.045c.303-.04.398-.106.45-.16c.054-.052.12-.147.16-.45c.044-.322.045-.76.045-1.438v-1.86c0-.678-.001-1.116-.045-1.438c-.04-.303-.106-.398-.16-.45c-.052-.054-.147-.12-.45-.16c-.322-.044-.76-.045-1.438-.045h-1.86c-.678 0-1.116.001-1.438.045m3.334 1.523a.698.698 0 0 0-1.135-.81l-1.329 1.86a.698.698 0 0 0 .568 1.103h.505l-.541.757a.698.698 0 0 0 1.135.811l1.329-1.86a.698.698 0 0 0-.568-1.104h-.505z"/><path d="M12.698 2.698a.698.698 0 0 0-1.396 0v2.79q-.764 0-1.395.017V2.698a.698.698 0 0 0-1.395 0v2.79q0 .056.008.108c-.936.115-1.585.353-2.078.846s-.731 1.142-.846 2.078a1 1 0 0 0-.108-.008h-2.79a.698.698 0 0 0 0 1.395h2.807q-.016.63-.016 1.395H2.698a.698.698 0 0 0 0 1.396h2.79q0 .764.017 1.395H2.698a.698.698 0 0 0 0 1.395h2.79a1 1 0 0 0 .108-.008c.115.936.353 1.585.846 2.078s1.142.731 2.078.846a1 1 0 0 0-.008.108v2.79a.698.698 0 0 0 1.395 0v-2.807q.63.016 1.395.016v2.791a.698.698 0 0 0 1.396 0v-2.79q.764 0 1.395-.017v2.807a.698.698 0 0 0 1.395 0v-2.79a1 1 0 0 0-.008-.108c.936-.115 1.585-.353 2.078-.846s.731-1.142.846-2.078q.053.009.108.008h2.79a.698.698 0 0 0 0-1.395h-2.807q.016-.63.016-1.395h2.791a.698.698 0 0 0 0-1.396h-2.79q0-.764-.017-1.395h2.807a.698.698 0 0 0 0-1.395h-2.79a1 1 0 0 0-.108.008c-.115-.936-.353-1.585-.846-2.078s-1.142-.731-2.078-.846a1 1 0 0 0 .008-.108v-2.79a.698.698 0 0 0-1.395 0v2.807a56 56 0 0 0-1.395-.016zm-3.252 4.94c.426-.057.96-.057 1.578-.057h1.952c.619 0 1.151 0 1.578.058c.458.061.896.2 1.252.555c.355.356.494.794.555 1.252c.058.426.058.96.058 1.578v1.952c0 .619 0 1.151-.058 1.578c-.061.458-.2.896-.555 1.252c-.356.355-.794.494-1.252.555c-.427.058-.96.058-1.578.058h-1.952c-.619 0-1.152 0-1.578-.058c-.458-.061-.896-.2-1.252-.555c-.355-.356-.494-.794-.555-1.252c-.058-.427-.058-.96-.058-1.578v-1.952c0-.619 0-1.152.058-1.578c.061-.458.2-.896.555-1.252c.356-.355.794-.494 1.252-.555"/></g></svg> Installation

### From Cargo (recommended)

```bash
cargo install peek-cli
```

### Arch Linux (AUR)

```bash
yay -S peek-cli
# or
paru -S peek-cli
```

### Windows (pre-built binary)

1. Go to [Releases](https://github.com/lyznne/peek/releases)
2. Download `peek-windows-x86_64.zip`
3. Extract → add folder to PATH or move `peek.exe` to `C:\Windows\System32`
4. Open terminal → `peek file.pdf`

### macOS / Linux (manual)

```bash
# Download latest release binary for your platform
# Make it executable and move to PATH
chmod +x peek-cli
sudo mv peek-cli /usr/local/bin/peek
```

---

## <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#70fb9e" fill-rule="evenodd" d="m10.667 6.134l-.502-.355A4.24 4.24 0 0 0 7.715 5h-.612c-.405 0-.813.025-1.194.16c-2.383.846-4.022 3.935-3.903 10.943c.024 1.412.354 2.972 1.628 3.581A3.2 3.2 0 0 0 5.027 20a2.74 2.74 0 0 0 1.53-.437c.41-.268.77-.616 1.13-.964c.444-.43.888-.86 1.424-1.138a4.1 4.1 0 0 1 1.89-.461H13c.658 0 1.306.158 1.89.46c.536.279.98.709 1.425 1.139c.36.348.72.696 1.128.964c.39.256.895.437 1.531.437a3.2 3.2 0 0 0 1.393-.316c1.274-.609 1.604-2.17 1.628-3.581c.119-7.008-1.52-10.097-3.903-10.942C17.71 5.025 17.3 5 16.897 5h-.612a4.24 4.24 0 0 0-2.45.78l-.502.354a2.31 2.31 0 0 1-2.666 0M16.75 9a.75.75 0 1 1 0 1.5a.75.75 0 0 1 0-1.5m-9.25.25a.75.75 0 0 1 .75.75v.75H9a.75.75 0 0 1 0 1.5h-.75V13a.75.75 0 0 1-1.5 0v-.75H6a.75.75 0 0 1 0-1.5h.75V10a.75.75 0 0 1 .75-.75m11.5 2a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0m-3.75.75a.75.75 0 1 0 0-1.5a.75.75 0 0 0 0 1.5m2.25.75a.75.75 0 1 0-1.5 0a.75.75 0 0 0 1.5 0" clip-rule="evenodd"/></svg> Usage

```bash
peek <file-or-folder>
peek --help
```

**Quick examples**

```bash
# Current directory
peek .

# Single file
peek report.pdf
peek photo.jpg
peek main.rs
peek notes.md

# Open folder
peek ~/Documents/projects
peek /var/log

# Open in system default (bypass server)
peek --no-server secret.pdf
```

---

<div align="center">
  <img src="https://raw.githubusercontent.com/lyznne/peek/main/screenshots/pdf-preview.png" alt="PDF preview example" width="720" style="border-radius:10px; margin: 1.5rem 0;">
  <p style="color:#70fb9e; font-size:1.1em;">
    Smooth PDF viewing — zoom, scroll, search inside documents
  </p>
</div>

---

## <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#70fb9e" fill-rule="evenodd" d="M3.464 3.464C2 4.93 2 7.286 2 12s0 7.071 1.464 8.535C4.93 22 7.286 22 12 22s7.071 0 8.535-1.465C22 19.072 22 16.714 22 12s0-7.071-1.465-8.536C19.072 2 16.714 2 12 2S4.929 2 3.464 3.464m10.024 2.982a.75.75 0 0 1 .53.918l-2.588 9.66a.75.75 0 0 1-1.449-.389l2.589-9.659a.75.75 0 0 1 .918-.53M14.97 8.47a.75.75 0 0 1 1.06 0l.209.208c.635.635 1.165 1.165 1.529 1.642c.384.504.654 1.036.654 1.68s-.27 1.176-.654 1.68c-.364.477-.894 1.007-1.53 1.642l-.208.208a.75.75 0 1 1-1.06-1.06l.171-.172c.682-.682 1.139-1.14 1.434-1.528c.283-.37.347-.586.347-.77s-.064-.4-.347-.77c-.295-.387-.752-.846-1.434-1.528l-.171-.172a.75.75 0 0 1 0-1.06m-7 0a.75.75 0 0 1 1.06 1.06l-.171.172c-.682.682-1.138 1.14-1.434 1.528c-.283.37-.346.586-.346.77s.063.4.346.77c.296.387.752.846 1.434 1.528l.172.172a.75.75 0 1 1-1.061 1.06l-.208-.208c-.636-.635-1.166-1.165-1.53-1.642c-.384-.504-.653-1.036-.653-1.68s.27-1.176.653-1.68c.364-.477.894-1.007 1.53-1.642z" clip-rule="evenodd"/></svg> Development

Want to hack on peek-cli or add features?

```bash
git clone https://github.com/lyznne/peek.git
cd peek

# Build & run (opens current directory)
cargo run

# Or specify path
cargo run -- ~/Documents/report.pdf
```

Frontend is in `/frontend` — uses Vite + React + TypeScript + Tailwind.

```bash
cd frontend
pnpm install
pnpm dev
```

---

<div align="center">
  <img src="https://raw.githubusercontent.com/lyznne/peek/main/screenshots/folder-browse.png" alt="Folder browsing view" width="720" style="border-radius:10px; margin: 1.5rem 0;">
  <p style="color:#70fb9e;">
    Clean directory listing — folders, files, sizes, dates
  </p>
</div>

---

Built with passion by [**@lyznne**](https://github.com/lyznne)

<p align="center" style="margin-top: 16px;">
  <a href="https://www.buymeacoffee.com/lyznne">
    <img src="https://img.shields.io/badge/%E2%98%95%EF%B8%8F-Support%20my%20work-FFD93D?style=for-the-badge" alt="Buy Me A Coffee">
  </a>
</p>

<p style="font-family: 'Comic Sans MS', cursive; font-size: 1.1em; color: #70fb9e; text-align:center; margin:2rem 0;">
  ✨ <em>“Peek into your files — effortlessly.”</em> ✨
</p>

<p style="margin-top: 20px; font-size: 0.9em; color: #888; text-align:center;">
  Made with <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style="vertical-align:middle" viewBox="0 0 24 24"><g fill="none" stroke="#70fb9e" stroke-width="1.5"><path d="M3 7c0-1.886 0-2.828.586-3.414S5.114 3 7 3h6c1.886 0 2.828 0 3.414.586S17 5.114 17 7v5c0 2.828 0 4.243-.879 5.121C15.243 18 13.828 18 11 18H9c-2.828 0-4.243 0-5.121-.879C3 16.243 3 14.828 3 12zm14 6h1a4 4 0 0 0 0-8h-1"/><path d="M17 13H3" opacity="0.5"/><path stroke-linecap="round" d="M22 21H2" opacity="0.5"/></g></svg> & <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style="vertical-align:middle" viewBox="0 0 24 24"><path fill="#70fb9e" d="M2 9.26c0 3.748 4.02 7.711 6.962 10.11C10.294 20.458 10.96 21 12 21s1.706-.543 3.038-1.63C17.981 16.972 22 13.009 22 9.26C22 3.35 16.5.663 12 5.5C7.5.663 2 3.349 2 9.26" opacity="0.5"/><path fill="#70fb9e" d="M10.093 10.747q.133-.191.23-.325c.056.097.119.21.194.348l1.71 3.109c.166.302.33.598.493.813c.175.23.482.546.975.555s.813-.294.996-.518c.172-.208.345-.498.523-.794l.055-.092c.221-.368.36-.598.483-.764c.113-.154.179-.204.228-.231s.125-.058.315-.077c.206-.02.474-.02.904-.02H18a.75.75 0 0 0 0-1.5h-.834c-.387 0-.73 0-1.016.027a2.2 2.2 0 0 0-.91.264a2.2 2.2 0 0 0-.694.644c-.171.232-.347.525-.546.857l-.048.08c-.087.144-.159.264-.224.368l-.21-.377l-1.709-3.108c-.154-.28-.307-.56-.463-.764c-.17-.224-.462-.52-.93-.545c-.467-.025-.789.237-.982.442c-.177.186-.36.448-.543.71l-.31.442c-.227.324-.37.526-.493.672a.8.8 0 0 1-.223.203c-.046.024-.118.05-.293.066c-.19.018-.438.018-.834.018H6a.75.75 0 0 0 0 1.5h.768c.357 0 .674 0 .94-.024c.29-.026.571-.085.85-.23c.28-.145.489-.343.676-.564c.173-.205.354-.464.559-.757z"/></svg> in Linux
</p>
