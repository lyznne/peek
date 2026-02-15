import { MoreVertical } from 'lucide-react';
import { useFileBrowserStore } from '@/store/filebrowser-store';
import { formatFileSize, getFileIcon, getFileTypeColor } from '@/lib/file-utils';
import type { FileItem } from '@/types/file-browser';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FileCardProps {
    file: FileItem;
    isSelected: boolean;
    onSelect: () => void;
    onOpen: () => void;
}

const FileCard = ({ file, isSelected, onSelect, onOpen }: FileCardProps) => {
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
            role="button"
            aria-label={`File: ${file.name}`}
            className={cn(
                'group relative bg-card rounded-xl p-4 transition-all duration-200 cursor-pointer',
                'hover:bg-file-hover hover:shadow-md',
                isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background bg-file-selected'
            )}
        >
            {/* Actions Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all"
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

            {/* Icon */}
            <div className={cn(
                'w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-3',
                typeColor
            )}>
                <Icon className="w-6 h-6" />
            </div>

            {/* Name & Size */}
            <div>
                <p className="font-medium text-sm text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatFileSize(file.size)}</p>
            </div>
        </div>
    );
};

export const FileGrid = () => {
    const { items, selectedItem, setSelectedItem } = useFileBrowserStore();

    const files = items.filter(item => !item.is_dir);

    if (files.length === 0) return null;

    return (
        <section aria-label="Files">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                Files
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {files.map((file) => (
                    <FileCard
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
