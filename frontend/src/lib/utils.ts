import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createHighlighter, type Highlighter } from 'shiki';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

let highlighter: Highlighter | null = null;

export const initHighlighter = async () => {
    if (!highlighter) {
        highlighter = await createHighlighter({
            themes: ['github-dark', 'github-light'],
            langs: [
                'javascript',
                'typescript',
                'jsx',
                'tsx',
                'python',
                'java',
                'c',
                'cpp',
                'csharp',
                'go',
                'rust',
                'php',
                'ruby',
                'swift',
                'kotlin',
                'scala',
                'dart',
                'html',
                'css',
                'scss',
                'less',
                'json',
                'yaml',
                'toml',
                'xml',
                'markdown',
                'bash',
                'shell',
                'sql',
                'graphql',
                'dockerfile',
                'makefile',
                'ini',
                'text'
            ]
        });
    }
    return highlighter;
};



export type PrintableContent =
    | { kind: 'blob'; url: string; mime: string }
    | { kind: 'html'; html: string }          // pre-rendered HTML (markdown)
    | { kind: 'text'; text: string }          // plain text
    | { kind: 'code'; text: string; language?: string; filename?: string };

/**
 * Print `content` using a hidden iframe so only the document is printed,
 * not the surrounding application UI.
 *
 * @param filename - shown in the browser's print dialog header
 */
export async function printDocument(
    content: PrintableContent,
    filename: string,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const iframe = document.createElement('iframe');


        iframe.style.cssText = [
            'position:fixed',
            'top:-9999px',
            'left:-9999px',
            'width:0',
            'height:0',
            'border:0',
            'opacity:0',
            'pointer-events:none',
        ].join(';');

        document.body.appendChild(iframe);

        const cleanup = () => {

            setTimeout(() => {
                document.body.removeChild(iframe);
                resolve();
            }, 1000);
        };

        const triggerPrint = () => {
            try {
                const win = iframe.contentWindow;
                if (!win) { reject(new Error('iframe has no contentWindow')); return; }

                win.focus();


                win.addEventListener('afterprint', cleanup, { once: true });

                win.print();
            } catch (err) {
                reject(err);
            }
        };

        if (content.kind === 'blob') {

            if (content.mime.includes('image/')) {
                iframe.onload = () => {
                    const doc = iframe.contentDocument!;
                    doc.open();
                    doc.write(`<!DOCTYPE html><html><head>
                        <title>${escapeHtml(filename)}</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { display: flex; align-items: center; justify-content: center;
                                   min-height: 100vh; background: #fff; }
                            img  { max-width: 100%; max-height: 100vh; object-fit: contain; }
                        </style>
                    </head><body>
                        <img src="${content.url}" alt="${escapeHtml(filename)}" />
                    </body></html>`);
                    doc.close();
                    // Wait for the image to load inside the iframe
                    const img = doc.querySelector('img')!;
                    if (img.complete) {
                        triggerPrint();
                    } else {
                        img.onload = triggerPrint;
                        img.onerror = triggerPrint;
                    }
                };

                iframe.src = 'about:blank';
            } else {
                // PDF — load the blob URL directly
                iframe.onload = triggerPrint;
                iframe.src = content.url;
            }
        } else {
            // Text-based content — write HTML into the iframe
            iframe.onload = () => {
                const doc = iframe.contentDocument!;
                doc.open();

                if (content.kind === 'html') {
                    // Already HTML (rendered markdown) — inject print-friendly CSS
                    doc.write(`<!DOCTYPE html><html><head>
                        <title>${escapeHtml(filename)}</title>
                        <style>
                            ${PROSE_PRINT_CSS}
                        </style>
                    </head><body class="prose">
                        ${content.html}
                    </body></html>`);
                } else if (content.kind === 'code') {
                    doc.write(`<!DOCTYPE html><html><head>
                        <title>${escapeHtml(filename)}</title>
                        <style>
                            ${CODE_PRINT_CSS}
                        </style>
                    </head><body>
                        <p class="filename">${escapeHtml(content.filename ?? filename)}</p>
                        <pre><code>${escapeHtml(content.text)}</code></pre>
                    </body></html>`);
                } else {
                    // Plain text
                    doc.write(`<!DOCTYPE html><html><head>
                        <title>${escapeHtml(filename)}</title>
                        <style>
                            body { font-family: monospace; font-size: 12px; padding: 24px;
                                   white-space: pre-wrap; word-break: break-all; color: #000; }
                        </style>
                    </head><body>${escapeHtml(content.text)}</body></html>`);
                }

                doc.close();
                triggerPrint();
            };
            iframe.src = 'about:blank';
        }
    });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const PROSE_PRINT_CSS = `
    @page { margin: 1.5cm; }
    * { box-sizing: border-box; }
    body {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 12pt;
        line-height: 1.6;
        color: #000;
        background: #fff;
        padding: 0;
        margin: 0;
    }
    h1,h2,h3,h4,h5,h6 { font-weight: bold; margin: 1em 0 0.4em; }
    h1 { font-size: 20pt; }
    h2 { font-size: 16pt; }
    h3 { font-size: 14pt; }
    p  { margin: 0.6em 0; }
    ul, ol { padding-left: 1.5em; margin: 0.6em 0; }
    code {
        font-family: 'Courier New', monospace;
        font-size: 10pt;
        background: #f4f4f4;
        padding: 1px 4px;
        border-radius: 2px;
    }
    pre {
        font-family: 'Courier New', monospace;
        font-size: 10pt;
        background: #f4f4f4;
        padding: 12px;
        border-radius: 4px;
        overflow: visible;
        white-space: pre-wrap;
        word-break: break-all;
        page-break-inside: avoid;
    }
    pre code { background: none; padding: 0; }
    blockquote {
        border-left: 3px solid #ccc;
        padding-left: 1em;
        margin: 0.6em 0;
        color: #555;
    }
    table { border-collapse: collapse; width: 100%; margin: 0.6em 0; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
    th { background: #eee; font-weight: bold; }
    a { color: #000; text-decoration: underline; }
    img { max-width: 100%; page-break-inside: avoid; }
`;

const CODE_PRINT_CSS = `
    @page { margin: 1.5cm; }
    * { box-sizing: border-box; }
    body {
        font-family: 'Courier New', Courier, monospace;
        font-size: 10pt;
        line-height: 1.5;
        color: #000;
        background: #fff;
        padding: 0;
        margin: 0;
    }
    .filename {
        font-family: sans-serif;
        font-size: 9pt;
        color: #666;
        margin-bottom: 8pt;
        padding-bottom: 4pt;
        border-bottom: 1px solid #ccc;
    }
    pre {
        white-space: pre-wrap;
        word-break: break-all;
        margin: 0;
    }
    code { font-family: inherit; }
`;


