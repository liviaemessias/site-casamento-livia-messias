AdminCommon.setupLogout();

const wallMessagesTableBody = document.getElementById("wallMessagesTableBody");
const wallMessageSearchInput = document.getElementById("wallMessageSearchInput");
const wallMessageStatusFilter = document.getElementById(
  "wallMessageStatusFilter",
);
const wallMessageInviteTypeFilter = document.getElementById(
  "wallMessageInviteTypeFilter",
);
const wallMessageReplyFilter = document.getElementById(
  "wallMessageReplyFilter",
);
const wallMessageSortSelect = document.getElementById("wallMessageSortSelect");
const wallMessageFilterCount = document.getElementById(
  "wallMessageFilterCount",
);
const clearWallMessageFiltersButton = document.getElementById(
  "clearWallMessageFiltersButton",
);
const refreshWallMessagesButton = document.getElementById(
  "refreshWallMessagesButton",
);
const wallMessageSummaryCards = document.querySelectorAll("[data-wall-status]");
const wallPendingCount = document.getElementById("wallPendingCount");
const wallApprovedCount = document.getElementById("wallApprovedCount");
const wallRepliedCount = document.getElementById("wallRepliedCount");
const wallHiddenCount = document.getElementById("wallHiddenCount");
const wallMessageDetailsModal = document.getElementById(
  "wallMessageDetailsModal",
);
const closeWallMessageDetailsModalButton = document.getElementById(
  "closeWallMessageDetailsModalButton",
);
const wallMessageDetailsTitle = document.getElementById(
  "wallMessageDetailsTitle",
);
const wallMessageDetailsContent = document.getElementById(
  "wallMessageDetailsContent",
);
const wallMessageReplyModal = document.getElementById("wallMessageReplyModal");
const closeWallMessageReplyModalButton = document.getElementById(
  "closeWallMessageReplyModalButton",
);
const wallMessageReplyForm = document.getElementById("wallMessageReplyForm");
const wallMessageReplyText = document.getElementById("wallMessageReplyText");
const wallMessageReplyTitle = document.getElementById("wallMessageReplyTitle");

const { formatDate } = AdminCommon;
const showAdminToast = AdminCommon.showToast;
const { escapeAttribute, replaceSafeContent, safeText } = SecurityUtils;

let cachedWallMessages = [];
let selectedWallMessage = null;
let wallMessageSearchTimer = null;
let wallMessageSortState = {
  direction: "desc",
  key: "updated",
};

function applyInitialFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status") || "";
  const allowedStatuses = new Set(["approved", "hidden", "pending", "replied"]);

  if (allowedStatuses.has(status)) {
    wallMessageStatusFilter.value = status;
  }

  const inviteType = params.get("invite_type") || "";

  if (inviteType === "individual" || inviteType === "couple") {
    wallMessageInviteTypeFilter.value = inviteType;
  }

  const reply = params.get("reply") || "";

  if (reply === "with-reply" || reply === "without-reply") {
    wallMessageReplyFilter.value = reply;
  }
}

function getStatusLabel(message) {
  if (message.status === "approved" && message.couple_reply) {
    return "Respondido";
  }

  const labels = {
    approved: "Aprovado",
    hidden: "Oculto",
    pending: "Pendente",
  };

  return labels[message.status] || message.status || "-";
}

function getStatusBadgeClass(message) {
  if (message.status === "approved" && message.couple_reply) {
    return "badge-payment";
  }

  const classes = {
    approved: "badge-available",
    hidden: "badge-muted",
    pending: "badge-warning",
  };

  return classes[message.status] || "badge-muted";
}

function renderStatusBadge(message) {
  return `<span class="admin-badge ${getStatusBadgeClass(message)}">${safeText(
    getStatusLabel(message),
  )}</span>`;
}

function renderIcon(name) {
  return `<i data-lucide="${safeText(name)}" aria-hidden="true"></i>`;
}

function findWallMessage(messageId) {
  return cachedWallMessages.find((message) => message.id === messageId);
}

function matchesStatus(message, status) {
  if (!status) {
    return true;
  }

  if (status === "replied") {
    return Boolean(message.couple_reply);
  }

  return message.status === status;
}

function matchesInviteType(message, inviteType) {
  return !inviteType || message.invite_type === inviteType;
}

function matchesReply(message, replyFilter) {
  if (replyFilter === "with-reply") {
    return Boolean(message.couple_reply);
  }

  if (replyFilter === "without-reply") {
    return !message.couple_reply;
  }

  return true;
}

