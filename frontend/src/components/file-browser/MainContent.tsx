import { useEffect, useCallback } from 'react';
import { FolderGrid } from './FolderGrid';
import { FileList }   from './FileList';
import { FileGrid }   from './FileGrid';
import { useFileBrowserStore } from '@/store/filebrowser-store';
import { Loader2, FolderOpen }  from 'lucide-react';
import { apiService }   from '@/services/api';
import { getWebSocket } from '@/services/websocket';
import type { WsMessage } from '@/services/websocket';

export const MainContent = () => {
    const {
        items,
        isLoading,
        error,
        viewMode,
        searchQuery,
        currentPath,
        showHidden,
        setItems,
        setError,
        setIsLoading,
        setIsSearching,
    } = useFileBrowserStore();

    // ── Fetch directory / search results ─────────────────────────────────────

    const fetchCurrent = useCallback(async () => {
        setIsLoading(true);
        try {
            if (searchQuery.trim()) {
                setIsSearching(true);
                const res = await apiService.search(searchQuery, currentPath);
                setItems(res.matches ?? []);
            } else {
                const res = await apiService.browse(currentPath, showHidden);
                setItems(res.items ?? []);
            }
            setError(null);
        } catch (err: any) {
            setError(err.message ?? 'Failed to load files');
        } finally {
            setIsSearching(false);
            setIsLoading(false);
        }
    }, [currentPath, searchQuery, showHidden, setItems, setError, setIsLoading, setIsSearching]);

    // Re-fetch whenever path, search query, or hidden-files toggle changes
    useEffect(() => {
        fetchCurrent();
    }, [fetchCurrent]);

    // ── WebSocket — real-time file system updates ─────────────────────────────

    useEffect(() => {
        const ws = getWebSocket();
        ws.connect();

        // Tell the server which path to watch whenever we navigate
        ws.watch(currentPath);

        const unsub = ws.subscribe((msg: WsMessage) => {
            if (msg.type === 'pong' || msg.type === 'watch_started' || msg.type === 'navigate') {
                return; // handled elsewhere
            }

            // ── File system change events ─────────────────────────────────────
          
            const changedPath = (msg as any).path as string | undefined;
            if (changedPath && !changedPath.startsWith(currentPath)) return;

            switch (msg.type) {
                case 'file_added':
                case 'file_removed':
                case 'file_modified':
                case 'file_changed':   // legacy alias from older backend versions
                    fetchCurrent();
                    break;
            }
        });

        return () => {
            unsub();
            // Do NOT call ws.disconnect() here — the socket is a singleton
            // shared across components; disconnecting here would break other
            // subscribers (e.g. the navigate handler in App.tsx).
        };
    }, [currentPath, fetchCurrent]);

    // ── Derived lists ─────────────────────────────────────────────────────────

    const folders = items.filter(i =>  i.is_dir);
    const files   = items.filter(i => !i.is_dir);

    // Client-side filter for the search box (instant, no extra API call)
    const filteredFolders = searchQuery
        ? folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : folders;

    const filteredFiles = searchQuery
        ? files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : files;

    const hasResults = filteredFolders.length > 0 || filteredFiles.length > 0;

    // ── Render ────────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm">Loading files…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-destructive">
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={fetchCurrent}
                        className="action-button action-button-secondary"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!hasResults) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <FolderOpen className="w-16 h-16 opacity-50" />
                    <div className="text-center">
                        <p className="text-lg font-medium text-foreground">
                            {searchQuery ? 'No results found' : 'This folder is empty'}
                        </p>
                        <p className="text-sm mt-1">
                            {searchQuery
                                ? `No files or folders match "${searchQuery}"`
                                : 'Drop files here or create a new folder'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <div className="animate-fade-in">
                {filteredFolders.length > 0 && <FolderGrid />}
                {filteredFiles.length > 0 && (
                    viewMode === 'list' ? <FileList /> : <FileGrid />
                )}
            </div>
        </main>
    );
};
