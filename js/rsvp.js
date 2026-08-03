const guest = window.currentGuest;
PublicCommon.setupNavbar();
PublicCommon.setupLogout();
PublicCommon.showGuestName(guest);

const form = document.getElementById("rsvpForm");
const guestCount = document.getElementById("guestCount");
const guestFields = document.getElementById("guestFields");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const { safeText } = SecurityUtils;
const emailInput = document.querySelector('input[name="email"]');
const emailSuggestion = document.getElementById("emailSuggestion");
const primaryGuestFoodSection = document.getElementById(
  "primaryGuestFoodSection",
);
const primaryFoodRestrictionInput = document.getElementById(
  "primaryFoodRestrictionInput",
);
const primaryFoodDetailsGroup = document.getElementById(
  "primaryFoodDetailsGroup",
);
const primaryFoodInput = document.querySelector('input[name="primary_food"]');

const knownEmailDomains = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "yahoo.com",
  "yahoo.com.br",
  "icloud.com",
  "me.com",
  "uol.com.br",
  "bol.com.br",
  "terra.com.br",
];

const commonEmailDomainCorrections = {
  "gamil.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.com.br": "gmail.com",
  "gmail.con": "gmail.com",
  "gmial.com": "gmail.com",
  "gnail.com": "gmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.com.br": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outlook.co": "outlook.com",
  "outlook.com.br": "outlook.com",
  "outlook.con": "outlook.com",
  "yaho.com": "yahoo.com",
  "yaho.com.br": "yahoo.com.br",
  "yahoo.co": "yahoo.com",
  "yahoo.co.br": "yahoo.com.br",
  "yahoo.com.b": "yahoo.com.br",
  "yahoo.con": "yahoo.com",
};

function setElementVisibility(element, visible) {
  if (!element) return;
  element.hidden = !visible;
  element.classList.toggle("is-hidden", !visible);
}

let existingRSVP = null;
let cachedCompanions = [];

