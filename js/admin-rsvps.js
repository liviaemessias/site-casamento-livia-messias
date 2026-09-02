AdminCommon.setupLogout();

function setElementVisibility(element, visible) {
  if (!element) return;
  element.hidden = !visible;
  element.classList.toggle("is-hidden", !visible);
}

const rsvpsTableBody = document.getElementById("rsvpsTableBody");
const rsvpsMobileList = document.getElementById("rsvpsMobileList");
const rsvpSearchInput = document.getElementById("rsvpSearchInput");
const rsvpPresenceFilter = document.getElementById("rsvpPresenceFilter");
const rsvpCompanionFilter = document.getElementById("rsvpCompanionFilter");
const rsvpRestrictionFilter = document.getElementById("rsvpRestrictionFilter");
const rsvpBuffetFilter = document.getElementById("rsvpBuffetFilter");
const rsvpTableFilter = document.getElementById("rsvpTableFilter");
const rsvpFilterCount = document.getElementById("rsvpFilterCount");
const rsvpFiltersPanel = document.getElementById("rsvpFiltersPanel");
const refreshRSVPsButton = document.getElementById("refreshRSVPsButton");
const exportRSVPsButton = document.getElementById("exportRSVPsButton");
const clearRSVPFiltersButton = document.getElementById(
  "clearRSVPFiltersButton",
);
const rsvpDetailsModal = document.getElementById("rsvpDetailsModal");
const closeRSVPDetailsModalButton = document.getElementById(
  "closeRSVPDetailsModalButton",
);
const rsvpDetailsTitle = document.getElementById("rsvpDetailsTitle");
const rsvpDetailsContent = document.getElementById("rsvpDetailsContent");
const adminRSVPModal = document.getElementById("adminRSVPModal");
const closeAdminRSVPModalButton = document.getElementById(
  "closeAdminRSVPModalButton",
);
const adminRSVPForm = document.getElementById("adminRSVPForm");
const adminRSVPModalTitle = document.getElementById("adminRSVPModalTitle");
const adminRSVPPresenceGroup = document.getElementById(
  "adminRSVPPresenceGroup",
);
const adminRSVPPresenceInput = document.getElementById(
  "adminRSVPPresenceInput",
);
const adminRSVPCoupleMembers = document.getElementById(
  "adminRSVPCoupleMembers",
);
const adminRSVPEmailInput = document.getElementById("adminRSVPEmailInput");
const adminRSVPPhoneInput = document.getElementById("adminRSVPPhoneInput");
const adminRSVPGuestCountInput = document.getElementById(
  "adminRSVPGuestCountInput",
);
const adminRSVPGuestFields = document.getElementById("adminRSVPGuestFields");
const adminRSVPPrimaryFoodSection = document.getElementById(
  "adminRSVPPrimaryFoodSection",
);
const adminRSVPFoodRestrictionInput = document.getElementById(
  "adminRSVPFoodRestrictionInput",
);
const adminRSVPFoodDetailsGroup = document.getElementById(
  "adminRSVPFoodDetailsGroup",
);
const adminRSVPFoodInput = document.getElementById("adminRSVPFoodInput");
const adminRSVPMessageInput = document.getElementById("adminRSVPMessageInput");
const deleteAdminRSVPButton = document.getElementById("deleteAdminRSVPButton");
const { formatDate } = AdminCommon;
const showAdminToast = AdminCommon.showToast;
const { escapeAttribute, replaceSafeContent, safeText } = SecurityUtils;
let cachedRSVPs = [];
let cachedRSVPGuests = [];
let cachedRSVPTables = [];
let cachedRSVPTableAssignments = [];
let visibleRSVPs = [];
let selectedRSVPGuest = null;
let selectedExistingRSVP = null;
let cachedAdminRSVPCompanions = [];
let buffetPayingAge = BuffetMetrics.DEFAULT_PAYING_AGE;
let rsvpSortState = {
  key: "updated",
  direction: "desc",
};

function getAdminPageParams() {
  return new URLSearchParams(window.location.search);
}

function setFilterValueFromParam(element, params, name) {
  if (!element || !params.has(name)) {
    return;
  }

  element.value = params.get(name) || "";
}

function applyRSVPFiltersFromUrl() {
  const params = getAdminPageParams();

  setFilterValueFromParam(rsvpSearchInput, params, "search");
  setFilterValueFromParam(rsvpPresenceFilter, params, "presence");
  setFilterValueFromParam(rsvpCompanionFilter, params, "companions");
  setFilterValueFromParam(rsvpRestrictionFilter, params, "restriction");
  setFilterValueFromParam(rsvpBuffetFilter, params, "buffet");
  setFilterValueFromParam(rsvpTableFilter, params, "table");
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

function maskPhoneInput(input) {
  input.addEventListener("input", (event) => {
    let value = event.target.value.replace(/\D/g, "");

    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d+).*/, "($1) $2-$3");
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d+).*/, "($1) $2");
    } else if (value.length > 0) {
      value = value.replace(/^(\d+)/, "($1");
    }

    event.target.value = value;
  });
}

function renderPresenceBadge(presence) {
  if (presence === "Sim") {
    return `<span class="admin-badge badge-available">Sim</span>`;
  }

  if (presence === "Não") {
    return `<span class="admin-badge badge-danger">Não</span>`;
  }

  return `<span class="admin-badge badge-muted">-</span>`;
}

function renderInviteTypeBadge(type) {
  if (type === "couple") {
    return `<span class="admin-badge badge-payment">Casal</span>`;
  }

  return `<span class="admin-badge badge-muted">Individual</span>`;
}

function hasDietaryRestriction(rsvp) {
  const people = [
    rsvp?.guest_data,
    ...(rsvp?.guest_data?.members || []),
    ...(rsvp?.guest_data?.companions || []),
  ];

  if (people.some((person) => hasPersonDietaryRestriction(person))) {
    return true;
  }

  if (typeof rsvp?.food_restriction === "boolean") {
    return rsvp.food_restriction;
  }

  const food = String(rsvp?.food || "").trim();

  return Boolean(food && food !== "-");
}

function hasPersonDietaryRestriction(person) {
  if (typeof person?.food_restriction === "boolean") {
    return person.food_restriction;
  }

  return Boolean(String(person?.food || "").trim());
}

function normalizeDietaryRestrictionText(food, personName = "") {
  const text = String(food || "").trim();
  const name = String(personName || "").trim();

  if (name && text.toLowerCase().startsWith(`${name.toLowerCase()}:`)) {
    return text.slice(name.length + 1).trim();
  }

  return text;
}

function getPersonDietaryRestrictionDetails(person) {
  return hasPersonDietaryRestriction(person)
    ? normalizeDietaryRestrictionText(person?.food, person?.name)
    : "";
}

function normalizePersonDietaryRestriction(person) {
  const hasRestriction = person?.food_restriction === "Sim" ||
    person?.food_restriction === true;
  const food = hasRestriction
    ? normalizeDietaryRestrictionText(person?.food, person?.name)
    : "";

  return {
    food,
    food_restriction: Boolean(food),
  };
}

function getPeopleWithDietaryRestriction({ companions = [], members = [], primary = null }) {
  return [primary, ...members, ...companions]
    .filter(Boolean)
    .filter((person) => person.presence !== "Não")
    .filter((person) => hasPersonDietaryRestriction(person))
    .map((person) => ({
      name: person.name || "Sem nome",
      food: getPersonDietaryRestrictionDetails(person),
    }));
}

function buildFoodSummary(people) {
  return people
    .map((person) =>
      person.food
        ? `${person.name}: ${person.food}`
        : `${person.name}: Sim, sem detalhes informados`,
    )
    .join("; ");
}

function getDietaryRestrictionLabel(rsvp) {
  return hasDietaryRestriction(rsvp) ? "Sim" : "Não";
}

function getDietaryRestrictionDetails(rsvp) {
  if (!hasDietaryRestriction(rsvp)) {
    return "-";
  }

  const people = [
    rsvp?.guest_data,
    ...(rsvp?.guest_data?.members || []),
    ...(rsvp?.guest_data?.companions || []),
  ]
    .filter(Boolean)
    .filter((person) => person.presence !== "Não")
    .filter((person) => hasPersonDietaryRestriction(person))
    .map((person) => ({
      food:
        getPersonDietaryRestrictionDetails(person) ||
        "Sim, sem detalhes informados",
      name: person.name || "Sem nome",
    }));

  if (people.length) {
    return people.map((person) => `${person.name}: ${person.food}`).join("; ");
  }

  return String(rsvp.food || "").trim() || "Sim, sem detalhes informados";
}

