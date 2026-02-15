import { useState, useEffect, useCallback } from 'react';
import {
    X, Maximize2, Minimize2, Download, Printer, FileText,
    ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, ExternalLink, Loader2
} from 'lucide-react';
import { apiService } from '@/services/api';
import { cn, printDocument } from '@/lib/utils';
import { toast } from 'sonner';
import { CodePreview, MarkdownPreview } from './PreviewPanel';

interface DocumentViewerProps {
    path: string;
    name: string;
    mimeType: string;
    language?: string;
    onClose: () => void;
}

// ─── Content state machine ────────────────────────────────────────────────────
type ContentState =
    | { kind: 'loading' }
    | { kind: 'error'; message: string }
    | { kind: 'blob'; url: string; mime: string }   // PDF / image / video / audio
    | { kind: 'code'; text: string; language?: string; lines: number }
    | { kind: 'markdown'; text: string }
    | { kind: 'text'; text: string }
    | { kind: 'unsupported' };

// ─── MIME helpers ─────────────────────────────────────────────────────────────
const isBlobType = (mime: string) =>
    mime.includes('pdf') ||
    mime.includes('image/') ||
    mime.includes('video/') ||
    mime.includes('audio/');

const isMarkdownType = (mime: string, name: string) =>
    mime.includes('markdown') || name.endsWith('.md') || name.endsWith('.mdx');

const isCodeMime = (mime: string) =>
    mime.includes('javascript') ||
    mime.includes('typescript') ||
    mime.includes('json') ||
    mime.includes('xml') ||
    mime.includes('yaml') ||
    mime.includes('toml') ||
    mime.includes('x-sh') ||
    mime.includes('x-python') ||
    mime.includes('x-rust') ||
    mime.includes('html') ||
    mime.includes('css');

const isTextType = (mime: string) =>
    mime.includes('text/') ||
    mime.includes('json') ||
    mime.includes('xml') ||
    mime.includes('csv');

// Derive language from file extension (fallback when MIME is generic text/plain)
function langFromName(name: string): string | undefined {
    const ext = name.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
        js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
        py: 'python', rs: 'rust', go: 'go', java: 'java', c: 'c',
        cpp: 'cpp', cs: 'csharp', rb: 'ruby', php: 'php', swift: 'swift',
        kt: 'kotlin', sh: 'bash', bash: 'bash', zsh: 'bash',
        json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml',
        xml: 'xml', html: 'html', css: 'css', scss: 'scss',
        sql: 'sql', graphql: 'graphql', vue: 'vue', svelte: 'svelte',
        lua: 'lua', r: 'r', dart: 'dart', ex: 'elixir', exs: 'elixir',
    };
    return ext ? map[ext] : undefined;
}

// ─────────────────────────────────────────────────────────────────────────────

