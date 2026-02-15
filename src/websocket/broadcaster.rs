use std::sync::Arc;
use tokio::sync::broadcast;

pub struct Broadcaster {
    tx: broadcast::Sender<String>,
}

impl Broadcaster {
    pub fn new() -> Arc<Self> {
        let (tx, _) = broadcast::channel(32);
        Arc::new(Self { tx })
    }

    /// Subscribe a new WebSocket connection
    pub fn subscribe(&self) -> broadcast::Receiver<String> {
        self.tx.subscribe()
    }

    /// Broadcast a message to all subscribers (fire-and-forget)
    pub async fn send(&self, msg: String) {
        let _ = self.tx.send(msg);
    }
}
