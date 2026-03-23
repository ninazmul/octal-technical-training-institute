import { PlaylistVideo } from "@/types/youtube";

export async function getPlaylistVideos(
  playlistId: string,
): Promise<PlaylistVideo[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

  try {
    const res = await fetch(
      `${baseUrl}/api/playlist?playlistId=${playlistId}`,
      {
        cache: "no-store",
      },
    );

    if (!res.ok) return [];

    return res.json();
  } catch {
    return [];
  }
}
