AdminCommon.setupLogout();

const tablesGrid = document.getElementById("tablesGrid");
const tableSearchInput = document.getElementById("tableSearchInput");
const tableStatusFilter = document.getElementById("tableStatusFilter");
const tableGuestSideFilter = document.getElementById("tableGuestSideFilter");
const tableGuestStatusFilter = document.getElementById("tableGuestStatusFilter");
const tableFilterCount = document.getElementById("tableFilterCount");
const tableFiltersPanel = document.getElementById("tableFiltersPanel");
const clearTableFiltersButton = document.getElementById("clearTableFiltersButton");
const refreshTablesButton = document.getElementById("refreshTablesButton");
const exportTablesButton = document.getElementById("exportTablesButton");
const openTableModalButton = document.getElementById("openTableModalButton");
const openTableOrderModalButton = document.getElementById("openTableOrderModalButton");
const tableModal = document.getElementById("tableModal");
const closeTableModalButton = document.getElementById("closeTableModalButton");
const tableModalTitle = document.getElementById("tableModalTitle");
const tableForm = document.getElementById("tableForm");
const tableNameInput = document.getElementById("tableNameInput");
const tableCapacityInput = document.getElementById("tableCapacityInput");
const tableOrderInput = document.getElementById("tableOrderInput");
const tableActiveInput = document.getElementById("tableActiveInput");
const tableLocationInput = document.getElementById("tableLocationInput");
const tableNotesInput = document.getElementById("tableNotesInput");
const tableDetailsModal = document.getElementById("tableDetailsModal");
const closeTableDetailsModalButton = document.getElementById("closeTableDetailsModalButton");
const tableDetailsTitle = document.getElementById("tableDetailsTitle");
const tableDetailsContent = document.getElementById("tableDetailsContent");
const tableAssignmentNoteModal = document.getElementById("tableAssignmentNoteModal");
const closeTableAssignmentNoteModalButton = document.getElementById(
  "closeTableAssignmentNoteModalButton",
);
const tableAssignmentNoteContent = document.getElementById(
  "tableAssignmentNoteContent",
);
const assignGuestModal = document.getElementById("assignGuestModal");
const closeAssignGuestModalButton = document.getElementById("closeAssignGuestModalButton");
const assignGuestModalTitle = document.getElementById("assignGuestModalTitle");
const assignGuestForm = document.getElementById("assignGuestForm");
const assignGuestInput = document.getElementById("assignGuestInput");
const assignGuestNotesInput = document.getElementById("assignGuestNotesInput");
const transferGuestModal = document.getElementById("transferGuestModal");
const closeTransferGuestModalButton = document.getElementById(
  "closeTransferGuestModalButton",
);
const transferGuestModalTitle = document.getElementById("transferGuestModalTitle");
const transferGuestForm = document.getElementById("transferGuestForm");
const transferGuestTableInput = document.getElementById("transferGuestTableInput");
const transferGuestNotesInput = document.getElementById("transferGuestNotesInput");
const tableOrderModal = document.getElementById("tableOrderModal");
const closeTableOrderModalButton = document.getElementById("closeTableOrderModalButton");
const tableOrderList = document.getElementById("tableOrderList");
const saveTableOrderButton = document.getElementById("saveTableOrderButton");
const tableTotalCount = document.getElementById("tableTotalCount");
const tableAvailableCount = document.getElementById("tableAvailableCount");
const tableFullCount = document.getElementById("tableFullCount");
const tableUnassignedCount = document.getElementById("tableUnassignedCount");
const tableSummaryCards = document.querySelectorAll("[data-table-summary]");
const tableViewModeButtons = document.querySelectorAll("[data-table-view-mode]");

const showAdminToast = AdminCommon.showToast;
const { escapeAttribute, replaceSafeContent, safeText } = SecurityUtils;

let cachedTables = [];
let cachedAssignments = [];
let cachedGuests = [];
let cachedRSVPs = [];
let selectedTableId = null;
let selectedTransferGuestId = null;
let orderedTableIds = [];
let draggedTableId = null;
let viewMode = "hybrid";