function hasDietaryRestriction(rsvp) {
  if (typeof rsvp?.food_restriction === "boolean") {
    return rsvp.food_restriction;
  }

  return Boolean(String(rsvp?.food || "").trim());
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

function escapeSelectorValue(value) {
  const text = String(value || "");

  if (window.CSS?.escape) {
    return CSS.escape(text);
  }

  return text.replace(/["\\]/g, "\\$&");
}

function getBinaryControlValue(control) {
  if (!control) {
    return "";
  }

  if ("value" in control && control.matches?.("select, input")) {
    return control.value;
  }

  return control.querySelector('input[type="radio"]:checked')?.value || "";
}

function setBinaryControlValue(control, value) {
  if (!control) {
    return;
  }

  if ("value" in control && control.matches?.("select, input")) {
    control.value = value;
    return;
  }

  const input = control.querySelector(
    `input[type="radio"][value="${escapeSelectorValue(value)}"]`,
  );

  if (input) {
    input.checked = true;
  }
}

function getNamedBinaryValue(name, fallback = "Não") {
  return (
    document.querySelector(
      `input[type="radio"][name="${escapeSelectorValue(name)}"]:checked`,
    )
      ?.value ||
    document.querySelector(`select[name="${escapeSelectorValue(name)}"]`)
      ?.value ||
    fallback
  );
}

function setNamedBinaryValue(name, value) {
  const input = document.querySelector(
    `input[type="radio"][name="${escapeSelectorValue(name)}"][value="${escapeSelectorValue(value)}"]`,
  );

  if (input) {
    input.checked = true;
    return;
  }

  const select = document.querySelector(
    `select[name="${escapeSelectorValue(name)}"]`,
  );

  if (select) {
    select.value = value;
  }
}

function createBinaryRadioGroup({ className = "", name, value = "Não" }) {
  const group = document.createElement("div");

  group.className = ["radio-group", className].filter(Boolean).join(" ");

  ["Não", "Sim"].forEach((optionValue) => {
    const label = document.createElement("label");
    const input = document.createElement("input");

    input.type = "radio";
    input.name = name;
    input.value = optionValue;
    input.checked = optionValue === value;

    label.append(input, optionValue);
    group.appendChild(label);
  });

  return group;
}

function updatePersonFoodVisibility(control, detailsGroup, input) {
  const hasRestriction = getBinaryControlValue(control) === "Sim";

  setElementVisibility(detailsGroup, hasRestriction);

  if (input) {
    input.required = hasRestriction;

    if (!hasRestriction) {
      input.value = "";
    }
  }
}

function createFoodRestrictionFields({
  detailsId,
  foodName,
  hasRestriction = false,
  restrictionName,
  value = "",
}) {
  const restrictionGroup = createBinaryRadioGroup({
    name: restrictionName,
    value: hasRestriction ? "Sim" : "Não",
  });
  const foodInput = document.createElement("input");
  const detailsGroup = document.createElement("div");

  foodInput.type = "text";
  foodInput.name = foodName;
  foodInput.value = value;
  foodInput.placeholder =
    "Ex.: intolerância à lactose ou alergia a frutos do mar";
  foodInput.required = hasRestriction;

  detailsGroup.className = `form-group${hasRestriction ? "" : " is-hidden"}`;
  detailsGroup.id = detailsId;
  detailsGroup.hidden = !hasRestriction;
  detailsGroup.append(
    Object.assign(document.createElement("label"), {
      textContent: "Qual restrição alimentar?",
    }),
    foodInput,
  );

  restrictionGroup.addEventListener("change", () => {
    updatePersonFoodVisibility(restrictionGroup, detailsGroup, foodInput);
  });

  return [
    createFormGroup("Possui restrição alimentar?", restrictionGroup),
    detailsGroup,
  ];
}

/* =========================
   Auto Fill
========================= */

document.querySelector('input[name="name"]').value = guest.name || "";

document.querySelector('input[name="name"]').readOnly = true;

emailInput.value = "";

/* =========================
   Invite Type
========================= */

const isCoupleInvite = guest.invite_type === "couple";

const messageField = document.querySelector('textarea[name="message"]');

if (messageField) {
  messageField.placeholder = isCoupleInvite
    ? "Se quiserem, deixem uma mensagem carinhosa para nós 💜"
    : "Se quiser, deixe uma mensagem carinhosa para nós 💜";
}

primaryFoodRestrictionInput?.addEventListener("change", () => {
  updatePersonFoodVisibility(
    primaryFoodRestrictionInput,
    primaryFoodDetailsGroup,
    primaryFoodInput,
  );
});
updatePersonFoodVisibility(
  primaryFoodRestrictionInput,
  primaryFoodDetailsGroup,
  primaryFoodInput,
);

const coupleMembersSection = document.getElementById("coupleMembersSection");

const coupleMembersFields = document.getElementById("coupleMembersFields");

const presenceGroup = document
  .querySelector('input[name="presence"]')
  ?.closest(".form-group");

const guestCountGroup = document
  .getElementById("guestCount")
  ?.closest(".form-group");

/* =========================
   Guest Limit
========================= */

guestCount.replaceChildren();

for (let i = 0; i <= (guest.max_guests || 0); i++) {
  const option = document.createElement("option");

  option.value = i;
  option.textContent = i;

  guestCount.appendChild(option);
}

if (guestCountGroup) {
  setElementVisibility(guestCountGroup, false);
}

/* =========================
   Toast
========================= */

function showToast(message) {
  toastMessage.innerText = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

/* =========================
   Email Suggestion
========================= */

function getLevenshteinDistance(left, right) {
  const rows = left.length + 1;
  const columns = right.length + 1;
  const distances = Array.from({ length: rows }, () =>
    Array(columns).fill(0),
  );

  for (let row = 0; row < rows; row++) {
    distances[row][0] = row;
  }

  for (let column = 0; column < columns; column++) {
    distances[0][column] = column;
  }

  for (let row = 1; row < rows; row++) {
    for (let column = 1; column < columns; column++) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;

      distances[row][column] = Math.min(
        distances[row - 1][column] + 1,
        distances[row][column - 1] + 1,
        distances[row - 1][column - 1] + cost,
      );
    }
  }

  return distances[left.length][right.length];
}

function getEmailDomainSuggestion(email, { allowPartialDomain = false } = {}) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const parts = normalizedEmail.split("@");

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return "";
  }

  const domain = parts[1];
  const domainLooksComplete = domain.includes(".");

  if (knownEmailDomains.includes(domain)) {
    return "";
  }

  if (!allowPartialDomain && !domainLooksComplete) {
    return "";
  }

  if (commonEmailDomainCorrections[domain]) {
    return `${parts[0]}@${commonEmailDomainCorrections[domain]}`;
  }

  const prefixSuggestion = knownEmailDomains.find(
    (knownDomain) => domain.length >= 3 && knownDomain.startsWith(domain),
  );

  if (prefixSuggestion) {
    return `${parts[0]}@${prefixSuggestion}`;
  }

  const suggestion = knownEmailDomains
    .map((knownDomain) => ({
      distance: getLevenshteinDistance(domain, knownDomain),
      knownDomain,
    }))
    .filter(({ distance }) => distance > 0 && distance <= 2)
    .sort((left, right) => left.distance - right.distance)[0];

  return suggestion ? `${parts[0]}@${suggestion.knownDomain}` : "";
}

function clearEmailSuggestion() {
  emailInput.setCustomValidity("");

  if (emailSuggestion) {
    emailSuggestion.textContent = "";
    setElementVisibility(emailSuggestion, false);
  }
}

function validateEmailSuggestion({
  allowPartialDomain = false,
  report = false,
} = {}) {
  const suggestedEmail = getEmailDomainSuggestion(emailInput.value, {
    allowPartialDomain,
  });
  const message = suggestedEmail
    ? `Confira o e-mail. Você quis dizer ${suggestedEmail}?`
    : "";

  emailInput.setCustomValidity(message);

  if (emailSuggestion) {
    emailSuggestion.textContent = message;
    setElementVisibility(emailSuggestion, Boolean(message));
  }

  if (message && report) {
    emailInput.reportValidity();
    showToast(`⚠️ ${message}`);
  }

  return !message;
}

emailInput.addEventListener("input", () => {
  clearEmailSuggestion();
});

emailInput.addEventListener("blur", () => {
  validateEmailSuggestion();
});

/* =========================
   Companion Fields
========================= */

function createFormGroup(labelText, field) {
  const group = document.createElement("div");
  const label = document.createElement("label");

  group.className = "form-group";
  label.textContent = labelText;
  group.append(label, field);

  return group;
}

function createCompanionField(index, companion = {}) {
  const wrapper = document.createElement("div");
  const title = document.createElement("h4");
  const nameInput = document.createElement("input");
  const childGroup = createBinaryRadioGroup({
    className: "child-select",
    name: `guest_child_${index}`,
    value: companion.is_child || "Não",
  });
  const ageGroup = document.createElement("div");
  const ageLabel = document.createElement("label");
  const ageSelect = document.createElement("select");
  const help = document.createElement("small");

  wrapper.className = "guest-card";
  title.textContent = `Acompanhante ${index}`;

  nameInput.type = "text";
  nameInput.name = `guest_name_${index}`;
  nameInput.value = companion.name || "";
  nameInput.required = true;

  childGroup.dataset.index = index;

  ageGroup.className = "form-group child-age is-hidden";
  ageGroup.id = `childAge_${index}`;
  ageLabel.textContent = "Idade da criança no casamento";
  ageSelect.className = "child-age-select rsvp-select";
  ageSelect.name = `guest_age_${index}`;
  ChildAgeOptions.populateSelect(ageSelect, companion.age);
  help.className = "field-help";
  help.textContent =
    isCoupleInvite
      ? "Considerem a idade que a criança terá na data do casamento."
      : "Considere a idade que a criança terá na data do casamento.";
  ageGroup.append(ageLabel, ageSelect, help);

  if (companion.is_child === "Sim") {
    ageGroup.classList.remove("is-hidden");
    ageGroup.hidden = false;
    ageSelect.required = true;
  }

  const dietaryRestriction = normalizePersonDietaryRestriction({
    food: companion.food,
    food_restriction: companion.food_restriction,
    name: companion.name,
  });

  wrapper.append(
    title,
    createFormGroup("Nome", nameInput),
    createFormGroup("É criança?", childGroup),
    ageGroup,
    ...createFoodRestrictionFields({
      detailsId: `guestFoodDetails_${index}`,
      foodName: `guest_food_${index}`,
      hasRestriction: dietaryRestriction.food_restriction,
      restrictionName: `guest_food_restriction_${index}`,
      value: dietaryRestriction.food,
    }),
  );

  return wrapper;
}

guestCount.addEventListener("change", () => {
  guestFields.replaceChildren();

  const count = parseInt(guestCount.value || 0);

  for (let i = 1; i <= count; i++) {
    guestFields.appendChild(createCompanionField(i));
  }

  activateChildLogic();
});

function activateChildLogic() {
  document.querySelectorAll(".child-select").forEach((control) => {
    control.addEventListener("change", () => {
      const index = control.dataset.index;

      const ageField = document.getElementById(`childAge_${index}`);
      const ageSelect = ageField.querySelector(".child-age-select");
      const isChild = getBinaryControlValue(control) === "Sim";

      setElementVisibility(ageField, isChild);
      ageSelect.required = isChild;

      if (!isChild) {
        ageSelect.value = "";
      }
    });
  });
}

/* =========================
   Companion Cache
========================= */

function getCurrentCompanionsFromForm() {
  const companions = [];

  const count = parseInt(guestCount.value || 0);

  for (let i = 1; i <= count; i++) {
    const dietaryRestriction = normalizePersonDietaryRestriction({
      food: document.querySelector(`input[name="guest_food_${i}"]`)?.value || "",
      food_restriction: getNamedBinaryValue(`guest_food_restriction_${i}`),
    });

    companions.push({
      name:
        document.querySelector(`input[name="guest_name_${i}"]`)?.value || "",

      is_child: getNamedBinaryValue(`guest_child_${i}`),

      age: document.querySelector(`select[name="guest_age_${i}"]`)?.value || "",

      ...dietaryRestriction,
    });
  }

  return companions;
}

function restoreCompanions(companions) {
  if (!companions.length) {
    return;
  }

  guestCount.value = companions.length;

  guestCount.dispatchEvent(new Event("change"));

  companions.forEach((companion, index) => {
    const i = index + 1;

    document.querySelector(`input[name="guest_name_${i}"]`).value =
      companion.name || "";

    setNamedBinaryValue(`guest_child_${i}`, companion.is_child || "Não");

    if (companion.is_child === "Sim") {
      setElementVisibility(document.getElementById(`childAge_${i}`), true);

      const ageSelect = document.querySelector(
        `select[name="guest_age_${i}"]`,
      );
      ChildAgeOptions.populateSelect(ageSelect, companion.age);
      ageSelect.required = true;
    }

    const dietaryRestriction = normalizePersonDietaryRestriction({
      food: companion.food,
      food_restriction: companion.food_restriction,
      name: companion.name,
    });
    const foodRestrictionControl =
      document.querySelector(`input[name="guest_food_restriction_${i}"]`)
        ?.closest(".radio-group") ||
      document.querySelector(`select[name="guest_food_restriction_${i}"]`);
    const foodInput = document.querySelector(`input[name="guest_food_${i}"]`);
    const foodDetailsGroup = document.getElementById(`guestFoodDetails_${i}`);

    setNamedBinaryValue(
      `guest_food_restriction_${i}`,
      dietaryRestriction.food_restriction ? "Sim" : "Não",
    );

    if (foodInput) {
      foodInput.value = dietaryRestriction.food;
    }

    updatePersonFoodVisibility(
      foodRestrictionControl,
      foodDetailsGroup,
      foodInput,
    );
  });
}

function hideCompanions(keepCache = true) {
  if (keepCache) {
    const currentCompanions = getCurrentCompanionsFromForm();

    if (currentCompanions.length > 0) {
      cachedCompanions = currentCompanions;
    }
  }

  if (guestCountGroup) {
    setElementVisibility(guestCountGroup, false);
  }

  guestCount.value = 0;
  guestFields.replaceChildren();
}

function showCompanionsIfAllowed({ restoreCached = true } = {}) {
  if (!guestCountGroup) {
    return;
  }

  if ((guest.max_guests || 0) <= 0) {
    return;
  }

  setElementVisibility(guestCountGroup, true);

  if (
    restoreCached &&
    cachedCompanions.length > 0 &&
    guestFields.children.length === 0
  ) {
    restoreCompanions(cachedCompanions);
  }
}

/* =========================
   Individual Invite Logic
========================= */

if (!isCoupleInvite) {
  document.querySelectorAll('input[name="presence"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.value === "Não" && input.checked) {
        hideCompanions();
      }

      if (input.value === "Sim" && input.checked) {
        showCompanionsIfAllowed();
      }
    });
  });
}

