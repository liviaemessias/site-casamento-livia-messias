AdminCommon.setupLogout();

const sectionsTableBody = document.getElementById("sectionsTableBody");
const activitiesTableBody = document.getElementById("activitiesTableBody");
const sectionSearchInput = document.getElementById("sectionSearchInput");
const sectionVisibilityFilter = document.getElementById("sectionVisibilityFilter");
const sectionFilterCount = document.getElementById("sectionFilterCount");
const clearSectionFiltersButton = document.getElementById("clearSectionFiltersButton");
const activitySearchInput = document.getElementById("activitySearchInput");
const activitySectionFilter = document.getElementById("activitySectionFilter");
const activityTypeFilter = document.getElementById("activityTypeFilter");
const activityTimeModeFilter = document.getElementById("activityTimeModeFilter");
const activityVisibilityFilter = document.getElementById("activityVisibilityFilter");
const activityFilterCount = document.getElementById("activityFilterCount");
const clearActivityFiltersButton = document.getElementById("clearActivityFiltersButton");
const refreshScheduleButton = document.getElementById("refreshScheduleButton");
const openSectionModalButton = document.getElementById("openSectionModalButton");
const openActivityModalButton = document.getElementById("openActivityModalButton");
const openSectionOrderModalButton = document.getElementById("openSectionOrderModalButton");
const openActivityOrderModalButton = document.getElementById("openActivityOrderModalButton");
const sectionModal = document.getElementById("sectionModal");
const activityModal = document.getElementById("activityModal");
const closeSectionModalButton = document.getElementById("closeSectionModalButton");
const closeActivityModalButton = document.getElementById("closeActivityModalButton");
const sectionModalTitle = document.getElementById("sectionModalTitle");
const activityModalTitle = document.getElementById("activityModalTitle");
const sectionForm = document.getElementById("sectionForm");
const activityForm = document.getElementById("activityForm");
const sectionTitleInput = document.getElementById("sectionTitleInput");
const sectionLocationInput = document.getElementById("sectionLocationInput");
const sectionAddressInput = document.getElementById("sectionAddressInput");
const sectionOrderInput = document.getElementById("sectionOrderInput");
const sectionDescriptionInput = document.getElementById("sectionDescriptionInput");
const sectionVisibleInput = document.getElementById("sectionVisibleInput");
const activitySectionInput = document.getElementById("activitySectionInput");
const activityTitleInput = document.getElementById("activityTitleInput");
const activityTypeInput = document.getElementById("activityTypeInput");
const activityTimeModeInput = document.getElementById("activityTimeModeInput");
const activityStartTimeInput = document.getElementById("activityStartTimeInput");
const activityEndTimeInput = document.getElementById("activityEndTimeInput");
const activityOrderInput = document.getElementById("activityOrderInput");
const activityDescriptionInput = document.getElementById("activityDescriptionInput");
const activityVisibleInput = document.getElementById("activityVisibleInput");
const scheduleDetailsModal = document.getElementById("scheduleDetailsModal");
const closeScheduleDetailsModalButton = document.getElementById("closeScheduleDetailsModalButton");
const scheduleDetailsTitle = document.getElementById("scheduleDetailsTitle");
const scheduleDetailsContent = document.getElementById("scheduleDetailsContent");
const scheduleOrderModal = document.getElementById("scheduleOrderModal");
const closeScheduleOrderModalButton = document.getElementById("closeScheduleOrderModalButton");
const scheduleOrderTitle = document.getElementById("scheduleOrderTitle");
const scheduleOrderDescription = document.getElementById("scheduleOrderDescription");
const scheduleOrderSectionField = document.getElementById("scheduleOrderSectionField");
const scheduleOrderSectionSelect = document.getElementById("scheduleOrderSectionSelect");
const scheduleOrderList = document.getElementById("scheduleOrderList");
const saveScheduleOrderButton = document.getElementById("saveScheduleOrderButton");
const scheduleSectionCount = document.getElementById("scheduleSectionCount");
const scheduleActivityCount = document.getElementById("scheduleActivityCount");
const scheduleVisibleCount = document.getElementById("scheduleVisibleCount");
const scheduleTbdCount = document.getElementById("scheduleTbdCount");
const scheduleSummaryCards = document.querySelectorAll("[data-schedule-summary]");

const showAdminToast = AdminCommon.showToast;
const { escapeAttribute, replaceSafeContent, safeText } = SecurityUtils;

const ACTIVITY_TYPE_LABELS = {
  attraction: "Atração",
  island: "Ilha",
  moment: "Momento",
  other: "Outro",
  service: "Serviço",
};

const TIME_MODE_LABELS = {
  available: "Disponível",
  period: "Período",
  scheduled: "Horário Específico",
  tbd: "A Definir",
};

let cachedSections = [];
let cachedActivities = [];
let selectedSectionId = null;
let selectedActivityId = null;
let orderMode = "sections";
let orderSectionId = null;
let orderedIds = [];
let draggedItemId = null;
let sectionSortState = { key: "order", direction: "asc" };
let activitySortState = { key: "order", direction: "asc" };

