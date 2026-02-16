
const PEEK_SCHEME = 'peek://';
const BROWSE_PREFIX = '/browse';

// ─────────────────────────────────────────────────────────────────────────────
// URI helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert an internal filesystem path to a peek:// URI string.
 * Used for display / title purposes only.
 *
 * '/'                  → 'peek://'
 * '/home/user/docs'    → 'peek://home/user/docs'
 */
export function toPeekUri(path: string): string {
    const normalized = path.startsWith('/') ? path.slice(1) : path;
    return `${PEEK_SCHEME}${normalized}`;
}

/**
 * Convert an internal filesystem path to the routable browser URL.
 * This is what gets pushed to History so the browser stays same-origin.
 *
 * '/'                  → '/browse'
 * '/home/user/docs'    → '/browse/home/user/docs'
 */
export function toBrowseUrl(path: string): string {
    if (path === '/') return BROWSE_PREFIX;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${BROWSE_PREFIX}${normalized}`;
}

/**
 * Parse a peek:// URI back to an internal filesystem path.
 *
 * 'peek://'               → '/'
 * 'peek://home/user/docs' → '/home/user/docs'
 */
export function fromPeekUri(uri: string): string {
    if (uri.startsWith(PEEK_SCHEME)) {
        const inner = uri.slice(PEEK_SCHEME.length);
        return inner ? `/${inner}` : '/';
    }
    return uri.startsWith('/') ? uri : `/${uri}`;
}

/**
 * Parse a /browse/<path> browser URL back to an internal filesystem path.
 *
 * '/browse'              → '/'
 * '/browse/home/user'    → '/home/user'
 * '/some/other/url'      → null  (not a browse URL)
 */
export function pathFromBrowseUrl(url?: string): string | null {
    const pathname = url ?? window.location.pathname;
    if (pathname === BROWSE_PREFIX || pathname === `${BROWSE_PREFIX}/`) return '/';
    if (pathname.startsWith(`${BROWSE_PREFIX}/`)) {
        return pathname.slice(BROWSE_PREFIX.length) || '/';
    }
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// History / address-bar helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildTitle(path: string, override_?: string): string {
    if (override_) return override_;
    if (path === '/') return 'Peek';
    return path.split('/').filter(Boolean).pop() ?? 'Peek';
}

/**
 * Replace the current History entry.
 * Address bar shows /browse/<path>; document title shows "peek://<path>".
 *
 * Call this for in-place updates (e.g. selecting a file within the same dir).
 */
export function setPeekAddressBar(path: string, title?: string): void {
    try {
        const browseUrl = toBrowseUrl(path);
        const peekUri = toPeekUri(path);
        const pageTitle = buildTitle(path, title);

        window.history.replaceState(
            { peekPath: path },
            '',
            browseUrl
        );

        document.title = `${peekUri} – ${pageTitle} • Peek`;
        // document.title = `${peekUri} — Peek`;

        (window as Window & { __PEEK_CURRENT_PATH__?: string }).__PEEK_CURRENT_PATH__ = path;

        void pageTitle;
    } catch (err) {
        console.warn('[peek-uri] replaceState failed:', err);
    }
}

/**
 * Push a new History entry
 * Use this for explicit navigations
 */
export function pushPeekAddressBar(path: string, title?: string): void {
    try {
        const browseUrl = toBrowseUrl(path);
        const peekUri = toPeekUri(path);
        const pageTitle = buildTitle(path, title);

        window.history.pushState(
            { peekPath: path },
            '',
            browseUrl
        );

        document.title = `${peekUri} – ${pageTitle} • Peek`;

        // document.title = `${peekUri} — Peek`;
        (window as Window & { __PEEK_CURRENT_PATH__?: string }).__PEEK_CURRENT_PATH__ = path;

        void pageTitle;
    } catch (err) {
        console.warn('[peek-uri] pushState failed:', err);
    }
}

/**
 * Returns the peek:// URI for the current UI state — useful for a
 * "Copy peek link" button.
 */
export function currentPeekUri(): string {
    const path = (window as Window & { __PEEK_CURRENT_PATH__?: string }).__PEEK_CURRENT_PATH__ ?? '/';
    return toPeekUri(path);
}

/**
 * Read the filesystem path that should be loaded on startup.
 *
 * Priority order:
 *   1. History state (browser back/forward restored)
 *   2. /browse/<path> in the address bar (bookmarked link)
 *   3. window.__PEEK_INITIAL_PATH__ injected by the Rust server
 *   4. '/' as a safe default
 */
export function getCurrentPeekPath(): string {
    // 1. Restored from popstate
    const state = window.history.state as { peekPath?: string } | null;
    if (state?.peekPath) return state.peekPath;

    // 2. /browse/<path> URL (bookmarked or shared)
    const fromBrowse = pathFromBrowseUrl();
    if (fromBrowse !== null) return fromBrowse;

    // 3. Server-injected initial path
    const injected = (window as Window & { __PEEK_INITIAL_PATH__?: string }).__PEEK_INITIAL_PATH__;
    if (injected) return injected;

    return '/';
}
