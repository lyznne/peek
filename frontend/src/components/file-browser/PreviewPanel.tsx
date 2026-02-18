import { useState, useEffect, Suspense, lazy } from 'react';
import {
    Copy,
    Share2,
    Download,
    Trash2,
    Folder,
    Image as ImageIcon,
    Clock,
    HardDrive,
    Hash,
    FolderPlus,
    Upload,
    Loader2,
    Maximize2,
    Eye,
    FileCode,
    BookOpen,
} from 'lucide-react';
import { useFileBrowserStore } from '@/store/filebrowser-store';
import { apiService } from '@/services/api';
import { formatFileSize, formatDate, getFileIcon, getFileTypeLabel, getFileTypeColor, isPreviewable } from '@/lib/file-utils';
import { cn, initHighlighter } from '@/lib/utils';
import { toast } from 'sonner';
import type { PreviewResponse } from '@/types/file-browser';
import { marked } from 'marked';

interface ExtendedPreviewResponse extends PreviewResponse {
    truncated: boolean;
}

const DocumentViewer = lazy(() => import('./DocumentViewer').then(module => ({ default: module.DocumentViewer })));

// ─────────────────────────────────────────────────────────────────────────────
// CodePreview
// ─────────────────────────────────────────────────────────────────────────────
export const CodePreview = ({ code, language, lines }: { code: string; language?: string; lines?: number }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [highlightedCode, setHighlightedCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const highlightCode = async () => {
            try {
                const hl = await initHighlighter();
                const lang = language || 'text';
                const html = hl.codeToHtml(code, { lang, theme: 'github-dark' });
                setHighlightedCode(html);
            } catch (error) {
                console.error('Error highlighting code:', error);
                setHighlightedCode(`<pre><code>${escapeHtml(code)}</code></pre>`);
            } finally {
                setIsLoading(false);
            }
        };
        highlightCode();
    }, [code, language]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setIsCopied(true);
        toast.success('Code copied to clipboard');
        setTimeout(() => setIsCopied(false), 2000);
    };

    const escapeHtml = (text: string) =>
        text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    return (
        <div className="relative">
            <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                <button
                    onClick={handleCopy}
                    className="px-2 py-1 text-xs bg-secondary/80 backdrop-blur-sm rounded border border-border hover:bg-secondary transition-colors"
                >
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
                {lines && (
                    <span className="px-2 py-1 text-xs bg-secondary/80 backdrop-blur-sm rounded border border-border">
                        {lines} lines
                    </span>
                )}
                {language && (
                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded border border-primary/20">
                        {language}
                    </span>
                )}
            </div>

            {isLoading ? (
                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words bg-secondary rounded p-3">
                    {code}
                </pre>
            ) : (
                <div
                    className="shiki-code-block"
                    dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    style={{
                        margin: 0,
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'transparent',
                        overflowX: 'auto',
                    }}
                />
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ShikiCodeBlock
// ─────────────────────────────────────────────────────────────────────────────
const ShikiCodeBlock = ({ code, language }: { code: string; language?: string }) => {
    const [highlightedCode, setHighlightedCode] = useState<string>('<code>Loading...</code>');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const highlight = async () => {
            try {
                const hl = await initHighlighter();
                const lang = language || 'text';
                const html = hl.codeToHtml(code, { lang, theme: 'github-dark' });
                if (mounted) { setHighlightedCode(html); setIsLoading(false); }
            } catch (err) {
                console.error('Shiki highlight failed:', err);
                if (mounted) { setHighlightedCode(`<pre><code>${code}</code></pre>`); setIsLoading(false); }
            }
        };
        highlight();
        return () => { mounted = false; };
    }, [code, language]);

    if (isLoading) {
        return (
            <pre className="bg-secondary p-4 rounded-lg overflow-x-auto">
                <code className="text-sm">{code}</code>
            </pre>
        );
    }

    return (
        <div
            className="my-4 rounded-lg overflow-hidden"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MarkdownPreview
// ─────────────────────────────────────────────────────────────────────────────
export const MarkdownPreview = ({ content }: { content: string }) => {
    const [html, setHtml] = useState<string>('');

    useEffect(() => {
        let mounted = true;
        const renderMarkdown = async () => {
            const renderer = new marked.Renderer();
            renderer.code = function ({ text, lang }: { text: string; lang?: string; escaped?: boolean }) {
                const id = `shiki-${Math.random().toString(36).substr(2, 9)}`;
                return `<div id="${id}" data-code="${encodeURIComponent(text)}" data-lang="${lang || ''}"></div>`;
            };
            marked.setOptions({ renderer });
            try {
                const rawHtml = await marked.parse(content, { async: false });
                if (!mounted) return;
                setHtml(rawHtml);
            } catch (err) {
                console.error('Markdown parsing failed:', err);
                if (mounted) setHtml('<p>Error rendering markdown</p>');
            }
        };
        renderMarkdown();
        return () => { mounted = false; };
    }, [content]);

    if (!html) {
        return (
            <div className="animate-pulse space-y-3">
                <div className="h-4 bg-secondary rounded w-full" />
                <div className="h-4 bg-secondary rounded w-5/6" />
                <div className="h-4 bg-secondary rounded w-4/6" />
            </div>
        );
    }

    const processNode = (node: ChildNode): React.ReactNode => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (el.id?.startsWith('shiki-')) {
                const code = decodeURIComponent(el.getAttribute('data-code') || '');
                const lang = el.getAttribute('data-lang') || undefined;
                return <ShikiCodeBlock key={el.id} code={code} language={lang} />;
            }
            if (node.childNodes.length > 0) {
                return (
                    <div key={Math.random()}>
                        {Array.from(node.childNodes).map(child => processNode(child))}
                    </div>
                );
            }
        }
        if (node.nodeType === Node.TEXT_NODE) return node.textContent;
        return null;
    };

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const children = Array.from(tempDiv.childNodes).map(processNode);

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            {children}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Archive/binary MIME types
// ─────────────────────────────────────────────────────────────────────────────
const ARCHIVE_MIMES = [
    // Archives
    'application/zip',
    'application/x-zip',
    'application/x-rar',
    'application/x-rar-compressed',
    'application/x-tar',
    'application/x-7z-compressed',
    'application/x-bzip',
    'application/x-bzip2',
    'application/x-gzip',
    'application/gzip',
    'application/x-xz',

    // Office OpenXML (docx, xlsx, pptx)
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.wordprocessingml.template', // .dotx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',       // .xlsx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.template',    // .xltx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.openxmlformats-officedocument.presentationml.template',   // .potx

    // Legacy Microsoft Office
    'application/msword',                      // .doc
    'application/vnd.ms-excel',                // .xls
    'application/vnd.ms-powerpoint',           // .ppt

    // Binaries
    'application/octet-stream',
    'application/x-msdownload', // .exe
    'application/x-elf',        // Linux binaries
];

function isArchiveOrBinary(mime: string): boolean {
    return (
        ARCHIVE_MIMES.some(m => mime.startsWith(m)) ||
        /\/(zip|x-rar|x-tar|x-7z|bzip|gzip|x-xz|msword|excel|powerpoint|officedocument)/.test(mime)
    );
}


// ─────────────────────────────────────────────────────────────────────────────
// NoSelection
// ─────────────────────────────────────────────────────────────────────────────
const NoSelection = () => {
    const { currentPath, items } = useFileBrowserStore();
    const folders = items.filter(i => i.is_dir);
    const files = items.filter(i => !i.is_dir);
    const totalSize = items.reduce((sum, item) => sum + item.size, 0);

    const handleNewFolder = async () => {
        const name = prompt('Enter folder name:');
        if (name) {
            try {
                toast.success(`Folder "${name}" created`);
            } catch (err) {
                toast.error('Failed to create folder');
            }
        }
    };

    const handleUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files) toast.info(`Uploading ${files.length} file(s)...`);
        };
        input.click();
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-panel-border">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-folder flex items-center justify-center">
                        <Folder className="w-6 h-6 text-folder-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                            {currentPath === '/' ? 'Home' : currentPath.split('/').pop()}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{currentPath}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary rounded-lg p-3">
                        <p className="text-2xl font-bold text-foreground">{folders.length}</p>
                        <p className="text-xs text-muted-foreground">Folders</p>
                    </div>
                    <div className="bg-secondary rounded-lg p-3">
                        <p className="text-2xl font-bold text-foreground">{files.length}</p>
                        <p className="text-xs text-muted-foreground">Files</p>
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <HardDrive className="w-4 h-4" />
                    <span>Total: {formatFileSize(totalSize)}</span>
                </div>
            </div>
            <div className="p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Quick Actions
                </h4>
                <div className="space-y-2">
                    <button disabled onClick={handleNewFolder} className="action-button action-button-secondary w-full justify-start">
                        <FolderPlus className="w-4 h-4" /> New Folder
                    </button>
                    <button disabled onClick={handleUpload} className="action-button action-button-secondary w-full justify-start">
                        <Upload className="w-4 h-4" /> Upload Files
                    </button>
                </div>
            </div>
            <div className="flex-1" />
            <div className="p-4 text-center text-sm text-muted-foreground">
                Select a file or folder to see details
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// FolderDetails — unchanged
// ─────────────────────────────────────────────────────────────────────────────
const FolderDetails = () => {
    const { selectedItem } = useFileBrowserStore();
    const [folderInfo, setFolderInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedItem || !selectedItem.is_dir) return;
        const fetchFolderInfo = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const info = await apiService.getInfo(selectedItem.path);
                setFolderInfo(info);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load folder info');
                console.error('Error fetching folder info:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFolderInfo();
    }, [selectedItem]);

    if (!selectedItem || !selectedItem.is_dir) return null;

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-panel-border">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-folder flex items-center justify-center">
                        <Folder className="w-8 h-8 text-folder-foreground fill-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-lg truncate">{selectedItem.name}</h3>
                        <p className="text-sm text-muted-foreground">Folder</p>
                    </div>
                </div>
                <div className="space-y-2 text-sm">
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-muted-foreground">Loading info...</span>
                        </div>
                    ) : error ? (
                        <div className="text-destructive text-sm">{error}</div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Hash className="w-4 h-4" />
                                <span>{folderInfo?.children_count || 0} item{folderInfo?.children_count !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <HardDrive className="w-4 h-4" />
                                <span>{formatFileSize(folderInfo?.total_size || 0)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>Modified {formatDate(selectedItem.modified)}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="p-4 border-b border-panel-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Path</h4>
                <p className="text-sm text-foreground font-mono bg-secondary rounded-lg p-2 break-all">
                    {selectedItem.path}
                </p>
            </div>
            <div className="p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Actions</h4>
                <div className="space-y-2">
                    <button
                        onClick={() => { navigator.clipboard.writeText(selectedItem.path); toast.success('Path copied to clipboard'); }}
                        className="action-button action-button-secondary w-full justify-start"
                    >
                        <Copy className="w-4 h-4" /> Copy Path
                    </button>
                    <button className="action-button action-button-danger w-full justify-start">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// FileDetails
// ─────────────────────────────────────────────────────────────────────────────
const FileDetails = () => {
    const { selectedItem } = useFileBrowserStore();
    const [preview, setPreview] = useState<ExtendedPreviewResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDocumentViewer, setShowDocumentViewer] = useState(false);

    useEffect(() => {
        if (!selectedItem || selectedItem.is_dir) return;

        const fetchPreview = async () => {
            if (!isPreviewable(selectedItem)) {
                setPreview({
                    type: 'unsupported',
                    truncated: false,
                    name: selectedItem.name,
                    path: selectedItem.path,
                    size: selectedItem.size,
                    mime_type: selectedItem.mime_type || 'application/octet-stream',
                    modified: selectedItem.modified,
                    content: undefined,
                    thumbnail: undefined,
                    is_text: false,
                    is_image: false,
                    is_code: false,
                });
                return;
            }
            try {
                setIsLoading(true);
                setError(null);
                const previewData = await apiService.preview(selectedItem.path);
                setPreview({ ...previewData, truncated: previewData.truncated ?? false });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load preview');
                console.error('Error fetching preview:', err);
                setPreview({
                    type: 'error',
                    truncated: false,
                    name: selectedItem.name,
                    path: selectedItem.path,
                    size: selectedItem.size,
                    mime_type: selectedItem.mime_type || 'application/octet-stream',
                    modified: selectedItem.modified,
                    content: undefined,
                    thumbnail: undefined,
                    is_text: false,
                    is_image: false,
                    is_code: false,
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchPreview();
    }, [selectedItem]);

    if (!selectedItem || selectedItem.is_dir) return null;

    const Icon = getFileIcon(selectedItem);
    const typeColor = getFileTypeColor(selectedItem);
    const canPreview = isPreviewable(selectedItem);
    const hasContent = preview?.content && preview.content.length > 0;
    const isCodeFile = preview?.is_code || false;
    const isMarkdown = preview?.language === 'markdown' || preview?.mime_type?.includes('markdown');
    const isImage = preview?.is_image || preview?.mime_type?.includes('image');
    const mime = preview?.mime_type || selectedItem.mime_type || '';

    // Disable Open for archive/binary types only
    const openDisabled = isArchiveOrBinary(mime);

    const handleDownload = () => window.open(apiService.getDownloadUrl(selectedItem.path), '_blank');
    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete "${selectedItem.name}"?`)) {
            try {
                toast.success('File deleted successfully');
            } catch (err) {
                toast.error('Failed to delete file');
            }
        }
    };

    const renderPreviewContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-destructive text-sm p-3 bg-destructive/10 rounded-lg">{error}</div>
            );
        }

        if (!preview || !hasContent) {
            return (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    No preview available
                </div>
            );
        }

        if (isMarkdown && preview.content) {
            return <MarkdownPreview content={preview.content} />;
        }

        if (isCodeFile && preview.content) {
            return (
                <CodePreview
                    code={preview.content}
                    language={preview.language}
                    lines={preview.lines}
                />
            );
        }

        // Image 
        if (isImage && preview.thumbnail) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-black/5">
                        <img
                            src={preview.thumbnail}
                            alt={selectedItem.name}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-sm">Image preview</span>
                    </div>
                </div>
            );
        }

        if (preview.is_text && preview.content) {
            return (
                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words bg-secondary rounded p-3">
                    {preview.content}
                </pre>
            );
        }

        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Preview not available for this file type
            </div>
        );
    };

    return (
        <>
            <div className="h-full flex flex-col overflow-hidden">
                {/* File Header */}
                <div className="p-4 border-b border-panel-border flex-shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={cn('w-14 h-14 rounded-xl bg-secondary flex items-center justify-center', typeColor)}>
                            <Icon className="w-8 h-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-lg truncate">{selectedItem.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{getFileTypeLabel(selectedItem)}</span>
                                <span>•</span>
                                <span>{formatFileSize(selectedItem.size)}</span>
                                {isCodeFile && (<><span>•</span><FileCode className="w-3 h-3" /><span>Code</span></>)}
                                {isMarkdown && (<><span>•</span><BookOpen className="w-3 h-3" /><span>Markdown</span></>)}
                                {preview?.lines && (<><span>•</span><span>{preview.lines} lines</span></>)}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <HardDrive className="w-4 h-4" />
                            <span>{formatFileSize(selectedItem.size)}</span>
                            {preview?.mime_type && (
                                <span className="text-xs bg-secondary px-2 py-1 rounded">
                                    {preview.mime_type.split(';')[0]}
                                </span>
                            )}
                            {preview?.encoding && (
                                <span className="text-xs bg-secondary px-2 py-1 rounded">{preview.encoding}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Modified {formatDate(selectedItem.modified)}</span>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                {canPreview && (
                    <div className="flex-1 p-4 border-b border-panel-border overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Preview
                            </h4>
                            <div className="flex items-center gap-2">
                                {preview?.truncated && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span>Truncated</span>
                                        <span>•</span>
                                        <span>{formatFileSize(preview.size)}</span>
                                    </span>
                                )}
                                <button
                                    onClick={() => setShowDocumentViewer(true)}
                                    className="p-1 hover:bg-secondary rounded"
                                    title="Fullscreen preview"
                                >
                                    <Maximize2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div className="bg-secondary rounded-lg p-3 h-[calc(100%-24px)] overflow-auto scrollbar-thin">
                            {renderPreviewContent()}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="p-4 flex-shrink-0">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Actions
                    </h4>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <button
                            onClick={() => { navigator.clipboard.writeText(selectedItem.path); toast.success('Path copied to clipboard'); }}
                            className="action-button action-button-secondary text-xs"
                        >
                            <Copy className="w-4 h-4" /> Copy Path
                        </button>
                        <button
                            onClick={() => {
                                const shareableUrl = window.location.origin + apiService.getDownloadUrl(selectedItem.path);
                                navigator.clipboard.writeText(shareableUrl);
                                toast.success('Shareable link copied to clipboard');
                            }}
                            className="action-button action-button-secondary text-xs"
                        >
                            <Share2 className="w-4 h-4" /> Share Link
                        </button>
                        <button
                            onClick={handleDownload}
                            className="action-button action-button-primary text-xs"
                        >
                            <Download className="w-4 h-4" /> Download
                        </button>
                        {/* Open  */}
                        <button
                            onClick={() => setShowDocumentViewer(true)}
                            disabled={openDisabled}
                            title={openDisabled ? 'Cannot open this file type in the viewer' : 'Open in viewer'}
                            className={cn(
                                'action-button text-xs',
                                openDisabled
                                    ? 'action-button-secondary opacity-40 cursor-not-allowed'
                                    : 'action-button-primary'
                            )}
                        >
                            <Eye className="w-4 h-4" /> Open
                        </button>
                    </div>
                    <button
                    disabled
                    onClick={handleDelete} className="action-button action-button-danger w-full text-xs opacity-40">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>

            {/* Document Viewer Modal */}
            {showDocumentViewer && selectedItem && (
                <Suspense fallback={
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                }>
                    <DocumentViewer
                        path={selectedItem.path}
                        name={selectedItem.name}
                        mimeType={preview?.mime_type || selectedItem.mime_type || ''}
                        language={preview?.language}
                        onClose={() => setShowDocumentViewer(false)}
                    />
                </Suspense>
            )}
        </>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// PreviewPanel
// ─────────────────────────────────────────────────────────────────────────────
export const PreviewPanel = () => {
    const { selectedItem } = useFileBrowserStore();
    return (
        <aside className="w-72 xl:w-80 h-full bg-panel border-l border-panel-border overflow-y-auto scrollbar-thin hidden lg:block">
            {!selectedItem && <NoSelection />}
            {selectedItem?.is_dir && <FolderDetails />}
            {selectedItem && !selectedItem.is_dir && <FileDetails />}
        </aside>
    );
};
