/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const q = globalThis, K = q.ShadowRoot && (q.ShadyCSS === void 0 || q.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Q = Symbol(), at = /* @__PURE__ */ new WeakMap();
let vt = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== Q) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (K && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = at.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && at.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const At = (s) => new vt(typeof s == "string" ? s : s + "", void 0, Q), St = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((i, r, a) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[a + 1], s[0]);
  return new vt(e, s, Q);
}, It = (s, t) => {
  if (K) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), r = q.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = e.cssText, s.appendChild(i);
  }
}, ot = K ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return At(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: kt, defineProperty: Ct, getOwnPropertyDescriptor: Pt, getOwnPropertyNames: Tt, getOwnPropertySymbols: Ut, getPrototypeOf: Ot } = Object, A = globalThis, nt = A.trustedTypes, Dt = nt ? nt.emptyScript : "", G = A.reactiveElementPolyfillSupport, M = (s, t) => s, F = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? Dt : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, t) {
  let e = s;
  switch (t) {
    case Boolean:
      e = s !== null;
      break;
    case Number:
      e = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(s);
      } catch {
        e = null;
      }
  }
  return e;
} }, X = (s, t) => !kt(s, t), lt = { attribute: !0, type: String, converter: F, reflect: !1, useDefault: !1, hasChanged: X };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), A.litPropertyMetadata ?? (A.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let U = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = lt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(t, i, e);
      r !== void 0 && Ct(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: r, set: a } = Pt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: r, set(o) {
      const n = r == null ? void 0 : r.call(this);
      a == null || a.call(this, o), this.requestUpdate(t, n, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? lt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(M("elementProperties"))) return;
    const t = Ot(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(M("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(M("properties"))) {
      const e = this.properties, i = [...Tt(e), ...Ut(e)];
      for (const r of i) this.createProperty(r, e[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, r] of e) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const r = this._$Eu(e, i);
      r !== void 0 && this._$Eh.set(r, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const r of i) e.unshift(ot(r));
    } else t !== void 0 && e.push(ot(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((e) => e(this));
  }
  addController(t) {
    var e;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((e = t.hostConnected) == null || e.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$EO) == null || e.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return It(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var i;
      return (i = e.hostConnected) == null ? void 0 : i.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var i;
      return (i = e.hostDisconnected) == null ? void 0 : i.call(e);
    });
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    var a;
    const i = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, i);
    if (r !== void 0 && i.reflect === !0) {
      const o = (((a = i.converter) == null ? void 0 : a.toAttribute) !== void 0 ? i.converter : F).toAttribute(e, i.type);
      this._$Em = t, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var a, o;
    const i = this.constructor, r = i._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const n = i.getPropertyOptions(r), l = typeof n.converter == "function" ? { fromAttribute: n.converter } : ((a = n.converter) == null ? void 0 : a.fromAttribute) !== void 0 ? n.converter : F;
      this._$Em = r;
      const c = l.fromAttribute(e, n.type);
      this[r] = c ?? ((o = this._$Ej) == null ? void 0 : o.get(r)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, r = !1, a) {
    var o;
    if (t !== void 0) {
      const n = this.constructor;
      if (r === !1 && (a = this[t]), i ?? (i = n.getPropertyOptions(t)), !((i.hasChanged ?? X)(a, e) || i.useDefault && i.reflect && a === ((o = this._$Ej) == null ? void 0 : o.get(t)) && !this.hasAttribute(n._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: r, wrapped: a }, o) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), a !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), r === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var i;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [a, o] of this._$Ep) this[a] = o;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [a, o] of r) {
        const { wrapped: n } = o, l = this[a];
        n !== !0 || this._$AL.has(a) || l === void 0 || this.C(a, void 0, o, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (i = this._$EO) == null || i.forEach((r) => {
        var a;
        return (a = r.hostUpdate) == null ? void 0 : a.call(r);
      }), this.update(e)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((i) => {
      var r;
      return (r = i.hostUpdated) == null ? void 0 : r.call(i);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((e) => this._$ET(e, this[e]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
U.elementStyles = [], U.shadowRootOptions = { mode: "open" }, U[M("elementProperties")] = /* @__PURE__ */ new Map(), U[M("finalized")] = /* @__PURE__ */ new Map(), G == null || G({ ReactiveElement: U }), (A.reactiveElementVersions ?? (A.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const R = globalThis, ht = (s) => s, B = R.trustedTypes, dt = B ? B.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, yt = "$lit$", E = `lit$${Math.random().toFixed(9).slice(2)}$`, wt = "?" + E, Wt = `<${wt}>`, T = document, H = () => T.createComment(""), z = (s) => s === null || typeof s != "object" && typeof s != "function", tt = Array.isArray, Mt = (s) => tt(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", Y = `[ 	
\f\r]`, W = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ct = /-->/g, pt = />/g, k = RegExp(`>|${Y}(?:([^\\s"'>=/]+)(${Y}*=${Y}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ut = /'/g, _t = /"/g, xt = /^(?:script|style|textarea|title)$/i, Rt = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), _ = Rt(1), O = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), mt = /* @__PURE__ */ new WeakMap(), C = T.createTreeWalker(T, 129);
function Et(s, t) {
  if (!tt(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return dt !== void 0 ? dt.createHTML(t) : t;
}
const Nt = (s, t) => {
  const e = s.length - 1, i = [];
  let r, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = W;
  for (let n = 0; n < e; n++) {
    const l = s[n];
    let c, u, p = -1, $ = 0;
    for (; $ < l.length && (o.lastIndex = $, u = o.exec(l), u !== null); ) $ = o.lastIndex, o === W ? u[1] === "!--" ? o = ct : u[1] !== void 0 ? o = pt : u[2] !== void 0 ? (xt.test(u[2]) && (r = RegExp("</" + u[2], "g")), o = k) : u[3] !== void 0 && (o = k) : o === k ? u[0] === ">" ? (o = r ?? W, p = -1) : u[1] === void 0 ? p = -2 : (p = o.lastIndex - u[2].length, c = u[1], o = u[3] === void 0 ? k : u[3] === '"' ? _t : ut) : o === _t || o === ut ? o = k : o === ct || o === pt ? o = W : (o = k, r = void 0);
    const w = o === k && s[n + 1].startsWith("/>") ? " " : "";
    a += o === W ? l + Wt : p >= 0 ? (i.push(c), l.slice(0, p) + yt + l.slice(p) + E + w) : l + E + (p === -2 ? n : w);
  }
  return [Et(s, a + (s[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class L {
  constructor({ strings: t, _$litType$: e }, i) {
    let r;
    this.parts = [];
    let a = 0, o = 0;
    const n = t.length - 1, l = this.parts, [c, u] = Nt(t, e);
    if (this.el = L.createElement(c, i), C.currentNode = this.el.content, e === 2 || e === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (r = C.nextNode()) !== null && l.length < n; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const p of r.getAttributeNames()) if (p.endsWith(yt)) {
          const $ = u[o++], w = r.getAttribute(p).split(E), S = /([.?@])?(.*)/.exec($);
          l.push({ type: 1, index: a, name: S[2], strings: w, ctor: S[1] === "." ? zt : S[1] === "?" ? Lt : S[1] === "@" ? jt : V }), r.removeAttribute(p);
        } else p.startsWith(E) && (l.push({ type: 6, index: a }), r.removeAttribute(p));
        if (xt.test(r.tagName)) {
          const p = r.textContent.split(E), $ = p.length - 1;
          if ($ > 0) {
            r.textContent = B ? B.emptyScript : "";
            for (let w = 0; w < $; w++) r.append(p[w], H()), C.nextNode(), l.push({ type: 2, index: ++a });
            r.append(p[$], H());
          }
        }
      } else if (r.nodeType === 8) if (r.data === wt) l.push({ type: 2, index: a });
      else {
        let p = -1;
        for (; (p = r.data.indexOf(E, p + 1)) !== -1; ) l.push({ type: 7, index: a }), p += E.length - 1;
      }
      a++;
    }
  }
  static createElement(t, e) {
    const i = T.createElement("template");
    return i.innerHTML = t, i;
  }
}
function D(s, t, e = s, i) {
  var o, n;
  if (t === O) return t;
  let r = i !== void 0 ? (o = e._$Co) == null ? void 0 : o[i] : e._$Cl;
  const a = z(t) ? void 0 : t._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== a && ((n = r == null ? void 0 : r._$AO) == null || n.call(r, !1), a === void 0 ? r = void 0 : (r = new a(s), r._$AT(s, e, i)), i !== void 0 ? (e._$Co ?? (e._$Co = []))[i] = r : e._$Cl = r), r !== void 0 && (t = D(s, r._$AS(s, t.values), r, i)), t;
}
class Ht {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: i } = this._$AD, r = ((t == null ? void 0 : t.creationScope) ?? T).importNode(e, !0);
    C.currentNode = r;
    let a = C.nextNode(), o = 0, n = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let c;
        l.type === 2 ? c = new j(a, a.nextSibling, this, t) : l.type === 1 ? c = new l.ctor(a, l.name, l.strings, this, t) : l.type === 6 && (c = new qt(a, this, t)), this._$AV.push(c), l = i[++n];
      }
      o !== (l == null ? void 0 : l.index) && (a = C.nextNode(), o++);
    }
    return C.currentNode = T, r;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class j {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, i, r) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = D(this, t, e), z(t) ? t === d || t == null || t === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : t !== this._$AH && t !== O && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Mt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== d && z(this._$AH) ? this._$AA.nextSibling.data = t : this.T(T.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var a;
    const { values: e, _$litType$: i } = t, r = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = L.createElement(Et(i.h, i.h[0]), this.options)), i);
    if (((a = this._$AH) == null ? void 0 : a._$AD) === r) this._$AH.p(e);
    else {
      const o = new Ht(r, this), n = o.u(this.options);
      o.p(e), this.T(n), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = mt.get(t.strings);
    return e === void 0 && mt.set(t.strings, e = new L(t)), e;
  }
  k(t) {
    tt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, r = 0;
    for (const a of t) r === e.length ? e.push(i = new j(this.O(H()), this.O(H()), this, this.options)) : i = e[r], i._$AI(a), r++;
    r < e.length && (this._$AR(i && i._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, e); t !== this._$AB; ) {
      const r = ht(t).nextSibling;
      ht(t).remove(), t = r;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class V {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, r, a) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = a, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = d;
  }
  _$AI(t, e = this, i, r) {
    const a = this.strings;
    let o = !1;
    if (a === void 0) t = D(this, t, e, 0), o = !z(t) || t !== this._$AH && t !== O, o && (this._$AH = t);
    else {
      const n = t;
      let l, c;
      for (t = a[0], l = 0; l < a.length - 1; l++) c = D(this, n[i + l], e, l), c === O && (c = this._$AH[l]), o || (o = !z(c) || c !== this._$AH[l]), c === d ? t = d : t !== d && (t += (c ?? "") + a[l + 1]), this._$AH[l] = c;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class zt extends V {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === d ? void 0 : t;
  }
}
class Lt extends V {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== d);
  }
}
class jt extends V {
  constructor(t, e, i, r, a) {
    super(t, e, i, r, a), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = D(this, t, e, 0) ?? d) === O) return;
    const i = this._$AH, r = t === d && i !== d || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, a = t !== d && (i === d || r);
    r && this.element.removeEventListener(this.name, this, i), a && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class qt {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    D(this, t);
  }
}
const Z = R.litHtmlPolyfillSupport;
Z == null || Z(L, j), (R.litHtmlVersions ?? (R.litHtmlVersions = [])).push("3.3.2");
const Ft = (s, t, e) => {
  const i = (e == null ? void 0 : e.renderBefore) ?? t;
  let r = i._$litPart$;
  if (r === void 0) {
    const a = (e == null ? void 0 : e.renderBefore) ?? null;
    i._$litPart$ = r = new j(t.insertBefore(H(), a), a, void 0, e ?? {});
  }
  return r._$AI(s), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const P = globalThis;
class N extends U {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var e;
    const t = super.createRenderRoot();
    return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Ft(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return O;
  }
}
var bt;
N._$litElement$ = !0, N.finalized = !0, (bt = P.litElementHydrateSupport) == null || bt.call(P, { LitElement: N });
const J = P.litElementPolyfillSupport;
J == null || J({ LitElement: N });
(P.litElementVersions ?? (P.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Bt = (s) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(s, t);
  }) : customElements.define(s, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Vt = { attribute: !0, type: String, converter: F, reflect: !1, hasChanged: X }, Gt = (s = Vt, t, e) => {
  const { kind: i, metadata: r } = e;
  let a = globalThis.litPropertyMetadata.get(r);
  if (a === void 0 && globalThis.litPropertyMetadata.set(r, a = /* @__PURE__ */ new Map()), i === "setter" && ((s = Object.create(s)).wrapped = !0), a.set(e.name, s), i === "accessor") {
    const { name: o } = e;
    return { set(n) {
      const l = t.get.call(this);
      t.set.call(this, n), this.requestUpdate(o, l, s, !0, n);
    }, init(n) {
      return n !== void 0 && this.C(o, void 0, s, n), n;
    } };
  }
  if (i === "setter") {
    const { name: o } = e;
    return function(n) {
      const l = this[o];
      t.call(this, n), this.requestUpdate(o, l, s, !0, n);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function et(s) {
  return (t, e) => typeof e == "object" ? Gt(s, t, e) : ((i, r, a) => {
    const o = r.hasOwnProperty(a);
    return r.constructor.createProperty(a, i), o ? Object.getOwnPropertyDescriptor(r, a) : void 0;
  })(s, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function y(s) {
  return et({ ...s, state: !0, attribute: !1 });
}
const Yt = "wishlist_manager";
function Zt(s, t, e, i) {
  if (!s) return ft(e, i);
  const r = `component.${Yt}.panel.${t}`;
  let a = e;
  if (typeof s.localize == "function")
    try {
      const o = s.localize(r);
      typeof o == "string" && o.trim() !== "" && o !== r && (a = o);
    } catch {
    }
  return ft(a, i);
}
function ft(s, t) {
  if (!t) return s;
  let e = s;
  for (const [i, r] of Object.entries(t))
    e = e.replaceAll(`{${i}}`, String(r));
  return e;
}
var Jt = Object.defineProperty, Kt = Object.getOwnPropertyDescriptor, g = (s, t, e, i) => {
  for (var r = i > 1 ? void 0 : i ? Kt(t, e) : t, a = s.length - 1, o; a >= 0; a--)
    (o = s[a]) && (r = (i ? o(t, e, r) : o(r)) || r);
  return i && r && Jt(t, e, r), r;
};
const b = {
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
  FETCH_META: "wishlist_manager/metadata/fetch"
};
async function v(s, t) {
  return typeof s.callWS == "function" ? s.callWS(t) : s.connection.sendMessagePromise(t);
}
function gt(s) {
  const t = s.user;
  return !!(t != null && t.is_admin);
}
function $t(s) {
  return s === "desired" ? 0 : s === "maybe" ? 1 : 2;
}
let f = class extends N {
  constructor() {
    super(...arguments), this.narrow = !1, this._snapshot = null, this._loading = !0, this._error = null, this._selectedWishlistId = "all", this._filterStatus = "all", this._search = "", this._sort = "newest", this._editorOpen = !1, this._editingWishlistId = null, this._editingItem = null, this._isNewItem = !1, this._shareUrl = null;
  }
  _t(s, t, e) {
    return Zt(this.hass, s, t, e);
  }
  _statusLabel(s) {
    return s === "purchased" ? this._t("status_purchased", "Purchased") : s === "maybe" ? this._t("status_maybe", "Maybe") : this._t("status_desired", "Desired");
  }
  connectedCallback() {
    super.connectedCallback(), this._refresh();
  }
  updated(s) {
    super.updated(s), s.has("hass") && this.hass && (this._refresh(), queueMicrotask(() => {
      this.isConnected && this.requestUpdate();
    }));
  }
  async _refresh() {
    if (this.hass) {
      this._loading = !0, this._error = null;
      try {
        const s = await v(this.hass, { type: b.LIST });
        this._snapshot = s;
      } catch (s) {
        this._error = s instanceof Error ? s.message : String(s);
      } finally {
        this._loading = !1;
      }
    }
  }
  _wishlistsSorted() {
    return this._snapshot ? [...this._snapshot.wishlists].sort(
      (s, t) => s.sort_order - t.sort_order
    ) : [];
  }
  _filteredItems() {
    if (!this._snapshot) return [];
    const s = this._search.trim().toLowerCase();
    let t = this._selectedWishlistId === "all" ? this._snapshot.wishlists : this._snapshot.wishlists.filter(
      (n) => n.id === this._selectedWishlistId
    ), e = [];
    for (const n of t)
      for (const l of n.items) {
        if (this._filterStatus === "archived") {
          if (!l.archived) continue;
        } else if (l.archived)
          continue;
        this._filterStatus !== "all" && this._filterStatus !== "archived" && l.status !== this._filterStatus || s && !`${l.title} ${l.description} ${l.notes} ${l.tags.join(" ")}`.toLowerCase().includes(s) || e.push({ wl: n, item: l });
      }
    const i = (n, l) => n.title.localeCompare(l.title), r = (n, l) => l.created_at.localeCompare(n.created_at), a = (n, l) => n.created_at.localeCompare(l.created_at), o = (n, l) => $t(n.status) - $t(l.status) || n.title.localeCompare(l.title);
    return e.sort((n, l) => this._sort === "alpha" ? i(n.item, l.item) : this._sort === "oldest" ? a(n.item, l.item) : this._sort === "status" ? o(n.item, l.item) : r(n.item, l.item)), e.map((n) => n.item);
  }
  _contextForItem(s) {
    if (!this._snapshot) return null;
    for (const t of this._snapshot.wishlists) {
      const e = t.items.find((i) => i.id === s);
      if (e) return { wishlist: t, item: e };
    }
    return null;
  }
  _recentItems() {
    if (!this._snapshot) return [];
    const s = [];
    for (const t of this._snapshot.wishlists)
      for (const e of t.items)
        e.archived || s.push(e);
    return s.sort((t, e) => e.created_at.localeCompare(t.created_at)).slice(0, 12);
  }
  async _mutate(s, t = !0) {
    try {
      await s(), t && await this._refresh();
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    }
  }
  _openCreateItem(s) {
    this._editingWishlistId = s, this._editingItem = null, this._isNewItem = !0, this._editorOpen = !0;
  }
  _openEditItem(s, t) {
    this._editingWishlistId = s, this._editingItem = { ...t }, this._isNewItem = !1, this._editorOpen = !0;
  }
  _closeEditor() {
    this._editorOpen = !1, this._editingItem = null, this._editingWishlistId = null;
  }
  async _saveEditor(s) {
    if (s.preventDefault(), !this.hass || !this._editingWishlistId || !gt(this.hass)) return;
    const t = s.target, e = new FormData(t), i = String(e.get("title") || "").trim();
    if (!i) return;
    const r = {
      title: i,
      description: String(e.get("description") || ""),
      image_url: String(e.get("image_url") || ""),
      external_url: String(e.get("external_url") || ""),
      notes: String(e.get("notes") || ""),
      status: String(e.get("status") || "desired"),
      price: (() => {
        const a = String(e.get("price") || "").trim();
        if (!a) return null;
        const o = Number(a);
        return Number.isFinite(o) ? o : null;
      })(),
      tags: String(e.get("tags") || "").split(",").map((a) => a.trim()).filter(Boolean),
      favorite: e.get("favorite") === "on",
      archived: e.get("archived") === "on"
    };
    this._isNewItem ? await this._mutate(
      () => v(this.hass, {
        type: b.CREATE_ITEM,
        wishlist_id: this._editingWishlistId,
        ...r
      })
    ) : this._editingItem && await this._mutate(
      () => v(this.hass, {
        type: b.UPDATE_ITEM,
        wishlist_id: this._editingWishlistId,
        item_id: this._editingItem.id,
        ...r
      })
    ), this._closeEditor();
  }
  async _deleteCurrentItem() {
    !this.hass || !this._editingWishlistId || !this._editingItem || this._isNewItem || confirm(this._t("confirm_delete_item", "Delete this item permanently?")) && (await this._mutate(
      () => v(this.hass, {
        type: b.DELETE_ITEM,
        wishlist_id: this._editingWishlistId,
        item_id: this._editingItem.id
      })
    ), this._closeEditor());
  }
  async _quickSetStatus(s, t, e) {
    this.hass && await this._mutate(
      () => v(this.hass, {
        type: b.SET_STATUS,
        wishlist_id: s,
        item_id: t.id,
        status: e
      })
    );
  }
  async _createWishlist() {
    const s = prompt(
      this._t("prompt_wishlist_name", "Wishlist name?"),
      this._t("default_new_wishlist", "New wishlist")
    );
    !s || !this.hass || await this._mutate(
      () => v(this.hass, {
        type: b.CREATE_WL,
        name: s.trim(),
        icon: "mdi:gift-outline"
      })
    );
  }
  async _renameWishlist(s) {
    const t = prompt(this._t("prompt_rename_wishlist", "Rename wishlist"), s.name);
    !t || !this.hass || await this._mutate(
      () => v(this.hass, {
        type: b.UPDATE_WL,
        wishlist_id: s.id,
        name: t.trim()
      })
    );
  }
  async _deleteWishlist(s) {
    confirm(
      this._t(
        "confirm_delete_wishlist",
        'Delete wishlist "{name}" and all items?',
        { name: s.name }
      )
    ) && this.hass && (await this._mutate(
      () => v(this.hass, {
        type: b.DELETE_WL,
        wishlist_id: s.id
      })
    ), this._selectedWishlistId === s.id && (this._selectedWishlistId = "all"));
  }
  async _onDropWishlist(s, t) {
    var o;
    s.preventDefault();
    const e = (o = s.dataTransfer) == null ? void 0 : o.getData("text/wishlist-id");
    if (!e || e === t || !this.hass || !this._snapshot) return;
    const i = this._wishlistsSorted().map((n) => n.id), r = i.indexOf(e), a = i.indexOf(t);
    r < 0 || a < 0 || (i.splice(r, 1), i.splice(a, 0, e), await this._mutate(
      () => v(this.hass, { type: b.REORDER_WL, wishlist_ids: i })
    ));
  }
  async _onDropItem(s, t, e) {
    var l, c;
    s.preventDefault();
    const i = (l = s.dataTransfer) == null ? void 0 : l.getData("text/item-id");
    if (!i || i === e || !this.hass) return;
    const r = (c = this._snapshot) == null ? void 0 : c.wishlists.find((u) => u.id === t);
    if (!r) return;
    const a = [...r.items].sort((u, p) => u.sort_order - p.sort_order).map((u) => u.id), o = a.indexOf(i), n = a.indexOf(e);
    o < 0 || n < 0 || (a.splice(o, 1), a.splice(n, 0, i), await this._mutate(
      () => v(this.hass, {
        type: b.REORDER_ITEMS,
        wishlist_id: t,
        item_ids: a
      })
    ));
  }
  async _uploadItemImage(s) {
    var a, o;
    const t = s.target, e = (a = t.files) == null ? void 0 : a[0];
    if (!e || !this.hass) {
      t.value = "";
      return;
    }
    const i = this.hass.auth;
    if (!(i != null && i.fetchWithAuth)) {
      this._error = this._t(
        "upload_no_auth",
        "Upload requires Home Assistant sign-in (admin)."
      ), t.value = "";
      return;
    }
    this._error = null;
    const r = new FormData();
    r.append("file", e);
    try {
      const n = await i.fetchWithAuth(
        "/api/wishlist_manager/upload_image",
        {
          method: "POST",
          body: r
        }
      ), l = await n.json();
      if (!n.ok)
        throw new Error(l.error || n.statusText);
      const c = (o = this.shadowRoot) == null ? void 0 : o.querySelector(
        "form#editor-form"
      ), u = c == null ? void 0 : c.querySelector('[name="image_url"]');
      u && l.image_url && (u.value = l.image_url), this.requestUpdate();
    } catch (n) {
      this._error = n instanceof Error ? n.message : String(n);
    } finally {
      t.value = "";
    }
  }
  async _fetchMetadata() {
    var e, i;
    if (!this.hass) return;
    const s = (e = this.shadowRoot) == null ? void 0 : e.querySelector(
      "form#editor-form"
    ), t = String(((i = s == null ? void 0 : s.querySelector('[name="external_url"]')) == null ? void 0 : i.value) || "").trim();
    if (!t) {
      this._error = this._t("error_add_link_first", "Add a link first.");
      return;
    }
    try {
      const r = await v(this.hass, {
        type: b.FETCH_META,
        url: t
      });
      if (!s) return;
      const a = s.querySelector('[name="title"]'), o = s.querySelector('[name="image_url"]'), n = s.querySelector(
        '[name="description"]'
      );
      r.title && a && !a.value && (a.value = r.title), r.image && o && !o.value && (o.value = r.image), r.description && n && !n.value && (n.value = r.description), this.requestUpdate();
    } catch (r) {
      this._error = r instanceof Error ? r.message : String(r);
    }
  }
  async _enableShare(s) {
    if (this.hass)
      try {
        const t = await v(this.hass, {
          type: b.REGEN_SHARE,
          wishlist_id: s.id
        }), e = window.location.origin;
        this._shareUrl = `${e}/api/wishlist_manager/public/${t.share_token}`, await this._refresh();
      } catch (t) {
        this._error = t instanceof Error ? t.message : String(t);
      }
  }
  _copyShare() {
    this._shareUrl && navigator.clipboard.writeText(this._shareUrl);
  }
  render() {
    var e, i, r, a, o, n, l, c, u, p, $, w, S;
    if (!this.hass)
      return _`<div class="empty">
        ${this._t("waiting_ha", "Waiting for Home Assistant…")}
      </div>`;
    if (this._loading && !this._snapshot)
      return _`<div class="empty">${this._t("loading", "Loading wishlists…")}</div>`;
    const s = (e = this._snapshot) == null ? void 0 : e.stats, t = gt(this.hass);
    return _`
      ${this._error ? _`<div class="error">${this._error}</div>` : d}

      <div class="toolbar">
        <input
          type="search"
          placeholder=${this._t(
      "search_placeholder",
      "Search title, notes, tags…"
    )}
          .value=${this._search}
          @input=${(h) => {
      this._search = h.target.value;
    }}
        />
        <select
          @change=${(h) => {
      this._filterStatus = h.target.value;
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
          @change=${(h) => {
      this._selectedWishlistId = h.target.value;
    }}
        >
          <option value="all" ?selected=${this._selectedWishlistId === "all"}>
            ${this._t("filter_all_lists", "All wishlists")}
          </option>
          ${this._wishlistsSorted().map(
      (h) => _`
              <option value=${h.id} ?selected=${this._selectedWishlistId === h.id}>
                ${h.name}
              </option>
            `
    )}
        </select>
        <select
          @change=${(h) => {
      this._sort = h.target.value;
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
        ${t ? _`<button class="btn btn-primary" @click=${this._createWishlist}>
              ${this._t("new_wishlist", "New wishlist")}
            </button>` : d}
        <button class="btn btn-ghost" @click=${() => this._refresh()}>
          ${this._t("refresh", "Refresh")}
        </button>
      </div>

      ${s ? _`
            <div class="stats">
              <div class="stat-card" style="animation-delay:0ms">
                <b>${s.total_items}</b
                ><span>${this._t("stat_total", "Total items")}</span>
              </div>
              <div class="stat-card" style="animation-delay:40ms">
                <b>${s.purchased_items}</b
                ><span>${this._t("stat_purchased", "Purchased")}</span>
              </div>
              <div class="stat-card" style="animation-delay:80ms">
                <b>${s.desired_items}</b
                ><span>${this._t("stat_desired", "Desired")}</span>
              </div>
              <div class="stat-card" style="animation-delay:120ms">
                <b>${s.wishlist_count}</b
                ><span>${this._t("stat_wishlists", "Wishlists")}</span>
              </div>
            </div>
          ` : d}

      <div class="section-title">
        ${this._t("recently_added", "Recently added")}
      </div>
      <div class="recent">
        ${this._recentItems().map(
      (h) => _`
            <div
              class="recent-card"
              @click=${() => {
        const m = this._contextForItem(h.id);
        m && this._openEditItem(m.wishlist.id, m.item);
      }}
            >
              ${h.image_url ? _`<img src=${h.image_url} alt="" loading="lazy" />` : _`<div
                    style="height:120px;background:var(--divider-color)"
                  ></div>`}
              <div class="meta">
                <strong>${h.title}</strong>
                <div style="font-size:0.8rem;color:var(--wm-muted)">
                  ${this._statusLabel(h.status)}
                </div>
              </div>
            </div>
          `
    )}
      </div>

      <div class="section-title">
        ${this._t("section_wishlists", "Wishlists")}
      </div>
      <div class="wishlists-row">
        ${this._wishlistsSorted().map(
      (h) => _`
            <div
              class="chip ${this._selectedWishlistId === h.id ? "active" : ""}"
              draggable="true"
              @dragstart=${(m) => {
        var x;
        (x = m.dataTransfer) == null || x.setData("text/wishlist-id", h.id);
      }}
              @dragover=${(m) => m.preventDefault()}
              @drop=${(m) => this._onDropWishlist(m, h.id)}
              @click=${() => {
        this._selectedWishlistId = h.id;
      }}
            >
              <span>${h.name}</span>
              ${t ? _`
                    <button
                      class="btn btn-ghost"
                      style="padding:2px 8px;font-size:0.7rem"
                      @click=${(m) => {
        m.stopPropagation(), this._renameWishlist(h);
      }}
                    >
                      ${this._t("rename", "Rename")}
                    </button>
                    <button
                      class="btn btn-ghost"
                      style="padding:2px 8px;font-size:0.7rem"
                      @click=${(m) => {
        m.stopPropagation(), this._deleteWishlist(h);
      }}
                    >
                      ${this._t("delete", "Delete")}
                    </button>
                    <button
                      class="btn btn-ghost"
                      style="padding:2px 8px;font-size:0.7rem"
                      @click=${(m) => {
        m.stopPropagation(), this._enableShare(h);
      }}
                    >
                      ${this._t("share_link", "Share link")}
                    </button>
                  ` : d}
            </div>
          `
    )}
      </div>

      ${this._shareUrl ? _`
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
          ` : d}

      <div class="section-title">${this._t("section_items", "Items")}</div>
      <div class="grid">
        ${this._filteredItems().map((h) => {
      var st, it;
      const m = this._contextForItem(h.id);
      if (!m) return d;
      const { wishlist: x } = m;
      return _`
            <div
              class="item-card"
              draggable="true"
              @dragstart=${(I) => {
        var rt;
        (rt = I.dataTransfer) == null || rt.setData("text/item-id", h.id);
      }}
              @dragover=${(I) => I.preventDefault()}
              @drop=${(I) => this._onDropItem(I, x.id, h.id)}
            >
              <div class="hero">
                ${h.image_url ? _`<img src=${h.image_url} alt="" loading="lazy" />` : d}
                <span class="badge ${h.status}"
                  >${this._statusLabel(h.status)}</span
                >
              </div>
              <div class="item-body">
                <div class="item-title">
                  ${h.favorite ? _`<span class="fav">★</span> ` : d}${h.title}
                </div>
                <div class="item-desc">
                  ${h.description || this._t("dash", "—")}
                </div>
                ${h.price != null ? _`<div style="font-weight:600">
                      ${(it = (st = this.hass) == null ? void 0 : st.locale) != null && it.language ? new Intl.NumberFormat(this.hass.locale.language, {
        style: "currency",
        currency: "USD"
      }).format(h.price) : h.price}
                    </div>` : d}
                <div class="item-meta">
                  ${h.tags.map((I) => _`<span class="tag">${I}</span>`)}
                </div>
                <div class="actions">
                  ${t ? _`
                        <button
                          class="btn"
                          @click=${() => this._openEditItem(x.id, h)}
                        >
                          ${this._t("edit", "Edit")}
                        </button>
                        <button
                          class="btn btn-ghost"
                          @click=${() => this._quickSetStatus(x.id, h, "desired")}
                        >
                          ${this._t("action_desired", "Desired")}
                        </button>
                        <button
                          class="btn btn-ghost"
                          @click=${() => this._quickSetStatus(x.id, h, "maybe")}
                        >
                          ${this._t("action_maybe", "Maybe")}
                        </button>
                        <button
                          class="btn btn-ghost"
                          @click=${() => this._quickSetStatus(x.id, h, "purchased")}
                        >
                          ${this._t("action_got_it", "Got it")}
                        </button>
                      ` : _`<button
                        class="btn"
                        @click=${() => this._openEditItem(x.id, h)}
                      >
                        ${this._t("view", "View")}
                      </button>`}
                </div>
              </div>
            </div>
          `;
    })}
      </div>

      ${this._filteredItems().length === 0 ? _`<div class="empty">
            ${this._t("no_items_filter", "No items match your filters.")}
          </div>` : d}

      ${t && this._selectedWishlistId !== "all" ? _`
            <div style="margin-top:20px">
              <button
                class="btn btn-primary"
                @click=${() => this._openCreateItem(this._selectedWishlistId)}
              >
                ${this._t("add_item_this_list", "Add item to this list")}
              </button>
            </div>
          ` : t ? _`
              <div class="empty">
                ${this._t(
      "pick_wishlist_hint",
      "Select a specific wishlist to add items, or use the wishlist chips above."
    )}
              </div>
            ` : d}

      ${this._editorOpen ? _`
            <div
              class="modal-backdrop"
              @click=${(h) => {
      h.target === h.currentTarget && this._closeEditor();
    }}
            >
              <div class="modal" @click=${(h) => h.stopPropagation()}>
                <h2>
                  ${this._isNewItem ? this._t("editor_new", "New item") : this._t("editor_edit", "Edit item")}
                </h2>
                <form id="editor-form" @submit=${this._saveEditor}>
                  <div class="field">
                    <label>${this._t("label_title", "Title")}</label>
                    <input
                      name="title"
                      required
                      ?disabled=${!t}
                      .value=${((i = this._editingItem) == null ? void 0 : i.title) ?? ""}
                    />
                  </div>
                  <div class="field">
                    <label>${this._t("label_description", "Description")}</label>
                    <textarea name="description" ?disabled=${!t}>
${((r = this._editingItem) == null ? void 0 : r.description) ?? ""}</textarea>
                  </div>
                  <div class="field">
                    <label>${this._t("label_image_url", "Image URL")}</label>
                    <input
                      name="image_url"
                      ?disabled=${!t}
                      .value=${((a = this._editingItem) == null ? void 0 : a.image_url) ?? ""}
                    />
                  </div>
                  ${t ? _`
                        <div class="field">
                          <label
                            >${this._t(
      "label_upload_image",
      "Upload image"
    )}</label
                          >
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            @change=${(h) => this._uploadItemImage(h)}
                          />
                          <div
                            style="font-size:0.8rem;color:var(--wm-muted);margin-top:4px"
                          >
                            ${this._t(
      "upload_hint",
      "JPEG, PNG, GIF or WebP, max 5 MB. Files are stored under /config/www/wishlist_manager/ and shown as /local/…"
    )}
                          </div>
                        </div>
                      ` : d}
                  <div class="field">
                    <label>${this._t("label_external_link", "External link")}</label>
                    <input
                      name="external_url"
                      ?disabled=${!t}
                      .value=${((o = this._editingItem) == null ? void 0 : o.external_url) ?? ""}
                    />
                  </div>
                  <div class="row">
                    ${t ? _`
                          <button
                            type="button"
                            class="btn btn-ghost"
                            @click=${() => this._fetchMetadata()}
                          >
                            ${this._t("fill_from_link", "Fill from link")}
                          </button>
                        ` : d}
                  </div>
                  <div class="field">
                    <label>${this._t("label_notes", "Notes")}</label>
                    <textarea name="notes" ?disabled=${!t}>
${((n = this._editingItem) == null ? void 0 : n.notes) ?? ""}</textarea>
                  </div>
                  <div class="field">
                    <label>${this._t("label_status", "Status")}</label>
                    <select name="status" ?disabled=${!t}>
                      <option
                        value="desired"
                        ?selected=${(((l = this._editingItem) == null ? void 0 : l.status) ?? "desired") === "desired"}
                      >
                        ${this._t("filter_desired", "Desired")}
                      </option>
                      <option
                        value="maybe"
                        ?selected=${((c = this._editingItem) == null ? void 0 : c.status) === "maybe"}
                      >
                        ${this._t("filter_maybe", "Maybe")}
                      </option>
                      <option
                        value="purchased"
                        ?selected=${((u = this._editingItem) == null ? void 0 : u.status) === "purchased"}
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
                      ?disabled=${!t}
                      .value=${((p = this._editingItem) == null ? void 0 : p.price) != null ? String(this._editingItem.price) : ""}
                    />
                  </div>
                  <div class="field">
                    <label>${this._t("label_tags", "Tags (comma separated)")}</label>
                    <input
                      name="tags"
                      ?disabled=${!t}
                      .value=${((($ = this._editingItem) == null ? void 0 : $.tags) ?? []).join(", ")}
                    />
                  </div>
                  <div class="row">
                    <label
                      ><input
                        type="checkbox"
                        name="favorite"
                        ?disabled=${!t}
                        ?checked=${(w = this._editingItem) == null ? void 0 : w.favorite}
                      />
                      ${this._t("favorite", "Favorite")}</label
                    >
                    <label
                      ><input
                        type="checkbox"
                        name="archived"
                        ?disabled=${!t}
                        ?checked=${(S = this._editingItem) == null ? void 0 : S.archived}
                      />
                      ${this._t("archived", "Archived")}</label
                    >
                  </div>
                  <div class="row" style="margin-top:16px">
                    ${t ? _`
                          <button class="btn btn-primary" type="submit">
                            ${this._t("save", "Save")}
                          </button>
                        ` : d}
                    <button
                      type="button"
                      class="btn btn-ghost"
                      @click=${this._closeEditor}
                    >
                      ${t ? this._t("cancel", "Cancel") : this._t("close", "Close")}
                    </button>
                    ${t && !this._isNewItem ? _`
                          <button
                            type="button"
                            class="btn"
                            style="margin-left:auto;color:var(--error-color)"
                            @click=${() => this._deleteCurrentItem()}
                          >
                            ${this._t("delete", "Delete")}
                          </button>
                        ` : d}
                  </div>
                </form>
              </div>
            </div>
          ` : d}
    `;
  }
};
f.styles = St`
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

    .field label {
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
  `;
g([
  et({ attribute: !1 })
], f.prototype, "hass", 2);
g([
  et({ type: Boolean, reflect: !0 })
], f.prototype, "narrow", 2);
g([
  y()
], f.prototype, "_snapshot", 2);
g([
  y()
], f.prototype, "_loading", 2);
g([
  y()
], f.prototype, "_error", 2);
g([
  y()
], f.prototype, "_selectedWishlistId", 2);
g([
  y()
], f.prototype, "_filterStatus", 2);
g([
  y()
], f.prototype, "_search", 2);
g([
  y()
], f.prototype, "_sort", 2);
g([
  y()
], f.prototype, "_editorOpen", 2);
g([
  y()
], f.prototype, "_editingWishlistId", 2);
g([
  y()
], f.prototype, "_editingItem", 2);
g([
  y()
], f.prototype, "_isNewItem", 2);
g([
  y()
], f.prototype, "_shareUrl", 2);
f = g([
  Bt("wishlist-manager-panel")
], f);
export {
  f as WishlistManagerPanel
};