function renderIcon(name) {
  return `<i data-lucide="${safeText(name)}" aria-hidden="true"></i>`;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
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

function formatTime(value) {
  return value ? String(value).slice(0, 5) : "";
}

function formatDate(value) {
  if (!value) {
    return "Não informado";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Não informado"
    : date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function getSectionById(sectionId) {
  return cachedSections.find((section) => section.id === sectionId);
}

function getActivityById(activityId) {
  return cachedActivities.find((activity) => activity.id === activityId);
}

function getSectionTitle(sectionId) {
  return getSectionById(sectionId)?.title || "Etapa não encontrada";
}

function getTimeLabel(activity) {
  if (activity.time_mode === "available") {
    return "Disponível";
  }

  if (activity.time_mode === "tbd") {
    return "A definir";
  }

  if (activity.time_mode === "period") {
    return `${formatTime(activity.start_time)} - ${formatTime(activity.end_time)}`;
  }

  return formatTime(activity.start_time);
}

function getNextSectionOrder() {
  return Math.max(0, ...cachedSections.map((section) => Number(section.display_order || 0))) + 1;
}

function getNextActivityOrder(sectionId) {
  return (
    Math.max(
      0,
      ...cachedActivities
        .filter((activity) => activity.section_id === sectionId)
        .map((activity) => Number(activity.display_order || 0)),
    ) + 1
  );
}

function getSubmittedSectionOrder() {
  return sectionOrderInput.value === ""
    ? getNextSectionOrder()
    : Number(sectionOrderInput.value || 0);
}

function getSubmittedActivityOrder() {
  return activityOrderInput.value === ""
    ? getNextActivityOrder(activitySectionInput.value)
    : Number(activityOrderInput.value || 0);
}

function renderVisibilityToggle(entity, actionName) {
  const visible = Boolean(entity.is_visible);

  return `
    <label class="admin-table-checkbox" title="${visible ? "Ocultar" : "Exibir"}">
      <input
        type="checkbox"
        data-schedule-action="${actionName}"
        data-schedule-id="${escapeAttribute(entity.id)}"
        ${visible ? "checked" : ""}
        aria-label="${visible ? "Visível" : "Oculto"}"
      />
    </label>
  `;
}

function updateSummary() {
  scheduleSectionCount.textContent = String(cachedSections.length);
  scheduleActivityCount.textContent = String(cachedActivities.length);
  scheduleVisibleCount.textContent = String(
    cachedActivities.filter((activity) => activity.is_visible).length,
  );
  scheduleTbdCount.textContent = String(
    cachedActivities.filter((activity) => activity.time_mode === "tbd").length,
  );
}

function updateActivitySectionOptions() {
  const currentFilterValue = activitySectionFilter.value;
  const currentInputValue = activitySectionInput.value;

  activitySectionFilter.replaceChildren(new Option("Todas", ""));
  activitySectionInput.replaceChildren(new Option("Selecione", ""));

  cachedSections.forEach((section) => {
    activitySectionFilter.appendChild(new Option(section.title, section.id));
    activitySectionInput.appendChild(new Option(section.title, section.id));
  });

  if (cachedSections.some((section) => section.id === currentFilterValue)) {
    activitySectionFilter.value = currentFilterValue;
  }

  if (cachedSections.some((section) => section.id === currentInputValue)) {
    activitySectionInput.value = currentInputValue;
  }
}

function getSectionSortValue(section) {
  const values = {
    location: section.location_name,
    order: Number(section.display_order || 0),
    title: section.title,
    visible: section.is_visible ? 1 : 0,
  };

  return values[sectionSortState.key] ?? "";
}

function getActivitySortValue(activity) {
  const values = {
    order: Number(activity.display_order || 0),
    section: getSectionTitle(activity.section_id),
    timeMode: activity.time_mode,
    title: activity.title,
    type: ACTIVITY_TYPE_LABELS[activity.activity_type],
    visible: activity.is_visible ? 1 : 0,
  };

  return values[activitySortState.key] ?? "";
}

function sortSections(sections) {
  return [...sections].sort((first, second) => {
    let result = compareValues(getSectionSortValue(first), getSectionSortValue(second));

    if (result === 0) {
      result = compareValues(first.title, second.title);
    }

    return sectionSortState.direction === "asc" ? result : -result;
  });
}

function sortActivities(activities) {
  return [...activities].sort((first, second) => {
    let result = compareValues(getActivitySortValue(first), getActivitySortValue(second));

    if (result === 0) {
      result = compareValues(first.title, second.title);
    }

    return activitySortState.direction === "asc" ? result : -result;
  });
}

function updateSortButtons(selector, key, direction, datasetName) {
  document.querySelectorAll(selector).forEach((button) => {
    button.classList.remove("sorted-asc", "sorted-desc");

    if (button.dataset[datasetName] === key) {
      button.classList.add(`sorted-${direction}`);
    }
  });
}

function setSectionSort(key) {
  sectionSortState =
    sectionSortState.key === key
      ? { key, direction: sectionSortState.direction === "asc" ? "desc" : "asc" }
      : { key, direction: "asc" };
  renderSectionsTable();
}

function setActivitySort(key) {
  activitySortState =
    activitySortState.key === key
      ? { key, direction: activitySortState.direction === "asc" ? "desc" : "asc" }
      : { key, direction: "asc" };
  renderActivitiesTable();
}

function getFilteredSections() {
  const search = normalizeText(sectionSearchInput.value);
  const visibility = sectionVisibilityFilter.value;

  return sortSections(
    cachedSections.filter((section) => {
      const searchable = normalizeText(
        [section.title, section.location_name, section.address, section.description]
          .filter(Boolean)
          .join(" "),
      );

      return (
        (!search || searchable.includes(search)) &&
        (!visibility ||
          (visibility === "visible" ? section.is_visible : !section.is_visible))
      );
    }),
  );
}

function getFilteredActivities() {
  const search = normalizeText(activitySearchInput.value);
  const sectionId = activitySectionFilter.value;
  const type = activityTypeFilter.value;
  const timeMode = activityTimeModeFilter.value;
  const visibility = activityVisibilityFilter.value;

  return sortActivities(
    cachedActivities.filter((activity) => {
      const searchable = normalizeText(
        [
          activity.title,
          getSectionTitle(activity.section_id),
          ACTIVITY_TYPE_LABELS[activity.activity_type],
          TIME_MODE_LABELS[activity.time_mode],
          activity.description,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return (
        (!search || searchable.includes(search)) &&
        (!sectionId || activity.section_id === sectionId) &&
        (!type || activity.activity_type === type) &&
        (!timeMode || activity.time_mode === timeMode) &&
        (!visibility ||
          (visibility === "visible" ? activity.is_visible : !activity.is_visible))
      );
    }),
  );
}

function renderSectionsTable() {
  const sections = getFilteredSections();
  sectionFilterCount.textContent = `${sections.length} de ${cachedSections.length} etapas`;
  updateSortButtons("[data-section-sort]", sectionSortState.key, sectionSortState.direction, "sectionSort");

  if (!sections.length) {
    replaceSafeContent(
      sectionsTableBody,
      '<tr><td colspan="5" class="admin-empty-state">Nenhuma etapa encontrada.</td></tr>',
    );
    return;
  }

  replaceSafeContent(
    sectionsTableBody,
    sections
      .map(
        (section) => `
          <tr>
            <td>
              <strong>${safeText(section.title)}</strong>
              <span class="admin-muted guest-table-type">${safeText(section.description, "")}</span>
            </td>
            <td>${safeText(section.location_name)}</td>
            <td>${renderVisibilityToggle(section, "toggle-section-visible")}</td>
            <td>${safeText(section.display_order ?? 0)}</td>
            <td>
              <div class="admin-actions compact-actions">
                <button type="button" class="admin-action-button icon-action" data-schedule-action="section-details" data-schedule-id="${escapeAttribute(section.id)}">
                  ${renderIcon("eye")} Detalhes
                </button>
                <button type="button" class="admin-action-button icon-action" data-schedule-action="section-edit" data-schedule-id="${escapeAttribute(section.id)}">
                  ${renderIcon("edit")} Editar
                </button>
              </div>
            </td>
          </tr>
        `,
      )
      .join(""),
  );

  window.lucide?.createIcons();
}

function renderActivitiesTable() {
  const activities = getFilteredActivities();
  activityFilterCount.textContent = `${activities.length} de ${cachedActivities.length} atividades`;
  updateSortButtons("[data-activity-sort]", activitySortState.key, activitySortState.direction, "activitySort");

  if (!activities.length) {
    replaceSafeContent(
      activitiesTableBody,
      '<tr><td colspan="7" class="admin-empty-state">Nenhuma atividade encontrada.</td></tr>',
    );
    return;
  }

  replaceSafeContent(
    activitiesTableBody,
    activities
      .map(
        (activity) => `
          <tr>
            <td>
              <strong>${safeText(activity.title)}</strong>
              <span class="admin-muted guest-table-type">${safeText(activity.description, "")}</span>
            </td>
            <td>${safeText(getSectionTitle(activity.section_id))}</td>
            <td>${safeText(ACTIVITY_TYPE_LABELS[activity.activity_type] || "Outro")}</td>
            <td>${safeText(getTimeLabel(activity))}</td>
            <td>${renderVisibilityToggle(activity, "toggle-activity-visible")}</td>
            <td>${safeText(activity.display_order ?? 0)}</td>
            <td>
              <div class="admin-actions compact-actions">
                <button type="button" class="admin-action-button icon-action" data-schedule-action="activity-details" data-schedule-id="${escapeAttribute(activity.id)}">
                  ${renderIcon("eye")} Detalhes
                </button>
                <button type="button" class="admin-action-button icon-action" data-schedule-action="activity-edit" data-schedule-id="${escapeAttribute(activity.id)}">
                  ${renderIcon("edit")} Editar
                </button>
              </div>
            </td>
          </tr>
        `,
      )
      .join(""),
  );

  window.lucide?.createIcons();
}

function renderAll() {
  updateSummary();
  updateActivitySectionOptions();
  renderSectionsTable();
  renderActivitiesTable();
}

async function loadScheduleAdmin() {
  refreshScheduleButton.disabled = true;

  const [sectionsResult, activitiesResult] = await Promise.all([
    supabaseClient.rpc("admin_list_schedule_sections"),
    supabaseClient.rpc("admin_list_schedule_activities"),
  ]);

  refreshScheduleButton.disabled = false;

  const error = sectionsResult.error || activitiesResult.error;

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível carregar a programação");
    return;
  }

  cachedSections = sectionsResult.data || [];
  cachedActivities = activitiesResult.data || [];
  renderAll();
}

function clearSectionForm() {
  selectedSectionId = null;
  sectionForm.reset();
  sectionOrderInput.value = String(getNextSectionOrder());
  sectionVisibleInput.checked = true;
}

function openSectionModal(section = null) {
  clearSectionForm();

  if (section) {
    selectedSectionId = section.id;
    sectionModalTitle.textContent = "Editar Etapa";
    sectionTitleInput.value = section.title || "";
    sectionLocationInput.value = section.location_name || "";
    sectionAddressInput.value = section.address || "";
    sectionOrderInput.value = section.display_order ?? 0;
    sectionDescriptionInput.value = section.description || "";
    sectionVisibleInput.checked = Boolean(section.is_visible);
  } else {
    sectionModalTitle.textContent = "Nova Etapa";
  }

  sectionModal.classList.add("active");
  sectionModal.setAttribute("aria-hidden", "false");
}

function closeSectionModal() {
  sectionModal.classList.remove("active");
  sectionModal.setAttribute("aria-hidden", "true");
  clearSectionForm();
}

function clearActivityForm() {
  selectedActivityId = null;
  activityForm.reset();
  activityTypeInput.value = "moment";
  activityTimeModeInput.value = "scheduled";
  activitySectionInput.value = cachedSections[0]?.id || "";
  activityOrderInput.value = activitySectionInput.value
    ? String(getNextActivityOrder(activitySectionInput.value))
    : "";
  activityVisibleInput.checked = true;
  syncTimeFields();
}

function openActivityModal(activity = null) {
  if (!cachedSections.length) {
    showAdminToast("⚠️ Cadastre uma etapa antes de criar uma atividade");
    return;
  }

  clearActivityForm();

  if (activity) {
    selectedActivityId = activity.id;
    activityModalTitle.textContent = "Editar Atividade";
    activitySectionInput.value = activity.section_id || "";
    activityTitleInput.value = activity.title || "";
    activityTypeInput.value = activity.activity_type || "moment";
    activityTimeModeInput.value = activity.time_mode || "scheduled";
    activityStartTimeInput.value = formatTime(activity.start_time);
    activityEndTimeInput.value = formatTime(activity.end_time);
    activityOrderInput.value = activity.display_order ?? 0;
    activityDescriptionInput.value = activity.description || "";
    activityVisibleInput.checked = Boolean(activity.is_visible);
  } else {
    activityModalTitle.textContent = "Nova Atividade";
  }

  syncTimeFields();
  activityModal.classList.add("active");
  activityModal.setAttribute("aria-hidden", "false");
}

function closeActivityModal() {
  activityModal.classList.remove("active");
  activityModal.setAttribute("aria-hidden", "true");
  clearActivityForm();
}

function syncTimeFields() {
  const mode = activityTimeModeInput.value;
  const needsStart = mode === "scheduled" || mode === "period";
  const needsEnd = mode === "period";

  activityStartTimeInput.disabled = !needsStart;
  activityEndTimeInput.disabled = !needsEnd;
  activityStartTimeInput.required = needsStart;
  activityEndTimeInput.required = needsEnd;

  if (!needsStart) {
    activityStartTimeInput.value = "";
  }

  if (!needsEnd) {
    activityEndTimeInput.value = "";
  }
}

async function saveSection(event) {
  event.preventDefault();

  const { error } = await supabaseClient.rpc("admin_save_schedule_section", {
    submitted_address: sectionAddressInput.value,
    submitted_description: sectionDescriptionInput.value,
    submitted_display_order:
      sectionOrderInput.value === "" ? getNextSectionOrder() : Number(sectionOrderInput.value || 0),
    submitted_is_visible: sectionVisibleInput.checked,
    submitted_location_name: sectionLocationInput.value,
    submitted_title: sectionTitleInput.value,
    target_section_id: selectedSectionId,
  });

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar a etapa");
    return;
  }

  showAdminToast("💜 Etapa salva!");
  closeSectionModal();
  await loadScheduleAdmin();
}

async function saveActivity(event) {
  event.preventDefault();

  const { error } = await supabaseClient.rpc("admin_save_schedule_activity", {
    submitted_activity_type: activityTypeInput.value,
    submitted_description: activityDescriptionInput.value,
    submitted_display_order:
      activityOrderInput.value === ""
        ? getNextActivityOrder(activitySectionInput.value)
        : Number(activityOrderInput.value || 0),
    submitted_end_time: activityEndTimeInput.value || null,
    submitted_is_visible: activityVisibleInput.checked,
    submitted_section_id: activitySectionInput.value,
    submitted_start_time: activityStartTimeInput.value || null,
    submitted_time_mode: activityTimeModeInput.value,
    submitted_title: activityTitleInput.value,
    target_activity_id: selectedActivityId,
  });

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar a atividade");
    return;
  }

  showAdminToast("💜 Atividade salva!");
  closeActivityModal();
  await loadScheduleAdmin();
}

async function toggleSectionVisibility(sectionId) {
  const section = getSectionById(sectionId);

  if (!section) {
    return;
  }

  const { error } = await supabaseClient.rpc("admin_set_schedule_section_visible", {
    submitted_is_visible: !section.is_visible,
    target_section_id: sectionId,
  });

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível alterar a visibilidade");
    return;
  }

  showAdminToast(section.is_visible ? "💜 Etapa ocultada!" : "💜 Etapa exibida!");
  closeScheduleDetailsModal();
  await loadScheduleAdmin();
}

async function toggleActivityVisibility(activityId) {
  const activity = getActivityById(activityId);

  if (!activity) {
    return;
  }

  const { error } = await supabaseClient.rpc("admin_set_schedule_activity_visible", {
    submitted_is_visible: !activity.is_visible,
    target_activity_id: activityId,
  });

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível alterar a visibilidade");
    return;
  }

  showAdminToast(activity.is_visible ? "💜 Atividade ocultada!" : "💜 Atividade exibida!");
  closeScheduleDetailsModal();
  await loadScheduleAdmin();
}

