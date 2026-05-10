"""REST API for Wishlist Manager."""

from __future__ import annotations

from typing import Any, cast

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .api import WishlistApi
from .const import DOMAIN


def _api(hass: HomeAssistant) -> WishlistApi | None:
    block = hass.data.get(DOMAIN)
    if not block:
        return None
    return cast(WishlistApi | None, block.get("api"))


def _json_body(request: web.Request) -> dict[str, Any]:
    try:
        if not request.can_read_body:
            return {}
        return cast(dict[str, Any], json.loads(request.content.read_nowait()))
    except (json.JSONDecodeError, TypeError, ValueError):
        return {}


class WishlistsRootView(HomeAssistantView):
    """GET/POST /api/wishlist_manager/wishlists."""

    url = "/api/wishlist_manager/wishlists"
    name = "api:wishlist_manager:wishlists_root"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        api = _api(hass)
        if api is None:
            return web.json_response({"error": "not_loaded"}, status=503)
        return web.json_response(api.serialize_store())

    async def post(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        api = _api(hass)
        if api is None:
            return web.json_response({"error": "not_loaded"}, status=503)
        data = await request.json()
        wl = await api.async_create_wishlist(
            str(data.get("name", "Wishlist")),
            icon=str(data.get("icon", "mdi:gift-outline")),
            color=data.get("color"),
        )
        return web.json_response({"wishlist": wl.to_dict()}, status=201)


class WishlistsReorderView(HomeAssistantView):
    """POST /api/wishlist_manager/wishlists/reorder."""

    url = "/api/wishlist_manager/wishlists/reorder"
    name = "api:wishlist_manager:wishlists_reorder"
    requires_auth = True

    async def post(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        api = _api(hass)
        if api is None:
            return web.json_response({"error": "not_loaded"}, status=503)
        data = await request.json()
        ids = data.get("wishlist_ids") or []
        if not isinstance(ids, list):
            return web.json_response({"error": "invalid_body"}, status=400)
        await api.async_reorder_wishlists([str(i) for i in ids])
        return web.json_response(api.serialize_store())


class WishlistDetailView(HomeAssistantView):
    """GET/PATCH/DELETE /api/wishlist_manager/wishlists/{wishlist_id}."""

    url = "/api/wishlist_manager/wishlists/{wishlist_id}"
    name = "api:wishlist_manager:wishlist_detail"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        api = _api(hass)
        if api is None:
            return web.json_response({"error": "not_loaded"}, status=503)
        wid = request.match_info["wishlist_id"]
        wl = api.get_wishlist(wid)
        if not wl:
            return web.json_response({"error": "not_found"}, status=404)
        d = wl.to_dict()
        d["items"] = [i.to_dict() for i in sorted(wl.items, key=lambda x: x.sort_order)]
        return web.json_response({"wishlist": d})

    async def patch(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        api = _api(hass)
        if api is None:
            return web.json_response({"error": "not_loaded"}, status=503)
        wid = request.match_info["wishlist_id"]
        data = await request.json()
        wl = await api.async_update_wishlist(
            wid,
            name=data.get("name"),
            icon=data.get("icon"),
            color=data.get("color"),
            sort_order=data.get("sort_order"),
        )
        if not wl:
            return web.json_response({"error": "not_found"}, status=404)
        return web.json_response({"wishlist": wl.to_dict()})

    async def delete(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        api = _api(hass)
        if api is None:
            return web.json_response({"error": "not_loaded"}, status=503)
        wid = request.match_info["wishlist_id"]
        ok = await api.async_delete_wishlist(wid)
        if not ok:
            return web.json_response({"error": "not_found"}, status=404)
        return web.json_response({"success": True})


class WishlistItemsView(HomeAssistantView):
    """GET/POST items."""

    url = "/api/wishlist_manager/wishlists/{wishlist_id}/items"
    name = "api:wishlist_manager:wishlist_items"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        api = _api(hass)
        if api is None:
            return web.json_response({"error": "not_loaded"}, status=503)
        wid = request.match_info["wishlist_id"]
        wl = api.get_wishlist(wid)
        if not wl:
            return web.json_response({"error": "not_found"}, status=404)
        items = [i.to_dict() for i in sorted(wl.items, key=lambda x: x.sort_order)]
        return web.json_response({"items": items})

    async def post(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        api = _api(hass)
        if api is None:
            return web.json_response({"error": "not_loaded"}, status=503)
        wid = request.match_info["wishlist_id"]
        data = await request.json()
        item = await api.async_create_item(
            wid,
            str(data.get("title", "Item")),
            description=str(data.get("description", "")),
            image_url=str(data.get("image_url", "")),
            external_url=str(data.get("external_url", "")),
            notes=str(data.get("notes", "")),
            status=str(data.get("status", "desired")),
            price=data.get("price"),
            tags=data.get("tags"),
            favorite=bool(data.get("favorite", False)),
            archived=bool(data.get("archived", False)),
        )
        if not item:
            return web.json_response({"error": "not_found"}, status=404)
        return web.json_response({"item": item.to_dict()}, status=201)


class WishlistItemsReorderView(HomeAssistantView):
    """POST reorder items."""

    url = "/api/wishlist_manager/wishlists/{wishlist_id}/items/reorder"
    name = "api:wishlist_manager:wishlist_items_reorder"
    requires_auth = True

    async def post(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        api = _api(hass)
        if api is None:
            return web.json_response({"error": "not_loaded"}, status=503)
        wid = request.match_info["wishlist_id"]
        data = await request.json()
        ids = data.get("item_ids") or []
        if not isinstance(ids, list):
            return web.json_response({"error": "invalid_body"}, status=400)
        ok = await api.async_reorder_items(wid, [str(i) for i in ids])
        if not ok:
            return web.json_response({"error": "not_found"}, status=404)
        return web.json_response(api.serialize_store())


class WishlistItemDetailView(HomeAssistantView):
    """PATCH/DELETE single item."""

    url = "/api/wishlist_manager/wishlists/{wishlist_id}/items/{item_id}"
    name = "api:wishlist_manager:wishlist_item_detail"
    requires_auth = True

    async def patch(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        api = _api(hass)
        if api is None:
            return web.json_response({"error": "not_loaded"}, status=503)
        wid = request.match_info["wishlist_id"]
        iid = request.match_info["item_id"]
        data = await request.json()
        item = await api.async_update_item(wid, iid, **data)
        if not item:
            return web.json_response({"error": "not_found"}, status=404)
        return web.json_response({"item": item.to_dict()})

    async def delete(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        api = _api(hass)
        if api is None:
            return web.json_response({"error": "not_loaded"}, status=503)
        wid = request.match_info["wishlist_id"]
        iid = request.match_info["item_id"]
        ok = await api.async_delete_item(wid, iid)
        if not ok:
            return web.json_response({"error": "not_found"}, status=404)
        return web.json_response({"success": True})


class MetadataView(HomeAssistantView):
    """GET /api/wishlist_manager/metadata?url=."""

    url = "/api/wishlist_manager/metadata"
    name = "api:wishlist_manager:metadata"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        api = _api(hass)
        if api is None:
            return web.json_response({"error": "not_loaded"}, status=503)
        url = request.query.get("url")
        if not url:
            return web.json_response({"error": "missing_url"}, status=400)
        result = await api.async_fetch_metadata(url)
        return web.json_response(result)


class PublicWishlistView(HomeAssistantView):
    """Unauthenticated read-only share."""

    url = "/api/wishlist_manager/public/{token}"
    name = "api:wishlist_manager:public"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        api = _api(hass)
        if api is None:
            return web.json_response({"error": "not_loaded"}, status=503)
        token = request.match_info["token"]
        wl = api.get_wishlist_by_token(token)
        if not wl:
            return web.json_response({"error": "not_found"}, status=404)
        return web.json_response(api.public_payload(wl))


def register_http_views(hass: HomeAssistant) -> None:
    """Register REST views."""
    hass.http.register_view(WishlistsRootView())
    hass.http.register_view(WishlistsReorderView())
    hass.http.register_view(WishlistDetailView())
    hass.http.register_view(WishlistItemsView())
    hass.http.register_view(WishlistItemsReorderView())
    hass.http.register_view(WishlistItemDetailView())
    hass.http.register_view(MetadataView())
    hass.http.register_view(PublicWishlistView())
