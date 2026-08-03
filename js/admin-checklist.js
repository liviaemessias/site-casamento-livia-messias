AdminCommon.setupLogout();

const PERIODS = [
  ["12_months_before", "12 meses antes"],
  ["11_months_before", "11 meses antes"],
  ["10_months_before", "10 meses antes"],
  ["9_months_before", "9 meses antes"],
  ["8_months_before", "8 meses antes"],
  ["7_months_before", "7 meses antes"],
  ["6_months_before", "6 meses antes"],
  ["5_months_before", "5 meses antes"],
  ["4_months_before", "4 meses antes"],
  ["3_months_before", "3 meses antes"],
  ["2_months_before", "2 meses antes"],
  ["1_month_before", "1 mês antes"],
  ["wedding_week", "Semana do casamento"],
  ["wedding_day", "Dia do casamento"],
  ["after_wedding", "Depois do casamento"],
];

const PERIOD_LABELS = Object.fromEntries(PERIODS);
const PERIOD_ORDER = new Map(PERIODS.map(([key], index) => [key, index]));
const STATUS_LABELS = {
  completed: "Concluída",
  in_progress: "Em Andamento",
  pending: "Pendente",
};
const PRIORITY_LABELS = {
  high: "Alta",
  low: "Baixa",
  normal: "Normal",
};
const OWNER_LABELS = {
  bride: "Noiva",
  couple: "Casal",
  family: "Família",
  groom: "Noivo",
  planner: "Cerimonial",
};
const RESPONSIBLE_TYPE_LABELS = {
  family: "Família",
  group: "Grupo",
  other: "Outro",
  person: "Pessoa",
  planner: "Cerimonial",
};
const DEFAULT_BRAND_COLOR = AdminCommon.BRAND_COLOR;
const CATEGORY_ICON_OPTIONS = [
  ["church", "Cerimônia"],
  ["party-popper", "Recepção"],
  ["users", "Convidados"],
  ["handshake", "Fornecedores"],
  ["file-check", "Documentação"],
  ["shirt", "Trajes"],
  ["sparkles", "Beleza"],
  ["music", "Música"],
  ["flower-2", "Decoração"],
  ["gift", "Presentes"],
  ["mail", "Papelaria e Convites"],
  ["camera", "Pré-Wedding"],
  ["calendar-heart", "Save the Date"],
  ["package", "Caixinhas"],
  ["heart", "Pais e Família"],
  ["plane", "Lua de Mel"],
  ["wallet", "Financeiro"],
  ["check-square", "Checklist"],
  ["more-horizontal", "Outros"],
];

const checklistBoard = document.getElementById("checklistBoard");
const checklistPeriodNav = document.getElementById("checklistPeriodNav");
const checklistSearchInput = document.getElementById("checklistSearchInput");
const checklistPeriodFilter = document.getElementById("checklistPeriodFilter");
const checklistStatusFilter = document.getElementById("checklistStatusFilter");
const checklistCategoryFilter = document.getElementById("checklistCategoryFilter");
const checklistOwnerFilter = document.getElementById("checklistOwnerFilter");
const checklistPriorityFilter = document.getElementById("checklistPriorityFilter");
const checklistFilterCount = document.getElementById("checklistFilterCount");
const clearChecklistFiltersButton = document.getElementById("clearChecklistFiltersButton");
const refreshChecklistButton = document.getElementById("refreshChecklistButton");
const exportChecklistButton = document.getElementById("exportChecklistButton");
const openChecklistItemModalButton = document.getElementById("openChecklistItemModalButton");
const openCategoryManagerButton = document.getElementById("openCategoryManagerButton");
const openResponsibleManagerButton = document.getElementById("openResponsibleManagerButton");
const checklistSummaryCards = document.querySelectorAll("[data-checklist-summary]");

const checklistTotalCount = document.getElementById("checklistTotalCount");
const checklistPendingCount = document.getElementById("checklistPendingCount");
const checklistProgressCount = document.getElementById("checklistProgressCount");
const checklistCompletedCount = document.getElementById("checklistCompletedCount");
const checklistOverdueCount = document.getElementById("checklistOverdueCount");

const checklistItemModal = document.getElementById("checklistItemModal");
const checklistItemModalTitle = document.getElementById("checklistItemModalTitle");
const closeChecklistItemModalButton = document.getElementById("closeChecklistItemModalButton");
const checklistItemForm = document.getElementById("checklistItemForm");
const checklistTitleInput = document.getElementById("checklistTitleInput");
const checklistCategoryInput = document.getElementById("checklistCategoryInput");
const checklistPeriodInput = document.getElementById("checklistPeriodInput");
const checklistStatusInput = document.getElementById("checklistStatusInput");
const checklistPriorityInput = document.getElementById("checklistPriorityInput");
const checklistOwnerInput = document.getElementById("checklistOwnerInput");
const checklistDueDateInput = document.getElementById("checklistDueDateInput");
const checklistOrderInput = document.getElementById("checklistOrderInput");
const checklistDescriptionInput = document.getElementById("checklistDescriptionInput");
const checklistNotesInput = document.getElementById("checklistNotesInput");

const checklistCategoryModal = document.getElementById("checklistCategoryModal");
const closeCategoryManagerButton = document.getElementById("closeCategoryManagerButton");
const checklistCategoryForm = document.getElementById("checklistCategoryForm");
const categoryNameInput = document.getElementById("categoryNameInput");
const categoryColorInput = document.getElementById("categoryColorInput");
const categoryIconInput = document.getElementById("categoryIconInput");
const categoryIconPreview = document.getElementById("categoryIconPreview");
const categoryOrderInput = document.getElementById("categoryOrderInput");
const categoryActiveInput = document.getElementById("categoryActiveInput");
const cancelCategoryEditButton = document.getElementById("cancelCategoryEditButton");
const checklistCategoryList = document.getElementById("checklistCategoryList");

const checklistResponsibleModal = document.getElementById("checklistResponsibleModal");
const closeResponsibleManagerButton = document.getElementById("closeResponsibleManagerButton");
const checklistResponsibleForm = document.getElementById("checklistResponsibleForm");
const responsibleNameInput = document.getElementById("responsibleNameInput");
const responsibleTypeInput = document.getElementById("responsibleTypeInput");
const responsibleOrderInput = document.getElementById("responsibleOrderInput");
const responsibleActiveInput = document.getElementById("responsibleActiveInput");
const cancelResponsibleEditButton = document.getElementById("cancelResponsibleEditButton");
const checklistResponsibleList = document.getElementById("checklistResponsibleList");

