import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { wmLoc } from "./i18n.js";
import type {
  HomeAssistant,
  ItemStatus,
  SortMode,
  StoreSnapshot,
  WishlistData,
  WishlistItemData,
} from "./types.js";

const WS = {
  LIST: "wishlist_manager/wishlists/list",
  CREATE_WL: "wishlist_manager/wishlists/create",
  UPDATE_WL: "wishlist_manager/wishlists/update",
  DELETE_WL: "wishlist_manager/wishlists/delete",
  REORDER_WL: "wishlist_manager/wishlists/reorder",
  REGEN_SHARE: "wishlist_manager/wishlists/regenerate_share",
  CREATE_ITEM: "wishlist_manager/items/create",
  UPDATE_ITEM: "wishlist_manager/items/update",
  DELETE_ITEM: "wishlist_manager/items/delete",
  REORDER_ITEMS: "wishlist_manager/items/reorder",
  SET_STATUS: "wishlist_manager/items/set_status",
  FETCH_META: "wishlist_manager/metadata/fetch",
} as const;

async function callWs(
  hass: HomeAssistant,
  msg: Record<string, unknown>
): Promise<unknown> {
  if (typeof hass.callWS === "function") {
    return hass.callWS(msg);
  }
  return hass.connection.sendMessagePromise(msg);
}

function isAdmin(hass: HomeAssistant): boolean {
  const u = (hass as unknown as {
    user?: { is_admin?: boolean; is_owner?: boolean };
  }).user;
  return Boolean(u?.is_admin || u?.is_owner);
}

function statusOrder(s: string): number {
  if (s === "desired") return 0;
  if (s === "maybe") return 1;
  return 2;
}

