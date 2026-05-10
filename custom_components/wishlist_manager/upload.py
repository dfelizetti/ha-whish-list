"""Save user-uploaded item images under config/www (served as /local/...)."""

from __future__ import annotations

import uuid
from pathlib import Path

from homeassistant.core import HomeAssistant

from .const import WWW_UPLOAD_SUBDIR

# 5 MiB — enough for photos without risking huge storage writes
MAX_IMAGE_BYTES: int = 5 * 1024 * 1024


def _extension_from_sniff(data: bytes) -> str | None:
    """Return a file extension (with dot) from magic bytes, or None."""
    if len(data) >= 3 and data[:3] == b"\xff\xd8\xff":
        return ".jpg"
    if len(data) >= 8 and data[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if len(data) >= 6 and data[:6] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    return None


def _extension_from_filename(name: str) -> str | None:
    parts = name.rsplit(".", maxsplit=1)
    if len(parts) != 2:
        return None
    ext = "." + parts[1].lower()
    if ext == ".jpeg":
        ext = ".jpg"
    if ext in (".jpg", ".png", ".gif", ".webp"):
        return ext
    return None


async def async_save_uploaded_image(
    hass: HomeAssistant,
    body: bytes,
    original_filename: str | None,
) -> str:
    """Persist bytes under www/<subdir> and return URL path for img src."""
    if len(body) > MAX_IMAGE_BYTES:
        raise ValueError("file_too_large")

    ext = _extension_from_sniff(body)
    if ext is None and original_filename:
        ext = _extension_from_filename(original_filename)
    if ext is None:
        raise ValueError("unsupported_image_type")

    www = Path(hass.config.path("www"))
    target_dir = www / WWW_UPLOAD_SUBDIR
    file_name = f"{uuid.uuid4().hex}{ext}"

    def _mkdir_and_write() -> None:
        target_dir.mkdir(parents=True, exist_ok=True)
        (target_dir / file_name).write_bytes(body)

    await hass.async_add_executor_job(_mkdir_and_write)
    return f"/local/{WWW_UPLOAD_SUBDIR}/{file_name}"