const checklistDetailsModal = document.getElementById("checklistDetailsModal");
const closeChecklistDetailsModalButton = document.getElementById("closeChecklistDetailsModalButton");
const checklistDetailsTitle = document.getElementById("checklistDetailsTitle");
const checklistDetailsContent = document.getElementById("checklistDetailsContent");

const checklistOrderModal = document.getElementById("checklistOrderModal");
const closeChecklistOrderModalButton = document.getElementById("closeChecklistOrderModalButton");
const checklistOrderDescription = document.getElementById("checklistOrderDescription");
const checklistOrderPeriodSelect = document.getElementById("checklistOrderPeriodSelect");
const checklistOrderList = document.getElementById("checklistOrderList");
const saveChecklistOrderButton = document.getElementById("saveChecklistOrderButton");

const showAdminToast = AdminCommon.showToast;
const { escapeAttribute, replaceSafeContent, safeText } = SecurityUtils;

let cachedCategories = [];
let cachedResponsibles = [];
let cachedItems = [];
let visibleItems = [];
let selectedItemId = null;
let selectedCategoryId = null;
let selectedResponsibleId = null;
let checklistOrderPeriodKey = "";
let checklistOrderedIds = [];
let draggedChecklistItemId = null;

function renderIcon(name) {
  return `<i data-lucide="${safeText(name)}" aria-hidden="true"></i>`;
}

function createIconElement(name) {
  const icon = document.createElement("i");
  icon.setAttribute("data-lucide", name);
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function populateCategoryIconSelect() {
  const currentValue = categoryIconInput.value || "check-square";

  categoryIconInput.replaceChildren();
  CATEGORY_ICON_OPTIONS.forEach(([value, label]) => {
    categoryIconInput.appendChild(new Option(label, value));
  });

  categoryIconInput.value = CATEGORY_ICON_OPTIONS.some(([value]) => value === currentValue)
    ? currentValue
    : "check-square";
}

function updateCategoryIconPreview() {
  const color = isSafeHexColor(categoryColorInput.value)
    ? categoryColorInput.value
    : DEFAULT_BRAND_COLOR;

  categoryIconPreview.replaceChildren(createIconElement(categoryIconInput.value || "check-square"));
  categoryIconPreview.style.backgroundColor = color;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function isSafeHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || ""));
}

