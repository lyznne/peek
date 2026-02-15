import { apiService } from "@/services/api";

declare global {
    interface Window {
        __PEEK_INITIAL_PATH__?: string;
    }
}

export async function resolveInitialPath(): Promise<string> {
    const params = new URLSearchParams(window.location.search);
    const qsPath = params.get("path");
    if (qsPath) return qsPath;

    if (window.__PEEK_INITIAL_PATH__) return window.__PEEK_INITIAL_PATH__;


    try {
        return await apiService.getInitialPath();
    } catch {
        return "/"
    }

}

export function resolveInitialFile(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get("file");
}
