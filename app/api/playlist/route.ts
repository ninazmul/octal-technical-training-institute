import { PlaylistVideo, YouTubePlaylistItem, YouTubeResponse } from "@/types/youtube";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playlistId = searchParams.get("playlistId");
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!playlistId) {
    return NextResponse.json({ error: "Missing playlistId" }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Missing YouTube API key" },
      { status: 500 }
    );
  }

  let allVideos: YouTubePlaylistItem[] = [];
  let nextPageToken: string | undefined;

  try {
    do {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}${
        nextPageToken ? `&pageToken=${nextPageToken}` : ""
      }`;

      const res = await fetch(url, {
        next: { revalidate: 3600 }, // cache 1 hour
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: "YouTube API error" },
          { status: res.status }
        );
      }

      const data: YouTubeResponse = await res.json();

      allVideos = allVideos.concat(data.items);
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    // Clean + normalize
    const cleaned: PlaylistVideo[] = allVideos
      .filter(
        (item) =>
          item.snippet.title !== "Deleted video" &&
          item.snippet.title !== "Private video"
      )
      .map((item) => ({
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId,
        thumbnail:
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.default?.url ||
          "/assets/images/placeholder.png",
      }));

    return NextResponse.json(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch from YouTube" },
      { status: 500 }
    );
  }
}