function applyChecklistColors() {
  document.querySelectorAll("[data-category-color]").forEach((element) => {
    const color = element.dataset.categoryColor;

    if (!isSafeHexColor(color)) {
      return;
    }

    if (element.classList.contains("checklist-category-swatch")) {
      element.style.backgroundColor = color;
      return;
    }

    element.style.setProperty("--checklist-category-color", color);
  });
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function formatDate(value) {
  return value ? AdminCommon.formatDate(value) : "-";
}

function formatDateOnly(value) {
  const rawValue = String(value || "");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    return formatDate(value);
  }

  const [year, month, day] = rawValue.split("-");
  return `${day}/${month}/${year}`;
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isOverdue(item) {
  return item.status !== "completed" && item.due_date && item.due_date < getTodayKey();
}

function getItemById(itemId) {
  return cachedItems.find((item) => item.id === itemId);
}

function getCategoryById(categoryId) {
  return cachedCategories.find((category) => category.id === categoryId);
}

function getResponsibleById(responsibleId) {
  return cachedResponsibles.find((responsible) => responsible.id === responsibleId);
}

function getResponsibleName(item) {
  return item.responsible_name || OWNER_LABELS[item.owner] || "Casal";
}

function getNextCategoryOrder() {
  return cachedCategories.length + 1;
}

function getNextResponsibleOrder() {
  return cachedResponsibles.length + 1;
}

function usesLegacyCategoryOrderSpacing() {
  const highestOrder = cachedCategories.reduce(
    (highest, category) =>
      Math.max(highest, Number(category.display_order || 0)),
    0,
  );

  return highestOrder > Math.max(cachedCategories.length * 2, 1);
}

function usesLegacyResponsibleOrderSpacing() {
  const highestOrder = cachedResponsibles.reduce(
    (highest, responsible) =>
      Math.max(highest, Number(responsible.display_order || 0)),
    0,
  );

  return highestOrder > Math.max(cachedResponsibles.length * 2, 1);
}

function getCategoryInputOrder(category) {
  const orderedCategories = [...cachedCategories].sort((first, second) => {
    const orderResult =
      Number(first.display_order || 0) - Number(second.display_order || 0);

    if (orderResult !== 0) {
      return orderResult;
    }

    return String(first.name || "").localeCompare(String(second.name || ""), "pt-BR", {
      sensitivity: "base",
    });
  });
  const position = orderedCategories.findIndex((item) => item.id === category.id);

  return position >= 0 ? position + 1 : Number(category.display_order || 0);
}

function getResponsibleInputOrder(responsible) {
  const orderedResponsibles = [...cachedResponsibles].sort((first, second) => {
    const orderResult =
      Number(first.display_order || 0) - Number(second.display_order || 0);

    if (orderResult !== 0) {
      return orderResult;
    }

    return String(first.name || "").localeCompare(String(second.name || ""), "pt-BR", {
      sensitivity: "base",
    });
  });
  const position = orderedResponsibles.findIndex((item) => item.id === responsible.id);

  return position >= 0 ? position + 1 : Number(responsible.display_order || 0);
}

function getSubmittedCategoryOrder() {
  const orderValue =
    categoryOrderInput.value === ""
      ? getNextCategoryOrder()
      : Number(categoryOrderInput.value || 0);

  return usesLegacyCategoryOrderSpacing() ? orderValue * 10 : orderValue;
}

function getSubmittedResponsibleOrder() {
  const orderValue =
    responsibleOrderInput.value === ""
      ? getNextResponsibleOrder()
      : Number(responsibleOrderInput.value || 0);

  return usesLegacyResponsibleOrderSpacing() ? orderValue * 10 : orderValue;
}

function getNextOrder(periodKey) {
  return (
    cachedItems
      .filter((item) => item.period_key === periodKey)
      .reduce((highest, item) => Math.max(highest, Number(item.display_order || 0)), 0) + 1
  );
}

function compareOrderAndTitle(first, second) {
  const orderResult =
    Number(first.display_order || 0) - Number(second.display_order || 0);

  if (orderResult !== 0) {
    return orderResult;
  }

  return String(first.title || "").localeCompare(String(second.title || ""), "pt-BR", {
    sensitivity: "base",
  });
}

function getDefaultOrderedItems(periodKey) {
  return cachedItems
    .filter((item) => item.period_key === periodKey)
    .sort(compareOrderAndTitle);
}

function populatePeriodSelects() {
  [checklistPeriodFilter, checklistPeriodInput].forEach((select) => {
    const currentValue = select.value;
    select.replaceChildren();

    if (select === checklistPeriodFilter) {
      select.appendChild(new Option("Todos", ""));
    }

    PERIODS.forEach(([key, label]) => {
      select.appendChild(new Option(label, key));
    });

    if ([...select.options].some((option) => option.value === currentValue)) {
      select.value = currentValue;
    }
  });
}

function populateCategorySelects() {
  const activeCategories = cachedCategories.filter((category) => category.is_active);

  checklistCategoryFilter.replaceChildren(new Option("Todas", ""));
  activeCategories.forEach((category) => {
    checklistCategoryFilter.appendChild(new Option(category.name, category.id));
  });

  checklistCategoryInput.replaceChildren();
  activeCategories.forEach((category) => {
    checklistCategoryInput.appendChild(new Option(category.name, category.id));
  });
}

function populateResponsibleSelects() {
  const activeResponsibles = cachedResponsibles.filter((responsible) => responsible.is_active);

  checklistOwnerFilter.replaceChildren(new Option("Todos", ""));
  cachedResponsibles.forEach((responsible) => {
    checklistOwnerFilter.appendChild(
      new Option(
        `${responsible.name}${responsible.is_active ? "" : " (Inativo)"}`,
        responsible.id,
      ),
    );
  });

  checklistOwnerInput.replaceChildren();
  activeResponsibles.forEach((responsible) => {
    checklistOwnerInput.appendChild(new Option(responsible.name, responsible.id));
  });
}

function updateSummary() {
  const pending = cachedItems.filter((item) => item.status === "pending").length;
  const inProgress = cachedItems.filter((item) => item.status === "in_progress").length;
  const completed = cachedItems.filter((item) => item.status === "completed").length;
  const overdue = cachedItems.filter(isOverdue).length;

  checklistTotalCount.textContent = String(cachedItems.length);
  checklistPendingCount.textContent = String(pending);
  checklistProgressCount.textContent = String(inProgress);
  checklistCompletedCount.textContent = String(completed);
  checklistOverdueCount.textContent = String(overdue);
}

function renderPeriodNav(items) {
  const counts = items.reduce((map, item) => {
    map[item.period_key] = (map[item.period_key] || 0) + 1;
    return map;
  }, {});

  replaceSafeContent(
    checklistPeriodNav,
    PERIODS.map(
      ([key, label]) => `
        <a href="#checklist-period-${escapeAttribute(key)}" class="checklist-period-pill">
          ${safeText(label)}
          <span>${safeText(counts[key] || 0)}</span>
        </a>
      `,
    ).join(""),
  );
}

function getFilteredItems() {
  const search = normalizeText(checklistSearchInput.value);
  const period = checklistPeriodFilter.value;
  const status = checklistStatusFilter.value;
  const category = checklistCategoryFilter.value;
  const owner = checklistOwnerFilter.value;
  const priority = checklistPriorityFilter.value;

  return cachedItems
    .filter((item) => {
      const searchable = normalizeText(
        [
          item.title,
          item.description,
          item.notes,
          item.category_name,
          PERIOD_LABELS[item.period_key],
          getResponsibleName(item),
          PRIORITY_LABELS[item.priority],
        ].join(" "),
      );

      return (
        (!search || searchable.includes(search)) &&
        (!period || item.period_key === period) &&
        (!status ||
          (status === "overdue"
            ? isOverdue(item)
            : item.status === status)) &&
        (!category || item.category_id === category) &&
        (!owner || item.responsible_id === owner) &&
        (!priority || item.priority === priority)
      );
    })
    .sort((first, second) => {
      const periodResult =
        (PERIOD_ORDER.get(first.period_key) ?? 0) -
        (PERIOD_ORDER.get(second.period_key) ?? 0);

      if (periodResult !== 0) {
        return periodResult;
      }

      return compareOrderAndTitle(first, second);
    });
}

function renderStatusBadge(item) {
  const status = isOverdue(item) ? "overdue" : item.status;
  const labels = {
    completed: "Concluída",
    in_progress: "Em Andamento",
    overdue: "Atrasada",
    pending: "Pendente",
  };
  const classes = {
    completed: "badge-available",
    in_progress: "badge-payment",
    overdue: "badge-danger",
    pending: "badge-muted",
  };

  return `<span class="admin-badge ${classes[status]}">${labels[status]}</span>`;
}

function renderPriorityBadge(item) {
  const classes = {
    high: "badge-danger",
    low: "badge-muted",
    normal: "badge-payment",
  };

  return `<span class="admin-badge ${classes[item.priority] || "badge-muted"}">${safeText(PRIORITY_LABELS[item.priority] || "Normal")}</span>`;
}

function renderChecklistCard(item) {
  const completed = item.status === "completed";

  return `
    <article class="checklist-task-card ${completed ? "is-completed" : ""}" data-checklist-item-id="${escapeAttribute(item.id)}">
      <div class="checklist-task-main">
        <label class="admin-table-checkbox checklist-task-check" title="${completed ? "Marcar como pendente" : "Marcar como concluída"}">
          <input
            type="checkbox"
            data-checklist-action="toggle-completed"
            data-checklist-id="${escapeAttribute(item.id)}"
            ${completed ? "checked" : ""}
            aria-label="${completed ? "Tarefa concluída" : "Tarefa pendente"}"
          />
        </label>
        <div>
          <h4>${safeText(item.title)}</h4>
          <div class="checklist-task-meta">
            <span class="checklist-category-chip" data-category-color="${escapeAttribute(item.category_color || DEFAULT_BRAND_COLOR)}">
              ${renderIcon(item.category_icon || "tag")}
              ${safeText(item.category_name)}
            </span>
            <span>${safeText(getResponsibleName(item))}</span>
            <span>${safeText(item.due_date ? formatDateOnly(item.due_date) : "Sem prazo")}</span>
          </div>
        </div>
      </div>
      <div class="checklist-task-footer">
        <div class="gift-situation-stack">
          ${renderStatusBadge(item)}
          ${renderPriorityBadge(item)}
        </div>
        <button
          type="button"
          class="admin-action-button icon-action compact-action"
          data-checklist-action="details"
          data-checklist-id="${escapeAttribute(item.id)}"
        >
          ${renderIcon("eye")}
          Detalhes
        </button>
      </div>
    </article>
  `;
}

function renderChecklistBoard() {
  visibleItems = getFilteredItems();
  const grouped = visibleItems.reduce((map, item) => {
    if (!map[item.period_key]) {
      map[item.period_key] = [];
    }

    map[item.period_key].push(item);
    return map;
  }, {});

  checklistFilterCount.textContent =
    visibleItems.length === cachedItems.length
      ? `${cachedItems.length} tarefa${cachedItems.length === 1 ? "" : "s"}`
      : `${visibleItems.length} de ${cachedItems.length} tarefa${cachedItems.length === 1 ? "" : "s"}`;

  renderPeriodNav(visibleItems);

  replaceSafeContent(
    checklistBoard,
    PERIODS.map(([key, label]) => {
      const items = grouped[key] || [];
      const completed = items.filter((item) => item.status === "completed").length;

      return `
        <section class="checklist-period-section" id="checklist-period-${escapeAttribute(key)}">
          <div class="checklist-period-header">
            <div>
              <p class="section-subtitle">Período</p>
              <h3>${safeText(label)}</h3>
            </div>
            <div class="checklist-period-tools">
              <span>${items.length} tarefa${items.length === 1 ? "" : "s"} · ${completed} concluída${completed === 1 ? "" : "s"}</span>
              <div class="checklist-period-actions">
                <button
                  type="button"
                  class="checklist-period-action"
                  data-checklist-period-action="new"
                  data-checklist-period="${escapeAttribute(key)}"
                  aria-label="Nova tarefa em ${escapeAttribute(label)}"
                  title="Nova Tarefa"
                >
                  ${renderIcon("plus")}
                </button>
                <button
                  type="button"
                  class="checklist-period-action"
                  data-checklist-period-action="order"
                  data-checklist-period="${escapeAttribute(key)}"
                  aria-label="Organizar tarefas de ${escapeAttribute(label)}"
                  title="Organizar Ordem"
                >
                  ${renderIcon("list-ordered")}
                </button>
              </div>
            </div>
          </div>
          <div class="checklist-task-list">
            ${
              items.length
                ? items.map(renderChecklistCard).join("")
                : '<p class="admin-empty-state compact-empty-state">Nenhuma tarefa neste período para os filtros selecionados.</p>'
            }
          </div>
        </section>
      `;
    }).join(""),
  );

  if (window.lucide) {
    window.lucide.createIcons();
  }

  applyChecklistColors();
}

function openItemModal(item = null, initialPeriodKey = "12_months_before") {
  selectedItemId = item?.id || null;
  checklistItemForm.reset();
  checklistItemModalTitle.textContent = item ? "Editar Tarefa" : "Nova Tarefa";
  checklistCategoryInput.value = item?.category_id || checklistCategoryInput.options[0]?.value || "";
  checklistPeriodInput.value = item?.period_key || initialPeriodKey;
  checklistTitleInput.value = item?.title || "";
  checklistDescriptionInput.value = item?.description || "";
  checklistStatusInput.value = item?.status || "pending";
  checklistPriorityInput.value = item?.priority || "normal";
  if (
    item?.responsible_id &&
    ![...checklistOwnerInput.options].some((option) => option.value === item.responsible_id)
  ) {
    checklistOwnerInput.appendChild(
      new Option(`${getResponsibleName(item)} (Inativo)`, item.responsible_id),
    );
  }
  checklistOwnerInput.value =
    item?.responsible_id || checklistOwnerInput.options[0]?.value || "";
  checklistDueDateInput.value = item?.due_date || "";
  checklistNotesInput.value = item?.notes || "";
  checklistOrderInput.value = item?.display_order ?? "";
  checklistItemModal.classList.add("active");
}

function closeItemModal() {
  checklistItemModal.classList.remove("active");
  selectedItemId = null;
}

function resetCategoryForm() {
  selectedCategoryId = null;
  checklistCategoryForm.reset();
  categoryColorInput.value = DEFAULT_BRAND_COLOR;
  categoryIconInput.value = "check-square";
  categoryOrderInput.value = getNextCategoryOrder();
  updateCategoryIconPreview();
  categoryActiveInput.checked = true;
  cancelCategoryEditButton.classList.add("is-hidden");
}

function scrollToChecklistManagerForm(form, firstInput) {
  form?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
  firstInput?.focus({ preventScroll: true });
}

function renderCategoryList() {
  replaceSafeContent(
    checklistCategoryList,
    cachedCategories.map(
      (category) => `
        <article class="checklist-category-item">
          <span class="checklist-category-swatch checklist-responsible-icon" data-category-color="${escapeAttribute(category.color)}">
            ${renderIcon(category.icon || "check-square")}
          </span>
          <div>
            <strong>${safeText(category.name)}</strong>
            <small>${safeText(category.item_count || 0)} tarefa${Number(category.item_count || 0) === 1 ? "" : "s"} · ${category.is_active ? "Ativa" : "Inativa"}</small>
          </div>
          <div class="admin-actions compact-actions">
            <button type="button" class="admin-action-button icon-action" data-category-action="edit" data-category-id="${escapeAttribute(category.id)}">
              ${renderIcon("edit")}
              Editar
            </button>
            <button type="button" class="admin-action-button danger icon-action" data-category-action="delete" data-category-id="${escapeAttribute(category.id)}">
              ${renderIcon("trash-2")}
              Excluir
            </button>
          </div>
        </article>
      `,
    ).join(""),
  );

  if (window.lucide) {
    window.lucide.createIcons();
  }

  applyChecklistColors();
}

function openCategoryManager() {
  resetCategoryForm();
  renderCategoryList();
  checklistCategoryModal.classList.add("active");
}

function closeCategoryManager() {
  checklistCategoryModal.classList.remove("active");
  resetCategoryForm();
}

function resetResponsibleForm() {
  selectedResponsibleId = null;
  checklistResponsibleForm.reset();
  responsibleTypeInput.value = "person";
  responsibleOrderInput.value = getNextResponsibleOrder();
  responsibleActiveInput.checked = true;
  cancelResponsibleEditButton.classList.add("is-hidden");
}

function renderResponsibleList() {
  replaceSafeContent(
    checklistResponsibleList,
    cachedResponsibles.map(
      (responsible) => `
        <article class="checklist-category-item">
          <span class="checklist-category-swatch checklist-responsible-icon">
            ${renderIcon(responsible.responsible_type === "planner" ? "clipboard-check" : responsible.responsible_type === "family" ? "heart" : responsible.responsible_type === "group" ? "users" : "user")}
          </span>
          <div>
            <strong>${safeText(responsible.name)}</strong>
            <small>${safeText(RESPONSIBLE_TYPE_LABELS[responsible.responsible_type] || "Pessoa")} · ${safeText(responsible.item_count || 0)} tarefa${Number(responsible.item_count || 0) === 1 ? "" : "s"} · ${responsible.is_active ? "Ativo" : "Inativo"}</small>
          </div>
          <div class="admin-actions compact-actions">
            <button type="button" class="admin-action-button icon-action" data-responsible-action="edit" data-responsible-id="${escapeAttribute(responsible.id)}">
              ${renderIcon("edit")}
              Editar
            </button>
            <button type="button" class="admin-action-button danger icon-action" data-responsible-action="delete" data-responsible-id="${escapeAttribute(responsible.id)}">
              ${renderIcon("trash-2")}
              Excluir
            </button>
          </div>
        </article>
      `,
    ).join(""),
  );

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function openResponsibleManager() {
  resetResponsibleForm();
  renderResponsibleList();
  checklistResponsibleModal.classList.add("active");
}

function closeResponsibleManager() {
  checklistResponsibleModal.classList.remove("active");
  resetResponsibleForm();
}

function openDetailsModal(item) {
  checklistDetailsTitle.textContent = item.title || "Detalhes da Tarefa";

  replaceSafeContent(checklistDetailsContent, `
    <section class="admin-details-section">
      <span class="admin-details-label">Resumo</span>
      <div class="admin-details-meta-grid">
        <div class="admin-details-meta-item"><span>Período</span><strong>${safeText(PERIOD_LABELS[item.period_key] || "-")}</strong></div>
        <div class="admin-details-meta-item"><span>Categoria</span><strong>${safeText(item.category_name)}</strong></div>
        <div class="admin-details-meta-item"><span>Status</span><strong>${safeText(isOverdue(item) ? "Atrasada" : STATUS_LABELS[item.status])}</strong></div>
        <div class="admin-details-meta-item"><span>Prioridade</span><strong>${safeText(PRIORITY_LABELS[item.priority] || "Normal")}</strong></div>
        <div class="admin-details-meta-item"><span>Responsável</span><strong>${safeText(getResponsibleName(item))}</strong></div>
        <div class="admin-details-meta-item"><span>Prazo</span><strong>${safeText(item.due_date ? formatDateOnly(item.due_date) : "Sem prazo")}</strong></div>
      </div>
    </section>
    <section class="admin-details-section">
      <span class="admin-details-label">Descrição</span>
      <p>${safeText(item.description || "Nenhuma descrição cadastrada.")}</p>
    </section>
    <section class="admin-details-section">
      <span class="admin-details-label">Observações</span>
      <p>${safeText(item.notes || "Nenhuma observação cadastrada.")}</p>
    </section>
    <section class="admin-details-section">
      <span class="admin-details-label">Ações</span>
      <div class="admin-detail-action-grid">
        <button class="admin-detail-action-card" data-checklist-detail-action="edit" data-checklist-id="${escapeAttribute(item.id)}">
          <span class="admin-detail-action-icon">${renderIcon("edit")}</span>
          <span class="admin-detail-action-text">
            <strong>Editar Tarefa</strong>
            <small>Abre o formulário para ajustar dados, prazo e status.</small>
          </span>
        </button>
        <button class="admin-detail-action-card ${item.status === "completed" ? "warning" : "success"}" data-checklist-detail-action="toggle-completed" data-checklist-id="${escapeAttribute(item.id)}">
          <span class="admin-detail-action-icon">${renderIcon(item.status === "completed" ? "rotate-ccw" : "check")}</span>
          <span class="admin-detail-action-text">
            <strong>${item.status === "completed" ? "Marcar Pendente" : "Concluir Tarefa"}</strong>
            <small>Atualiza rapidamente o andamento desta tarefa.</small>
          </span>
        </button>
        <button class="admin-detail-action-card danger" data-checklist-detail-action="delete" data-checklist-id="${escapeAttribute(item.id)}">
          <span class="admin-detail-action-icon">${renderIcon("trash-2")}</span>
          <span class="admin-detail-action-text">
            <strong>Excluir Tarefa</strong>
            <small>Remove esta tarefa do checklist.</small>
          </span>
        </button>
      </div>
    </section>
    <section class="admin-details-section">
      <span class="admin-details-label">Datas</span>
      <div class="admin-details-meta-grid">
        <div class="admin-details-meta-item"><span>Criada em</span><strong>${formatDate(item.created_at)}</strong></div>
        <div class="admin-details-meta-item"><span>Atualizada em</span><strong>${formatDate(item.updated_at)}</strong></div>
        <div class="admin-details-meta-item"><span>Concluída em</span><strong>${formatDate(item.completed_at)}</strong></div>
      </div>
    </section>
  `);

  checklistDetailsModal.classList.add("active");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeDetailsModal() {
  checklistDetailsModal.classList.remove("active");
}

async function loadChecklist() {
  const [categoriesResult, responsiblesResult, itemsResult] = await Promise.all([
    supabaseClient.rpc("admin_list_checklist_categories"),
    supabaseClient.rpc("admin_list_checklist_responsibles"),
    supabaseClient.rpc("admin_list_checklist_items"),
  ]);

  const error = categoriesResult.error || responsiblesResult.error || itemsResult.error;

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Erro ao carregar checklist");
    return;
  }

  cachedCategories = categoriesResult.data || [];
  cachedResponsibles = responsiblesResult.data || [];
  cachedItems = itemsResult.data || [];
  populatePeriodSelects();
  populateCategorySelects();
  populateResponsibleSelects();
  updateSummary();
  renderCategoryList();
  renderResponsibleList();
  renderChecklistBoard();
}

async function saveItem(event) {
  event.preventDefault();

  const wasEditing = Boolean(selectedItemId);
  const periodKey = checklistPeriodInput.value || "12_months_before";
  const orderValue =
    checklistOrderInput.value === ""
      ? getNextOrder(periodKey)
      : Number(checklistOrderInput.value || 0);

  const { data, error } = await supabaseClient.rpc("admin_save_checklist_item", {
    submitted_category_id: checklistCategoryInput.value,
    submitted_description: checklistDescriptionInput.value || "",
    submitted_display_order: orderValue,
    submitted_due_date: checklistDueDateInput.value || null,
    submitted_notes: checklistNotesInput.value || "",
    submitted_period_key: periodKey,
    submitted_priority: checklistPriorityInput.value,
    submitted_responsible_id: checklistOwnerInput.value,
    submitted_status: checklistStatusInput.value,
    submitted_title: checklistTitleInput.value,
    target_item_id: selectedItemId,
  });

  if (error || !data?.length) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar a tarefa");
    return;
  }

  closeItemModal();
  showAdminToast(wasEditing ? "💜 Tarefa atualizada com sucesso!" : "💜 Tarefa criada com sucesso!");
  await loadChecklist();
}

async function saveCategory(event) {
  event.preventDefault();
  const orderValue = getSubmittedCategoryOrder();

  const { data, error } = await supabaseClient.rpc("admin_save_checklist_category", {
    submitted_color: categoryColorInput.value || DEFAULT_BRAND_COLOR,
    submitted_display_order: orderValue,
    submitted_icon: categoryIconInput.value || "check-square",
    submitted_is_active: categoryActiveInput.checked,
    submitted_name: categoryNameInput.value,
    target_category_id: selectedCategoryId,
  });

  if (error || !data?.length) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar a categoria");
    return;
  }

  showAdminToast(selectedCategoryId ? "💜 Categoria atualizada com sucesso!" : "💜 Categoria criada com sucesso!");
  resetCategoryForm();
  await loadChecklist();
}

