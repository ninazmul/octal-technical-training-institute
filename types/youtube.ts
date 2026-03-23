export interface YouTubeThumbnail {
  url: string;
}

export interface YouTubeThumbnails {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
}

export interface YouTubeSnippet {
  title: string;
  resourceId: {
    videoId: string;
  };
  thumbnails: YouTubeThumbnails;
}

export interface YouTubePlaylistItem {
  snippet: YouTubeSnippet;
}

export interface YouTubeResponse {
  items: YouTubePlaylistItem[];
  nextPageToken?: string;
}

/**
 * Clean frontend-safe type
 */
export interface PlaylistVideo {
  title: string;
  videoId: string;
  thumbnail: string;
}