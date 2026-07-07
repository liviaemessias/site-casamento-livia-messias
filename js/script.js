// Navbar Scroll Effect
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

mobileMenu.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("active");
  mobileMenu.setAttribute("aria-expanded", String(isOpen));
  mobileMenu.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  mobileMenu.textContent = isOpen ? "×" : "☰";
});

// Countdown
const eventDefaults = window.WeddingEventConfig?.getDefaults() || {};
let weddingDate = new Date(
  window.publicEventSettings?.wedding_date || eventDefaults.wedding_date,
);

window.addEventListener("wedding-settings-loaded", (event) => {
  const configuredDate = new Date(event.detail?.wedding_date);
  if (!Number.isNaN(configuredDate.getTime())) {
    weddingDate = configuredDate;
    updateCountdown();
  }
});

function updateCountdown() {
  const now = new Date();
  const difference = Math.max(0, weddingDate - now);

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  document.getElementById("days").innerText = days;
  document.getElementById("hours").innerText = hours;
  document.getElementById("minutes").innerText = minutes;
  document.getElementById("seconds").innerText = seconds;
}

setInterval(updateCountdown, 1000);
updateCountdown();

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