/* =========================
   Couple Invite Logic
========================= */

function updateCoupleCompanionVisibility() {
  if (!isCoupleInvite) {
    return;
  }

  const members = guest.couple_members || [];

  const someoneIsComing = members.some((member, index) => {
    const selected = document.querySelector(
      `input[name="couple_member_${index}"]:checked`,
    );

    return selected?.value === "Sim";
  });

  if (someoneIsComing) {
    showCompanionsIfAllowed();
  } else {
    hideCompanions();
  }
}

function setupCoupleInvite() {
  if (!isCoupleInvite) {
    setElementVisibility(primaryGuestFoodSection, true);
    return;
  }

  if (coupleMembersSection) {
    setElementVisibility(coupleMembersSection, true);
  }

  setElementVisibility(primaryGuestFoodSection, false);

  if (presenceGroup) {
    setElementVisibility(presenceGroup, false);
  }

  document.querySelectorAll('input[name="presence"]').forEach((input) => {
    input.required = false;
  });

  const members = guest.couple_members || [];

  coupleMembersFields.replaceChildren();

  members.forEach((member, index) => {
    const card = document.createElement("div");
    const name = document.createElement("strong");
    const group = document.createElement("div");
    const dietaryRestriction = normalizePersonDietaryRestriction({
      food: member.food,
      food_restriction: member.food_restriction,
      name: member.name,
    });

    card.className = "couple-member-card";
    name.textContent = member.name || "Sem nome";
    group.className = "radio-group";

    ["Sim", "Não"].forEach((value) => {
      const label = document.createElement("label");
      const input = document.createElement("input");

      input.type = "radio";
      input.name = `couple_member_${index}`;
      input.value = value;
      input.required = true;
      label.append(input, ` ${value}`);
      group.appendChild(label);
    });

    card.append(
      name,
      group,
      ...createFoodRestrictionFields({
        detailsId: `coupleMemberFoodDetails_${index}`,
        foodName: `couple_member_food_${index}`,
        hasRestriction: dietaryRestriction.food_restriction,
        restrictionName: `couple_member_food_restriction_${index}`,
        value: dietaryRestriction.food,
      }),
    );
    coupleMembersFields.appendChild(card);
  });

  document
    .querySelectorAll('input[name^="couple_member_"]')
    .forEach((input) => {
      if (!/^couple_member_\d+$/.test(input.name)) {
        return;
      }

      input.addEventListener("change", updateCoupleCompanionVisibility);
    });

  hideCompanions(false);
}