function getRSVPDietaryPeople(rsvp) {
  const people = [];
  const primaryPerson = getRSVPPrimaryPerson(rsvp);

  if (primaryPerson && hasPersonDietaryRestriction(primaryPerson)) {
    people.push({
      index: "",
      person: primaryPerson,
      role: "Convidado principal",
      type: "primary",
    });
  }

  (rsvp?.guest_data?.members || []).forEach((member, index) => {
    if (hasPersonDietaryRestriction(member)) {
      people.push({
        index,
        person: member,
        role: "Membro do convite",
        type: "member",
      });
    }
  });

  (rsvp?.guest_data?.companions || []).forEach((companion, index) => {
    if (hasPersonDietaryRestriction(companion)) {
      people.push({
        index,
        person: companion,
        role: "Acompanhante",
        type: "companion",
      });
    }
  });

  return people;
}

function updateAdminRSVPFoodVisibility() {
  const hasRestriction = adminRSVPFoodRestrictionInput?.value === "Sim";

  setElementVisibility(adminRSVPFoodDetailsGroup, hasRestriction);

  if (adminRSVPFoodInput) {
    adminRSVPFoodInput.required = hasRestriction;

    if (!hasRestriction) {
      adminRSVPFoodInput.value = "";
    }
  }
}

function updateAdminPersonFoodVisibility(select, detailsGroup, input) {
  const hasRestriction = select?.value === "Sim";

  setElementVisibility(detailsGroup, hasRestriction);

  if (input) {
    input.required = hasRestriction;

    if (!hasRestriction) {
      input.value = "";
    }
  }
}

function createAdminFoodRestrictionFields({
  detailsClassName = "",
  foodClassName,
  foodValue = "",
  hasRestriction = false,
  index,
  restrictionClassName,
}) {
  const restrictionSelect = document.createElement("select");
  const noOption = document.createElement("option");
  const yesOption = document.createElement("option");
  const foodInput = document.createElement("input");
  const detailsGroup = document.createElement("div");

  restrictionSelect.className = restrictionClassName;
  restrictionSelect.dataset.index = index;
  noOption.value = "Não";
  noOption.textContent = "Não";
  noOption.selected = !hasRestriction;
  yesOption.value = "Sim";
  yesOption.textContent = "Sim";
  yesOption.selected = hasRestriction;
  restrictionSelect.append(noOption, yesOption);

  foodInput.type = "text";
  foodInput.className = foodClassName;
  foodInput.dataset.index = index;
  foodInput.value = foodValue;
  foodInput.placeholder =
    "Ex.: intolerância à lactose ou alergia a frutos do mar";
  foodInput.required = hasRestriction;

  detailsGroup.className = [
    "admin-form-group",
    detailsClassName,
    hasRestriction ? "" : "is-hidden",
  ]
    .filter(Boolean)
    .join(" ");
  detailsGroup.hidden = !hasRestriction;
  detailsGroup.dataset.index = index;
  detailsGroup.append(
    Object.assign(document.createElement("label"), {
      textContent: "Qual restrição alimentar?",
    }),
    foodInput,
  );

  restrictionSelect.addEventListener("change", () => {
    updateAdminPersonFoodVisibility(restrictionSelect, detailsGroup, foodInput);
  });

  return [
    createAdminFormGroup("Possui restrição alimentar?", restrictionSelect),
    detailsGroup,
  ];
}

function getRSVPPrimaryPerson(rsvp) {
  const members = rsvp?.guest_data?.members || [];

  return members.length ? null : rsvp?.guest_data;
}

function renderRSVPDietaryIndicator(rsvp) {
  const primaryPerson = getRSVPPrimaryPerson(rsvp);

  if (!hasPersonDietaryRestriction(primaryPerson)) {
    return "";
  }

  const details = getPersonDietaryRestrictionDetails(primaryPerson) ||
    "Restrição alimentar sem detalhes";

  return `
    <button
      type="button"
      class="rsvp-inline-indicator dietary-restriction"
      data-rsvp-info-action="dietary-restriction"
      data-rsvp-id="${escapeAttribute(rsvp.id)}"
      data-rsvp-person-type="primary"
      title="${escapeAttribute(details)}"
      aria-label="Restrição alimentar do convidado principal: ${escapeAttribute(details)}"
    >
      <i data-lucide="utensils" aria-hidden="true"></i>
    </button>
  `;
}

function renderRSVPChildIndicator(companion) {
  if (companion.is_child !== "Sim") {
    return "";
  }

  const category = BuffetMetrics.classifyChild(companion.age, buffetPayingAge);
  const labels = {
    "child-non-paying": "Criança não pagante",
    "child-paying": "Criança pagante",
    "child-unknown": "Criança sem idade informada",
  };
  const indicator = category === "child-paying" ? "$" : "0";
  const className = category === "child-non-paying"
    ? "non-paying"
    : category === "child-paying"
      ? "paying"
      : "unknown";

  return `
    <span
      class="rsvp-inline-indicator rsvp-child-indicator ${className}"
      title="${escapeAttribute(labels[category] || "Criança")}"
      aria-label="${escapeAttribute(labels[category] || "Criança")}"
    >
      ${safeText(indicator)}
    </span>
  `;
}

function renderRSVPDietaryBadge(person, rsvpId, personType, personIndex = "") {
  if (!hasPersonDietaryRestriction(person)) {
    return "";
  }

  const details = getPersonDietaryRestrictionDetails(person) ||
    "Restrição alimentar sem detalhes";

  return `
    <button
      type="button"
      class="rsvp-inline-indicator dietary-restriction"
      data-rsvp-info-action="dietary-restriction"
      data-rsvp-id="${escapeAttribute(rsvpId)}"
      data-rsvp-person-type="${escapeAttribute(personType)}"
      data-rsvp-person-index="${escapeAttribute(String(personIndex))}"
      title="${escapeAttribute(details)}"
      aria-label="Restrição alimentar: ${escapeAttribute(details)}"
    >
      <i data-lucide="utensils" aria-hidden="true"></i>
    </button>
  `;
}

