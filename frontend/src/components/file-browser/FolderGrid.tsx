import { Folder } from 'lucide-react';
import { useFileBrowserStore } from '@/store/filebrowser-store';
import type { FileItem } from '@/types/file-browser';
import { cn } from '@/lib/utils';
import { useDragScroll } from '@/hooks/use-dragscroll';

interface FolderCardProps {
    folder: FileItem;
    isSelected: boolean;
    onSelect: () => void;
    onNavigate: () => void;
}

const FolderCard = ({ folder, isSelected, onSelect, onNavigate }: FolderCardProps) => {
    const handleClick = (e: React.MouseEvent) => {
        if (e.detail === 2) {
            // Double click - navigate
            onNavigate();
        } else {
            // Single click - select
            onSelect();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onNavigate();
        }
    };

    return (
        <div
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Folder: ${folder.name}`}
            className={cn(
                'folder-card flex flex-col items-center gap-3 min-w-[120px] max-w-[140px] ',
                isSelected && 'ring-2 ring-secondary ring-offset-2 ring-offset-background'
            )}
        >
            <Folder className="w-12 h-12 fill-current opacity-80" />
            <div className="text-center w-full">
                <p className="font-medium text-sm truncate text-foreground">{folder.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {folder.children_count} items
                </p>
            </div>
        </div>
    );
};

export const FolderGrid = () => {
    const { items, selectedItem, setSelectedItem, navigateTo } = useFileBrowserStore();
    const drag = useDragScroll();

    const folders = items.filter(item => item.is_dir);

    if (folders.length === 0) return null;

    return (
        <section className="mb-8 mt-6 border  py-4 px-2 " aria-label="Folders">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                Folders
            </h2>
            <div
            {...drag}
            className="flex gap-3 overflow-x-auto pb-2 mt-4  scrollbar-thin snap-x snap-mandatory [&>*]:snap-start cursor-grab active:cursor-grabbing">
                {folders.map((folder) => (
                    <FolderCard
                        key={folder.path}
                        folder={folder}
                        isSelected={selectedItem?.path === folder.path}
                        onSelect={() => setSelectedItem(folder)}
                        onNavigate={() => navigateTo(folder.path)}
                    />
                ))}
            </div>
        </section>
    );
};
