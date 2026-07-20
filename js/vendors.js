(function () {
  const vendorsGrid = document.getElementById("vendorsGrid");
  const vendorsEmptyState = document.getElementById("vendorsEmptyState");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  function showToast(message) {
    if (!toast || !toastMessage) {
      return;
    }

    toastMessage.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  function getSafeUrl(value) {
    const rawUrl = String(value || "").trim();

    if (!rawUrl) {
      return "";
    }

    try {
      const url = new URL(rawUrl, window.location.origin);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (error) {
      return "";
    }
  }

  function getWhatsAppUrl(value) {
    const phone = String(value || "").replace(/\D/g, "");

    return phone ? `https://wa.me/${phone}` : "";
  }

  function createVendorIcon(type) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const paths = {
      instagram: [
        "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z",
        "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",
        "M17.5 6.5h.01",
      ],
      site: [
        "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
        "M15 3h6v6",
        "M10 14 21 3",
      ],
      whatsapp: [
        "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
        "M9.5 8.5c.2 2.2 1.8 4 4 4.7",
        "M14.5 13.2c.6.2 1.2.2 1.7-.1",
      ],
    };

    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.classList.add("vendor-link-icon");

    (paths[type] || paths.site).forEach((pathData) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      svg.appendChild(path);
    });

    return svg;
  }

  function createVendorLink(label, href, iconType) {
    if (!href) {
      return null;
    }

    const link = document.createElement("a");

    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", label);
    link.title = label;
    link.appendChild(createVendorIcon(iconType));
    return link;
  }

  function createVendorCard(vendor) {
    const card = document.createElement("article");
    const category = document.createElement("span");
    const title = document.createElement("h2");
    const links = document.createElement("div");

    card.className = `vendor-card${vendor.is_featured ? " featured" : ""}`;

    if (vendor.image_url) {
      const imageUrl = getSafeUrl(vendor.image_url);

      if (imageUrl) {
        const imageWrapper = document.createElement("div");
        const image = document.createElement("img");

        imageWrapper.className = "vendor-image";
        image.src = imageUrl;
        image.alt = vendor.name || "Fornecedor";
        image.loading = "lazy";
        imageWrapper.appendChild(image);
        card.appendChild(imageWrapper);
      }
    }

    category.className = "vendor-category";
    category.textContent = vendor.category || "Fornecedor";

    title.textContent = vendor.name || "Fornecedor";

    card.append(category, title);

    if (vendor.responsible_names) {
      const responsible = document.createElement("p");
      responsible.className = "vendor-responsible";
      responsible.textContent = `Responsáveis: ${vendor.responsible_names}`;
      card.appendChild(responsible);
    }

    if (vendor.description) {
      const description = document.createElement("p");
      description.className = "vendor-description";
      description.textContent = vendor.description;
      card.appendChild(description);
    }

    links.className = "vendor-links";
    [
      createVendorLink("Instagram", getSafeUrl(vendor.instagram_url), "instagram"),
      createVendorLink("Site", getSafeUrl(vendor.website_url), "site"),
      createVendorLink("WhatsApp", getWhatsAppUrl(vendor.whatsapp_number), "whatsapp"),
    ]
      .filter(Boolean)
      .forEach((link) => links.appendChild(link));

    if (links.children.length) {
      card.appendChild(links);
    }

    return card;
  }

  function renderVendors(vendors) {
    if (!vendorsGrid || !vendorsEmptyState) {
      return;
    }

    vendorsGrid.replaceChildren();
    vendorsEmptyState.hidden = vendors.length > 0;

    vendors.forEach((vendor) => {
      vendorsGrid.appendChild(createVendorCard(vendor));
    });
  }

  async function loadVendors() {
    const { data, error } = await supabaseClient.rpc("list_public_vendors");

    if (error) {
      console.error(error);
      renderVendors([]);
      showToast("Não foi possível carregar os fornecedores agora.");
      return;
    }

    renderVendors(data || []);
  }

  window.PublicCommon?.setupNavbar();
  window.PublicCommon?.setupLogout();
  window.GuestAuth?.getGuest?.()
    .then((guest) => {
      if (!guest) {
        return;
      }

      window.currentGuest = guest;
      window.PublicCommon?.showGuestName(guest);
    })
    .catch(console.error);

  loadVendors().catch((error) => {
    console.error(error);
    renderVendors([]);
  });
})();
