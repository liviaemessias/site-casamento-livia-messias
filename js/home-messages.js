(function () {
  const AUTOPLAY_INTERVAL_MS = 5000;
  const section = document.getElementById("homeMessagesSection");
  const track = document.getElementById("homeMessagesTrack");
  const previousButton = document.getElementById("homeMessagesPrev");
  const nextButton = document.getElementById("homeMessagesNext");
  let autoplayTimer = null;
  let activeIndex = 0;
  let isPointerOverCarousel = false;

  function formatMessageDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function createMessageCard(message) {
    const card = document.createElement("article");
    const author = document.createElement("h3");
    const text = document.createElement("p");
    const dateValue = message.approved_at || message.created_at;
    const dateText = formatMessageDate(dateValue);

    card.className = "home-message-card";
    author.textContent = message.guest_name || "Convidado";
    text.textContent = message.message || "";

    card.append(author, text);

    if (dateText) {
      const date = document.createElement("time");

      date.dateTime = dateValue;
      date.textContent = dateText;
      card.appendChild(date);
    }

    return card;
  }

  function getCards() {
    return Array.from(track?.querySelectorAll(".home-message-card") || []);
  }

  function setNavigationState() {
    const cards = getCards();
    const hasMultipleCards = cards.length > 1;

    if (previousButton) {
      previousButton.hidden = !hasMultipleCards;
    }

    if (nextButton) {
      nextButton.hidden = !hasMultipleCards;
    }
  }

  function scrollToCard(index, behavior = "smooth") {
    const cards = getCards();

    if (!cards.length || !track) {
      return;
    }

    activeIndex = (index + cards.length) % cards.length;
    const card = cards[activeIndex];
    const left =
      card.offsetLeft - track.clientWidth / 2 + card.offsetWidth / 2;

    track.scrollTo({
      behavior,
      left,
    });
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();

    if (
      isPointerOverCarousel ||
      document.hidden ||
      getCards().length <= 1 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    autoplayTimer = setTimeout(() => {
      scrollToCard(activeIndex + 1);
      startAutoplay();
    }, AUTOPLAY_INTERVAL_MS);
  }

  function handleManualNavigation(direction) {
    stopAutoplay();
    scrollToCard(activeIndex + direction);
    startAutoplay();
  }

  function syncActiveCardFromScroll() {
    const cards = getCards();

    if (!track || !cards.length) {
      return;
    }

    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(trackCenter - cardCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    activeIndex = closestIndex;
  }

  function bindCarouselEvents() {
    previousButton?.addEventListener("click", () => handleManualNavigation(-1));
    nextButton?.addEventListener("click", () => handleManualNavigation(1));

    track?.addEventListener("scroll", () => {
      window.requestAnimationFrame(syncActiveCardFromScroll);
    });

    track?.addEventListener("pointerdown", stopAutoplay);
    track?.addEventListener("pointerup", startAutoplay);
    track?.addEventListener("pointercancel", startAutoplay);
    track?.addEventListener("mouseenter", () => {
      isPointerOverCarousel = true;
      stopAutoplay();
    });
    track?.addEventListener("mouseleave", () => {
      isPointerOverCarousel = false;
      startAutoplay();
    });
    track?.addEventListener("focusin", stopAutoplay);
    track?.addEventListener("focusout", startAutoplay);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
  }

  async function loadHomeMessages() {
    if (!section || !track || typeof supabaseClient === "undefined") {
      return;
    }

    const { data, error } = await supabaseClient.rpc(
      "list_approved_wall_messages",
      {
        p_limit: 8,
        p_offset: 0,
      },
    );

    if (error) {
      console.error(error);
      return;
    }

    const messages = data || [];

    if (!messages.length) {
      section.hidden = true;
      track.replaceChildren();
      return;
    }

    track.replaceChildren(...messages.map(createMessageCard));
    section.hidden = false;
    activeIndex = 0;
    scrollToCard(0, "auto");
    setNavigationState();
    startAutoplay();
  }

  bindCarouselEvents();
  loadHomeMessages();
})();