function renderIcon(name) {
  return `<i data-lucide="${safeText(name)}" aria-hidden="true"></i>`;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function getAdminPageParams() {
  return new URLSearchParams(window.location.search);
}

function setFilterValueFromParam(element, params, name) {
  if (!element || !params.has(name)) {
    return;
  }

  element.value = params.get(name) || "";
}

function applyTableFiltersFromUrl() {
  const params = getAdminPageParams();

  setFilterValueFromParam(tableSearchInput, params, "search");
  setFilterValueFromParam(tableStatusFilter, params, "status");
  setFilterValueFromParam(tableGuestSideFilter, params, "side");
  setFilterValueFromParam(tableGuestStatusFilter, params, "guest_status");
}

function compareValues(first, second) {
  if (typeof first === "number" || typeof second === "number") {
    return Number(first || 0) - Number(second || 0);
  }

  return String(first || "").localeCompare(String(second || ""), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
}

function getGuestSideLabel(side) {
  const labels = {
    bride: "Noiva",
    couple: "Casal",
    groom: "Noivo",
  };

  return labels[side] || "Casal";
}

function getInviteTypeLabel(type) {
  return type === "couple" ? "Casal" : "Individual";
}

function getTableById(tableId) {
  return cachedTables.find((tableItem) => tableItem.id === tableId);
}

function getGuestById(guestId) {
  return cachedGuests.find((guest) => guest.id === guestId);
}

function getAssignmentByGuestId(guestId) {
  return cachedAssignments.find((assignment) => assignment.guest_id === guestId);
}

function getAssignmentNote(assignment) {
  return String(assignment?.notes || "").trim();
}

function getRSVPByGuestId(guestId) {
  return cachedRSVPs.find((rsvp) => rsvp.guest_id === guestId);
}

function hasDeclinedRSVP(guest) {
  return getRSVPByGuestId(guest.id)?.presence === "Não";
}

function getPlannedCount(guest) {
  if (!guest?.active) {
    return 0;
  }

  const invitePeople =
    guest.invite_type === "couple"
      ? Math.max((guest.couple_members || []).length, 2)
      : 1;

  return invitePeople + Number(guest.max_guests || 0);
}

function getConfirmedCount(guest) {
  if (!guest?.active) {
    return 0;
  }

  const rsvp = getRSVPByGuestId(guest.id);

  return BuffetMetrics.getConfirmedPeople(
    guest,
    rsvp,
    BuffetMetrics.DEFAULT_PAYING_AGE,
  ).length;
}

function getHybridCount(guest) {
  const rsvp = getRSVPByGuestId(guest.id);

  if (rsvp) {
    return getConfirmedCount(guest);
  }

  return getPlannedCount(guest);
}

function getGuestCounts(guest) {
  return {
    confirmed: getConfirmedCount(guest),
    hybrid: getHybridCount(guest),
    planned: getPlannedCount(guest),
  };
}

function getAssignmentsForTable(tableId) {
  return cachedAssignments
    .filter((assignment) => assignment.table_id === tableId)
    .map((assignment) => ({
      assignment,
      guest: getGuestById(assignment.guest_id),
    }))
    .filter((item) => item.guest);
}

function getTableOccupancy(tableItem) {
  return getAssignmentsForTable(tableItem.id).reduce(
    (totals, item) => {
      const counts = getGuestCounts(item.guest);
      totals.confirmed += counts.confirmed;
      totals.hybrid += counts.hybrid;
      totals.planned += counts.planned;
      return totals;
    },
    { confirmed: 0, hybrid: 0, planned: 0 },
  );
}

function getModeLabel(mode = viewMode) {
  const labels = {
    confirmed: "Confirmado",
    hybrid: "Híbrido",
    planned: "Planejado",
  };

  return labels[mode] || "Híbrido";
}

function getOccupancyStatus(tableItem) {
  if (!tableItem.is_active) {
    return "inactive";
  }

  const occupancy = getTableOccupancy(tableItem)[viewMode];
  const capacity = Number(tableItem.capacity || 0);

  if (capacity > 0 && occupancy > capacity) {
    return "over";
  }

  if (capacity > 0 && occupancy >= capacity) {
    return "full";
  }

  return "available";
}

function matchesTableStatusFilter(tableItem, status) {
  if (!status) {
    return true;
  }

  const tableStatus = getOccupancyStatus(tableItem);

  if (status === "active") {
    return tableStatus !== "inactive";
  }

  if (status === "full") {
    return tableStatus === "full" || tableStatus === "over";
  }

  return tableStatus === status;
}

function getSortedTables(tables = cachedTables) {
  return [...tables].sort((first, second) => {
    let result = compareValues(
      Number(first.display_order || 0),
      Number(second.display_order || 0),
    );

    if (result === 0) {
      result = compareValues(first.name, second.name);
    }

    return result;
  });
}

function getFilteredTables() {
  const search = normalizeText(tableSearchInput.value);
  const status = tableStatusFilter.value;
  const guestSide = tableGuestSideFilter.value;
  const guestStatus = tableGuestStatusFilter.value;

  return getSortedTables().filter((tableItem) => {
    const assignedItems = getAssignmentsForTable(tableItem.id);
    const searchable = normalizeText(
      [
        tableItem.name,
        tableItem.location,
        tableItem.notes,
        ...assignedItems.map((item) => item.guest.name),
      ].join(" "),
    );
    const hasGuestSide =
      !guestSide || assignedItems.some((item) => item.guest.guest_side === guestSide);
    const hasGuestStatus =
      !guestStatus ||
      assignedItems.some((item) =>
        guestStatus === "active" ? item.guest.active : !item.guest.active,
      );

    return (
      (!search || searchable.includes(search)) &&
      matchesTableStatusFilter(tableItem, status) &&
      hasGuestSide &&
      hasGuestStatus
    );
  });
}

function updateViewModeButtons() {
  tableViewModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tableViewMode === viewMode);
  });
}

function updateTableSummary() {
  const activeTables = cachedTables.filter((tableItem) => tableItem.is_active);
  const statuses = activeTables.map((tableItem) => getOccupancyStatus(tableItem));
  const assignedGuestIds = new Set(cachedAssignments.map((assignment) => assignment.guest_id));

  tableTotalCount.textContent = String(cachedTables.length);
  tableAvailableCount.textContent = String(
    statuses.filter((status) => status === "available").length,
  );
  tableFullCount.textContent = String(
    statuses.filter((status) => status === "full" || status === "over").length,
  );
  tableUnassignedCount.textContent = String(
    cachedGuests.filter((guest) => guest.active && !assignedGuestIds.has(guest.id)).length,
  );
}