@customElement("wishlist-manager-panel")
export class WishlistManagerPanel extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;

  @property({ type: Boolean, reflect: true }) narrow = false;

  /** Set by Home Assistant shell (unused but required for panel protocol). */
  @property({ attribute: false }) route?: unknown;

  @property({ attribute: false }) panel?: unknown;

  @state() private _snapshot: StoreSnapshot | null = null;

  @state() private _loading = true;

  @state() private _error: string | null = null;

  @state() private _selectedWishlistId: string | "all" = "all";

  @state() private _filterStatus: "all" | ItemStatus | "archived" = "all";

  @state() private _search = "";

  @state() private _sort: SortMode = "newest";

  @state() private _editorOpen = false;

  @state() private _editingWishlistId: string | null = null;

  @state() private _editingItem: WishlistItemData | null = null;

  @state() private _isNewItem = false;

  @state() private _shareUrl: string | null = null;

  static styles = css`
    :host {
      display: block;
      min-height: 100%;
      padding: 16px;
      box-sizing: border-box;
      background: var(--lovelace-background, var(--primary-background-color));
      color: var(--primary-text-color);
      --wm-radius: 16px;
      --wm-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      --wm-card-bg: var(--card-background-color, rgba(255, 255, 255, 0.06));
      --wm-muted: var(--secondary-text-color);
      --wm-accent: var(--primary-color);
      --wm-border: var(--divider-color, rgba(127, 127, 127, 0.2));
      transition: background 0.25s ease, color 0.2s ease;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      margin-bottom: 20px;
    }

    .toolbar input[type="search"],
    .toolbar select {
      border-radius: 12px;
      border: 1px solid var(--wm-border);
      padding: 10px 14px;
      background: var(--wm-card-bg);
      color: inherit;
      font: inherit;
      min-width: 140px;
    }

    .toolbar input[type="search"] {
      flex: 1 1 200px;
    }

    .btn {
      border: none;
      border-radius: 12px;
      padding: 10px 16px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      background: color-mix(in srgb, var(--wm-accent) 18%, transparent);
      color: var(--wm-accent);
      transition: transform 0.15s ease, box-shadow 0.2s ease,
        background 0.2s ease;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: var(--wm-shadow);
    }

    .btn-primary {
      background: var(--wm-accent);
      color: var(--text-primary-color, #fff);
    }

    .btn-ghost {
      background: transparent;
      border: 1px solid var(--wm-border);
      color: inherit;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: var(--wm-card-bg);
      border-radius: var(--wm-radius);
      padding: 16px;
      box-shadow: var(--wm-shadow);
      border: 1px solid var(--wm-border);
      animation: fadeUp 0.4s ease both;
    }

    .stat-card b {
      display: block;
      font-size: 1.75rem;
      letter-spacing: -0.02em;
    }

    .stat-card span {
      color: var(--wm-muted);
      font-size: 0.85rem;
    }

    @keyframes fadeUp {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 8px 0 12px;
      letter-spacing: -0.01em;
    }

    .recent {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 8px;
      margin-bottom: 24px;
      scroll-snap-type: x mandatory;
    }

    .recent-card {
      flex: 0 0 220px;
      scroll-snap-align: start;
      background: var(--wm-card-bg);
      border-radius: var(--wm-radius);
      overflow: hidden;
      border: 1px solid var(--wm-border);
      box-shadow: var(--wm-shadow);
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .recent-card:hover {
      transform: scale(1.02);
    }

    .recent-card img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      background: color-mix(in srgb, var(--wm-muted) 12%, transparent);
    }

    .recent-card .meta {
      padding: 10px 12px 12px;
    }

    .wishlists-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 999px;
      background: var(--wm-card-bg);
      border: 1px solid var(--wm-border);
      cursor: grab;
      user-select: none;
      transition: background 0.2s ease, border-color 0.2s ease;
    }

    .chip.active {
      border-color: var(--wm-accent);
      background: color-mix(in srgb, var(--wm-accent) 12%, transparent);
    }

    .chip ha-icon,
    .chip mwc-icon {
      --mdc-icon-size: 18px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }

    .item-card {
      background: var(--wm-card-bg);
      border-radius: var(--wm-radius);
      border: 1px solid var(--wm-border);
      box-shadow: var(--wm-shadow);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 280px;
      cursor: grab;
      transition: transform 0.2s ease, box-shadow 0.25s ease;
      animation: fadeUp 0.45s ease both;
    }

    .item-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    }

    .item-card .hero {
      position: relative;
      height: 160px;
      background: linear-gradient(
        145deg,
        color-mix(in srgb, var(--wm-accent) 25%, transparent),
        transparent
      );
    }

    .item-card .hero img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .badge {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      backdrop-filter: blur(6px);
    }

    .badge.desired {
      background: rgba(76, 175, 80, 0.9);
    }

    .badge.maybe {
      background: rgba(255, 152, 0, 0.95);
    }

    .badge.purchased {
      background: rgba(33, 150, 243, 0.95);
    }

    .item-body {
      padding: 14px 16px 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .item-title {
      font-weight: 700;
      font-size: 1.05rem;
      line-height: 1.3;
    }

    .item-desc {
      color: var(--wm-muted);
      font-size: 0.88rem;
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .item-desc.item-desc-link {
      color: var(--wm-accent);
      cursor: pointer;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 2px;
    }

    .item-desc.item-desc-link:hover {
      filter: brightness(1.08);
    }

    .wm-file-upload {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .wm-file-upload input[type="file"] {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .item-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: auto;
    }

    .tag {
      font-size: 0.72rem;
      padding: 2px 8px;
      border-radius: 6px;
      background: color-mix(in srgb, var(--wm-muted) 18%, transparent);
      color: var(--wm-muted);
    }

    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .actions .btn {
      padding: 6px 12px;
      font-size: 0.82rem;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
      box-sizing: border-box;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal {
      width: min(520px, 100%);
      max-height: 90vh;
      overflow: auto;
      background: var(--wm-card-bg);
      border-radius: var(--wm-radius) var(--wm-radius) 0 0;
      padding: 20px;
      border: 1px solid var(--wm-border);
      box-shadow: var(--wm-shadow);
      animation: slideUp 0.28s ease;
    }

    @media (min-width: 600px) {
      .modal-backdrop {
        align-items: center;
      }
      .modal {
        border-radius: var(--wm-radius);
      }
    }

    @keyframes slideUp {
      from {
        transform: translateY(24px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal h2 {
      margin: 0 0 16px;
      font-size: 1.25rem;
    }

    .field {
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field label,
    .field .field-label-like {
      font-size: 0.82rem;
      color: var(--wm-muted);
      font-weight: 600;
    }

    .field input,
    .field textarea,
    .field select {
      border-radius: 10px;
      border: 1px solid var(--wm-border);
      padding: 10px 12px;
      font: inherit;
      background: var(--primary-background-color);
      color: inherit;
    }

    .field textarea {
      min-height: 72px;
      resize: vertical;
    }

    .row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }

    .error {
      color: var(--error-color, #f44336);
      margin: 8px 0;
      font-size: 0.9rem;
    }

    .empty {
      text-align: center;
      padding: 48px 16px;
      color: var(--wm-muted);
    }

    .fav {
      color: #ffc107;
    }

    .mobile-topbar {
      position: sticky;
      top: 0;
      z-index: 6;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: -16px -16px 14px -16px;
      padding: 10px 16px;
      background: var(--app-header-background-color, var(--wm-card-bg));
      color: var(--app-header-text-color, var(--primary-text-color));
      border-bottom: 1px solid var(--wm-border);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    }

    .mobile-topbar .btn-icon {
      min-width: 44px;
      min-height: 44px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      line-height: 1;
      border-radius: 12px;
      background: color-mix(in srgb, var(--wm-accent) 15%, transparent);
      color: inherit;
      border: 1px solid var(--wm-border);
      cursor: pointer;
    }

    .mobile-topbar .mobile-title {
      flex: 1;
      font-weight: 700;
      font-size: 1.05rem;
      letter-spacing: -0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mobile-topbar .btn-back {
      padding: 8px 12px;
      font-size: 0.88rem;
    }
  `;

  private _t(
    subkey: string,
    fallback: string,
    params?: Record<string, string | number>
  ): string {
    return wmLoc(this.hass, subkey, fallback, params);
  }

  private _statusLabel(s: string): string {
    if (s === "purchased") return this._t("status_purchased", "Purchased");
    if (s === "maybe") return this._t("status_maybe", "Maybe");
    return this._t("status_desired", "Desired");
  }

  /**
   * HA hides the default hamburger on some custom-panel routes on mobile.
   * `ha-menu-button` uses the same event to open the drawer.
   */
  private _toggleHaSidebar(): void {
    this.dispatchEvent(
      new Event("hass-toggle-menu", { bubbles: true, composed: true })
    );
  }

  private _mobileBack(): void {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.assign("/");
  }

  connectedCallback(): void {
    super.connectedCallback();
    void this._refresh();
  }

  updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has("hass") && this.hass) {
      void this._refresh();
      // Home Assistant Companion often finishes wiring `localize` / resources
      // one tick after the panel first paints — re-render so labels are not blank.
      queueMicrotask(() => {
        if (this.isConnected) {
          this.requestUpdate();
        }
      });
    }
  }

  private async _refresh(): Promise<void> {
    if (!this.hass) return;
    this._loading = true;
    this._error = null;
    try {
      const res = (await callWs(this.hass, { type: WS.LIST })) as StoreSnapshot;
      this._snapshot = res;
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    } finally {
      this._loading = false;
    }
  }

  private _wishlistsSorted(): WishlistData[] {
    if (!this._snapshot) return [];
    return [...this._snapshot.wishlists].sort(
      (a, b) => a.sort_order - b.sort_order
    );
  }

  private _filteredItems(): WishlistItemData[] {
    if (!this._snapshot) return [];
    const q = this._search.trim().toLowerCase();
    let lists =
      this._selectedWishlistId === "all"
        ? this._snapshot.wishlists
        : this._snapshot.wishlists.filter(
            (w) => w.id === this._selectedWishlistId
          );

    let items: { wl: WishlistData; item: WishlistItemData }[] = [];
    for (const wl of lists) {
      for (const it of wl.items) {
        if (this._filterStatus === "archived") {
          if (!it.archived) continue;
        } else if (it.archived) {
          continue;
        }
        if (this._filterStatus !== "all" && this._filterStatus !== "archived") {
          if (it.status !== this._filterStatus) continue;
        }
        if (q) {
          const hay = `${it.title} ${it.description} ${it.notes} ${it.tags.join(" ")}`.toLowerCase();
          if (!hay.includes(q)) continue;
        }
        items.push({ wl, item: it });
      }
    }

    const cmpAlpha = (a: WishlistItemData, b: WishlistItemData) =>
      a.title.localeCompare(b.title);
    const cmpNew = (a: WishlistItemData, b: WishlistItemData) =>
      b.created_at.localeCompare(a.created_at);
    const cmpOld = (a: WishlistItemData, b: WishlistItemData) =>
      a.created_at.localeCompare(b.created_at);
    const cmpStat = (a: WishlistItemData, b: WishlistItemData) =>
      statusOrder(a.status) - statusOrder(b.status) ||
      a.title.localeCompare(b.title);

    items.sort((A, B) => {
      if (this._sort === "alpha") return cmpAlpha(A.item, B.item);
      if (this._sort === "oldest") return cmpOld(A.item, B.item);
      if (this._sort === "status") return cmpStat(A.item, B.item);
      return cmpNew(A.item, B.item);
    });

    return items.map((x) => x.item);
  }

  private _contextForItem(itemId: string): {
    wishlist: WishlistData;
    item: WishlistItemData;
  } | null {
    if (!this._snapshot) return null;
    for (const wl of this._snapshot.wishlists) {
      const it = wl.items.find((i) => i.id === itemId);
      if (it) return { wishlist: wl, item: it };
    }
    return null;
  }

  private _recentItems(): WishlistItemData[] {
    if (!this._snapshot) return [];
    const all: WishlistItemData[] = [];
    for (const wl of this._snapshot.wishlists) {
      for (const it of wl.items) {
        if (!it.archived) all.push(it);
      }
    }
    return all
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 12);
  }

  private async _mutate(
    fn: () => Promise<unknown>,
    refresh = true
  ): Promise<void> {
    try {
      await fn();
      if (refresh) await this._refresh();
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    }
  }

  private _openCreateItem(wishlistId: string): void {
    this._editingWishlistId = wishlistId;
    this._editingItem = null;
    this._isNewItem = true;
    this._editorOpen = true;
  }

  private _openEditItem(wishlistId: string, item: WishlistItemData): void {
    this._editingWishlistId = wishlistId;
    this._editingItem = { ...item };
    this._isNewItem = false;
    this._editorOpen = true;
  }

  private _closeEditor(): void {
    this._editorOpen = false;
    this._editingItem = null;
    this._editingWishlistId = null;
  }

  private async _saveEditor(ev: Event): Promise<void> {
    ev.preventDefault();
    if (!this.hass || !this._editingWishlistId || !isAdmin(this.hass)) return;
    const form = ev.target as HTMLFormElement;
    const fd = new FormData(form);
    const title = String(fd.get("title") || "").trim();
    if (!title) return;

    const payload = {
      title,
      description: String(fd.get("description") || ""),
      image_url: String(fd.get("image_url") || ""),
      external_url: String(fd.get("external_url") || ""),
      notes: String(fd.get("notes") || ""),
      status: String(fd.get("status") || "desired"),
      price: (() => {
        const p = String(fd.get("price") || "").trim();
        if (!p) return null;
        const n = Number(p);
        return Number.isFinite(n) ? n : null;
      })(),
      tags: String(fd.get("tags") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      favorite: fd.get("favorite") === "on",
      archived: fd.get("archived") === "on",
    };

    if (this._isNewItem) {
      await this._mutate(() =>
        callWs(this.hass, {
          type: WS.CREATE_ITEM,
          wishlist_id: this._editingWishlistId,
          ...payload,
        })
      );
    } else if (this._editingItem) {
      await this._mutate(() =>
        callWs(this.hass, {
          type: WS.UPDATE_ITEM,
          wishlist_id: this._editingWishlistId,
          item_id: this._editingItem!.id,
          ...payload,
        })
      );
    }
    this._closeEditor();
  }

  private async _deleteCurrentItem(): Promise<void> {
    if (
      !this.hass ||
      !this._editingWishlistId ||
      !this._editingItem ||
      this._isNewItem
    )
      return;
    if (!confirm(this._t("confirm_delete_item", "Delete this item permanently?")))
      return;
    await this._mutate(() =>
      callWs(this.hass, {
        type: WS.DELETE_ITEM,
        wishlist_id: this._editingWishlistId,
        item_id: this._editingItem!.id,
      })
    );
    this._closeEditor();
  }

  private async _quickSetStatus(
    wishlistId: string,
    item: WishlistItemData,
    status: ItemStatus
  ): Promise<void> {
    if (!this.hass) return;
    await this._mutate(() =>
      callWs(this.hass, {
        type: WS.SET_STATUS,
        wishlist_id: wishlistId,
        item_id: item.id,
        status,
      })
    );
  }

  private async _createWishlist(): Promise<void> {
    const name = prompt(
      this._t("prompt_wishlist_name", "Wishlist name?"),
      this._t("default_new_wishlist", "New wishlist")
    );
    if (!name || !this.hass) return;
    await this._mutate(() =>
      callWs(this.hass, {
        type: WS.CREATE_WL,
        name: name.trim(),
        icon: "mdi:gift-outline",
      })
    );
  }

  private async _renameWishlist(wl: WishlistData): Promise<void> {
    const name = prompt(this._t("prompt_rename_wishlist", "Rename wishlist"), wl.name);
    if (!name || !this.hass) return;
    await this._mutate(() =>
      callWs(this.hass, {
        type: WS.UPDATE_WL,
        wishlist_id: wl.id,
        name: name.trim(),
      })
    );
  }

  private async _deleteWishlist(wl: WishlistData): Promise<void> {
    if (
      !confirm(
        this._t(
          "confirm_delete_wishlist",
          'Delete wishlist "{name}" and all items?',
          { name: wl.name }
        )
      )
    )
      return;
    if (!this.hass) return;
    await this._mutate(() =>
      callWs(this.hass, {
        type: WS.DELETE_WL,
        wishlist_id: wl.id,
      })
    );
    if (this._selectedWishlistId === wl.id) this._selectedWishlistId = "all";
  }

  private async _onDropWishlist(ev: DragEvent, targetId: string): Promise<void> {
    ev.preventDefault();
    const src = ev.dataTransfer?.getData("text/wishlist-id");
    if (!src || src === targetId || !this.hass || !this._snapshot) return;
    const order = this._wishlistsSorted().map((w) => w.id);
    const fi = order.indexOf(src);
    const ti = order.indexOf(targetId);
    if (fi < 0 || ti < 0) return;
    order.splice(fi, 1);
    order.splice(ti, 0, src);
    await this._mutate(() =>
      callWs(this.hass, { type: WS.REORDER_WL, wishlist_ids: order })
    );
  }

  private async _onDropItem(
    ev: DragEvent,
    wishlistId: string,
    targetItemId: string
  ): Promise<void> {
    ev.preventDefault();
    const src = ev.dataTransfer?.getData("text/item-id");
    if (!src || src === targetItemId || !this.hass) return;
    const wl = this._snapshot?.wishlists.find((w) => w.id === wishlistId);
    if (!wl) return;
    const order = [...wl.items]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => i.id);
    const fi = order.indexOf(src);
    const ti = order.indexOf(targetItemId);
    if (fi < 0 || ti < 0) return;
    order.splice(fi, 1);
    order.splice(ti, 0, src);
    await this._mutate(() =>
      callWs(this.hass, {
        type: WS.REORDER_ITEMS,
        wishlist_id: wishlistId,
        item_ids: order,
      })
    );
  }

  private _openExternalLink(url: string): void {
    const u = url.trim();
    if (!u || !/^https?:\/\//i.test(u)) return;
    window.open(u, "_blank", "noopener,noreferrer");
  }

  private _onItemDescriptionClick(ev: Event, externalUrl: string): void {
    const u = String(externalUrl || "").trim();
    if (!u) return;
    ev.preventDefault();
    ev.stopPropagation();
    this._openExternalLink(u);
  }

  private async _uploadItemImage(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.hass) {
      input.value = "";
      return;
    }
    const fetchWithAuth =
      typeof this.hass.fetchWithAuth === "function"
        ? this.hass.fetchWithAuth.bind(this.hass)
        : undefined;
    if (!fetchWithAuth) {
      this._error = this._t(
        "upload_no_auth",
        "Upload requires Home Assistant sign-in (admin)."
      );
      input.value = "";
      return;
    }
    this._error = null;
    const fd = new FormData();
    fd.append("file", file);
    // HA's fetchWithAuth concatenates auth.data.hassUrl + path. Passing an
    // absolute URL (e.g. from hass.hassUrl) would double the origin and break fetch.
    const uploadPath = "/api/wishlist_manager/upload_image";
    try {
      const res = await fetchWithAuth(uploadPath, {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { image_url?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || res.statusText);
      }
      const form = this.shadowRoot?.querySelector(
        "form#editor-form"
      ) as HTMLFormElement | null;
      const img = form?.querySelector<HTMLInputElement>('[name="image_url"]');
      if (img && data.image_url) {
        img.value = data.image_url;
      }
      this.requestUpdate();
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    } finally {
      input.value = "";
    }
  }

  private async _fetchMetadata(): Promise<void> {
    if (!this.hass) return;
    const form = this.shadowRoot?.querySelector(
      "form#editor-form"
    ) as HTMLFormElement | null;
    const url = String(form?.querySelector<HTMLInputElement>('[name="external_url"]')?.value || "").trim();
    if (!url) {
      this._error = this._t("error_add_link_first", "Add a link first.");
      return;
    }
    try {
      const meta = (await callWs(this.hass, {
        type: WS.FETCH_META,
        url,
      })) as {
        title?: string | null;
        image?: string | null;
        description?: string | null;
      };
      if (!form) return;
      const title = form.querySelector<HTMLInputElement>('[name="title"]');
      const img = form.querySelector<HTMLInputElement>('[name="image_url"]');
      const desc = form.querySelector<HTMLTextAreaElement>(
        '[name="description"]'
      );
      if (meta.title && title && !title.value) title.value = meta.title;
      if (meta.image && img && !img.value) img.value = meta.image;
      if (meta.description && desc && !desc.value)
        desc.value = meta.description;
      this.requestUpdate();
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    }
  }

  private async _enableShare(wl: WishlistData): Promise<void> {
    if (!this.hass) return;
    try {
      const res = (await callWs(this.hass, {
        type: WS.REGEN_SHARE,
        wishlist_id: wl.id,
      })) as { share_token: string };
      const origin = window.location.origin;
      this._shareUrl = `${origin}/api/wishlist_manager/public/${res.share_token}`;
      await this._refresh();
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    }
  }

  private _copyShare(): void {
    if (!this._shareUrl) return;
    void navigator.clipboard.writeText(this._shareUrl);
  }

  render() {
    if (!this.hass) {
      return html`<div class="empty">
        ${this._t("waiting_ha", "Waiting for Home Assistant…")}
      </div>`;
    }
    if (this._loading && !this._snapshot) {
      return html`<div class="empty">${this._t("loading", "Loading wishlists…")}</div>`;
    }

    const stats = this._snapshot?.stats;
    const admin = isAdmin(this.hass);

    return html`
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}

      ${this.narrow
        ? html`
            <div class="mobile-topbar">
              <button
                type="button"
                class="btn-icon"
                aria-label=${this._t("open_sidebar", "Open menu")}
                @click=${this._toggleHaSidebar}
              >
                ☰
              </button>
              <span class="mobile-title">
                ${this._t("mobile_header_title", "Wishlist Manager")}
              </span>
              <button
                type="button"
                class="btn btn-ghost btn-back"
                @click=${this._mobileBack}
              >
                ${this._t("back", "Back")}
              </button>
            </div>
          `
        : nothing}

      <div class="toolbar">
        <input
          type="search"
          placeholder=${this._t(
            "search_placeholder",
            "Search title, notes, tags…"
          )}
          .value=${this._search}
          @input=${(e: Event) => {
            this._search = (e.target as HTMLInputElement).value;
          }}
        />
        <select
          @change=${(e: Event) => {
            this._filterStatus = (e.target as HTMLSelectElement)
              .value as typeof this._filterStatus;
          }}
        >
          <option value="all" ?selected=${this._filterStatus === "all"}>
            ${this._t("filter_all_status", "All statuses")}
          </option>
          <option value="desired" ?selected=${this._filterStatus === "desired"}>
            ${this._t("filter_desired", "Desired")}
          </option>
          <option value="maybe" ?selected=${this._filterStatus === "maybe"}>
            ${this._t("filter_maybe", "Maybe")}
          </option>
          <option
            value="purchased"
            ?selected=${this._filterStatus === "purchased"}
          >
            ${this._t("filter_purchased", "Purchased")}
          </option>
          <option
            value="archived"
            ?selected=${this._filterStatus === "archived"}
          >
            ${this._t("filter_archived_only", "Archived only")}
          </option>
        </select>
        <select
          @change=${(e: Event) => {
            this._selectedWishlistId = (e.target as HTMLSelectElement)
              .value as typeof this._selectedWishlistId;
          }}
        >
          <option value="all" ?selected=${this._selectedWishlistId === "all"}>
            ${this._t("filter_all_lists", "All wishlists")}
          </option>
          ${this._wishlistsSorted().map(
            (w) => html`
              <option value=${w.id} ?selected=${this._selectedWishlistId === w.id}>
                ${w.name}
              </option>
            `
          )}
        </select>
        <select
          @change=${(e: Event) => {
            this._sort = (e.target as HTMLSelectElement).value as SortMode;
          }}
        >
          <option value="newest" ?selected=${this._sort === "newest"}>
            ${this._t("sort_newest", "Newest")}
          </option>
          <option value="oldest" ?selected=${this._sort === "oldest"}>
            ${this._t("sort_oldest", "Oldest")}
          </option>
          <option value="alpha" ?selected=${this._sort === "alpha"}>
            ${this._t("sort_alpha", "A–Z")}
          </option>
          <option value="status" ?selected=${this._sort === "status"}>
            ${this._t("sort_status", "Status")}
          </option>
        </select>
        ${admin
          ? html`<button class="btn btn-primary" @click=${this._createWishlist}>
              ${this._t("new_wishlist", "New wishlist")}
            </button>`
          : nothing}
        <button class="btn btn-ghost" @click=${() => this._refresh()}>
          ${this._t("refresh", "Refresh")}
        </button>
      </div>

      ${!this.narrow && stats
        ? html`
            <div class="stats">
              <div class="stat-card" style="animation-delay:0ms">
                <b>${stats.total_items}</b
                ><span>${this._t("stat_total", "Total items")}</span>
              </div>
              <div class="stat-card" style="animation-delay:40ms">
                <b>${stats.purchased_items}</b
                ><span>${this._t("stat_purchased", "Purchased")}</span>
              </div>
              <div class="stat-card" style="animation-delay:80ms">
                <b>${stats.desired_items}</b
                ><span>${this._t("stat_desired", "Desired")}</span>
              </div>
              <div class="stat-card" style="animation-delay:120ms">
                <b>${stats.wishlist_count}</b
                ><span>${this._t("stat_wishlists", "Wishlists")}</span>
              </div>
            </div>
          `
        : nothing}

      ${!this.narrow
        ? html`
            <div class="section-title">
              ${this._t("recently_added", "Recently added")}
            </div>
            <div class="recent">
              ${this._recentItems().map(
                (it) => html`
                  <div
                    class="recent-card"
                    @click=${() => {
                      const ctx = this._contextForItem(it.id);
                      if (ctx) this._openEditItem(ctx.wishlist.id, ctx.item);
                    }}
                  >
                    ${it.image_url
                      ? html`<img src=${it.image_url} alt="" loading="lazy" />`
                      : html`<div
                          style="height:120px;background:var(--divider-color)"
                        ></div>`}
                    <div class="meta">
                      <strong>${it.title}</strong>
                      <div style="font-size:0.8rem;color:var(--wm-muted)">
                        ${this._statusLabel(it.status)}
                      </div>
                    </div>
                  </div>
                `
              )}
            </div>
          `
        : nothing}

      <div class="section-title">
        ${this._t("section_wishlists", "Wishlists")}
      </div>
      <div class="wishlists-row">
        ${this._wishlistsSorted().map(
          (wl) => html`
            <div
              class="chip ${this._selectedWishlistId === wl.id ? "active" : ""}"
              draggable="true"
              @dragstart=${(e: DragEvent) => {
                e.dataTransfer?.setData("text/wishlist-id", wl.id);
              }}
              @dragover=${(e: DragEvent) => e.preventDefault()}
              @drop=${(e: DragEvent) => this._onDropWishlist(e, wl.id)}
              @click=${() => {
                this._selectedWishlistId = wl.id;
              }}
            >
              <span>${wl.name}</span>
              ${admin
                ? html`
                    <button
                      class="btn btn-ghost"
                      style="padding:2px 8px;font-size:0.7rem"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._renameWishlist(wl);
                      }}
                    >
                      ${this._t("rename", "Rename")}
                    </button>
                    <button
                      class="btn btn-ghost"
                      style="padding:2px 8px;font-size:0.7rem"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._deleteWishlist(wl);
                      }}
                    >
                      ${this._t("delete", "Delete")}
                    </button>
                    <button
                      class="btn btn-ghost"
                      style="padding:2px 8px;font-size:0.7rem"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        void this._enableShare(wl);
                      }}
                    >
                      ${this._t("share_link", "Share link")}
                    </button>
                  `
                : nothing}
            </div>
          `
        )}
      </div>

      ${this._shareUrl
        ? html`
            <div class="field">
              <label>${this._t("share_public_label", "Public link (read-only)")}</label>
              <div class="row">
                <input
                  readonly
                  style="flex:1"
                  .value=${this._shareUrl}
                />
                <button type="button" class="btn" @click=${this._copyShare}>
                  ${this._t("copy", "Copy")}
                </button>
                <button
                  type="button"
                  class="btn btn-ghost"
                  @click=${() => {
                    this._shareUrl = null;
                  }}
                >
                  ${this._t("close", "Close")}
                </button>
              </div>
            </div>
          `
        : nothing}

      <div class="section-title">${this._t("section_items", "Items")}</div>
      <div class="grid">
        ${this._filteredItems().map((it) => {
          const ctx = this._contextForItem(it.id);
          if (!ctx) return nothing;
          const { wishlist: wl } = ctx;
          return html`
            <div
              class="item-card"
              draggable="true"
              @dragstart=${(e: DragEvent) => {
                e.dataTransfer?.setData("text/item-id", it.id);
              }}
              @dragover=${(e: DragEvent) => e.preventDefault()}
              @drop=${(e: DragEvent) => this._onDropItem(e, wl.id, it.id)}
            >
              <div class="hero">
                ${it.image_url
                  ? html`<img src=${it.image_url} alt="" loading="lazy" />`
                  : nothing}
                <span class="badge ${it.status}"
                  >${this._statusLabel(it.status)}</span
                >
              </div>
              <div class="item-body">
                <div class="item-title">
                  ${it.favorite ? html`<span class="fav">★</span> ` : nothing}${it.title}
                </div>
                <div
                  class="item-desc ${it.external_url ? "item-desc-link" : ""}"
                  title=${it.external_url
                    ? this._t("open_item_link", "Open product link")
                    : ""}
                  @click=${(e: Event) =>
                    this._onItemDescriptionClick(e, it.external_url)}
                >
                  ${it.description || this._t("dash", "—")}
                </div>
                ${it.price != null
                  ? html`<div style="font-weight:600">
                      ${this.hass?.locale?.language
                        ? new Intl.NumberFormat(this.hass.locale.language, {
                            style: "currency",
                            currency: "USD",
                          }).format(it.price)
                        : it.price}
                    </div>`
                  : nothing}
                <div class="item-meta">
                  ${it.tags.map((t) => html`<span class="tag">${t}</span>`)}
                </div>
                <div class="actions">
                  ${admin
                    ? html`
                        <button
                          class="btn"
                          @click=${() => this._openEditItem(wl.id, it)}
                        >
                          ${this._t("edit", "Edit")}
                        </button>
                        <button
                          class="btn btn-ghost"
                          @click=${() =>
                            this._quickSetStatus(wl.id, it, "desired")}
                        >
                          ${this._t("action_desired", "Desired")}
                        </button>
                        <button
                          class="btn btn-ghost"
                          @click=${() => this._quickSetStatus(wl.id, it, "maybe")}
                        >
                          ${this._t("action_maybe", "Maybe")}
                        </button>
                        <button
                          class="btn btn-ghost"
                          @click=${() =>
                            this._quickSetStatus(wl.id, it, "purchased")}
                        >
                          ${this._t("action_got_it", "Got it")}
                        </button>
                      `
                    : html`<button
                        class="btn"
                        @click=${() => this._openEditItem(wl.id, it)}
                      >
                        ${this._t("view", "View")}
                      </button>`}
                </div>
              </div>
            </div>
          `;
        })}
      </div>

      ${this._filteredItems().length === 0
        ? html`<div class="empty">
            ${this._t("no_items_filter", "No items match your filters.")}
          </div>`
        : nothing}

      ${admin && this._selectedWishlistId !== "all"
        ? html`
            <div style="margin-top:20px">
              <button
                class="btn btn-primary"
                @click=${() =>
                  this._openCreateItem(this._selectedWishlistId as string)}
              >
                ${this._t("add_item_this_list", "Add item to this list")}
              </button>
            </div>
          `
        : admin
          ? html`
              <div class="empty">
                ${this._t(
                  "pick_wishlist_hint",
                  "Select a specific wishlist to add items, or use the wishlist chips above."
                )}
              </div>
            `
          : nothing}

      ${this._editorOpen
        ? html`
            <div
              class="modal-backdrop"
              @click=${(e: Event) => {
                if (e.target === e.currentTarget) this._closeEditor();
              }}
            >
              <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                <h2>
                  ${this._isNewItem
                    ? this._t("editor_new", "New item")
                    : this._t("editor_edit", "Edit item")}
                </h2>
                <form id="editor-form" @submit=${this._saveEditor}>
                  <div class="field">
                    <label>${this._t("label_title", "Title")}</label>
                    <input
                      name="title"
                      required
                      ?disabled=${!admin}
                      .value=${this._editingItem?.title ?? ""}
                    />
                  </div>
                  <div class="field">
                    <label>${this._t("label_description", "Description")}</label>
                    <textarea name="description" ?disabled=${!admin}>
${this._editingItem?.description ?? ""}</textarea>
                  </div>
                  <div class="field">
                    <label>${this._t("label_image_url", "Image URL")}</label>
                    <input
                      name="image_url"
                      ?disabled=${!admin}
                      .value=${this._editingItem?.image_url ?? ""}
                    />
                  </div>
                  ${admin
                    ? html`
                        <div class="field">
                          <span class="field-label-like"
                            >${this._t(
                              "label_upload_image",
                              "Upload image"
                            )}</span
                          >
                          <div class="wm-file-upload">
                            <button
                              type="button"
                              class="btn btn-ghost"
                              @click=${(e: Event) => {
                                const root = (e.currentTarget as HTMLElement)
                                  .closest(".wm-file-upload")
                                  ?.querySelector<HTMLInputElement>(
                                    'input[type="file"]'
                                  );
                                root?.click();
                              }}
                            >
                              ${this._t(
                                "choose_image_file",
                                "Choose image file"
                              )}
                            </button>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              @change=${(e: Event) => this._uploadItemImage(e)}
                            />
                          </div>
                          <div
                            style="font-size:0.8rem;color:var(--wm-muted);margin-top:4px"
                          >
                            ${this._t(
                              "upload_hint",
                              "JPEG, PNG, GIF or WebP, max 5 MB. Files are stored under /config/www/wishlist_manager/ and shown as /local/…"
                            )}
                          </div>
                        </div>
                      `
                    : nothing}
                  <div class="field">
                    <label>${this._t("label_external_link", "External link")}</label>
                    <input
                      name="external_url"
                      ?disabled=${!admin}
                      .value=${this._editingItem?.external_url ?? ""}
                    />
                  </div>
                  <div class="row">
                    ${admin
                      ? html`
                          <button
                            type="button"
                            class="btn btn-ghost"
                            @click=${() => this._fetchMetadata()}
                          >
                            ${this._t("fill_from_link", "Fill from link")}
                          </button>
                        `
                      : nothing}
                  </div>
                  <div class="field">
                    <label>${this._t("label_notes", "Notes")}</label>
                    <textarea name="notes" ?disabled=${!admin}>
${this._editingItem?.notes ?? ""}</textarea>
                  </div>
                  <div class="field">
                    <label>${this._t("label_status", "Status")}</label>
                    <select name="status" ?disabled=${!admin}>
                      <option
                        value="desired"
                        ?selected=${(this._editingItem?.status ?? "desired") ===
                        "desired"}
                      >
                        ${this._t("filter_desired", "Desired")}
                      </option>
                      <option
                        value="maybe"
                        ?selected=${this._editingItem?.status === "maybe"}
                      >
                        ${this._t("filter_maybe", "Maybe")}
                      </option>
                      <option
                        value="purchased"
                        ?selected=${this._editingItem?.status === "purchased"}
                      >
                        ${this._t("filter_purchased", "Purchased")}
                      </option>
                    </select>
                  </div>
                  <div class="field">
                    <label>${this._t("label_price", "Price (optional)")}</label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      ?disabled=${!admin}
                      .value=${this._editingItem?.price != null
                        ? String(this._editingItem.price)
                        : ""}
                    />
                  </div>
                  <div class="field">
                    <label>${this._t("label_tags", "Tags (comma separated)")}</label>
                    <input
                      name="tags"
                      ?disabled=${!admin}
                      .value=${(this._editingItem?.tags ?? []).join(", ")}
                    />
                  </div>
                  <div class="row">
                    <label
                      ><input
                        type="checkbox"
                        name="favorite"
                        ?disabled=${!admin}
                        ?checked=${this._editingItem?.favorite}
                      />
                      ${this._t("favorite", "Favorite")}</label
                    >
                    <label
                      ><input
                        type="checkbox"
                        name="archived"
                        ?disabled=${!admin}
                        ?checked=${this._editingItem?.archived}
                      />
                      ${this._t("archived", "Archived")}</label
                    >
                  </div>
                  <div class="row" style="margin-top:16px">
                    ${admin
                      ? html`
                          <button class="btn btn-primary" type="submit">
                            ${this._t("save", "Save")}
                          </button>
                        `
                      : nothing}
                    <button
                      type="button"
                      class="btn btn-ghost"
                      @click=${this._closeEditor}
                    >
                      ${admin
                        ? this._t("cancel", "Cancel")
                        : this._t("close", "Close")}
                    </button>
                    ${admin && !this._isNewItem
                      ? html`
                          <button
                            type="button"
                            class="btn"
                            style="margin-left:auto;color:var(--error-color)"
                            @click=${() => this._deleteCurrentItem()}
                          >
                            ${this._t("delete", "Delete")}
                          </button>
                        `
                      : nothing}
                  </div>
                </form>
              </div>
            </div>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "wishlist-manager-panel": WishlistManagerPanel;
  }
}
