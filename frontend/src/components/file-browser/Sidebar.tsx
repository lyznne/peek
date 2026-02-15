import { Home, Settings, LayoutGrid, List, Sun, Moon, EyeOff, Eye } from 'lucide-react';
import { useFileBrowserStore } from '@/store/filebrowser-store';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export const Sidebar = () => {
    const {
        viewMode,
        theme,
        setViewMode,
        toggleTheme,
        navigateTo,
        setShowSettings,
        currentPath,
        showHidden,
        setShowHidden,
    } = useFileBrowserStore();

    const isHome = currentPath === '/';

    return (
        <aside className="w-[60px] h-full bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-2">
            <div className="flex flex-col items-center gap-1 flex-1">
                {/* Home */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => navigateTo('/')}
                            className={cn(
                                'sidebar-item',
                                isHome && 'sidebar-item-active'
                            )}
                            aria-label="Go to home directory"
                        >
                            <Home className="w-5 h-5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>Home</p>
                    </TooltipContent>
                </Tooltip>

                {/* Settings */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="sidebar-item"
                            aria-label="Open settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>Settings</p>
                    </TooltipContent>
                </Tooltip>

                {/* View Toggle */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                            className="sidebar-item"
                            aria-label={`Switch to ${viewMode === 'list' ? 'grid' : 'list'} view`}
                        >
                            {viewMode === 'list' ? (
                                <LayoutGrid className="w-5 h-5" />
                            ) : (
                                <List className="w-5 h-5" />
                            )}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{viewMode === 'list' ? 'Grid View' : 'List View'}</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setShowHidden(!showHidden)}
                            className="sidebar-item"
                            aria-label="Toggle hidden files"
                        >
                            {showHidden ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{showHidden ? "Hide Hidden Files" : "Show Hidden Files"}</p>
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* Theme Toggle - at bottom */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={toggleTheme}
                        className="sidebar-item"
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                    >
                        {theme === 'light' ? (
                            <Moon className="w-5 h-5" />
                        ) : (
                            <Sun className="w-5 h-5" />
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</p>
                </TooltipContent>
            </Tooltip>
        </aside>
    );
};