async function deleteSection(sectionId) {
  const section = getSectionById(sectionId);

  if (!section || !confirm(`Deseja excluir "${section.title}" e suas atividades?`)) {
    return;
  }

  const { error } = await supabaseClient.rpc("admin_delete_schedule_section", {
    target_section_id: sectionId,
  });

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível excluir a etapa");
    return;
  }

  showAdminToast("💜 Etapa excluída!");
  closeScheduleDetailsModal();
  await loadScheduleAdmin();
}

async function deleteActivity(activityId) {
  const activity = getActivityById(activityId);

  if (!activity || !confirm(`Deseja excluir "${activity.title}"?`)) {
    return;
  }

  const { error } = await supabaseClient.rpc("admin_delete_schedule_activity", {
    target_activity_id: activityId,
  });

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível excluir a atividade");
    return;
  }

  showAdminToast("💜 Atividade excluída!");
  closeScheduleDetailsModal();
  await loadScheduleAdmin();
}

function renderActionCard({ action, className = "", description, icon, id, label, kind }) {
  return `
    <button
      type="button"
      class="admin-detail-action-card ${className}"
      data-schedule-detail-kind="${escapeAttribute(kind)}"
      data-schedule-detail-action="${escapeAttribute(action)}"
      data-schedule-id="${escapeAttribute(id)}"
    >
      <span class="admin-detail-action-icon">${renderIcon(icon)}</span>
      <span>
        <strong>${safeText(label)}</strong>
        <small>${safeText(description)}</small>
      </span>
    </button>
  `;
}

