AdminCommon.setupLogout();

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

  return `<span class="admin-badge badge-muted">${status || "-"}</span>`;
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
              <strong>${guestName}</strong>
              <span>
                ${quantity} cota${quantity === 1 ? "" : "s"} · ${contribution.payment_status || "Pendente"}
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
      ${label}
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
                  <strong>${contribution.contributor_name || "Convidado"}</strong>
                  <p>${contribution.message}</p>
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

  return `<p>${gift.reservation_message}</p>`;
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
                <strong>${contribution.contributor_name || "Convidado"}</strong>
                <span>
                  ${contribution.quota_quantity || 0} cota${Number(contribution.quota_quantity || 0) === 1 ? "" : "s"}
                  · R$ ${Number(contribution.total_value || 0).toFixed(2)}
                  · ${contribution.payment_status || "Pendente"}
                </span>
              </div>

              ${
                contribution.payment_status !== "Confirmado"
                  ? `
                    <div class="admin-details-inline-actions">
                      <button
                        class="admin-action-button success"
                        onclick='markQuotaContributionAsBought("${contribution.id}", "${gift.id}")'
                      >
                        ✓ Confirmar
                      </button>

                      <button
                        class="admin-action-button warning"
                        onclick='releaseQuotaContribution("${contribution.id}", "${gift.id}")'
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
        onclick='markGiftAsBought("${gift.id}")'
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
      onclick='closeGiftDetailsModal(); openEditGiftModal(${JSON.stringify(gift)})'
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
        onclick='releaseGiftReservation("${gift.id}")'
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
      onclick='deleteGift(${JSON.stringify(gift)})'
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

  giftDetailsContent.innerHTML = `
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
  `;

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
  syncAllQuotaGiftStatuses();
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
    giftsTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="admin-empty-state">
          Nenhum presente encontrado para os filtros selecionados.
        </td>
      </tr>
    `;
    return;
  }

  giftsTableBody.innerHTML = gifts
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
          <td>${gift.name}</td>
          <td>${gift.category || "-"}</td>
          <td>${getGiftTypeLabel(gift)}</td>
          <td>${isQuotaGift(gift) ? renderQuotaProgress(gift) : `<span class="admin-muted">-</span>`}</td>
          <td>${guestCell}</td>
          <td>${renderSituationCell(gift)}</td>
          <td>${formatDate(gift.reserved_at)}</td>
          <td>${renderGiftActions(gift)}</td>
        </tr>
      `;
    })
    .join("");
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
    const matchesStatus =
      !status ||
      getGiftDisplayStatus(gift) === status ||
      (status === "Disponível" && hasAvailableQuota);
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
          onclick='openGiftDetailsModal(${JSON.stringify(gift)})'
          title="Ver detalhes"
        >
          👁 Detalhes
        </button>

        <button
          class="admin-action-button icon-action"
          onclick='openEditGiftModal(${JSON.stringify(gift)})'
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
          onclick='markGiftAsBought("${gift.id}")'
          title="Confirmar compra"
        >
          ✓ Confirmar
        </button>

        <button
          class="admin-action-button icon-action"
          onclick='openGiftDetailsModal(${JSON.stringify(gift)})'
          title="Ver detalhes"
        >
          👁 Detalhes
        </button>

        <button
          class="admin-action-button icon-action"
          onclick='openEditGiftModal(${JSON.stringify(gift)})'
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
        onclick='openGiftDetailsModal(${JSON.stringify(gift)})'
        title="Ver detalhes"
      >
        👁 Detalhes
      </button>

      <button
        class="admin-action-button icon-action"
        onclick='openEditGiftModal(${JSON.stringify(gift)})'
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

  const { error } = await supabaseClient
    .from("gifts")
    .update({
      status: "Comprado",
      payment_status: "Confirmado",
    })
    .eq("id", giftId);

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Erro ao marcar presente como comprado.");
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

  const { error } = await supabaseClient
    .from("gifts")
    .update({
      status: "Disponível",
      reserved_guest_id: null,
      reserved_name: null,
      reservation_message: null,
      reserved_at: null,
      payment_status: null,
      payment_reported_at: null,
      selected_purchase_method: null,
      selected_purchase_details: null,
      card_payment_reference: null,
    })
    .eq("id", giftId);

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Erro ao liberar reserva.");
    return;
  }

  closeGiftDetailsModal();
  showAdminToast("💜 Reserva liberada com sucesso!");
  await loadGiftsAdmin();
};

async function syncQuotaGiftStatus(giftId) {
  const { data: gift, error: giftError } = await supabaseClient
    .from("gifts")
    .select("id, quota_count")
    .eq("id", giftId)
    .single();

  const { data: contributions, error: contributionsError } = await supabaseClient
    .from("gift_contributions")
    .select("quota_quantity, payment_status")
    .eq("gift_id", giftId);

  if (giftError || contributionsError) {
    console.error(giftError || contributionsError);
    return;
  }

  const total = Number(gift.quota_count || 0);
  const reserved = (contributions || []).reduce(
    (sum, contribution) => sum + Number(contribution.quota_quantity || 0),
    0,
  );
  const confirmed = (contributions || [])
    .filter((contribution) => contribution.payment_status === "Confirmado")
    .reduce(
      (sum, contribution) => sum + Number(contribution.quota_quantity || 0),
      0,
    );
  const informed = (contributions || [])
    .filter((contribution) => contribution.payment_status === "Informado")
    .reduce(
      (sum, contribution) => sum + Number(contribution.quota_quantity || 0),
      0,
    );

  let status = "Disponível";
  let paymentStatus = null;

  if (total > 0 && confirmed >= total) {
    status = "Comprado";
    paymentStatus = "Confirmado";
  } else if (total > 0 && reserved >= total) {
    status = "Reservado";
    paymentStatus =
      confirmed > 0
        ? "Parcialmente confirmado"
        : informed > 0
          ? "Parcialmente informado"
          : "Pendente";
  } else if (reserved > 0) {
    status = "Parcial";
    paymentStatus =
      confirmed > 0
        ? "Parcialmente confirmado"
        : informed > 0
          ? "Parcialmente informado"
          : "Pendente";
  }

  await supabaseClient
    .from("gifts")
    .update({
      status,
      payment_status: paymentStatus,
    })
    .eq("id", giftId);
}

async function syncAllQuotaGiftStatuses() {
  const quotaGifts = cachedGifts.filter((gift) => {
    if (!isQuotaGift(gift)) {
      return false;
    }

    const displayStatus = getGiftDisplayStatus(gift);
    const displayPaymentStatus = getGiftDisplayPaymentStatus(gift);

    return (
      gift.status !== displayStatus ||
      (gift.payment_status || null) !== (displayPaymentStatus || null)
    );
  });

  for (const gift of quotaGifts) {
    await syncQuotaGiftStatus(gift.id);
  }
}

window.markQuotaContributionAsBought = async function (contributionId, giftId) {
  const confirmed = confirm("Confirmar esta contribuição como comprada?");

  if (!confirmed) {
    return;
  }

  const { error } = await supabaseClient
    .from("gift_contributions")
    .update({
      payment_status: "Confirmado",
    })
    .eq("id", contributionId);

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Erro ao confirmar contribuição.");
    return;
  }

  await syncQuotaGiftStatus(giftId);
  closeGiftDetailsModal();
  showAdminToast("💜 Contribuição confirmada!");
  await loadGiftsAdmin();
};

window.releaseQuotaContribution = async function (contributionId, giftId) {
  const confirmed = confirm(
    "Deseja liberar esta reserva de cota? Apenas esta contribuição será removida.",
  );

  if (!confirmed) {
    return;
  }

  const { error } = await supabaseClient
    .from("gift_contributions")
    .delete()
    .eq("id", contributionId);

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Erro ao liberar cota.");
    return;
  }

  await syncQuotaGiftStatus(giftId);
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
    giftExternalOptionsSection.style.display = "none";
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

  giftExternalOptionsSection.style.display = shouldShow ? "block" : "none";
  previousPurchaseMode = mode;
}

function renderGiftExternalOptions() {
  if (!currentExternalOptions.length) {
    giftExternalOptionsList.innerHTML = `
      <div class="admin-muted">
        Nenhuma opção cadastrada.
      </div>
    `;

    return;
  }

  giftExternalOptionsList.innerHTML = currentExternalOptions
    .map((option, index) => {
      const typeLabel =
        option.type === "physical" ? "Loja Física" : "Compra Online";

      return `
        <div class="external-option-admin-card">
          <div>
            <strong>${option.store || "Sem nome"}</strong>
            <span>${typeLabel}</span>

            ${
              option.url
                ? `<small>${option.url}</small>`
                : ""
            }

            ${
              option.notes
                ? `<p>${option.notes}</p>`
                : ""
            }
          </div>

          <div class="admin-actions">
            <button
              type="button"
              class="admin-action-button"
              onclick="editExternalOption(${index})"
            >
              Editar
            </button>

            <button
              type="button"
              class="admin-action-button danger"
              onclick="removeExternalOption(${index})"
            >
              Remover
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

function updateExternalOptionUrlVisibility() {
  externalOptionUrlGroup.style.display =
    externalOptionTypeInput.value === "online" ? "block" : "none";
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

  const { error } = await supabaseClient.from("gifts").delete().eq("id", gift.id);

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Erro ao excluir presente.");
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

  const result = editingGift
    ? await supabaseClient.from("gifts").update(payload).eq("id", editingGift.id)
    : await supabaseClient.from("gifts").insert([payload]);

  if (result.error) {
    console.error(result.error);
    showAdminToast(
      editingGift
        ? "⚠️ Erro ao atualizar presente."
        : "⚠️ Erro ao criar presente.",
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
