"""Typed domain models for Wishlist Manager."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from typing import Any

from .const import STATUS_DESIRED, STATUSES


def _utc_now_iso() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat()


def normalize_status(value: str) -> str:
    """Return a valid item status string."""
    s = (value or "").strip().lower()
    return s if s in STATUSES else STATUS_DESIRED


@dataclass(slots=True)
class WishlistItem:
    """A single wishlist entry."""

    id: str
    title: str
    description: str = ""
    image_url: str = ""
    external_url: str = ""
    notes: str = ""
    status: str = STATUS_DESIRED
    price: float | None = None
    tags: list[str] = field(default_factory=list)
    favorite: bool = False
    archived: bool = False
    sort_order: int = 0
    created_at: str = field(default_factory=_utc_now_iso)
    updated_at: str = field(default_factory=_utc_now_iso)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> WishlistItem:
        tags = data.get("tags") or []
        if not isinstance(tags, list):
            tags = []
        price = data.get("price")
        if price is not None:
            try:
                price = float(price)
            except (TypeError, ValueError):
                price = None
        return cls(
            id=str(data["id"]),
            title=str(data.get("title", "")),
            description=str(data.get("description", "")),
            image_url=str(data.get("image_url", "")),
            external_url=str(data.get("external_url", "")),
            notes=str(data.get("notes", "")),
            status=normalize_status(str(data.get("status", STATUS_DESIRED))),
            price=price,
            tags=[str(t) for t in tags],
            favorite=bool(data.get("favorite", False)),
            archived=bool(data.get("archived", False)),
            sort_order=int(data.get("sort_order", 0)),
            created_at=str(data.get("created_at") or _utc_now_iso()),
            updated_at=str(data.get("updated_at") or _utc_now_iso()),
        )

    def touch(self) -> None:
        self.updated_at = _utc_now_iso()


@dataclass(slots=True)
class Wishlist:
    """A wishlist containing items."""

    id: str
    name: str
    icon: str = "mdi:gift-outline"
    color: str | None = None
    sort_order: int = 0
    share_token: str | None = None
    items: list[WishlistItem] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "icon": self.icon,
            "color": self.color,
            "sort_order": self.sort_order,
            "share_token": self.share_token,
            "items": [i.to_dict() for i in self.items],
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Wishlist:
        raw_items = data.get("items") or []
        items: list[WishlistItem] = []
        for entry in raw_items:
            if isinstance(entry, dict):
                items.append(WishlistItem.from_dict(entry))
            elif isinstance(entry, WishlistItem):
                items.append(entry)
        return cls(
            id=str(data["id"]),
            name=str(data.get("name", "Wishlist")),
            icon=str(data.get("icon", "mdi:gift-outline")),
            color=data.get("color"),
            sort_order=int(data.get("sort_order", 0)),
            share_token=data.get("share_token"),
            items=items,
        )


@dataclass(slots=True)
class WishlistStoreData:
    """Root persisted document."""

    wishlists: list[Wishlist] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {"wishlists": [w.to_dict() for w in self.wishlists]}

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> WishlistStoreData:
        if not data:
            return cls()
        raw = data.get("wishlists") or []
        wishlists = [
            Wishlist.from_dict(w) if isinstance(w, dict) else w for w in raw
        ]
        wishlists = [w for w in wishlists if isinstance(w, Wishlist)]
        return cls(wishlists=wishlists)
