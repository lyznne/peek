import { Moon, Sun, LayoutGrid, List,  } from 'lucide-react';
import { useFileBrowserStore } from '@/store/filebrowser-store';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export const SettingsModal = () => {
    const { showSettings, setShowSettings, theme, setTheme, viewMode, setViewMode } = useFileBrowserStore();

    return (
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Theme */}
                    <div>
                        <h3 className="text-sm font-medium text-foreground mb-3">Theme</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setTheme('light')}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                                    theme === 'light'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                )}
                            >
                                <Sun className="w-5 h-5 text-amber-500" />
                                <div className="text-left">
                                    <p className="font-medium text-sm">Light</p>
                                    <p className="text-xs text-muted-foreground">Default theme</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                                    theme === 'dark'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                )}
                            >
                                <Moon className="w-5 h-5 text-indigo-500" />
                                <div className="text-left">
                                    <p className="font-medium text-sm">Dark</p>
                                    <p className="text-xs text-muted-foreground">Classic theme</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* View Mode */}
                    <div>
                        <h3 className="text-sm font-medium text-foreground mb-3">Default View</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                                    viewMode === 'list'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                )}
                            >
                                <List className="w-5 h-5" />
                                <div className="text-left">
                                    <p className="font-medium text-sm">List</p>
                                    <p className="text-xs text-muted-foreground">Detailed view</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                                    viewMode === 'grid'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                )}
                            >
                                <LayoutGrid className="w-5 h-5" />
                                <div className="text-left">
                                    <p className="font-medium text-sm">Grid</p>
                                    <p className="text-xs text-muted-foreground">Compact view</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Hidden Files */}
                    {/* <div>
                        <h3 className="text-sm font-medium text-foreground mb-3">Hidden Files</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowHidden(true)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                                    showHidden
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                )}
                            >
                                <Eye className="w-5 h-5 text-blue-500" />
                                <div className="text-left">
                                    <p className="font-medium text-sm">Show</p>
                                    <p className="text-xs text-muted-foreground">Display dotfiles</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setShowHidden(false)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                                    !showHidden
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover-border-primary/50"
                                )}
                            >
                                <EyeOff className="w-5 h-5 text-red-500" />
                                <div className="text-left">
                                    <p className="font-medium text-sm">Hide</p>
                                    <p className="text-xs text-muted-foreground">Standard behavior</p>
                                </div>
                            </button>
                        </div>
                    </div> */}


                    {/* Server Info */}
                    <div>
                        <h3 className="text-sm font-medium text-foreground mb-3">Server</h3>
                        <div className="bg-secondary rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                <span className="text-sm font-medium text-foreground">Connected</span>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">
                                Peek File Server v1.0.0
                            </p>
                        </div>
                    </div>

                    {/* Keyboard Shortcuts */}
                    <div>
                        <h3 className="text-sm font-medium text-foreground mb-3">Keyboard Shortcuts</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Navigate up</span>
                                <kbd className="px-2 py-0.5 bg-secondary rounded text-xs font-mono">Backspace</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Focus search</span>
                                <kbd className="px-2 py-0.5 bg-secondary rounded text-xs font-mono">/</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Copy path</span>
                                <kbd className="px-2 py-0.5 bg-secondary rounded text-xs font-mono">⌘ + C</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Open selected</span>
                                <kbd className="px-2 py-0.5 bg-secondary rounded text-xs font-mono">Enter</kbd>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