async function saveResponsible(event) {
  event.preventDefault();
  const orderValue = getSubmittedResponsibleOrder();

  const { data, error } = await supabaseClient.rpc("admin_save_checklist_responsible", {
    submitted_display_order: orderValue,
    submitted_is_active: responsibleActiveInput.checked,
    submitted_name: responsibleNameInput.value,
    submitted_responsible_type: responsibleTypeInput.value || "person",
    target_responsible_id: selectedResponsibleId,
  });

  if (error || !data?.length) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar o responsável");
    return;
  }

  showAdminToast(selectedResponsibleId ? "💜 Responsável atualizado com sucesso!" : "💜 Responsável criado com sucesso!");
  resetResponsibleForm();
  await loadChecklist();
}

async function setItemStatus(itemId, status) {
  const { data, error } = await supabaseClient.rpc("admin_set_checklist_item_status", {
    submitted_status: status,
    target_item_id: itemId,
  });

  if (error || data !== true) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível atualizar a tarefa");
    return;
  }

  showAdminToast(status === "completed" ? "💜 Tarefa concluída com sucesso!" : "💜 Tarefa reaberta com sucesso!");
  await loadChecklist();
}

async function deleteItem(itemId) {
  if (!confirm("Deseja excluir esta tarefa do checklist?")) {
    return;
  }

  const { data, error } = await supabaseClient.rpc("admin_delete_checklist_item", {
    target_item_id: itemId,
  });

  if (error || data !== true) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível excluir a tarefa");
    return;
  }

  closeDetailsModal();
  showAdminToast("💜 Tarefa excluída com sucesso!");
  await loadChecklist();
}

