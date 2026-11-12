(function initHeroAtmosphere() {
  document.querySelectorAll(".hero-atmosphere").forEach((hero) => {
    if (hero.querySelector(":scope > .hero-atmosphere-mist")) return;

    const mist = document.createElement("div");
    mist.className = "hero-atmosphere-mist";
    mist.setAttribute("aria-hidden", "true");

    const particles = document.createElement("div");
    particles.className = "hero-particles";
    particles.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 18; i += 1) {
      particles.append(document.createElement("span"));
    }

    hero.prepend(particles);
    hero.prepend(mist);
  });
})();
