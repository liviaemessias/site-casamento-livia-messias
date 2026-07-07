AdminCommon.setupLogout();

function setElementVisibility(element, visible) {
  if (!element) return;
  element.hidden = !visible;
  element.classList.toggle("is-hidden", !visible);
}

let editingGift = null;
let currentExternalOptions = [];
let previousPurchaseMode = "money";
let editingExternalOptionIndex = null;
let cachedGifts = [];
let cachedGiftGuests = [];
let visibleGifts = [];
let giftSortState = {
  key: "category",
  direction: "asc",
};

const giftsTableBody = document.getElementById("giftsTableBody");
const giftSearchInput = document.getElementById("giftSearchInput");
const giftStatusFilter = document.getElementById("giftStatusFilter");
const giftTypeFilter = document.getElementById("giftTypeFilter");
const giftPaymentFilter = document.getElementById("giftPaymentFilter");
const giftQuotaFilter = document.getElementById("giftQuotaFilter");
const giftMethodFilter = document.getElementById("giftMethodFilter");
const giftFilterCount = document.getElementById("giftFilterCount");
const exportGiftsButton = document.getElementById("exportGiftsButton");
const clearGiftFiltersButton = document.getElementById("clearGiftFiltersButton");
const giftModal = document.getElementById("giftModal");
const giftDetailsModal = document.getElementById("giftDetailsModal");
const closeGiftDetailsModalButton = document.getElementById(
  "closeGiftDetailsModalButton",
);
const giftDetailsTitle = document.getElementById("giftDetailsTitle");
const giftDetailsContent = document.getElementById("giftDetailsContent");
const openGiftModalButton = document.getElementById("openGiftModalButton");
const closeGiftModalButton = document.getElementById("closeGiftModalButton");
const giftForm = document.getElementById("giftForm");
const giftModalTitle = document.getElementById("giftModalTitle");
const giftExternalOptionsSection = document.getElementById(
  "giftExternalOptionsSection",
);
const giftExternalOptionsList = document.getElementById(
  "giftExternalOptionsList",
);
const addExternalOptionButton = document.getElementById(
  "addExternalOptionButton",
);
const giftPurchaseModeInput = document.getElementById("giftPurchaseModeInput");
const giftTypeInput = document.getElementById("giftTypeInput");
const giftQuotaSection = document.getElementById("giftQuotaSection");
const giftQuotaCountInput = document.getElementById("giftQuotaCountInput");
const giftQuotaValueInput = document.getElementById("giftQuotaValueInput");
const externalOptionModal = document.getElementById("externalOptionModal");
const closeExternalOptionModalButton = document.getElementById(
  "closeExternalOptionModalButton",
);
const externalOptionForm = document.getElementById("externalOptionForm");
const externalOptionModalTitle = document.getElementById(
  "externalOptionModalTitle",
);
const externalOptionTypeInput = document.getElementById(
  "externalOptionTypeInput",
);
const externalOptionStoreInput = document.getElementById(
  "externalOptionStoreInput",
);
const externalOptionUrlGroup = document.getElementById(
  "externalOptionUrlGroup",
);
const externalOptionUrlInput = document.getElementById(
  "externalOptionUrlInput",
);
const externalOptionNotesInput = document.getElementById(
  "externalOptionNotesInput",
);
const { formatDate } = AdminCommon;
const showAdminToast = AdminCommon.showToast;
const { escapeAttribute, replaceSafeContent, safeText } = SecurityUtils;

function getAdminPageParams() {
  return new URLSearchParams(window.location.search);
}

function setFilterValueFromParam(element, params, name) {
  if (!element || !params.has(name)) {
    return;
  }

  element.value = params.get(name) || "";
}

