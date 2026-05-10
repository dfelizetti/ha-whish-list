"""Constants for the Wishlist Manager integration."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "wishlist_manager"
INTEGRATION_VERSION: Final = "1.3.2"
STORAGE_KEY: Final = f"{DOMAIN}"
STORAGE_VERSION: Final = 1

# Uploaded item images: <config>/www/<subdir>/ (HTTP path /local/<subdir>/)
WWW_UPLOAD_SUBDIR: Final = "wishlist_manager"

SIGNAL_DATA_UPDATED: Final = f"{DOMAIN}_data_updated"

CONF_TITLE: Final = "title"

ATTR_WISHLIST_ID: Final = "wishlist_id"
ATTR_ITEM_ID: Final = "item_id"
ATTR_TITLE: Final = "title"
ATTR_DESCRIPTION: Final = "description"
ATTR_IMAGE_URL: Final = "image_url"
ATTR_EXTERNAL_URL: Final = "external_url"
ATTR_NOTES: Final = "notes"
ATTR_STATUS: Final = "status"
ATTR_NAME: Final = "name"
ATTR_ICON: Final = "icon"
ATTR_COLOR: Final = "color"
ATTR_PRICE: Final = "price"
ATTR_TAGS: Final = "tags"
ATTR_FAVORITE: Final = "favorite"
ATTR_ARCHIVED: Final = "archived"
ATTR_SORT_ORDER: Final = "sort_order"
ATTR_WISHLIST_IDS_ORDER: Final = "wishlist_ids"
ATTR_ITEM_IDS_ORDER: Final = "item_ids"
ATTR_URL: Final = "url"
ATTR_SHARE_TOKEN: Final = "share_token"

STATUS_DESIRED: Final = "desired"
STATUS_MAYBE: Final = "maybe"
STATUS_PURCHASED: Final = "purchased"

STATUSES: Final[tuple[str, ...]] = (STATUS_DESIRED, STATUS_MAYBE, STATUS_PURCHASED)

EVENT_ITEM_ADDED: Final = f"{DOMAIN}_item_added"
EVENT_ITEM_UPDATED: Final = f"{DOMAIN}_item_updated"
EVENT_ITEM_REMOVED: Final = f"{DOMAIN}_item_removed"
EVENT_ITEM_PURCHASED: Final = f"{DOMAIN}_item_purchased"
EVENT_WISHLIST_CREATED: Final = f"{DOMAIN}_wishlist_created"
EVENT_WISHLIST_UPDATED: Final = f"{DOMAIN}_wishlist_updated"
EVENT_WISHLIST_REMOVED: Final = f"{DOMAIN}_wishlist_removed"

WS_TYPE_LIST_WISHLISTS: Final = f"{DOMAIN}/wishlists/list"
WS_TYPE_CREATE_WISHLIST: Final = f"{DOMAIN}/wishlists/create"
WS_TYPE_UPDATE_WISHLIST: Final = f"{DOMAIN}/wishlists/update"
WS_TYPE_DELETE_WISHLIST: Final = f"{DOMAIN}/wishlists/delete"
WS_TYPE_REORDER_WISHLISTS: Final = f"{DOMAIN}/wishlists/reorder"
WS_TYPE_CREATE_ITEM: Final = f"{DOMAIN}/items/create"
WS_TYPE_UPDATE_ITEM: Final = f"{DOMAIN}/items/update"
WS_TYPE_DELETE_ITEM: Final = f"{DOMAIN}/items/delete"
WS_TYPE_REORDER_ITEMS: Final = f"{DOMAIN}/items/reorder"
WS_TYPE_SET_STATUS: Final = f"{DOMAIN}/items/set_status"
WS_TYPE_FETCH_METADATA: Final = f"{DOMAIN}/metadata/fetch"
WS_TYPE_REGENERATE_SHARE: Final = f"{DOMAIN}/wishlists/regenerate_share"
