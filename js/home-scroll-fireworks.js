(function initHomeScrollFireworks() {
  if (document.body?.dataset.page !== "home") return;
  if (!("IntersectionObserver" in window)) return;

  const sections = Array.from(document.querySelectorAll(
    "#welcome, #countdown, .event-section, .rsvp-cta, .gifts-cta, .home-info-cta, .home-photos-section, .home-messages-section"
  ));
  if (!sections.length) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const layer = document.createElement("div");
  layer.className = `scroll-fireworks-layer${reduceMotion ? " scroll-fireworks-layer--still" : ""}`;
  layer.setAttribute("aria-hidden", "true");
  document.body.append(layer);

  let nextSide = 0;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      const firstSide = nextSide++ % 2 ? "right" : "left";
      const sides = [firstSide, firstSide === "left" ? "right" : "left", "center"];
      const verticalPositions = ["top", "middle", "bottom"];

      sides.forEach((side, index) => {
        const burst = document.createElement("div");
        burst.className = `scroll-firework scroll-firework--${verticalPositions[index]} scroll-firework--${side} scroll-firework--delay-${index}`;
        for (let i = 0; i < 14; i += 1) {
          burst.append(document.createElement("span"));
        }
        layer.append(burst);
        burst.addEventListener("animationend", () => burst.remove(), { once: true });
        window.setTimeout(() => burst.remove(), 4000);
      });
    });
  }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });

  sections.forEach((section) => observer.observe(section));
})();
