"""Wishlist data access layer and business logic."""

from __future__ import annotations

import logging
import secrets
import uuid
from typing import Any, Final

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.storage import Store

from .const import (
    EVENT_ITEM_ADDED,
    EVENT_ITEM_PURCHASED,
    EVENT_ITEM_REMOVED,
    EVENT_ITEM_UPDATED,
    EVENT_WISHLIST_CREATED,
    EVENT_WISHLIST_REMOVED,
    EVENT_WISHLIST_UPDATED,
    SIGNAL_DATA_UPDATED,
    STATUS_MAYBE,
    STATUS_PURCHASED,
    STORAGE_KEY,
    STORAGE_VERSION,
)
from .metadata import fetch_url_metadata
from .models import Wishlist, WishlistItem, WishlistStoreData, normalize_status

_LOGGER = logging.getLogger(__name__)

MAX_TAGS_PER_ITEM: Final = 32
MAX_TAG_LENGTH: Final = 48


class WishlistApi:
    """Coordinates persistence, events, and in-memory state."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, STORAGE_KEY
        )
        self._data = WishlistStoreData()

    @property
    def data(self) -> WishlistStoreData:
        return self._data

    async def async_load(self) -> None:
        raw = await self._store.async_load()
        self._data = WishlistStoreData.from_dict(raw)

    def _notify(self) -> None:
        async_dispatcher_send(self.hass, SIGNAL_DATA_UPDATED)

    @callback
    def get_stats(self) -> dict[str, int]:
        """Aggregate counts for sensors and dashboard."""
        total = 0
        purchased = 0
        desired = 0
        maybe = 0
        favorites = 0
        archived = 0
        for wl in self._data.wishlists:
            for it in wl.items:
                total += 1
                if it.archived:
                    archived += 1
                if it.favorite:
                    favorites += 1
                if it.status == STATUS_PURCHASED:
                    purchased += 1
                elif it.status == STATUS_MAYBE:
                    maybe += 1
                else:
                    desired += 1
        return {
            "wishlist_count": len(self._data.wishlists),
            "total_items": total,
            "purchased_items": purchased,
            "desired_items": desired,
            "maybe_items": maybe,
            "favorite_items": favorites,
            "archived_items": archived,
        }

    def get_wishlist(self, wishlist_id: str) -> Wishlist | None:
        for w in self._data.wishlists:
            if w.id == wishlist_id:
                return w
        return None

    def get_wishlist_by_token(self, token: str) -> Wishlist | None:
        for w in self._data.wishlists:
            if w.share_token and secrets.compare_digest(w.share_token, token):
                return w
        return None

    def get_item(self, wishlist_id: str, item_id: str) -> WishlistItem | None:
        wl = self.get_wishlist(wishlist_id)
        if not wl:
            return None
        for it in wl.items:
            if it.id == item_id:
                return it
        return None

    async def _persist(self) -> None:
        await self._store.async_save(self._data.to_dict())
        self._notify()

    def _normalize_tags(self, tags: list[str] | None) -> list[str]:
        if not tags:
            return []
        cleaned: list[str] = []
        seen: set[str] = set()
        for t in tags:
            s = str(t).strip()[:MAX_TAG_LENGTH]
            if not s or s.lower() in seen:
                continue
            seen.add(s.lower())
            cleaned.append(s)
            if len(cleaned) >= MAX_TAGS_PER_ITEM:
                break
        return cleaned

    async def async_create_wishlist(
        self,
        name: str,
        icon: str = "mdi:gift-outline",
        color: str | None = None,
    ) -> Wishlist:
        wl = Wishlist(
            id=str(uuid.uuid4()),
            name=name.strip() or "Wishlist",
            icon=icon or "mdi:gift-outline",
            color=color,
            sort_order=len(self._data.wishlists),
        )
        self._data.wishlists.append(wl)
        await self._persist()
        self.hass.bus.async_fire(
            EVENT_WISHLIST_CREATED,
            {"wishlist_id": wl.id, "name": wl.name},
        )
        return wl

    async def async_update_wishlist(
        self,
        wishlist_id: str,
        *,
        name: str | None = None,
        icon: str | None = None,
        color: str | None = None,
        sort_order: int | None = None,
    ) -> Wishlist | None:
        wl = self.get_wishlist(wishlist_id)
        if not wl:
            return None
        if name is not None:
            wl.name = name.strip() or wl.name
        if icon is not None:
            wl.icon = icon
        if color is not None:
            wl.color = color
        if sort_order is not None:
            wl.sort_order = sort_order
        await self._persist()
        self.hass.bus.async_fire(
            EVENT_WISHLIST_UPDATED,
            {"wishlist_id": wl.id, "name": wl.name},
        )
        return wl

    async def async_delete_wishlist(self, wishlist_id: str) -> bool:
        before = len(self._data.wishlists)
        self._data.wishlists = [w for w in self._data.wishlists if w.id != wishlist_id]
        if len(self._data.wishlists) == before:
            return False
        await self._persist()
        self.hass.bus.async_fire(
            EVENT_WISHLIST_REMOVED,
            {"wishlist_id": wishlist_id},
        )
        return True

    async def async_reorder_wishlists(self, wishlist_ids: list[str]) -> None:
        id_to_wl = {w.id: w for w in self._data.wishlists}
        ordered: list[Wishlist] = []
        for idx, wid in enumerate(wishlist_ids):
            w = id_to_wl.pop(wid, None)
            if w is not None:
                w.sort_order = idx
                ordered.append(w)
        remainder = sorted(id_to_wl.values(), key=lambda x: (x.sort_order, x.name))
        base = len(ordered)
        for offset, w in enumerate(remainder):
            w.sort_order = base + offset
            ordered.append(w)
        self._data.wishlists = ordered
        await self._persist()

    async def async_regenerate_share_token(self, wishlist_id: str) -> str | None:
        wl = self.get_wishlist(wishlist_id)
        if not wl:
            return None
        wl.share_token = secrets.token_urlsafe(18)
        await self._persist()
        return wl.share_token

    async def async_create_item(
        self,
        wishlist_id: str,
        title: str,
        *,
        description: str = "",
        image_url: str = "",
        external_url: str = "",
        notes: str = "",
        status: str = "desired",
        price: float | None = None,
        tags: list[str] | None = None,
        favorite: bool = False,
        archived: bool = False,
    ) -> WishlistItem | None:
        wl = self.get_wishlist(wishlist_id)
        if not wl:
            return None
        item = WishlistItem(
            id=str(uuid.uuid4()),
            title=title.strip() or "Item",
            description=description,
            image_url=image_url,
            external_url=external_url,
            notes=notes,
            status=normalize_status(status),
            price=price,
            tags=self._normalize_tags(tags),
            favorite=favorite,
            archived=archived,
            sort_order=len(wl.items),
        )
        wl.items.append(item)
        await self._persist()
        self.hass.bus.async_fire(
            EVENT_ITEM_ADDED,
            {
                "wishlist_id": wishlist_id,
                "item_id": item.id,
                "title": item.title,
                "status": item.status,
            },
        )
        return item

    async def async_update_item(
        self,
        wishlist_id: str,
        item_id: str,
        **fields: Any,
    ) -> WishlistItem | None:
        item = self.get_item(wishlist_id, item_id)
        if not item:
            return None
        prev_status = item.status
        if "title" in fields and fields["title"] is not None:
            item.title = str(fields["title"]).strip() or item.title
        if "description" in fields:
            item.description = str(fields["description"] or "")
        if "image_url" in fields:
            item.image_url = str(fields["image_url"] or "")
        if "external_url" in fields:
            item.external_url = str(fields["external_url"] or "")
        if "notes" in fields:
            item.notes = str(fields["notes"] or "")
        if "status" in fields and fields["status"] is not None:
            item.status = normalize_status(str(fields["status"]))
        if "price" in fields:
            p = fields["price"]
            if p is None or p == "":
                item.price = None
            else:
                try:
                    item.price = float(p)
                except (TypeError, ValueError):
                    pass
        if "tags" in fields and fields["tags"] is not None:
            item.tags = self._normalize_tags(list(fields["tags"]))
        if "favorite" in fields and fields["favorite"] is not None:
            item.favorite = bool(fields["favorite"])
        if "archived" in fields and fields["archived"] is not None:
            item.archived = bool(fields["archived"])
        if "sort_order" in fields and fields["sort_order"] is not None:
            item.sort_order = int(fields["sort_order"])
        item.touch()
        await self._persist()
        self.hass.bus.async_fire(
            EVENT_ITEM_UPDATED,
            {
                "wishlist_id": wishlist_id,
                "item_id": item.id,
                "title": item.title,
                "status": item.status,
            },
        )
        if prev_status != STATUS_PURCHASED and item.status == STATUS_PURCHASED:
            self.hass.bus.async_fire(
                EVENT_ITEM_PURCHASED,
                {
                    "wishlist_id": wishlist_id,
                    "item_id": item.id,
                    "title": item.title,
                },
            )
        return item

    async def async_delete_item(self, wishlist_id: str, item_id: str) -> bool:
        wl = self.get_wishlist(wishlist_id)
        if not wl:
            return False
        before = len(wl.items)
        wl.items = [i for i in wl.items if i.id != item_id]
        if len(wl.items) == before:
            return False
        await self._persist()
        self.hass.bus.async_fire(
            EVENT_ITEM_REMOVED,
            {"wishlist_id": wishlist_id, "item_id": item_id},
        )
        return True

    async def async_set_item_status(
        self, wishlist_id: str, item_id: str, status: str
    ) -> WishlistItem | None:
        return await self.async_update_item(wishlist_id, item_id, status=status)

    async def async_reorder_items(
        self, wishlist_id: str, item_ids: list[str]
    ) -> bool:
        wl = self.get_wishlist(wishlist_id)
        if not wl:
            return False
        id_to_item = {i.id: i for i in wl.items}
        ordered: list[WishlistItem] = []
        for idx, iid in enumerate(item_ids):
            it = id_to_item.pop(iid, None)
            if it is not None:
                it.sort_order = idx
                ordered.append(it)
        remainder = sorted(id_to_item.values(), key=lambda x: (x.sort_order, x.title))
        base = len(ordered)
        for offset, it in enumerate(remainder):
            it.sort_order = base + offset
            ordered.append(it)
        wl.items = ordered
        await self._persist()
        return True

    def public_payload(self, wishlist: Wishlist) -> dict[str, Any]:
        """Strip secrets for public share responses."""
        items_sorted = sorted(wishlist.items, key=lambda x: x.sort_order)
        items = [
            {
                "id": i.id,
                "title": i.title,
                "description": i.description,
                "image_url": i.image_url,
                "external_url": i.external_url,
                "status": i.status,
                "price": i.price,
                "tags": i.tags,
                "favorite": i.favorite,
                "sort_order": i.sort_order,
                "created_at": i.created_at,
            }
            for i in items_sorted
        ]
        return {
            "wishlist": {
                "id": wishlist.id,
                "name": wishlist.name,
                "icon": wishlist.icon,
                "color": wishlist.color,
            },
            "items": items,
        }

    async def async_fetch_metadata(self, url: str) -> dict[str, Any]:
        session = async_get_clientsession(self.hass)
        return await fetch_url_metadata(session, url)

    def serialize_store(self) -> dict[str, Any]:
        """Full snapshot for API responses."""
        lists_out: list[dict[str, Any]] = []
        for w in sorted(self._data.wishlists, key=lambda x: x.sort_order):
            items_sorted = sorted(w.items, key=lambda i: i.sort_order)
            d = w.to_dict()
            d["items"] = [i.to_dict() for i in items_sorted]
            lists_out.append(d)
        return {
            "wishlists": lists_out,
            "stats": self.get_stats(),
        }
