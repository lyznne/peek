import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, X, ChevronRight as BreadcrumbSeparator } from 'lucide-react';
import { useFileBrowserStore } from '@/store/filebrowser-store';
import { getPathSegments } from '@/lib/file-utils';
import { cn } from '@/lib/utils';

export const TopBar = () => {
    const {
        currentPath,
        searchQuery,
        setSearchQuery,
        navigateTo,
        navigateBack,
        navigateForward,
        historyIndex,
        navigationHistory,
    } = useFileBrowserStore();

    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isEditingPath, setIsEditingPath] = useState(false);
    const [editPath, setEditPath] = useState(currentPath);
    const inputRef = useRef<HTMLInputElement>(null);
    const pathInputRef = useRef<HTMLInputElement>(null);

    const canGoBack = historyIndex > 0;
    const canGoForward = historyIndex < navigationHistory.length - 1;
    const pathSegments = getPathSegments(currentPath);

    useEffect(() => {
        setEditPath(currentPath);
    }, [currentPath]);

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setSearchQuery('');
            inputRef.current?.blur();
        }
    };

    const handlePathSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editPath.trim()) {
            navigateTo(editPath.trim());
        }
        setIsEditingPath(false);
    };

    const handlePathKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setEditPath(currentPath);
            setIsEditingPath(false);
        }
    };

    return (
        <header className="h-14 bg-panel border-b border-panel-border flex items-center px-4 gap-3">
            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
                <button
                    onClick={navigateBack}
                    disabled={!canGoBack}
                    className={cn(
                        'p-2 rounded-lg transition-all duration-200',
                        canGoBack
                            ? 'text-foreground hover:bg-secondary active:scale-95'
                            : 'text-muted-foreground/40 cursor-not-allowed'
                    )}
                    aria-label="Go back"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={navigateForward}
                    disabled={!canGoForward}
                    className={cn(
                        'p-2 rounded-lg transition-all duration-200',
                        canGoForward
                            ? 'text-foreground hover:bg-secondary active:scale-95'
                            : 'text-muted-foreground/40 cursor-not-allowed'
                    )}
                    aria-label="Go forward"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Breadcrumbs / Path Editor */}
            <div className="flex-1 min-w-0">
                {isEditingPath ? (
                    <form onSubmit={handlePathSubmit} className="w-full">
                        <input
                            ref={pathInputRef}
                            type="text"
                            value={editPath}
                            onChange={(e) => setEditPath(e.target.value)}
                            onBlur={() => {
                                setEditPath(currentPath);
                                setIsEditingPath(false);
                            }}
                            onKeyDown={handlePathKeyDown}
                            className="input-field text-sm font-mono"
                            autoFocus
                        />
                    </form>
                ) : (
                    <nav
                        className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-thin cursor-pointer py-1"
                        onClick={() => setIsEditingPath(true)}
                        role="navigation"
                        aria-label="Breadcrumb"
                    >
                        {pathSegments.map((segment, index) => (
                            <div key={segment.path} className="flex items-center gap-1 flex-shrink-0">
                                {index > 0 && (
                                    <BreadcrumbSeparator className="w-4 h-4 text-muted-foreground/50" />
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigateTo(segment.path);
                                    }}
                                    className={cn(
                                        'px-2 py-1 rounded-md transition-colors',
                                        index === pathSegments.length - 1
                                            ? 'breadcrumb-item-current bg-secondary'
                                            : 'breadcrumb-item hover:bg-secondary'
                                    )}
                                >
                                    {segment.name}
                                </button>
                            </div>
                        ))}
                    </nav>
                )}
            </div>

            {/* Search */}
            <div
                className={cn(
                    'relative flex items-center transition-all duration-200',
                    isSearchFocused || searchQuery ? 'w-64' : 'w-40'
                )}
            >
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search files..."
                    className="input-field pl-9 pr-8 py-2 text-sm"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </header>
    );
};