setupCoupleInvite();

/* =========================
   Load Existing RSVP
========================= */

async function loadExistingRSVP() {
  const { data, error } = await GuestData.loadRSVP(guest.id);

  if (error) {
    console.error(error);
    showToast("⚠️ Erro ao carregar sua confirmação.");
    return;
  }

  existingRSVP = data;

  if (!existingRSVP) {
    return;
  }

  document.querySelector('input[name="email"]').value =
    existingRSVP.email || "";

  document.querySelector('input[name="phone"]').value =
    existingRSVP.phone || "";

  if (isCoupleInvite) {
    const members = existingRSVP.guest_data?.members || [];

    members.forEach((member, index) => {
      const radio = document.querySelector(
        `input[name="couple_member_${index}"][value="${member.presence}"]`,
      );

      if (radio) {
        radio.checked = true;
      }

      const dietaryRestriction = normalizePersonDietaryRestriction({
        food: member.food,
        food_restriction: member.food_restriction,
        name: member.name,
      });
      const foodRestrictionControl =
        document
          .querySelector(`input[name="couple_member_food_restriction_${index}"]`)
          ?.closest(".radio-group") ||
        document.querySelector(
          `select[name="couple_member_food_restriction_${index}"]`,
        );
      const foodInput = document.querySelector(
        `input[name="couple_member_food_${index}"]`,
      );
      const foodDetailsGroup = document.getElementById(
        `coupleMemberFoodDetails_${index}`,
      );

      setNamedBinaryValue(
        `couple_member_food_restriction_${index}`,
        dietaryRestriction.food_restriction ? "Sim" : "Não",
      );

      if (foodInput) {
        foodInput.value = dietaryRestriction.food;
      }

      updatePersonFoodVisibility(
        foodRestrictionControl,
        foodDetailsGroup,
        foodInput,
      );
    });

    updateCoupleCompanionVisibility();
  } else {
    if (existingRSVP.presence) {
      const presenceInput = document.querySelector(
        `input[name="presence"][value="${existingRSVP.presence}"]`,
      );

      if (presenceInput) {
        presenceInput.checked = true;
      }

      if (existingRSVP.presence === "Sim") {
        showCompanionsIfAllowed();
      } else {
        hideCompanions(false);
      }
    }
  }

  if (!isCoupleInvite) {
    const primaryDietaryRestriction = normalizePersonDietaryRestriction({
      food: existingRSVP.guest_data?.food || existingRSVP.food,
      food_restriction:
        existingRSVP.guest_data?.food_restriction ??
        hasDietaryRestriction(existingRSVP),
      name: guest.name,
    });

    if (primaryFoodRestrictionInput) {
      setBinaryControlValue(
        primaryFoodRestrictionInput,
        primaryDietaryRestriction.food_restriction ? "Sim" : "Não",
      );
    }

    if (primaryFoodInput) {
      primaryFoodInput.value = primaryDietaryRestriction.food;
    }
  }

  updatePersonFoodVisibility(
    primaryFoodRestrictionInput,
    primaryFoodDetailsGroup,
    primaryFoodInput,
  );

  document.querySelector('textarea[name="message"]').value =
    existingRSVP.message || "";

  const companions = existingRSVP.guest_data?.companions || [];

  cachedCompanions = companions;

  const shouldLoadCompanions =
    companions.length > 0 &&
    (!isCoupleInvite ||
      existingRSVP.guest_data?.members?.some(
        (member) => member.presence === "Sim",
      ));

  if (shouldLoadCompanions) {
    showCompanionsIfAllowed({ restoreCached: false });

    restoreCompanions(companions);
  }

  form.querySelector("button").innerText = "Atualizar confirmação";
}

