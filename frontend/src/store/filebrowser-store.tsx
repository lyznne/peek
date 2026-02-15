import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '@/services/api';
import { pushPeekAddressBar, setPeekAddressBar } from '@/lib/peek-uri';
import type { FileItem, ViewMode, ThemeMode, SortConfig } from '@/types/file-browser';

interface FileBrowserState {
    // ── Navigation ────────────────────────────────────────────────────────────
    currentPath: string;
    navigationHistory: string[];
    historyIndex: number;

    // ── Items ─────────────────────────────────────────────────────────────────
    items: FileItem[];
    selectedItem: FileItem | null;
    selectedItems: FileItem[];

    // ── UI State ──────────────────────────────────────────────────────────────
    viewMode: ViewMode;
    theme: ThemeMode;
    sortConfig: SortConfig;
    isLoading: boolean;
    error: string | null;
    showSettings: boolean;
    searchQuery: string;
    isSearching: boolean;
    showHidden: boolean;

    // ── Computed ──────────────────────────────────────────────────────────────
    canNavigateUp: boolean;
    canNavigateBack: boolean;
    canNavigateForward: boolean;
    folders: FileItem[];
    files: FileItem[];

    // ── Actions ───────────────────────────────────────────────────────────────
    setCurrentPath: (path: string) => void;
    navigate: (path: string) => Promise<void>;
    selectFileByName: (name: string) => void;
    navigateTo: (path: string) => void;
    navigateUp: () => void;
    navigateBack: () => void;
    navigateForward: () => void;
    setItems: (items: FileItem[]) => void;
    setSelectedItem: (item: FileItem | null) => void;
    toggleSelectedItem: (item: FileItem) => void;
    clearSelection: () => void;
    setViewMode: (mode: ViewMode) => void;
    setTheme: (theme: ThemeMode) => void;
    toggleTheme: () => void;
    setSortConfig: (config: SortConfig) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setShowSettings: (show: boolean) => void;
    setSearchQuery: (query: string) => void;
    setIsSearching: (searching: boolean) => void;
    setShowHidden: (value: boolean) => void;
}

export const useFileBrowserStore = create<FileBrowserState>()(
    persist(
        (set, get) => ({
            // ── Initial state ─────────────────────────────────────────────────
            currentPath: '/',
            navigationHistory: ['/'],
            historyIndex: 0,
            items: [],
            selectedItem: null,
            selectedItems: [],
            viewMode: 'list',
            theme: 'light',
            sortConfig: { field: 'name', direction: 'asc' },
            isLoading: false,
            error: null,
            showSettings: false,
            searchQuery: '',
            isSearching: false,
            showHidden: false,

            // ── Computed ──────────────────────────────────────────────────────
            get canNavigateUp() {
                return get().currentPath !== '/';
            },
            get canNavigateBack() {
                return get().historyIndex > 0;
            },
            get canNavigateForward() {
                return get().historyIndex < get().navigationHistory.length - 1;
            },
            get folders() {
                return get().items.filter(item => item.is_dir);
            },
            get files() {
                return get().items.filter(item => !item.is_dir);
            },

            // ── navigate — fetches contents, updates history & address bar ────
            navigate: async (path: string) => {
                const { showHidden } = get();

                set({ isLoading: true, error: null });

               
                setPeekAddressBar(path);

                try {
                    const res = await apiService.browse(path, showHidden);

                    const { navigationHistory, historyIndex } = get();
                    const newHistory = [
                        ...navigationHistory.slice(0, historyIndex + 1),
                        res.current_path,
                    ];

                    set({
                        currentPath: res.current_path,
                        items: res.items,
                        navigationHistory: newHistory,
                        historyIndex: newHistory.length - 1,
                        selectedItem: null,
                        selectedItems: [],
                        isLoading: false,
                    });

                    // Re-sync after we know the canonical path from the server.
                    setPeekAddressBar(res.current_path);
                } catch (err) {
                    const message =
                        err instanceof Error ? err.message : 'Failed to load directory';
                    set({ error: message, isLoading: false });
                }
            },

            // ── selectFileByName — highlights a file after navigate() ─────────
            selectFileByName: (name: string) => {
                const found = get().items.find(
                    (i) => i.name === name && !i.is_dir,
                ) ?? null;
                set({ selectedItem: found });
            },

            // ── setCurrentPath ────────────────────────────────────────────────
            setCurrentPath: (path) => set({ currentPath: path }),

            // ── navigateTo — explicit folder-click navigation ─────────────────
            navigateTo: (path) => {
                const { navigationHistory, historyIndex } = get();
                const newHistory = [...navigationHistory.slice(0, historyIndex + 1), path];

                // Push a new History entry so the browser Back button works.
                pushPeekAddressBar(path);

                set({
                    currentPath: path,
                    navigationHistory: newHistory,
                    historyIndex: newHistory.length - 1,
                    selectedItem: null,
                    selectedItems: [],
                });

                // Fetch contents in the background (navigate without history update).
                get().navigate(path);
            },

            // ── navigateUp ────────────────────────────────────────────────────
            navigateUp: () => {
                const { currentPath } = get();
                if (currentPath === '/') return;
                const parentPath =
                    currentPath.split('/').slice(0, -1).join('/') || '/';
                get().navigateTo(parentPath);
            },

            // ── navigateBack ──────────────────────────────────────────────────
            navigateBack: () => {
                const { navigationHistory, historyIndex } = get();
                if (historyIndex > 0) {
                    const newIndex = historyIndex - 1;
                    const path = navigationHistory[newIndex];
                    setPeekAddressBar(path);
                    set({ historyIndex: newIndex, currentPath: path });
                    get().navigate(path);
                }
            },

            // ── navigateForward ───────────────────────────────────────────────
            navigateForward: () => {
                const { navigationHistory, historyIndex } = get();
                if (historyIndex < navigationHistory.length - 1) {
                    const newIndex = historyIndex + 1;
                    const path = navigationHistory[newIndex];
                    setPeekAddressBar(path);
                    set({ historyIndex: newIndex, currentPath: path });
                    get().navigate(path);
                }
            },

            // ── Remaining simple setters ──────────────────────────────────────
            setItems: (items) => set({ items }),
            setSelectedItem: (item) => set({ selectedItem: item }),

            toggleSelectedItem: (item) => {
                const { selectedItems } = get();
                const isSelected = selectedItems.some((i) => i.path === item.path);
                set({
                    selectedItems: isSelected
                        ? selectedItems.filter((i) => i.path !== item.path)
                        : [...selectedItems, item],
                });
            },

            clearSelection: () => set({ selectedItem: null, selectedItems: [] }),

            setViewMode: (mode) => set({ viewMode: mode }),

            setTheme: (theme) => {
                set({ theme });
                document.documentElement.classList.toggle('dark', theme === 'dark');
            },

            toggleTheme: () => {
                const next = get().theme === 'light' ? 'dark' : 'light';
                get().setTheme(next);
            },

            setSortConfig: (config) => set({ sortConfig: config }),
            setIsLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),
            setShowSettings: (show) => set({ showSettings: show }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            setIsSearching: (searching) => set({ isSearching: searching }),
            setShowHidden: (value) => set({ showHidden: value }),
        }),
        {
            name: 'peek-file-browser',
            partialize: (state) => ({
                theme: state.theme,
                viewMode: state.viewMode,
                sortConfig: state.sortConfig,
                showHidden: state.showHidden,
            }),
            onRehydrateStorage: () => (state) => {
                if (state?.theme === 'dark') {
                    document.documentElement.classList.add('dark');
                }
            },
        },
    ),
);