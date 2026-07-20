AdminCommon.setupLogout();

const vendorsTableBody = document.getElementById("vendorsTableBody");
const vendorSearchInput = document.getElementById("vendorSearchInput");
const vendorCategoryFilter = document.getElementById("vendorCategoryFilter");
const vendorVisibilityFilter = document.getElementById("vendorVisibilityFilter");
const vendorFeaturedFilter = document.getElementById("vendorFeaturedFilter");
const vendorFilterCount = document.getElementById("vendorFilterCount");
const clearVendorFiltersButton = document.getElementById("clearVendorFiltersButton");
const refreshVendorsButton = document.getElementById("refreshVendorsButton");
const openVendorModalButton = document.getElementById("openVendorModalButton");
const openVendorOrderModalButton = document.getElementById(
  "openVendorOrderModalButton",
);
const vendorModal = document.getElementById("vendorModal");
const closeVendorModalButton = document.getElementById("closeVendorModalButton");
const vendorModalTitle = document.getElementById("vendorModalTitle");
const vendorOrderModal = document.getElementById("vendorOrderModal");
const closeVendorOrderModalButton = document.getElementById(
  "closeVendorOrderModalButton",
);
const vendorOrderList = document.getElementById("vendorOrderList");
const saveVendorOrderButton = document.getElementById("saveVendorOrderButton");
const vendorDetailsModal = document.getElementById("vendorDetailsModal");
const closeVendorDetailsModalButton = document.getElementById(
  "closeVendorDetailsModalButton",
);
const vendorDetailsTitle = document.getElementById("vendorDetailsTitle");
const vendorDetailsContent = document.getElementById("vendorDetailsContent");
const vendorForm = document.getElementById("vendorForm");
const vendorNameInput = document.getElementById("vendorNameInput");
const vendorCategoryInput = document.getElementById("vendorCategoryInput");
const vendorResponsibleInput = document.getElementById("vendorResponsibleInput");
const vendorOrderInput = document.getElementById("vendorOrderInput");
const vendorDescriptionInput = document.getElementById("vendorDescriptionInput");
const vendorImageInput = document.getElementById("vendorImageInput");
const vendorInstagramInput = document.getElementById("vendorInstagramInput");
const vendorWebsiteInput = document.getElementById("vendorWebsiteInput");
const vendorWhatsappInput = document.getElementById("vendorWhatsappInput");
const vendorVisibleInput = document.getElementById("vendorVisibleInput");
const vendorFeaturedInput = document.getElementById("vendorFeaturedInput");
const vendorTotalCount = document.getElementById("vendorTotalCount");
const vendorVisibleCount = document.getElementById("vendorVisibleCount");
const vendorHiddenCount = document.getElementById("vendorHiddenCount");
const vendorFeaturedCount = document.getElementById("vendorFeaturedCount");
const vendorSummaryCards = document.querySelectorAll("[data-vendor-summary]");

const showAdminToast = AdminCommon.showToast;
const { escapeAttribute, replaceSafeContent, safeText } = SecurityUtils;

let cachedVendors = [];
let selectedVendorId = null;
let orderedVendorIds = [];
let draggedVendorId = null;
let vendorSortState = {
  key: "order",
  direction: "asc",
};

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

function getVendorById(vendorId) {
  return cachedVendors.find((vendor) => vendor.id === vendorId);
}

function updateVendorSummary() {
  vendorTotalCount.textContent = String(cachedVendors.length);
  vendorVisibleCount.textContent = String(
    cachedVendors.filter((vendor) => vendor.is_visible).length,
  );
  vendorHiddenCount.textContent = String(
    cachedVendors.filter((vendor) => !vendor.is_visible).length,
  );
  vendorFeaturedCount.textContent = String(
    cachedVendors.filter((vendor) => vendor.is_featured).length,
  );
}

function updateCategoryFilter() {
  const currentValue = vendorCategoryFilter.value;
  const categories = [...new Set(cachedVendors.map((vendor) => vendor.category))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));

  vendorCategoryFilter.replaceChildren(new Option("Todas", ""));
  categories.forEach((category) => {
    vendorCategoryFilter.appendChild(new Option(category, category));
  });

  if (categories.includes(currentValue)) {
    vendorCategoryFilter.value = currentValue;
  }
}

