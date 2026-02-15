import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MainContent } from './MainContent';
import { PreviewPanel } from './PreviewPanel';
import { SettingsModal } from './SettingModal';
import { useFileBrowserStore } from '@/store/filebrowser-store';
import { toast } from 'sonner';

export const FileBrowser = () => {
    const {
        selectedItem,
        navigateUp,
        navigateTo,
        // currentPath
    } = useFileBrowserStore();

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key) {
                case 'Backspace':
                    e.preventDefault();
                    navigateUp();
                    break;
                case '/':
                    e.preventDefault();
                    document.querySelector<HTMLInputElement>('input[placeholder="Search files..."]')?.focus();
                    break;
                case 'c':
                    if ((e.metaKey || e.ctrlKey) && selectedItem) {
                        e.preventDefault();
                        navigator.clipboard.writeText(selectedItem.path);
                        toast.success('Path copied to clipboard');
                    }
                    break;
                case 'Enter':
                    if (selectedItem?.is_dir) {
                        navigateTo(selectedItem.path);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedItem, navigateUp, navigateTo]);

    return (
        <div className="h-screen flex bg-background overflow-hidden">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <TopBar />

                {/* Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Main Content */}
                    <MainContent />

                    {/* Preview Panel */}
                    <PreviewPanel />
                </div>
            </div>

            {/* Modals */}
            <SettingsModal />
        </div>
    );
};
