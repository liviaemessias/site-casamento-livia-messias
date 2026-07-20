(function () {
  const ADMIN_NAV_ICONS = {
    "admin-dashboard.html": "layout-dashboard",
    "admin-gifts.html": "gift",
    "admin-rsvps.html": "clipboard-check",
    "admin-guests.html": "users",
    "admin-messages.html": "message-square",
    "admin-checklist.html": "list-checks",
    "admin-schedule.html": "calendar-days",
    "admin-vendors.html": "handshake",
    "admin-notifications.html": "mail-check",
    "admin-indicators.html": "chart-no-axes-combined",
    "admin-reports.html": "file-chart-column",
    "admin-settings.html": "settings",
  };
  const ADMIN_NAV_ORDER = [
    "admin-dashboard.html",
    "admin-guests.html",
    "admin-rsvps.html",
    "admin-gifts.html",
    "admin-indicators.html",
    "admin-messages.html",
    "admin-checklist.html",
    "admin-schedule.html",
    "admin-vendors.html",
    "admin-notifications.html",
    "admin-reports.html",
    "admin-settings.html",
  ];
  const EVENT_DEFAULTS = window.WeddingEventConfig?.getDefaults() || {};
  let adminCountdownTimer = null;

  function createIcon(name) {
    const icon = document.createElement("i");
    icon.setAttribute("data-lucide", name);
    icon.setAttribute("aria-hidden", "true");
    return icon;
  }

  function createNavAlert(label) {
    const alert = document.createElement("span");

    alert.className = "admin-nav-alert";
    alert.title = label;
    alert.setAttribute("aria-label", label);
    alert.appendChild(createIcon("circle-alert"));

    return alert;
  }

  function setNavAlert(page, label) {
    const link = document.querySelector(`.admin-nav-link[href="./${page}"]`);
    const existingAlert = link?.querySelector(".admin-nav-alert");

    if (!link) {
      return;
    }

    if (existingAlert) {
      existingAlert.remove();
    }

    if (!label) {
      link.removeAttribute("data-has-alert");
      return;
    }

    link.dataset.hasAlert = "true";
    link.appendChild(createNavAlert(label));
  }

  async function updateAdminNavAlerts() {
    if (typeof supabaseClient === "undefined") {
      return;
    }

    try {
      const { data, error } = await supabaseClient
        .rpc("admin_get_nav_alerts")
        .maybeSingle();

      if (error) {
        console.error(error);
        return;
      }

      setNavAlert(
        "admin-messages.html",
        data?.has_pending_wall_messages ? "Há recados pendentes" : "",
      );
      setNavAlert(
        "admin-gifts.html",
        data?.has_reported_gifts
          ? "Há presente ou cota com pagamento informado"
          : "",
      );
      setNavAlert(
        "admin-checklist.html",
        data?.has_overdue_checklist_tasks ? "Há tarefas atrasadas" : "",
      );

      if (window.lucide) {
        window.lucide.createIcons();
      }
    } catch (error) {
      console.error(error);
    }
  }

  function getNameInitial(name, fallback) {
    const firstName = String(name || "")
      .trim()
      .split(/\s+/)
      .find(Boolean);

    return (firstName?.charAt(0) || fallback).toLocaleUpperCase("pt-BR");
  }

  function getCoupleSettings(settings = {}) {
    return {
      brideName: settings.bride_name || EVENT_DEFAULTS.bride_name || "",
      groomName: settings.groom_name || EVENT_DEFAULTS.groom_name || "",
    };
  }

  function getWeddingDate(settings = {}) {
    const date = new Date(settings.wedding_date || EVENT_DEFAULTS.wedding_date);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  function getSaoPauloDateKey(date) {
    const parts = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "America/Sao_Paulo",
      year: "numeric",
    }).formatToParts(date);
    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value]),
    );

    return `${values.year}-${values.month}-${values.day}`;
  }

  function formatDuration(milliseconds) {
    const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    const parts = [];

    if (days) {
      parts.push(`${days} ${days === 1 ? "dia" : "dias"}`);
    }

    if (hours) {
      parts.push(`${hours} ${hours === 1 ? "hora" : "horas"}`);
    }

    if (!days && minutes) {
      parts.push(`${minutes} ${minutes === 1 ? "minuto" : "minutos"}`);
    }

    return parts.slice(0, 2).join(" e ") || "menos de 1 minuto";
  }

  function updateAdminCountdown(settings = window.publicEventSettings) {
    const title = document.querySelector("[data-admin-countdown-title]");
    const value = document.querySelector("[data-admin-countdown-value]");

    if (!title || !value) {
      return;
    }

    const weddingDate = getWeddingDate(settings);
    const now = new Date();
    const todayKey = getSaoPauloDateKey(now);
    const weddingKey = getSaoPauloDateKey(weddingDate);

    if (todayKey === weddingKey) {
      title.textContent = "O grande dia chegou!";
      value.textContent = "Aproveitem cada minuto.";
      return;
    }

    if (todayKey > weddingKey) {
      title.textContent = `Já se passaram ${formatDuration(now - weddingDate)} do grande dia!`;
      value.textContent = "Que a memória siga linda!";
      return;
    }

    title.textContent = "O grande dia!";
    value.textContent = formatDuration(weddingDate - now);
  }

  function updateAdminBrand(settings) {
    const monogram = document.querySelector(".admin-sidebar-monogram");
    const brideInitial = document.querySelector("[data-admin-bride-initial]");
    const groomInitial = document.querySelector("[data-admin-groom-initial]");

    if (!monogram || !brideInitial || !groomInitial) {
      return;
    }

    const { brideName, groomName } = getCoupleSettings(settings);
    brideInitial.textContent = getNameInitial(brideName, "L");
    groomInitial.textContent = getNameInitial(groomName, "M");
    monogram.setAttribute("aria-label", `${brideName} e ${groomName}`);
  }

  async function loadAdminBrandSettings() {
    updateAdminBrand(window.publicEventSettings);

    try {
      const { data, error } = await supabaseClient
        .rpc("get_public_event_settings")
        .maybeSingle();

      if (!error && data) {
        window.publicEventSettings = {
          ...(window.publicEventSettings || {}),
          ...data,
        };
        updateAdminBrand(window.publicEventSettings);
        updateAdminCountdown(window.publicEventSettings);
      }
    } catch (error) {
      console.error("Não foi possível carregar a logo do casal.", error);
    }
  }

  function setupAdminSidebar() {
    const navigation = document.querySelector(".admin-nav");
    const header = document.querySelector(".admin-header");
    const logoutButton = document.getElementById("logoutButton");

    if (!navigation || !header || navigation.dataset.sidebarReady === "true") {
      return;
    }

    navigation.dataset.sidebarReady = "true";
    navigation.id = "adminSidebar";

    const sidebarTop = document.createElement("div");
    const sidebarLinks = document.createElement("div");
    sidebarTop.className = "admin-sidebar-top";
    sidebarLinks.className = "admin-sidebar-links";
    navigation.append(sidebarTop, sidebarLinks);

    const brand = document.createElement("div");
    const monogram = document.createElement("span");
    const monogramL = document.createElement("span");
    const ampersand = document.createElement("span");
    const monogramM = document.createElement("span");
    const brandText = document.createElement("span");
    const brandTitle = document.createElement("strong");
    const brandSubtitle = document.createElement("small");
    const countdown = document.createElement("div");
    const countdownIcon = document.createElement("span");
    const countdownText = document.createElement("span");
    const countdownTitle = document.createElement("strong");
    const countdownValue = document.createElement("span");

    brand.className = "admin-sidebar-brand";
    monogram.className = "admin-sidebar-monogram";
    monogramL.className = "admin-monogram-letter";
    monogramL.dataset.adminBrideInitial = "";
    ampersand.className = "admin-monogram-ampersand";
    ampersand.textContent = "&";
    monogramM.className = "admin-monogram-letter";
    monogramM.dataset.adminGroomInitial = "";
    brandTitle.textContent = "Painel";
    brandSubtitle.textContent = "Administrativo";
    monogram.append(monogramL, ampersand, monogramM);
    brandText.append(brandTitle, brandSubtitle);
    brand.append(monogram, brandText);
    sidebarTop.appendChild(brand);

    countdown.className = "admin-sidebar-countdown";
    countdownIcon.className = "admin-sidebar-countdown-icon";
    countdownIcon.appendChild(createIcon("calendar-heart"));
    countdownText.className = "admin-sidebar-countdown-text";
    countdownTitle.dataset.adminCountdownTitle = "";
    countdownValue.dataset.adminCountdownValue = "";
    countdownText.append(countdownTitle, countdownValue);
    countdown.append(countdownIcon, countdownText);
    sidebarTop.appendChild(countdown);

    [
      ["admin-notifications.html", "Notificações"],
      ["admin-indicators.html", "Indicadores"],
    ["admin-messages.html", "Recados"],
    ["admin-checklist.html", "Checklist"],
    ["admin-schedule.html", "Programação"],
      ["admin-vendors.html", "Fornecedores"],
      ["admin-reports.html", "Relatórios"],
    ].forEach(([page, label]) => {
      if (navigation.querySelector(`[href="./${page}"]`)) {
        return;
      }

      const link = document.createElement("a");
      link.className = "admin-nav-link";
      link.href = `./${page}`;
      link.textContent = label;

      if (window.location.pathname.endsWith(page)) {
        link.classList.add("active");
      }

      sidebarLinks.appendChild(link);
    });

    const links = navigation.querySelectorAll(".admin-nav-link");
    const linksByPage = new Map(
      Array.from(links).map((link) => [
        link.getAttribute("href")?.split("/").pop(),
        link,
      ]),
    );

    ADMIN_NAV_ORDER.forEach((page) => {
      const link = linksByPage.get(page);

      if (link) {
        sidebarLinks.appendChild(link);
      }
    });

    links.forEach((link) => {
      const page = link.getAttribute("href")?.split("/").pop();
      const iconName = ADMIN_NAV_ICONS[page];

      if (iconName) {
        link.prepend(createIcon(iconName));
      }

      link.addEventListener("click", () => {
        document.body.classList.remove("admin-sidebar-open");
      });
    });

    const footer = document.createElement("div");
    footer.className = "admin-sidebar-footer";

    const siteLink = document.createElement("a");
    siteLink.className = "admin-sidebar-utility";
    siteLink.href = "./index.html";
    siteLink.target = "_blank";
    siteLink.rel = "noopener noreferrer";
    siteLink.append(createIcon("external-link"), "Ver Site");
    footer.appendChild(siteLink);

    if (logoutButton) {
      logoutButton.className = "admin-sidebar-utility admin-logout";
      logoutButton.textContent = "";
      logoutButton.append(createIcon("log-out"), "Sair");
      footer.appendChild(logoutButton);
    }

    navigation.appendChild(footer);

    const menuButton = document.createElement("button");
    menuButton.type = "button";
    menuButton.className = "admin-menu-toggle";
    menuButton.setAttribute("aria-controls", "adminSidebar");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu administrativo");
    menuButton.appendChild(createIcon("menu"));
    header.prepend(menuButton);

    const backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "admin-sidebar-backdrop";
    backdrop.setAttribute("aria-label", "Fechar menu administrativo");
    document.body.appendChild(backdrop);

    function setSidebarOpen(isOpen) {
      document.body.classList.toggle("admin-sidebar-open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Fechar menu administrativo" : "Abrir menu administrativo",
      );
    }

    menuButton.addEventListener("click", () => {
      setSidebarOpen(!document.body.classList.contains("admin-sidebar-open"));
    });
    backdrop.addEventListener("click", () => setSidebarOpen(false));

    if (window.lucide) {
      window.lucide.createIcons();
    }

    updateAdminBrand();
    updateAdminCountdown();
    updateAdminNavAlerts();
    loadAdminBrandSettings();

    if (!adminCountdownTimer) {
      adminCountdownTimer = window.setInterval(() => {
        updateAdminCountdown();
      }, 60000);
    }
  }

  function setupModalScrollLock() {
    function updateModalState() {
      document.body.classList.toggle(
        "admin-modal-open",
        Boolean(document.querySelector(".admin-modal.active")),
      );
    }

    const observer = new MutationObserver(updateModalState);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
    updateModalState();
  }

  function setupLogout(buttonId = "logoutButton") {
    const logoutButton = document.getElementById(buttonId);

    if (!logoutButton) {
      return;
    }

    logoutButton.addEventListener("click", async () => {
      logoutButton.disabled = true;

      await supabaseClient.auth.signOut();
      window.location.replace("./index.html");
    });
  }

  function showToast(message, toastId = "adminToast") {
    const adminToast = document.getElementById(toastId);

    if (!adminToast) {
      return;
    }

    adminToast.textContent = message;
    adminToast.classList.add("show");

    setTimeout(() => {
      adminToast.classList.remove("show");
    }, 3500);
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString("pt-BR");
  }

  function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = value;
    }
  }

  window.AdminCommon = {
    formatDate,
    setText,
    setupLogout,
    showToast,
    updateAdminBrand,
    updateAdminCountdown,
  };

  window.addEventListener("wedding-settings-loaded", (event) => {
    updateAdminBrand(event.detail);
    updateAdminCountdown(event.detail);
  });

  setupAdminSidebar();
  setupModalScrollLock();
})();
