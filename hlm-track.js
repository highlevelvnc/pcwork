/*! hlm-track v1 — tipo de contacto + origem do lead, sem dependências. HLM Marketing.
 *  - Tipo vem do próprio link: wa.me/api.whatsapp.com → whatsapp, tel: → phone, mailto: → email.
 *  - Origem: ads_google | ads_meta | seo | gbp | ia | social | direct | referral | email | other.
 *  - Primeiro toque guardado 90 dias em localStorage SÓ com analytics_storage concedido; sem consentimento só sessionStorage.
 *  - Envia eventos via gtag (o Consent Mode do site decide o que sai). Não guarda nem envia valores de click ids.
 *  - Código ref curto e opcional no texto do WhatsApp/assunto do email: "ref <origem><botão><página>" (sem dados pessoais).
 */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.hlmTrack = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";
  var AI = [
    ["chatgpt.com", "chatgpt"], ["chat.openai.com", "chatgpt"], ["openai.com", "chatgpt"], ["perplexity.ai", "perplexity"],
    ["gemini.google.com", "gemini"], ["bard.google.com", "gemini"], ["copilot.microsoft.com", "copilot"], ["copilot.cloud.microsoft", "copilot"],
    ["claude.ai", "claude"], ["you.com", "you"], ["phind.com", "phind"], ["deepseek.com", "deepseek"], ["chat.deepseek.com", "deepseek"],
    ["meta.ai", "meta_ai"], ["grok.com", "grok"], ["kagi.com", "kagi"], ["mistral.ai", "mistral"], ["chat.mistral.ai", "mistral"]
  ];
  var SEARCH = /(^|\.)(google|bing|duckduckgo|ecosia|yahoo|brave|startpage|yandex|qwant|baidu|seznam|naver|ask|aol)\.[a-z.]+$/;
  var SOCIAL = /(^|\.)(facebook|instagram|linkedin|tiktok|youtube|pinterest|twitter|t|x|reddit|threads|lnkd|wa|whatsapp|messenger)\.(com|co|in|me|net|ly)$/;
  var META_SRC = /^(facebook|fb|ig|instagram|meta|an|audience_network|messenger|fb_ads|facebook_ads|meta_ads)$/i;
  var GBP_SRC = /^(gbp|gmb|google_business|google_business_profile|googlebusiness|google_maps|maps)$/i;
  var ORIGIN_CODE = { ads_google: "g", ads_meta: "m", seo: "s", gbp: "b", ia: "i", social: "o", direct: "d", referral: "r", email: "e", other: "x" };
  var CTA_CODE = { header: "h", hero: "r", floating: "f", sticky: "k", footer: "t", faq: "q", form: "o", content: "c", cta: "a", promo: "p", contact: "n" };
  var FIRST_KEY = "hlm_first", TOUCH_KEY = "hlm_touch", TTL = 90 * 24 * 3600 * 1000;

  function host(u) { try { return new URL(u).hostname.replace(/^www\./, "").toLowerCase(); } catch (e) { return ""; } }
  function aiEngine(h) { for (var i = 0; i < AI.length; i++) { if (h === AI[i][0] || h.slice(-AI[i][0].length - 1) === "." + AI[i][0]) return AI[i][1]; } return ""; }

  /** loc = { search, hostname }, referrer = document.referrer. Devolve { origin, ai_engine, campaign, click_id_type }. */
  function deriveOrigin(loc, referrer) {
    var p; try { p = new URLSearchParams(loc.search || ""); } catch (e) { p = new URLSearchParams(""); }
    var src = (p.get("utm_source") || "").toLowerCase(), med = (p.get("utm_medium") || "").toLowerCase(), cmp = p.get("utm_campaign") || "";
    var rh = host(referrer || ""), own = (loc.hostname || "").replace(/^www\./, "").toLowerCase();
    if (rh && rh === own) rh = "";
    var out = { origin: "direct", ai_engine: "", campaign: cmp.slice(0, 80), click_id_type: "" };
    var cid = p.get("gclid") ? "gclid" : p.get("gbraid") ? "gbraid" : p.get("wbraid") ? "wbraid" : p.get("fbclid") ? "fbclid" : "";
    out.click_id_type = cid;
    var paid = /^(cpc|ppc|paid|paidsearch|paid_search|paid_social|paidsocial|display|cpm|cpv|remarketing)$/.test(med);
    if (cid === "gclid" || cid === "gbraid" || cid === "wbraid") { out.origin = "ads_google"; return out; }
    if (cid === "fbclid" && (META_SRC.test(src) || paid || !src)) { out.origin = "ads_meta"; return out; }
    if (META_SRC.test(src) && (paid || /^(social|paid)/.test(med) || p.get("utm_id"))) { out.origin = "ads_meta"; return out; }
    if (GBP_SRC.test(src) || /^(gbp|gmb)$/.test(med) || /^(gbp|gmb)$/i.test(cmp) || (src === "google" && /^(gbp|gmb|google[-_]?business)/i.test(cmp))) { out.origin = "gbp"; return out; }
    if (src === "google" && paid) { out.origin = "ads_google"; return out; }
    var e = aiEngine(src) || aiEngine(host("https://" + src)) || aiEngine(rh);
    if (e) { out.origin = "ia"; out.ai_engine = e; return out; }
    if (med === "email" || /^(email|newsletter|mailchimp|brevo|sendinblue)$/.test(src)) { out.origin = "email"; return out; }
    if (paid) { out.origin = "other"; return out; }
    if (/(^|\.)maps\.google\./.test(rh) || (/(^|\.)google\.[a-z.]+$/.test(rh) && /maps/.test(referrer || ""))) { out.origin = "gbp"; return out; }
    if (rh && SOCIAL.test(rh)) { out.origin = "social"; return out; }
    if (rh && SEARCH.test(rh)) { out.origin = "seo"; return out; }
    if (med === "organic") { out.origin = "seo"; return out; }
    if (med === "social" || med === "social-network") { out.origin = "social"; return out; }
    if (rh) { out.origin = "referral"; return out; }
    return out;
  }

  function pageHash(path) { var h = 0; path = (path || "/").replace(/\/$/, "") || "/"; for (var i = 0; i < path.length; i++) h = (h * 31 + path.charCodeAt(i)) >>> 0; return h.toString(36).slice(-2).padStart(2, "0"); }
  function refCode(origin, cta, path) { return (ORIGIN_CODE[origin] || "x") + (CTA_CODE[cta] || "n") + pageHash(path); }

  function classify(href) {
    if (!href) return "";
    var h = String(href).trim();
    if (/^tel:/i.test(h)) return "phone";
    if (/^mailto:/i.test(h)) return "email";
    try { var u = new URL(h, "https://x.invalid"); var hn = u.hostname.replace(/^www\./, ""); if (hn === "wa.me" || hn === "api.whatsapp.com" || hn === "web.whatsapp.com" || hn === "whatsapp.com") return "whatsapp"; } catch (e) {}
    return "";
  }

  function withRef(href, channel, code) {
    try {
      if (channel === "whatsapp") {
        var u = new URL(href, "https://x.invalid"); var t = u.searchParams.get("text") || "";
        if (/\(ref [a-z0-9]{4}\)/.test(t)) return href;
        u.searchParams.set("text", (t ? t + " " : "") + "(ref " + code + ")");
        return /^https?:/i.test(href) ? u.toString().replace(/\+/g, "%20") : href;
      }
      if (channel === "email") {
        var m = String(href).match(/^mailto:([^?]*)(\?(.*))?$/i); if (!m) return href;
        var q = new URLSearchParams(m[3] || ""); var s = q.get("subject") || "Pedido de orçamento";
        if (/\(ref [a-z0-9]{4}\)/.test(s)) return href;
        q.set("subject", s + " (ref " + code + ")");
        return "mailto:" + m[1] + "?" + q.toString().replace(/\+/g, "%20");
      }
    } catch (e) {}
    return href;
  }

  function ctaLocation(a) {
    var d = a.getAttribute && a.getAttribute("data-cta"); if (d) return String(d).slice(0, 40);
    var el = a, hops = 0;
    while (el && el.nodeType === 1 && hops < 12) {
      var tag = (el.tagName || "").toLowerCase(), cls = ((el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className) || "") + " " + (el.id || "");
      var cs = root.getComputedStyle ? root.getComputedStyle(el) : null;
      if (cs && (cs.position === "fixed" || cs.position === "sticky") && tag !== "header") return tag === "footer" || /bar|cta/i.test(cls) ? "sticky" : "floating";
      if (tag === "header" || tag === "nav" || /(^|\s)(header|navbar|topbar)(\s|$)/i.test(cls)) return "header";
      if (tag === "footer" || /(^|\s)footer(\s|$)/i.test(cls)) return "footer";
      if (tag === "form") return "form";
      if (/faq/i.test(cls)) return "faq";
      if (/hero|banner|jumbotron/i.test(cls)) return "hero";
      if (/promo/i.test(cls)) return "promo";
      el = el.parentElement; hops++;
    }
    return "content";
  }

  function store(kind) { try { return root[kind]; } catch (e) { return null; } }
  function readJson(s, k) { try { var v = s && s.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function writeJson(s, k, v) { try { s && s.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /** Lê o último comando de consentimento do dataLayer (gtag('consent', ...)). */
  function analyticsGranted() {
    var dl = root.dataLayer || [], state = null;
    for (var i = 0; i < dl.length; i++) {
      var it = dl[i];
      if (it && it[0] === "consent" && (it[1] === "default" || it[1] === "update") && it[2] && it[2].analytics_storage) state = it[2].analytics_storage === "granted";
    }
    return state === true;
  }

  var cfg = { legacy: {}, ref: true, debug: false };
  var state = { touch: null, first: null };

  function currentTouch() {
    var ss = store("sessionStorage"), ls = store("localStorage"), now = Date.now();
    var d = deriveOrigin({ search: root.location.search, hostname: root.location.hostname }, root.document.referrer);
    var landing = root.location.pathname;
    var sess = readJson(ss, TOUCH_KEY);
    if (!sess || (d.origin !== "direct" && sess.origin !== d.origin)) { sess = { origin: d.origin, ai_engine: d.ai_engine, campaign: d.campaign, click_id_type: d.click_id_type, landing_path: landing, ts: now }; writeJson(ss, TOUCH_KEY, sess); }
    var first = null;
    if (analyticsGranted()) {
      first = readJson(ls, FIRST_KEY);
      if (!first || now - first.ts > TTL) { first = { origin: sess.origin, ai_engine: sess.ai_engine, campaign: sess.campaign, landing_path: sess.landing_path, ts: now }; writeJson(ls, FIRST_KEY, first); }
    } else { first = readJson(ls, FIRST_KEY); if (first && now - first.ts > TTL) first = null; }
    state.touch = sess; state.first = first;
    // origem efectiva do contacto: a da sessão; se for "directo", recupera a do primeiro toque guardado
    var eff = sess.origin !== "direct" ? sess : (first && first.origin !== "direct" ? first : sess);
    return { eff: eff, sess: sess, first: first };
  }

  function emit(name, params) {
    if (cfg.debug) try { console.log("[hlm-track]", name, params); } catch (e) {}
    if (typeof root.gtag === "function") root.gtag("event", name, params);
    else { (root.dataLayer = root.dataLayer || []).push({ event: name, ...params }); }
  }

  function onClick(ev) {
    var t = ev.target; var a = t && t.closest ? t.closest("a[href]") : null; if (!a) return;
    var href = a.getAttribute("href"); var channel = classify(href); if (!channel) return;
    var tk = currentTouch(), cta = ctaLocation(a), path = root.location.pathname;
    var code = refCode(tk.eff.origin, cta, path);
    if (cfg.ref && (channel === "whatsapp" || channel === "email")) { var nh = withRef(href, channel, code); if (nh !== href) a.setAttribute("href", nh); }
    var params = {
      channel: channel, cta_location: cta, page_path: path, origin: tk.eff.origin, landing_path: tk.eff.landing_path || path,
      first_origin: (tk.first && tk.first.origin) || tk.eff.origin, ai_engine: tk.eff.ai_engine || "", campaign: tk.eff.campaign || "",
      click_id_type: tk.sess.click_id_type || "", ref_code: code
    };
    emit(channel + "_click", params);
    var legacy = cfg.legacy && cfg.legacy[channel];
    if (legacy && legacy !== channel + "_click") emit(legacy, params);
  }

  /** Para formulários: devolve a atribuição a pôr em campos escondidos (origin, landing_path, etc.). */
  function getAttribution() {
    var tk = currentTouch();
    return { origin: tk.eff.origin, first_origin: (tk.first && tk.first.origin) || tk.eff.origin, ai_engine: tk.eff.ai_engine || "", campaign: tk.eff.campaign || "", landing_path: tk.eff.landing_path || root.location.pathname, ref_code: refCode(tk.eff.origin, "form", root.location.pathname) };
  }

  /** Contacto sem <a> (ex.: botão que abre wa.me por JS): hlmTrack.track("whatsapp", { cta_location: "form" }). Devolve o código ref. */
  function track(channel, extra) {
    var tk = currentTouch(), cta = (extra && extra.cta_location) || "content", path = root.location.pathname, code = refCode(tk.eff.origin, cta, path);
    var params = { channel: channel, cta_location: cta, page_path: path, origin: tk.eff.origin, landing_path: tk.eff.landing_path || path, first_origin: (tk.first && tk.first.origin) || tk.eff.origin, ai_engine: tk.eff.ai_engine || "", campaign: tk.eff.campaign || "", click_id_type: tk.sess.click_id_type || "", ref_code: code };
    emit(channel + "_click", params);
    var legacy = cfg.legacy && cfg.legacy[channel];
    if (legacy && legacy !== channel + "_click") emit(legacy, params);
    return code;
  }
  /** Contacto CONFIRMADO (resposta de sucesso do servidor/Resend/booking): único evento generate_lead. */
  function lead(channel, extra) {
    var a = getAttribution(), params = { channel: channel || "form", cta_location: (extra && extra.cta_location) || "form", page_path: root.location.pathname, origin: a.origin, landing_path: a.landing_path, first_origin: a.first_origin, ai_engine: a.ai_engine, campaign: a.campaign, ref_code: a.ref_code };
    emit("generate_lead", params);
    return a.ref_code;
  }

  var started = false;
  function init(opts) {
    if (opts) { for (var k in opts) cfg[k] = opts[k]; }
    if (started || !root.document) return; started = true;
    currentTouch();
    root.document.addEventListener("click", onClick, true);
    root.document.addEventListener("auxclick", onClick, true);
  }

  return { init: init, track: track, lead: lead, deriveOrigin: deriveOrigin, refCode: refCode, classify: classify, withRef: withRef, getAttribution: getAttribution, pageHash: pageHash, ORIGIN_CODE: ORIGIN_CODE, CTA_CODE: CTA_CODE };
});
