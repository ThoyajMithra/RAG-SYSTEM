from typing import List, TypedDict

import requests

from app.config import settings

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"


class VideoResult(TypedDict):
    video_id: str
    title: str
    channel: str
    thumbnail_url: str
    url: str


def search_videos(query: str, max_results: int = None) -> List[VideoResult]:
    """
    Searches YouTube's Data API v3 for videos relevant to the given query.
    Used to surface supplementary video content alongside RAG answers.
    Fails soft (returns []) if no API key is configured or the request
    errors out, so a YouTube outage never breaks the core Q&A flow.
    """
    if not settings.YOUTUBE_API_KEY or not query.strip():
        print('fucked1')
        return []

    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results or settings.YOUTUBE_MAX_RESULTS,
        "key": settings.YOUTUBE_API_KEY,
        "safeSearch": "moderate",
    }

    try:
        resp = requests.get(YOUTUBE_SEARCH_URL, params=params, timeout=5)
        resp.raise_for_status()
        items = resp.json().get("items", [])
    except requests.RequestException:
        print('fucked2')

        return []

    results: List[VideoResult] = []
    for item in items:
        video_id = item.get("id", {}).get("videoId")
        snippet = item.get("snippet", {})
        if not video_id:
            continue
        results.append(
            VideoResult(
                video_id=video_id,
                title=snippet.get("title", ""),
                channel=snippet.get("channelTitle", ""),
                thumbnail_url=snippet.get("thumbnails", {}).get("default", {}).get("url", ""),
                url=f"https://www.youtube.com/watch?v={video_id}",
            )
        )
    return results