function getMessageTimestamp(message, field) {
  const value = message[field] || message.updated_at || message.submitted_at || message.created_at;
  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getStatusPriority(message) {
  const priorities = {
    pending: 0,
    approved: 1,
    hidden: 2,
  };

  return priorities[message.status] ?? 3;
}

function sortWallMessages(messages) {
  return [...messages].sort((first, second) => {
    let result = 0;

    if (wallMessageSortState.key === "status") {
      result = getStatusPriority(first) - getStatusPriority(second);
    } else if (wallMessageSortState.key === "guest") {
      result = String(first.guest_name || "").localeCompare(
        String(second.guest_name || ""),
        "pt-BR",
        { sensitivity: "base" },
      );
    } else {
      result = getMessageTimestamp(first, "updated_at") - getMessageTimestamp(second, "updated_at");
    }

    if (result === 0) {
      result = getMessageTimestamp(first, "updated_at") - getMessageTimestamp(second, "updated_at");
    }

    return wallMessageSortState.direction === "asc" ? result : -result;
  });
}

function updateWallMessageSortButtons() {
  document.querySelectorAll("[data-wall-sort]").forEach((button) => {
    button.classList.remove("sorted-asc", "sorted-desc");

    if (button.dataset.wallSort === wallMessageSortState.key) {
      button.classList.add(`sorted-${wallMessageSortState.direction}`);
    }
  });
}

function syncWallMessageSortSelect() {
  const selectValueBySort = {
    "guest:asc": "guest-asc",
    "status:asc": "pending-first",
    "updated:asc": "updated-asc",
    "updated:desc": "updated-desc",
  };
  const value =
    selectValueBySort[`${wallMessageSortState.key}:${wallMessageSortState.direction}`] ||
    "updated-desc";

  wallMessageSortSelect.value = value;
}

function setWallMessageSort(key) {
  if (wallMessageSortState.key === key) {
    wallMessageSortState.direction =
      wallMessageSortState.direction === "asc" ? "desc" : "asc";
  } else {
    wallMessageSortState = {
      direction: key === "updated" ? "desc" : "asc",
      key,
    };
  }

  syncWallMessageSortSelect();
  renderWallMessages();
}

function setWallMessageSortFromSelect(value) {
  const sortStateByValue = {
    "guest-asc": { direction: "asc", key: "guest" },
    "pending-first": { direction: "asc", key: "status" },
    "updated-asc": { direction: "asc", key: "updated" },
    "updated-desc": { direction: "desc", key: "updated" },
  };

  wallMessageSortState = sortStateByValue[value] || {
    direction: "desc",
    key: "updated",
  };
  renderWallMessages();
}

function getFilteredWallMessages() {
  const search = wallMessageSearchInput.value.trim().toLocaleLowerCase("pt-BR");
  const status = wallMessageStatusFilter.value;
  const inviteType = wallMessageInviteTypeFilter.value;
  const replyFilter = wallMessageReplyFilter.value;

  const filteredMessages = cachedWallMessages.filter((message) => {
    const searchable = [
      message.guest_name,
      message.invite_type === "couple" ? "casal" : "individual",
      message.message,
      message.couple_reply,
      message.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("pt-BR");

    return (
      matchesStatus(message, status) &&
      matchesInviteType(message, inviteType) &&
      matchesReply(message, replyFilter) &&
      (!search || searchable.includes(search))
    );
  });

  return sortWallMessages(filteredMessages);
}

function updateSummary() {
  wallPendingCount.textContent = String(
    cachedWallMessages.filter((message) => message.status === "pending").length,
  );
  wallApprovedCount.textContent = String(
    cachedWallMessages.filter((message) => message.status === "approved").length,
  );
  wallRepliedCount.textContent = String(
    cachedWallMessages.filter((message) => message.couple_reply).length,
  );
  wallHiddenCount.textContent = String(
    cachedWallMessages.filter((message) => message.status === "hidden").length,
  );
}

function renderWallMessages() {
  const messages = getFilteredWallMessages();

  wallMessageFilterCount.textContent = `${messages.length} de ${cachedWallMessages.length} recados`;
  updateWallMessageSortButtons();

  if (!messages.length) {
    replaceSafeContent(
      wallMessagesTableBody,
      `
        <tr>
          <td colspan="6" class="admin-empty-state">
            Nenhum recado encontrado.
          </td>
        </tr>
      `,
    );
    return;
  }

  replaceSafeContent(
    wallMessagesTableBody,
    messages
      .map(
        (message) => `
          <tr>
            <td>
              <strong>${safeText(message.guest_name)}</strong>
              <span class="admin-muted wall-message-invite-type">
                ${message.invite_type === "couple" ? "Casal" : "Individual"}
              </span>
            </td>
            <td>${renderStatusBadge(message)}</td>
            <td class="wall-message-text">${safeText(message.message)}</td>
            <td class="wall-message-text">${safeText(message.couple_reply, "-")}</td>
            <td>${safeText(formatDate(message.updated_at || message.submitted_at))}</td>
            <td>
              <div class="admin-actions compact-actions">
                <button
                  type="button"
                  class="admin-action-button icon-action"
                  data-wall-action="details"
                  data-wall-message-id="${escapeAttribute(message.id)}"
                >
                  ${renderIcon("eye")}
                  Detalhes
                </button>
                ${
                  message.status !== "approved"
                    ? `
                      <button
                        type="button"
                        class="admin-action-button success icon-action"
                        data-wall-action="approve"
                        data-wall-message-id="${escapeAttribute(message.id)}"
                      >
                        ${renderIcon("check")}
                        Aprovar
                      </button>
                    `
                    : `
                      <button
                        type="button"
                        class="admin-action-button icon-action"
                        data-wall-action="reply"
                        data-wall-message-id="${escapeAttribute(message.id)}"
                      >
                        ${renderIcon("reply")}
                        ${message.couple_reply ? "Editar" : "Responder"}
                      </button>
                    `
                }
                ${
                  message.status === "pending"
                    ? `
                      <button
                        type="button"
                        class="admin-action-button icon-action"
                        data-wall-action="hide"
                        data-wall-message-id="${escapeAttribute(message.id)}"
                      >
                        ${renderIcon("eye-off")}
                        Ocultar
                      </button>
                    `
                    : ""
                }
              </div>
            </td>
          </tr>
        `,
      )
      .join(""),
  );

  window.lucide?.createIcons();
}

function renderWallMessageMeta(message) {
  const items = [
    { label: "Tipo de convite", value: message.invite_type === "couple" ? "Casal" : "Individual" },
    { label: "Enviado em", value: formatDate(message.submitted_at || message.created_at) },
    { label: "Atualizado em", value: formatDate(message.updated_at) },
    { label: "Aprovado em", value: formatDate(message.approved_at) },
    { label: "Ocultado em", value: formatDate(message.hidden_at) },
    { label: "Respondido em", value: formatDate(message.couple_replied_at) },
  ];

  return `
    <div class="admin-details-meta-grid">
      ${items
        .map(
          ({ label, value }) => `
            <div class="admin-details-meta-item">
              <span>${safeText(label)}</span>
              <strong>${safeText(value)}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderWallMessageDetailsActions(message) {
  return `
    <div class="admin-detail-action-grid">
      ${
        message.status !== "approved"
          ? `
            <button
              type="button"
              class="admin-detail-action-card success"
              data-wall-detail-action="approve"
              data-wall-message-id="${escapeAttribute(message.id)}"
            >
              <span class="admin-detail-action-icon">${renderIcon("check")}</span>
              <span>
                <strong>Aprovar</strong>
                <small>Exibe este recado no mural público.</small>
              </span>
            </button>
          `
          : ""
      }
      ${
        message.status !== "hidden"
          ? `
            <button
              type="button"
              class="admin-detail-action-card"
              data-wall-detail-action="hide"
              data-wall-message-id="${escapeAttribute(message.id)}"
            >
              <span class="admin-detail-action-icon">${renderIcon("eye-off")}</span>
              <span>
                <strong>Ocultar</strong>
                <small>Remove este recado do mural público sem excluir o registro.</small>
              </span>
            </button>
          `
          : ""
      }
      <button
        type="button"
        class="admin-detail-action-card"
        data-wall-detail-action="reply"
        data-wall-message-id="${escapeAttribute(message.id)}"
      >
        <span class="admin-detail-action-icon">${renderIcon("reply")}</span>
        <span>
          <strong>${message.couple_reply ? "Editar resposta" : "Responder"}</strong>
          <small>${message.couple_reply ? "Atualiza a resposta dos noivos." : "Escreve uma resposta dos noivos."}</small>
        </span>
      </button>
      ${
        message.couple_reply
          ? `
            <button
              type="button"
              class="admin-detail-action-card warning"
              data-wall-detail-action="clear-reply"
              data-wall-message-id="${escapeAttribute(message.id)}"
            >
              <span class="admin-detail-action-icon">${renderIcon("message-square-x")}</span>
              <span>
                <strong>Remover resposta</strong>
                <small>Apaga somente a resposta dos noivos deste recado.</small>
              </span>
            </button>
          `
          : ""
      }
      <button
        type="button"
        class="admin-detail-action-card danger"
        data-wall-detail-action="delete"
        data-wall-message-id="${escapeAttribute(message.id)}"
      >
        <span class="admin-detail-action-icon">${renderIcon("trash-2")}</span>
        <span>
          <strong>Excluir recado</strong>
          <small>Remove definitivamente este recado do mural.</small>
        </span>
      </button>
    </div>
  `;
}

function openWallMessageDetailsModal(messageId) {
  const message = findWallMessage(messageId);

  if (!message) {
    return;
  }

  wallMessageDetailsTitle.textContent = message.guest_name || "Detalhes do Recado";
  replaceSafeContent(
    wallMessageDetailsContent,
    `
      <section class="admin-details-section">
        <span class="admin-details-label">Resumo</span>
        <div class="gift-situation-stack">
          ${renderStatusBadge(message)}
        </div>
      </section>

      <section class="admin-details-section">
        <span class="admin-details-label">Recado</span>
        <p>${safeText(message.message)}</p>
      </section>

      <section class="admin-details-section">
        <span class="admin-details-label">Resposta dos noivos</span>
        <p>${safeText(message.couple_reply, "Nenhuma resposta registrada.")}</p>
      </section>

      <section class="admin-details-section">
        <span class="admin-details-label">Ações</span>
        ${renderWallMessageDetailsActions(message)}
      </section>

      <section class="admin-details-section">
        <span class="admin-details-label">Datas</span>
        ${renderWallMessageMeta(message)}
      </section>
    `,
  );

  wallMessageDetailsModal.classList.add("active");
  wallMessageDetailsModal.setAttribute("aria-hidden", "false");
  window.lucide?.createIcons();
}

function closeWallMessageDetailsModal() {
  wallMessageDetailsModal.classList.remove("active");
  wallMessageDetailsModal.setAttribute("aria-hidden", "true");
}

async function loadWallMessages() {
  refreshWallMessagesButton.disabled = true;

  const { data, error } = await supabaseClient.rpc("admin_list_wall_messages", {
    p_limit: 200,
    p_offset: 0,
    p_search: null,
    p_status: null,
  });

  refreshWallMessagesButton.disabled = false;

  if (error) {
    console.error(error);
    showAdminToast("Não foi possível carregar os recados.");
    return;
  }

  cachedWallMessages = data || [];
  updateSummary();
  renderWallMessages();
}

async function notifyWallMessageEvent(eventType, aggregateId) {
  try {
    const { error } = await supabaseClient.functions.invoke(
      "send-notifications",
      {
        body: {
          aggregate_id: aggregateId,
          event_type: eventType,
        },
      },
    );

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateWallMessage(action, messageId) {
  const rpcByAction = {
    approve: "admin_approve_wall_message",
    "clear-reply": "admin_clear_wall_message_reply",
    delete: "admin_delete_wall_message",
    hide: "admin_hide_wall_message",
  };
  const confirmMessageByAction = {
    approve: "Deseja aprovar este recado e exibi-lo no mural público?",
    "clear-reply": "Deseja remover a resposta dos noivos deste recado?",
    delete: "Deseja excluir este recado?\n\nEsta ação não poderá ser desfeita.",
    hide: "Deseja ocultar este recado do mural público?",
  };
  const toastByAction = {
    approve: "Recado aprovado.",
    "clear-reply": "Resposta removida.",
    delete: "Recado excluído.",
    hide: "Recado ocultado.",
  };
  const rpc = rpcByAction[action];

  if (!rpc) {
    return;
  }

  const confirmed = confirm(confirmMessageByAction[action]);

  if (!confirmed) {
    return;
  }

  const { data, error } = await supabaseClient.rpc(rpc, {
    target_message_id: messageId,
  });

  if (error || data !== true) {
    console.error(error);
    showAdminToast("Não foi possível atualizar o recado.");
    return;
  }

  showAdminToast(toastByAction[action]);
  if (action === "approve") {
    void notifyWallMessageEvent("wall_message_approved", messageId);
  }
  closeWallMessageDetailsModal();
  await loadWallMessages();
}

function openReplyModal(messageId) {
  selectedWallMessage = findWallMessage(messageId);

  if (!selectedWallMessage) {
    return;
  }

  closeWallMessageDetailsModal();
  wallMessageReplyTitle.textContent = `Responder ${selectedWallMessage.guest_name}`;
  wallMessageReplyText.value = selectedWallMessage.couple_reply || "";
  wallMessageReplyModal.classList.add("active");
  wallMessageReplyModal.setAttribute("aria-hidden", "false");
  wallMessageReplyText.focus();
}

function closeReplyModal() {
  wallMessageReplyModal.classList.remove("active");
  wallMessageReplyModal.setAttribute("aria-hidden", "true");
  selectedWallMessage = null;
}

async function saveReply(event) {
  event.preventDefault();

  if (!selectedWallMessage) {
    return;
  }
  const messageId = selectedWallMessage.id;

  const confirmed = confirm("Deseja salvar esta resposta dos noivos?");

  if (!confirmed) {
    return;
  }

  const { data, error } = await supabaseClient.rpc("admin_reply_wall_message", {
    submitted_reply: wallMessageReplyText.value,
    target_message_id: selectedWallMessage.id,
  });

  if (error || data !== true) {
    console.error(error);
    showAdminToast("Não foi possível salvar a resposta.");
    return;
  }

  closeReplyModal();
  showAdminToast("Resposta salva.");
  void notifyWallMessageEvent("wall_message_replied", messageId);
  await loadWallMessages();
}

wallMessagesTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-wall-action]");

  if (!button) {
    return;
  }

  const action = button.dataset.wallAction;
  const messageId = button.dataset.wallMessageId;

  if (action === "reply") {
    openReplyModal(messageId);
    return;
  }

  if (action === "details") {
    openWallMessageDetailsModal(messageId);
    return;
  }

  updateWallMessage(action, messageId);
});

wallMessageDetailsContent.addEventListener("click", (event) => {
  const button = event.target.closest("[data-wall-detail-action]");

  if (!button) {
    return;
  }

  const action = button.dataset.wallDetailAction;
  const messageId = button.dataset.wallMessageId;

  if (action === "reply") {
    openReplyModal(messageId);
    return;
  }

  updateWallMessage(action, messageId);
});

wallMessageSearchInput.addEventListener("input", () => {
  clearTimeout(wallMessageSearchTimer);
  wallMessageSearchTimer = setTimeout(renderWallMessages, 200);
});

wallMessageStatusFilter.addEventListener("change", renderWallMessages);
wallMessageInviteTypeFilter.addEventListener("change", renderWallMessages);
wallMessageReplyFilter.addEventListener("change", renderWallMessages);
wallMessageSortSelect.addEventListener("change", () => {
  setWallMessageSortFromSelect(wallMessageSortSelect.value);
});
clearWallMessageFiltersButton.addEventListener("click", () => {
  wallMessageSearchInput.value = "";
  wallMessageStatusFilter.value = "";
  wallMessageInviteTypeFilter.value = "";
  wallMessageReplyFilter.value = "";
  wallMessageSortState = {
    direction: "desc",
    key: "updated",
  };
  syncWallMessageSortSelect();
  renderWallMessages();
});
refreshWallMessagesButton.addEventListener("click", loadWallMessages);
closeWallMessageDetailsModalButton.addEventListener("click", closeWallMessageDetailsModal);
closeWallMessageReplyModalButton.addEventListener("click", closeReplyModal);
wallMessageReplyForm.addEventListener("submit", saveReply);

wallMessageSummaryCards.forEach((card) => {
  card.addEventListener("click", () => {
    wallMessageStatusFilter.value = card.dataset.wallStatus || "";
    renderWallMessages();
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }
  });
});

document.querySelectorAll("[data-wall-sort]").forEach((button) => {
  button.addEventListener("click", () => {
    setWallMessageSort(button.dataset.wallSort);
  });
});

applyInitialFiltersFromUrl();
syncWallMessageSortSelect();
loadWallMessages();

wallMessageDetailsModal.addEventListener("click", (event) => {
  if (event.target === wallMessageDetailsModal) {
    closeWallMessageDetailsModal();
  }
});
