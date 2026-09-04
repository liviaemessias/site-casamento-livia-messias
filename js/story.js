const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Mobile Menu
const mobileMenu = document.getElementById("mobileMenu");
const navLinks = document.getElementById("navLinks");
const navDropdowns = Array.from(document.querySelectorAll(".nav-dropdown"));
const navDropdownCloseTimers = new WeakMap();
const desktopNavDropdownQuery = window.matchMedia(
  "(hover: hover) and (pointer: fine)",
);

function clearNavDropdownCloseTimer(dropdown) {
  const timer = navDropdownCloseTimers.get(dropdown);

  if (timer) {
    window.clearTimeout(timer);
    navDropdownCloseTimers.delete(dropdown);
  }
}

function setNavDropdownOpen(dropdown, isOpen) {
  clearNavDropdownCloseTimer(dropdown);
  dropdown.classList.toggle("open", isOpen);
  dropdown
    .querySelector(".nav-dropdown-toggle")
    ?.setAttribute("aria-expanded", String(isOpen));
}

function closeNavDropdowns(exceptDropdown = null) {
  navDropdowns.forEach((dropdown) => {
    if (dropdown === exceptDropdown) {
      return;
    }

    setNavDropdownOpen(dropdown, false);
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
  navLinks.classList.remove("active");
  mobileMenu.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-label", "Abrir menu");
  mobileMenu.textContent = "☰";
}

const navCloseButton = ensureNavCloseButton();

navCloseButton?.addEventListener("click", closeNavigationPanel);

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

navDropdowns.forEach((dropdown) => {
  const toggle = dropdown.querySelector(".nav-dropdown-toggle");
  let isPointerPressingToggle = false;

  if (!toggle) {
    return;
  }

  function openDropdown() {
    setNavDropdownOpen(dropdown, true);
    closeNavDropdowns(dropdown);
  }

  function scheduleDropdownClose() {
    clearNavDropdownCloseTimer(dropdown);
    const timer = window.setTimeout(() => {
      setNavDropdownOpen(dropdown, false);
    }, 180);
    navDropdownCloseTimers.set(dropdown, timer);
  }

  dropdown.addEventListener("mouseenter", () => {
    if (desktopNavDropdownQuery.matches) {
      openDropdown();
    }
  });

  dropdown.addEventListener("mouseleave", () => {
    if (desktopNavDropdownQuery.matches) {
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
    setNavDropdownOpen(dropdown, isOpen);
    closeNavDropdowns(isOpen ? dropdown : null);
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav-dropdown")) {
    closeNavDropdowns();
  }

  if (
    navLinks.classList.contains("active") &&
    !event.target.closest("#navLinks") &&
    !event.target.closest("#mobileMenu")
  ) {
    closeNavigationPanel();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavDropdowns();
    closeNavigationPanel();
  }
});

navLinks.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeNavigationPanel();
  }
});

// Reveal Animation
const reveals = document.querySelectorAll(".reveal");

function revealSections() {
  reveals.forEach((section) => {
    const windowHeight = window.innerHeight;
    const revealTop = section.getBoundingClientRect().top;

    if (revealTop < windowHeight - 100) {
      section.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealSections);

revealSections();
