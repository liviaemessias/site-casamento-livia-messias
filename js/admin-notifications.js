AdminCommon.setupLogout();

const notificationsTableBody = document.getElementById("notificationsTableBody");
const notificationsMobileList = document.getElementById("notificationsMobileList");
const notificationSearchInput = document.getElementById("notificationSearchInput");
const notificationStatusFilter = document.getElementById(
  "notificationStatusFilter",
);
const notificationTypeFilter = document.getElementById("notificationTypeFilter");
const notificationRecipientFilter = document.getElementById(
  "notificationRecipientFilter",
);
const notificationOriginFilter = document.getElementById(
  "notificationOriginFilter",
);
const notificationPeriodFilter = document.getElementById(
  "notificationPeriodFilter",
);
const notificationFilterCount = document.getElementById(
  "notificationFilterCount",
);
const notificationFiltersPanel = document.getElementById(
  "notificationFiltersPanel",
);
const clearNotificationFiltersButton = document.getElementById(
  "clearNotificationFiltersButton",
);
const notificationSummaryCards = document.querySelectorAll(
  "[data-notification-summary-status]",
);
const refreshNotificationsButton = document.getElementById(
  "refreshNotificationsButton",
);
const previousNotificationsPageButton = document.getElementById(
  "previousNotificationsPageButton",
);
const nextNotificationsPageButton = document.getElementById(
  "nextNotificationsPageButton",
);
const notificationsPaginationStatus = document.getElementById(
  "notificationsPaginationStatus",
);
const notificationDetailsModal = document.getElementById(
  "notificationDetailsModal",
);
const closeNotificationDetailsModalButton = document.getElementById(
  "closeNotificationDetailsModalButton",
);
const notificationDetailsTitle = document.getElementById(
  "notificationDetailsTitle",
);
const notificationDetailsContent = document.getElementById(
  "notificationDetailsContent",
);

const { formatDate } = AdminCommon;
const showAdminToast = AdminCommon.showToast;
const { escapeAttribute, replaceSafeContent, safeText } = SecurityUtils;

let cachedNotifications = [];
let selectedNotification = null;
let currentPage = 1;
let totalNotifications = 0;
const notificationsPageSize = 50;
let notificationSearchTimer = null;
let notificationSortState = {
  direction: "desc",
  key: "created_at",
};

function applyNotificationFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);

  if (params.has("q")) {
    notificationSearchInput.value = params.get("q") || "";
  }

  if (params.has("status")) {
    notificationStatusFilter.value = params.get("status") || "";
  }

  if (params.has("type")) {
    notificationTypeFilter.value = params.get("type") || "";
  }

  if (params.has("recipient")) {
    notificationRecipientFilter.value = params.get("recipient") || "";
  }

  if (params.has("origin")) {
    notificationOriginFilter.value = params.get("origin") || "";
  }

  if (params.has("period")) {
    notificationPeriodFilter.value = params.get("period") || "";
  }
}

