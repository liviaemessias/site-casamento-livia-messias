(function () {
  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHTML(value).replaceAll("`", "&#096;");
  }

  function safeText(value, fallback = "-") {
    const text = String(value ?? "").trim();
    return escapeHTML(text || fallback);
  }

  function getSafeUrl(value, options = {}) {
    const { allowRelative = true, protocols = ["http:", "https:"] } = options;
    const rawUrl = String(value ?? "").trim();

    if (!rawUrl) {
      return "";
    }

    try {
      const url = new URL(rawUrl, window.location.origin);
      const isRelative = !/^[a-z][a-z\d+\-.]*:/i.test(rawUrl);

      if (isRelative && allowRelative) {
        return rawUrl;
      }

      return protocols.includes(url.protocol) ? url.href : "";
    } catch (error) {
      return "";
    }
  }

  function createSafeFragment(html, contextElement = null) {
    const contextTag = contextElement?.tagName?.toLowerCase();
    const isTableBody = contextTag === "tbody";
    const source = isTableBody
      ? `<table><tbody data-safe-content-root>${String(html ?? "")}</tbody></table>`
      : String(html ?? "");
    const parsedDocument = new DOMParser().parseFromString(
      source,
      "text/html",
    );
    const contentRoot = isTableBody
      ? parsedDocument.querySelector("[data-safe-content-root]")
      : parsedDocument.body;
    const blockedElements = contentRoot.querySelectorAll(
      "script, style, iframe, object, embed, link, meta, base",
    );

    blockedElements.forEach((element) => element.remove());

    contentRoot.querySelectorAll("*").forEach((element) => {
      [...element.attributes].forEach((attribute) => {
        const name = attribute.name.toLowerCase();

        if (name.startsWith("on") || name === "style" || name === "srcdoc") {
          element.removeAttribute(attribute.name);
          return;
        }

        if (["href", "src", "xlink:href", "action", "formaction"].includes(name)) {
          const safeUrl = getSafeUrl(attribute.value);

          if (safeUrl) {
            element.setAttribute(attribute.name, safeUrl);
          } else {
            element.removeAttribute(attribute.name);
          }
        }
      });
    });

    const fragment = document.createDocumentFragment();
    [...contentRoot.childNodes].forEach((node) => {
      fragment.appendChild(document.importNode(node, true));
    });
    return fragment;
  }

  function replaceSafeContent(element, html) {
    element.replaceChildren(createSafeFragment(html, element));
  }

  window.SecurityUtils = {
    escapeAttribute,
    escapeHTML,
    getSafeUrl,
    createSafeFragment,
    replaceSafeContent,
    safeText,
  };
})();