function openSectionDetails(sectionId) {
  const section = getSectionById(sectionId);

  if (!section) {
    showAdminToast("⚠️ Etapa não encontrada. Atualize a lista e tente novamente");
    return;
  }

  scheduleDetailsTitle.textContent = section.title || "Detalhes da Etapa";
  replaceSafeContent(
    scheduleDetailsContent,
    `
      <section class="admin-details-section">
        <span class="admin-details-label">Resumo</span>
        <div class="admin-details-meta-grid">
          <div class="admin-details-meta-item"><span>Local</span><strong>${safeText(section.location_name)}</strong></div>
          <div class="admin-details-meta-item"><span>Endereço</span><strong>${safeText(section.address || "Não informado")}</strong></div>
          <div class="admin-details-meta-item"><span>Visibilidade</span><strong>${section.is_visible ? "Visível" : "Oculta"}</strong></div>
          <div class="admin-details-meta-item"><span>Ordem</span><strong>${safeText(section.display_order ?? 0)}</strong></div>
        </div>
      </section>
      <section class="admin-details-section">
        <span class="admin-details-label">Descrição</span>
        <p>${safeText(section.description || "Nenhuma descrição cadastrada.")}</p>
      </section>
      <section class="admin-details-section">
        <span class="admin-details-label">Ações</span>
        <div class="admin-detail-action-grid">
          ${renderActionCard({ action: "edit", description: "Altera local, descrição, ordem e visibilidade.", icon: "edit", id: section.id, kind: "section", label: "Editar etapa" })}
          ${renderActionCard({ action: "toggle-visible", className: section.is_visible ? "warning" : "success", description: section.is_visible ? "Remove da página pública." : "Mostra na página pública.", icon: section.is_visible ? "eye-off" : "eye", id: section.id, kind: "section", label: section.is_visible ? "Ocultar etapa" : "Exibir etapa" })}
          ${renderActionCard({ action: "delete", className: "danger", description: "Remove a etapa e suas atividades.", icon: "trash-2", id: section.id, kind: "section", label: "Excluir etapa" })}
        </div>
      </section>
      <section class="admin-details-section">
        <span class="admin-details-label">Datas</span>
        <div class="admin-details-meta-grid">
          <div class="admin-details-meta-item"><span>Criada em</span><strong>${formatDate(section.created_at)}</strong></div>
          <div class="admin-details-meta-item"><span>Atualizada em</span><strong>${formatDate(section.updated_at)}</strong></div>
        </div>
      </section>
    `,
  );

  scheduleDetailsModal.classList.add("active");
  scheduleDetailsModal.setAttribute("aria-hidden", "false");
  window.lucide?.createIcons();
}

