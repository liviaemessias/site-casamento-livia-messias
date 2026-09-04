(function () {
  function setupNavbar() {
    const navbar = document.querySelector(".navbar");
    const mobileMenu = document.querySelector(".mobile-menu");
    const navLinks = document.querySelector(".nav-links");
    const dropdowns = Array.from(document.querySelectorAll(".nav-dropdown"));
    const dropdownCloseTimers = new WeakMap();
    const desktopDropdownQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );

    if (navbar?.dataset.navbarInitialized === "true") {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
      return;
    }

    if (navbar) {
      navbar.dataset.navbarInitialized = "true";
    }

    function clearDropdownCloseTimer(dropdown) {
      const timer = dropdownCloseTimers.get(dropdown);

      if (timer) {
        window.clearTimeout(timer);
        dropdownCloseTimers.delete(dropdown);
      }
    }

    function setDropdownOpen(dropdown, isOpen) {
      clearDropdownCloseTimer(dropdown);
      dropdown.classList.toggle("open", isOpen);
      dropdown
        .querySelector(".nav-dropdown-toggle")
        ?.setAttribute("aria-expanded", String(isOpen));
    }

    function closeDropdowns(exceptDropdown = null) {
      dropdowns.forEach((dropdown) => {
        if (dropdown === exceptDropdown) {
          return;
        }

        setDropdownOpen(dropdown, false);
      });
    }

    function ensureNavCloseButton() {
      if (!navLinks || navLinks.querySelector(".public-nav-close")) {
        return null;
      }

      const item = document.createElement("li");
      const button = document.createElement("button");

      item.className = "public-nav-close-item";
      button.type = "button";
      button.className = "public-nav-close";
      button.setAttribute("aria-label", "Fechar menu");
      button.textContent = "×";
      item.appendChild(button);
      navLinks.prepend(item);

      return button;
    }

    function closeNavigationPanel() {
      navLinks?.classList.remove("active", "hero-shortcut-open");
      mobileMenu?.setAttribute("aria-expanded", "false");
      mobileMenu?.setAttribute("aria-label", "Abrir menu");

      if (mobileMenu) {
        mobileMenu.textContent = "☰";
      }
    }

    const navCloseButton = ensureNavCloseButton();

    navCloseButton?.addEventListener("click", closeNavigationPanel);

    if (navbar) {
      const updateNavbarScrollState = () => {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
      };

      updateNavbarScrollState();
      window.addEventListener("scroll", updateNavbarScrollState, {
        passive: true,
      });
    }

    if (mobileMenu && navLinks) {
      mobileMenu.addEventListener("click", () => {
        const shouldOpen = !navLinks.classList.contains("active");
        closeNavigationPanel();

        if (shouldOpen) {
          navLinks.classList.add("active");
          mobileMenu.setAttribute("aria-expanded", "true");
          mobileMenu.setAttribute("aria-label", "Fechar menu");
          mobileMenu.textContent = "×";
        }
      });
    }

    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector(".nav-dropdown-toggle");
      let isPointerPressingToggle = false;

      if (!toggle) {
        return;
      }

      function openDropdown() {
        setDropdownOpen(dropdown, true);
        closeDropdowns(dropdown);
      }

      function scheduleDropdownClose() {
        clearDropdownCloseTimer(dropdown);
        const timer = window.setTimeout(() => {
          setDropdownOpen(dropdown, false);
        }, 180);
        dropdownCloseTimers.set(dropdown, timer);
      }

      dropdown.addEventListener("mouseenter", () => {
        if (desktopDropdownQuery.matches) {
          openDropdown();
        }
      });

      dropdown.addEventListener("mouseleave", () => {
        if (desktopDropdownQuery.matches) {
          scheduleDropdownClose();
        }
      });

      toggle.addEventListener("pointerdown", () => {
        isPointerPressingToggle = true;
        window.setTimeout(() => {
          isPointerPressingToggle = false;
        }, 0);
      });

      dropdown.addEventListener("focusin", () => {
        if (!isPointerPressingToggle) {
          openDropdown();
        }
      });

      dropdown.addEventListener("focusout", (event) => {
        if (!dropdown.contains(event.relatedTarget)) {
          scheduleDropdownClose();
        }
      });

      toggle.addEventListener("click", () => {
        const isOpen = !dropdown.classList.contains("open");
        setDropdownOpen(dropdown, isOpen);
        closeDropdowns(isOpen ? dropdown : null);
      });
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".nav-dropdown")) {
        closeDropdowns();
      }

      if (
        navLinks?.classList.contains("active") &&
        !event.target.closest(".nav-links") &&
        !event.target.closest(".mobile-menu")
      ) {
        closeNavigationPanel();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeDropdowns();
        closeNavigationPanel();
      }
    });

    navLinks?.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        closeNavigationPanel();
      }
    });
  }

  function setupLogout(buttonId = "logoutButton") {
    const logoutButton = document.getElementById(buttonId);

    if (!logoutButton) {
      return;
    }

    if (logoutButton.dataset.logoutInitialized === "true") {
      return;
    }

    logoutButton.dataset.logoutInitialized = "true";

    logoutButton.addEventListener("click", async () => {
      logoutButton.disabled = true;
      await GuestAuth.logoutGuest();
      window.location.replace("index.html");
    });
  }

  function showGuestName(guest, elementId = "guestNameDisplay") {
    const guestNameDisplay = document.getElementById(elementId);

    if (guest && guestNameDisplay) {
      guestNameDisplay.textContent = `Olá, ${guest.name}!`;
    }
  }

  function setupModalScrollLock() {
    function updateModalState() {
      document.body.classList.toggle(
        "public-modal-open",
        Boolean(document.querySelector(".modal.active")),
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

  window.PublicCommon = {
    setupLogout,
    setupNavbar,
    showGuestName,
  };

  setupModalScrollLock();
})();