function getNextTableOrder() {
  return (
    cachedTables.reduce(
      (highestOrder, tableItem) =>
        Math.max(highestOrder, Number(tableItem.display_order || 0)),
      0,
    ) + 1
  );
}

function getSubmittedTableOrder() {
  if (tableOrderInput.value === "") {
    return getNextTableOrder();
  }

  return Number(tableOrderInput.value || 0);
}

function renderOccupancyBar(tableItem, occupancy) {
  const capacity = Number(tableItem.capacity || 0);
  const current = occupancy[viewMode];
  const percentage = capacity > 0 ? Math.min((current / capacity) * 100, 100) : 0;
  const status = getOccupancyStatus(tableItem);

  return `
    <div class="table-occupancy-bar ${safeText(status)}">
      <span style="width: ${safeText(percentage)}%"></span>
    </div>
  `;
}

function renderAssignedGuest(item) {
  const counts = getGuestCounts(item.guest);
  const declined = hasDeclinedRSVP(item.guest);
  const assignmentNote = getAssignmentNote(item.assignment);
  const statusBadges = [
    item.guest.active ? "" : '<span class="admin-badge badge-muted">Inativo</span>',
    declined ? '<span class="admin-badge badge-danger">Não vai</span>' : "",
  ].join("");

  return `
    <li class="table-assigned-guest ${item.guest.active ? "" : "inactive"}">
      <div>
        <strong>
          ${safeText(item.guest.name)}
          ${
            assignmentNote
              ? `<button
                  type="button"
                  class="rsvp-inline-indicator table-note-indicator"
                  data-table-action="assignment-note"
                  data-guest-id="${escapeAttribute(item.guest.id)}"
                  title="Ver observação do convidado na mesa"
                  aria-label="Ver observação do convidado na mesa"
                >
                  ${renderIcon("message-square-text")}
                </button>`
              : ""
          }
          ${statusBadges}
        </strong>
        <span>
          ${safeText(getInviteTypeLabel(item.guest.invite_type))} ·
          ${safeText(getGuestSideLabel(item.guest.guest_side))} ·
          ${safeText(getModeLabel())} ${safeText(counts[viewMode])}
        </span>
      </div>
      <div class="table-guest-actions">
        <button
          type="button"
          class="table-guest-action transfer"
          data-table-action="transfer-guest"
          data-guest-id="${escapeAttribute(item.guest.id)}"
          aria-label="Trocar convidado de mesa"
          title="Trocar de mesa"
        >
          ${renderIcon("move-right")}
        </button>
        <button
          type="button"
          class="table-guest-action remove"
          data-table-action="remove-guest"
          data-guest-id="${escapeAttribute(item.guest.id)}"
          aria-label="Remover convidado da mesa"
          title="Remover da mesa"
        >
          ${renderIcon("x")}
        </button>
      </div>
    </li>
  `;
}

function renderTableCard(tableItem) {
  const occupancy = getTableOccupancy(tableItem);
  const assignedItems = getAssignmentsForTable(tableItem.id);
  const capacity = Number(tableItem.capacity || 0);
  const current = occupancy[viewMode];
  const status = getOccupancyStatus(tableItem);

  return `
    <article class="wedding-table-card ${safeText(status)}">
      <header class="wedding-table-card-header">
        <div>
          <strong>${safeText(tableItem.name)}</strong>
          <span>${safeText(tableItem.location || "Localização não informada")}</span>
        </div>
        <div class="wedding-table-card-tools">
          <span class="admin-badge ${status === "over" ? "badge-danger" : status === "inactive" ? "badge-muted" : "badge-payment"}">
            ${safeText(tableItem.is_active ? getModeLabel() : "Inativa")}
          </span>
          <div class="wedding-table-card-actions">
            <button
              type="button"
              class="checklist-period-action"
              data-table-action="details"
              data-table-id="${escapeAttribute(tableItem.id)}"
              title="Detalhes"
              aria-label="Ver detalhes da mesa"
            >
              ${renderIcon("eye")}
            </button>
            <button
              type="button"
              class="checklist-period-action"
              data-table-action="assign"
              data-table-id="${escapeAttribute(tableItem.id)}"
              title="Adicionar convidado"
              aria-label="Adicionar convidado à mesa"
            >
              ${renderIcon("user-plus")}
            </button>
          </div>
        </div>
      </header>

      <div class="table-occupancy-main">
        <strong>${safeText(current)}/${safeText(capacity)}</strong>
        <span>lugares</span>
      </div>
      ${renderOccupancyBar(tableItem, occupancy)}
      <p class="table-occupancy-meta">
        Planejado ${safeText(occupancy.planned)} · Confirmado ${safeText(occupancy.confirmed)} · Híbrido ${safeText(occupancy.hybrid)}
      </p>

      <ul class="table-assigned-list">
        ${
          assignedItems.length
            ? assignedItems.slice(0, 5).map(renderAssignedGuest).join("")
            : '<li class="admin-muted">Nenhum convidado nesta mesa.</li>'
        }
      </ul>

    </article>
  `;
}