function applyGiftFiltersFromUrl() {
  const params = getAdminPageParams();

  setFilterValueFromParam(giftSearchInput, params, "search");
  setFilterValueFromParam(giftStatusFilter, params, "status");
  setFilterValueFromParam(giftTypeFilter, params, "type");
  setFilterValueFromParam(giftPaymentFilter, params, "payment");
  setFilterValueFromParam(giftQuotaFilter, params, "quota");
  setFilterValueFromParam(giftMethodFilter, params, "method");
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function compareValues(a, b) {
  if (typeof a === "number" || typeof b === "number") {
    return Number(a || 0) - Number(b || 0);
  }

  return String(a || "").localeCompare(String(b || ""), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
}

function renderStatusBadge(status) {
  if (status === "Disponível") {
    return `<span class="admin-badge badge-available">Disponível</span>`;
  }

  if (status === "Reservado") {
    return `<span class="admin-badge badge-reserved">Reservado</span>`;
  }

  if (status === "Parcial") {
    return `<span class="admin-badge badge-partial">Parcial</span>`;
  }

  if (status === "Comprado") {
    return `<span class="admin-badge badge-bought">Comprado</span>`;
  }

  return `<span class="admin-badge badge-muted">${safeText(status)}</span>`;
}

function renderPaymentBadge(status) {
  if (status === "Confirmado") {
    return `<span class="admin-badge badge-bought">Confirmado</span>`;
  }

  if (status === "Informado") {
    return `<span class="admin-badge badge-payment">Informado</span>`;
  }

  if (status === "Parcialmente informado") {
    return `<span class="admin-badge badge-payment">Parcialmente informado</span>`;
  }

  if (status === "Parcialmente confirmado") {
    return `<span class="admin-badge badge-partial">Parcialmente confirmado</span>`;
  }

  if (status === "Pendente") {
    return `<span class="admin-badge badge-muted">Pendente</span>`;
  }

  return `<span class="admin-badge badge-muted">-</span>`;
}

function isQuotaGift(gift) {
  return gift.gift_type === "quota";
}

function getQuotaValue(gift) {
  const quotaValue = Number(gift.quota_value || 0);

  if (quotaValue > 0) {
    return quotaValue;
  }

  const quotaCount = Number(gift.quota_count || 0);
  const price = Number(gift.price || 0);

  return quotaCount > 0 ? price / quotaCount : 0;
}

function getGiftTypeLabel(gift) {
  return isQuotaGift(gift) ? "Por cotas" : "Individual";
}

function getGiftDisplayStatus(gift) {
  if (!isQuotaGift(gift)) {
    return gift.status;
  }

  const total = Number(gift.quota_count || 0);
  const reserved = Number(gift.quota_reserved_count || 0);
  const confirmed = Number(gift.quota_confirmed_count || 0);

  if (total > 0 && confirmed >= total) {
    return "Comprado";
  }

  if (total > 0 && reserved >= total) {
    return "Reservado";
  }

  if (reserved > 0) {
    return "Parcial";
  }

  return "Disponível";
}

function getGiftDisplayPaymentStatus(gift) {
  if (!isQuotaGift(gift)) {
    return gift.payment_status;
  }

  const contributions = gift.quota_contributions || [];

  if (!contributions.length) {
    return null;
  }

  const total = Number(gift.quota_count || 0);
  const confirmed = contributions
    .filter((contribution) => contribution.payment_status === "Confirmado")
    .reduce(
      (sum, contribution) => sum + Number(contribution.quota_quantity || 0),
      0,
    );
  const informed = contributions
    .filter((contribution) => contribution.payment_status === "Informado")
    .reduce(
      (sum, contribution) => sum + Number(contribution.quota_quantity || 0),
      0,
    );

  if (total > 0 && confirmed >= total) {
    return "Confirmado";
  }

  if (confirmed > 0) {
    return "Parcialmente confirmado";
  }

  if (informed > 0) {
    return "Parcialmente informado";
  }

  return "Pendente";
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getGiftGuestMap() {
  return cachedGiftGuests.reduce((map, guest) => {
    map[guest.id] = guest.name;
    return map;
  }, {});
}

function getGiftReservedNames(gift, guestMap) {
  if (isQuotaGift(gift)) {
    return (gift.quota_contributions || [])
      .map(
        (contribution) =>
          guestMap[contribution.guest_id] ||
          contribution.contributor_name ||
          "Convidado nao encontrado",
      )
      .filter(Boolean)
      .join("; ");
  }

  if (!gift.reserved_guest_id) {
    return "";
  }

  return (
    guestMap[gift.reserved_guest_id] ||
    gift.reserved_name ||
    "Convidado nao encontrado"
  );
}

function getGiftMethodLabel(gift) {
  const method = isQuotaGift(gift) ? "pix" : gift.selected_purchase_method;
  const labels = {
    card: "Cartao",
    online: "Compra online",
    physical: "Loja fisica",
    pix: "PIX",
  };

  return labels[method] || "";
}

function formatGiftContributions(gift, guestMap) {
  return (gift.quota_contributions || [])
    .map((contribution) => {
      const name =
        guestMap[contribution.guest_id] ||
        contribution.contributor_name ||
        "Convidado nao encontrado";
      const quantity = Number(contribution.quota_quantity || 0);
      const value = Number(contribution.total_value || 0);

      return `${name}: ${quantity} cota${quantity === 1 ? "" : "s"} (${formatCurrency(value)}) - ${contribution.payment_status || "Pendente"}`;
    })
    .join("; ");
}

function matchesPaymentFilter(gift, paymentFilter) {
  if (!paymentFilter) {
    return true;
  }

  const displayPaymentStatus = getGiftDisplayPaymentStatus(gift);

  if (paymentFilter === "sem_status") {
    return !displayPaymentStatus;
  }

  if (!isQuotaGift(gift)) {
    return displayPaymentStatus === paymentFilter;
  }

  const contributions = gift.quota_contributions || [];

  if (paymentFilter === "Informado") {
    return contributions.some(
      (contribution) => contribution.payment_status === "Informado",
    );
  }

  if (paymentFilter === "Pendente") {
    return contributions.some(
      (contribution) =>
        !contribution.payment_status ||
        contribution.payment_status === "Pendente",
    );
  }

  if (paymentFilter === "Confirmado") {
    return contributions.some(
      (contribution) => contribution.payment_status === "Confirmado",
    );
  }

  return displayPaymentStatus === paymentFilter;
}

function getQuotaFilterState(gift) {
  if (!isQuotaGift(gift)) {
    return "not_quota";
  }

  const total = Number(gift.quota_count || 0);
  const reserved = Number(gift.quota_reserved_count || 0);
  const confirmed = Number(gift.quota_confirmed_count || 0);
  const available = Math.max(0, total - reserved);

  if (total > 0 && confirmed >= total) {
    return "fully_confirmed";
  }

  if (confirmed > 0) {
    return "partially_confirmed";
  }

  if (total > 0 && reserved >= total) {
    return "fully_reserved";
  }

  if (reserved > 0) {
    return "partially_reserved";
  }

  if (available > 0) {
    return "available";
  }

  return "available";
}

function matchesQuotaFilter(gift, quotaFilter) {
  if (!quotaFilter) {
    return true;
  }

  if (quotaFilter === "not_quota") {
    return !isQuotaGift(gift);
  }

  if (!isQuotaGift(gift)) {
    return false;
  }

  const total = Number(gift.quota_count || 0);
  const reserved = Number(gift.quota_reserved_count || 0);
  const confirmed = Number(gift.quota_confirmed_count || 0);
  const available = Math.max(0, total - reserved);

  if (quotaFilter === "available") {
    return available > 0;
  }

  if (quotaFilter === "partially_reserved") {
    return reserved > 0 && reserved < total;
  }

  if (quotaFilter === "fully_reserved") {
    return total > 0 && reserved >= total && confirmed < total;
  }

  if (quotaFilter === "partially_confirmed") {
    return confirmed > 0 && confirmed < total;
  }

  if (quotaFilter === "fully_confirmed") {
    return total > 0 && confirmed >= total;
  }

  return getQuotaFilterState(gift) === quotaFilter;
}

function renderQuotaProgress(gift) {
  const total = Number(gift.quota_count || 0);

  if (!isQuotaGift(gift) || !total) {
    return "";
  }

  const reserved = Number(gift.quota_reserved_count || 0);
  const confirmed = Number(gift.quota_confirmed_count || 0);

  return `
    <div class="quota-admin-summary">
      <strong>${reserved}/${total} cotas reservadas</strong>
      <span>${confirmed}/${total} cotas confirmadas</span>
      <span>R$ ${getQuotaValue(gift).toFixed(2)} por cota</span>
    </div>
  `;
}

function renderQuotaContributors(gift, guestMap) {
  const contributions = gift.quota_contributions || [];

  if (!contributions.length) {
    return `<span class="admin-muted">-</span>`;
  }

  return `
    <div class="quota-contributor-list">
      ${contributions
        .map((contribution) => {
          const guestName =
            guestMap[contribution.guest_id] ||
            contribution.contributor_name ||
            "Convidado não encontrado";
          const quantity = Number(contribution.quota_quantity || 0);

          return `
            <div class="quota-contributor-item">
              <strong>${safeText(guestName)}</strong>
              <span>
                ${quantity} cota${quantity === 1 ? "" : "s"} · ${safeText(contribution.payment_status, "Pendente")}
              </span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderPurchaseMethodBadge(gift) {
  if (isQuotaGift(gift)) {
    return `
      <span class="admin-badge badge-payment">
        PIX por cotas
      </span>
    `;
  }

  const method = gift.selected_purchase_method;
  const store = gift.selected_purchase_details?.store;

  let label = "-";

  if (method === "pix") {
    label = "PIX";
  }

  if (method === "card") {
    label = "Cartão";
  }

  if (method === "online") {
    label = store ? `Compra Online · ${store}` : "Compra Online";
  }

  if (method === "physical") {
    label = store ? `Loja Física · ${store}` : "Loja Física";
  }

  return `
    <span class="admin-badge ${method ? "badge-payment" : "badge-muted"}">
      ${safeText(label)}
    </span>
  `;
}

function renderSituationCell(gift) {
  return `
    <div class="gift-situation-stack">
      ${renderStatusBadge(getGiftDisplayStatus(gift))}
      ${renderPurchaseMethodBadge(gift)}
      ${renderPaymentBadge(getGiftDisplayPaymentStatus(gift))}
    </div>
  `;
}

function renderGiftDetailsMessage(gift) {
  if (isQuotaGift(gift)) {
    const contributions = gift.quota_contributions || [];
    const messages = contributions.filter((contribution) =>
      Boolean(contribution.message),
    );

    if (!messages.length) {
      return `<p class="admin-muted">Nenhuma mensagem registrada.</p>`;
    }

    return `
      <div class="admin-details-list">
        ${messages
          .map(
            (contribution) => `
              <div class="admin-details-item">
                <div>
                  <strong>${safeText(contribution.contributor_name, "Convidado")}</strong>
                  <p>${safeText(contribution.message, "")}</p>
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }

  if (!gift.reservation_message) {
    return `<p class="admin-muted">Nenhuma mensagem registrada.</p>`;
  }

  return `<p>${safeText(gift.reservation_message, "")}</p>`;
}

function renderGiftDetailsContributionSummary(gift) {
  if (!isQuotaGift(gift)) {
    return "";
  }

  const contributions = gift.quota_contributions || [];

  if (!contributions.length) {
    return `<p class="admin-muted">Nenhuma contribuição registrada.</p>`;
  }

  return `
    <div class="admin-details-list">
      ${contributions
        .map(
          (contribution) => `
            <div class="admin-details-item">
              <div>
                <strong>${safeText(contribution.contributor_name, "Convidado")}</strong>
                <span>
                  ${contribution.quota_quantity || 0} cota${Number(contribution.quota_quantity || 0) === 1 ? "" : "s"}
                  · R$ ${Number(contribution.total_value || 0).toFixed(2)}
                  · ${safeText(contribution.payment_status, "Pendente")}
                </span>
              </div>

              ${
                contribution.payment_status !== "Confirmado"
                  ? `
                    <div class="admin-details-inline-actions">
                      <button
                        class="admin-action-button success"
                        data-gift-detail-action="confirm-contribution"
                        data-contribution-id="${escapeAttribute(contribution.id)}"
                      >
                        ✓ Confirmar
                      </button>

                      <button
                        class="admin-action-button warning"
                        data-gift-detail-action="release-contribution"
                        data-contribution-id="${escapeAttribute(contribution.id)}"
                      >
                        ↺ Liberar
                      </button>
                    </div>
                  `
                  : `
                    <span class="quota-action-confirmed">
                      Compra confirmada
                    </span>
                  `
              }
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderGiftDetailsActions(gift) {
  const actions = [];

  if (!isQuotaGift(gift) && gift.status === "Reservado") {
    actions.push(`
      <button
        class="admin-detail-action-card success"
        data-gift-detail-action="confirm"
        data-gift-id="${escapeAttribute(gift.id)}"
      >
        <span class="admin-detail-action-icon">✓</span>
        <span>
          <strong>Confirmar compra</strong>
          <small>Marca o presente como comprado e confirma o pagamento.</small>
        </span>
      </button>
    `);
  }

  actions.push(`
    <button
      class="admin-detail-action-card"
      data-gift-detail-action="edit"
      data-gift-id="${escapeAttribute(gift.id)}"
    >
      <span class="admin-detail-action-icon">✎</span>
      <span>
        <strong>Editar presente</strong>
        <small>Altera categoria, valor, cotas, imagem e formas de compra.</small>
      </span>
    </button>
  `);

  if (!isQuotaGift(gift) && gift.status === "Reservado") {
    actions.push(`
      <button
        class="admin-detail-action-card warning"
        data-gift-detail-action="release"
        data-gift-id="${escapeAttribute(gift.id)}"
      >
        <span class="admin-detail-action-icon">↺</span>
        <span>
          <strong>Liberar reserva</strong>
          <small>Remove a reserva atual e deixa o presente disponível novamente.</small>
        </span>
      </button>
    `);
  }

  actions.push(`
    <button
      class="admin-detail-action-card danger"
      data-gift-detail-action="delete"
      data-gift-id="${escapeAttribute(gift.id)}"
    >
      <span class="admin-detail-action-icon">×</span>
      <span>
        <strong>Excluir presente</strong>
        <small>Remove o presente da lista. Esta ação precisa de confirmação.</small>
      </span>
    </button>
  `);

  return `
    <div class="admin-detail-action-grid">
      ${actions.join("")}
    </div>
  `;
}

window.openGiftDetailsModal = function (gift) {
  giftDetailsTitle.textContent = gift.name || "Detalhes do Presente";

  replaceSafeContent(giftDetailsContent, `
    <section class="admin-details-section">
      <span class="admin-details-label">Situação</span>
      ${renderSituationCell(gift)}
    </section>

    ${
      isQuotaGift(gift)
        ? `
          <section class="admin-details-section">
            <span class="admin-details-label">Contribuições</span>
            ${renderGiftDetailsContributionSummary(gift)}
          </section>
        `
        : ""
    }

    <section class="admin-details-section">
      <span class="admin-details-label">Ações</span>
      ${renderGiftDetailsActions(gift)}
    </section>

    <section class="admin-details-section">
      <span class="admin-details-label">Mensagem</span>
      ${renderGiftDetailsMessage(gift)}
    </section>
  `);

  giftDetailsModal.classList.add("active");
};

window.closeGiftDetailsModal = function () {
  giftDetailsModal.classList.remove("active");
};

async function loadGiftsAdmin() {
  const { data: guests, error: guestsError } = await supabaseClient
    .from("guests")
    .select("id, name");

  const { data: gifts, error: giftsError } = await supabaseClient
    .from("gifts")
    .select("*")
    .order("category");

  const { data: contributions, error: contributionsError } = await supabaseClient
    .from("gift_contributions")
    .select(
      "id, gift_id, guest_id, contributor_name, message, quota_quantity, quota_value, total_value, payment_status, payment_reported_at, created_at",
    );

  if (guestsError || giftsError) {
    console.error(guestsError || giftsError);
    showAdminToast("⚠️ Erro ao carregar presentes.");
    return;
  }

  if (contributionsError) {
    console.error(contributionsError);
    showAdminToast("⚠️ Presentes carregados, mas as cotas não puderam ser lidas.");
  }

  cachedGifts = withGiftContributionStats(gifts || [], contributions || []);
  cachedGiftGuests = guests || [];
  applyGiftFilters();
}

function withGiftContributionStats(gifts, contributions) {
  const statsByGift = contributions.reduce((stats, contribution) => {
    const giftStats = stats[contribution.gift_id] || {
      reserved: 0,
      confirmed: 0,
      amount: 0,
      contributions: [],
    };
    const quantity = Number(contribution.quota_quantity || 0);

    giftStats.reserved += quantity;
    giftStats.amount += Number(contribution.total_value || 0);
    giftStats.contributions.push(contribution);

    if (contribution.payment_status === "Confirmado") {
      giftStats.confirmed += quantity;
    }

    stats[contribution.gift_id] = giftStats;

    return stats;
  }, {});

  return gifts.map((gift) => {
    const stats = statsByGift[gift.id] || {};

    return {
      ...gift,
      quota_reserved_count: stats.reserved || 0,
      quota_confirmed_count: stats.confirmed || 0,
      quota_reserved_amount: stats.amount || 0,
      quota_contributions: stats.contributions || [],
    };
  });
}

function renderGiftsTable(gifts, guests) {
  const guestMap = {};

  guests.forEach((guest) => {
    guestMap[guest.id] = guest.name;
  });

  if (!gifts.length) {
    replaceSafeContent(giftsTableBody, `
      <tr>
        <td colspan="8" class="admin-empty-state">
          Nenhum presente encontrado para os filtros selecionados.
        </td>
      </tr>
    `);
    return;
  }

  replaceSafeContent(giftsTableBody, gifts
    .map((gift) => {
      const guestName = gift.reserved_guest_id
        ? guestMap[gift.reserved_guest_id] ||
          gift.reserved_name ||
          "Convidado não encontrado"
        : "-";
      const guestCell = isQuotaGift(gift)
        ? renderQuotaContributors(gift, guestMap)
        : guestName;

      return `
        <tr>
          <td>${safeText(gift.name)}</td>
          <td>${safeText(gift.category)}</td>
          <td>${getGiftTypeLabel(gift)}</td>
          <td>${isQuotaGift(gift) ? renderQuotaProgress(gift) : `<span class="admin-muted">-</span>`}</td>
          <td>${isQuotaGift(gift) ? guestCell : safeText(guestCell)}</td>
          <td>${renderSituationCell(gift)}</td>
          <td>${formatDate(gift.reserved_at)}</td>
          <td>${renderGiftActions(gift)}</td>
        </tr>
      `;
    })
    .join(""));
}

function applyGiftFilters() {
  const guestMap = {};

  cachedGiftGuests.forEach((guest) => {
    guestMap[guest.id] = guest.name;
  });

  const search = normalizeText(giftSearchInput?.value);
  const status = giftStatusFilter?.value || "";
  const type = giftTypeFilter?.value || "";
  const payment = giftPaymentFilter?.value || "";
  const quota = giftQuotaFilter?.value || "";
  const method = giftMethodFilter?.value || "";

  const filteredGifts = cachedGifts.filter((gift) => {
    const guestName = gift.reserved_guest_id
      ? guestMap[gift.reserved_guest_id] || gift.reserved_name || ""
      : "";
    const quotaContributorNames = (gift.quota_contributions || [])
      .map(
        (contribution) =>
          guestMap[contribution.guest_id] || contribution.contributor_name || "",
      )
      .join(" ");
    const quotaSearchable = (gift.quota_contributions || [])
      .map((contribution) =>
        [
          contribution.contributor_name,
          contribution.message,
          contribution.payment_status,
          `${contribution.quota_quantity || 0} cotas`,
          `${contribution.total_value || 0}`,
        ].join(" "),
      )
      .join(" ");

    const searchable = normalizeText(
      [
        gift.name,
        gift.category,
        gift.description,
        getGiftTypeLabel(gift),
        gift.reserved_name,
        guestName,
        quotaContributorNames,
        quotaSearchable,
        getGiftDisplayStatus(gift),
        getGiftDisplayPaymentStatus(gift),
        gift.reservation_message,
      ].join(" "),
    );

    const matchesSearch = !search || searchable.includes(search);
    const matchesType =
      !type ||
      (type === "quota" ? isQuotaGift(gift) : !isQuotaGift(gift));
    const hasAvailableQuota =
      isQuotaGift(gift) &&
      Number(gift.quota_count || 0) >
        Number(gift.quota_reserved_count || 0);
    const displayStatus = getGiftDisplayStatus(gift);
    const matchesStatus =
      !status ||
      displayStatus === status ||
      (status === "Disponível" && hasAvailableQuota) ||
      (status === "Reservado" && displayStatus === "Parcial");
    const matchesPayment = matchesPaymentFilter(gift, payment);
    const giftMethod = isQuotaGift(gift)
      ? "pix"
      : gift.selected_purchase_method;
    const matchesMethod =
      !method ||
      (method === "sem_metodo"
        ? !giftMethod
        : giftMethod === method);
    const matchesQuota = matchesQuotaFilter(gift, quota);

    return (
      matchesSearch &&
      matchesType &&
      matchesStatus &&
      matchesPayment &&
      matchesMethod &&
      matchesQuota
    );
  });

  const sortedGifts = sortGifts(filteredGifts, guestMap);
  visibleGifts = sortedGifts;

  updateGiftFilterCount(sortedGifts.length);
  updateGiftSortButtons();
  renderGiftsTable(sortedGifts, cachedGiftGuests);
}

function getGiftSortValue(gift, guestMap) {
  if (giftSortState.key === "guest") {
    if (isQuotaGift(gift)) {
      return (gift.quota_contributions || [])
        .map(
          (contribution) =>
            guestMap[contribution.guest_id] ||
            contribution.contributor_name ||
            "",
        )
        .join(" ");
    }

    return gift.reserved_guest_id
      ? guestMap[gift.reserved_guest_id] || gift.reserved_name || ""
      : "";
  }

  const sortValues = {
    category: gift.category,
    method: isQuotaGift(gift) ? "pix" : gift.selected_purchase_method,
    name: gift.name,
    payment: getGiftDisplayPaymentStatus(gift),
    reserved: gift.reserved_at ? new Date(gift.reserved_at).getTime() : 0,
    status: getGiftDisplayStatus(gift),
    type: getGiftTypeLabel(gift),
  };

  return sortValues[giftSortState.key] ?? "";
}

function sortGifts(gifts, guestMap) {
  return [...gifts].sort((a, b) => {
    const result = compareValues(
      getGiftSortValue(a, guestMap),
      getGiftSortValue(b, guestMap),
    );

    return giftSortState.direction === "asc" ? result : -result;
  });
}

function updateGiftSortButtons() {
  document.querySelectorAll("[data-gift-sort]").forEach((button) => {
    button.classList.remove("sorted-asc", "sorted-desc");

    if (button.dataset.giftSort === giftSortState.key) {
      button.classList.add(`sorted-${giftSortState.direction}`);
    }
  });
}

function setGiftSort(key) {
  if (giftSortState.key === key) {
    giftSortState.direction =
      giftSortState.direction === "asc" ? "desc" : "asc";
  } else {
    giftSortState = {
      key,
      direction: "asc",
    };
  }

  applyGiftFilters();
}

function updateGiftFilterCount(count) {
  if (!giftFilterCount) {
    return;
  }

  const total = cachedGifts.length;
  giftFilterCount.textContent =
    count === total
      ? `${total} presente${total === 1 ? "" : "s"}`
      : `${count} de ${total} presente${total === 1 ? "" : "s"}`;
}

function findCachedGiftById(giftId) {
  return cachedGifts.find((gift) => gift.id === giftId);
}

function handleGiftAction(action, giftId) {
  const gift = giftId ? findCachedGiftById(giftId) : null;

  if ((action === "details" || action === "edit" || action === "delete") && !gift) {
    showAdminToast("⚠️ Presente não encontrado. Atualize a lista e tente novamente.");
    return;
  }

  if (action === "details") {
    openGiftDetailsModal(gift);
    return;
  }

  if (action === "edit") {
    closeGiftDetailsModal();
    openEditGiftModal(gift);
    return;
  }

  if (action === "confirm") {
    markGiftAsBought(giftId);
    return;
  }

  if (action === "release") {
    releaseGiftReservation(giftId);
    return;
  }

  if (action === "delete") {
    deleteGift(gift);
  }
}

function exportGiftsCSV() {
  if (!visibleGifts.length) {
    showAdminToast("Nenhum presente para exportar.");
    return;
  }

  const guestMap = getGiftGuestMap();

  AdminExport.downloadCSV("presentes", [
    { label: "Presente", value: "name" },
    { label: "Categoria", value: "category" },
    { label: "Tipo", value: getGiftTypeLabel },
    { label: "Valor", value: (gift) => formatCurrency(gift.price) },
    { label: "Status", value: getGiftDisplayStatus },
    { label: "Pagamento", value: (gift) => getGiftDisplayPaymentStatus(gift) || "" },
    { label: "Forma", value: getGiftMethodLabel },
    { label: "Reservado por", value: (gift) => getGiftReservedNames(gift, guestMap) },
    { label: "Reservado em", value: (gift) => formatDate(gift.reserved_at) },
    { label: "Total de cotas", value: (gift) => Number(gift.quota_count || 0) },
    { label: "Cotas reservadas", value: (gift) => Number(gift.quota_reserved_count || 0) },
    { label: "Cotas confirmadas", value: (gift) => Number(gift.quota_confirmed_count || 0) },
    { label: "Valor por cota", value: (gift) => formatCurrency(getQuotaValue(gift)) },
    { label: "Contribuicoes", value: (gift) => formatGiftContributions(gift, guestMap) },
    { label: "Mensagem", value: "reservation_message" },
  ], visibleGifts);

  showAdminToast("CSV de presentes exportado.");
}

function clearGiftFilters() {
  if (giftSearchInput) {
    giftSearchInput.value = "";
  }

  [
    giftStatusFilter,
    giftTypeFilter,
    giftPaymentFilter,
    giftQuotaFilter,
    giftMethodFilter,
  ].forEach((filter) => {
    if (filter) {
      filter.value = "";
    }
  });

  applyGiftFilters();
}

function renderGiftActions(gift) {
  if (isQuotaGift(gift)) {
    return `
      <div class="admin-actions compact-actions">
        <button
          class="admin-action-button icon-action"
          data-gift-action="details"
          data-gift-id="${escapeAttribute(gift.id)}"
          title="Ver detalhes"
        >
          👁 Detalhes
        </button>

        <button
          class="admin-action-button icon-action"
          data-gift-action="edit"
          data-gift-id="${escapeAttribute(gift.id)}"
          title="Editar presente"
        >
          ✎ Editar
        </button>
      </div>
    `;
  }

  if (!isQuotaGift(gift) && gift.status === "Reservado") {
    return `
      <div class="admin-actions compact-actions">
        <button
          class="admin-action-button success icon-action"
          data-gift-action="confirm"
          data-gift-id="${escapeAttribute(gift.id)}"
          title="Confirmar compra"
        >
          ✓ Confirmar
        </button>

        <button
          class="admin-action-button icon-action"
          data-gift-action="details"
          data-gift-id="${escapeAttribute(gift.id)}"
          title="Ver detalhes"
        >
          👁 Detalhes
        </button>

        <button
          class="admin-action-button icon-action"
          data-gift-action="edit"
          data-gift-id="${escapeAttribute(gift.id)}"
          title="Editar presente"
        >
          ✎ Editar
        </button>
      </div>
    `;
  }

  return `
    <div class="admin-actions compact-actions">
      <button
        class="admin-action-button icon-action"
        data-gift-action="details"
        data-gift-id="${escapeAttribute(gift.id)}"
        title="Ver detalhes"
      >
        👁 Detalhes
      </button>

      <button
        class="admin-action-button icon-action"
        data-gift-action="edit"
        data-gift-id="${escapeAttribute(gift.id)}"
        title="Editar presente"
      >
        ✎ Editar
      </button>
    </div>
  `;
}

window.markGiftAsBought = async function (giftId) {
  const confirmed = confirm("Confirmar que este presente foi comprado?");

  if (!confirmed) {
    return;
  }

  const { data, error } = await supabaseClient.rpc(
    "admin_confirm_gift_purchase",
    {
      target_gift_id: giftId,
    },
  );

  if (error || data !== true) {
    console.error(error);
    showAdminToast(
      "⚠️ Não foi possível confirmar a compra. Atualize a lista e tente novamente.",
    );
    return;
  }

  closeGiftDetailsModal();
  showAdminToast("💜 Presente marcado como comprado!");
  await loadGiftsAdmin();
};

window.releaseGiftReservation = async function (giftId) {
  const confirmed = confirm(
    "Deseja liberar esta reserva? O presente voltará a ficar disponível.",
  );

  if (!confirmed) {
    return;
  }

  const { data, error } = await supabaseClient.rpc(
    "admin_release_gift_reservation",
    {
      target_gift_id: giftId,
    },
  );

  if (error || data !== true) {
    console.error(error);
    showAdminToast(
      "⚠️ Não foi possível liberar a reserva. Atualize a lista e tente novamente.",
    );
    return;
  }

  closeGiftDetailsModal();
  showAdminToast("💜 Reserva liberada com sucesso!");
  await loadGiftsAdmin();
};

window.markQuotaContributionAsBought = async function (contributionId) {
  const confirmed = confirm("Confirmar esta contribuição como comprada?");

  if (!confirmed) {
    return;
  }

  const { data, error } = await supabaseClient.rpc(
    "admin_confirm_gift_contribution",
    {
      target_contribution_id: contributionId,
    },
  );

  if (error || data !== true) {
    console.error(error);
    showAdminToast(
      "⚠️ Não foi possível confirmar a contribuição. Atualize a lista e tente novamente.",
    );
    return;
  }

  closeGiftDetailsModal();
  showAdminToast("💜 Contribuição confirmada!");
  await loadGiftsAdmin();
};

window.releaseQuotaContribution = async function (contributionId) {
  const confirmed = confirm(
    "Deseja liberar esta reserva de cota? Apenas esta contribuição será removida.",
  );

  if (!confirmed) {
    return;
  }

  const { data, error } = await supabaseClient.rpc(
    "admin_release_gift_contribution",
    {
      target_contribution_id: contributionId,
    },
  );

  if (error || data !== true) {
    console.error(error);
    showAdminToast(
      "⚠️ Não foi possível liberar a cota. Atualize a lista e tente novamente.",
    );
    return;
  }

  closeGiftDetailsModal();
  showAdminToast("💜 Cota liberada com sucesso!");
  await loadGiftsAdmin();
};

function openGiftModal() {
  editingGift = null;
  giftForm.reset();
  currentExternalOptions = [];
  renderGiftExternalOptions();
  giftModalTitle.textContent = "Novo Presente";
  giftTypeInput.value = "single";
  giftQuotaCountInput.value = "";
  giftQuotaValueInput.value = "";
  giftPurchaseModeInput.disabled = false;
  previousPurchaseMode = giftPurchaseModeInput.value;
  updateGiftTypeVisibility();
  updateGiftExternalOptionsVisibility();
  giftModal.classList.add("active");
}

function closeGiftModal() {
  giftModal.classList.remove("active");
}

window.openEditGiftModal = function (gift) {
  editingGift = gift;
  giftModalTitle.textContent = "Editar Presente";
  document.getElementById("giftCategoryInput").value = gift.category || "";
  document.getElementById("giftNameInput").value = gift.name || "";
  document.getElementById("giftDescriptionInput").value =
    gift.description || "";
  document.getElementById("giftPriceInput").value = gift.price ?? "";
  document.getElementById("giftTypeInput").value = gift.gift_type || "single";
  document.getElementById("giftQuotaCountInput").value = gift.quota_count || "";
  document.getElementById("giftQuotaValueInput").value =
    isQuotaGift(gift) ? getQuotaValue(gift).toFixed(2) : "";
  document.getElementById("giftImageUrlInput").value = gift.image_url || "";
  document.getElementById("giftPurchaseModeInput").value =
    gift.purchase_mode || "money";
  previousPurchaseMode = giftPurchaseModeInput.value;
  currentExternalOptions = Array.isArray(gift.external_purchase_options)
    ? gift.external_purchase_options
    : [];
  renderGiftExternalOptions();
  updateGiftTypeVisibility();
  updateGiftExternalOptionsVisibility();
  document.getElementById("giftCardPaymentUrlInput").value =
    gift.card_payment_url || "";
  giftModal.classList.add("active");
};

function updateQuotaValuePreview() {
  const price = Number(document.getElementById("giftPriceInput").value || 0);
  const quotaCount = Number(giftQuotaCountInput.value || 0);
  const quotaValue = quotaCount > 0 ? price / quotaCount : 0;

  giftQuotaValueInput.value = quotaValue ? quotaValue.toFixed(2) : "";
}

function updateGiftTypeVisibility() {
  const isQuota = giftTypeInput.value === "quota";

  giftQuotaSection.classList.toggle("is-hidden", !isQuota);

  if (!isQuota) {
    giftQuotaCountInput.value = "";
    giftQuotaValueInput.value = "";
    giftPurchaseModeInput.disabled = false;
    return;
  }

  giftPurchaseModeInput.value = "money";
  giftPurchaseModeInput.disabled = true;
  currentExternalOptions = [];
  renderGiftExternalOptions();
  updateQuotaValuePreview();
}

function updateGiftExternalOptionsVisibility() {
  if (giftTypeInput.value === "quota") {
    setElementVisibility(giftExternalOptionsSection, false);
    previousPurchaseMode = "money";
    return;
  }

  const mode = giftPurchaseModeInput.value;

  if (
    mode === "money" &&
    previousPurchaseMode !== "money" &&
    currentExternalOptions.length > 0
  ) {
    const confirmed = confirm(
      "Ao mudar para Dinheiro / PIX / Cartão, todas as opções de lojas serão removidas. Deseja continuar?",
    );

    if (!confirmed) {
      giftPurchaseModeInput.value = previousPurchaseMode;
      return;
    }

    currentExternalOptions = [];
    renderGiftExternalOptions();
  }

  const shouldShow = mode === "external" || mode === "hybrid";

  setElementVisibility(giftExternalOptionsSection, shouldShow);
  previousPurchaseMode = mode;
}

function renderGiftExternalOptions() {
  giftExternalOptionsList.replaceChildren();

  if (!currentExternalOptions.length) {
    const empty = document.createElement("div");

    empty.className = "admin-muted";
    empty.textContent = "Nenhuma opção cadastrada.";
    giftExternalOptionsList.appendChild(empty);

    return;
  }

  currentExternalOptions.forEach((option, index) => {
    const card = document.createElement("div");
    const content = document.createElement("div");
    const store = document.createElement("strong");
    const type = document.createElement("span");
    const actions = document.createElement("div");
    const editButton = document.createElement("button");
    const removeButton = document.createElement("button");
    const typeLabel =
      option.type === "physical" ? "Loja Física" : "Compra Online";

    card.className = "external-option-admin-card";
    store.textContent = option.store || "Sem nome";
    type.textContent = typeLabel;
    content.append(store, type);

    if (option.url) {
      const url = document.createElement("small");

      url.textContent = option.url;
      content.appendChild(url);
    }

    if (option.notes) {
      const notes = document.createElement("p");

      notes.textContent = option.notes;
      content.appendChild(notes);
    }

    actions.className = "admin-actions";
    editButton.type = "button";
    editButton.className = "admin-action-button";
    editButton.dataset.externalOptionAction = "edit";
    editButton.dataset.externalOptionIndex = index;
    editButton.textContent = "Editar";
    removeButton.type = "button";
    removeButton.className = "admin-action-button danger";
    removeButton.dataset.externalOptionAction = "remove";
    removeButton.dataset.externalOptionIndex = index;
    removeButton.textContent = "Remover";
    actions.append(editButton, removeButton);
    card.append(content, actions);
    giftExternalOptionsList.appendChild(card);
  });
}

function updateExternalOptionUrlVisibility() {
  setElementVisibility(
    externalOptionUrlGroup,
    externalOptionTypeInput.value === "online",
  );
}

function openExternalOptionModal(option = null, index = null) {
  editingExternalOptionIndex = index;
  externalOptionForm.reset();
  externalOptionModalTitle.textContent = option
    ? "Editar Opção de Compra"
    : "Nova Opção de Compra";
  externalOptionTypeInput.value = option?.type || "online";
  externalOptionStoreInput.value = option?.store || "";
  externalOptionUrlInput.value = option?.url || "";
  externalOptionNotesInput.value = option?.notes || "";
  updateExternalOptionUrlVisibility();
  externalOptionModal.classList.add("active");
}

function closeExternalOptionModal() {
  externalOptionModal.classList.remove("active");
  editingExternalOptionIndex = null;
}

window.editExternalOption = function (index) {
  const option = currentExternalOptions[index];

  if (option) {
    openExternalOptionModal(option, index);
  }
};

window.removeExternalOption = function (index) {
  const confirmed = confirm("Deseja remover esta opção?");

  if (!confirmed) {
    return;
  }

  currentExternalOptions.splice(index, 1);
  renderGiftExternalOptions();
};

window.deleteGift = async function (gift) {
  let message =
    "Deseja excluir este presente?\n\nEsta ação não poderá ser desfeita.";

  if (isQuotaGift(gift) && gift.quota_contributions?.length) {
    message =
      `⚠️ Este presente possui ${gift.quota_contributions.length} contribuição` +
      `${gift.quota_contributions.length === 1 ? "" : "ões"} por cota.\n\n` +
      "Ao excluí-lo, todas as contribuições relacionadas também serão removidas.\n\n" +
      "Deseja continuar?";
  }

  if (gift.status === "Reservado") {
    message =
      `⚠️ Este presente está reservado${gift.reserved_name ? ` por ${gift.reserved_name}` : ""}.\n\n` +
      "Ao excluí-lo, todas as informações da reserva serão perdidas.\n\n" +
      "Deseja continuar?";
  }

  if (!isQuotaGift(gift) && gift.status === "Comprado") {
    message =
      `⚠️ Este presente está marcado como comprado${gift.reserved_name ? ` por ${gift.reserved_name}` : ""}.\n\n` +
      "Ao excluí-lo, todo o histórico deste presente será removido.\n\n" +
      "Deseja continuar?";
  }

  const confirmed = confirm(message);

  if (!confirmed) {
    return;
  }

  const { data, error } = await supabaseClient.rpc("admin_delete_gift", {
    target_gift_id: gift.id,
  });

  if (error || data !== true) {
    console.error(error);
    showAdminToast(
      "⚠️ Não foi possível excluir o presente. Atualize a lista e tente novamente.",
    );
    return;
  }

  closeGiftDetailsModal();
  showAdminToast("💜 Presente excluído com sucesso!");
  await loadGiftsAdmin();
};

openGiftModalButton.addEventListener("click", openGiftModal);
closeGiftModalButton.addEventListener("click", closeGiftModal);
closeGiftDetailsModalButton.addEventListener("click", () => {
  closeGiftDetailsModal();
});

[
  giftSearchInput,
  giftStatusFilter,
  giftTypeFilter,
  giftPaymentFilter,
  giftQuotaFilter,
  giftMethodFilter,
].forEach((filter) => {
  filter?.addEventListener("input", applyGiftFilters);
  filter?.addEventListener("change", applyGiftFilters);
});

clearGiftFiltersButton?.addEventListener("click", clearGiftFilters);
exportGiftsButton?.addEventListener("click", exportGiftsCSV);

giftsTableBody?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-gift-action]");

  if (!button) {
    return;
  }

  handleGiftAction(button.dataset.giftAction, button.dataset.giftId);
});

giftDetailsContent?.addEventListener("click", (event) => {
  const contributionButton = event.target.closest(
    "[data-contribution-id][data-gift-detail-action]",
  );

  if (contributionButton) {
    const action = contributionButton.dataset.giftDetailAction;
    const contributionId = contributionButton.dataset.contributionId;

    if (action === "confirm-contribution") {
      markQuotaContributionAsBought(contributionId);
      return;
    }

    if (action === "release-contribution") {
      releaseQuotaContribution(contributionId);
      return;
    }
  }

  const button = event.target.closest("[data-gift-detail-action]");

  if (!button) {
    return;
  }

  handleGiftAction(button.dataset.giftDetailAction, button.dataset.giftId);
});

document.querySelectorAll("[data-gift-sort]").forEach((button) => {
  button.addEventListener("click", () => {
    setGiftSort(button.dataset.giftSort);
  });
});

giftModal.addEventListener("click", (e) => {
  if (e.target === giftModal) {
    closeGiftModal();
  }
});

giftDetailsModal.addEventListener("click", (e) => {
  if (e.target === giftDetailsModal) {
    closeGiftDetailsModal();
  }
});

giftPurchaseModeInput.addEventListener(
  "change",
  updateGiftExternalOptionsVisibility,
);

giftTypeInput.addEventListener("change", () => {
  updateGiftTypeVisibility();
  updateGiftExternalOptionsVisibility();
});

document
  .getElementById("giftPriceInput")
  .addEventListener("input", updateQuotaValuePreview);

giftQuotaCountInput.addEventListener("input", updateQuotaValuePreview);

addExternalOptionButton.addEventListener("click", () => {
  openExternalOptionModal();
});

giftExternalOptionsList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-external-option-action]");

  if (!button) {
    return;
  }

  const index = Number(button.dataset.externalOptionIndex);

  if (button.dataset.externalOptionAction === "edit") {
    editExternalOption(index);
    return;
  }

  if (button.dataset.externalOptionAction === "remove") {
    removeExternalOption(index);
  }
});

