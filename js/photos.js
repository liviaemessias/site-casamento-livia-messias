(function () {
  const gallery = document.getElementById("photoGallery");
  const lightbox = document.getElementById("photoLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const closeButton = document.getElementById("lightboxClose");
  const previousButton = document.getElementById("lightboxPrevious");
  const nextButton = document.getElementById("lightboxNext");
  const counter = document.getElementById("lightboxCounter");
  const photos = Array.isArray(window.PhotoGalleryData)
    ? window.PhotoGalleryData
    : [];

  let currentIndex = 0;

  function updateCounter() {
    if (!counter) {
      return;
    }

    counter.textContent = `${currentIndex + 1} / ${photos.length}`;
  }

  function showPhoto(index) {
    if (!lightbox || !lightboxImage || photos.length === 0) {
      return;
    }

    currentIndex = (index + photos.length) % photos.length;
    const photo = photos[currentIndex];
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.alt || "Livia e Messias";
    updateCounter();
  }

  function openLightbox(index) {
    showPhoto(index);
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("public-modal-open");
    closeButton?.focus();
  }

  function closeLightbox() {
    if (!lightbox) {
      return;
    }

    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("public-modal-open");
  }

  function goToPrevious() {
    showPhoto(currentIndex - 1);
  }

  function goToNext() {
    showPhoto(currentIndex + 1);
  }

  function renderGallery() {
    if (!gallery) {
      return;
    }

    photos.forEach((photo, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "photo-card";
      button.setAttribute("aria-label", `Abrir foto ${index + 1}`);
      button.addEventListener("click", () => openLightbox(index));

      const image = document.createElement("img");
      image.src = photo.src;
      image.alt = photo.alt || "Livia e Messias";
      image.loading = index < 2 ? "eager" : "lazy";

      button.appendChild(image);
      gallery.appendChild(button);
    });
  }

  closeButton?.addEventListener("click", closeLightbox);
  previousButton?.addEventListener("click", goToPrevious);
  nextButton?.addEventListener("click", goToNext);

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("active")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      goToPrevious();
    }

    if (event.key === "ArrowRight") {
      goToNext();
    }
  });

  window.PublicCommon?.setupNavbar();
  renderGallery();
})();