function openActivityDetails(activityId) {
  const activity = getActivityById(activityId);

  if (!activity) {
    showAdminToast("⚠️ Atividade não encontrada. Atualize a lista e tente novamente");
    return;
  }

  scheduleDetailsTitle.textContent = activity.title || "Detalhes da Atividade";
  replaceSafeContent(
    scheduleDetailsContent,
    `
      <section class="admin-details-section">
        <span class="admin-details-label">Resumo</span>
        <div class="admin-details-meta-grid">
          <div class="admin-details-meta-item"><span>Etapa</span><strong>${safeText(getSectionTitle(activity.section_id))}</strong></div>
          <div class="admin-details-meta-item"><span>Tipo</span><strong>${safeText(ACTIVITY_TYPE_LABELS[activity.activity_type] || "Outro")}</strong></div>
          <div class="admin-details-meta-item"><span>Horário</span><strong>${safeText(getTimeLabel(activity))}</strong></div>
          <div class="admin-details-meta-item"><span>Visibilidade</span><strong>${activity.is_visible ? "Visível" : "Oculta"}</strong></div>
          <div class="admin-details-meta-item"><span>Ordem</span><strong>${safeText(activity.display_order ?? 0)}</strong></div>
        </div>
      </section>
      <section class="admin-details-section">
        <span class="admin-details-label">Descrição</span>
        <p>${safeText(activity.description || "Nenhuma descrição cadastrada.")}</p>
      </section>
      <section class="admin-details-section">
        <span class="admin-details-label">Ações</span>
        <div class="admin-detail-action-grid">
          ${renderActionCard({ action: "edit", description: "Altera etapa, horário, descrição, ordem e visibilidade.", icon: "edit", id: activity.id, kind: "activity", label: "Editar atividade" })}
          ${renderActionCard({ action: "toggle-visible", className: activity.is_visible ? "warning" : "success", description: activity.is_visible ? "Remove da página pública." : "Mostra na página pública.", icon: activity.is_visible ? "eye-off" : "eye", id: activity.id, kind: "activity", label: activity.is_visible ? "Ocultar atividade" : "Exibir atividade" })}
          ${renderActionCard({ action: "delete", className: "danger", description: "Remove esta atividade da programação.", icon: "trash-2", id: activity.id, kind: "activity", label: "Excluir atividade" })}
        </div>
      </section>
      <section class="admin-details-section">
        <span class="admin-details-label">Datas</span>
        <div class="admin-details-meta-grid">
          <div class="admin-details-meta-item"><span>Criada em</span><strong>${formatDate(activity.created_at)}</strong></div>
          <div class="admin-details-meta-item"><span>Atualizada em</span><strong>${formatDate(activity.updated_at)}</strong></div>
        </div>
      </section>
    `,
  );

  scheduleDetailsModal.classList.add("active");
  scheduleDetailsModal.setAttribute("aria-hidden", "false");
  window.lucide?.createIcons();
}