function renderTables() {
  const tables = getFilteredTables();

  tableFilterCount.textContent =
    tables.length === cachedTables.length
      ? `${cachedTables.length} mesa${cachedTables.length === 1 ? "" : "s"}`
      : `${tables.length} de ${cachedTables.length} mesas`;
  if (tableFiltersPanel) {
    tableFiltersPanel.dataset.hasActiveFilters = String(
      tables.length !== cachedTables.length,
    );
  }
  updateViewModeButtons();
  updateTableSummary();

  if (!tables.length) {
    replaceSafeContent(
      tablesGrid,
      '<div class="admin-empty-state">Nenhuma mesa encontrada.</div>',
    );
    return;
  }

  replaceSafeContent(tablesGrid, tables.map(renderTableCard).join(""));
  window.lucide?.createIcons();
}

function clearTableForm() {
  selectedTableId = null;
  tableForm.reset();
  tableCapacityInput.value = "8";
  tableOrderInput.value = String(getNextTableOrder());
  tableActiveInput.checked = true;
}

function openTableModal(tableItem = null) {
  clearTableForm();

  if (tableItem) {
    selectedTableId = tableItem.id;
    tableModalTitle.textContent = "Editar Mesa";
    tableNameInput.value = tableItem.name || "";
    tableCapacityInput.value = tableItem.capacity ?? 8;
    tableOrderInput.value = tableItem.display_order ?? 0;
    tableActiveInput.checked = Boolean(tableItem.is_active);
    tableLocationInput.value = tableItem.location || "";
    tableNotesInput.value = tableItem.notes || "";
  } else {
    tableModalTitle.textContent = "Nova Mesa";
  }

  tableModal.classList.add("active");
  tableModal.setAttribute("aria-hidden", "false");
}

function closeTableModal() {
  tableModal.classList.remove("active");
  tableModal.setAttribute("aria-hidden", "true");
  clearTableForm();
}

function renderTableDetailsActions(tableItem) {
  const isActive = Boolean(tableItem.is_active);

  return `
    <div class="admin-detail-action-grid">
      <button type="button" class="admin-detail-action-card" data-table-detail-action="edit" data-table-id="${escapeAttribute(tableItem.id)}">
        <span class="admin-detail-action-icon">${renderIcon("edit")}</span>
        <span>
          <strong>Editar Mesa</strong>
          <small>Altera nome, capacidade, local e observações.</small>
        </span>
      </button>
      <button type="button" class="admin-detail-action-card ${isActive ? "danger" : "success"}" data-table-detail-action="toggle-active" data-table-id="${escapeAttribute(tableItem.id)}">
        <span class="admin-detail-action-icon">${renderIcon("power")}</span>
        <span>
          <strong>${safeText(isActive ? "Desativar Mesa" : "Ativar Mesa")}</strong>
          <small>${safeText(isActive ? "Mantém a mesa cadastrada, mas remove das mesas ativas." : "Reativa a mesa para a organização da recepção.")}</small>
        </span>
      </button>
      <button type="button" class="admin-detail-action-card success" data-table-detail-action="assign" data-table-id="${escapeAttribute(tableItem.id)}">
        <span class="admin-detail-action-icon">${renderIcon("user-plus")}</span>
        <span>
          <strong>Adicionar Convidado</strong>
          <small>Inclui um convite nesta mesa.</small>
        </span>
      </button>
      <button type="button" class="admin-detail-action-card danger" data-table-detail-action="delete" data-table-id="${escapeAttribute(tableItem.id)}">
        <span class="admin-detail-action-icon">${renderIcon("trash-2")}</span>
        <span>
          <strong>Excluir Mesa</strong>
          <small>Remove a mesa e libera seus convidados.</small>
        </span>
      </button>
    </div>
  `;
}

function openTableDetails(tableId) {
  const tableItem = getTableById(tableId);

  if (!tableItem) {
    showAdminToast("⚠️ Mesa não encontrada");
    return;
  }

  selectedTableId = tableId;
  const occupancy = getTableOccupancy(tableItem);
  const assignedItems = getAssignmentsForTable(tableItem.id);

  tableDetailsTitle.textContent = tableItem.name || "Detalhes da Mesa";
  replaceSafeContent(
    tableDetailsContent,
    `
      <section class="admin-details-section">
        <span class="admin-details-label">Resumo</span>
        <div class="admin-details-meta-grid">
          <div class="admin-details-meta-item">
            <span>Capacidade</span>
            <strong>${safeText(tableItem.capacity)}</strong>
          </div>
          <div class="admin-details-meta-item">
            <span>Planejado</span>
            <strong>${safeText(occupancy.planned)}</strong>
          </div>
          <div class="admin-details-meta-item">
            <span>Confirmado</span>
            <strong>${safeText(occupancy.confirmed)}</strong>
          </div>
          <div class="admin-details-meta-item">
            <span>Híbrido</span>
            <strong>${safeText(occupancy.hybrid)}</strong>
          </div>
          <div class="admin-details-meta-item">
            <span>Status</span>
            <strong>${safeText(tableItem.is_active ? "Ativa" : "Inativa")}</strong>
          </div>
          <div class="admin-details-meta-item">
            <span>Ordem</span>
            <strong>${safeText(tableItem.display_order ?? 0)}</strong>
          </div>
        </div>
      </section>

      <section class="admin-details-section">
        <span class="admin-details-label">Convidados</span>
        <ul class="table-details-guest-list">
          ${
            assignedItems.length
              ? assignedItems.map(renderAssignedGuest).join("")
              : '<li class="admin-muted">Nenhum convidado nesta mesa.</li>'
          }
        </ul>
      </section>

      <section class="admin-details-section">
        <span class="admin-details-label">Localização</span>
        <p>${safeText(tableItem.location || "Nenhuma localização informada.")}</p>
      </section>

      <section class="admin-details-section">
        <span class="admin-details-label">Observações</span>
        <p>${safeText(tableItem.notes || "Nenhuma observação cadastrada.")}</p>
      </section>

      <section class="admin-details-section">
        <span class="admin-details-label">Ações</span>
        ${renderTableDetailsActions(tableItem)}
      </section>
    `,
  );

  tableDetailsModal.classList.add("active");
  tableDetailsModal.setAttribute("aria-hidden", "false");
  window.lucide?.createIcons();
}

