"""Lightweight URL metadata extraction without extra dependencies."""

from __future__ import annotations

import logging
import re
from html import unescape
from typing import Any

import aiohttp

_LOGGER = logging.getLogger(__name__)

_USER_AGENT = "HomeAssistant/WishlistManager/1.0"
_MAX_BYTES = 512_000

_META_CONTENT_RE = re.compile(
    r'<meta\s+[^>]*(?:property|name)\s*=\s*["\']'
    r'(og:title|og:image|twitter:title|twitter:image|description)["\']'
    r'\s+[^>]*content\s*=\s*["\']([^"\']*)["\']',
    re.IGNORECASE,
)
_META_CONTENT_RE_ALT = re.compile(
    r'<meta\s+[^>]*content\s*=\s*["\']([^"\']*)["\']'
    r'\s+[^>]*(?:property|name)\s*=\s*["\']'
    r'(og:title|og:image|twitter:title|twitter:image|description)["\']',
    re.IGNORECASE,
)
_TITLE_RE = re.compile(r"<title[^>]*>([^<]+)</title>", re.IGNORECASE)


def _first_match(pattern: re.Pattern[str], html: str) -> str | None:
    m = pattern.search(html)
    return unescape(m.group(1).strip()) if m else None


def _meta_tags(html: str) -> dict[str, str]:
    found: dict[str, str] = {}
    for pat in (_META_CONTENT_RE, _META_CONTENT_RE_ALT):
        for m in pat.finditer(html):
            key = m.group(1).lower()
            val = unescape(m.group(2).strip())
            if key not in found and val:
                found[key] = val
    return found


def parse_open_graph(html: str) -> dict[str, str | None]:
    """Parse minimal Open Graph / title fields from HTML."""
    meta = _meta_tags(html)
    title = meta.get("og:title") or meta.get("twitter:title")
    if not title:
        title = _first_match(_TITLE_RE, html)
    image = meta.get("og:image") or meta.get("twitter:image")
    description = meta.get("description")
    return {"title": title, "image": image, "description": description}


async def fetch_url_metadata(session: aiohttp.ClientSession, url: str) -> dict[str, Any]:
    """Fetch a URL and return parsed metadata plus raw final URL."""
    result: dict[str, Any] = {
        "url": url,
        "final_url": url,
        "title": None,
        "image": None,
        "description": None,
        "ok": False,
    }
    try:
        async with session.get(
            url,
            allow_redirects=True,
            timeout=aiohttp.ClientTimeout(total=20),
            headers={"User-Agent": _USER_AGENT, "Accept": "text/html,application/xhtml+xml"},
        ) as resp:
            result["final_url"] = str(resp.url)
            ctype = resp.headers.get("Content-Type", "")
            if resp.status >= 400:
                _LOGGER.debug("Metadata fetch HTTP %s for %s", resp.status, url)
                return result
            if "text/html" not in ctype and "application/xhtml" not in ctype:
                # Non-HTML: no OG tags; still report success for link validation
                result["ok"] = True
                return result
            body = await resp.content.read(_MAX_BYTES)
            html = body.decode("utf-8", errors="replace")
    except (aiohttp.ClientError, TimeoutError, UnicodeDecodeError) as err:
        _LOGGER.debug("Metadata fetch failed for %s: %s", url, err)
        return result

    parsed = parse_open_graph(html)
    result["title"] = parsed.get("title")
    result["image"] = parsed.get("image")
    result["description"] = parsed.get("description")
    result["ok"] = True
    return result
