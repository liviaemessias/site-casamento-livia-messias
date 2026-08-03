(function () {
  const MAX_MESSAGE_LENGTH = 800;
  const messagesGrid = document.getElementById("messagesGrid");
  const messagesEmptyState = document.getElementById("messagesEmptyState");
  const messagesHeroDescription = document.getElementById(
    "messagesHeroDescription",
  );
  const guestMessagePanel = document.getElementById("guestMessagePanel");
  const guestMessageForm = document.getElementById("guestMessageForm");
  const guestMessageTitle = document.getElementById("guestMessageTitle");
  const guestMessageDescription = document.getElementById(
    "guestMessageDescription",
  );
  const guestMessageText = document.getElementById("guestMessageText");
  const guestMessageCounter = document.getElementById("guestMessageCounter");
  const guestMessageStatus = document.getElementById("guestMessageStatus");
  const guestMessageSubmitButton = document.getElementById(
    "guestMessageSubmitButton",
  );
  const guestMessageFeedback = document.getElementById("guestMessageFeedback");
  const guestLoginPrompt = document.getElementById("guestLoginPrompt");
  const guestInfoItem = document.getElementById("guestInfoItem");
  const logoutItem = document.getElementById("logoutItem");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  const messageEmailHint = document.getElementById("messageEmailHint");

  let currentGuest = null;
  let currentMessage = null;

  function isCoupleInvite() {
    return currentGuest?.invite_type === "couple";
  }

  function updateHeroDescription() {
    if (!messagesHeroDescription) {
      return;
    }

    messagesHeroDescription.textContent = isCoupleInvite()
      ? "Deixem uma mensagem carinhosa para os noivos e vejam os recados já aprovados"
      : "Deixe uma mensagem carinhosa para os noivos e veja os recados já aprovados";
  }

  function setFeedback(message, type = "info") {
    if (!guestMessageFeedback) {
      return;
    }

    guestMessageFeedback.textContent = message || "";
    guestMessageFeedback.dataset.type = type;
    guestMessageFeedback.hidden = !message;
  }

  function showToast(message) {
    if (!toast || !toastMessage) {
      return;
    }

    toastMessage.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  function getMessageEmailHintStorageKey() {
    return `message_email_hint_dismissed:${currentGuest?.id || "guest"}`;
  }

  function wasMessageEmailHintDismissed() {
    try {
      return localStorage.getItem(getMessageEmailHintStorageKey()) === "true";
    } catch (error) {
      console.warn("Não foi possível ler a preferência da dica de e-mail.", error);
      return false;
    }
  }

  function hideMessageEmailHint() {
    if (!messageEmailHint) {
      return;
    }

    messageEmailHint.replaceChildren();
    messageEmailHint.hidden = true;
    messageEmailHint.classList.remove("active");
  }

  function dismissMessageEmailHint() {
    try {
      localStorage.setItem(getMessageEmailHintStorageKey(), "true");
    } catch (error) {
      console.warn("Não foi possível salvar a preferência da dica de e-mail.", error);
    }

    hideMessageEmailHint();
  }

  function hasValidRSVPEmail(email) {
    if (!email || typeof email !== "string") {
      return false;
    }

    const input = document.createElement("input");
    input.type = "email";
    input.required = true;
    input.value = email.trim();
    return input.checkValidity();
  }

  function showMessageEmailHint() {
    if (!messageEmailHint) {
      return;
    }

    const message = document.createElement("p");
    message.textContent = isCoupleInvite()
      ? "Informem um e-mail no RSVP para receber avisos sobre o recado de vocês! 💜"
      : "Informe seu e-mail no RSVP para receber avisos sobre seu recado! 💜";

    const actions = document.createElement("div");
    actions.className = "message-email-hint-actions";

    const rsvpLink = document.createElement("a");
    rsvpLink.className = "message-button";
    rsvpLink.href = "./rsvp.html";
    rsvpLink.textContent = "Responder RSVP";

    const dismissButton = document.createElement("button");
    dismissButton.type = "button";
    dismissButton.className = "message-email-hint-close";
    dismissButton.setAttribute("aria-label", "Dispensar dica de e-mail");
    dismissButton.textContent = "×";
    dismissButton.addEventListener("click", dismissMessageEmailHint);

    actions.append(rsvpLink, dismissButton);
    messageEmailHint.replaceChildren(message, actions);
    messageEmailHint.hidden = false;
    messageEmailHint.classList.add("active");
  }

  async function updateMessageEmailHint() {
    if (!messageEmailHint || !currentGuest?.id || wasMessageEmailHintDismissed()) {
      hideMessageEmailHint();
      return;
    }

    const { data, error } = await GuestData.loadRSVP(currentGuest.id);

    if (error) {
      console.error(error);
      hideMessageEmailHint();
      return;
    }

    if (hasValidRSVPEmail(data?.email)) {
      hideMessageEmailHint();
      return;
    }

    showMessageEmailHint();
  }

  function getStatusLabel(status, hasReply = false) {
    if (status === "approved" && hasReply) {
      return "Respondido";
    }

    const labels = {
      approved: "Aprovado",
      hidden: "Oculto",
      pending: "Pendente",
    };

    return labels[status] || "Pendente";
  }

  function updateCounter() {
    if (!guestMessageText || !guestMessageCounter) {
      return;
    }

    const length = guestMessageText.value.length;
    guestMessageCounter.textContent = `${length}/${MAX_MESSAGE_LENGTH}`;
  }

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
      month: "long",
      year: "numeric",
    });
  }

  function createMessageCard(message) {
    const card = document.createElement("article");
    const author = document.createElement("h3");
    const text = document.createElement("p");
    const publishedDate = formatMessageDate(
      message.approved_at || message.created_at,
    );

    card.className = "wall-message-card";
    author.textContent = message.guest_name || "Convidado";
    text.className = "wall-message-text";
    text.textContent = message.message || "";
    card.append(author, text);

    if (publishedDate) {
      const date = document.createElement("time");

      date.className = "wall-message-date";
      date.dateTime = message.approved_at || message.created_at;
      date.textContent = publishedDate;
      card.appendChild(date);
    }

    if (message.couple_reply) {
      const reply = document.createElement("div");
      const replyTitle = document.createElement("strong");
      const replyText = document.createElement("p");

      reply.className = "wall-message-reply";
      replyTitle.textContent = "Resposta dos noivos";
      replyText.textContent = message.couple_reply;
      reply.append(replyTitle, replyText);
      card.appendChild(reply);
    }

    return card;
  }

  function renderApprovedMessages(messages) {
    if (!messagesGrid || !messagesEmptyState) {
      return;
    }

    messagesGrid.replaceChildren();
    messagesEmptyState.hidden = messages.length > 0;

    messages.forEach((message) => {
      messagesGrid.appendChild(createMessageCard(message));
    });
  }

  function renderGuestMessage() {
    if (!guestMessagePanel || !guestLoginPrompt) {
      return;
    }

    const isLogged = Boolean(currentGuest);
    updateHeroDescription();
    guestMessagePanel.hidden = !isLogged;
    guestLoginPrompt.hidden = isLogged;

    if (guestInfoItem && logoutItem) {
      guestInfoItem.hidden = !isLogged;
      logoutItem.hidden = !isLogged;
    }

    if (!isLogged || !guestMessageText || !guestMessageStatus) {
      return;
    }

    window.PublicCommon?.showGuestName(currentGuest);

    if (guestMessageTitle && guestMessageDescription) {
      guestMessageTitle.textContent = isCoupleInvite()
        ? "Recado de vocês"
        : "Seu recado";
      guestMessageDescription.textContent = isCoupleInvite()
        ? "Escrevam uma mensagem com carinho para nós! Ela logo poderá aparecer no mural! 💜"
        : "Escreva uma mensagem com carinho para nós! Ela logo poderá aparecer no mural! 💜";
    }

    guestMessageText.value = currentMessage?.message || "";
    guestMessageText.placeholder = isCoupleInvite()
      ? "Escrevam o recado de vocês..."
      : "Escreva seu recado...";
    guestMessageStatus.textContent = currentMessage
      ? getStatusLabel(currentMessage.status, Boolean(currentMessage.couple_reply))
      : "Ainda não enviado";

    if (guestMessageSubmitButton) {
      guestMessageSubmitButton.textContent = currentMessage
        ? "Atualizar Recado"
        : "Enviar Recado";
    }

    updateCounter();
  }

  async function loadApprovedMessages() {
    const { data, error } = await GuestData.listApprovedWallMessages();

    if (error) {
      console.error(error);
      renderApprovedMessages([]);
      return;
    }

    renderApprovedMessages(data || []);
  }

  async function loadGuestArea() {
    currentGuest = await GuestAuth.getGuest();

    if (!currentGuest) {
      renderGuestMessage();
      return;
    }

    window.currentGuest = currentGuest;
    const { data, error } = await GuestData.loadCurrentWallMessage();

    if (error) {
      console.error(error);
      setFeedback(
        isCoupleInvite()
          ? "Não foi possível carregar o recado de vocês."
          : "Não foi possível carregar seu recado.",
        "error",
      );
    } else {
      currentMessage = data;
    }

    renderGuestMessage();
    await updateMessageEmailHint();
  }

  async function saveGuestMessage(event) {
    event.preventDefault();

    if (!guestMessageText || !guestMessageSubmitButton) {
      return;
    }

    const message = guestMessageText.value.trim();

    if (!message) {
      setFeedback(
        isCoupleInvite()
          ? "Escrevam um recado antes de enviar."
          : "Escreva um recado antes de enviar.",
        "error",
      );
      return;
    }

    guestMessageSubmitButton.disabled = true;
    setFeedback("");

    const { data, error } = await GuestData.saveCurrentWallMessage(message);

    guestMessageSubmitButton.disabled = false;

    if (error || !data) {
      console.error(error);
      setFeedback(
        isCoupleInvite()
          ? "Não foi possível salvar o recado de vocês."
          : "Não foi possível salvar seu recado.",
        "error",
      );
      return;
    }

    currentMessage = data;
    renderGuestMessage();
    setFeedback("");
    showToast(
      isCoupleInvite()
        ? "O recado de vocês foi enviado com carinho! Em breve ele aparecerá no mural! 💜"
        : "Seu recado foi enviado com carinho! Em breve ele aparecerá no mural! 💜",
    );
    GuestData.notifyPendingNotifications("wall_message_submitted", data.id)
      .catch((notificationError) => {
        console.error(notificationError);
      });
    await loadApprovedMessages();
  }

  window.PublicCommon?.setupNavbar();
  window.PublicCommon?.setupLogout();
  guestMessageText?.addEventListener("input", updateCounter);
  guestMessageForm?.addEventListener("submit", saveGuestMessage);

  Promise.all([loadApprovedMessages(), loadGuestArea()]).catch((error) => {
    console.error(error);
  });
})();
