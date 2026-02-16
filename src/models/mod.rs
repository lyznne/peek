use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileItem {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub modified: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mime_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub extension: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children_count: Option<usize>,
    #[serde(default)]
    pub is_hidden: bool,
}

#[derive(Debug, Serialize)]
pub struct BrowseResponse {
    pub current_path: String,
    pub items: Vec<FileItem>,
    pub total_size: u64,
    pub total_items: usize,
    pub can_navigate_up: bool,
}

#[derive(Debug, Deserialize)]
pub struct BrowseQuery {
    pub path: String,
    #[serde(default)]
    pub recursive: bool,
    #[serde(default)]
    pub show_hidden: bool,
}

#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub path: String,
    pub query: String,
    #[serde(default)]
    pub max_results: usize,
}

#[derive(Debug, Serialize)]
pub struct SearchResponse {
    pub matches: Vec<FileItem>,
    pub search_time_ms: u64,
    pub total_matches: usize,
}

#[derive(Debug, Serialize)]
pub struct FileInfoResponse {
 pub item: FileItem,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_path: Option<String>,
    pub readable: bool,
    pub writable: bool,
    pub executable: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub permissions: Option<String>, 
}


#[derive(Debug, Serialize)]
pub struct PreviewResponse {
    pub r#type: String,
    pub name: String,
    pub path: String,
    pub size: u64,
    pub mime_type: String,
    pub modified: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thumbnail: Option<String>,
    pub is_text: bool,
    pub is_image: bool,
    pub is_code: bool,
    pub truncated: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub language: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub lines: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub encoding: Option<String>,
}


#[derive(serde::Deserialize)]
pub struct DocumentQuery {
    pub path: String,
}
