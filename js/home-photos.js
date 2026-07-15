(function () {
  const preview = document.getElementById("homePhotoPreview");
  const photos = Array.isArray(window.PhotoGalleryData)
    ? window.PhotoGalleryData.slice(0, 5)
    : [];

  if (!preview || photos.length === 0) {
    return;
  }

  photos.forEach((photo, index) => {
    const link = document.createElement("a");
    link.className = "home-photo-item";
    link.href = "photos.html";
    link.setAttribute("aria-label", "Abrir galeria de fotos");

    if (index === 0) {
      link.classList.add("featured");
    }

    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = photo.alt || "Livia e Messias";
    image.loading = index === 0 ? "eager" : "lazy";

    link.appendChild(image);
    preview.appendChild(link);
  });
})();