function renderCoupleDetails(rsvp) {
  const members = rsvp.guest_data?.members || [];

  if (!members.length) {
    return "";
  }

  return `
    <div class="rsvp-person-list">
      ${members
        .map(
          (member, index) => `
            <div class="rsvp-person-item">
              <strong>
                ${safeText(member.name, "Sem nome")}
                ${renderRSVPDietaryBadge(member, rsvp.id, "member", index)}
              </strong>
              <span>Presença: ${safeText(member.presence, "-")}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderCompanionDetails(rsvp) {
  const companions = rsvp.guest_data?.companions || [];

  if (!companions.length) {
    return `<span class="admin-muted">-</span>`;
  }

  return `
    <div class="rsvp-person-list">
      ${companions
        .map((companion, index) => {
          return `
            <div class="rsvp-person-item">
              <strong>
                ${safeText(companion.name, "Sem nome")}
                ${renderRSVPChildIndicator(companion)}
                ${renderRSVPDietaryBadge(companion, rsvp.id, "companion", index)}
              </strong>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function getRSVPGuestMap() {
  return cachedRSVPGuests.reduce((map, guest) => {
    map[guest.id] = guest.name;
    return map;
  }, {});
}

function getRSVPGuestName(rsvp, guestMap) {
  return (
    guestMap[rsvp.guest_id] ||
    rsvp.guest_data?.name ||
    "Convidado nao encontrado"
  );
}

function getRSVPTableAssignment(guestId) {
  return cachedRSVPTableAssignments.find(
    (assignment) => assignment.guest_id === guestId,
  );
}

function getRSVPTable(guestId) {
  const assignment = getRSVPTableAssignment(guestId);

  if (!assignment) {
    return null;
  }

  return cachedRSVPTables.find((tableItem) => tableItem.id === assignment.table_id);
}

function getRSVPTableLabel(rsvp) {
  return getRSVPTable(rsvp.guest_id)?.name || "Sem mesa";
}

function formatRSVPMembers(rsvp) {
  return (rsvp.guest_data?.members || [])
    .map((member) => `${member.name || "Sem nome"}: ${member.presence || "-"}`)
    .join("; ");
}

function formatRSVPCompanions(rsvp) {
  return (rsvp.guest_data?.companions || [])
    .map((companion) => {
      const childInfo =
        companion.is_child === "Sim"
          ? `criança${companion.age ? `, ${companion.age}` : ""}`
          : "adulto";

      return `${companion.name || "Sem nome"} (${childInfo})`;
    })
    .join("; ");
}

function renderAdminIcon(name) {
  const icons = {
    edit:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    eye:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    layoutGrid:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    send:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    trash:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>',
  };

  return icons[name] || "";
}

function renderRSVPMetaGrid(items) {
  return `
    <div class="admin-details-meta-grid">
      ${items
        .map(([label, value]) => {
          const displayValue =
            value === null || value === undefined || value === "" ? "-" : value;

          return `
            <div class="admin-details-meta-item">
              <span>${safeText(label)}</span>
              <strong>${safeText(displayValue)}</strong>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderRSVPDetailsMembers(rsvp) {
  const members = rsvp.guest_data?.members || [];

  if (!members.length) {
    return "";
  }

  return `
    <section class="admin-details-section">
      <span class="admin-details-label">Casal</span>
      <div class="admin-details-list">
        ${members
          .map(
            (member, index) => `
              <div class="admin-details-item">
                <div>
                  <strong>
                    ${safeText(member.name, "Sem nome")}
                    ${renderRSVPDietaryBadge(member, rsvp.id, "member", index)}
                  </strong>
                  <span>Presença: ${safeText(member.presence, "-")}</span>
                  ${
                    hasPersonDietaryRestriction(member)
                      ? `<span>Restrição: ${safeText(getPersonDietaryRestrictionDetails(member) || "Sim, sem detalhes informados")}</span>`
                      : ""
                  }
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function getCompanionChildLabel(companion) {
  if (companion.is_child !== "Sim") {
    return "Adulto";
  }

  const category = BuffetMetrics.classifyChild(companion.age, buffetPayingAge);
  const labels = {
    "child-non-paying": "Criança não pagante",
    "child-paying": "Criança pagante",
    "child-unknown": "Criança sem idade informada",
  };

  return labels[category] || "Criança";
}

function formatCompanionAge(age) {
  const value = String(age || "").trim();

  if (!value) {
    return "";
  }

  return /\D/.test(value) ? value : `${value} anos`;
}

function renderRSVPDetailsCompanions(rsvp) {
  const companions = rsvp.guest_data?.companions || [];

  if (!companions.length) {
    return `
      <section class="admin-details-section">
        <span class="admin-details-label">Acompanhantes</span>
        <p class="admin-muted">Nenhum acompanhante informado.</p>
      </section>
    `;
  }

  return `
    <section class="admin-details-section">
      <span class="admin-details-label">Acompanhantes</span>
      <div class="admin-details-list">
        ${companions
          .map(
            (companion, index) => `
              <div class="admin-details-item">
                <div>
                  <strong>
                    ${safeText(companion.name, "Sem nome")}
                    ${renderRSVPChildIndicator(companion)}
                    ${renderRSVPDietaryBadge(companion, rsvp.id, "companion", index)}
                  </strong>
                  <span>
                    ${safeText(getCompanionChildLabel(companion))}
                    ${
                      companion.is_child === "Sim" && companion.age
                        ? ` · ${safeText(formatCompanionAge(companion.age))}`
                        : ""
                    }
                  </span>
                  ${
                    hasPersonDietaryRestriction(companion)
                      ? `<span>Restrição: ${safeText(getPersonDietaryRestrictionDetails(companion) || "Sim, sem detalhes informados")}</span>`
                      : ""
                  }
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderRSVPDietaryRestrictionsSection(rsvp) {
  const people = getRSVPDietaryPeople(rsvp);

  if (!people.length) {
    return `
      <section class="admin-details-section">
        <span class="admin-details-label">Restrições alimentares</span>
        <p class="admin-muted">Nenhuma restrição alimentar informada.</p>
      </section>
    `;
  }

  return `
    <section class="admin-details-section">
      <span class="admin-details-label">Restrições alimentares</span>
      <div class="admin-details-list dietary-details-list">
        ${people
          .map(({ index, person, role, type }) => {
            const details =
              getPersonDietaryRestrictionDetails(person) ||
              "Sim, sem detalhes informados";

            return `
              <button
                type="button"
                class="admin-details-item dietary-detail-card"
                data-rsvp-info-action="dietary-restriction"
                data-rsvp-id="${escapeAttribute(rsvp.id)}"
                data-rsvp-person-type="${escapeAttribute(type)}"
                data-rsvp-person-index="${escapeAttribute(String(index))}"
              >
                <div>
                  <strong>${safeText(person.name, "Sem nome")}</strong>
                  <span>${safeText(role)}</span>
                </div>
                <span class="dietary-detail-pill">${safeText(details)}</span>
              </button>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderRSVPDetailActionCard({
  action,
  body,
  className = "",
  icon,
  rsvpId,
  title,
}) {
  const cardClass = ["admin-detail-action-card", className]
    .filter(Boolean)
    .join(" ");

  return `
    <button
      type="button"
      class="${escapeAttribute(cardClass)}"
      data-rsvp-detail-action="${escapeAttribute(action)}"
      data-rsvp-id="${escapeAttribute(rsvpId)}"
    >
      <span class="admin-detail-action-icon">${renderAdminIcon(icon)}</span>
      <span>
        <strong>${safeText(title)}</strong>
        <small>${safeText(body)}</small>
      </span>
    </button>
  `;
}

function renderRSVPDetailsActions(rsvp) {
  const communicationActions = [];
  const registrationActions = [];

  registrationActions.push(
    renderRSVPDetailActionCard({
      action: "manage-table",
      body: "Abre o cadastro do convidado para definir, trocar ou remover mesa.",
      icon: "layoutGrid",
      rsvpId: rsvp.id,
      title: "Gerenciar Mesa",
    }),
  );

  registrationActions.push(
    renderRSVPDetailActionCard({
      action: "edit",
      body: "Abre o formulário para ajustar presença, acompanhantes, contato, restrição e mensagem.",
      icon: "edit",
      rsvpId: rsvp.id,
      title: "Editar RSVP",
    }),
  );

  if (rsvp.email) {
    communicationActions.push(
      renderRSVPDetailActionCard({
        action: "resend-confirmation",
        body: "Envia novamente a confirmação de RSVP para o e-mail informado.",
        icon: "send",
        rsvpId: rsvp.id,
        title: "Reenviar Confirmação",
      }),
    );
  }

  registrationActions.push(
    renderRSVPDetailActionCard({
      action: "delete",
      body: "Remove esta confirmação de presença depois da confirmação de segurança.",
      className: "danger",
      icon: "trash",
      rsvpId: rsvp.id,
      title: "Excluir RSVP",
    }),
  );

  const groups = [
    ["Comunicação", communicationActions],
    ["Cadastro", registrationActions],
  ].filter(([, actions]) => actions.length);

  return `
    <div class="gift-detail-action-groups">
      ${groups
        .map(
          ([label, actions]) => `
            <div class="gift-detail-action-group">
              <span class="quota-action-label">${safeText(label)}</span>
              <div class="admin-detail-action-grid">
                ${actions.join("")}
              </div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function getRSVPById(rsvpId) {
  return cachedRSVPs.find((rsvp) => rsvp.id === rsvpId);
}

function getRSVPGuestById(guestId) {
  return cachedRSVPGuests.find((guest) => guest.id === guestId);
}

function openGuestTableManagementFromRSVP(rsvpId) {
  const rsvp = getRSVPById(rsvpId);

  if (!rsvp?.guest_id) {
    showAdminToast("⚠️ Convidado do RSVP não encontrado");
    return;
  }

  window.location.href = `./admin-guests.html?guest=${encodeURIComponent(rsvp.guest_id)}`;
}

async function getRSVPGuestForEdit(rsvp) {
  const cachedGuest = getRSVPGuestById(rsvp.guest_id);

  if (cachedGuest) {
    return cachedGuest;
  }

  const { data, error } = await supabaseClient
    .from("guests")
    .select("*")
    .eq("id", rsvp.guest_id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

async function openRSVPEditModal(rsvpId) {
  const rsvp = getRSVPById(rsvpId);

  if (!rsvp) {
    showAdminToast("⚠️ Não foi possível encontrar este RSVP");
    return;
  }

  const guest = await getRSVPGuestForEdit(rsvp);

  if (!guest) {
    showAdminToast("⚠️ Não foi possível encontrar o convidado deste RSVP");
    return;
  }

  openAdminRSVPModal(guest);
}

window.openRSVPDetailsModal = function (rsvp) {
  const guest = getRSVPGuestById(rsvp.guest_id);
  const guestMap = getRSVPGuestMap();
  const guestName = getRSVPGuestName(rsvp, guestMap);
  const companionCount = Number(rsvp.guest_data?.guest_count || 0);
  const buffetMetrics = BuffetMetrics.getRSVPMetrics(
    guest,
    rsvp,
    buffetPayingAge,
  );

  rsvpDetailsTitle.textContent = guestName || "Detalhes do RSVP";

  replaceSafeContent(rsvpDetailsContent, `
    <section class="admin-details-section">
      <span class="admin-details-label">Resumo</span>
      <div class="gift-situation-stack">
        ${renderPresenceBadge(rsvp.presence)}
        ${renderInviteTypeBadge(guest?.invite_type)}
        ${
          hasDietaryRestriction(rsvp)
            ? '<span class="admin-badge badge-warning">Restrição alimentar</span>'
            : '<span class="admin-badge badge-muted">Sem restrição alimentar</span>'
        }
      </div>
    </section>

    <section class="admin-details-section">
      <span class="admin-details-label">Contato</span>
      ${renderRSVPMetaGrid([
        ["E-mail", rsvp.email || "-"],
        ["Telefone", rsvp.phone || "-"],
        ["Mensagem", rsvp.message || "-"],
      ])}
    </section>

    ${renderRSVPDietaryRestrictionsSection(rsvp)}
    ${renderRSVPDetailsMembers(rsvp)}
    ${renderRSVPDetailsCompanions(rsvp)}

    <section class="admin-details-section">
      <span class="admin-details-label">Mesa</span>
      ${renderRSVPMetaGrid([["Mesa atual", getRSVPTableLabel(rsvp)]])}
    </section>

    <section class="admin-details-section">
      <span class="admin-details-label">Ações</span>
      ${renderRSVPDetailsActions(rsvp)}
    </section>

    <section class="admin-details-section">
      <span class="admin-details-label">Contagem</span>
      ${renderRSVPMetaGrid([
        ["Acompanhantes", companionCount],
        ["Total de pessoas", buffetMetrics.totalPeople],
        ["Pagantes", buffetMetrics.payingPeople],
        ["Crianças", buffetMetrics.children],
        ["Crianças pagantes", buffetMetrics.payingChildren],
        ["Crianças não pagantes", buffetMetrics.nonPayingChildren],
      ])}
    </section>

    <section class="admin-details-section">
      <span class="admin-details-label">Datas</span>
      ${renderRSVPMetaGrid([
        ["Criado em", formatDate(rsvp.created_at)],
        ["Atualizado em", formatDate(rsvp.updated_at || rsvp.created_at)],
      ])}
    </section>
  `);

  rsvpDetailsModal.classList.add("active");

  if (window.lucide) {
    window.lucide.createIcons();
  }
};

window.closeRSVPDetailsModal = function () {
  rsvpDetailsModal.classList.remove("active");
};

function getRSVPDietaryPerson(rsvp, personType, personIndex) {
  if (personType === "primary") {
    return {
      person: getRSVPPrimaryPerson(rsvp),
      role: "Convidado principal",
    };
  }

  if (personType === "member") {
    return {
      person: rsvp?.guest_data?.members?.[Number(personIndex)],
      role: "Membro do convite",
    };
  }

  if (personType === "companion") {
    return {
      person: rsvp?.guest_data?.companions?.[Number(personIndex)],
      role: "Acompanhante",
    };
  }

  return { person: null, role: "" };
}

function openRSVPDietaryRestrictionModal(rsvpId, personType = "", personIndex = "") {
  const rsvp = getRSVPById(rsvpId);
  const { person, role } = getRSVPDietaryPerson(rsvp, personType, personIndex);

  if (!rsvp || !hasPersonDietaryRestriction(person)) {
    showAdminToast("⚠️ Restrição alimentar não encontrada");
    return;
  }

  const details =
    getPersonDietaryRestrictionDetails(person) ||
    "Sim, sem detalhes informados";
  const guestName = getRSVPGuestName(rsvp, getRSVPGuestMap());

  rsvpDetailsTitle.textContent = "Restrição Alimentar";

  replaceSafeContent(rsvpDetailsContent, `
    <section class="admin-details-section dietary-detail-modal-card">
      <span class="admin-details-label">Pessoa com restrição</span>
      <div class="dietary-detail-modal-header">
        <span class="rsvp-inline-indicator dietary-restriction">
          <i data-lucide="utensils" aria-hidden="true"></i>
        </span>
        <div>
          <strong>${safeText(person.name, "Sem nome")}</strong>
          <span>${safeText(role)}</span>
          <small>Convite: ${safeText(guestName)}</small>
        </div>
      </div>
      <div class="dietary-detail-modal-text">
        ${safeText(details)}
      </div>
    </section>
  `);

  rsvpDetailsModal.classList.add("active");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeAdminRSVPModal() {
  adminRSVPModal.classList.remove("active");
  selectedRSVPGuest = null;
  selectedExistingRSVP = null;
}

function renderAdminRSVPGuestOptions(maxGuests) {
  adminRSVPGuestCountInput.replaceChildren();

  for (let i = 0; i <= maxGuests; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    adminRSVPGuestCountInput.appendChild(option);
  }
}

function getAdminRSVPCompanions() {
  const companions = [];
  const count = Number(adminRSVPGuestCountInput.value || 0);

  for (let i = 1; i <= count; i++) {
    const dietaryRestriction = normalizePersonDietaryRestriction({
      food:
        document.querySelector(`.admin-rsvp-companion-food[data-index="${i}"]`)
          ?.value || "",
      food_restriction:
        document.querySelector(
          `.admin-rsvp-companion-food-restriction[data-index="${i}"]`,
        )?.value || "Não",
      name:
        document.querySelector(`.admin-rsvp-companion-name[data-index="${i}"]`)
          ?.value || "",
    });

    companions.push({
      name:
        document.querySelector(`.admin-rsvp-companion-name[data-index="${i}"]`)
          ?.value || "",
      is_child:
        document.querySelector(`.admin-rsvp-companion-child[data-index="${i}"]`)
          ?.value || "Não",
      age:
        document.querySelector(`.admin-rsvp-companion-age[data-index="${i}"]`)
          ?.value || "",
      ...dietaryRestriction,
    });
  }

  return companions;
}

function createAdminFormGroup(labelText, field) {
  const group = document.createElement("div");
  const label = document.createElement("label");

  group.className = "admin-form-group";
  label.textContent = labelText;
  group.append(label, field);

  return group;
}

function createAdminRSVPCompanionField(index, companion = {}) {
  const wrapper = document.createElement("div");
  const title = document.createElement("h4");
  const nameInput = document.createElement("input");
  const childSelect = document.createElement("select");
  const noOption = document.createElement("option");
  const yesOption = document.createElement("option");
  const ageGroup = document.createElement("div");
  const ageLabel = document.createElement("label");
  const ageSelect = document.createElement("select");
  const help = document.createElement("small");
  const isChild = companion.is_child === "Sim";
  const dietaryRestriction = normalizePersonDietaryRestriction({
    food: companion.food,
    food_restriction: companion.food_restriction,
    name: companion.name,
  });

  wrapper.className = "admin-rsvp-companion-card";
  title.textContent = `Acompanhante ${index}`;

  nameInput.type = "text";
  nameInput.className = "admin-rsvp-companion-name";
  nameInput.dataset.index = index;
  nameInput.value = companion.name || "";
  nameInput.required = true;

  childSelect.className = "admin-rsvp-companion-child";
  childSelect.dataset.index = index;
  noOption.value = "Não";
  noOption.textContent = "Não";
  noOption.selected = !isChild;
  yesOption.value = "Sim";
  yesOption.textContent = "Sim";
  yesOption.selected = isChild;
  childSelect.append(noOption, yesOption);

  ageGroup.className = `admin-form-group admin-rsvp-companion-age-group${
    isChild ? "" : " is-hidden"
  }`;
  ageGroup.dataset.index = index;
  ageLabel.textContent = "Idade da criança no casamento";
  ageSelect.className = "admin-rsvp-companion-age";
  ageSelect.dataset.index = index;
  ageSelect.required = isChild;
  ChildAgeOptions.populateSelect(ageSelect, companion.age);
  help.className = "admin-field-help";
  help.textContent =
    "Considere a idade que a criança terá na data do casamento.";
  ageGroup.append(ageLabel, ageSelect, help);

  wrapper.append(
    title,
    createAdminFormGroup("Nome", nameInput),
    createAdminFormGroup("É criança?", childSelect),
    ageGroup,
    ...createAdminFoodRestrictionFields({
      detailsClassName: "admin-rsvp-companion-food-group",
      foodClassName: "admin-rsvp-companion-food",
      foodValue: dietaryRestriction.food,
      hasRestriction: dietaryRestriction.food_restriction,
      index,
      restrictionClassName: "admin-rsvp-companion-food-restriction",
    }),
  );

  return wrapper;
}

function renderAdminRSVPCompanionFields(companions = []) {
  adminRSVPGuestFields.replaceChildren();

  const count = Number(adminRSVPGuestCountInput.value || 0);

  for (let i = 1; i <= count; i++) {
    const companion = companions[i - 1] || {};
    const wrapper = createAdminRSVPCompanionField(i, companion);

    adminRSVPGuestFields.appendChild(wrapper);

    const childSelect = wrapper.querySelector(".admin-rsvp-companion-child");
    const ageGroup = wrapper.querySelector(".admin-rsvp-companion-age-group");
    const ageInput = wrapper.querySelector(".admin-rsvp-companion-age");

    childSelect.addEventListener("change", () => {
      const isChild = childSelect.value === "Sim";
      setElementVisibility(ageGroup, isChild);
      ageInput.required = isChild;

      if (!isChild && ageInput) {
        ageInput.value = "";
      }
    });
  }
}

function hideAdminRSVPCompanions(keepCache = true) {
  if (keepCache) {
    const currentCompanions = getAdminRSVPCompanions();

    if (currentCompanions.length > 0) {
      cachedAdminRSVPCompanions = currentCompanions;
    }
  }

  const guestCountGroup = adminRSVPGuestCountInput.closest(".admin-form-group");

  if (guestCountGroup) {
    setElementVisibility(guestCountGroup, false);
  }

  adminRSVPGuestCountInput.value = 0;
  adminRSVPGuestFields.replaceChildren();
}

function showAdminRSVPCompanionsIfAllowed() {
  const maxGuests = selectedRSVPGuest?.max_guests || 0;

  if (maxGuests <= 0) {
    hideAdminRSVPCompanions(false);
    return;
  }

  const guestCountGroup = adminRSVPGuestCountInput.closest(".admin-form-group");

  if (guestCountGroup) {
    setElementVisibility(guestCountGroup, true);
  }

  if (cachedAdminRSVPCompanions.length > 0) {
    adminRSVPGuestCountInput.value = cachedAdminRSVPCompanions.length;
    renderAdminRSVPCompanionFields(cachedAdminRSVPCompanions);
  }
}

function updateAdminRSVPCoupleCompanionVisibility() {
  const memberSelects = document.querySelectorAll(
    ".admin-rsvp-member-presence",
  );

  if (!memberSelects.length) {
    return;
  }

  const someoneIsComing = Array.from(memberSelects).some(
    (select) => select.value === "Sim",
  );

  if (someoneIsComing) {
    showAdminRSVPCompanionsIfAllowed();
  } else {
    hideAdminRSVPCompanions();
  }
}

window.openAdminRSVPModal = async function (selectedGuest) {
  selectedRSVPGuest = selectedGuest;
  adminRSVPForm.reset();
  adminRSVPGuestFields.replaceChildren();
  adminRSVPModalTitle.textContent = `RSVP de ${selectedGuest.name || "Convidado"}`;
  renderAdminRSVPGuestOptions(selectedGuest.max_guests || 0);

  const { data, error } = await supabaseClient
    .from("rsvps")
    .select("*")
    .eq("guest_id", selectedGuest.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Erro ao carregar RSVP");
    return;
  }

  selectedExistingRSVP = data;
  setElementVisibility(deleteAdminRSVPButton, Boolean(selectedExistingRSVP));
  cachedAdminRSVPCompanions = data?.guest_data?.companions || [];
  adminRSVPEmailInput.value = data?.email || "";
  adminRSVPPhoneInput.value = data?.phone || "";

  if (selectedGuest.invite_type === "couple") {
    setElementVisibility(adminRSVPPresenceGroup, false);
    setElementVisibility(adminRSVPCoupleMembers, true);
    setElementVisibility(adminRSVPPrimaryFoodSection, false);

    const members = selectedGuest.couple_members || [];
    const existingMembers = data?.guest_data?.members || [];

    adminRSVPCoupleMembers.replaceChildren();

    members.forEach((member, index) => {
      const existingPresence = existingMembers[index]?.presence || "Sim";
      const dietaryRestriction = normalizePersonDietaryRestriction({
        food: existingMembers[index]?.food || member.food,
        food_restriction:
          existingMembers[index]?.food_restriction ?? member.food_restriction,
        name: member.name,
      });
      const wrapper = document.createElement("div");
      const select = document.createElement("select");
      const yesOption = document.createElement("option");
      const noOption = document.createElement("option");

      wrapper.className = "admin-rsvp-companion-card";
      select.className = "admin-rsvp-member-presence";
      select.dataset.index = index;
      yesOption.value = "Sim";
      yesOption.textContent = "Sim";
      yesOption.selected = existingPresence === "Sim";
      noOption.value = "Não";
      noOption.textContent = "Não";
      noOption.selected = existingPresence === "Não";
      select.append(yesOption, noOption);
      wrapper.append(
        Object.assign(document.createElement("h4"), {
          textContent: member.name || "Sem nome",
        }),
        createAdminFormGroup("Presença", select),
        ...createAdminFoodRestrictionFields({
          detailsClassName: "admin-rsvp-member-food-group",
          foodClassName: "admin-rsvp-member-food",
          foodValue: dietaryRestriction.food,
          hasRestriction: dietaryRestriction.food_restriction,
          index,
          restrictionClassName: "admin-rsvp-member-food-restriction",
        }),
      );
      adminRSVPCoupleMembers.appendChild(wrapper);
    });

    document
      .querySelectorAll(".admin-rsvp-member-presence")
      .forEach((select) => {
        select.addEventListener(
          "change",
          updateAdminRSVPCoupleCompanionVisibility,
        );
      });
  } else {
    setElementVisibility(adminRSVPPresenceGroup, true);
    setElementVisibility(adminRSVPCoupleMembers, false);
    setElementVisibility(adminRSVPPrimaryFoodSection, true);
    adminRSVPPresenceInput.value = data?.presence || "Sim";
  }

  adminRSVPGuestCountInput.value = data?.guest_data?.guest_count || 0;

  const currentPresence = data?.presence || "Sim";
  const shouldShowCompanions =
    currentPresence === "Sim" && (selectedGuest.max_guests || 0) > 0;

  if (shouldShowCompanions) {
    showAdminRSVPCompanionsIfAllowed();
    renderAdminRSVPCompanionFields(cachedAdminRSVPCompanions);
  } else {
    hideAdminRSVPCompanions(false);
  }

  if (selectedGuest.invite_type === "couple") {
    updateAdminRSVPCoupleCompanionVisibility();
  }

  if (adminRSVPFoodRestrictionInput) {
    const primaryDietaryRestriction = normalizePersonDietaryRestriction({
      food: data?.guest_data?.food || data?.food,
      food_restriction: data?.guest_data?.food_restriction ?? hasDietaryRestriction(data),
      name: selectedGuest.name,
    });

    adminRSVPFoodRestrictionInput.value = primaryDietaryRestriction.food_restriction
      ? "Sim"
      : "Não";
    adminRSVPFoodInput.value = primaryDietaryRestriction.food;
  }
  updateAdminRSVPFoodVisibility();
  adminRSVPMessageInput.value = data?.message || "";
  adminRSVPModal.classList.add("active");
};

async function loadRSVPsAdmin() {
  const [
    guestsResult,
    rsvpsResult,
    settingsResult,
    tablesResult,
    assignmentsResult,
  ] = await Promise.all([
    supabaseClient.from("guests").select("*"),
    supabaseClient.from("rsvps").select("*"),
    supabaseClient.rpc("get_public_settings").maybeSingle(),
    supabaseClient.rpc("admin_list_wedding_tables"),
    supabaseClient.rpc("admin_list_wedding_table_assignments"),
  ]);

  const error =
    guestsResult.error ||
    rsvpsResult.error ||
    settingsResult.error ||
    tablesResult.error ||
    assignmentsResult.error;

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Erro ao carregar confirmações");
    return;
  }

  const activeGuests = (guestsResult.data || []).filter((guest) => guest.active);
  const activeGuestIds = activeGuests.map((guest) => guest.id);
  const activeRSVPs = (rsvpsResult.data || []).filter((rsvp) =>
    activeGuestIds.includes(rsvp.guest_id),
  );

  cachedRSVPs = activeRSVPs;
  cachedRSVPGuests = activeGuests;
  cachedRSVPTables = tablesResult.data || [];
  cachedRSVPTableAssignments = assignmentsResult.data || [];
  buffetPayingAge = BuffetMetrics.normalizePayingAge(
    settingsResult.data?.buffet_paying_age,
  );
  updateRSVPTableFilter();
  applyRSVPFilters();
}

function updateRSVPTableFilter() {
  const currentValue = rsvpTableFilter?.value || "";

  if (!rsvpTableFilter) {
    return;
  }

  rsvpTableFilter.replaceChildren(
    new Option("Todas", ""),
    new Option("Com mesa", "assigned"),
    new Option("Sem mesa", "unassigned"),
  );

  cachedRSVPTables
    .filter((tableItem) => tableItem.is_active)
    .sort((first, second) => compareValues(first.display_order, second.display_order))
    .forEach((tableItem) => {
      rsvpTableFilter.appendChild(new Option(tableItem.name, tableItem.id));
    });

  if (
    currentValue === "assigned" ||
    currentValue === "unassigned" ||
    cachedRSVPTables.some((tableItem) => tableItem.id === currentValue)
  ) {
    rsvpTableFilter.value = currentValue;
  }
}

function renderRSVPTable(rsvps, guests) {
  const guestMap = {};

  guests.forEach((guest) => {
    guestMap[guest.id] = guest.name;
  });

  if (!rsvps.length) {
    replaceSafeContent(rsvpsTableBody, `
      <tr>
        <td colspan="7" class="admin-empty-state">
          Nenhum RSVP encontrado para os filtros selecionados.
        </td>
      </tr>
    `);
    renderRSVPMobileList(rsvps, guestMap);
    return;
  }

  replaceSafeContent(rsvpsTableBody, rsvps
    .map((rsvp) => {
      const guestName =
        guestMap[rsvp.guest_id] ||
        rsvp.guest_data?.name ||
        "Convidado não encontrado";

      const companionCount = Number(rsvp.guest_data?.guest_count || 0);

      return `
        <tr data-rsvp-row-id="${escapeAttribute(rsvp.id)}" tabindex="0">
          <td>
            <strong class="rsvp-table-guest">
              ${safeText(guestName)}
              ${renderRSVPDietaryIndicator(rsvp)}
            </strong>
            <span class="admin-muted rsvp-table-meta">
              ${safeText(getRSVPTableLabel(rsvp))}
            </span>
          </td>
          <td>
            ${renderPresenceBadge(rsvp.presence)}
            ${renderCoupleDetails(rsvp)}
          </td>
          <td>${companionCount}</td>
          <td>${renderCompanionDetails(rsvp)}</td>
          <td>${safeText(rsvp.message)}</td>
          <td>${formatDate(rsvp.updated_at || rsvp.created_at)}</td>
          <td>
            <div class="admin-actions compact-actions rsvp-actions">
              <button
                class="admin-action-button icon-action"
                data-rsvp-action="details"
                data-rsvp-id="${escapeAttribute(rsvp.id)}"
                title="Ver detalhes"
              >
                ${renderAdminIcon("eye")}
                Detalhes
              </button>

              <button
                class="admin-action-button danger icon-action"
                data-rsvp-action="delete"
                data-rsvp-id="${escapeAttribute(rsvp.id)}"
                title="Remover RSVP"
              >
                ${renderAdminIcon("trash")}
                Remover
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join(""));
  renderRSVPMobileList(rsvps, guestMap);

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderRSVPMobileList(rsvps, guestMap) {
  if (!rsvpsMobileList) {
    return;
  }

  if (!rsvps.length) {
    replaceSafeContent(rsvpsMobileList, `
      <div class="admin-mobile-empty-state">
        Nenhum RSVP encontrado para os filtros selecionados.
      </div>
    `);
    return;
  }

  replaceSafeContent(rsvpsMobileList, rsvps
    .map((rsvp) => {
      const guestName =
        guestMap[rsvp.guest_id] ||
        rsvp.guest_data?.name ||
        "Convidado não encontrado";
      const companionCount = Number(rsvp.guest_data?.guest_count || 0);
      const message = String(rsvp.message || "").trim();

      return `
        <article class="admin-mobile-list-card rsvp-mobile-card" data-rsvp-card-id="${escapeAttribute(rsvp.id)}" tabindex="0">
          <div class="admin-mobile-card-main">
            <div>
              <strong>
                ${safeText(guestName)}
                ${renderRSVPDietaryIndicator(rsvp)}
              </strong>
              <span>${safeText(getRSVPTableLabel(rsvp))} · ${formatDate(rsvp.updated_at || rsvp.created_at)}</span>
            </div>
            ${renderPresenceBadge(rsvp.presence)}
          </div>

          <div class="admin-mobile-card-badges">
            ${renderInviteTypeBadge(getRSVPGuestById(rsvp.guest_id)?.invite_type)}
            ${
              hasDietaryRestriction(rsvp)
                ? '<span class="admin-badge badge-warning">Restrição</span>'
                : '<span class="admin-badge badge-muted">Sem restrição</span>'
            }
            ${
              companionCount > 0
                ? `<span class="admin-badge badge-payment">${companionCount} acomp.</span>`
                : '<span class="admin-badge badge-muted">Sem acomp.</span>'
            }
          </div>

          <dl class="admin-mobile-card-meta rsvp-mobile-card-meta">
            <div>
              <dt>Presença</dt>
              <dd>${safeText(rsvp.presence || "-")}</dd>
            </div>
            <div>
              <dt>Acomp.</dt>
              <dd>${companionCount}</dd>
            </div>
            <div>
              <dt>Mensagem</dt>
              <dd>${message ? "Sim" : "Não"}</dd>
            </div>
          </dl>

          ${
            message
              ? `<p class="rsvp-mobile-message">${safeText(message)}</p>`
              : ""
          }

          <div class="admin-mobile-card-actions rsvp-mobile-card-actions">
            <button
              class="admin-action-button icon-action"
              data-rsvp-action="details"
              data-rsvp-id="${escapeAttribute(rsvp.id)}"
            >
              ${renderAdminIcon("eye")}
              Detalhes
            </button>
            <button
              class="admin-action-button danger icon-action"
              data-rsvp-action="delete"
              data-rsvp-id="${escapeAttribute(rsvp.id)}"
            >
              ${renderAdminIcon("trash")}
              Remover
            </button>
          </div>
        </article>
      `;
    })
    .join(""));

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function applyRSVPFilters() {
  const guestMap = getRSVPGuestMap();
  const guestRecordMap = cachedRSVPGuests.reduce((map, guest) => {
    map[guest.id] = guest;
    return map;
  }, {});

  const search = normalizeText(rsvpSearchInput?.value);
  const presence = rsvpPresenceFilter?.value || "";
  const companionFilter = rsvpCompanionFilter?.value || "";
  const restrictionFilter = rsvpRestrictionFilter?.value || "";
  const buffetFilter = rsvpBuffetFilter?.value || "";
  const tableFilter = rsvpTableFilter?.value || "";

  const filteredRSVPs = cachedRSVPs.filter((rsvp) => {
    const guestName =
      guestMap[rsvp.guest_id] ||
      rsvp.guest_data?.name ||
      "Convidado não encontrado";
    const companions = rsvp.guest_data?.companions || [];
    const members = rsvp.guest_data?.members || [];
    const tableItem = getRSVPTable(rsvp.guest_id);
    const companionCount = Number(rsvp.guest_data?.guest_count || 0);
    const buffetMetrics = BuffetMetrics.getRSVPMetrics(
      guestRecordMap[rsvp.guest_id],
      rsvp,
      buffetPayingAge,
    );

    const searchable = normalizeText(
      [
        guestName,
        tableItem?.name,
        getDietaryRestrictionDetails(rsvp),
        rsvp.message,
        ...companions.map((companion) => companion.name),
        ...companions.map((companion) => companion.food),
        ...members.map((member) => member.name),
        ...members.map((member) => member.food),
      ].join(" "),
    );

    const matchesSearch = !search || searchable.includes(search);
    const matchesPresence = !presence || rsvp.presence === presence;
    const matchesCompanions =
      !companionFilter ||
      (companionFilter === "with"
        ? companionCount > 0
        : companionCount === 0);
    const hasRestriction = hasDietaryRestriction(rsvp);
    const matchesRestriction =
      !restrictionFilter ||
      (restrictionFilter === "with" ? hasRestriction : !hasRestriction);
    const matchesBuffet =
      !buffetFilter ||
      (buffetFilter === "paying" && buffetMetrics.payingPeople > 0) ||
      (buffetFilter === "children" && buffetMetrics.children > 0) ||
      (buffetFilter === "child-paying" &&
        buffetMetrics.payingChildren > 0) ||
      (buffetFilter === "child-non-paying" &&
        buffetMetrics.nonPayingChildren > 0) ||
      (buffetFilter === "child-unknown" &&
        buffetMetrics.unknownAgeChildren > 0);
    const matchesTable =
      !tableFilter ||
      (tableFilter === "assigned"
        ? Boolean(tableItem)
        : tableFilter === "unassigned"
          ? !tableItem
          : tableItem?.id === tableFilter);

    return (
      matchesSearch &&
      matchesPresence &&
      matchesCompanions &&
      matchesRestriction &&
      matchesBuffet &&
      matchesTable
    );
  });

  const sortedRSVPs = sortRSVPs(filteredRSVPs, guestMap);
  visibleRSVPs = sortedRSVPs;

  updateRSVPFilterCount(sortedRSVPs.length);
  updateRSVPSortButtons();
  renderRSVPTable(sortedRSVPs, cachedRSVPGuests);
}

function getRSVPSortValue(rsvp, guestMap) {
  const guestName =
    guestMap[rsvp.guest_id] ||
    rsvp.guest_data?.name ||
    "Convidado não encontrado";

  const sortValues = {
    companions: Number(rsvp.guest_data?.guest_count || 0),
    guest: guestName,
    presence: rsvp.presence,
    updated: rsvp.updated_at || rsvp.created_at
      ? new Date(rsvp.updated_at || rsvp.created_at).getTime()
      : 0,
  };

  return sortValues[rsvpSortState.key] ?? "";
}

function sortRSVPs(rsvps, guestMap) {
  return [...rsvps].sort((a, b) => {
    const result = compareValues(
      getRSVPSortValue(a, guestMap),
      getRSVPSortValue(b, guestMap),
    );

    return rsvpSortState.direction === "asc" ? result : -result;
  });
}

function updateRSVPSortButtons() {
  document.querySelectorAll("[data-rsvp-sort]").forEach((button) => {
    button.classList.remove("sorted-asc", "sorted-desc");

    if (button.dataset.rsvpSort === rsvpSortState.key) {
      button.classList.add(`sorted-${rsvpSortState.direction}`);
    }
  });
}

function setRSVPSort(key) {
  if (rsvpSortState.key === key) {
    rsvpSortState.direction =
      rsvpSortState.direction === "asc" ? "desc" : "asc";
  } else {
    rsvpSortState = {
      key,
      direction: "asc",
    };
  }

  applyRSVPFilters();
}

function updateRSVPFilterCount(count) {
  if (!rsvpFilterCount) {
    return;
  }

  const total = cachedRSVPs.length;
  rsvpFilterCount.textContent =
    count === total
      ? `${total} RSVP${total === 1 ? "" : "s"}`
      : `${count} de ${total} RSVP${total === 1 ? "" : "s"}`;

  if (rsvpFiltersPanel) {
    rsvpFiltersPanel.dataset.hasActiveFilters = String(count !== total);
  }
}

function exportRSVPsCSV() {
  if (!visibleRSVPs.length) {
    showAdminToast("⚠️ Nenhum RSVP para exportar");
    return;
  }

  const guestMap = getRSVPGuestMap();
  const guestRecordMap = cachedRSVPGuests.reduce((map, guest) => {
    map[guest.id] = guest;
    return map;
  }, {});
  const getMetrics = (rsvp) =>
    BuffetMetrics.getRSVPMetrics(
      guestRecordMap[rsvp.guest_id],
      rsvp,
      buffetPayingAge,
    );

  AdminExport.downloadCSV("rsvps", [
    { label: "Convidado", value: (rsvp) => getRSVPGuestName(rsvp, guestMap) },
    { label: "Mesa", value: getRSVPTableLabel },
    { label: "Presença", value: "presence" },
    { label: "Membros do casal", value: formatRSVPMembers },
    {
      label: "Quantidade de acompanhantes",
      value: (rsvp) => Number(rsvp.guest_data?.guest_count || 0),
    },
    { label: "Acompanhantes", value: formatRSVPCompanions },
    {
      label: "Total de Pessoas",
      value: (rsvp) => getMetrics(rsvp).totalPeople,
    },
    {
      label: "Convidados Pagantes",
      value: (rsvp) => getMetrics(rsvp).payingPeople,
    },
    {
      label: "Total de Crianças",
      value: (rsvp) => getMetrics(rsvp).children,
    },
    {
      label: "Crianças Pagantes",
      value: (rsvp) => getMetrics(rsvp).payingChildren,
    },
    {
      label: "Crianças Não Pagantes",
      value: (rsvp) => getMetrics(rsvp).nonPayingChildren,
    },
    {
      label: "Crianças Sem Idade",
      value: (rsvp) => getMetrics(rsvp).unknownAgeChildren,
    },
    {
      label: "Possui Restrição Alimentar",
      value: getDietaryRestrictionLabel,
    },
    { label: "Restrição Alimentar", value: getDietaryRestrictionDetails },
    { label: "Mensagem", value: "message" },
    {
      label: "Atualizado em",
      value: (rsvp) => formatDate(rsvp.updated_at || rsvp.created_at),
    },
  ], visibleRSVPs);

  showAdminToast("💜 CSV de RSVPs exportado!");
}

function clearRSVPFilters() {
  if (rsvpSearchInput) {
    rsvpSearchInput.value = "";
  }

  [
    rsvpPresenceFilter,
    rsvpCompanionFilter,
    rsvpRestrictionFilter,
    rsvpBuffetFilter,
    rsvpTableFilter,
  ].forEach((filter) => {
    if (filter) {
      filter.value = "";
    }
  });

  applyRSVPFilters();
}

function shouldIgnoreRSVPItemClick(target) {
  return Boolean(
    target.closest(
      "button, a, input, select, textarea, label, [data-rsvp-action], [data-rsvp-info-action], .admin-action-button",
    ),
  );
}

function openRSVPDetailsFromInteractiveItem(element) {
  const rsvpId = element?.dataset.rsvpRowId || element?.dataset.rsvpCardId;
  const rsvp = rsvpId ? getRSVPById(rsvpId) : null;

  if (rsvp) {
    openRSVPDetailsModal(rsvp);
  }
}

window.deleteRSVPFromTable = async function (rsvpId) {
  const confirmed = confirm("Deseja remover esta confirmação de presença?");

  if (!confirmed) {
    return;
  }

  const { data, error } = await supabaseClient.rpc("admin_delete_guest_rsvp", {
    target_rsvp_id: rsvpId,
  });

  if (error || data !== true) {
    console.error(error);
    showAdminToast(
      "⚠️ Não foi possível remover o RSVP. Atualize a lista e tente novamente",
    );
    return;
  }

  showAdminToast("💜 RSVP removido com sucesso!");
  await loadRSVPsAdmin();
};

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

window.resendRSVPConfirmation = async function (rsvpId) {
  const confirmed = confirm(
    "Deseja reenviar a confirmação de RSVP para este convidado?",
  );

  if (!confirmed) {
    return;
  }

  const { data, error } = await supabaseClient.rpc(
    "admin_create_manual_notification_event",
    {
      target_aggregate_id: rsvpId,
      target_event_type: "rsvp_saved",
      target_recipient_type: "guest",
    },
  );

  if (error || !data) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível criar o reenvio do RSVP");
    return;
  }

  try {
    await processManualNotificationEvent(data);
  } catch (notificationError) {
    console.error(notificationError);
  }

  showAdminToast("💜 Confirmação de RSVP reenviada para processamento!");
  await loadRSVPsAdmin();
};

adminRSVPForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedRSVPGuest) {
    return;
  }

  const wasEditingRSVP = Boolean(selectedExistingRSVP);
  const isCoupleInvite = selectedRSVPGuest.invite_type === "couple";
  let members = [];
  let finalPresence = adminRSVPPresenceInput.value;

  if (isCoupleInvite) {
    members = (selectedRSVPGuest.couple_members || []).map((member, index) => {
      const presence =
        document.querySelector(
          `.admin-rsvp-member-presence[data-index="${index}"]`,
        )?.value || "Não";
      const dietaryRestriction = normalizePersonDietaryRestriction({
        food:
          document.querySelector(
            `.admin-rsvp-member-food[data-index="${index}"]`,
          )?.value || "",
        food_restriction:
          document.querySelector(
            `.admin-rsvp-member-food-restriction[data-index="${index}"]`,
          )?.value || "Não",
        name: member.name,
      });

      return {
        name: member.name,
        presence,
        ...dietaryRestriction,
      };
    });

    finalPresence = members.some((member) => member.presence === "Sim")
      ? "Sim"
      : "Não";
  }

  let guestCount = Number(adminRSVPGuestCountInput.value || 0);
  let companions = getAdminRSVPCompanions();

  if (finalPresence === "Não") {
    guestCount = 0;
    companions = [];
  }

  const primaryDietaryRestriction = normalizePersonDietaryRestriction({
    food: adminRSVPFoodInput.value || "",
    food_restriction: adminRSVPFoodRestrictionInput?.value || "Não",
    name: selectedRSVPGuest.name,
  });
  const peopleWithDietaryRestriction = getPeopleWithDietaryRestriction({
    companions,
    members,
    primary: isCoupleInvite
      ? null
      : {
          name: selectedRSVPGuest.name,
          presence: finalPresence,
          ...primaryDietaryRestriction,
        },
  });
  const hasFoodRestriction = peopleWithDietaryRestriction.length > 0;

  const payload = {
    presence: finalPresence,
    email: adminRSVPEmailInput.value || "",
    phone: adminRSVPPhoneInput.value || "",
    food: buildFoodSummary(peopleWithDietaryRestriction),
    food_restriction: hasFoodRestriction,
    message: adminRSVPMessageInput.value || "",
    guest_data: {
      name: selectedRSVPGuest.name,
      email: adminRSVPEmailInput.value || "",
      phone: adminRSVPPhoneInput.value || "",
      guest_count: guestCount,
      food: isCoupleInvite ? "" : primaryDietaryRestriction.food,
      food_restriction: isCoupleInvite
        ? false
        : primaryDietaryRestriction.food_restriction,
      members,
      companions,
    },
  };

  const result = await supabaseClient.rpc("admin_save_guest_rsvp", {
    target_guest_id: selectedRSVPGuest.id,
    submitted_presence: payload.presence,
    submitted_email: payload.email,
    submitted_phone: payload.phone,
    submitted_food: payload.guest_data.food || "",
    submitted_food_restriction: Boolean(payload.guest_data.food_restriction),
    submitted_message: payload.message,
    submitted_guest_data: payload.guest_data,
  });

  if (result.error || result.data !== true) {
    console.error(result.error);
    showAdminToast(
      "⚠️ Não foi possível salvar o RSVP. Revise os dados e tente novamente",
    );
    return;
  }

  closeAdminRSVPModal();
  showAdminToast(
    wasEditingRSVP
      ? "💜 RSVP atualizado com sucesso!"
      : "💜 RSVP criado com sucesso!",
  );
  await loadRSVPsAdmin();
});

deleteAdminRSVPButton?.addEventListener("click", async () => {
  if (!selectedExistingRSVP || !selectedRSVPGuest) {
    return;
  }

  const confirmed = confirm("Deseja remover esta confirmação de presença?");

  if (!confirmed) {
    return;
  }

  const { data, error } = await supabaseClient.rpc("admin_delete_guest_rsvp", {
    target_rsvp_id: selectedExistingRSVP.id,
  });

  if (error || data !== true) {
    console.error(error);
    showAdminToast(
      "⚠️ Não foi possível remover o RSVP. Atualize a lista e tente novamente",
    );
    return;
  }

  closeAdminRSVPModal();
  showAdminToast("💜 RSVP removido com sucesso!");
  await loadRSVPsAdmin();
});

[
  rsvpSearchInput,
  rsvpPresenceFilter,
  rsvpCompanionFilter,
  rsvpRestrictionFilter,
  rsvpBuffetFilter,
  rsvpTableFilter,
].forEach((filter) => {
  filter?.addEventListener("input", applyRSVPFilters);
  filter?.addEventListener("change", applyRSVPFilters);
});

clearRSVPFiltersButton?.addEventListener("click", clearRSVPFilters);
refreshRSVPsButton?.addEventListener("click", loadRSVPsAdmin);
exportRSVPsButton?.addEventListener("click", exportRSVPsCSV);

rsvpsTableBody?.addEventListener("click", (event) => {
  const infoButton = event.target.closest("[data-rsvp-info-action]");

  if (infoButton?.dataset.rsvpInfoAction === "dietary-restriction") {
    openRSVPDietaryRestrictionModal(
      infoButton.dataset.rsvpId,
      infoButton.dataset.rsvpPersonType,
      infoButton.dataset.rsvpPersonIndex,
    );
    return;
  }

  const button = event.target.closest("[data-rsvp-action]");

  if (!button) {
    const row = event.target.closest("[data-rsvp-row-id]");

    if (row && !shouldIgnoreRSVPItemClick(event.target)) {
      openRSVPDetailsFromInteractiveItem(row);
    }

    return;
  }

  if (button.dataset.rsvpAction === "details") {
    const rsvp = getRSVPById(button.dataset.rsvpId);

    if (rsvp) {
      openRSVPDetailsModal(rsvp);
    }
  }

  if (button.dataset.rsvpAction === "edit") {
    openRSVPEditModal(button.dataset.rsvpId);
  }

  if (button.dataset.rsvpAction === "delete") {
    deleteRSVPFromTable(button.dataset.rsvpId);
  }

  if (button.dataset.rsvpAction === "resend-confirmation") {
    resendRSVPConfirmation(button.dataset.rsvpId);
  }
});

rsvpsTableBody?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const row = event.target.closest("[data-rsvp-row-id]");

  if (!row || shouldIgnoreRSVPItemClick(event.target)) {
    return;
  }

  event.preventDefault();
  openRSVPDetailsFromInteractiveItem(row);
});

rsvpsMobileList?.addEventListener("click", (event) => {
  const infoButton = event.target.closest("[data-rsvp-info-action]");

  if (infoButton?.dataset.rsvpInfoAction === "dietary-restriction") {
    openRSVPDietaryRestrictionModal(
      infoButton.dataset.rsvpId,
      infoButton.dataset.rsvpPersonType,
      infoButton.dataset.rsvpPersonIndex,
    );
    return;
  }

  const button = event.target.closest("[data-rsvp-action]");

  if (!button) {
    const card = event.target.closest("[data-rsvp-card-id]");

    if (card && !shouldIgnoreRSVPItemClick(event.target)) {
      openRSVPDetailsFromInteractiveItem(card);
    }

    return;
  }

  if (button.dataset.rsvpAction === "details") {
    const rsvp = getRSVPById(button.dataset.rsvpId);

    if (rsvp) {
      openRSVPDetailsModal(rsvp);
    }
  }

  if (button.dataset.rsvpAction === "delete") {
    deleteRSVPFromTable(button.dataset.rsvpId);
  }
});

rsvpsMobileList?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const card = event.target.closest("[data-rsvp-card-id]");

  if (!card || shouldIgnoreRSVPItemClick(event.target)) {
    return;
  }

  event.preventDefault();
  openRSVPDetailsFromInteractiveItem(card);
});

closeRSVPDetailsModalButton?.addEventListener("click", () => {
  closeRSVPDetailsModal();
});

closeAdminRSVPModalButton?.addEventListener("click", closeAdminRSVPModal);

rsvpDetailsContent?.addEventListener("click", (event) => {
  const infoButton = event.target.closest("[data-rsvp-info-action]");

  if (infoButton?.dataset.rsvpInfoAction === "dietary-restriction") {
    openRSVPDietaryRestrictionModal(
      infoButton.dataset.rsvpId,
      infoButton.dataset.rsvpPersonType,
      infoButton.dataset.rsvpPersonIndex,
    );
    return;
  }

  const button = event.target.closest("[data-rsvp-detail-action]");

  if (!button) {
    return;
  }

  closeRSVPDetailsModal();

  if (button.dataset.rsvpDetailAction === "edit") {
    openRSVPEditModal(button.dataset.rsvpId);
  }

  if (button.dataset.rsvpDetailAction === "delete") {
    deleteRSVPFromTable(button.dataset.rsvpId);
  }

  if (button.dataset.rsvpDetailAction === "resend-confirmation") {
    resendRSVPConfirmation(button.dataset.rsvpId);
  }

  if (button.dataset.rsvpDetailAction === "manage-table") {
    openGuestTableManagementFromRSVP(button.dataset.rsvpId);
  }
});

rsvpDetailsModal?.addEventListener("click", (event) => {
  if (event.target === rsvpDetailsModal) {
    closeRSVPDetailsModal();
  }
});

adminRSVPModal?.addEventListener("click", (event) => {
  if (event.target === adminRSVPModal) {
    closeAdminRSVPModal();
  }
});

adminRSVPGuestCountInput?.addEventListener("change", () => {
  cachedAdminRSVPCompanions = getAdminRSVPCompanions();
  renderAdminRSVPCompanionFields(cachedAdminRSVPCompanions);
});

adminRSVPPresenceInput?.addEventListener("change", () => {
  if (adminRSVPPresenceInput.value === "Não") {
    hideAdminRSVPCompanions();
  } else {
    showAdminRSVPCompanionsIfAllowed();
  }
});

adminRSVPFoodRestrictionInput?.addEventListener(
  "change",
  updateAdminRSVPFoodVisibility,
);

if (adminRSVPPhoneInput) {
  maskPhoneInput(adminRSVPPhoneInput);
}

document.querySelectorAll("[data-rsvp-sort]").forEach((button) => {
  button.addEventListener("click", () => {
    setRSVPSort(button.dataset.rsvpSort);
  });
});

applyRSVPFiltersFromUrl();
loadRSVPsAdmin();