function closeScheduleDetailsModal() {
  scheduleDetailsModal.classList.remove("active");
  scheduleDetailsModal.setAttribute("aria-hidden", "true");
}

function getDefaultOrderedSections() {
  return [...cachedSections].sort((a, b) => compareValues(a.display_order, b.display_order) || compareValues(a.title, b.title));
}

function getDefaultOrderedActivities(sectionId) {
  return cachedActivities
    .filter((activity) => activity.section_id === sectionId)
    .sort((a, b) => compareValues(a.display_order, b.display_order) || compareValues(a.title, b.title));
}

function renderOrderModal() {
  const source =
    orderMode === "sections"
      ? orderedIds.map(getSectionById).filter(Boolean)
      : orderedIds.map(getActivityById).filter(Boolean);

  if (!source.length) {
    replaceSafeContent(scheduleOrderList, '<div class="admin-empty-state">Nenhum item para ordenar.</div>');
    return;
  }

  replaceSafeContent(
    scheduleOrderList,
    source
      .map(
        (item, index) => `
          <article class="vendor-order-item" draggable="true" data-schedule-order-id="${escapeAttribute(item.id)}">
            <span class="vendor-order-handle" aria-hidden="true">${renderIcon("grip-vertical")}</span>
            <div>
              <strong class="vendor-order-name">${safeText(item.title)}</strong>
              <span class="vendor-order-category">${safeText(orderMode === "sections" ? item.location_name : getSectionTitle(item.section_id))}</span>
            </div>
            <div class="vendor-order-actions">
              <button type="button" class="vendor-order-action" data-schedule-order-action="up" data-schedule-id="${escapeAttribute(item.id)}" ${index === 0 ? "disabled" : ""} aria-label="Subir item">${renderIcon("chevron-up")}</button>
              <button type="button" class="vendor-order-action" data-schedule-order-action="down" data-schedule-id="${escapeAttribute(item.id)}" ${index === source.length - 1 ? "disabled" : ""} aria-label="Descer item">${renderIcon("chevron-down")}</button>
            </div>
          </article>
        `,
      )
      .join(""),
  );

  window.lucide?.createIcons();
}

