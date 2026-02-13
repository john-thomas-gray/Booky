// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoogleVolume = any;

function pickThumbnail(volume: GoogleVolume): string | null {
  const links = volume?.volumeInfo?.imageLinks;
  return (
    links?.thumbnail ??
    links?.smallThumbnail ??
    links?.small ??
    links?.medium ??
    links?.large ??
    null
  );
}

function toSearchResult(volume: GoogleVolume) {
  const info = volume?.volumeInfo ?? {};
  return {
    googleVolumeId: volume.id as string,
    title: (info.title as string) ?? "Untitled",
    authors: Array.isArray(info.authors)
      ? (info.authors as string[]).join(", ")
      : null,
    pageCount: typeof info.pageCount === "number" ? info.pageCount : null,
    thumbnailUrl: pickThumbnail(volume),
    publishedDate:
      typeof info.publishedDate === "string" ? info.publishedDate : null,
    description: typeof info.description === "string" ? info.description : null,
  };
}

export async function searchGoogleBooks(query: string, maxResults = 10) {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
  });
  if (key) params.set("key", key);

  const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Google Books search failed (${res.status}): ${res.statusText.slice(
        0,
        200
      )}`
    );
  }

  const data = await res.json();
  const items = Array.isArray(data.items) ? data.items : [];
  return items.map(toSearchResult);
}

export async function fetchGoogleVolume(volumeId: string) {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  const params = new URLSearchParams();
  if (key) params.set("key", key);

  const url = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(
    volumeId
  )}${params.toString() ? `?${params.toString()}` : ""}`;

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Google volume fetch failed (${res.status}): ${text.slice(0, 200)}`
    );
  }

  return res.json();
}

export function mapVolumeToBookCreate(volume: GoogleVolume) {
  const info = volume?.volumeInfo ?? {};
  return {
    googleVolumeId: volume.id as string,
    title: (info.title as string) ?? "Untitled",
    authors: Array.isArray(info.authors)
      ? (info.authors as string[]).join(", ")
      : null,
    pageCount: typeof info.pageCount === "number" ? info.pageCount : null,
    thumbnailUrl: pickThumbnail(volume),
    description: typeof info.description === "string" ? info.description : null,
    publishedDate:
      typeof info.publishedDate === "string" ? info.publishedDate : null,
    metadataJson: volume,
  };
}