/* =========================
   Submit
========================= */

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateEmailSuggestion({ allowPartialDomain: true, report: true })) {
    return;
  }

  const button = form.querySelector("button");
  const wasEditing = Boolean(existingRSVP);

  button.innerText = "Enviando confirmação...";
  button.classList.add("loading");
  button.disabled = true;

  try {
    const formData = new FormData(form);

    const data = {};

    formData.forEach((value, key) => {
      data[key] = value;
    });

    const companions = [];

    const count = parseInt(data.guestCount || 0);

    for (let i = 1; i <= count; i++) {
      const dietaryRestriction = normalizePersonDietaryRestriction({
        food: data[`guest_food_${i}`] || "",
        food_restriction: data[`guest_food_restriction_${i}`] || "Não",
        name: data[`guest_name_${i}`] || "",
      });

      companions.push({
        name: data[`guest_name_${i}`] || "",

        is_child: data[`guest_child_${i}`] || "Não",

        age: data[`guest_age_${i}`] || "",

        ...dietaryRestriction,
      });
    }

    let coupleMembers = [];
    const primaryDietaryRestriction = normalizePersonDietaryRestriction({
      food: data.primary_food || "",
      food_restriction: data.primary_food_restriction || "Não",
      name: data.name,
    });

    if (isCoupleInvite) {
      coupleMembers = (guest.couple_members || []).map((member, index) => {
        const dietaryRestriction = normalizePersonDietaryRestriction({
          food: data[`couple_member_food_${index}`] || "",
          food_restriction:
            data[`couple_member_food_restriction_${index}`] || "Não",
          name: member.name,
        });

        return {
          name: member.name,
          presence: data[`couple_member_${index}`] || "Não",
          ...dietaryRestriction,
        };
      });
    }

    let finalPresence = data.presence;

    if (isCoupleInvite) {
      const someoneIsComing = coupleMembers.some(
        (member) => member.presence === "Sim",
      );

      finalPresence = someoneIsComing ? "Sim" : "Não";
    }

    if (!isCoupleInvite && finalPresence === "Não") {
      data.guestCount = 0;
      companions.length = 0;
    }

    if (isCoupleInvite) {
      const coupleSomeoneIsComing = coupleMembers.some(
        (member) => member.presence === "Sim",
      );

      if (!coupleSomeoneIsComing) {
        data.guestCount = 0;
        companions.length = 0;
      }
    }

    const peopleWithDietaryRestriction = getPeopleWithDietaryRestriction({
      companions,
      members: coupleMembers,
      primary: isCoupleInvite
        ? null
        : {
            name: data.name,
            presence: finalPresence,
            ...primaryDietaryRestriction,
          },
    });
    const hasFoodRestriction = peopleWithDietaryRestriction.length > 0;
    const food = buildFoodSummary(peopleWithDietaryRestriction);

    const rsvpPayload = {
      guest_id: guest.id,

      presence: finalPresence,

      email: data.email || "",

      phone: data.phone || "",

      food,

      food_restriction: hasFoodRestriction,

      message: data.message || "",

      updated_at: new Date().toISOString(),

      guest_data: {
        name: data.name,

        email: data.email || "",

        phone: data.phone || "",

        guest_count: Number(data.guestCount || 0),

        food: isCoupleInvite ? "" : primaryDietaryRestriction.food,

        food_restriction: isCoupleInvite
          ? false
          : primaryDietaryRestriction.food_restriction,

        members: coupleMembers,

        companions,
      },
    };

    const result = await GuestData.saveRSVP(existingRSVP, rsvpPayload);
    const error = result.error;

    if (!error) {
      existingRSVP = result.data;
    }

    if (error) {
      throw error;
    }

    const { error: guestError } = await GuestData.markGuestConfirmed(guest);

    if (guestError) {
      console.error(guestError);
    }

    setElementVisibility(document.getElementById("successMessage"), true);

    button.innerText = "Atualizar confirmação";

    showToast(
      wasEditing
        ? "❤️ Confirmação atualizada com sucesso!"
        : "❤️ Presença confirmada com sucesso!",
    );

    GuestData.notifyRSVP().catch((notificationError) => {
      console.warn("Não foi possível disparar a notificação do RSVP.", notificationError);
    });
  } catch (error) {
    console.error(error);

    showToast("⚠️ Não foi possível enviar sua confirmação.");
  } finally {
    button.classList.remove("loading");
    button.disabled = false;
  }
});

/* =========================
   Mobile Menu
========================= */

/* =========================
   Phone Mask
========================= */

const phoneInput = document.getElementById("phone");

if (phoneInput) {
  phoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");

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

    e.target.value = value;
  });
}

/* =========================
   Init
========================= */

loadExistingRSVP();
