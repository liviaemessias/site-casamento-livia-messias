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
