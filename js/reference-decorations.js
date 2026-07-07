(function () {
  const references = [
    "beatles.png",
    "bacurinha.png",
    "controle-n64.png",
    "dinossauro.png",    
    "flamengo.png",
    "friends.png",
    "harry-potter.png",
    "homem-aranha.png",
    "impala-supernatural.png",
    "musica.png",
    "nossa-senhora-de-fatima.png",
    "panda.png",
    "sagrada-familia.png",
    "tbbt.png",
    "the-office.png",
    "terco.png"
  ];

  const isAdminLogin = document.body.classList.contains("admin-login-page");
  const usesReferenceRails = document.body.classList.contains(
    "site-reference-rails",
  );

  if (usesReferenceRails) {
    if (window.matchMedia("(max-width: 1439px)").matches) {
      renderMobileReferenceAccent();
    } else {
      renderReferenceRails();
    }

    return;
  }

  const count = isAdminLogin ? 14 : 16;
  const layer = document.createElement("div");

  layer.className = "login-watermark-layer";
  layer.setAttribute("aria-hidden", "true");

  const shuffledReferences = [...references].sort(() => Math.random() - 0.5);
  const pickedReferences = Array.from({ length: count }, (_, index) => {
    return shuffledReferences[index % shuffledReferences.length];
  });
  pickedReferences.forEach((name, index) => {
    const image = document.createElement("img");

    image.src = getReferencePath(name);
    image.alt = "";
    image.className = "login-watermark";

    layer.appendChild(image);
  });

  document.body.prepend(layer);

  function getReferencePath(name) {
    const fileName = /\.(?:png|svg)$/i.test(name) ? name : `${name}.svg`;

    return `assets/images/login-references/${fileName}`;
  }

  function renderReferenceRails() {
    const layer = document.createElement("div");
    const leftRail = document.createElement("div");
    const rightRail = document.createElement("div");
    const perSide = 5;
    const railReferences = [...references].sort(() => Math.random() - 0.5);

    layer.className = "reference-rail-layer";
    layer.setAttribute("aria-hidden", "true");
    leftRail.className = "reference-rail-side left";
    rightRail.className = "reference-rail-side right";

    [leftRail, rightRail].forEach((rail, railIndex) => {
      Array.from({ length: perSide }).forEach((_, index) => {
        const image = document.createElement("img");
        const referenceIndex = railIndex * perSide + index;
        const name = railReferences[referenceIndex % railReferences.length];

        image.src = getReferencePath(name);
        image.alt = "";
        image.className = "reference-rail";

        rail.appendChild(image);
      });
    });

    layer.append(leftRail, rightRail);
    document.body.prepend(layer);
  }

  function renderMobileReferenceAccent() {
    const sections = getMobileAccentSections();
    const footer = document.querySelector(".footer, footer");
    const script = document.currentScript;

    sections.forEach((section, index) => {
      section.insertAdjacentElement(
        "afterend",
        createMobileReferenceAccent(index),
      );
    });

    const hasFooterAccent = sections.some(
      (section) => section.nextElementSibling === footer,
    );

    if (footer?.parentNode && !hasFooterAccent) {
      footer.parentNode.insertBefore(
        createMobileReferenceAccent(sections.length),
        footer,
      );
      return;
    }

    if (!footer) {
      document.body.insertBefore(
        createMobileReferenceAccent(sections.length),
        script || null,
      );
    }
  }

  function createMobileReferenceAccent(groupIndex) {
    const accent = document.createElement("div");
    const selectedReferences = [...references]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    accent.className = "mobile-reference-accent";
    accent.setAttribute("aria-hidden", "true");

    selectedReferences.forEach((name, index) => {
      const image = document.createElement("img");

      image.src = getReferencePath(name);
      image.alt = "";
      image.className = `reference-accent-${(groupIndex + index) % 6}`;

      accent.appendChild(image);
    });

    return accent;
  }

  function getMobileAccentSections() {
    if (document.querySelector(".countdown-section")) {
      return [".countdown-section", ".welcome-section", ".event-section"]
        .map((selector) => document.querySelector(selector))
        .filter(Boolean);
    }

    if (document.querySelector(".timeline-section")) {
      return [".timeline-section", ".final-section"]
        .map((selector) => document.querySelector(selector))
        .filter(Boolean);
    }

    return [];
  }
})();