async function deleteCategory(categoryId) {
  if (!confirm("Deseja excluir esta categoria? Categorias com tarefas não podem ser excluídas.")) {
    return;
  }

  const { data, error } = await supabaseClient.rpc("admin_delete_checklist_category", {
    target_category_id: categoryId,
  });

  if (error || data !== true) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível excluir a categoria. Verifique se ela ainda possui tarefas");
    return;
  }

  showAdminToast("💜 Categoria excluída com sucesso!");
  await loadChecklist();
}

async function deleteResponsible(responsibleId) {
  if (!confirm("Deseja excluir este responsável? Responsáveis com tarefas não podem ser excluídos.")) {
    return;
  }

  const { data, error } = await supabaseClient.rpc("admin_delete_checklist_responsible", {
    target_responsible_id: responsibleId,
  });

  if (error || data !== true) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível excluir o responsável. Verifique se ele ainda possui tarefas");
    return;
  }

  showAdminToast("💜 Responsável excluído com sucesso!");
  await loadChecklist();
}

function getChecklistExportStatus(item) {
  return isOverdue(item) ? "Atrasada" : STATUS_LABELS[item.status] || "Pendente";
}

function exportChecklistCSV() {
  if (!visibleItems.length) {
    showAdminToast("⚠️ Nenhuma tarefa para exportar");
    return;
  }

  AdminExport.downloadCSV("checklist", [
    { label: "Período", value: (item) => PERIOD_LABELS[item.period_key] || "" },
    { label: "Tarefa", value: "title" },
    { label: "Categoria", value: "category_name" },
    { label: "Responsável", value: getResponsibleName },
    { label: "Status", value: getChecklistExportStatus },
    { label: "Prioridade", value: (item) => PRIORITY_LABELS[item.priority] || "Normal" },
    { label: "Prazo", value: (item) => formatDateOnly(item.due_date) },
    { label: "Atrasada", value: (item) => (isOverdue(item) ? "Sim" : "Não") },
    { label: "Ordem", value: (item) => Number(item.display_order || 0) },
    { label: "Descrição", value: "description" },
    { label: "Observações", value: "notes" },
    { label: "Criada em", value: (item) => formatDate(item.created_at) },
    { label: "Atualizada em", value: (item) => formatDate(item.updated_at) },
    { label: "Concluída em", value: (item) => formatDate(item.completed_at) },
  ], visibleItems);

  showAdminToast("💜 CSV do checklist exportado!");
}