function getPeriodStart(period) {
  const now = new Date();

  if (period === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  const days = Number(period || 0);

  if (!days) {
    return null;
  }

  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function getNotificationTypeLabel(type) {
  const labels = {
    gift_contribution_confirmed: "Cota confirmada",
    gift_contribution_payment_reported: "Pagamento de cota informado",
    gift_contribution_released: "Cota liberada",
    gift_contribution_reminder: "Lembrete de cota",
    gift_contribution_reserved: "Cota reservada",
    gift_payment_reported: "Pagamento informado",
    gift_purchase_confirmed: "Presente confirmado",
    gift_reservation_reminder: "Lembrete de presente",
    gift_reservation_released: "Presente liberado",
    gift_reserved: "Presente reservado",
    rsvp_saved: "RSVP",
    wall_message_approved: "Recado aprovado",
    wall_message_replied: "Recado respondido",
    wall_message_submitted: "Recado enviado",
  };

  return labels[type] || type || "-";
}

function getRecipientLabel(type) {
  const labels = {
    admin: "Admin",
    guest: "Convidado",
  };

  return labels[type] || "Evento";
}

function getOriginLabel(origin) {
  const labels = {
    automatic: "Automática",
    manual: "Manual",
  };

  return labels[origin] || "-";
}

function getStatusLabel(status) {
  const labels = {
    failed: "Falha",
    pending: "Pendente",
    processed: "Processado",
    processing: "Processando",
    sent: "Enviado",
    skipped: "Ignorado",
  };

  return labels[status] || status || "-";
}

function getStatusBadgeClass(status) {
  const classes = {
    failed: "badge-danger",
    pending: "badge-warning",
    processed: "badge-payment",
    processing: "badge-warning",
    sent: "badge-available",
    skipped: "badge-muted",
  };

  return classes[status] || "badge-muted";
}

function getNotificationReason(notification) {
  const status = getNotificationStatus(notification);
  const reason = notification.last_error || "";
  const labels = {
    admin_notification_disabled: "Envio para admin desativado nas configurações.",
    automatic_notification_disabled: "Envio automático desativado nas configurações.",
    email_missing: "E-mail ausente.",
    guest_email_missing: "Convidado sem e-mail válido no RSVP.",
    guest_notification_disabled: "Envio para convidado desativado nas configurações.",
    manual_notification_disabled: "Envio manual desativado nas configurações.",
  };

  if (reason && labels[reason]) {
    return labels[reason];
  }

  if (reason) {
    return reason;
  }

  if (status === "sent") {
    return "Entrega concluída.";
  }

  if (status === "pending") {
    return "Aguardando processamento.";
  }

  if (status === "processing") {
    return "Em processamento.";
  }

  if (status === "processed") {
    return "Evento processado.";
  }

  if (status === "skipped") {
    return "Entrega ignorada.";
  }

  return "-";
}

function renderStatusBadge(status) {
  return `<span class="admin-badge ${getStatusBadgeClass(status)}">${safeText(
    getStatusLabel(status),
  )}</span>`;
}

function createNotificationIcon(name) {
  const icon = document.createElement("i");

  icon.setAttribute("data-lucide", name);
  icon.setAttribute("aria-hidden", "true");

  return icon;
}

function getNotificationStatus(notification) {
  return notification.delivery_status || notification.event_status || "";
}

function canResendNotification(notification) {
  const status = getNotificationStatus(notification);

  return Boolean(
    notification?.delivery_id &&
      status !== "pending" &&
      status !== "processing",
  );
}

function updateSummary(summary) {
  AdminCommon.setText("notificationSentCount", Number(summary?.sent_count || 0));
  AdminCommon.setText("notificationFailedCount", Number(summary?.failed_count || 0));
  AdminCommon.setText(
    "notificationSkippedCount",
    Number(summary?.skipped_count || 0),
  );
  AdminCommon.setText(
    "notificationPendingCount",
    Number(summary?.pending_count || 0),
  );
}

function updateSummaryCardState() {
  notificationSummaryCards.forEach((card) => {
    card.classList.toggle(
      "active",
      card.dataset.notificationSummaryStatus === notificationStatusFilter.value,
    );
  });
}

function hasActiveNotificationFilters() {
  return Boolean(
    notificationSearchInput.value.trim() ||
      notificationStatusFilter.value ||
      notificationTypeFilter.value ||
      notificationOriginFilter.value ||
      notificationRecipientFilter.value ||
      notificationPeriodFilter.value,
  );
}

function updatePagination() {
  const first = totalNotifications
    ? (currentPage - 1) * notificationsPageSize + 1
    : 0;
  const last = Math.min(currentPage * notificationsPageSize, totalNotifications);
  const totalPages = Math.max(1, Math.ceil(totalNotifications / notificationsPageSize));

  notificationsPaginationStatus.textContent = totalNotifications
    ? `Exibindo ${first}-${last} de ${totalNotifications} registros`
    : "Exibindo 0 registros";
  previousNotificationsPageButton.disabled = currentPage <= 1;
  nextNotificationsPageButton.disabled = currentPage >= totalPages;
}

function updateNotificationSortButtons() {
  document.querySelectorAll("[data-notification-sort]").forEach((button) => {
    button.classList.remove("sorted-asc", "sorted-desc");

    if (button.dataset.notificationSort === notificationSortState.key) {
      button.classList.add(`sorted-${notificationSortState.direction}`);
    }
  });
}

function setNotificationSort(key) {
  if (notificationSortState.key === key) {
    notificationSortState.direction =
      notificationSortState.direction === "asc" ? "desc" : "asc";
  } else {
    notificationSortState = {
      direction: key === "created_at" ? "desc" : "asc",
      key,
    };
  }

  reloadFirstPage();
}

function renderNotificationsTable(notifications) {
  updateNotificationSortButtons();
  notificationsMobileList?.replaceChildren();

  if (!notifications.length) {
    replaceSafeContent(
      notificationsTableBody,
      `
        <tr>
          <td colspan="8" class="admin-empty-state">
            Nenhuma notificação encontrada para os filtros selecionados.
          </td>
        </tr>
      `,
    );
    if (notificationsMobileList) {
      const emptyState = document.createElement("div");

      emptyState.className = "admin-mobile-empty-state";
      emptyState.textContent =
        "Nenhuma notificação encontrada para os filtros selecionados.";
      notificationsMobileList.appendChild(emptyState);
    }
    return;
  }

  replaceSafeContent(
    notificationsTableBody,
    notifications
      .map((notification, index) => {
        const status = getNotificationStatus(notification);
        const isAlert = status === "failed" || status === "skipped";
        const reason = getNotificationReason(notification);

        return `
          <tr data-notification-index="${escapeAttribute(index)}" tabindex="0">
            <td>${safeText(formatDate(notification.created_at))}</td>
            <td>${safeText(getNotificationTypeLabel(notification.event_type))}</td>
            <td>${safeText(notification.guest_name, "Sem convidado")}</td>
            <td>${safeText(getRecipientLabel(notification.recipient_type))}</td>
            <td>${safeText(notification.recipient_email, "-")}</td>
            <td>${renderStatusBadge(status)}</td>
            <td>
              <span class="${isAlert ? "notification-error-text" : ""}">
                ${safeText(reason)}
              </span>
            </td>
            <td>
              <button
                type="button"
                class="admin-action-button icon-only notification-details-action"
                data-notification-action="details"
                data-notification-index="${escapeAttribute(index)}"
                aria-label="Ver detalhes da notificação"
                title="Ver detalhes"
              >
                <i data-lucide="eye" aria-hidden="true"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join(""),
  );

  if (notificationsMobileList) {
    notifications.forEach((notification, index) => {
      notificationsMobileList.appendChild(
        createNotificationMobileCard(notification, index),
      );
    });
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function createNotificationMobileCard(notification, index) {
  const status = getNotificationStatus(notification);
  const reason = getNotificationReason(notification);
  const card = document.createElement("article");
  const main = document.createElement("div");
  const titleGroup = document.createElement("div");
  const side = document.createElement("div");
  const footer = document.createElement("div");
  const type = document.createElement("strong");
  const meta = document.createElement("span");
  const date = document.createElement("strong");
  const recipient = document.createElement("span");
  const statusBadge = document.createElement("span");
  const reasonText = document.createElement("span");
  const actions = document.createElement("div");
  const detailsButton = document.createElement("button");

  card.className = "notification-mobile-card";
  card.dataset.notificationIndex = String(index);
  card.tabIndex = 0;

  main.className = "notification-mobile-main";
  titleGroup.className = "notification-mobile-title-group";
  type.textContent = getNotificationTypeLabel(notification.event_type);
  meta.textContent = [
    notification.guest_name || "Sem convidado",
    notification.recipient_email || "-",
  ]
    .filter(Boolean)
    .join(" · ");
  titleGroup.append(type, meta);

  side.className = "notification-mobile-side";
  date.textContent = formatDate(notification.created_at);
  recipient.textContent = getRecipientLabel(notification.recipient_type);
  side.append(date, recipient);
  main.append(titleGroup, side);

  statusBadge.className = `admin-badge ${getStatusBadgeClass(status)}`;
  statusBadge.textContent = getStatusLabel(status);

  reasonText.className =
    status === "failed" || status === "skipped"
      ? "notification-error-text"
      : "notification-mobile-reason";
  reasonText.textContent = reason;

  actions.className = "notification-mobile-actions";
  detailsButton.type = "button";
  detailsButton.className = "checklist-period-action";
  detailsButton.dataset.notificationAction = "details";
  detailsButton.dataset.notificationIndex = String(index);
  detailsButton.title = "Detalhes da notificação";
  detailsButton.setAttribute("aria-label", "Detalhes da notificação");
  detailsButton.appendChild(createNotificationIcon("eye"));
  actions.appendChild(detailsButton);

  footer.className = "notification-mobile-footer";
  footer.append(statusBadge, reasonText, actions);
  card.append(main, footer);

  return card;
}

function renderPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "-";
  }

  return JSON.stringify(payload, null, 2);
}

function renderNotificationDetails(notification) {
  const status = getNotificationStatus(notification);
  const resendAction = canResendNotification(notification)
    ? `
      <section class="admin-details-section">
        <span class="admin-details-label">Ações</span>
        <div class="gift-detail-action-groups">
          <div class="gift-detail-action-group">
            <span class="quota-action-label">Comunicação</span>
            <div class="admin-detail-action-grid">
              <button
                type="button"
                class="admin-detail-action-card"
                data-notification-action="resend"
                data-delivery-id="${escapeAttribute(notification.delivery_id)}"
              >
                <span class="admin-detail-action-icon">
                  <i data-lucide="send" aria-hidden="true"></i>
                </span>
                <span>
                  <strong>Reenviar</strong>
                  <small>Tenta processar novamente esta entrega de notificação.</small>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    `
    : "";
  const metaItems = [
    ["Status", getStatusLabel(status)],
    ["Tipo", getNotificationTypeLabel(notification.event_type)],
    ["Origem", getOriginLabel(notification.origin)],
    ["Destinatário", getRecipientLabel(notification.recipient_type)],
    ["E-mail", notification.recipient_email || "-"],
    ["Motivo", getNotificationReason(notification)],
    ["Convidado", notification.guest_name || "Sem convidado"],
    ["Criada em", formatDate(notification.created_at)],
    ["Enviada em", formatDate(notification.sent_at)],
    ["Ignorada em", formatDate(notification.skipped_at)],
    ["Falhou em", formatDate(notification.failed_at)],
    ["Processada em", formatDate(notification.processed_at)],
    ["Evento", notification.notification_event_id],
    ["Entrega", notification.delivery_id || "-"],
  ];

  notificationDetailsTitle.textContent =
    getNotificationTypeLabel(notification.event_type);

  replaceSafeContent(
    notificationDetailsContent,
    `
      <section class="admin-details-section">
        <span class="admin-details-label">Resumo</span>
        <div class="admin-details-meta-grid notification-details-meta-grid">
          ${metaItems
            .map(
              ([label, value]) => `
                <div class="admin-details-meta-item">
                  <span>${safeText(label)}</span>
                  <strong>${safeText(value)}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="admin-details-section">
        <span class="admin-details-label">Motivo</span>
        <p class="notification-error-detail">${safeText(getNotificationReason(notification))}</p>
      </section>

      ${resendAction}

      <section class="admin-details-section">
        <span class="admin-details-label">Payload</span>
        <pre class="notification-payload">${safeText(renderPayload(notification.payload))}</pre>
      </section>
    `,
  );
}

function openNotificationDetails(index) {
  const notification = cachedNotifications[Number(index)];

  if (!notification) {
    showAdminToast("⚠️ Notificação não encontrada. Atualize a lista");
    return;
  }

  selectedNotification = notification;
  renderNotificationDetails(notification);
  notificationDetailsModal.classList.add("active");
  notificationDetailsModal.setAttribute("aria-hidden", "false");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeNotificationDetails() {
  selectedNotification = null;
  notificationDetailsModal.classList.remove("active");
  notificationDetailsModal.setAttribute("aria-hidden", "true");
}

async function processManualNotificationEvent(notificationEventId) {
  const { error } = await supabaseClient.functions.invoke(
    "send-notifications",
    {
      body: {
        notification_event_id: notificationEventId,
      },
    },
  );

  if (error) {
    throw error;
  }
}

async function resendNotificationDelivery(deliveryId) {
  const notification = selectedNotification;

  if (!notification || notification.delivery_id !== deliveryId) {
    showAdminToast("⚠️ Notificação não encontrada. Atualize a lista");
    return;
  }

  const confirmed = confirm(
    `Deseja reenviar esta notificação para ${getRecipientLabel(
      notification.recipient_type,
    )}?`,
  );

  if (!confirmed) {
    return;
  }

  const { data, error } = await supabaseClient.rpc(
    "admin_resend_notification_delivery",
    {
      target_delivery_id: deliveryId,
    },
  );

  if (error || !data) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível criar o reenvio");
    return;
  }

  try {
    await processManualNotificationEvent(data);
  } catch (notificationError) {
    console.error(notificationError);
  }

  closeNotificationDetails();
  showAdminToast("💜 Reenvio enviado para processamento!");
  loadNotifications();
}

function getFilterParams() {
  const periodStart = getPeriodStart(notificationPeriodFilter.value);

  return {
    p_created_from: periodStart ? periodStart.toISOString() : null,
    p_created_to: null,
    p_event_type: notificationTypeFilter.value || null,
    p_limit: notificationsPageSize,
    p_offset: (currentPage - 1) * notificationsPageSize,
    p_origin: notificationOriginFilter.value || null,
    p_recipient_type: notificationRecipientFilter.value || null,
    p_search: notificationSearchInput.value.trim() || null,
    p_sort_direction: notificationSortState.direction,
    p_sort_key: notificationSortState.key,
    p_status: notificationStatusFilter.value || null,
  };
}

function getSummaryFilterParams() {
  const params = getFilterParams();

  delete params.p_limit;
  delete params.p_offset;
  delete params.p_sort_direction;
  delete params.p_sort_key;

  return params;
}

function setRefreshNotificationsButtonLabel(label) {
  refreshNotificationsButton.replaceChildren();

  const icon = document.createElement("i");
  const text = document.createElement("span");

  icon.setAttribute("data-lucide", "refresh-cw");
  icon.setAttribute("aria-hidden", "true");
  text.textContent = label;

  refreshNotificationsButton.append(icon, text);
  window.lucide?.createIcons();
}

async function loadNotifications() {
  refreshNotificationsButton.disabled = true;
  setRefreshNotificationsButtonLabel("Atualizando...");

  const [notificationsResult, summaryResult] = await Promise.all([
    supabaseClient.rpc("admin_list_notification_deliveries", getFilterParams()),
    supabaseClient
      .rpc("admin_get_notification_delivery_summary", getSummaryFilterParams())
      .maybeSingle(),
  ]);

  refreshNotificationsButton.disabled = false;
  setRefreshNotificationsButtonLabel("Atualizar");

  const error = notificationsResult.error || summaryResult.error;

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível carregar as notificações");
    return;
  }

  cachedNotifications = notificationsResult.data || [];
  totalNotifications = Number(summaryResult.data?.total_count || 0);
  notificationFilterCount.textContent = `${totalNotifications} registro${
    totalNotifications === 1 ? "" : "s"
  }`;
  if (notificationFiltersPanel) {
    notificationFiltersPanel.dataset.hasActiveFilters = String(
      hasActiveNotificationFilters(),
    );
  }
  updateSummary(summaryResult.data);
  updatePagination();
  updateSummaryCardState();
  renderNotificationsTable(cachedNotifications);
}

function reloadFirstPage() {
  currentPage = 1;
  loadNotifications();
}

function clearNotificationFilters() {
  notificationSearchInput.value = "";
  notificationStatusFilter.value = "";
  notificationTypeFilter.value = "";
  notificationOriginFilter.value = "";
  notificationRecipientFilter.value = "";
  notificationPeriodFilter.value = "";
  reloadFirstPage();
}

[
  notificationStatusFilter,
  notificationTypeFilter,
  notificationOriginFilter,
  notificationRecipientFilter,
  notificationPeriodFilter,
].forEach((filter) => {
  filter.addEventListener("change", reloadFirstPage);
});

notificationSearchInput.addEventListener("input", () => {
  clearTimeout(notificationSearchTimer);
  notificationSearchTimer = setTimeout(reloadFirstPage, 350);
});

document.querySelectorAll("[data-notification-sort]").forEach((button) => {
  button.addEventListener("click", () => {
    setNotificationSort(button.dataset.notificationSort);
  });
});

notificationSummaryCards.forEach((card) => {
  function applySummaryFilter(event) {
    if (event.target.closest(".metric-help")) {
      return;
    }

    const nextStatus = card.dataset.notificationSummaryStatus || "";
    notificationStatusFilter.value =
      notificationStatusFilter.value === nextStatus ? "" : nextStatus;
    reloadFirstPage();
  }

  card.addEventListener("click", applySummaryFilter);

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    applySummaryFilter(event);
  });
});

clearNotificationFiltersButton.addEventListener("click", clearNotificationFilters);
refreshNotificationsButton.addEventListener("click", () => loadNotifications());
previousNotificationsPageButton.addEventListener("click", () => {
  if (currentPage <= 1) {
    return;
  }

  currentPage -= 1;
  loadNotifications();
});
nextNotificationsPageButton.addEventListener("click", () => {
  if (currentPage * notificationsPageSize >= totalNotifications) {
    return;
  }

  currentPage += 1;
  loadNotifications();
});
closeNotificationDetailsModalButton.addEventListener(
  "click",
  closeNotificationDetails,
);

notificationsTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-notification-action]");

  if (button) {
    if (button.dataset.notificationAction === "details") {
      openNotificationDetails(button.dataset.notificationIndex);
    }

    return;
  }

  const row = event.target.closest("[data-notification-index]");

  if (row) {
    openNotificationDetails(row.dataset.notificationIndex);
  }
});

