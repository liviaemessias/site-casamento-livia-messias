(function () {
  const BRAND_COLOR = "#5b1166";
  const ADMIN_NAV_ICONS = {
    "admin-dashboard.html": "layout-dashboard",
    "admin-gifts.html": "gift",
    "admin-rsvps.html": "clipboard-check",
    "admin-guests.html": "users",
    "admin-messages.html": "message-square",
    "admin-checklist.html": "list-checks",
    "admin-financial.html": "wallet",
    "admin-financial-budget.html": "wallet",
    "admin-financial-base.html": "wallet",
    "admin-financial-expenses.html": "wallet",
    "admin-financial-payments.html": "wallet",
    "admin-schedule.html": "calendar-days",
    "admin-tables.html": "layout-grid",
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
    "admin-tables.html",
    "admin-vendors.html",
    "admin-financial.html",
    "admin-financial-budget.html",
    "admin-financial-expenses.html",
    "admin-financial-payments.html",
    "admin-financial-base.html",
    "admin-notifications.html",
    "admin-reports.html",
    "admin-settings.html",
  ];
  const ADMIN_NAV_GROUPS = [
    ["Principal", "admin-dashboard.html"],
    ["Casamento", "admin-guests.html"],
    ["Financeiro", "admin-financial.html"],
    ["Sistema", "admin-notifications.html"],
  ];
  const ADMIN_MOBILE_NAV_ITEMS = [
    ["admin-dashboard.html", "Início", "layout-dashboard"],
    ["admin-guests.html", "Convidados", "users"],
    ["admin-rsvps.html", "RSVP", "clipboard-check"],
    ["admin-financial.html", "Financeiro", "wallet"],
  ];
  const ADMIN_PAGE_DESCRIPTIONS = {
    "admin-dashboard.html": "Visão geral dos principais pontos do casamento em um só lugar.",
    "admin-guests.html": "Organize convites, grupos, acompanhantes e dados dos convidados.",
    "admin-rsvps.html": "Acompanhe confirmações de presença, restrições e respostas dos convites.",
    "admin-gifts.html": "Gerencie presentes, cotas, reservas e confirmações de pagamento.",
    "admin-indicators.html": "Consulte métricas consolidadas para apoiar as decisões do casamento.",
    "admin-messages.html": "Aprove, responda e acompanhe os recados enviados pelos convidados.",
    "admin-checklist.html": "Planeje etapas, responsáveis e pendências da organização.",
    "admin-schedule.html": "Configure a programação do dia e as atividades exibidas no site.",
    "admin-tables.html": "Monte o mapa de mesas e distribua convidados para a recepção.",
    "admin-vendors.html": "Cadastre fornecedores e defina o que aparece no site público.",
    "admin-financial.html": "Acompanhe orçamento, gastos, parcelas e vencimentos do casamento.",
    "admin-financial-budget.html": "Controle itens previstos, cenários e saldos do orçamento.",
    "admin-financial-expenses.html": "Registre gastos reais, vínculos com o orçamento e pagamentos.",
    "admin-financial-payments.html": "Acompanhe parcelas, vencimentos, atrasos e pagamentos realizados.",
    "admin-financial-base.html": "Gerencie cenários, categorias e pagadores usados no financeiro.",
    "admin-notifications.html": "Audite envios de e-mail, falhas e notificações do sistema.",
    "admin-reports.html": "Exporte relatórios consolidados em CSV, XLSX e PDF.",
    "admin-settings.html": "Ajuste configurações gerais, textos, datas e notificações do site.",
  };
  const EVENT_DEFAULTS = window.WeddingEventConfig?.getDefaults() || {};
  const FINANCIAL_NAV_ITEMS = [
    ["admin-financial.html", "Visão Geral"],
    ["admin-financial-budget.html", "Orçamento Previsto"],
    ["admin-financial-expenses.html", "Gastos Reais"],
    ["admin-financial-payments.html", "Parcelas"],
    ["admin-financial-base.html", "Cadastros Base"],
  ];
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
    const links = document.querySelectorAll(
      `.admin-nav-link[href="./${page}"], .admin-nav-sublink[href="./${page}"], .admin-mobile-nav-link[href="./${page}"]`,
    );

    if (!links.length) {
      return;
    }

    links.forEach((link) => {
      const existingAlert = link.querySelector(".admin-nav-alert");

      if (existingAlert) {
        existingAlert.remove();
      }

      if (!label) {
        link.removeAttribute("data-has-alert");
        return;
      }

      link.dataset.hasAlert = "true";
      link.appendChild(createNavAlert(label));
    });
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
      setNavAlert(
        "admin-financial.html",
        data?.has_due_financial_payments
          ? "Há parcelas financeiras vencidas ou vencendo hoje"
          : "",
      );
      setNavAlert(
        "admin-financial-payments.html",
        data?.has_due_financial_payments ? "Há parcelas vencidas ou vencendo hoje" : "",
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
    const brandMark = document.querySelector(".admin-sidebar-brand-mark");
    const brandLogo = document.querySelector(".admin-sidebar-brand-logo");
    const brandFallback = document.querySelector("[data-admin-brand-fallback]");

    if (!brandMark || !brandLogo || !brandFallback) {
      return;
    }

    const { brideName, groomName } = getCoupleSettings(settings);
    const coupleLabel = `${brideName} e ${groomName}`;

    brandLogo.alt = coupleLabel;
    brandMark.setAttribute("aria-label", coupleLabel);
    brandFallback.textContent = `${getNameInitial(brideName, "L")}&${getNameInitial(
      groomName,
      "M",
    )}`;
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

  function focusAdminNavItem(item, container, options = {}) {
    if (!item || !container) {
      return;
    }

    const { inline = false } = options;
    const itemRect = item.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (!itemRect.width || !itemRect.height || !containerRect.width || !containerRect.height) {
      return;
    }

    if (inline && container.scrollWidth > container.clientWidth) {
      const targetLeft =
        container.scrollLeft +
        itemRect.left -
        containerRect.left -
        container.clientWidth / 2 +
        itemRect.width / 2;
      const maxScrollLeft = Math.max(container.scrollWidth - container.clientWidth, 0);

      container.scrollTo({
        left: Math.min(Math.max(targetLeft, 0), maxScrollLeft),
        behavior: "auto",
      });
    }

    if (container.scrollHeight <= container.clientHeight) {
      return;
    }

    const targetTop =
      container.scrollTop +
      itemRect.top -
      containerRect.top -
      container.clientHeight / 2 +
      itemRect.height / 2;
    const maxScrollTop = Math.max(container.scrollHeight - container.clientHeight, 0);

    container.scrollTo({
      top: Math.min(Math.max(targetTop, 0), maxScrollTop),
      behavior: "auto",
    });
  }

  function focusActiveAdminSidebarItem(sidebarLinks) {
    const activeNavigationItem =
      sidebarLinks?.querySelector(".admin-nav-sublink.active") ||
      sidebarLinks?.querySelector(".admin-nav-link.active");

    if (!activeNavigationItem || !sidebarLinks) {
      return;
    }

    window.requestAnimationFrame(() => {
      focusAdminNavItem(activeNavigationItem, sidebarLinks);
    });
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
    setupAdminHeaderDescription(header);

    const sidebarTop = document.createElement("div");
    const sidebarLinks = document.createElement("div");
    sidebarTop.className = "admin-sidebar-top";
    sidebarLinks.className = "admin-sidebar-links";
    navigation.append(sidebarTop, sidebarLinks);

    const brand = document.createElement("div");
    const brandMark = document.createElement("span");
    const brandLogo = document.createElement("img");
    const brandFallback = document.createElement("span");
    const brandText = document.createElement("span");
    const brandTitle = document.createElement("strong");
    const brandSubtitle = document.createElement("small");
    const countdown = document.createElement("div");
    const countdownIcon = document.createElement("span");
    const countdownText = document.createElement("span");
    const countdownTitle = document.createElement("strong");
    const countdownValue = document.createElement("span");

    brand.className = "admin-sidebar-brand";
    brandMark.className = "admin-sidebar-brand-mark";
    brandLogo.className = "admin-sidebar-brand-logo";
    brandLogo.src = "./assets/images/brand/couple-logo-primary.svg";
    brandLogo.alt = "Livia e Messias";
    brandLogo.decoding = "async";
    brandFallback.className = "admin-sidebar-brand-fallback";
    brandFallback.dataset.adminBrandFallback = "";
    brandFallback.textContent = "L&M";
    brandTitle.textContent = "Painel";
    brandSubtitle.textContent = "Administrativo";
    brandLogo.addEventListener("error", () => {
      brandMark.classList.add("has-logo-error");
    });
    brandMark.append(brandLogo, brandFallback);
    brandText.append(brandTitle, brandSubtitle);
    brand.append(brandMark, brandText);
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
      ["admin-financial.html", "Financeiro"],
      ["admin-schedule.html", "Programação"],
      ["admin-tables.html", "Mesas"],
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

      if (
        window.location.pathname.endsWith(page) ||
        (page === "admin-financial.html" &&
          FINANCIAL_NAV_ITEMS.some(([itemPage]) =>
            window.location.pathname.endsWith(itemPage),
          ))
      ) {
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

    const financialLink = linksByPage.get("admin-financial.html");

    if (financialLink && !navigation.querySelector(".admin-nav-submenu")) {
      const submenu = document.createElement("div");
      submenu.className = "admin-nav-submenu";
      submenu.setAttribute("aria-label", "Submenu do Financeiro");

      FINANCIAL_NAV_ITEMS.forEach(([page, label]) => {
        const sublink = document.createElement("a");

        sublink.className = "admin-nav-sublink";
        sublink.href = `./${page}`;
        sublink.textContent = label;

        if (window.location.pathname.endsWith(page)) {
          sublink.classList.add("active");
        }

        sublink.addEventListener("click", () => {
          document.body.classList.remove("admin-sidebar-open");
        });
        submenu.appendChild(sublink);
      });

      financialLink.insertAdjacentElement("afterend", submenu);
    }

    ADMIN_NAV_GROUPS.forEach(([label, page]) => {
      const link = linksByPage.get(page);

      if (!link || link.previousElementSibling?.classList.contains("admin-nav-group")) {
        return;
      }

      const group = document.createElement("span");
      group.className = "admin-nav-group";
      group.textContent = label;
      link.insertAdjacentElement("beforebegin", group);
    });

    focusActiveAdminSidebarItem(sidebarLinks);

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

    const currentPage = window.location.pathname.split("/").pop() || "admin-dashboard.html";
    const activeLabelSource =
      sidebarLinks.querySelector(".admin-nav-sublink.active") ||
      sidebarLinks.querySelector(".admin-nav-link.active");
    const activePageTitle = (activeLabelSource?.textContent || "Painel").trim();

    const mobileTopbar = document.createElement("div");
    const mobileTopbarTitle = document.createElement("span");
    const mobileTopbarSubtitle = document.createElement("small");
    const mobileTopbarAction = document.createElement("button");
    mobileTopbar.className = "admin-mobile-topbar";
    mobileTopbarTitle.textContent = activePageTitle;
    mobileTopbarSubtitle.textContent = "Painel Administrativo";
    mobileTopbarAction.type = "button";
    mobileTopbarAction.className = "admin-mobile-topbar-action";
    mobileTopbarAction.setAttribute("aria-label", "Abrir menu administrativo");
    mobileTopbarAction.appendChild(createIcon("menu"));
    mobileTopbar.append(mobileTopbarAction, mobileTopbarTitle, mobileTopbarSubtitle);
    document.body.appendChild(mobileTopbar);

    const mobileBottomNav = document.createElement("nav");
    const mobileMoreButton = document.createElement("button");
    mobileBottomNav.className = "admin-mobile-bottom-nav";
    mobileBottomNav.setAttribute("aria-label", "Navegação administrativa principal");

    ADMIN_MOBILE_NAV_ITEMS.forEach(([page, label, iconName]) => {
      const link = document.createElement("a");
      const isFinancialItem =
        page === "admin-financial.html" &&
        FINANCIAL_NAV_ITEMS.some(([itemPage]) => itemPage === currentPage);

      link.className = "admin-mobile-nav-link";
      link.href = `./${page}`;
      link.append(createIcon(iconName), document.createTextNode(label));

      if (currentPage === page || isFinancialItem) {
        link.classList.add("active");
      }

      mobileBottomNav.appendChild(link);
    });

    mobileMoreButton.type = "button";
    mobileMoreButton.className = "admin-mobile-nav-link admin-mobile-more-button";
    mobileMoreButton.append(createIcon("ellipsis"), document.createTextNode("Mais"));
    mobileMoreButton.setAttribute("aria-controls", "adminSidebar");
    mobileMoreButton.setAttribute("aria-expanded", "false");
    mobileMoreButton.setAttribute("aria-label", "Abrir menu completo");

    if (
      !ADMIN_MOBILE_NAV_ITEMS.some(([page]) => page === currentPage) &&
      !FINANCIAL_NAV_ITEMS.some(([page]) => page === currentPage)
    ) {
      mobileMoreButton.classList.add("active");
    }

    mobileBottomNav.appendChild(mobileMoreButton);
    document.body.appendChild(mobileBottomNav);

    function setMobileBarsHidden(isHidden) {
      if (document.body.classList.contains("admin-sidebar-open")) {
        return;
      }

      mobileTopbar.classList.toggle("is-hidden", isHidden);
    }

    let lastScrollY = window.scrollY;
    let scrollTicking = false;

    function updateMobileTopbarOnScroll() {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      if (currentScrollY < 24 || delta < -8) {
        setMobileBarsHidden(false);
      } else if (delta > 10) {
        setMobileBarsHidden(true);
      }

      lastScrollY = currentScrollY;
      scrollTicking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!scrollTicking) {
          window.requestAnimationFrame(updateMobileTopbarOnScroll);
          scrollTicking = true;
        }
      },
      { passive: true },
    );

    function setAdminMenuOpen(isOpen) {
      setSidebarOpen(isOpen);
      mobileMoreButton.setAttribute("aria-expanded", String(isOpen));

      if (isOpen) {
        focusActiveAdminSidebarItem(sidebarLinks);
      }
    }

    menuButton.addEventListener("click", () => {
      setAdminMenuOpen(!document.body.classList.contains("admin-sidebar-open"));
    });
    mobileTopbarAction.addEventListener("click", () => {
      setAdminMenuOpen(!document.body.classList.contains("admin-sidebar-open"));
    });
    mobileMoreButton.addEventListener("click", () => {
      const isOpen = !document.body.classList.contains("admin-sidebar-open");
      setAdminMenuOpen(isOpen);
    });
    backdrop.addEventListener("click", () => setAdminMenuOpen(false));

    if (window.lucide) {
      window.lucide.createIcons();
    }

    window.requestAnimationFrame(() => {
      const activeMobileItem =
        mobileBottomNav.querySelector(".admin-mobile-nav-link.active") ||
        mobileMoreButton;

      focusAdminNavItem(activeMobileItem, mobileBottomNav, { inline: true });
    });

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

  function setupAdminHeaderDescription(header) {
    const headerContent = header?.querySelector("div");

    if (!headerContent || headerContent.querySelector(".admin-header-description")) {
      return;
    }

    const currentPage = window.location.pathname.split("/").pop() || "admin-dashboard.html";
    const descriptionText = ADMIN_PAGE_DESCRIPTIONS[currentPage];

    if (!descriptionText) {
      return;
    }

    const description = document.createElement("p");
    description.className = "admin-header-description";
    description.textContent = descriptionText;
    headerContent.appendChild(description);
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
    BRAND_COLOR,
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