function getFilteredVendors() {
  const search = normalizeText(vendorSearchInput.value);
  const category = vendorCategoryFilter.value;
  const visibility = vendorVisibilityFilter.value;
  const featured = vendorFeaturedFilter.value;

  return sortVendors(
    cachedVendors.filter((vendor) => {
      const searchable = normalizeText(
        [
          vendor.name,
          vendor.category,
          vendor.responsible_names,
          vendor.description,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return (
        (!search || searchable.includes(search)) &&
        (!category || vendor.category === category) &&
        (!visibility ||
          (visibility === "visible" ? vendor.is_visible : !vendor.is_visible)) &&
        (!featured ||
          (featured === "featured" ? vendor.is_featured : !vendor.is_featured))
      );
    }),
  );
}

function getVendorSortValue(vendor) {
  const sortValues = {
    category: vendor.category,
    featured: vendor.is_featured ? 1 : 0,
    name: vendor.name,
    order: Number(vendor.display_order || 0),
    responsible: vendor.responsible_names,
    visible: vendor.is_visible ? 1 : 0,
  };

  return sortValues[vendorSortState.key] ?? "";
}

function sortVendors(vendors) {
  return [...vendors].sort((first, second) => {
    let result = compareValues(getVendorSortValue(first), getVendorSortValue(second));

    if (result === 0) {
      result = compareValues(first.name, second.name);
    }

    return vendorSortState.direction === "asc" ? result : -result;
  });
}

function getDefaultOrderedVendors() {
  return [...cachedVendors].sort((first, second) => {
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

function getNextVendorOrder() {
  return (
    cachedVendors.reduce(
      (highestOrder, vendor) =>
        Math.max(highestOrder, Number(vendor.display_order || 0)),
      0,
    ) + 1
  );
}

function getSubmittedVendorOrder() {
  if (vendorOrderInput.value === "") {
    return getNextVendorOrder();
  }

  return Number(vendorOrderInput.value || 0);
}

function updateVendorSortButtons() {
  document.querySelectorAll("[data-vendor-sort]").forEach((button) => {
    button.classList.remove("sorted-asc", "sorted-desc");

    if (button.dataset.vendorSort === vendorSortState.key) {
      button.classList.add(`sorted-${vendorSortState.direction}`);
    }
  });
}

function setVendorSort(key) {
  if (vendorSortState.key === key) {
    vendorSortState.direction =
      vendorSortState.direction === "asc" ? "desc" : "asc";
  } else {
    vendorSortState = {
      key,
      direction: "asc",
    };
  }

  renderVendorsTable();
}

function renderVisibilityToggle(vendor) {
  const visible = Boolean(vendor.is_visible);

  return `
    <label class="admin-table-checkbox" title="${visible ? "Ocultar fornecedor" : "Exibir fornecedor"}">
      <input
        type="checkbox"
        data-vendor-action="toggle-visible"
        data-vendor-id="${escapeAttribute(vendor.id)}"
        ${visible ? "checked" : ""}
        aria-label="${visible ? "Fornecedor visível" : "Fornecedor oculto"}"
      />
    </label>
  `;
}

function renderFeaturedBadge(vendor) {
  return vendor.is_featured
    ? '<span class="admin-badge badge-payment">Destaque</span>'
    : '<span class="admin-badge badge-muted">Não</span>';
}

function renderVendorOrderModal() {
  if (!vendorOrderList) {
    return;
  }

  const vendorsById = new Map(cachedVendors.map((vendor) => [vendor.id, vendor]));
  const orderedVendors = orderedVendorIds
    .map((vendorId) => vendorsById.get(vendorId))
    .filter(Boolean);

  if (!orderedVendors.length) {
    replaceSafeContent(
      vendorOrderList,
      `
        <div class="admin-empty-state">
          Nenhum fornecedor cadastrado.
        </div>
      `,
    );
    return;
  }

  replaceSafeContent(
    vendorOrderList,
    orderedVendors
      .map(
        (vendor, index) => `
          <article
            class="vendor-order-item"
            draggable="true"
            data-vendor-order-id="${escapeAttribute(vendor.id)}"
          >
            <span class="vendor-order-handle" aria-hidden="true">
              ${renderIcon("grip-vertical")}
            </span>
            <div>
              <strong class="vendor-order-name">${safeText(vendor.name)}</strong>
              <span class="vendor-order-category">${safeText(vendor.category)}</span>
            </div>
            <div class="vendor-order-actions">
              <button
                type="button"
                class="vendor-order-action"
                data-vendor-order-action="up"
                data-vendor-id="${escapeAttribute(vendor.id)}"
                ${index === 0 ? "disabled" : ""}
                aria-label="Subir fornecedor"
              >
                ${renderIcon("chevron-up")}
              </button>
              <button
                type="button"
                class="vendor-order-action"
                data-vendor-order-action="down"
                data-vendor-id="${escapeAttribute(vendor.id)}"
                ${index === orderedVendors.length - 1 ? "disabled" : ""}
                aria-label="Descer fornecedor"
              >
                ${renderIcon("chevron-down")}
              </button>
            </div>
          </article>
        `,
      )
      .join(""),
  );

  window.lucide?.createIcons();
}

function openVendorOrderModal() {
  orderedVendorIds = getDefaultOrderedVendors().map((vendor) => vendor.id);
  renderVendorOrderModal();
  vendorOrderModal.classList.add("active");
  vendorOrderModal.setAttribute("aria-hidden", "false");
}

function closeVendorOrderModal() {
  vendorOrderModal.classList.remove("active");
  vendorOrderModal.setAttribute("aria-hidden", "true");
  draggedVendorId = null;
}

function moveVendorOrderItem(vendorId, direction) {
  const currentIndex = orderedVendorIds.indexOf(vendorId);
  const nextIndex = currentIndex + direction;

  if (
    currentIndex < 0 ||
    nextIndex < 0 ||
    nextIndex >= orderedVendorIds.length
  ) {
    return;
  }

  const nextOrder = [...orderedVendorIds];
  [nextOrder[currentIndex], nextOrder[nextIndex]] = [
    nextOrder[nextIndex],
    nextOrder[currentIndex],
  ];
  orderedVendorIds = nextOrder;
  renderVendorOrderModal();
}

function reorderDraggedVendor(targetVendorId, shouldInsertAfter) {
  if (!draggedVendorId || draggedVendorId === targetVendorId) {
    return;
  }

  const nextOrder = orderedVendorIds.filter((vendorId) => vendorId !== draggedVendorId);
  const targetIndex = nextOrder.indexOf(targetVendorId);

  if (targetIndex < 0) {
    return;
  }

  nextOrder.splice(targetIndex + (shouldInsertAfter ? 1 : 0), 0, draggedVendorId);
  orderedVendorIds = nextOrder;
  renderVendorOrderModal();
}

async function saveVendorOrder() {
  saveVendorOrderButton.disabled = true;

  const { error } = await supabaseClient.rpc("admin_reorder_vendors", {
    submitted_vendor_ids: orderedVendorIds,
  });

  saveVendorOrderButton.disabled = false;

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar a ordem dos fornecedores");
    return;
  }

  showAdminToast("💜 Ordem dos fornecedores salva!");
  closeVendorOrderModal();
  await loadVendors();
}

function formatVendorDate(value) {
  if (!value) {
    return "Não informado";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Não informado";
  }

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function renderVendorDetailLink(label, url) {
  if (!url) {
    return "";
  }

  return `
    <div class="admin-details-item">
      <strong>${safeText(label)}</strong>
      <span>${safeText(url)}</span>
    </div>
  `;
}

function renderVendorDetailsActions(vendor) {
  return `
    <div class="admin-detail-action-grid">
      <button
        type="button"
        class="admin-detail-action-card"
        data-vendor-detail-action="edit"
        data-vendor-id="${escapeAttribute(vendor.id)}"
      >
        <span class="admin-detail-action-icon">${renderIcon("edit")}</span>
        <span>
          <strong>Editar fornecedor</strong>
          <small>Altera dados, links, ordem e destaque.</small>
        </span>
      </button>
      <button
        type="button"
        class="admin-detail-action-card ${vendor.is_visible ? "warning" : "success"}"
        data-vendor-detail-action="toggle-visible"
        data-vendor-id="${escapeAttribute(vendor.id)}"
      >
        <span class="admin-detail-action-icon">${renderIcon(vendor.is_visible ? "eye-off" : "eye")}</span>
        <span>
          <strong>${vendor.is_visible ? "Ocultar fornecedor" : "Exibir fornecedor"}</strong>
          <small>${vendor.is_visible ? "Remove da página pública." : "Mostra na página pública."}</small>
        </span>
      </button>
      <button
        type="button"
        class="admin-detail-action-card danger"
        data-vendor-detail-action="delete"
        data-vendor-id="${escapeAttribute(vendor.id)}"
      >
        <span class="admin-detail-action-icon">${renderIcon("trash-2")}</span>
        <span>
          <strong>Excluir fornecedor</strong>
          <small>Remove este fornecedor do cadastro.</small>
        </span>
      </button>
    </div>
  `;
}

function openVendorDetailsModal(vendorId) {
  const vendor = getVendorById(vendorId);

  if (!vendor) {
    showAdminToast("⚠️ Fornecedor não encontrado. Atualize a lista e tente novamente");
    return;
  }

  vendorDetailsTitle.textContent = vendor.name || "Detalhes do Fornecedor";
  replaceSafeContent(
    vendorDetailsContent,
    `
      <section class="admin-details-section">
        <span class="admin-details-label">Resumo</span>
        <div class="admin-details-meta-grid">
          <div class="admin-details-meta-item">
            <span>Categoria</span>
            <strong>${safeText(vendor.category || "Não informado")}</strong>
          </div>
          <div class="admin-details-meta-item">
            <span>Responsáveis</span>
            <strong>${safeText(vendor.responsible_names || "Não informado")}</strong>
          </div>
          <div class="admin-details-meta-item">
            <span>Visibilidade</span>
            <strong>${vendor.is_visible ? "Visível" : "Oculto"}</strong>
          </div>
          <div class="admin-details-meta-item">
            <span>Destaque</span>
            <strong>${vendor.is_featured ? "Sim" : "Não"}</strong>
          </div>
          <div class="admin-details-meta-item">
            <span>Ordem</span>
            <strong>${safeText(vendor.display_order ?? 0)}</strong>
          </div>
        </div>
      </section>

      <section class="admin-details-section">
        <span class="admin-details-label">Descrição</span>
        <p>${safeText(vendor.description || "Nenhuma descrição cadastrada.")}</p>
      </section>

      <section class="admin-details-section">
        <span class="admin-details-label">Links e Contato</span>
        <div class="admin-details-list">
          ${renderVendorDetailLink("Imagem / Logo", vendor.image_url)}
          ${renderVendorDetailLink("Instagram", vendor.instagram_url)}
          ${renderVendorDetailLink("Site", vendor.website_url)}
          ${renderVendorDetailLink("WhatsApp", vendor.whatsapp_number)}
          ${
            vendor.image_url ||
            vendor.instagram_url ||
            vendor.website_url ||
            vendor.whatsapp_number
              ? ""
              : '<div class="admin-details-item"><span>Nenhum link ou contato cadastrado.</span></div>'
          }
        </div>
      </section>

      <section class="admin-details-section">
        <span class="admin-details-label">Ações</span>
        ${renderVendorDetailsActions(vendor)}
      </section>

      <section class="admin-details-section">
        <span class="admin-details-label">Datas</span>
        <div class="admin-details-meta-grid">
          <div class="admin-details-meta-item">
            <span>Criado em</span>
            <strong>${formatVendorDate(vendor.created_at)}</strong>
          </div>
          <div class="admin-details-meta-item">
            <span>Atualizado em</span>
            <strong>${formatVendorDate(vendor.updated_at)}</strong>
          </div>
        </div>
      </section>
    `,
  );

  vendorDetailsModal.classList.add("active");
  vendorDetailsModal.setAttribute("aria-hidden", "false");
  window.lucide?.createIcons();
}

function closeVendorDetailsModal() {
  vendorDetailsModal.classList.remove("active");
  vendorDetailsModal.setAttribute("aria-hidden", "true");
}

function renderVendorsTable() {
  const vendors = getFilteredVendors();

  vendorFilterCount.textContent = `${vendors.length} de ${cachedVendors.length} fornecedores`;
  updateVendorSortButtons();

  if (!vendors.length) {
    replaceSafeContent(
      vendorsTableBody,
      `
        <tr>
          <td colspan="7" class="admin-empty-state">
            Nenhum fornecedor encontrado.
          </td>
        </tr>
      `,
    );
    return;
  }

  replaceSafeContent(
    vendorsTableBody,
    vendors
      .map(
        (vendor) => `
          <tr>
            <td>
              <strong>${safeText(vendor.name)}</strong>
              <span class="admin-muted vendor-table-description">
                ${safeText(vendor.description, "")}
              </span>
            </td>
            <td>${safeText(vendor.category)}</td>
            <td>${safeText(vendor.responsible_names)}</td>
            <td>${renderVisibilityToggle(vendor)}</td>
            <td>${renderFeaturedBadge(vendor)}</td>
            <td>${safeText(vendor.display_order ?? 0)}</td>
            <td>
              <div class="admin-actions compact-actions">
                <button
                  type="button"
                  class="admin-action-button icon-action"
                  data-vendor-action="details"
                  data-vendor-id="${escapeAttribute(vendor.id)}"
                >
                  ${renderIcon("eye")}
                  Detalhes
                </button>
                <button
                  type="button"
                  class="admin-action-button icon-action"
                  data-vendor-action="edit"
                  data-vendor-id="${escapeAttribute(vendor.id)}"
                >
                  ${renderIcon("edit")}
                  Editar
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

function applyVendorSummaryFilter(summary) {
  vendorVisibilityFilter.value = "";
  vendorFeaturedFilter.value = "";

  if (summary === "visible") {
    vendorVisibilityFilter.value = "visible";
  }

  if (summary === "hidden") {
    vendorVisibilityFilter.value = "hidden";
  }

  if (summary === "featured") {
    vendorFeaturedFilter.value = "featured";
  }

  renderVendorsTable();
}

function clearVendorForm() {
  selectedVendorId = null;
  vendorForm.reset();
  vendorOrderInput.value = String(getNextVendorOrder());
  vendorVisibleInput.checked = true;
  vendorFeaturedInput.checked = false;
}

function openVendorModal(vendor = null) {
  clearVendorForm();

  if (vendor) {
    selectedVendorId = vendor.id;
    vendorModalTitle.textContent = "Editar Fornecedor";
    vendorNameInput.value = vendor.name || "";
    vendorCategoryInput.value = vendor.category || "";
    vendorResponsibleInput.value = vendor.responsible_names || "";
    vendorOrderInput.value = vendor.display_order ?? 0;
    vendorDescriptionInput.value = vendor.description || "";
    vendorImageInput.value = vendor.image_url || "";
    vendorInstagramInput.value = vendor.instagram_url || "";
    vendorWebsiteInput.value = vendor.website_url || "";
    vendorWhatsappInput.value = vendor.whatsapp_number || "";
    vendorVisibleInput.checked = Boolean(vendor.is_visible);
    vendorFeaturedInput.checked = Boolean(vendor.is_featured);
  } else {
    vendorModalTitle.textContent = "Novo Fornecedor";
  }

  vendorModal.classList.add("active");
  vendorModal.setAttribute("aria-hidden", "false");
}

function closeVendorModal() {
  vendorModal.classList.remove("active");
  vendorModal.setAttribute("aria-hidden", "true");
  clearVendorForm();
}

async function loadVendors() {
  refreshVendorsButton.disabled = true;

  const { data, error } = await supabaseClient.rpc("admin_list_vendors");

  refreshVendorsButton.disabled = false;

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível carregar os fornecedores");
    return;
  }

  cachedVendors = data || [];
  updateVendorSummary();
  updateCategoryFilter();
  renderVendorsTable();
}

async function saveVendor(event) {
  event.preventDefault();

  const payload = {
    submitted_category: vendorCategoryInput.value,
    submitted_description: vendorDescriptionInput.value,
    submitted_display_order: getSubmittedVendorOrder(),
    submitted_image_url: vendorImageInput.value,
    submitted_instagram_url: vendorInstagramInput.value,
    submitted_is_featured: vendorFeaturedInput.checked,
    submitted_is_visible: vendorVisibleInput.checked,
    submitted_name: vendorNameInput.value,
    submitted_responsible_names: vendorResponsibleInput.value,
    submitted_website_url: vendorWebsiteInput.value,
    submitted_whatsapp_number: vendorWhatsappInput.value,
    target_vendor_id: selectedVendorId,
  };

  const { error } = await supabaseClient.rpc("admin_save_vendor", payload);

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar o fornecedor");
    return;
  }

  showAdminToast("💜 Fornecedor salvo!");
  closeVendorModal();
  await loadVendors();
}

async function toggleVendorVisibility(vendorId) {
  const vendor = getVendorById(vendorId);

  if (!vendor) {
    return;
  }

  const { error } = await supabaseClient.rpc("admin_set_vendor_visible", {
    submitted_is_visible: !vendor.is_visible,
    target_vendor_id: vendorId,
  });

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível alterar a visibilidade");
    return;
  }

  showAdminToast(
    vendor.is_visible ? "💜 Fornecedor ocultado!" : "💜 Fornecedor exibido!",
  );
  closeVendorDetailsModal();
  await loadVendors();
}

async function deleteVendor(vendorId) {
  const vendor = getVendorById(vendorId);

  if (!vendor || !confirm(`Deseja excluir "${vendor.name}"?`)) {
    return;
  }

  const { error } = await supabaseClient.rpc("admin_delete_vendor", {
    target_vendor_id: vendorId,
  });

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível excluir o fornecedor");
    return;
  }

  showAdminToast("💜 Fornecedor excluído!");
  closeVendorDetailsModal();
  await loadVendors();
}

[
  vendorSearchInput,
  vendorCategoryFilter,
  vendorVisibilityFilter,
  vendorFeaturedFilter,
].forEach((filter) => {
  filter?.addEventListener("input", renderVendorsTable);
  filter?.addEventListener("change", renderVendorsTable);
});

clearVendorFiltersButton?.addEventListener("click", () => {
  vendorSearchInput.value = "";
  vendorCategoryFilter.value = "";
  vendorVisibilityFilter.value = "";
  vendorFeaturedFilter.value = "";
  renderVendorsTable();
});

refreshVendorsButton?.addEventListener("click", loadVendors);
openVendorModalButton?.addEventListener("click", () => openVendorModal());
openVendorOrderModalButton?.addEventListener("click", openVendorOrderModal);
closeVendorModalButton?.addEventListener("click", closeVendorModal);
closeVendorOrderModalButton?.addEventListener("click", closeVendorOrderModal);
saveVendorOrderButton?.addEventListener("click", saveVendorOrder);
vendorForm?.addEventListener("submit", saveVendor);

document.querySelectorAll("[data-vendor-sort]").forEach((button) => {
  button.addEventListener("click", () => {
    setVendorSort(button.dataset.vendorSort);
  });
});

vendorSummaryCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest(".metric-help")) {
      return;
    }

    applyVendorSummaryFilter(card.dataset.vendorSummary || "total");
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }
  });
});

vendorsTableBody?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-vendor-action]");

  if (!button) {
    return;
  }

  const vendorId = button.dataset.vendorId;

  if (button.dataset.vendorAction === "details") {
    openVendorDetailsModal(vendorId);
  }

  if (button.dataset.vendorAction === "edit") {
    openVendorModal(getVendorById(vendorId));
  }

  if (button.dataset.vendorAction === "toggle-visible") {
    toggleVendorVisibility(vendorId);
  }

  if (button.dataset.vendorAction === "delete") {
    deleteVendor(vendorId);
  }
});

vendorDetailsContent?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-vendor-detail-action]");

  if (!button) {
    return;
  }

  const vendorId = button.dataset.vendorId;
  const action = button.dataset.vendorDetailAction;

  if (action === "edit") {
    closeVendorDetailsModal();
    openVendorModal(getVendorById(vendorId));
  }

  if (action === "toggle-visible") {
    toggleVendorVisibility(vendorId);
  }

  if (action === "delete") {
    deleteVendor(vendorId);
  }
});

vendorOrderList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-vendor-order-action]");

  if (!button) {
    return;
  }

  moveVendorOrderItem(
    button.dataset.vendorId,
    button.dataset.vendorOrderAction === "up" ? -1 : 1,
  );
});

vendorOrderList?.addEventListener("dragstart", (event) => {
  const item = event.target.closest("[data-vendor-order-id]");

  if (!item) {
    return;
  }

  draggedVendorId = item.dataset.vendorOrderId;
  item.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedVendorId);
});

vendorOrderList?.addEventListener("dragend", (event) => {
  const item = event.target.closest("[data-vendor-order-id]");

  item?.classList.remove("is-dragging");
  draggedVendorId = null;
});

vendorOrderList?.addEventListener("dragover", (event) => {
  const item = event.target.closest("[data-vendor-order-id]");

  if (!item || !draggedVendorId) {
    return;
  }

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
});

vendorOrderList?.addEventListener("drop", (event) => {
  const item = event.target.closest("[data-vendor-order-id]");

  if (!item) {
    return;
  }

  event.preventDefault();

  const rect = item.getBoundingClientRect();
  const shouldInsertAfter = event.clientY > rect.top + rect.height / 2;
  reorderDraggedVendor(item.dataset.vendorOrderId, shouldInsertAfter);
});

vendorModal?.addEventListener("click", (event) => {
  if (event.target === vendorModal) {
    closeVendorModal();
  }
});

vendorOrderModal?.addEventListener("click", (event) => {
  if (event.target === vendorOrderModal) {
    closeVendorOrderModal();
  }
});

closeVendorDetailsModalButton?.addEventListener("click", closeVendorDetailsModal);

vendorDetailsModal?.addEventListener("click", (event) => {
  if (event.target === vendorDetailsModal) {
    closeVendorDetailsModal();
  }
});

loadVendors();