function renderChecklistOrderModal() {
  const source = checklistOrderedIds.map(getItemById).filter(Boolean);

  if (!source.length) {
    replaceSafeContent(checklistOrderList, '<div class="admin-empty-state">Nenhuma tarefa neste período.</div>');
    return;
  }

  replaceSafeContent(
    checklistOrderList,
    source
      .map(
        (item, index) => `
          <article class="vendor-order-item" draggable="true" data-checklist-order-id="${escapeAttribute(item.id)}">
            <span class="vendor-order-handle" aria-hidden="true">${renderIcon("grip-vertical")}</span>
            <div>
              <strong class="vendor-order-name">${safeText(item.title)}</strong>
              <span class="vendor-order-category">${safeText(item.category_name)} · ${safeText(getResponsibleName(item))}</span>
            </div>
            <div class="vendor-order-actions">
              <button type="button" class="vendor-order-action" data-checklist-order-action="up" data-checklist-id="${escapeAttribute(item.id)}" ${index === 0 ? "disabled" : ""} aria-label="Subir tarefa">${renderIcon("chevron-up")}</button>
              <button type="button" class="vendor-order-action" data-checklist-order-action="down" data-checklist-id="${escapeAttribute(item.id)}" ${index === source.length - 1 ? "disabled" : ""} aria-label="Descer tarefa">${renderIcon("chevron-down")}</button>
            </div>
          </article>
        `,
      )
      .join(""),
  );

  window.lucide?.createIcons();
}