function closeTableDetails() {
  tableDetailsModal.classList.remove("active");
  tableDetailsModal.setAttribute("aria-hidden", "true");
}

function openAssignmentNoteModal(guestId) {
  const assignment = getAssignmentByGuestId(guestId);
  const guest = getGuestById(guestId);
  const note = getAssignmentNote(assignment);

  if (!guest || !note) {
    showAdminToast("⚠️ Observação não encontrada");
    return;
  }

  replaceSafeContent(
    tableAssignmentNoteContent,
    `
      <section class="admin-details-section">
        <span class="admin-details-label">Convidado</span>
        <p>${safeText(guest.name)}</p>
      </section>

      <section class="admin-details-section">
        <span class="admin-details-label">Observação do convidado na mesa</span>
        <p>${safeText(note)}</p>
      </section>
    `,
  );

  tableAssignmentNoteModal.classList.add("active");
  tableAssignmentNoteModal.setAttribute("aria-hidden", "false");
}

function closeAssignmentNoteModal() {
  tableAssignmentNoteModal.classList.remove("active");
  tableAssignmentNoteModal.setAttribute("aria-hidden", "true");
}

function openAssignGuestModal(tableId) {
  const tableItem = getTableById(tableId);

  if (!tableItem) {
    showAdminToast("⚠️ Mesa não encontrada");
    return;
  }

  selectedTableId = tableId;
  assignGuestModalTitle.textContent = `Adicionar em ${tableItem.name}`;
  assignGuestNotesInput.value = "";

  const assignedGuestIds = new Set(cachedAssignments.map((assignment) => assignment.guest_id));
  const guests = cachedGuests
    .filter((guest) => guest.active)
    .filter((guest) => !assignedGuestIds.has(guest.id))
    .sort((first, second) => compareValues(first.name, second.name));

  assignGuestInput.replaceChildren(new Option("Selecione", ""));
  guests.forEach((guest) => {
    const counts = getGuestCounts(guest);
    assignGuestInput.appendChild(
      new Option(
        `${guest.name} · ${getInviteTypeLabel(guest.invite_type)} · ${getGuestSideLabel(guest.guest_side)} · ${getModeLabel()} ${counts[viewMode]}`,
        guest.id,
      ),
    );
  });

  assignGuestModal.classList.add("active");
  assignGuestModal.setAttribute("aria-hidden", "false");
}

function closeAssignGuestModal() {
  assignGuestModal.classList.remove("active");
  assignGuestModal.setAttribute("aria-hidden", "true");
  assignGuestForm.reset();
}

function openTransferGuestModal(guestId) {
  const guest = getGuestById(guestId);
  const assignment = getAssignmentByGuestId(guestId);

  if (!guest || !assignment) {
    showAdminToast("⚠️ Convidado ou mesa não encontrados");
    return;
  }

  selectedTransferGuestId = guestId;
  transferGuestModalTitle.textContent = `Trocar Mesa de ${guest.name}`;
  transferGuestNotesInput.value = getAssignmentNote(assignment);
  transferGuestTableInput.replaceChildren(new Option("Selecione", ""));

  getSortedTables()
    .forEach((tableItem) => {
      const suffix = tableItem.is_active ? "" : " · Inativa";
      transferGuestTableInput.appendChild(
        new Option(`${tableItem.name}${suffix}`, tableItem.id),
      );
    });
  transferGuestTableInput.value = assignment.table_id;

  transferGuestModal.classList.add("active");
  transferGuestModal.setAttribute("aria-hidden", "false");
}

function closeTransferGuestModal() {
  transferGuestModal.classList.remove("active");
  transferGuestModal.setAttribute("aria-hidden", "true");
  transferGuestForm.reset();
  selectedTransferGuestId = null;
}

