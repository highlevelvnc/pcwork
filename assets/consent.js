/*
 * PC Work Vertical — GA4 com consentimento estrito (Consent Mode v2).
 *
 * >>> ÚNICO sítio do ID de medição GA4 <<<
 * Enquanto GA4_ID estiver vazio este ficheiro não faz nada: não mostra aviso,
 * não carrega nada do Google e esconde os links "Preferências de cookies".
 * Para activar: GA4_ID = "G-XXXXXXXXXX".
 */
(function () {
  "use strict";

  var GA4_ID = "";

  var STORE_KEY = "pcwork_consent_v2"; // "granted" | "denied"
  var doc = document;

  // ---- sem ID: inactivo ------------------------------------------------
  if (!GA4_ID) {
    doc.addEventListener("DOMContentLoaded", function () {
      var els = doc.querySelectorAll("[data-cookie-prefs]");
      for (var i = 0; i < els.length; i++) els[i].style.display = "none";
    });
    window.pcwTrack = function () {};
    return;
  }

  // ---- armazenamento (tolerante a falhas) ------------------------------
  function readChoice() {
    try { return window.localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }
  function writeChoice(v) {
    try { window.localStorage.setItem(STORE_KEY, v); } catch (e) {}
  }

  // ---- Consent Mode v2: tudo negado por defeito (sem pedidos de rede) ---
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  });

  var active = false; // true só depois de aceitar e de o gtag.js ser injectado

  function loadGA() {
    if (active) return;
    active = true;
    window["ga-disable-" + GA4_ID] = false;
    gtag("consent", "update", { analytics_storage: "granted" });
    gtag("js", new Date());
    gtag("config", GA4_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    var s = doc.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_ID);
    doc.head.appendChild(s);
  }

  function clearGaCookies() {
    var names = doc.cookie.split(";").map(function (c) { return c.split("=")[0].trim(); });
    var host = location.hostname;
    var parts = host.split(".");
    var domains = [host, "." + host];
    if (parts.length > 2) domains.push("." + parts.slice(-2).join("."));
    else domains.push("." + host);
    names.forEach(function (n) {
      if (n === "_ga" || n.indexOf("_ga_") === 0 || n === "_gid" || n.indexOf("_gat") === 0) {
        domains.forEach(function (d) {
          doc.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + d;
        });
        doc.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      }
    });
  }

  // ---- eventos ---------------------------------------------------------
  function track(name, params) {
    if (!active) return;
    window.gtag("event", name, params || {});
  }
  window.pcwTrack = track;

  function ctaLocation(a) {
    var d = a.getAttribute("data-cta-location");
    if (d) return d;
    if (a.id === "floatingWa") return "floating_button";
    if (a.id === "calcCta") return "calculator";
    if (a.id === "formWaLink") return "form_contact_fallback";
    if (a.closest("#stickyCta")) return "sticky_mobile";
    if (a.closest("#exitOverlay")) return "exit_popup";
    if (a.closest("nav")) return "header";
    if (a.closest("footer")) return "footer";
    var s = a.closest("section[id]");
    if (s) return s.id;
    if (a.closest("article")) return "article";
    if (a.closest("section")) return "content";
    if (a.closest("header")) return "hero";
    return "page";
  }

  function onClick(ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    var a = t.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var name = null, link = null;
    if (/^tel:/i.test(href)) {
      name = "phone_click"; link = href.split("?")[0];
    } else if (/^mailto:/i.test(href)) {
      name = "email_click"; link = href.split("?")[0];
    } else if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href)) {
      name = "whatsapp_click"; link = href.split("?")[0].split("#")[0];
    }
    if (!name) return;
    track(name, { cta_location: ctaLocation(a), link_url: link });
  }
  doc.addEventListener("click", onClick, true);

  // ---- aviso de cookies ------------------------------------------------
  var banner = null;

  function injectStyle() {
    if (doc.getElementById("pcc-style")) return;
    var st = doc.createElement("style");
    st.id = "pcc-style";
    st.textContent =
      "#pcc-banner{position:fixed;z-index:9992;left:12px;right:12px;bottom:12px;background:#141416;" +
      "border:1px solid rgba(255,255,255,.12);padding:14px;color:#B0A8A0;font:400 13px/1.5 Inter,system-ui,sans-serif;" +
      "box-shadow:0 8px 30px rgba(0,0,0,.45);box-sizing:border-box}" +
      "#pcc-banner.pcc-lift{bottom:96px}" +
      "#pcc-banner p{margin:0 0 12px}" +
      "#pcc-banner a{color:#F0A050;text-decoration:underline;text-underline-offset:2px}" +
      "#pcc-banner .pcc-btns{display:flex;gap:8px}" +
      "#pcc-banner button{flex:1;cursor:pointer;background:#1E1E21;color:#F2F0F1;border:1px solid rgba(255,255,255,.28);" +
      "padding:10px 12px;font:700 12px/1 'Space Grotesk',Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase}" +
      "#pcc-banner button:hover,#pcc-banner button:focus-visible{background:#26262A;border-color:#E8872A;outline:none}" +
      "@media(min-width:640px){#pcc-banner{left:16px;right:auto;bottom:16px;max-width:400px}#pcc-banner.pcc-lift{bottom:16px}}";
    doc.head.appendChild(st);
  }

  function buildBanner() {
    injectStyle();
    banner = doc.createElement("div");
    banner.id = "pcc-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Preferências de cookies");
    banner.innerHTML =
      "<p>Usamos cookies de estatística (Google Analytics) para perceber como o site é utilizado e quantos pedidos de contacto recebemos. " +
      "Só são ativados se aceitar. <a href=\"" + policyHref() + "\">Política de Privacidade</a>.</p>" +
      "<div class=\"pcc-btns\"><button type=\"button\" data-pcc=\"deny\">Recusar</button>" +
      "<button type=\"button\" data-pcc=\"accept\">Aceitar</button></div>";
    if (doc.getElementById("floatingWa")) banner.className = "pcc-lift";
    banner.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("button[data-pcc]");
      if (!b) return;
      choose(b.getAttribute("data-pcc") === "accept" ? "granted" : "denied");
    });
    doc.body.appendChild(banner);
  }

  function policyHref() {
    return "/privacidade.html";
  }

  function showBanner() {
    if (!banner) buildBanner();
    banner.style.display = "block";
  }
  function hideBanner() {
    if (banner) banner.style.display = "none";
  }

  function choose(v) {
    var before = readChoice();
    writeChoice(v);
    hideBanner();
    if (v === "granted") {
      loadGA();
    } else if (active || before === "granted") {
      // retirar consentimento: desliga, apaga _ga* e recarrega
      window["ga-disable-" + GA4_ID] = true;
      clearGaCookies();
      location.reload();
    }
  }

  function init() {
    try { window.localStorage.removeItem("pcwork_cookies"); } catch (e) {}
    var c = readChoice();
    if (c === "granted") {
      loadGA();
    } else if (c !== "denied") {
      setTimeout(showBanner, 1000);
    }
    doc.addEventListener("click", function (e) {
      var p = e.target.closest && e.target.closest("[data-cookie-prefs]");
      if (!p) return;
      e.preventDefault();
      showBanner();
    });
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})();