function updateChecklistOrderPeriodOptions(selectedPeriodKey = "") {
  checklistOrderPeriodSelect.replaceChildren();

  PERIODS.forEach(([key, label]) => {
    const count = cachedItems.filter((item) => item.period_key === key).length;
    checklistOrderPeriodSelect.appendChild(new Option(`${label} (${count})`, key));
  });

  checklistOrderPeriodSelect.value =
    selectedPeriodKey && PERIOD_ORDER.has(selectedPeriodKey)
      ? selectedPeriodKey
      : PERIODS[0][0];
}

function setChecklistOrderPeriod(periodKey) {
  checklistOrderPeriodKey = periodKey;
  checklistOrderedIds = getDefaultOrderedItems(periodKey).map((item) => item.id);
  checklistOrderDescription.textContent = `Ordem das tarefas em ${PERIOD_LABELS[periodKey] || "período selecionado"}.`;
  renderChecklistOrderModal();
}

function openChecklistOrderModal(periodKey = "") {
  if (!cachedItems.length) {
    showAdminToast("⚠️ Cadastre uma tarefa antes de organizar a ordem");
    return;
  }

  const selectedPeriodKey = periodKey || checklistPeriodFilter.value || PERIODS[0][0];

  updateChecklistOrderPeriodOptions(selectedPeriodKey);
  setChecklistOrderPeriod(checklistOrderPeriodSelect.value);
  checklistOrderModal.classList.add("active");
  checklistOrderModal.setAttribute("aria-hidden", "false");
}

function closeChecklistOrderModal() {
  checklistOrderModal.classList.remove("active");
  checklistOrderModal.setAttribute("aria-hidden", "true");
  draggedChecklistItemId = null;
  checklistOrderPeriodKey = "";
  checklistOrderedIds = [];
}

function moveChecklistOrderItem(itemId, direction) {
  const currentIndex = checklistOrderedIds.indexOf(itemId);
  const nextIndex = currentIndex + direction;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= checklistOrderedIds.length) {
    return;
  }

  const nextOrder = [...checklistOrderedIds];
  [nextOrder[currentIndex], nextOrder[nextIndex]] = [
    nextOrder[nextIndex],
    nextOrder[currentIndex],
  ];
  checklistOrderedIds = nextOrder;
  renderChecklistOrderModal();
}

function reorderDraggedChecklistItem(targetId, shouldInsertAfter) {
  if (!draggedChecklistItemId || draggedChecklistItemId === targetId) {
    return;
  }

  const nextOrder = checklistOrderedIds.filter((id) => id !== draggedChecklistItemId);
  const targetIndex = nextOrder.indexOf(targetId);

  if (targetIndex < 0) {
    return;
  }

  nextOrder.splice(targetIndex + (shouldInsertAfter ? 1 : 0), 0, draggedChecklistItemId);
  checklistOrderedIds = nextOrder;
  renderChecklistOrderModal();
}

async function saveChecklistOrder() {
  if (!checklistOrderPeriodKey) {
    showAdminToast("⚠️ Selecione um período para salvar a ordem");
    return;
  }

  saveChecklistOrderButton.disabled = true;

  const { error } = await supabaseClient.rpc("admin_reorder_checklist_items", {
    submitted_item_ids: checklistOrderedIds,
    submitted_period_key: checklistOrderPeriodKey,
  });

  saveChecklistOrderButton.disabled = false;

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar a ordem");
    return;
  }

  showAdminToast("💜 Ordem salva!");
  closeChecklistOrderModal();
  await loadChecklist();
}

function applySummaryFilter(summary) {
  checklistStatusFilter.value = summary === "total" ? "" : summary;
  renderChecklistBoard();
}

[
  checklistSearchInput,
  checklistPeriodFilter,
  checklistStatusFilter,
  checklistCategoryFilter,
  checklistOwnerFilter,
  checklistPriorityFilter,
].forEach((filter) => {
  filter?.addEventListener("input", renderChecklistBoard);
  filter?.addEventListener("change", renderChecklistBoard);
});

checklistSummaryCards.forEach((card) => {
  card.addEventListener("click", () => applySummaryFilter(card.dataset.checklistSummary));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      applySummaryFilter(card.dataset.checklistSummary);
    }
  });
});

clearChecklistFiltersButton?.addEventListener("click", () => {
  checklistSearchInput.value = "";
  checklistPeriodFilter.value = "";
  checklistStatusFilter.value = "";
  checklistCategoryFilter.value = "";
  checklistOwnerFilter.value = "";
  checklistPriorityFilter.value = "";
  renderChecklistBoard();
});