function renderTableOrderModal() {
  const tablesById = new Map(cachedTables.map((tableItem) => [tableItem.id, tableItem]));
  const orderedTables = orderedTableIds
    .map((tableId) => tablesById.get(tableId))
    .filter(Boolean);

  if (!orderedTables.length) {
    replaceSafeContent(tableOrderList, '<div class="admin-empty-state">Nenhuma mesa cadastrada.</div>');
    return;
  }

  replaceSafeContent(
    tableOrderList,
    orderedTables.map((tableItem, index) => `
      <article class="vendor-order-item" draggable="true" data-table-order-id="${escapeAttribute(tableItem.id)}">
        <span class="vendor-order-handle" aria-hidden="true">${renderIcon("grip-vertical")}</span>
        <div>
          <strong class="vendor-order-name">${safeText(tableItem.name)}</strong>
          <span class="vendor-order-category">${safeText(tableItem.capacity)} lugares</span>
        </div>
        <div class="vendor-order-actions">
          <button type="button" class="vendor-order-action" data-table-order-action="up" data-table-id="${escapeAttribute(tableItem.id)}" ${index === 0 ? "disabled" : ""} aria-label="Subir mesa">
            ${renderIcon("chevron-up")}
          </button>
          <button type="button" class="vendor-order-action" data-table-order-action="down" data-table-id="${escapeAttribute(tableItem.id)}" ${index === orderedTables.length - 1 ? "disabled" : ""} aria-label="Descer mesa">
            ${renderIcon("chevron-down")}
          </button>
        </div>
      </article>
    `).join(""),
  );
  window.lucide?.createIcons();
}

function openTableOrderModal() {
  orderedTableIds = getSortedTables().map((tableItem) => tableItem.id);
  renderTableOrderModal();
  tableOrderModal.classList.add("active");
  tableOrderModal.setAttribute("aria-hidden", "false");
}

function closeTableOrderModal() {
  tableOrderModal.classList.remove("active");
  tableOrderModal.setAttribute("aria-hidden", "true");
  draggedTableId = null;
}

function moveTableOrderItem(tableId, direction) {
  const currentIndex = orderedTableIds.indexOf(tableId);
  const nextIndex = currentIndex + direction;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedTableIds.length) {
    return;
  }

  const nextOrder = [...orderedTableIds];
  [nextOrder[currentIndex], nextOrder[nextIndex]] = [
    nextOrder[nextIndex],
    nextOrder[currentIndex],
  ];
  orderedTableIds = nextOrder;
  renderTableOrderModal();
}

function reorderDraggedTable(targetTableId, shouldInsertAfter) {
  if (!draggedTableId || draggedTableId === targetTableId) {
    return;
  }

  const nextOrder = orderedTableIds.filter((tableId) => tableId !== draggedTableId);
  const targetIndex = nextOrder.indexOf(targetTableId);

  if (targetIndex < 0) {
    return;
  }

  nextOrder.splice(targetIndex + (shouldInsertAfter ? 1 : 0), 0, draggedTableId);
  orderedTableIds = nextOrder;
  renderTableOrderModal();
}

async function loadTables() {
  refreshTablesButton.disabled = true;

  const [
    tablesResult,
    assignmentsResult,
    guestsResult,
    rsvpsResult,
  ] = await Promise.all([
    supabaseClient.rpc("admin_list_wedding_tables"),
    supabaseClient.rpc("admin_list_wedding_table_assignments"),
    supabaseClient.from("guests").select("*"),
    supabaseClient.from("rsvps").select("*"),
  ]);

  refreshTablesButton.disabled = false;

  const error =
    tablesResult.error ||
    assignmentsResult.error ||
    guestsResult.error ||
    rsvpsResult.error;

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível carregar as mesas");
    return;
  }

  cachedTables = tablesResult.data || [];
  cachedAssignments = assignmentsResult.data || [];
  cachedGuests = guestsResult.data || [];
  cachedRSVPs = rsvpsResult.data || [];
  renderTables();
}

async function saveTable(event) {
  event.preventDefault();

  const { error } = await supabaseClient.rpc("admin_save_wedding_table", {
    submitted_capacity: Number(tableCapacityInput.value || 0),
    submitted_display_order: getSubmittedTableOrder(),
    submitted_is_active: tableActiveInput.checked,
    submitted_location: tableLocationInput.value,
    submitted_name: tableNameInput.value,
    submitted_notes: tableNotesInput.value,
    target_table_id: selectedTableId,
  });

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar a mesa");
    return;
  }

  showAdminToast("💜 Mesa salva!");
  closeTableModal();
  await loadTables();
}

async function assignGuest(event) {
  event.preventDefault();

  const guestId = assignGuestInput.value;

  if (!selectedTableId || !guestId) {
    return;
  }

  const { error } = await supabaseClient.rpc("admin_assign_guest_to_table", {
    submitted_notes: assignGuestNotesInput.value,
    target_guest_id: guestId,
    target_table_id: selectedTableId,
  });

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível adicionar o convidado");
    return;
  }

  showAdminToast("💜 Convidado adicionado à mesa!");
  closeAssignGuestModal();
  await loadTables();
  openTableDetails(selectedTableId);
}