export const DocumentViewer = ({
    path, name, mimeType, language: langProp, onClose
}: DocumentViewerProps) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [contentState, setContentState] = useState<ContentState>({ kind: 'loading' });
    const [isPrinting, setIsPrinting] = useState(false);
    // ── Fetch and classify ────────────────────────────────────────────────────
    useEffect(() => {
        let aborted = false;
        let createdBlobUrl: string | null = null;

        setContentState({ kind: 'loading' });

        const load = async () => {
            try {
                const viewUrl = apiService.getViewUrl(path);
                const response = await fetch(viewUrl);

                if (!response.ok) {
                    throw new Error(`Server returned ${response.status} ${response.statusText}`);
                }
                if (aborted) return;

                // ── Binary / media — convert to blob URL ──────────────────
                if (isBlobType(mimeType)) {
                    const blob = await response.blob();
                    if (aborted) return;
                    createdBlobUrl = URL.createObjectURL(blob);
                    setContentState({ kind: 'blob', url: createdBlobUrl, mime: mimeType });
                    return;
                }

                // ── Text-based ────────────────────────────────────────────
                const text = await response.text();
                if (aborted) return;

                const lines = text.split('\n').length;

                if (isMarkdownType(mimeType, name)) {
                    setContentState({ kind: 'markdown', text });
                } else if (isCodeMime(mimeType)) {

                    const lang = langProp ?? langFromName(name);
                    setContentState({ kind: 'code', text, language: lang, lines });
                } else if (isTextType(mimeType)) {
                    // Generic text/plain — check extension to decide code vs plain
                    const lang = langProp ?? langFromName(name);
                    if (lang) {
                        setContentState({ kind: 'code', text, language: lang, lines });
                    } else {
                        setContentState({ kind: 'text', text });
                    }
                } else {
                    // Last resort
                    setContentState(text.length > 0 ? { kind: 'text', text } : { kind: 'unsupported' });
                }
            } catch (err) {
                if (!aborted) {
                    setContentState({
                        kind: 'error',
                        message: err instanceof Error ? err.message : 'Failed to load document',
                    });
                }
            }
        };

        load();

        return () => {
            aborted = true;
            if (createdBlobUrl) URL.revokeObjectURL(createdBlobUrl);
        };
    }, [path, mimeType, name, langProp]);

    // Cleanup blob URL when state changes
    useEffect(() => {
        return () => {
            if (contentState.kind === 'blob') URL.revokeObjectURL(contentState.url);
        };
    }, [contentState]);

    // ── Fullscreen ────────────────────────────────────────────────────────────
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(() => { });
            setIsFullscreen(false);
        }
    }, []);

    useEffect(() => {
        const handler = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    // ── Actions ───────────────────────────────────────────────────────────────
    const handleDownload = () => window.open(apiService.getDownloadUrl(path), '_blank');
    const handlePrint = async () => {
        if (isPrinting) return;
        setIsPrinting(true);

        try {
            switch (contentState.kind) {
                case 'blob':
                    // PDF or image — pass the blob URL directly
                    await printDocument(
                        { kind: 'blob', url: contentState.url, mime: contentState.mime },
                        name,
                    );
                    break;

                case 'markdown': {

                    const { marked } = await import('marked');
                    const html = await marked.parse(contentState.text);
                    await printDocument({ kind: 'html', html }, name);
                    break;
                }

                case 'code':
                    await printDocument(
                        { kind: 'code', text: contentState.text, language: contentState.language, filename: name },
                        name,
                    );
                    break;

                case 'text':
                    await printDocument({ kind: 'text', text: contentState.text }, name);
                    break;

                default:
                    break;
            }
        } catch (err) {
            console.error('Print failed:', err);
            toast.error('Failed to print document');
        } finally {
            setIsPrinting(false);
        }
    };
    const handleOpenExternal = () => {
        window.open(apiService.getFileUrl(path), '_blank');
        toast.info('Opening with system default application');
    };

    // ── Content rendering ─────────────────────────────────────────────────────
    const renderContent = () => {
        switch (contentState.kind) {
            case 'loading':
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-primary/60" />
                            <p className="text-muted-foreground text-sm">Loading document…</p>
                        </div>
                    </div>
                );

            case 'error':
                return (
                    <div className="flex items-center justify-center h-full p-8">
                        <div className="text-center max-w-sm">
                            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-destructive" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load</h3>
                            <p className="text-muted-foreground mb-4 text-sm">{contentState.message}</p>
                            <div className="flex gap-2 justify-center">
                                <button onClick={handleDownload} className="action-button action-button-primary">
                                    <Download className="w-4 h-4" /> Download
                                </button>
                                <button onClick={handleOpenExternal} className="action-button action-button-secondary">
                                    <ExternalLink className="w-4 h-4" /> Open Externally
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'blob': {
                const isPDF = contentState.mime.includes('pdf');
                const isImg = contentState.mime.includes('image/');
                const isVid = contentState.mime.includes('video/');
                const isAud = contentState.mime.includes('audio/');

                if (isPDF) {
                    return (
                        <iframe
                            src={contentState.url}
                            className="w-full h-full border-0"
                            title={name}
                        />
                    );
                }

                if (isImg) {
                    return (
                        <div
                            className="flex items-center justify-center h-full overflow-hidden"
                            style={{ backgroundImage: 'var(--checkerboard, repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 0 0 / 20px 20px)' }}
                        >
                            <img
                                src={contentState.url}
                                alt={name}
                                className="max-w-full max-h-full object-contain transition-transform duration-200"
                                style={{ transform: `rotate(${rotation}deg) scale(${zoom / 100})` }}
                            />
                        </div>
                    );
                }

                if (isVid) {
                    return (
                        <div className="flex items-center justify-center h-full bg-black">
                            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                            <video src={contentState.url} controls className="max-w-full max-h-full" />
                        </div>
                    );
                }

                if (isAud) {
                    return (
                        <div className="flex items-center justify-center h-full bg-background">
                            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                            <audio src={contentState.url} controls className="w-full max-w-lg" />
                        </div>
                    );
                }

                return null;
            }

            case 'markdown':
                // Wrap in bg-background so prose colours are correct in both light & dark
                return (
                    <div className="h-full overflow-auto bg-background">
                        <div className="max-w-4xl mx-auto p-6">
                            <MarkdownPreview content={contentState.text} />
                        </div>
                    </div>
                );

            case 'code':

                return (
                    <div className="h-full overflow-auto bg-background p-4">
                        <CodePreview
                            code={contentState.text}
                            language={contentState.language}
                            lines={contentState.lines}
                        />
                    </div>
                );

            case 'text':
                return (
                    <div className="h-full overflow-auto bg-background">
                        <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-words p-6 leading-relaxed min-h-full">
                            {contentState.text}
                        </pre>
                    </div>
                );

            case 'unsupported':
                return (
                    <div className="flex items-center justify-center h-full p-8 bg-background">
                        <div className="text-center">
                            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">{name}</h3>
                            <p className="text-muted-foreground mb-4 text-sm">
                                This file type cannot be previewed in the browser
                            </p>
                            <div className="flex gap-2 justify-center">
                                <button onClick={handleDownload} className="action-button action-button-primary">
                                    <Download className="w-4 h-4" /> Download
                                </button>
                                <button onClick={handleOpenExternal} className="action-button action-button-secondary">
                                    <ExternalLink className="w-4 h-4" /> Open Externally
                                </button>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    const isImageBlob = contentState.kind === 'blob' && contentState.mime.includes('image/');
    const isReady = contentState.kind !== 'loading' && contentState.kind !== 'error';

    return (
        <div className={cn(
            'fixed inset-0 z-50 flex flex-col bg-background',
            !isFullscreen && 'm-4 rounded-xl shadow-2xl border border-border'
        )}>
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                        <h2 className="font-semibold text-foreground truncate">{name}</h2>
                        <p className="text-xs text-muted-foreground truncate">{path}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-4">
                    {/* Zoom / rotate — only for inline images */}
                    {isImageBlob && (
                        <div className="flex items-center gap-1 border-r border-border pr-3 mr-2">
                            <button
                                onClick={() => setZoom(z => Math.max(25, z - 25))}
                                className="p-2 hover:bg-secondary rounded disabled:opacity-40"
                                disabled={zoom <= 25}
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium w-12 text-center tabular-nums">{zoom}%</span>
                            <button
                                onClick={() => setZoom(z => Math.min(400, z + 25))}
                                className="p-2 hover:bg-secondary rounded disabled:opacity-40"
                                disabled={zoom >= 400}
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setRotation(r => (r + 90) % 360)}
                                className="p-2 hover:bg-secondary rounded ml-1"
                            >
                                <RotateCw className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <button onClick={toggleFullscreen} className="p-2 hover:bg-secondary rounded" title="Toggle fullscreen">
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button onClick={handlePrint}
                        disabled={isPrinting}
                        className="p-2 hover:bg-secondary rounded disabled:opacity-50" title="Print">
                        {isPrinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                    </button>
                    <button onClick={handleOpenExternal} className="p-2 hover:bg-secondary rounded" title="Open with system app">
                        <ExternalLink className="w-4 h-4" />
                    </button>
                    <button onClick={handleDownload} className="p-2 hover:bg-secondary rounded" title="Download">
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-destructive/10 hover:text-destructive rounded ml-2"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-hidden">
                {renderContent()}
            </div>

            {/* ── Footer ── */}
            <div className="px-4 py-2 border-t border-border bg-card text-xs text-muted-foreground flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <span>{mimeType || 'unknown type'}</span>
                    {contentState.kind === 'code' && (
                        <><span>•</span><span>{contentState.lines} lines</span></>
                    )}
                    {isReady && (
                        <><span>•</span><span className="text-green-500 dark:text-green-400">Ready</span></>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1 hover:text-foreground" title="Previous file">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>1 of 1</span>
                    <button className="p-1 hover:text-foreground" title="Next file">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
