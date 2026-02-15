export interface FileItem {
    name: string;
    path: string;
    is_dir: boolean;
    size: number;
    modified: number;
    mime_type: string | null;
    extension?: string;
    children_count?: number;
}

export interface BrowseResponse {
    current_path: string;
    items: FileItem[];
    total_size: number;
    total_items: number;
    can_navigate_up: boolean;
}
export interface PreviewResponse {
    type: string;
    truncated: boolean | undefined;
    name: string;
    path: string;
    size: number;
    mime_type: string;
    modified: number;
    content?: string;
    thumbnail?: string;
    is_text: boolean;
    is_image: boolean;
    is_code: boolean;

    language?: string;
    lines?: number;
    encoding?: string;
}

export interface FilePreview {
    path: string;
    name: string;
    mime_type: string;
    size: number;
    modified: number;
    content?: string;
    thumbnail?: string;
}

export interface SearchResponse {
    items: FileItem[];
    query: string;
    total: number;
}


export interface FileInfo {
    name: string;
    path: string;
    size: number;
    modified: number;
    created?: number;
    mime_type?: string;
    permissions?: string;
    is_dir: boolean;
}

export type ViewMode = 'grid' | 'list';
export type ThemeMode = 'light' | 'dark';
export type SortField = 'name' | 'modified' | 'size' | 'type';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

export interface AppSettings {
    serverUrl: string;
    itemsPerPage: number;
    showHiddenFiles: boolean;
    defaultView: ViewMode;
}
