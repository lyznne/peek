
import React from 'react';
import { MoreVertical, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useFileBrowserStore } from '@/store/filebrowser-store';
import { formatFileSize, formatDate, getFileIcon, getFileTypeLabel, getFileTypeColor } from '@/lib/file-utils';
import type { FileItem, SortField } from '@/types/file-browser';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FileRowProps {
    file: FileItem;
    isSelected: boolean;
    onSelect: () => void;
    onOpen: () => void;
}

const FileRow = ({ file, isSelected, onSelect, onOpen }: FileRowProps) => {
    const Icon = getFileIcon(file);
    const typeColor = getFileTypeColor(file);

    const handleClick = (e: React.MouseEvent) => {
        if (e.detail === 2) {
            onOpen();
        } else {
            onSelect();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onOpen();
        }
    };

    const handleCopyPath = () => {
        navigator.clipboard.writeText(file.path);
    };

    return (
        <div
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="row"
            aria-selected={isSelected}
            className={cn(
                'file-row group',
                isSelected && 'file-row-selected'
            )}
        >
            {/* Icon & Name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icon className={cn('w-5 h-5 flex-shrink-0', typeColor)} />
                <span className="truncate font-medium text-sm">{file.name}</span>
            </div>

            {/* Modified */}
            <div className="w-28 text-sm text-muted-foreground hidden sm:block">
                {formatDate(file.modified)}
            </div>

            {/* Size */}
            <div className="w-20 text-sm text-muted-foreground text-right hidden md:block">
                {formatFileSize(file.size)}
            </div>

            {/* Type */}
            <div className="w-16 text-xs text-muted-foreground text-center hidden lg:block">
                <span className={cn('px-2 py-0.5 rounded-full bg-secondary', typeColor)}>
                    {getFileTypeLabel(file)}
                </span>
            </div>

            {/* Actions */}
            <div className="w-10 flex justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all"
                            aria-label="File actions"
                        >
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={onOpen}>
                            Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCopyPath}>
                            Copy Path
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export const FileList = () => {
    const { items, selectedItem, setSelectedItem, sortConfig, setSortConfig } = useFileBrowserStore();

    const files = items.filter(item => !item.is_dir);

    const handleSort = (field: SortField) => {
        if (sortConfig.field === field) {
            setSortConfig({
                field,
                direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
            });
        } else {
            setSortConfig({ field, direction: 'asc' });
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortConfig.field !== field) {
            return <ArrowUpDown className="w-3.5 h-3.5" />;
        }
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="w-3.5 h-3.5" />
            : <ArrowDown className="w-3.5 h-3.5" />;
    };

    // Sort files
    const sortedFiles = [...files].sort((a, b) => {
        const dir = sortConfig.direction === 'asc' ? 1 : -1;
        switch (sortConfig.field) {
            case 'name':
                return dir * a.name.localeCompare(b.name);
            case 'modified':
                return dir * (a.modified - b.modified);
            case 'size':
                return dir * (a.size - b.size);
            case 'type':
                return dir * (a.extension || '').localeCompare(b.extension || '');
            default:
                return 0;
        }
    });

    if (files.length === 0) return null;

    return (
        <section aria-label="Files">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                Files
            </h2>

            {/* Header */}
            <div className="flex items-center px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border" role="row">
                <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 flex-1 min-w-0 hover:text-foreground transition-colors"
                >
                    Name {getSortIcon('name')}
                </button>
                <button
                    onClick={() => handleSort('modified')}
                    className="flex items-center gap-1 w-28 hidden sm:flex hover:text-foreground transition-colors"
                >
                    Modified {getSortIcon('modified')}
                </button>
                <button
                    onClick={() => handleSort('size')}
                    className="flex items-center gap-1 w-20 justify-end hidden md:flex hover:text-foreground transition-colors"
                >
                    Size {getSortIcon('size')}
                </button>
                <button
                    onClick={() => handleSort('type')}
                    className="flex items-center gap-1 w-16 justify-center hidden lg:flex hover:text-foreground transition-colors"
                >
                    Type {getSortIcon('type')}
                </button>
                <div className="w-10" />
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/50" role="rowgroup">
                {sortedFiles.map((file) => (
                    <FileRow
                        key={file.path}
                        file={file}
                        isSelected={selectedItem?.path === file.path}
                        onSelect={() => setSelectedItem(file)}
                        onOpen={() => setSelectedItem(file)}
                    />
                ))}
            </div>
        </section>
    );
};