function updateOrderSectionOptions(selectedSectionId = "") {
  scheduleOrderSectionSelect.replaceChildren();

  getDefaultOrderedSections().forEach((section) => {
    scheduleOrderSectionSelect.appendChild(new Option(section.title, section.id));
  });

  if (selectedSectionId && getSectionById(selectedSectionId)) {
    scheduleOrderSectionSelect.value = selectedSectionId;
  } else if (cachedSections[0]) {
    scheduleOrderSectionSelect.value = cachedSections[0].id;
  }
}

function setActivityOrderSection(sectionId) {
  orderSectionId = sectionId;
  orderedIds = getDefaultOrderedActivities(sectionId).map((activity) => activity.id);
  scheduleOrderDescription.textContent = `Ordem das atividades em ${getSectionTitle(sectionId)}.`;
  renderOrderModal();
}

function openSectionOrderModal() {
  orderMode = "sections";
  orderSectionId = null;
  orderedIds = getDefaultOrderedSections().map((section) => section.id);
  scheduleOrderTitle.textContent = "Organizar Etapas";
  scheduleOrderDescription.textContent = "Arraste as etapas ou use as setas para definir a ordem pública.";
  scheduleOrderSectionField.hidden = true;
  renderOrderModal();
  scheduleOrderModal.classList.add("active");
  scheduleOrderModal.setAttribute("aria-hidden", "false");
}

function openActivityOrderModal() {
  if (!cachedSections.length) {
    showAdminToast("⚠️ Cadastre uma etapa antes de organizar atividades");
    return;
  }

  const sectionId = activitySectionFilter.value || cachedSections[0]?.id || "";
  orderMode = "activities";
  scheduleOrderTitle.textContent = "Organizar Atividades";
  scheduleOrderSectionField.hidden = false;
  updateOrderSectionOptions(sectionId);
  setActivityOrderSection(scheduleOrderSectionSelect.value);
  scheduleOrderModal.classList.add("active");
  scheduleOrderModal.setAttribute("aria-hidden", "false");
}

function closeScheduleOrderModal() {
  scheduleOrderModal.classList.remove("active");
  scheduleOrderModal.setAttribute("aria-hidden", "true");
  draggedItemId = null;
  orderSectionId = null;
  scheduleOrderSectionField.hidden = true;
}

function moveOrderItem(itemId, direction) {
  const currentIndex = orderedIds.indexOf(itemId);
  const nextIndex = currentIndex + direction;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedIds.length) {
    return;
  }

  const nextOrder = [...orderedIds];
  [nextOrder[currentIndex], nextOrder[nextIndex]] = [
    nextOrder[nextIndex],
    nextOrder[currentIndex],
  ];
  orderedIds = nextOrder;
  renderOrderModal();
}

function reorderDraggedItem(targetId, shouldInsertAfter) {
  if (!draggedItemId || draggedItemId === targetId) {
    return;
  }

  const nextOrder = orderedIds.filter((id) => id !== draggedItemId);
  const targetIndex = nextOrder.indexOf(targetId);

  if (targetIndex < 0) {
    return;
  }

  nextOrder.splice(targetIndex + (shouldInsertAfter ? 1 : 0), 0, draggedItemId);
  orderedIds = nextOrder;
  renderOrderModal();
}

async function saveScheduleOrder() {
  if (orderMode === "activities" && !orderSectionId) {
    showAdminToast("⚠️ Selecione uma etapa para salvar a ordem");
    return;
  }

  saveScheduleOrderButton.disabled = true;

  const rpc =
    orderMode === "sections"
      ? supabaseClient.rpc("admin_reorder_schedule_sections", {
          submitted_section_ids: orderedIds,
        })
      : supabaseClient.rpc("admin_reorder_schedule_activities", {
          submitted_activity_ids: orderedIds,
          target_section_id: orderSectionId,
        });

  const { error } = await rpc;

  saveScheduleOrderButton.disabled = false;

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar a ordem");
    return;
  }

  showAdminToast("💜 Ordem salva!");
  closeScheduleOrderModal();
  await loadScheduleAdmin();
}

function applySummaryFilter(summary) {
  if (summary === "sections") {
    sectionVisibilityFilter.value = "";
  }

  if (summary === "activities") {
    activityVisibilityFilter.value = "";
    activityTimeModeFilter.value = "";
  }

  if (summary === "visible") {
    activityVisibilityFilter.value = "visible";
  }

  if (summary === "tbd") {
    activityTimeModeFilter.value = "tbd";
  }

  renderSectionsTable();
  renderActivitiesTable();
}

[
  sectionSearchInput,
  sectionVisibilityFilter,
].forEach((filter) => {
  filter.addEventListener("input", renderSectionsTable);
  filter.addEventListener("change", renderSectionsTable);
});

[
  activitySearchInput,
  activitySectionFilter,
  activityTypeFilter,
  activityTimeModeFilter,
  activityVisibilityFilter,
].forEach((filter) => {
  filter.addEventListener("input", renderActivitiesTable);
  filter.addEventListener("change", renderActivitiesTable);
});

clearSectionFiltersButton.addEventListener("click", () => {
  sectionSearchInput.value = "";
  sectionVisibilityFilter.value = "";
  renderSectionsTable();
});

