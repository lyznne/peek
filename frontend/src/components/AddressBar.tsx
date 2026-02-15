import { setPeekAddressBar, toPeekUri } from '@/lib/peek-uri';
import { useFileBrowserStore } from '@/store/filebrowser-store';
import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';


export function AddressBar() {
    const currentPath = useFileBrowserStore(s => s.currentPath);
    const [copied, setCopied]   = useState(false);

    // Keep address bar in sync whenever path changes
     useEffect(() => {
        setPeekAddressBar(currentPath);
    }, [currentPath]);

    const peekUri = toPeekUri(currentPath);

     const handleCopy = async () => {
        await navigator.clipboard.writeText(peekUri);
        setCopied(true);
        toast.success('peek:// link copied');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg font-mono text-sm">
              <span className="text-muted-foreground select-none shrink-0 text-xs">
                peek://
            </span>
            <span className="flex-1 truncate text-foreground" title={peekUri}>
                open{currentPath}
            </span>
 <button
                onClick={handleCopy}
                className="shrink-0 p-1 rounded hover:bg-background/60
                           text-muted-foreground hover:text-foreground transition-colors"
                title="Copy peek:// link"
            >
                {copied
                    ? <Check className="w-3.5 h-3.5 text-green-500" />
                    : <Copy className="w-3.5 h-3.5" />
                }
            </button>
        </div>
    );
}
