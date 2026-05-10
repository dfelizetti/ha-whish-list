"""WebSocket API for Wishlist Manager."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .api import WishlistApi
from .const import (
    ATTR_ARCHIVED,
    ATTR_COLOR,
    ATTR_DESCRIPTION,
    ATTR_EXTERNAL_URL,
    ATTR_FAVORITE,
    ATTR_ICON,
    ATTR_IMAGE_URL,
    ATTR_ITEM_IDS_ORDER,
    ATTR_ITEM_ID,
    ATTR_NAME,
    ATTR_NOTES,
    ATTR_PRICE,
    ATTR_SHARE_TOKEN,
    ATTR_SORT_ORDER,
    ATTR_STATUS,
    ATTR_TAGS,
    ATTR_TITLE,
    ATTR_URL,
    ATTR_WISHLIST_IDS_ORDER,
    ATTR_WISHLIST_ID,
    DOMAIN,
    WS_TYPE_CREATE_ITEM,
    WS_TYPE_CREATE_WISHLIST,
    WS_TYPE_DELETE_ITEM,
    WS_TYPE_DELETE_WISHLIST,
    WS_TYPE_FETCH_METADATA,
    WS_TYPE_LIST_WISHLISTS,
    WS_TYPE_REGENERATE_SHARE,
    WS_TYPE_REORDER_ITEMS,
    WS_TYPE_REORDER_WISHLISTS,
    WS_TYPE_SET_STATUS,
    WS_TYPE_UPDATE_ITEM,
    WS_TYPE_UPDATE_WISHLIST,
)

_LOGGER = logging.getLogger(__name__)


def _api(hass: HomeAssistant) -> WishlistApi | None:
    block = hass.data.get(DOMAIN)
    if not block:
        return None
    return block.get("api")


def async_register_websocket_handlers(hass: HomeAssistant) -> None:
    """Register all websocket commands."""
    websocket_api.async_register_command(hass, handle_list_wishlists)
    websocket_api.async_register_command(hass, handle_create_wishlist)
    websocket_api.async_register_command(hass, handle_update_wishlist)
    websocket_api.async_register_command(hass, handle_delete_wishlist)
    websocket_api.async_register_command(hass, handle_reorder_wishlists)
    websocket_api.async_register_command(hass, handle_regenerate_share)
    websocket_api.async_register_command(hass, handle_create_item)
    websocket_api.async_register_command(hass, handle_update_item)
    websocket_api.async_register_command(hass, handle_delete_item)
    websocket_api.async_register_command(hass, handle_reorder_items)
    websocket_api.async_register_command(hass, handle_set_status)
    websocket_api.async_register_command(hass, handle_fetch_metadata)


@websocket_api.websocket_command({vol.Required("type"): WS_TYPE_LIST_WISHLISTS})
@callback
def handle_list_wishlists(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return full store snapshot (any authenticated user)."""
    api = _api(hass)
    if api is None:
        connection.send_error(msg["id"], "not_loaded", "Wishlist Manager not loaded")
        return
    connection.send_result(msg["id"], api.serialize_store())


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_CREATE_WISHLIST,
        vol.Required(ATTR_NAME): str,
        vol.Optional(ATTR_ICON): str,
        vol.Optional(ATTR_COLOR): vol.Any(str, None),
    }
)
@websocket_api.async_response
async def handle_create_wishlist(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    api = _api(hass)
    if api is None:
        connection.send_error(msg["id"], "not_loaded", "Wishlist Manager not loaded")
        return
    wl = await api.async_create_wishlist(
        msg[ATTR_NAME],
        icon=msg.get(ATTR_ICON, "mdi:gift-outline"),
        color=msg.get(ATTR_COLOR),
    )
    connection.send_result(msg["id"], {"wishlist": wl.to_dict()})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_UPDATE_WISHLIST,
        vol.Required(ATTR_WISHLIST_ID): str,
        vol.Optional(ATTR_NAME): str,
        vol.Optional(ATTR_ICON): str,
        vol.Optional(ATTR_COLOR): vol.Any(str, None),
        vol.Optional(ATTR_SORT_ORDER): int,
    }
)
@websocket_api.async_response
async def handle_update_wishlist(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    api = _api(hass)
    if api is None:
        connection.send_error(msg["id"], "not_loaded", "Wishlist Manager not loaded")
        return
    wl = await api.async_update_wishlist(
        msg[ATTR_WISHLIST_ID],
        name=msg.get(ATTR_NAME),
        icon=msg.get(ATTR_ICON),
        color=msg.get(ATTR_COLOR),
        sort_order=msg.get(ATTR_SORT_ORDER),
    )
    if not wl:
        connection.send_error(msg["id"], "not_found", "Wishlist not found")
        return
    connection.send_result(msg["id"], {"wishlist": wl.to_dict()})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_DELETE_WISHLIST,
        vol.Required(ATTR_WISHLIST_ID): str,
    }
)
@websocket_api.async_response
async def handle_delete_wishlist(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    api = _api(hass)
    if api is None:
        connection.send_error(msg["id"], "not_loaded", "Wishlist Manager not loaded")
        return
    ok = await api.async_delete_wishlist(msg[ATTR_WISHLIST_ID])
    if not ok:
        connection.send_error(msg["id"], "not_found", "Wishlist not found")
        return
    connection.send_result(msg["id"], {"success": True})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_REORDER_WISHLISTS,
        vol.Required(ATTR_WISHLIST_IDS_ORDER): vol.All(list, vol.Length(min=1)),
    }
)
@websocket_api.async_response
async def handle_reorder_wishlists(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    api = _api(hass)
    if api is None:
        connection.send_error(msg["id"], "not_loaded", "Wishlist Manager not loaded")
        return
    order = [str(x) for x in msg[ATTR_WISHLIST_IDS_ORDER]]
    await api.async_reorder_wishlists(order)
    connection.send_result(msg["id"], api.serialize_store())


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_REGENERATE_SHARE,
        vol.Required(ATTR_WISHLIST_ID): str,
    }
)
@websocket_api.async_response
async def handle_regenerate_share(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    api = _api(hass)
    if api is None:
        connection.send_error(msg["id"], "not_loaded", "Wishlist Manager not loaded")
        return
    token = await api.async_regenerate_share_token(msg[ATTR_WISHLIST_ID])
    if not token:
        connection.send_error(msg["id"], "not_found", "Wishlist not found")
        return
    connection.send_result(
        msg["id"], {ATTR_SHARE_TOKEN: token, ATTR_WISHLIST_ID: msg[ATTR_WISHLIST_ID]}
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_CREATE_ITEM,
        vol.Required(ATTR_WISHLIST_ID): str,
        vol.Required(ATTR_TITLE): str,
        vol.Optional(ATTR_DESCRIPTION): str,
        vol.Optional(ATTR_IMAGE_URL): str,
        vol.Optional(ATTR_EXTERNAL_URL): str,
        vol.Optional(ATTR_NOTES): str,
        vol.Optional(ATTR_STATUS): str,
        vol.Optional(ATTR_PRICE): vol.Any(float, int, None),
        vol.Optional(ATTR_TAGS): list,
        vol.Optional(ATTR_FAVORITE): bool,
        vol.Optional(ATTR_ARCHIVED): bool,
    }
)
@websocket_api.async_response
async def handle_create_item(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    api = _api(hass)
    if api is None:
        connection.send_error(msg["id"], "not_loaded", "Wishlist Manager not loaded")
        return
    tags = msg.get(ATTR_TAGS)
    if tags is not None and not isinstance(tags, list):
        tags = None
    item = await api.async_create_item(
        msg[ATTR_WISHLIST_ID],
        msg[ATTR_TITLE],
        description=msg.get(ATTR_DESCRIPTION, ""),
        image_url=msg.get(ATTR_IMAGE_URL, ""),
        external_url=msg.get(ATTR_EXTERNAL_URL, ""),
        notes=msg.get(ATTR_NOTES, ""),
        status=msg.get(ATTR_STATUS, "desired"),
        price=msg.get(ATTR_PRICE),
        tags=tags,
        favorite=bool(msg.get(ATTR_FAVORITE, False)),
        archived=bool(msg.get(ATTR_ARCHIVED, False)),
    )
    if not item:
        connection.send_error(msg["id"], "not_found", "Wishlist not found")
        return
    connection.send_result(msg["id"], {"item": item.to_dict()})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_UPDATE_ITEM,
        vol.Required(ATTR_WISHLIST_ID): str,
        vol.Required(ATTR_ITEM_ID): str,
        vol.Optional(ATTR_TITLE): str,
        vol.Optional(ATTR_DESCRIPTION): str,
        vol.Optional(ATTR_IMAGE_URL): str,
        vol.Optional(ATTR_EXTERNAL_URL): str,
        vol.Optional(ATTR_NOTES): str,
        vol.Optional(ATTR_STATUS): str,
        vol.Optional(ATTR_PRICE): vol.Any(float, int, None),
        vol.Optional(ATTR_TAGS): list,
        vol.Optional(ATTR_FAVORITE): bool,
        vol.Optional(ATTR_ARCHIVED): bool,
        vol.Optional(ATTR_SORT_ORDER): int,
    }
)
@websocket_api.async_response
async def handle_update_item(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    api = _api(hass)
    if api is None:
        connection.send_error(msg["id"], "not_loaded", "Wishlist Manager not loaded")
        return
    skip = {"id", "type", ATTR_WISHLIST_ID, ATTR_ITEM_ID}
    fields = {k: v for k, v in msg.items() if k not in skip}
    item = await api.async_update_item(
        msg[ATTR_WISHLIST_ID],
        msg[ATTR_ITEM_ID],
        **fields,
    )
    if not item:
        connection.send_error(msg["id"], "not_found", "Item not found")
        return
    connection.send_result(msg["id"], {"item": item.to_dict()})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_DELETE_ITEM,
        vol.Required(ATTR_WISHLIST_ID): str,
        vol.Required(ATTR_ITEM_ID): str,
    }
)
@websocket_api.async_response
async def handle_delete_item(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    api = _api(hass)
    if api is None:
        connection.send_error(msg["id"], "not_loaded", "Wishlist Manager not loaded")
        return
    ok = await api.async_delete_item(msg[ATTR_WISHLIST_ID], msg[ATTR_ITEM_ID])
    if not ok:
        connection.send_error(msg["id"], "not_found", "Item not found")
        return
    connection.send_result(msg["id"], {"success": True})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_REORDER_ITEMS,
        vol.Required(ATTR_WISHLIST_ID): str,
        vol.Required(ATTR_ITEM_IDS_ORDER): vol.All(list, vol.Length(min=1)),
    }
)
@websocket_api.async_response
async def handle_reorder_items(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    api = _api(hass)
    if api is None:
        connection.send_error(msg["id"], "not_loaded", "Wishlist Manager not loaded")
        return
    order = [str(x) for x in msg[ATTR_ITEM_IDS_ORDER]]
    ok = await api.async_reorder_items(msg[ATTR_WISHLIST_ID], order)
    if not ok:
        connection.send_error(msg["id"], "not_found", "Wishlist not found")
        return
    connection.send_result(msg["id"], api.serialize_store())


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_SET_STATUS,
        vol.Required(ATTR_WISHLIST_ID): str,
        vol.Required(ATTR_ITEM_ID): str,
        vol.Required(ATTR_STATUS): str,
    }
)
@websocket_api.async_response
async def handle_set_status(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    api = _api(hass)
    if api is None:
        connection.send_error(msg["id"], "not_loaded", "Wishlist Manager not loaded")
        return
    item = await api.async_set_item_status(
        msg[ATTR_WISHLIST_ID], msg[ATTR_ITEM_ID], msg[ATTR_STATUS]
    )
    if not item:
        connection.send_error(msg["id"], "not_found", "Item not found")
        return
    connection.send_result(msg["id"], {"item": item.to_dict()})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_FETCH_METADATA,
        vol.Required(ATTR_URL): str,
    }
)
@websocket_api.async_response
async def handle_fetch_metadata(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    api = _api(hass)
    if api is None:
        connection.send_error(msg["id"], "not_loaded", "Wishlist Manager not loaded")
        return
    result = await api.async_fetch_metadata(msg[ATTR_URL])
    connection.send_result(msg["id"], result)
