import type { BrowseResponse, FileInfo, PreviewResponse, SearchResponse } from "@/types/file-browser";
import axios, { AxiosError, type AxiosInstance } from 'axios';

const API_BASE = "/api";



class ApiService {
    private api: AxiosInstance;
    readonly baseURL: string;

    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL ?? '';

        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 30_000,
            headers: { 'Content-Type': 'application/json' },
        });

        this.api.interceptors.response.use(
            (res) => res,
            (err: AxiosError) => {
                const msg =
                    (err.response?.data as any)?.error ??
                    err.message ??
                    'Unknown API error';
                console.error(`[peek api] ${err.config?.url} →`, msg);
                return Promise.reject(new Error(msg));
            },
        );
    }

    // ── File system

    async browse(path: string, showHidden = false): Promise<BrowseResponse> {
        const { data } = await this.api.get<BrowseResponse>(`${API_BASE}/browse`, {
            params: { path, show_hidden: showHidden },
        });
        return data;
    }

    async preview(path: string): Promise<PreviewResponse> {
        const { data } = await this.api.get<PreviewResponse>(`${API_BASE}/preview`, {
            params: { path },
        });
        return data;
    }

    async search(
        query: string,
        path = '/',
        maxResults = 100,
    ): Promise<SearchResponse> {
        const { data } = await this.api.get<SearchResponse>(`${API_BASE}/search`, {
            params: { query, path, max_results: maxResults },
        });
        return data;
    }

    async getInfo(path: string): Promise<FileInfo> {
        const { data } = await this.api.get<FileInfo>(`${API_BASE}/info`, {
            params: { path },
        });
        return data;
    }

    /** Returns the path the server was started with (used on first load). */
    async getInitialPath(): Promise<string> {
        const { data } = await this.api.get<{ path: string }>(
            `${API_BASE}/initial-path`,
        );
        return data.path ?? '/';
    }

    /**
     * Tell the running daemon to navigate all open tabs to a new path.
     * Called by a second `peek <path>` invocation via the protocol handler.
     */
    async navigate(path: string): Promise<void> {
        await this.api.post(`${API_BASE}/navigate`, { path });
    }

    // ── URL builders

    /** Direct download (triggers browser save dialog). */
    getDownloadUrl(path: string): string {
        return `${this.baseURL}${API_BASE}/download?path=${encodeURIComponent(path)}`;
    }

    getViewUrl(path: string): string {
        return `${this.baseURL}${API_BASE}/view?path=${encodeURIComponent(path)}`;
    }

    /**
     * file:// URL for --no-server / system-default open.
     * Not used for HTTP fetches — only for  window.open() or open::that().
     */
    getFileUrl(path: string): string {
        const isWindows = navigator.platform.toLowerCase().includes('win');
        if (isWindows) {
            return `file:///${path.replace(/\\/g, '/')}`;
        }
        return `file://${path}`;
    }

    /** WebSocket endpoint derived from current page origin. */
    getWebSocketUrl(): string {
        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host =
            this.baseURL.replace(/^https?:\/\//, '') || window.location.host;
        return `${proto}//${host}/ws`;
    }
}

export const apiService = new ApiService();