notificationsTableBody.addEventListener("keydown", (event) => {
  if (event.target.closest("[data-notification-action]")) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const row = event.target.closest("[data-notification-index]");

  if (row) {
    event.preventDefault();
    openNotificationDetails(row.dataset.notificationIndex);
  }
});

notificationsMobileList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-notification-action]");

  if (button) {
    if (button.dataset.notificationAction === "details") {
      openNotificationDetails(button.dataset.notificationIndex);
    }

    return;
  }

  const card = event.target.closest("[data-notification-index]");

  if (card) {
    openNotificationDetails(card.dataset.notificationIndex);
  }
});

notificationsMobileList?.addEventListener("keydown", (event) => {
  if (event.target.closest("[data-notification-action]")) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const card = event.target.closest("[data-notification-index]");

  if (card) {
    event.preventDefault();
    openNotificationDetails(card.dataset.notificationIndex);
  }
});

notificationDetailsContent.addEventListener("click", (event) => {
  const button = event.target.closest("[data-notification-action]");

  if (!button) {
    return;
  }

  if (button.dataset.notificationAction === "resend") {
    resendNotificationDelivery(button.dataset.deliveryId);
  }
});

notificationDetailsModal.addEventListener("click", (event) => {
  if (event.target === notificationDetailsModal) {
    closeNotificationDetails();
  }
});

applyNotificationFiltersFromUrl();
loadNotifications();
