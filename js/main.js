/* TECHKEEP — comportements du site (aucune dépendance) */
(function () {
  "use strict";

  var cfg = window.TECHKEEP_CONFIG || {};
  var contact = cfg.contact || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Utilitaires ------------------------------------------------ */
  function text(v) { return typeof v === "string" ? v.trim() : ""; }
  function digits(v) { return text(v).replace(/[^\d]/g, ""); }
  function telHref(v) { var t = text(v), plus = t.charAt(0) === "+" ? "+" : ""; return "tel:" + plus + digits(t); }
  function safeUrl(v) {
    try { var u = new URL(text(v)); return (u.protocol === "https:" || u.protocol === "http:") ? u.href : ""; }
    catch (e) { return ""; }
  }
  function link(href, label) {
    var a = document.createElement("a");
    a.href = href; a.textContent = label;
    return a;
  }

  /* ---------- Année dynamique ------------------------------------------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Menu mobile ------------------------------------------------ */
  var toggle = $(".nav-toggle");
  var nav = $("#site-nav");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setMenu(false); toggle.focus(); }
    });
    window.matchMedia("(min-width: 981px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });
  }

  /* ---------- Révélations discrètes ------------------------------------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Défilement : en-tête, lien actif, fil des domaines -------- */
  var header = $(".site-header");
  var sections = $$("[data-nav-section]");
  var navLinks = $$("a[data-nav]", nav);
  var domains = $$(".domain");
  var ticking = false;

  function onScroll() {
    ticking = false;
    var vh = window.innerHeight;
    header.classList.toggle("is-scrolled", window.scrollY > 8);

    // lien actif : dernière section dont le haut a passé 35 % de la fenêtre
    var current = sections[0] && sections[0].dataset.navSection;
    sections.forEach(function (s) { if (s.getBoundingClientRect().top <= vh * 0.35) current = s.dataset.navSection; });
    navLinks.forEach(function (a) {
      if (a.dataset.nav === current) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });

    // domaines : le fil bleu avance avec la lecture (une seule animation liée au défilement)
    var line = vh * 0.62;
    domains.forEach(function (d) { d.classList.toggle("is-lit", reduceMotion || d.getBoundingClientRect().top < line); });
  }
  function requestTick() { if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); } }
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
  onScroll();

  /* ---------- « En savoir plus » ---------------------------------------- */
  $$(".more-btn").forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    panel.firstElementChild.inert = true;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      panel.classList.toggle("is-open", open);
      panel.firstElementChild.inert = !open;
    });
  });

  /* ---------- Préselection du domaine depuis les liens « devis » -------- */
  var selectDomaine = $("#f-domaine");
  $$("a[data-domain]").forEach(function (a) {
    a.addEventListener("click", function () { if (selectDomaine) selectDomaine.value = a.dataset.domain; });
  });

  /* ---------- Coordonnées configurables --------------------------------- */
  var missing = [];
  function fillCoord(key, value, buildNode) {
    var row = $('[data-coord="' + key + '"]');
    var v = text(value);
    if (!row) return;
    var out = $(".coord-value", row);
    if (!v) {
      if (key === "whatsapp" || key === "hours") { row.hidden = true; return; }
      row.classList.add("is-missing"); missing.push("contact." + key); return;
    }
    row.hidden = false; row.classList.remove("is-missing");
    out.textContent = ""; out.appendChild(buildNode(v));
  }
  fillCoord("email", contact.email, function (v) { return link("mailto:" + v, v); });
  fillCoord("phone", contact.phone, function (v) { return link(telHref(v), v); });
  fillCoord("address", contact.address, function (v) { return document.createTextNode(v); });
  fillCoord("hours", contact.hours, function (v) { return document.createTextNode(v); });

  var wa = cfg.whatsapp || {};
  var waNumber = digits(wa.number);
  var waHref = waNumber ? "https://wa.me/" + waNumber + (text(wa.message) ? "?text=" + encodeURIComponent(wa.message) : "") : "";
  if (waHref) {
    fillCoord("whatsapp", wa.number, function (v) {
      var a = link(waHref, v); a.target = "_blank"; a.rel = "noopener"; return a;
    });
    // bouton flottant : uniquement avec un numéro officiel configuré
    var fab = document.createElement("a");
    fab.className = "wa-float"; fab.href = waHref; fab.target = "_blank"; fab.rel = "noopener";
    fab.setAttribute("aria-label", "Écrire à TECHKEEP sur WhatsApp (s’ouvre dans un nouvel onglet)");
    fab.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-message-circle"/></svg><span>WhatsApp</span>';
    document.body.appendChild(fab);
  } else {
    missing.push("whatsapp.number (bouton flottant masqué)");
  }

  // Pied de page
  function fillFoot(key, value, buildNode) {
    var li = $('[data-foot="' + key + '"]');
    var v = text(value);
    if (!li || !v) return;
    li.textContent = ""; li.appendChild(buildNode(v));
  }
  fillFoot("email", contact.email, function (v) { return link("mailto:" + v, v); });
  fillFoot("phone", contact.phone, function (v) { return link(telHref(v), v); });
  fillFoot("address", contact.address, function (v) { return document.createTextNode(v); });

  var socials = $("#footer-socials");
  var socialCount = 0;
  if (socials) {
    Object.keys(cfg.social || {}).forEach(function (name) {
      var url = safeUrl(cfg.social[name]);
      if (!url) return;
      var a = link(url, name); a.target = "_blank"; a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", name + " (s’ouvre dans un nouvel onglet)");
      socials.appendChild(a); socialCount++;
    });
    if (!socialCount) {
      var span = document.createElement("span");
      span.className = "is-missing-text"; span.textContent = "Réseaux sociaux à configurer";
      socials.appendChild(span); missing.push("social.*");
    }
  }

  /* ---------- Formulaire ------------------------------------------------- */
  var form = $("#contact-form");
  var statusBox = $("#form-status");
  var submitBtn = $("#form-submit");
  var formCfg = cfg.form || {};
  var endpoint = safeUrl(formCfg.endpoint);
  var mailTo = text(contact.email);
  var mode = endpoint ? "endpoint" : (mailTo ? "mailto" : "none");

  function showStatus(kind, msg) {
    statusBox.className = "form-status is-visible form-status--" + kind;
    statusBox.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-' +
      (kind === "ok" ? "circle-check" : "circle-alert") + '"/></svg><span></span>';
    $("span", statusBox).textContent = msg;
  }
  function clearStatus() { statusBox.className = "form-status"; statusBox.textContent = ""; }

  if (form) {
    if (mode === "none") {
      submitBtn.disabled = true;
      showStatus("info", "L’envoi en ligne n’est pas encore activé : votre message ne pourrait pas être transmis. Utilisez en attendant les coordonnées ci-contre. (Configuration : js/config.js → form.endpoint ou contact.email)");
      missing.push("form.endpoint ou contact.email (envoi du formulaire désactivé)");
    }

    var fields = {
      nom: { el: $("#f-nom"), err: $("#e-nom"), check: function (v) { return v.length >= 2 ? "" : "Indiquez votre nom complet."; } },
      email: { el: $("#f-email"), err: $("#e-email"), check: function (v) {
        if (!v) return "Indiquez votre adresse e-mail.";
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Cette adresse e-mail semble incomplète (exemple : nom@domaine.com)."; } },
      tel: { el: $("#f-tel"), err: $("#e-tel"), check: function (v) {
        return (!v || /^[+()\d\s.\-]{6,}$/.test(v)) ? "" : "Utilisez uniquement des chiffres, espaces et le signe + (exemple : +243 000 000 000)."; } },
      domaine: { el: $("#f-domaine"), err: $("#e-domaine"), check: function (v) { return v ? "" : "Choisissez le domaine concerné."; } },
      besoin: { el: $("#f-besoin"), err: $("#e-besoin"), check: function (v) { return v.length >= 10 ? "" : "Décrivez votre besoin en quelques mots (10 caractères minimum)."; } }
    };
    function validateField(f) {
      var msg = f.check(f.el.value.trim());
      f.err.textContent = msg;
      if (msg) f.el.setAttribute("aria-invalid", "true"); else f.el.removeAttribute("aria-invalid");
      return !msg;
    }
    Object.keys(fields).forEach(function (k) {
      fields[k].el.addEventListener("blur", function () { if (fields[k].el.value.trim() || fields[k].el.hasAttribute("aria-invalid")) validateField(fields[k]); });
      fields[k].el.addEventListener("input", function () { if (fields[k].el.hasAttribute("aria-invalid")) validateField(fields[k]); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (mode === "none") return;
      clearStatus();

      var firstInvalid = null;
      Object.keys(fields).forEach(function (k) { if (!validateField(fields[k]) && !firstInvalid) firstInvalid = fields[k].el; });
      if (firstInvalid) { firstInvalid.focus(); return; }
      if (form.site_web && form.site_web.value) return; // champ piège anti-spam

      var domaineLabel = fields.domaine.el.options[fields.domaine.el.selectedIndex].text;
      var payload = {
        nom: fields.nom.el.value.trim(),
        email: fields.email.el.value.trim(),
        telephone: fields.tel.el.value.trim() || "Non renseigné",
        domaine: domaineLabel,
        besoin: fields.besoin.el.value.trim()
      };
      var subject = (text(formCfg.subjectPrefix) || "Demande via le site TECHKEEP") + " — " + domaineLabel;

      if (mode === "mailto") {
        var body = "Nom : " + payload.nom + "\nE-mail : " + payload.email + "\nTéléphone : " + payload.telephone +
                   "\nDomaine : " + payload.domaine + "\n\n" + payload.besoin;
        window.location.href = "mailto:" + mailTo + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        showStatus("info", "Votre application de messagerie s’ouvre avec votre message prérempli. Envoyez-le pour finaliser votre demande : rien n’a encore été transmis.");
        return;
      }

      // mode « endpoint » : envoi réel vers le service configuré
      var data = {};
      Object.keys(formCfg.extraFields || {}).forEach(function (k) { data[k] = formCfg.extraFields[k]; });
      data.name = payload.nom; data.email = payload.email; data.phone = payload.telephone;
      data.domain = payload.domaine; data.message = payload.besoin; data.subject = subject; data._subject = subject;
      data.nom = payload.nom; data.telephone = payload.telephone; data.domaine = payload.domaine; data.besoin = payload.besoin;

      submitBtn.disabled = true; form.setAttribute("aria-busy", "true");
      var original = submitBtn.firstChild.textContent;
      submitBtn.firstChild.textContent = "Envoi en cours… ";

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (json) {
          if (res.ok && json.success !== false) {
            form.reset();
            showStatus("ok", "Merci, votre demande a bien été transmise. Nous revenons vers vous rapidement.");
          } else {
            throw new Error((json && (json.message || (json.errors && json.errors[0] && json.errors[0].message) || json.error)) || "Erreur " + res.status);
          }
        });
      }).catch(function () {
        showStatus("err", "Votre message n’a pas pu être envoyé. Vérifiez votre connexion et réessayez, ou utilisez les coordonnées indiquées sur cette page.");
      }).then(function () {
        submitBtn.disabled = false; form.removeAttribute("aria-busy");
        submitBtn.firstChild.textContent = original;
      });
    });
  }

  if (missing.length && window.console && console.info) {
    console.info("[TECHKEEP] Éléments à renseigner dans js/config.js :\n - " + missing.join("\n - "));
  }
})();