clearActivityFiltersButton.addEventListener("click", () => {
  activitySearchInput.value = "";
  activitySectionFilter.value = "";
  activityTypeFilter.value = "";
  activityTimeModeFilter.value = "";
  activityVisibilityFilter.value = "";
  renderActivitiesTable();
});

refreshScheduleButton.addEventListener("click", loadScheduleAdmin);
openSectionModalButton.addEventListener("click", () => openSectionModal());
openActivityModalButton.addEventListener("click", () => openActivityModal());
openSectionOrderModalButton.addEventListener("click", openSectionOrderModal);
openActivityOrderModalButton.addEventListener("click", openActivityOrderModal);
closeSectionModalButton.addEventListener("click", closeSectionModal);
closeActivityModalButton.addEventListener("click", closeActivityModal);
closeScheduleDetailsModalButton.addEventListener("click", closeScheduleDetailsModal);
closeScheduleOrderModalButton.addEventListener("click", closeScheduleOrderModal);
saveScheduleOrderButton.addEventListener("click", saveScheduleOrder);
scheduleOrderSectionSelect.addEventListener("change", () => {
  setActivityOrderSection(scheduleOrderSectionSelect.value);
});
sectionForm.addEventListener("submit", saveSection);
activityForm.addEventListener("submit", saveActivity);
activityTimeModeInput.addEventListener("change", syncTimeFields);
activitySectionInput.addEventListener("change", () => {
  if (!selectedActivityId) {
    activityOrderInput.value = String(getNextActivityOrder(activitySectionInput.value));
  }
});

document.querySelectorAll("[data-section-sort]").forEach((button) => {
  button.addEventListener("click", () => setSectionSort(button.dataset.sectionSort));
});

document.querySelectorAll("[data-activity-sort]").forEach((button) => {
  button.addEventListener("click", () => setActivitySort(button.dataset.activitySort));
});

scheduleSummaryCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest(".metric-help")) {
      return;
    }

    applySummaryFilter(card.dataset.scheduleSummary || "");
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }
  });
});

sectionsTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-schedule-action]");

  if (!button) {
    return;
  }

  const id = button.dataset.scheduleId;
  const action = button.dataset.scheduleAction;

  if (action === "section-details") {
    openSectionDetails(id);
  }

  if (action === "section-edit") {
    openSectionModal(getSectionById(id));
  }

  if (action === "toggle-section-visible") {
    toggleSectionVisibility(id);
  }
});

activitiesTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-schedule-action]");

  if (!button) {
    return;
  }

  const id = button.dataset.scheduleId;
  const action = button.dataset.scheduleAction;

  if (action === "activity-details") {
    openActivityDetails(id);
  }

  if (action === "activity-edit") {
    openActivityModal(getActivityById(id));
  }

  if (action === "toggle-activity-visible") {
    toggleActivityVisibility(id);
  }
});

scheduleDetailsContent.addEventListener("click", (event) => {
  const button = event.target.closest("[data-schedule-detail-action]");

  if (!button) {
    return;
  }

  const id = button.dataset.scheduleId;
  const kind = button.dataset.scheduleDetailKind;
  const action = button.dataset.scheduleDetailAction;

  if (kind === "section" && action === "edit") {
    closeScheduleDetailsModal();
    openSectionModal(getSectionById(id));
  }

  if (kind === "activity" && action === "edit") {
    closeScheduleDetailsModal();
    openActivityModal(getActivityById(id));
  }

  if (kind === "section" && action === "toggle-visible") {
    toggleSectionVisibility(id);
  }

  if (kind === "activity" && action === "toggle-visible") {
    toggleActivityVisibility(id);
  }

  if (kind === "section" && action === "delete") {
    deleteSection(id);
  }

  if (kind === "activity" && action === "delete") {
    deleteActivity(id);
  }
});

scheduleOrderList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-schedule-order-action]");

  if (!button) {
    return;
  }

  moveOrderItem(
    button.dataset.scheduleId,
    button.dataset.scheduleOrderAction === "up" ? -1 : 1,
  );
});

scheduleOrderList.addEventListener("dragstart", (event) => {
  const item = event.target.closest("[data-schedule-order-id]");

  if (!item) {
    return;
  }

  draggedItemId = item.dataset.scheduleOrderId;
  item.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedItemId);
});

scheduleOrderList.addEventListener("dragend", (event) => {
  event.target.closest("[data-schedule-order-id]")?.classList.remove("is-dragging");
  draggedItemId = null;
});

scheduleOrderList.addEventListener("dragover", (event) => {
  if (!event.target.closest("[data-schedule-order-id]") || !draggedItemId) {
    return;
  }

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
});

scheduleOrderList.addEventListener("drop", (event) => {
  const item = event.target.closest("[data-schedule-order-id]");

  if (!item) {
    return;
  }

  event.preventDefault();
  const rect = item.getBoundingClientRect();
  reorderDraggedItem(item.dataset.scheduleOrderId, event.clientY > rect.top + rect.height / 2);
});

[sectionModal, activityModal, scheduleDetailsModal, scheduleOrderModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    }
  });
});

loadScheduleAdmin();