externalOptionTypeInput.addEventListener(
  "change",
  updateExternalOptionUrlVisibility,
);

closeExternalOptionModalButton.addEventListener(
  "click",
  closeExternalOptionModal,
);

externalOptionModal.addEventListener("click", (e) => {
  if (e.target === externalOptionModal) {
    closeExternalOptionModal();
  }
});

giftForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const purchaseMode = document.getElementById("giftPurchaseModeInput").value;
  const giftType = document.getElementById("giftTypeInput").value;
  const priceInputValue = document.getElementById("giftPriceInput").value;
  const hasPrice = priceInputValue.trim() !== "";
  const parsedPrice = hasPrice ? Number(priceInputValue) : null;
  const price = parsedPrice && parsedPrice > 0 ? parsedPrice : null;
  const effectivePurchaseMode = giftType === "quota" ? "money" : purchaseMode;
  const quotaCount = Number(giftQuotaCountInput.value || 0);
  const quotaValue =
    giftType === "quota" && price && quotaCount > 0
      ? price / quotaCount
      : null;
  const requiresPrice =
    giftType === "quota" ||
    effectivePurchaseMode === "money" ||
    effectivePurchaseMode === "hybrid";

  if (requiresPrice && !price) {
    showAdminToast(
      "⚠️ Informe um valor maior que zero para este tipo de presente.",
    );
    return;
  }

  if (giftType === "quota" && quotaCount <= 0) {
    showAdminToast("⚠️ Informe a quantidade de cotas.");
    return;
  }

  const payload = {
    category: document.getElementById("giftCategoryInput").value.trim(),
    name: document.getElementById("giftNameInput").value.trim(),
    description: document.getElementById("giftDescriptionInput").value.trim(),
    price,
    image_url: document.getElementById("giftImageUrlInput").value.trim(),
    gift_type: giftType,
    quota_count: giftType === "quota" ? quotaCount : null,
    quota_value: giftType === "quota" ? quotaValue : null,
    purchase_mode: effectivePurchaseMode,
    card_payment_url: document
      .getElementById("giftCardPaymentUrlInput")
      .value.trim(),
    external_purchase_options:
      giftType === "quota" || purchaseMode === "money"
        ? []
        : currentExternalOptions,
  };

  if (!editingGift) {
    payload.status = "Disponível";
    payload.payment_status = null;
  }

  const result = await supabaseClient.rpc("admin_save_gift", {
    target_gift_id: editingGift?.id || null,
    submitted_category: payload.category,
    submitted_name: payload.name,
    submitted_description: payload.description,
    submitted_price: payload.price,
    submitted_image_url: payload.image_url,
    submitted_gift_type: payload.gift_type,
    submitted_quota_count: payload.quota_count,
    submitted_purchase_mode: payload.purchase_mode,
    submitted_card_payment_url: payload.card_payment_url,
    submitted_external_options: payload.external_purchase_options,
  });

  if (result.error || !result.data) {
    console.error(result.error);
    showAdminToast(
      editingGift
        ? "⚠️ Não foi possível atualizar. Presentes com reservas não permitem alterar tipo, valor ou forma de compra."
        : "⚠️ Não foi possível criar o presente. Revise os dados informados.",
    );
    return;
  }

  closeGiftModal();
  showAdminToast(
    editingGift
      ? "💜 Presente atualizado com sucesso!"
      : "💜 Presente criado com sucesso!",
  );
  editingGift = null;
  await loadGiftsAdmin();
});

externalOptionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const wasEditing = editingExternalOptionIndex !== null;
  const type = externalOptionTypeInput.value;
  const store = externalOptionStoreInput.value.trim();
  const url = type === "online" ? externalOptionUrlInput.value.trim() : "";
  const notes = externalOptionNotesInput.value.trim();

  if (!store) {
    showAdminToast("⚠️ Informe o nome da loja.");
    return;
  }

  const option = {
    type,
    store,
    url,
    notes,
  };

  if (wasEditing) {
    currentExternalOptions[editingExternalOptionIndex] = option;
  } else {
    currentExternalOptions.push(option);
  }

  renderGiftExternalOptions();
  closeExternalOptionModal();
  showAdminToast(wasEditing ? "💜 Opção atualizada!" : "💜 Opção adicionada!");
});

applyGiftFiltersFromUrl();
loadGiftsAdmin();