refreshChecklistButton?.addEventListener("click", loadChecklist);
exportChecklistButton?.addEventListener("click", exportChecklistCSV);
openChecklistItemModalButton?.addEventListener("click", () => openItemModal());
closeChecklistItemModalButton?.addEventListener("click", closeItemModal);
checklistItemForm?.addEventListener("submit", saveItem);
closeChecklistOrderModalButton?.addEventListener("click", closeChecklistOrderModal);
checklistOrderPeriodSelect?.addEventListener("change", () => {
  setChecklistOrderPeriod(checklistOrderPeriodSelect.value);
});
saveChecklistOrderButton?.addEventListener("click", saveChecklistOrder);

openCategoryManagerButton?.addEventListener("click", openCategoryManager);
closeCategoryManagerButton?.addEventListener("click", closeCategoryManager);
checklistCategoryForm?.addEventListener("submit", saveCategory);
cancelCategoryEditButton?.addEventListener("click", resetCategoryForm);
categoryIconInput?.addEventListener("change", updateCategoryIconPreview);
categoryColorInput?.addEventListener("input", updateCategoryIconPreview);

openResponsibleManagerButton?.addEventListener("click", openResponsibleManager);
closeResponsibleManagerButton?.addEventListener("click", closeResponsibleManager);
checklistResponsibleForm?.addEventListener("submit", saveResponsible);
cancelResponsibleEditButton?.addEventListener("click", resetResponsibleForm);

checklistBoard?.addEventListener("click", (event) => {
  const periodAction = event.target.closest("[data-checklist-period-action]");

  if (periodAction) {
    const periodKey = periodAction.dataset.checklistPeriod || "12_months_before";

    if (periodAction.dataset.checklistPeriodAction === "new") {
      openItemModal(null, periodKey);
    }

    if (periodAction.dataset.checklistPeriodAction === "order") {
      openChecklistOrderModal(periodKey);
    }

    return;
  }

  const checkbox = event.target.closest("[data-checklist-action='toggle-completed']");

  if (checkbox) {
    const item = getItemById(checkbox.dataset.checklistId);

    if (item) {
      setItemStatus(item.id, item.status === "completed" ? "pending" : "completed");
    }

    return;
  }

  const button = event.target.closest("[data-checklist-action]");

  if (button?.dataset.checklistAction === "details") {
    const item = getItemById(button.dataset.checklistId);

    if (item) {
      openDetailsModal(item);
    }
  }
});

checklistCategoryList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category-action]");

  if (!button) {
    return;
  }

  const category = getCategoryById(button.dataset.categoryId);

  if (button.dataset.categoryAction === "edit" && category) {
    selectedCategoryId = category.id;
    categoryNameInput.value = category.name || "";
    categoryColorInput.value = category.color || DEFAULT_BRAND_COLOR;
    categoryIconInput.value = category.icon || "check-square";
    updateCategoryIconPreview();
    categoryOrderInput.value = getCategoryInputOrder(category);
    categoryActiveInput.checked = Boolean(category.is_active);
    cancelCategoryEditButton.classList.remove("is-hidden");
    scrollToChecklistManagerForm(checklistCategoryForm, categoryNameInput);
  }

  if (button.dataset.categoryAction === "delete") {
    deleteCategory(button.dataset.categoryId);
  }
});

checklistResponsibleList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-responsible-action]");

  if (!button) {
    return;
  }

  const responsible = getResponsibleById(button.dataset.responsibleId);

  if (button.dataset.responsibleAction === "edit" && responsible) {
    selectedResponsibleId = responsible.id;
    responsibleNameInput.value = responsible.name || "";
    responsibleTypeInput.value = responsible.responsible_type || "person";
    responsibleOrderInput.value = getResponsibleInputOrder(responsible);
    responsibleActiveInput.checked = Boolean(responsible.is_active);
    cancelResponsibleEditButton.classList.remove("is-hidden");
    scrollToChecklistManagerForm(checklistResponsibleForm, responsibleNameInput);
  }

  if (button.dataset.responsibleAction === "delete") {
    deleteResponsible(button.dataset.responsibleId);
  }
});

checklistOrderList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-checklist-order-action]");

  if (!button) {
    return;
  }

  moveChecklistOrderItem(
    button.dataset.checklistId,
    button.dataset.checklistOrderAction === "up" ? -1 : 1,
  );
});

checklistOrderList?.addEventListener("dragstart", (event) => {
  const item = event.target.closest("[data-checklist-order-id]");

  if (!item) {
    return;
  }

  draggedChecklistItemId = item.dataset.checklistOrderId;
  item.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedChecklistItemId);
});

checklistOrderList?.addEventListener("dragend", (event) => {
  event.target.closest("[data-checklist-order-id]")?.classList.remove("is-dragging");
  draggedChecklistItemId = null;
});

checklistOrderList?.addEventListener("dragover", (event) => {
  if (!event.target.closest("[data-checklist-order-id]") || !draggedChecklistItemId) {
    return;
  }

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
});

checklistOrderList?.addEventListener("drop", (event) => {
  const item = event.target.closest("[data-checklist-order-id]");

  if (!item) {
    return;
  }

  event.preventDefault();
  const rect = item.getBoundingClientRect();
  reorderDraggedChecklistItem(
    item.dataset.checklistOrderId,
    event.clientY > rect.top + rect.height / 2,
  );
});

closeChecklistDetailsModalButton?.addEventListener("click", closeDetailsModal);
checklistDetailsContent?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-checklist-detail-action]");

  if (!button) {
    return;
  }

  const item = getItemById(button.dataset.checklistId);

  if (!item) {
    return;
  }

  if (button.dataset.checklistDetailAction === "edit") {
    closeDetailsModal();
    openItemModal(item);
  }

  if (button.dataset.checklistDetailAction === "toggle-completed") {
    closeDetailsModal();
    setItemStatus(item.id, item.status === "completed" ? "pending" : "completed");
  }

  if (button.dataset.checklistDetailAction === "delete") {
    deleteItem(item.id);
  }
});

[checklistItemModal, checklistCategoryModal, checklistResponsibleModal, checklistDetailsModal, checklistOrderModal].forEach((modal) => {
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    }
  });
});

populateCategoryIconSelect();
updateCategoryIconPreview();
populatePeriodSelects();
loadChecklist();
