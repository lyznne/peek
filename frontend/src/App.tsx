import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { resolveInitialPath, resolveInitialFile } from "@/lib/initial-path";
import { useFileBrowserStore } from "@/store/filebrowser-store";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { getWebSocket } from "@/services/websocket";
import { setPeekAddressBar } from "./lib/peek-uri";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInner() {
  const navigate = useFileBrowserStore((s) => s.navigate);
  const selectFileByName = useFileBrowserStore((s) => s.selectFileByName);

  useEffect(() => {
    const ws = getWebSocket();
    ws.connect();

    (async () => {
      const path = await resolveInitialPath();
      await navigate(path);
      setPeekAddressBar(path);

      const file = resolveInitialFile();
      if (file) selectFileByName(file);
    })();
    
    return () => ws.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppInner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