async function transferGuest(event) {
  event.preventDefault();

  if (!selectedTransferGuestId || !transferGuestTableInput.value) {
    return;
  }

  const previousTableId = getAssignmentByGuestId(selectedTransferGuestId)?.table_id;
  const selectedTableId = transferGuestTableInput.value;
  const tableChanged = previousTableId !== selectedTableId;
  const { error } = await supabaseClient.rpc("admin_assign_guest_to_table", {
    submitted_notes: transferGuestNotesInput.value,
    target_guest_id: selectedTransferGuestId,
    target_table_id: selectedTableId,
  });

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível trocar o convidado de mesa");
    return;
  }

  showAdminToast(
    tableChanged
      ? "💜 Convidado trocado de mesa!"
      : "💜 Observação do convidado na mesa atualizada!",
  );
  closeTransferGuestModal();
  await loadTables();

  if (tableDetailsModal.classList.contains("active") && previousTableId) {
    openTableDetails(previousTableId);
  }
}

async function removeGuestFromTable(guestId) {
  const guest = getGuestById(guestId);

  if (!guest || !confirm(`Remover "${guest.name}" da mesa?`)) {
    return;
  }

  const { error } = await supabaseClient.rpc("admin_remove_guest_from_table", {
    target_guest_id: guestId,
  });

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível remover o convidado da mesa");
    return;
  }

  showAdminToast("💜 Convidado removido da mesa!");
  await loadTables();

  if (tableDetailsModal.classList.contains("active") && selectedTableId) {
    openTableDetails(selectedTableId);
  }
}

async function deleteTable(tableId) {
  const tableItem = getTableById(tableId);

  if (!tableItem || !confirm(`Deseja excluir "${tableItem.name}"?`)) {
    return;
  }

  const { error } = await supabaseClient.rpc("admin_delete_wedding_table", {
    target_table_id: tableId,
  });

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível excluir a mesa");
    return;
  }

  showAdminToast("💜 Mesa excluída!");
  closeTableDetails();
  await loadTables();
}

async function setTableActive(tableId, isActive) {
  const tableItem = getTableById(tableId);
  const actionLabel = isActive ? "ativar" : "desativar";

  if (!tableItem || !confirm(`Deseja ${actionLabel} "${tableItem.name}"?`)) {
    return;
  }

  const { error } = await supabaseClient.rpc("admin_set_wedding_table_active", {
    submitted_is_active: isActive,
    target_table_id: tableId,
  });

  if (error) {
    console.error(error);
    showAdminToast(`⚠️ Não foi possível ${actionLabel} a mesa`);
    return;
  }

  showAdminToast(`💜 Mesa ${isActive ? "ativada" : "desativada"}!`);
  await loadTables();
  openTableDetails(tableId);
}

async function saveTableOrder() {
  saveTableOrderButton.disabled = true;

  const { error } = await supabaseClient.rpc("admin_reorder_wedding_tables", {
    submitted_table_ids: orderedTableIds,
  });

  saveTableOrderButton.disabled = false;

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar a ordem das mesas");
    return;
  }

  showAdminToast("💜 Ordem das mesas salva!");
  closeTableOrderModal();
  await loadTables();
}

function exportTablesCSV() {
  const filteredTables = getFilteredTables();

  if (!filteredTables.length) {
    showAdminToast("⚠️ Nenhuma mesa para exportar");
    return;
  }

  const rows = filteredTables.flatMap((tableItem) => {
    const occupancy = getTableOccupancy(tableItem);
    const assignedItems = getAssignmentsForTable(tableItem.id);
    const base = {
      active: tableItem.is_active ? "Sim" : "Não",
      capacity: tableItem.capacity,
      confirmed: occupancy.confirmed,
      hybrid: occupancy.hybrid,
      location: tableItem.location || "",
      name: tableItem.name,
      planned: occupancy.planned,
      status: getOccupancyStatus(tableItem),
    };

    if (!assignedItems.length) {
      return [
        {
          ...base,
          guest: "",
          guestActive: "",
          guestTableGuestNote: "",
          guestPresence: "",
          guestSide: "",
          inviteType: "",
        },
      ];
    }

    return assignedItems.map((item) => ({
      ...base,
      guest: item.guest.name,
      guestActive: item.guest.active ? "Sim" : "Não",
      guestTableGuestNote: getAssignmentNote(item.assignment),
      guestPresence: getRSVPByGuestId(item.guest.id)?.presence || "Sem RSVP",
      guestSide: getGuestSideLabel(item.guest.guest_side),
      inviteType: getInviteTypeLabel(item.guest.invite_type),
    }));
  });

  AdminExport.downloadCSV("mesas", [
    { label: "Mesa", value: "name" },
    { label: "Ativa", value: "active" },
    { label: "Capacidade", value: "capacity" },
    { label: "Planejado", value: "planned" },
    { label: "Confirmado", value: "confirmed" },
    { label: "Híbrido", value: "hybrid" },
    { label: "Localização", value: "location" },
    { label: "Convidado", value: "guest" },
    { label: "Convidado ativo", value: "guestActive" },
    { label: "Presença RSVP", value: "guestPresence" },
    { label: "Observação do convidado na mesa", value: "guestTableGuestNote" },
    { label: "Tipo", value: "inviteType" },
    { label: "Convidado de", value: "guestSide" },
  ], rows);

  showAdminToast("💜 CSV de mesas exportado!");
}

tableViewModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    viewMode = button.dataset.tableViewMode || "hybrid";
    renderTables();
  });
});

[tableSearchInput, tableStatusFilter, tableGuestSideFilter, tableGuestStatusFilter].forEach((filter) => {
  filter?.addEventListener("input", renderTables);
  filter?.addEventListener("change", renderTables);
});

clearTableFiltersButton?.addEventListener("click", () => {
  tableSearchInput.value = "";
  tableStatusFilter.value = "";
  tableGuestSideFilter.value = "";
  tableGuestStatusFilter.value = "";
  renderTables();
});

tableSummaryCards.forEach((card) => {
  card.addEventListener("click", () => {
    const summary = card.dataset.tableSummary;
    tableStatusFilter.value = "";

    if (summary === "available") {
      tableStatusFilter.value = "available";
    } else if (summary === "full") {
      tableStatusFilter.value = "full";
    } else if (summary === "unassigned") {
      tableStatusFilter.value = "";
    }

    renderTables();
  });
});

refreshTablesButton?.addEventListener("click", loadTables);
exportTablesButton?.addEventListener("click", exportTablesCSV);
openTableModalButton?.addEventListener("click", () => openTableModal());
openTableOrderModalButton?.addEventListener("click", openTableOrderModal);
closeTableModalButton?.addEventListener("click", closeTableModal);
closeTableDetailsModalButton?.addEventListener("click", closeTableDetails);
closeTableAssignmentNoteModalButton?.addEventListener(
  "click",
  closeAssignmentNoteModal,
);
closeAssignGuestModalButton?.addEventListener("click", closeAssignGuestModal);
closeTransferGuestModalButton?.addEventListener("click", closeTransferGuestModal);
closeTableOrderModalButton?.addEventListener("click", closeTableOrderModal);
tableForm?.addEventListener("submit", saveTable);
assignGuestForm?.addEventListener("submit", assignGuest);
transferGuestForm?.addEventListener("submit", transferGuest);
saveTableOrderButton?.addEventListener("click", saveTableOrder);

tablesGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-table-action]");

  if (!button) {
    return;
  }

  const tableId = button.dataset.tableId;
  const guestId = button.dataset.guestId;

  if (button.dataset.tableAction === "details") {
    openTableDetails(tableId);
  } else if (button.dataset.tableAction === "assign") {
    openAssignGuestModal(tableId);
  } else if (button.dataset.tableAction === "remove-guest") {
    removeGuestFromTable(guestId);
  } else if (button.dataset.tableAction === "transfer-guest") {
    openTransferGuestModal(guestId);
  } else if (button.dataset.tableAction === "assignment-note") {
    openAssignmentNoteModal(guestId);
  }
});

tableDetailsContent?.addEventListener("click", (event) => {
  const detailButton = event.target.closest("[data-table-detail-action]");
  const removeButton = event.target.closest("[data-table-action='remove-guest']");
  const transferButton = event.target.closest("[data-table-action='transfer-guest']");
  const noteButton = event.target.closest("[data-table-action='assignment-note']");

  if (noteButton) {
    openAssignmentNoteModal(noteButton.dataset.guestId);
    return;
  }

  if (transferButton) {
    openTransferGuestModal(transferButton.dataset.guestId);
    return;
  }

  if (removeButton) {
    removeGuestFromTable(removeButton.dataset.guestId);
    return;
  }

  if (!detailButton) {
    return;
  }

  const tableId = detailButton.dataset.tableId;
  const tableItem = getTableById(tableId);

  if (detailButton.dataset.tableDetailAction === "edit") {
    closeTableDetails();
    openTableModal(tableItem);
  } else if (detailButton.dataset.tableDetailAction === "assign") {
    openAssignGuestModal(tableId);
  } else if (detailButton.dataset.tableDetailAction === "toggle-active") {
    setTableActive(tableId, !tableItem.is_active);
  } else if (detailButton.dataset.tableDetailAction === "delete") {
    deleteTable(tableId);
  }
});

tableOrderList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-table-order-action]");

  if (!button) {
    return;
  }

  moveTableOrderItem(
    button.dataset.tableId,
    button.dataset.tableOrderAction === "up" ? -1 : 1,
  );
});

tableOrderList?.addEventListener("dragstart", (event) => {
  const item = event.target.closest("[data-table-order-id]");
  draggedTableId = item?.dataset.tableOrderId || null;
});

tableOrderList?.addEventListener("dragover", (event) => {
  if (!draggedTableId) {
    return;
  }

  event.preventDefault();
});

tableOrderList?.addEventListener("drop", (event) => {
  const target = event.target.closest("[data-table-order-id]");

  if (!target) {
    return;
  }

  const rect = target.getBoundingClientRect();
  const shouldInsertAfter = event.clientY > rect.top + rect.height / 2;
  reorderDraggedTable(target.dataset.tableOrderId, shouldInsertAfter);
});

tableAssignmentNoteModal?.addEventListener("click", (event) => {
  if (event.target === tableAssignmentNoteModal) {
    closeAssignmentNoteModal();
  }
});

transferGuestModal?.addEventListener("click", (event) => {
  if (event.target === transferGuestModal) {
    closeTransferGuestModal();
  }
});

applyTableFiltersFromUrl();
loadTables();
