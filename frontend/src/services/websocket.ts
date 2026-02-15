import { useFileBrowserStore } from '@/store/filebrowser-store';
import { apiService } from './api';

// ─────────────────────────────────────────────────────────────────────────────
// Message types 
// ─────────────────────────────────────────────────────────────────────────────

export type WsMessage =
    | { type: 'navigate';      path: string }
    | { type: 'watch_started'; path: string }
    | { type: 'file_added';    path: string }
    | { type: 'file_removed';  path: string }
    | { type: 'file_modified'; path: string }
    | { type: 'file_changed';  path: string }   
    | { type: 'pong' };

type Subscriber = (msg: WsMessage) => void;
type Unsubscribe = () => void;

// ─────────────────────────────────────────────────────────────────────────────

class PeekWebSocket {
    private ws:              WebSocket | null = null;
    private reconnectTimer:  ReturnType<typeof setTimeout> | null = null;
    private subscribers:     Set<Subscriber> = new Set();
    private url:             string;
    private intentionalClose = false;

    constructor(url: string) {
        this.url = url;
    }

    // ── Lifecycle

    connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        this.intentionalClose = false;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.debug('[peek ws] connected');
            // Tell the server which directory to watch for file-system events
            const { currentPath } = useFileBrowserStore.getState();
            this.send({ type: 'watch', path: currentPath });
        };

        this.ws.onmessage = (event) => {
            let msg: WsMessage;
            try {
                msg = JSON.parse(event.data as string);
            } catch {
                return;
            }
            this.dispatch(msg);
        };

        this.ws.onclose = () => {
            if (this.intentionalClose) return;
            console.debug('[peek ws] closed — reconnecting in 3 s');
            this.reconnectTimer = setTimeout(() => this.connect(), 3_000);
        };

        this.ws.onerror = () => {
            // onclose fires immediately after onerror — reconnect handled there
            this.ws?.close();
        };
    }

    disconnect(): void {
        this.intentionalClose = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.ws?.close();
        this.ws = null;
    }

    send(data: object): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    /** Tell the server to start watching a new path (call after navigation). */
    watch(path: string): void {
        this.send({ type: 'watch', path });
    }

    // ── Pub / sub ─────────────────────────────────────────────────────────────

    /**
     * Subscribe to incoming WS messages.
     * Returns an unsubscribe function — call it in the useEffect cleanup.
     *
     * @example
     * const unsub = ws.subscribe(msg => { ... });
     * return () => unsub();
     */
    subscribe(fn: Subscriber): Unsubscribe {
        this.subscribers.add(fn);
        return () => this.subscribers.delete(fn);
    }

    // ── Internal 

    private dispatch(msg: WsMessage): void {
        // 1. Built-in handler for store-level events (navigate)
        this.handleStoreEvents(msg);

        // 2. Notify all external subscribers (e.g. MainContent)
        this.subscribers.forEach((fn) => fn(msg));
    }

    /** Events that update Zustand store directly — no component needed. */
    private handleStoreEvents(msg: WsMessage): void {
        const store = useFileBrowserStore.getState();

        switch (msg.type) {
            case 'navigate':
                // Second `peek <path>` was run — redirect the open tab
                store.navigate(msg.path);
                break;

            case 'watch_started':
                console.debug('[peek ws] watching', msg.path);
                break;

            case 'pong':
                break;

            // file_* events are handled by component subscribers
            // so we do nothing 
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton
// ─────────────────────────────────────────────────────────────────────────────

let _socket: PeekWebSocket | null = null;

export function getWebSocket(): PeekWebSocket {
    if (!_socket) {
        _socket = new PeekWebSocket(apiService.getWebSocketUrl());
    }
    return _socket;
}