/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const B = globalThis, Q = B.ShadowRoot && (B.ShadyCSS === void 0 || B.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, X = Symbol(), at = /* @__PURE__ */ new WeakMap();
let vt = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== X) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (Q && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = at.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && at.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const At = (i) => new vt(typeof i == "string" ? i : i + "", void 0, X), St = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((s, r, a) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + i[a + 1], i[0]);
  return new vt(e, i, X);
}, kt = (i, t) => {
  if (Q) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), r = B.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = e.cssText, i.appendChild(s);
  }
}, ot = Q ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return At(e);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: It, defineProperty: Ct, getOwnPropertyDescriptor: Pt, getOwnPropertyNames: Tt, getOwnPropertySymbols: Ut, getPrototypeOf: Ot } = Object, S = globalThis, nt = S.trustedTypes, Dt = nt ? nt.emptyScript : "", Y = S.reactiveElementPolyfillSupport, M = (i, t) => i, F = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? Dt : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, t) {
  let e = i;
  switch (t) {
    case Boolean:
      e = i !== null;
      break;
    case Number:
      e = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(i);
      } catch {
        e = null;
      }
  }
  return e;
} }, tt = (i, t) => !It(i, t), lt = { attribute: !0, type: String, converter: F, reflect: !1, useDefault: !1, hasChanged: tt };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), S.litPropertyMetadata ?? (S.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let U = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = lt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(t, s, e);
      r !== void 0 && Ct(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: r, set: a } = Pt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: r, set(o) {
      const l = r == null ? void 0 : r.call(this);
      a == null || a.call(this, o), this.requestUpdate(t, l, s);
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
      const e = this.properties, s = [...Tt(e), ...Ut(e)];
      for (const r of s) this.createProperty(r, e[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, r] of e) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const r = this._$Eu(e, s);
      r !== void 0 && this._$Eh.set(r, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const r of s) e.unshift(ot(r));
    } else t !== void 0 && e.push(ot(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
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
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return kt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostConnected) == null ? void 0 : s.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostDisconnected) == null ? void 0 : s.call(e);
    });
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    var a;
    const s = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, s);
    if (r !== void 0 && s.reflect === !0) {
      const o = (((a = s.converter) == null ? void 0 : a.toAttribute) !== void 0 ? s.converter : F).toAttribute(e, s.type);
      this._$Em = t, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var a, o;
    const s = this.constructor, r = s._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const l = s.getPropertyOptions(r), n = typeof l.converter == "function" ? { fromAttribute: l.converter } : ((a = l.converter) == null ? void 0 : a.fromAttribute) !== void 0 ? l.converter : F;
      this._$Em = r;
      const c = n.fromAttribute(e, l.type);
      this[r] = c ?? ((o = this._$Ej) == null ? void 0 : o.get(r)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, r = !1, a) {
    var o;
    if (t !== void 0) {
      const l = this.constructor;
      if (r === !1 && (a = this[t]), s ?? (s = l.getPropertyOptions(t)), !((s.hasChanged ?? tt)(a, e) || s.useDefault && s.reflect && a === ((o = this._$Ej) == null ? void 0 : o.get(t)) && !this.hasAttribute(l._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: r, wrapped: a }, o) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), a !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), r === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
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
    var s;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [a, o] of this._$Ep) this[a] = o;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [a, o] of r) {
        const { wrapped: l } = o, n = this[a];
        l !== !0 || this._$AL.has(a) || n === void 0 || this.C(a, void 0, o, n);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (s = this._$EO) == null || s.forEach((r) => {
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
    (e = this._$EO) == null || e.forEach((s) => {
      var r;
      return (r = s.hostUpdated) == null ? void 0 : r.call(s);
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
U.elementStyles = [], U.shadowRootOptions = { mode: "open" }, U[M("elementProperties")] = /* @__PURE__ */ new Map(), U[M("finalized")] = /* @__PURE__ */ new Map(), Y == null || Y({ ReactiveElement: U }), (S.reactiveElementVersions ?? (S.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const R = globalThis, dt = (i) => i, V = R.trustedTypes, ht = V ? V.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, yt = "$lit$", A = `lit$${Math.random().toFixed(9).slice(2)}$`, wt = "?" + A, Wt = `<${wt}>`, T = document, z = () => T.createComment(""), H = (i) => i === null || typeof i != "object" && typeof i != "function", et = Array.isArray, Mt = (i) => et(i) || typeof (i == null ? void 0 : i[Symbol.iterator]) == "function", Z = `[ 	
\f\r]`, W = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ct = /-->/g, pt = />/g, I = RegExp(`>|${Z}(?:([^\\s"'>=/]+)(${Z}*=${Z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ut = /'/g, mt = /"/g, xt = /^(?:script|style|textarea|title)$/i, Rt = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), u = Rt(1), O = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), _t = /* @__PURE__ */ new WeakMap(), C = T.createTreeWalker(T, 129);
function Et(i, t) {
  if (!et(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ht !== void 0 ? ht.createHTML(t) : t;
}
const Nt = (i, t) => {
  const e = i.length - 1, s = [];
  let r, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = W;
  for (let l = 0; l < e; l++) {
    const n = i[l];
    let c, m, p = -1, b = 0;
    for (; b < n.length && (o.lastIndex = b, m = o.exec(n), m !== null); ) b = o.lastIndex, o === W ? m[1] === "!--" ? o = ct : m[1] !== void 0 ? o = pt : m[2] !== void 0 ? (xt.test(m[2]) && (r = RegExp("</" + m[2], "g")), o = I) : m[3] !== void 0 && (o = I) : o === I ? m[0] === ">" ? (o = r ?? W, p = -1) : m[1] === void 0 ? p = -2 : (p = o.lastIndex - m[2].length, c = m[1], o = m[3] === void 0 ? I : m[3] === '"' ? mt : ut) : o === mt || o === ut ? o = I : o === ct || o === pt ? o = W : (o = I, r = void 0);
    const x = o === I && i[l + 1].startsWith("/>") ? " " : "";
    a += o === W ? n + Wt : p >= 0 ? (s.push(c), n.slice(0, p) + yt + n.slice(p) + A + x) : n + A + (p === -2 ? l : x);
  }
  return [Et(i, a + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class L {
  constructor({ strings: t, _$litType$: e }, s) {
    let r;
    this.parts = [];
    let a = 0, o = 0;
    const l = t.length - 1, n = this.parts, [c, m] = Nt(t, e);
    if (this.el = L.createElement(c, s), C.currentNode = this.el.content, e === 2 || e === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (r = C.nextNode()) !== null && n.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const p of r.getAttributeNames()) if (p.endsWith(yt)) {
          const b = m[o++], x = r.getAttribute(p).split(A), k = /([.?@])?(.*)/.exec(b);
          n.push({ type: 1, index: a, name: k[2], strings: x, ctor: k[1] === "." ? Ht : k[1] === "?" ? Lt : k[1] === "@" ? jt : G }), r.removeAttribute(p);
        } else p.startsWith(A) && (n.push({ type: 6, index: a }), r.removeAttribute(p));
        if (xt.test(r.tagName)) {
          const p = r.textContent.split(A), b = p.length - 1;
          if (b > 0) {
            r.textContent = V ? V.emptyScript : "";
            for (let x = 0; x < b; x++) r.append(p[x], z()), C.nextNode(), n.push({ type: 2, index: ++a });
            r.append(p[b], z());
          }
        }
      } else if (r.nodeType === 8) if (r.data === wt) n.push({ type: 2, index: a });
      else {
        let p = -1;
        for (; (p = r.data.indexOf(A, p + 1)) !== -1; ) n.push({ type: 7, index: a }), p += A.length - 1;
      }
      a++;
    }
  }
  static createElement(t, e) {
    const s = T.createElement("template");
    return s.innerHTML = t, s;
  }
}
function D(i, t, e = i, s) {
  var o, l;
  if (t === O) return t;
  let r = s !== void 0 ? (o = e._$Co) == null ? void 0 : o[s] : e._$Cl;
  const a = H(t) ? void 0 : t._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== a && ((l = r == null ? void 0 : r._$AO) == null || l.call(r, !1), a === void 0 ? r = void 0 : (r = new a(i), r._$AT(i, e, s)), s !== void 0 ? (e._$Co ?? (e._$Co = []))[s] = r : e._$Cl = r), r !== void 0 && (t = D(i, r._$AS(i, t.values), r, s)), t;
}
class zt {
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
    const { el: { content: e }, parts: s } = this._$AD, r = ((t == null ? void 0 : t.creationScope) ?? T).importNode(e, !0);
    C.currentNode = r;
    let a = C.nextNode(), o = 0, l = 0, n = s[0];
    for (; n !== void 0; ) {
      if (o === n.index) {
        let c;
        n.type === 2 ? c = new j(a, a.nextSibling, this, t) : n.type === 1 ? c = new n.ctor(a, n.name, n.strings, this, t) : n.type === 6 && (c = new qt(a, this, t)), this._$AV.push(c), n = s[++l];
      }
      o !== (n == null ? void 0 : n.index) && (a = C.nextNode(), o++);
    }
    return C.currentNode = T, r;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class j {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, s, r) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
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
    t = D(this, t, e), H(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== O && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Mt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && H(this._$AH) ? this._$AA.nextSibling.data = t : this.T(T.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var a;
    const { values: e, _$litType$: s } = t, r = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = L.createElement(Et(s.h, s.h[0]), this.options)), s);
    if (((a = this._$AH) == null ? void 0 : a._$AD) === r) this._$AH.p(e);
    else {
      const o = new zt(r, this), l = o.u(this.options);
      o.p(e), this.T(l), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = _t.get(t.strings);
    return e === void 0 && _t.set(t.strings, e = new L(t)), e;
  }
  k(t) {
    et(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, r = 0;
    for (const a of t) r === e.length ? e.push(s = new j(this.O(z()), this.O(z()), this, this.options)) : s = e[r], s._$AI(a), r++;
    r < e.length && (this._$AR(s && s._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, e); t !== this._$AB; ) {
      const r = dt(t).nextSibling;
      dt(t).remove(), t = r;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class G {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, r, a) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = a, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = h;
  }
  _$AI(t, e = this, s, r) {
    const a = this.strings;
    let o = !1;
    if (a === void 0) t = D(this, t, e, 0), o = !H(t) || t !== this._$AH && t !== O, o && (this._$AH = t);
    else {
      const l = t;
      let n, c;
      for (t = a[0], n = 0; n < a.length - 1; n++) c = D(this, l[s + n], e, n), c === O && (c = this._$AH[n]), o || (o = !H(c) || c !== this._$AH[n]), c === h ? t = h : t !== h && (t += (c ?? "") + a[n + 1]), this._$AH[n] = c;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Ht extends G {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class Lt extends G {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class jt extends G {
  constructor(t, e, s, r, a) {
    super(t, e, s, r, a), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = D(this, t, e, 0) ?? h) === O) return;
    const s = this._$AH, r = t === h && s !== h || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, a = t !== h && (s === h || r);
    r && this.element.removeEventListener(this.name, this, s), a && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class qt {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    D(this, t);
  }
}
const J = R.litHtmlPolyfillSupport;
J == null || J(L, j), (R.litHtmlVersions ?? (R.litHtmlVersions = [])).push("3.3.2");
const Bt = (i, t, e) => {
  const s = (e == null ? void 0 : e.renderBefore) ?? t;
  let r = s._$litPart$;
  if (r === void 0) {
    const a = (e == null ? void 0 : e.renderBefore) ?? null;
    s._$litPart$ = r = new j(t.insertBefore(z(), a), a, void 0, e ?? {});
  }
  return r._$AI(i), r;
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Bt(e, this.renderRoot, this.renderOptions);
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
var $t;
N._$litElement$ = !0, N.finalized = !0, ($t = P.litElementHydrateSupport) == null || $t.call(P, { LitElement: N });
const K = P.litElementPolyfillSupport;
K == null || K({ LitElement: N });
(P.litElementVersions ?? (P.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ft = (i) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(i, t);
  }) : customElements.define(i, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Vt = { attribute: !0, type: String, converter: F, reflect: !1, hasChanged: tt }, Gt = (i = Vt, t, e) => {
  const { kind: s, metadata: r } = e;
  let a = globalThis.litPropertyMetadata.get(r);
  if (a === void 0 && globalThis.litPropertyMetadata.set(r, a = /* @__PURE__ */ new Map()), s === "setter" && ((i = Object.create(i)).wrapped = !0), a.set(e.name, i), s === "accessor") {
    const { name: o } = e;
    return { set(l) {
      const n = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(o, n, i, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(o, void 0, i, l), l;
    } };
  }
  if (s === "setter") {
    const { name: o } = e;
    return function(l) {
      const n = this[o];
      t.call(this, l), this.requestUpdate(o, n, i, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function q(i) {
  return (t, e) => typeof e == "object" ? Gt(i, t, e) : ((s, r, a) => {
    const o = r.hasOwnProperty(a);
    return r.constructor.createProperty(a, s), o ? Object.getOwnPropertyDescriptor(r, a) : void 0;
  })(i, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function w(i) {
  return q({ ...i, state: !0, attribute: !1 });
}
const Yt = "wishlist_manager";
function Zt(i, t, e, s) {
  if (!i) return ft(e, s);
  const r = `component.${Yt}.panel.${t}`;
  let a = e;
  if (typeof i.localize == "function")
    try {
      const o = i.localize(r);
      typeof o == "string" && o.trim() !== "" && o !== r && (a = o);
    } catch {
    }
  return ft(a, s);
}
function ft(i, t) {
  if (!t) return i;
  let e = i;
  for (const [s, r] of Object.entries(t))
    e = e.replaceAll(`{${s}}`, String(r));
  return e;
}
var Jt = Object.defineProperty, Kt = Object.getOwnPropertyDescriptor, g = (i, t, e, s) => {
  for (var r = s > 1 ? void 0 : s ? Kt(t, e) : t, a = i.length - 1, o; a >= 0; a--)
    (o = i[a]) && (r = (s ? o(t, e, r) : o(r)) || r);
  return s && r && Jt(t, e, r), r;
};
const v = {
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
async function y(i, t) {
  return typeof i.callWS == "function" ? i.callWS(t) : i.connection.sendMessagePromise(t);
}
function gt(i) {
  const t = i.user;
  return !!(t != null && t.is_admin || t != null && t.is_owner);
}
function bt(i) {
  return i === "desired" ? 0 : i === "maybe" ? 1 : 2;
}
let f = class extends N {
  constructor() {
    super(...arguments), this.narrow = !1, this._snapshot = null, this._loading = !0, this._error = null, this._selectedWishlistId = "all", this._filterStatus = "all", this._search = "", this._sort = "newest", this._editorOpen = !1, this._editingWishlistId = null, this._editingItem = null, this._isNewItem = !1, this._shareUrl = null;
  }
  _t(i, t, e) {
    return Zt(this.hass, i, t, e);
  }
  _statusLabel(i) {
    return i === "purchased" ? this._t("status_purchased", "Purchased") : i === "maybe" ? this._t("status_maybe", "Maybe") : this._t("status_desired", "Desired");
  }
  /**
   * HA hides the default hamburger on some custom-panel routes on mobile.
   * `ha-menu-button` uses the same event to open the drawer.
   */
  _toggleHaSidebar() {
    this.dispatchEvent(
      new Event("hass-toggle-menu", { bubbles: !0, composed: !0 })
    );
  }
  _mobileBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.assign("/");
  }
  connectedCallback() {
    super.connectedCallback(), this._refresh();
  }
  updated(i) {
    super.updated(i), i.has("hass") && this.hass && (this._refresh(), queueMicrotask(() => {
      this.isConnected && this.requestUpdate();
    }));
  }
  async _refresh() {
    if (this.hass) {
      this._loading = !0, this._error = null;
      try {
        const i = await y(this.hass, { type: v.LIST });
        this._snapshot = i;
      } catch (i) {
        this._error = i instanceof Error ? i.message : String(i);
      } finally {
        this._loading = !1;
      }
    }
  }
  _wishlistsSorted() {
    return this._snapshot ? [...this._snapshot.wishlists].sort(
      (i, t) => i.sort_order - t.sort_order
    ) : [];
  }
  _filteredItems() {
    if (!this._snapshot) return [];
    const i = this._search.trim().toLowerCase();
    let t = this._selectedWishlistId === "all" ? this._snapshot.wishlists : this._snapshot.wishlists.filter(
      (l) => l.id === this._selectedWishlistId
    ), e = [];
    for (const l of t)
      for (const n of l.items) {
        if (this._filterStatus === "archived") {
          if (!n.archived) continue;
        } else if (n.archived)
          continue;
        this._filterStatus !== "all" && this._filterStatus !== "archived" && n.status !== this._filterStatus || i && !`${n.title} ${n.description} ${n.notes} ${n.tags.join(" ")}`.toLowerCase().includes(i) || e.push({ wl: l, item: n });
      }
    const s = (l, n) => l.title.localeCompare(n.title), r = (l, n) => n.created_at.localeCompare(l.created_at), a = (l, n) => l.created_at.localeCompare(n.created_at), o = (l, n) => bt(l.status) - bt(n.status) || l.title.localeCompare(n.title);
    return e.sort((l, n) => this._sort === "alpha" ? s(l.item, n.item) : this._sort === "oldest" ? a(l.item, n.item) : this._sort === "status" ? o(l.item, n.item) : r(l.item, n.item)), e.map((l) => l.item);
  }
  _contextForItem(i) {
    if (!this._snapshot) return null;
    for (const t of this._snapshot.wishlists) {
      const e = t.items.find((s) => s.id === i);
      if (e) return { wishlist: t, item: e };
    }
    return null;
  }
  _recentItems() {
    if (!this._snapshot) return [];
    const i = [];
    for (const t of this._snapshot.wishlists)
      for (const e of t.items)
        e.archived || i.push(e);
    return i.sort((t, e) => e.created_at.localeCompare(t.created_at)).slice(0, 12);
  }
  async _mutate(i, t = !0) {
    try {
      await i(), t && await this._refresh();
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    }
  }
  _openCreateItem(i) {
    this._editingWishlistId = i, this._editingItem = null, this._isNewItem = !0, this._editorOpen = !0;
  }
  _openEditItem(i, t) {
    this._editingWishlistId = i, this._editingItem = { ...t }, this._isNewItem = !1, this._editorOpen = !0;
  }
  _closeEditor() {
    this._editorOpen = !1, this._editingItem = null, this._editingWishlistId = null;
  }
  async _saveEditor(i) {
    if (i.preventDefault(), !this.hass || !this._editingWishlistId || !gt(this.hass)) return;
    const t = i.target, e = new FormData(t), s = String(e.get("title") || "").trim();
    if (!s) return;
    const r = {
      title: s,
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
      () => y(this.hass, {
        type: v.CREATE_ITEM,
        wishlist_id: this._editingWishlistId,
        ...r
      })
    ) : this._editingItem && await this._mutate(
      () => y(this.hass, {
        type: v.UPDATE_ITEM,
        wishlist_id: this._editingWishlistId,
        item_id: this._editingItem.id,
        ...r
      })
    ), this._closeEditor();
  }
  async _deleteCurrentItem() {
    !this.hass || !this._editingWishlistId || !this._editingItem || this._isNewItem || confirm(this._t("confirm_delete_item", "Delete this item permanently?")) && (await this._mutate(
      () => y(this.hass, {
        type: v.DELETE_ITEM,
        wishlist_id: this._editingWishlistId,
        item_id: this._editingItem.id
      })
    ), this._closeEditor());
  }
  async _quickSetStatus(i, t, e) {
    this.hass && await this._mutate(
      () => y(this.hass, {
        type: v.SET_STATUS,
        wishlist_id: i,
        item_id: t.id,
        status: e
      })
    );
  }
  async _createWishlist() {
    const i = prompt(
      this._t("prompt_wishlist_name", "Wishlist name?"),
      this._t("default_new_wishlist", "New wishlist")
    );
    !i || !this.hass || await this._mutate(
      () => y(this.hass, {
        type: v.CREATE_WL,
        name: i.trim(),
        icon: "mdi:gift-outline"
      })
    );
  }
  async _renameWishlist(i) {
    const t = prompt(this._t("prompt_rename_wishlist", "Rename wishlist"), i.name);
    !t || !this.hass || await this._mutate(
      () => y(this.hass, {
        type: v.UPDATE_WL,
        wishlist_id: i.id,
        name: t.trim()
      })
    );
  }
  async _deleteWishlist(i) {
    confirm(
      this._t(
        "confirm_delete_wishlist",
        'Delete wishlist "{name}" and all items?',
        { name: i.name }
      )
    ) && this.hass && (await this._mutate(
      () => y(this.hass, {
        type: v.DELETE_WL,
        wishlist_id: i.id
      })
    ), this._selectedWishlistId === i.id && (this._selectedWishlistId = "all"));
  }
  async _onDropWishlist(i, t) {
    var o;
    i.preventDefault();
    const e = (o = i.dataTransfer) == null ? void 0 : o.getData("text/wishlist-id");
    if (!e || e === t || !this.hass || !this._snapshot) return;
    const s = this._wishlistsSorted().map((l) => l.id), r = s.indexOf(e), a = s.indexOf(t);
    r < 0 || a < 0 || (s.splice(r, 1), s.splice(a, 0, e), await this._mutate(
      () => y(this.hass, { type: v.REORDER_WL, wishlist_ids: s })
    ));
  }
  async _onDropItem(i, t, e) {
    var n, c;
    i.preventDefault();
    const s = (n = i.dataTransfer) == null ? void 0 : n.getData("text/item-id");
    if (!s || s === e || !this.hass) return;
    const r = (c = this._snapshot) == null ? void 0 : c.wishlists.find((m) => m.id === t);
    if (!r) return;
    const a = [...r.items].sort((m, p) => m.sort_order - p.sort_order).map((m) => m.id), o = a.indexOf(s), l = a.indexOf(e);
    o < 0 || l < 0 || (a.splice(o, 1), a.splice(l, 0, s), await this._mutate(
      () => y(this.hass, {
        type: v.REORDER_ITEMS,
        wishlist_id: t,
        item_ids: a
      })
    ));
  }
  _openExternalLink(i) {
    const t = i.trim();
    !t || !/^https?:\/\//i.test(t) || window.open(t, "_blank", "noopener,noreferrer");
  }
  _onItemDescriptionClick(i, t) {
    const e = String(t || "").trim();
    e && (i.preventDefault(), i.stopPropagation(), this._openExternalLink(e));
  }
  async _uploadItemImage(i) {
    var o, l;
    const t = i.target, e = (o = t.files) == null ? void 0 : o[0];
    if (!e || !this.hass) {
      t.value = "";
      return;
    }
    const s = typeof this.hass.fetchWithAuth == "function" ? this.hass.fetchWithAuth.bind(this.hass) : void 0;
    if (!s) {
      this._error = this._t(
        "upload_no_auth",
        "Upload requires Home Assistant sign-in (admin)."
      ), t.value = "";
      return;
    }
    this._error = null;
    const r = new FormData();
    r.append("file", e);
    const a = "/api/wishlist_manager/upload_image";
    try {
      const n = await s(a, {
        method: "POST",
        body: r
      }), c = await n.json();
      if (!n.ok)
        throw new Error(c.error || n.statusText);
      const m = (l = this.shadowRoot) == null ? void 0 : l.querySelector(
        "form#editor-form"
      ), p = m == null ? void 0 : m.querySelector('[name="image_url"]');
      p && c.image_url && (p.value = c.image_url), this.requestUpdate();
    } catch (n) {
      this._error = n instanceof Error ? n.message : String(n);
    } finally {
      t.value = "";
    }
  }
  async _fetchMetadata() {
    var e, s;
    if (!this.hass) return;
    const i = (e = this.shadowRoot) == null ? void 0 : e.querySelector(
      "form#editor-form"
    ), t = String(((s = i == null ? void 0 : i.querySelector('[name="external_url"]')) == null ? void 0 : s.value) || "").trim();
    if (!t) {
      this._error = this._t("error_add_link_first", "Add a link first.");
      return;
    }
    try {
      const r = await y(this.hass, {
        type: v.FETCH_META,
        url: t
      });
      if (!i) return;
      const a = i.querySelector('[name="title"]'), o = i.querySelector('[name="image_url"]'), l = i.querySelector(
        '[name="description"]'
      );
      r.title && a && !a.value && (a.value = r.title), r.image && o && !o.value && (o.value = r.image), r.description && l && !l.value && (l.value = r.description), this.requestUpdate();
    } catch (r) {
      this._error = r instanceof Error ? r.message : String(r);
    }
  }
  async _enableShare(i) {
    if (this.hass)
      try {
        const t = await y(this.hass, {
          type: v.REGEN_SHARE,
          wishlist_id: i.id
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
    var e, s, r, a, o, l, n, c, m, p, b, x, k;
    if (!this.hass)
      return u`<div class="empty">
        ${this._t("waiting_ha", "Waiting for Home Assistant…")}
      </div>`;
    if (this._loading && !this._snapshot)
      return u`<div class="empty">${this._t("loading", "Loading wishlists…")}</div>`;
    const i = (e = this._snapshot) == null ? void 0 : e.stats, t = gt(this.hass);
    return u`
      ${this._error ? u`<div class="error">${this._error}</div>` : h}

      ${this.narrow ? u`
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
          ` : h}

      <div class="toolbar">
        <input
          type="search"
          placeholder=${this._t(
      "search_placeholder",
      "Search title, notes, tags…"
    )}
          .value=${this._search}
          @input=${(d) => {
      this._search = d.target.value;
    }}
        />
        <select
          @change=${(d) => {
      this._filterStatus = d.target.value;
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
          @change=${(d) => {
      this._selectedWishlistId = d.target.value;
    }}
        >
          <option value="all" ?selected=${this._selectedWishlistId === "all"}>
            ${this._t("filter_all_lists", "All wishlists")}
          </option>
          ${this._wishlistsSorted().map(
      (d) => u`
              <option value=${d.id} ?selected=${this._selectedWishlistId === d.id}>
                ${d.name}
              </option>
            `
    )}
        </select>
        <select
          @change=${(d) => {
      this._sort = d.target.value;
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
        ${t ? u`<button class="btn btn-primary" @click=${this._createWishlist}>
              ${this._t("new_wishlist", "New wishlist")}
            </button>` : h}
        <button class="btn btn-ghost" @click=${() => this._refresh()}>
          ${this._t("refresh", "Refresh")}
        </button>
      </div>

      ${!this.narrow && i ? u`
            <div class="stats">
              <div class="stat-card" style="animation-delay:0ms">
                <b>${i.total_items}</b
                ><span>${this._t("stat_total", "Total items")}</span>
              </div>
              <div class="stat-card" style="animation-delay:40ms">
                <b>${i.purchased_items}</b
                ><span>${this._t("stat_purchased", "Purchased")}</span>
              </div>
              <div class="stat-card" style="animation-delay:80ms">
                <b>${i.desired_items}</b
                ><span>${this._t("stat_desired", "Desired")}</span>
              </div>
              <div class="stat-card" style="animation-delay:120ms">
                <b>${i.wishlist_count}</b
                ><span>${this._t("stat_wishlists", "Wishlists")}</span>
              </div>
            </div>
          ` : h}

      ${this.narrow ? h : u`
            <div class="section-title">
              ${this._t("recently_added", "Recently added")}
            </div>
            <div class="recent">
              ${this._recentItems().map(
      (d) => u`
                  <div
                    class="recent-card"
                    @click=${() => {
        const _ = this._contextForItem(d.id);
        _ && this._openEditItem(_.wishlist.id, _.item);
      }}
                  >
                    ${d.image_url ? u`<img src=${d.image_url} alt="" loading="lazy" />` : u`<div
                          style="height:120px;background:var(--divider-color)"
                        ></div>`}
                    <div class="meta">
                      <strong>${d.title}</strong>
                      <div style="font-size:0.8rem;color:var(--wm-muted)">
                        ${this._statusLabel(d.status)}
                      </div>
                    </div>
                  </div>
                `
    )}
            </div>
          `}

      <div class="section-title">
        ${this._t("section_wishlists", "Wishlists")}
      </div>
      <div class="wishlists-row">
        ${this._wishlistsSorted().map(
      (d) => u`
            <div
              class="chip ${this._selectedWishlistId === d.id ? "active" : ""}"
              draggable="true"
              @dragstart=${(_) => {
        var $;
        ($ = _.dataTransfer) == null || $.setData("text/wishlist-id", d.id);
      }}
              @dragover=${(_) => _.preventDefault()}
              @drop=${(_) => this._onDropWishlist(_, d.id)}
              @click=${() => {
        this._selectedWishlistId = d.id;
      }}
            >
              <span>${d.name}</span>
              ${t ? u`
                    <button
                      class="btn btn-ghost"
                      style="padding:2px 8px;font-size:0.7rem"
                      @click=${(_) => {
        _.stopPropagation(), this._renameWishlist(d);
      }}
                    >
                      ${this._t("rename", "Rename")}
                    </button>
                    <button
                      class="btn btn-ghost"
                      style="padding:2px 8px;font-size:0.7rem"
                      @click=${(_) => {
        _.stopPropagation(), this._deleteWishlist(d);
      }}
                    >
                      ${this._t("delete", "Delete")}
                    </button>
                    <button
                      class="btn btn-ghost"
                      style="padding:2px 8px;font-size:0.7rem"
                      @click=${(_) => {
        _.stopPropagation(), this._enableShare(d);
      }}
                    >
                      ${this._t("share_link", "Share link")}
                    </button>
                  ` : h}
            </div>
          `
    )}
      </div>

      ${this._shareUrl ? u`
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
          ` : h}

      <div class="section-title">${this._t("section_items", "Items")}</div>
      <div class="grid">
        ${this._filteredItems().map((d) => {
      var it, st;
      const _ = this._contextForItem(d.id);
      if (!_) return h;
      const { wishlist: $ } = _;
      return u`
            <div
              class="item-card"
              draggable="true"
              @dragstart=${(E) => {
        var rt;
        (rt = E.dataTransfer) == null || rt.setData("text/item-id", d.id);
      }}
              @dragover=${(E) => E.preventDefault()}
              @drop=${(E) => this._onDropItem(E, $.id, d.id)}
            >
              <div class="hero">
                ${d.image_url ? u`<img src=${d.image_url} alt="" loading="lazy" />` : h}
                <span class="badge ${d.status}"
                  >${this._statusLabel(d.status)}</span
                >
              </div>
              <div class="item-body">
                <div class="item-title">
                  ${d.favorite ? u`<span class="fav">★</span> ` : h}${d.title}
                </div>
                <div
                  class="item-desc ${d.external_url ? "item-desc-link" : ""}"
                  title=${d.external_url ? this._t("open_item_link", "Open product link") : ""}
                  @click=${(E) => this._onItemDescriptionClick(E, d.external_url)}
                >
                  ${d.description || this._t("dash", "—")}
                </div>
                ${d.price != null ? u`<div style="font-weight:600">
                      ${(st = (it = this.hass) == null ? void 0 : it.locale) != null && st.language ? new Intl.NumberFormat(this.hass.locale.language, {
        style: "currency",
        currency: "USD"
      }).format(d.price) : d.price}
                    </div>` : h}
                <div class="item-meta">
                  ${d.tags.map((E) => u`<span class="tag">${E}</span>`)}
                </div>
                <div class="actions">
                  ${t ? u`
                        <button
                          class="btn"
                          @click=${() => this._openEditItem($.id, d)}
                        >
                          ${this._t("edit", "Edit")}
                        </button>
                        <button
                          class="btn btn-ghost"
                          @click=${() => this._quickSetStatus($.id, d, "desired")}
                        >
                          ${this._t("action_desired", "Desired")}
                        </button>
                        <button
                          class="btn btn-ghost"
                          @click=${() => this._quickSetStatus($.id, d, "maybe")}
                        >
                          ${this._t("action_maybe", "Maybe")}
                        </button>
                        <button
                          class="btn btn-ghost"
                          @click=${() => this._quickSetStatus($.id, d, "purchased")}
                        >
                          ${this._t("action_got_it", "Got it")}
                        </button>
                      ` : u`<button
                        class="btn"
                        @click=${() => this._openEditItem($.id, d)}
                      >
                        ${this._t("view", "View")}
                      </button>`}
                </div>
              </div>
            </div>
          `;
    })}
      </div>

      ${this._filteredItems().length === 0 ? u`<div class="empty">
            ${this._t("no_items_filter", "No items match your filters.")}
          </div>` : h}

      ${t && this._selectedWishlistId !== "all" ? u`
            <div style="margin-top:20px">
              <button
                class="btn btn-primary"
                @click=${() => this._openCreateItem(this._selectedWishlistId)}
              >
                ${this._t("add_item_this_list", "Add item to this list")}
              </button>
            </div>
          ` : t ? u`
              <div class="empty">
                ${this._t(
      "pick_wishlist_hint",
      "Select a specific wishlist to add items, or use the wishlist chips above."
    )}
              </div>
            ` : h}

      ${this._editorOpen ? u`
            <div
              class="modal-backdrop"
              @click=${(d) => {
      d.target === d.currentTarget && this._closeEditor();
    }}
            >
              <div class="modal" @click=${(d) => d.stopPropagation()}>
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
                      .value=${((s = this._editingItem) == null ? void 0 : s.title) ?? ""}
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
                  ${t ? u`
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
                              @click=${(d) => {
      var $;
      const _ = ($ = d.currentTarget.closest(".wm-file-upload")) == null ? void 0 : $.querySelector(
        'input[type="file"]'
      );
      _ == null || _.click();
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
                              @change=${(d) => this._uploadItemImage(d)}
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
                      ` : h}
                  <div class="field">
                    <label>${this._t("label_external_link", "External link")}</label>
                    <input
                      name="external_url"
                      ?disabled=${!t}
                      .value=${((o = this._editingItem) == null ? void 0 : o.external_url) ?? ""}
                    />
                  </div>
                  <div class="row">
                    ${t ? u`
                          <button
                            type="button"
                            class="btn btn-ghost"
                            @click=${() => this._fetchMetadata()}
                          >
                            ${this._t("fill_from_link", "Fill from link")}
                          </button>
                        ` : h}
                  </div>
                  <div class="field">
                    <label>${this._t("label_notes", "Notes")}</label>
                    <textarea name="notes" ?disabled=${!t}>
${((l = this._editingItem) == null ? void 0 : l.notes) ?? ""}</textarea>
                  </div>
                  <div class="field">
                    <label>${this._t("label_status", "Status")}</label>
                    <select name="status" ?disabled=${!t}>
                      <option
                        value="desired"
                        ?selected=${(((n = this._editingItem) == null ? void 0 : n.status) ?? "desired") === "desired"}
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
                        ?selected=${((m = this._editingItem) == null ? void 0 : m.status) === "purchased"}
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
                      .value=${(((b = this._editingItem) == null ? void 0 : b.tags) ?? []).join(", ")}
                    />
                  </div>
                  <div class="row">
                    <label
                      ><input
                        type="checkbox"
                        name="favorite"
                        ?disabled=${!t}
                        ?checked=${(x = this._editingItem) == null ? void 0 : x.favorite}
                      />
                      ${this._t("favorite", "Favorite")}</label
                    >
                    <label
                      ><input
                        type="checkbox"
                        name="archived"
                        ?disabled=${!t}
                        ?checked=${(k = this._editingItem) == null ? void 0 : k.archived}
                      />
                      ${this._t("archived", "Archived")}</label
                    >
                  </div>
                  <div class="row" style="margin-top:16px">
                    ${t ? u`
                          <button class="btn btn-primary" type="submit">
                            ${this._t("save", "Save")}
                          </button>
                        ` : h}
                    <button
                      type="button"
                      class="btn btn-ghost"
                      @click=${this._closeEditor}
                    >
                      ${t ? this._t("cancel", "Cancel") : this._t("close", "Close")}
                    </button>
                    ${t && !this._isNewItem ? u`
                          <button
                            type="button"
                            class="btn"
                            style="margin-left:auto;color:var(--error-color)"
                            @click=${() => this._deleteCurrentItem()}
                          >
                            ${this._t("delete", "Delete")}
                          </button>
                        ` : h}
                  </div>
                </form>
              </div>
            </div>
          ` : h}
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
g([
  q({ attribute: !1 })
], f.prototype, "hass", 2);
g([
  q({ type: Boolean, reflect: !0 })
], f.prototype, "narrow", 2);
g([
  q({ attribute: !1 })
], f.prototype, "route", 2);
g([
  q({ attribute: !1 })
], f.prototype, "panel", 2);
g([
  w()
], f.prototype, "_snapshot", 2);
g([
  w()
], f.prototype, "_loading", 2);
g([
  w()
], f.prototype, "_error", 2);
g([
  w()
], f.prototype, "_selectedWishlistId", 2);
g([
  w()
], f.prototype, "_filterStatus", 2);
g([
  w()
], f.prototype, "_search", 2);
g([
  w()
], f.prototype, "_sort", 2);
g([
  w()
], f.prototype, "_editorOpen", 2);
g([
  w()
], f.prototype, "_editingWishlistId", 2);
g([
  w()
], f.prototype, "_editingItem", 2);
g([
  w()
], f.prototype, "_isNewItem", 2);
g([
  w()
], f.prototype, "_shareUrl", 2);
f = g([
  Ft("wishlist-manager-panel")
], f);
export {
  f as WishlistManagerPanel
};
