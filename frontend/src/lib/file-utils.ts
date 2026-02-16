import {
    Folder,
    File,
    FileText,
    FileCode,
    FileImage,
    FileVideo,
    FileAudio,
    FileArchive,
    FileSpreadsheet,
    FileType,
    FileJson,
    FileCog,
    type LucideIcon,
    AppWindow,
    Cpu,
    TerminalSquare
} from 'lucide-react';

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
};

export const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp*1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
};

export const getFileIcon = (item: { is_dir: boolean; extension?: string; mime_type?: string | null }): LucideIcon => {
    if (item.is_dir) return Folder;

    const ext = item.extension?.toLowerCase() ?? '';
    const mime = item.mime_type?.toLowerCase() ?? '';

    // Images
    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'bmp'].includes(ext || '')) {
        return FileImage;
    }

    // Videos
    if (mime.startsWith('video/') || ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'].includes(ext || '')) {
        return FileVideo;
    }

    // Audio
    if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext || '')) {
        return FileAudio;
    }

    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext || '')) {
        return FileArchive;
    }

    // Spreadsheets
    if (['xlsx', 'xls', 'csv', 'ods'].includes(ext || '')) {
        return FileSpreadsheet;
    }

    // JSON
    if (ext === 'json') {
        return FileJson;
    }

    // Code files
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'hpp', 'css', 'scss', 'less', 'html', 'xml', 'vue', 'svelte', 'php', 'sh', 'bash', 'zsh'].includes(ext || '')) {
        return FileCode;
    }

    // Config files
    if (['yml', 'yaml', 'toml', 'ini', 'env', 'config'].includes(ext || '') || item.extension?.startsWith('.')) {
        return FileCog;
    }

    // Documents
    if (['pdf', 'doc', 'docx', 'odt', 'rtf'].includes(ext || '')) {
        return FileType;
    }

    // Text files
    if (mime.startsWith('text/') || ['txt', 'md', 'markdown', 'log'].includes(ext || '')) {
        return FileText;
    }

    // exe files and batch
    // ── Executables / Binaries ────────────────────────────────────────────
    const executableExts = [
        // Windows
        'exe', 'msi', 'bat', 'cmd', 'ps1', 'vbs', 'jar', 'scr',
        // Linux / macOS / cross-platform
        'app', 'bin', 'run', 'out', 'elf', 'so', 'dylib', 'dll',
        // Scripts that behave like executables
        'sh', 'bash', 'zsh', 'fish', 'ksh', 'csh', 'py', 'rb', 'pl', 'php',
    ];

    if (executableExts.includes(ext)) {
        if (['exe', 'msi', 'bat', 'cmd', 'ps1', 'vbs', 'scr'].includes(ext)) {
            return AppWindow;
        }
        // Linux/macOS native binaries or shared libs
        if (['bin', 'out', 'elf', 'so', 'dylib', 'app'].includes(ext)) {
            return Cpu;
        }


        return TerminalSquare;
    }

    return File;
};

export const getFileTypeLabel = (item: { extension?: string; mime_type?: string | null }): string => {
    if (item.extension) {
        return item.extension.toUpperCase();
    }

    if (item.mime_type) {
        const parts = item.mime_type.split('/');
        return parts[1]?.toUpperCase() || parts[0]?.toUpperCase() || 'File';
    }

    return 'File';
};

export const getFileTypeColor = (item: { extension?: string; mime_type?: string | null }): string => {
    const ext = item.extension?.toLowerCase();
    const mime = item.mime_type?.toLowerCase() || '';

    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
        return 'text-pink-500';
    }

    if (mime.startsWith('video/') || ['mp4', 'avi', 'mkv', 'mov'].includes(ext || '')) {
        return 'text-purple-500';
    }

    if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac'].includes(ext || '')) {
        return 'text-orange-500';
    }

    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
        return 'text-amber-600';
    }

    if (['js', 'jsx', 'ts', 'tsx'].includes(ext || '')) {
        return 'text-yellow-500';
    }

    if (['py'].includes(ext || '')) {
        return 'text-blue-500';
    }

    if (['rs'].includes(ext || '')) {
        return 'text-orange-600';
    }

    if (['json'].includes(ext || '')) {
        return 'text-green-500';
    }

    if (['md', 'markdown'].includes(ext || '')) {
        return 'text-cyan-500';
    }

    if (['pdf'].includes(ext || '')) {
        return 'text-red-500';
    }

    return 'text-muted-foreground';
};

export const isPreviewable = (item: { extension?: string; mime_type?: string | null }): boolean => {
    const ext = item.extension?.toLowerCase();
    const mime = item.mime_type?.toLowerCase() || '';

    // Text-based files
    if (mime.startsWith('text/')) return true;

    // Common previewable extensions
    const previewableExts = [
        'txt', 'md', 'markdown', 'json', 'xml', 'html', 'css', 'js', 'jsx',
        'ts', 'tsx', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'hpp',
        'yml', 'yaml', 'toml', 'ini', 'sh', 'bash', 'zsh', 'log', 'env',
        'vue', 'svelte', 'php', 'sql'
    ];

    if (previewableExts.includes(ext || '')) return true;

    // Images
    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
        return true;
    }

    return false;
};

export const getPathSegments = (path: string): { name: string; path: string }[] => {
    if (!path || path === '/') return [{ name: 'Home', path: '/' }];

    const segments = path.split('/').filter(Boolean);
    const result = [{ name: 'Home', path: '/' }];

    let currentPath = '';
    for (const segment of segments) {
        currentPath += '/' + segment;
        result.push({ name: segment, path: currentPath });
    }

    return result;
};
