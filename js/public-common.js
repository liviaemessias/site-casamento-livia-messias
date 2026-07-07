(function () {
  function setupNavbar() {
    const navbar = document.querySelector(".navbar");
    const mobileMenu = document.querySelector(".mobile-menu");
    const navLinks = document.querySelector(".nav-links");

    if (navbar) {
      window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
      });
    }

    if (mobileMenu && navLinks) {
      mobileMenu.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("active");
        mobileMenu.setAttribute("aria-expanded", String(isOpen));
        mobileMenu.setAttribute(
          "aria-label",
          isOpen ? "Fechar menu" : "Abrir menu",
        );
        mobileMenu.textContent = isOpen ? "×" : "☰";
      });
    }
  }

  function setupLogout(buttonId = "logoutButton") {
    const logoutButton = document.getElementById(buttonId);

    if (!logoutButton) {
      return;
    }

    logoutButton.addEventListener("click", async () => {
      logoutButton.disabled = true;
      await GuestAuth.logoutGuest();
      window.location.replace("index.html");
    });
  }

  function showGuestName(guest, elementId = "guestNameDisplay") {
    const guestNameDisplay = document.getElementById(elementId);

    if (guest && guestNameDisplay) {
      const greeting =
        guest.invite_type === "couple" ? "Bem-vindos" : "Bem-vindo(a)";

      guestNameDisplay.textContent = `${greeting}, ${guest.name}`;
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
