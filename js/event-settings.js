(function () {
  const defaults = window.WeddingEventConfig?.getDefaults() || {};

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  }

  function formatDate(value) {
    const rawValue = String(value || "");
    const date = new Date(
      /^\d{4}-\d{2}-\d{2}$/.test(rawValue)
        ? `${rawValue}T12:00:00-03:00`
        : rawValue,
    );
    if (Number.isNaN(date.getTime())) return "";
    const parts = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const month = values.month.charAt(0).toUpperCase() + values.month.slice(1);
    return `${values.day} de ${month} de ${values.year}`;
  }

  function formatTime(value) {
    const [hours = "0", minutes = "00"] = String(value || "").split(":");
    return minutes === "00" ? `${Number(hours)}h` : `${Number(hours)}h${minutes}`;
  }

  function formatNumericDate(value) {
    const rawValue = String(value || "");
    const date = new Date(
      /^\d{4}-\d{2}-\d{2}$/.test(rawValue)
        ? `${rawValue}T12:00:00-03:00`
        : rawValue,
    );

    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    })
      .format(date)
      .replaceAll("/", ".");
  }

  function formatMetadataDate(value) {
    const rawValue = String(value || "");
    const date = new Date(
      /^\d{4}-\d{2}-\d{2}$/.test(rawValue)
        ? `${rawValue}T12:00:00-03:00`
        : rawValue,
    );

    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    }).format(date);
  }

  function setMetaContent(selector, value) {
    const element = document.querySelector(selector);
    if (element && value) element.setAttribute("content", String(value));
  }

  function getPublicHttpUrl(value, fallback) {
    try {
      const url = new URL(String(value || fallback || ""), window.location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (error) {
      return "";
    }
  }

  function getSiteDescription(settings) {
    const template =
      settings.site_description_template ||
      defaults.site_description_template ||
      "";

    return String(template)
      .replaceAll("{bride}", settings.bride_name)
      .replaceAll("{groom}", settings.groom_name)
      .replaceAll("{date}", formatMetadataDate(settings.wedding_date));
  }

  function applyHomeMetadata(settings, names) {
    if (document.body.dataset.page !== "home") return;

    const numericDate = formatNumericDate(settings.wedding_date);
    const title = `${names} • ${numericDate}`;
    const description = getSiteDescription(settings);
    const siteUrl = getPublicHttpUrl(settings.site_url, defaults.site_url);
    const socialImage = getPublicHttpUrl(
      settings.social_image,
      defaults.social_image,
    );
    const imageAlt = `${settings.bride_name} e ${settings.groom_name}`;
    const canonical = document.querySelector('link[rel="canonical"]');

    document.title = title;
    if (canonical && siteUrl) canonical.setAttribute("href", String(siteUrl));
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:site_name"]', names);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[property="og:url"]', siteUrl);
    setMetaContent('meta[property="og:image"]', socialImage);
    setMetaContent('meta[property="og:image:alt"]', imageAlt);
    setMetaContent('meta[name="twitter:title"]', title);
    setMetaContent('meta[name="twitter:description"]', description);
    setMetaContent('meta[name="twitter:image"]', socialImage);
  }

  function mapsUrl(name, address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}`)}`;
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function applySettings(settings) {
    const names = `${settings.bride_name} & ${settings.groom_name}`;
    const weddingDate = formatDate(settings.wedding_date);
    const deadline = formatDate(settings.rsvp_deadline);

    window.publicEventSettings = settings;
    applyHomeMetadata(settings, names);
    setText("[data-wedding-names]", names);
    setText("[data-bride-name]", settings.bride_name);
    setText("[data-groom-name]", settings.groom_name);
    setText("[data-wedding-date]", weddingDate);
    setText("[data-rsvp-deadline]", deadline);
    setText("[data-ceremony-name]", settings.ceremony_name);
    setText("[data-ceremony-address]", settings.ceremony_address);
    setText("[data-ceremony-time]", formatTime(settings.ceremony_time));
    setText("[data-reception-name]", settings.reception_name);
    setText("[data-reception-address]", settings.reception_address);
    setText("[data-reception-time]", formatTime(settings.reception_time));

    document.querySelectorAll("[data-wedding-date-location]").forEach((element) => {
      element.textContent = `${weddingDate} • Fortaleza, Ceará`;
    });

    const ceremonyLink = document.getElementById("ceremony");
    const receptionLink = document.getElementById("reception");
    if (ceremonyLink) ceremonyLink.href = mapsUrl(settings.ceremony_name, settings.ceremony_address);
    if (receptionLink) receptionLink.href = mapsUrl(settings.reception_name, settings.reception_address);

    const defaultNamesPattern = new RegExp(
      `${escapeRegExp(defaults.bride_name)}\\s*&\\s*${escapeRegExp(defaults.groom_name)}`,
      "gi",
    );
    document.title = document.title.replace(defaultNamesPattern, names);
    window.dispatchEvent(
      new CustomEvent("wedding-settings-loaded", { detail: settings }),
    );
  }

  async function loadSettings() {
    let settings = defaults;
    try {
      const { data, error } = await supabaseClient
        .rpc("get_public_event_settings")
        .maybeSingle();
      if (!error && data) settings = { ...defaults, ...data };
      if (error) console.error("Não foi possível carregar os dados do casamento.", error);
    } catch (error) {
      console.error("Não foi possível carregar os dados do casamento.", error);
    }
    applySettings(settings);
  }

  window.WeddingEventSettings = { defaults, loadSettings };
  loadSettings();
})();
