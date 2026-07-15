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

function createOption(value, label = value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function createFormGroup(labelText, field) {
  const group = document.createElement("div");
  const label = document.createElement("label");

  group.className = "form-group";
  label.textContent = labelText;
  group.append(label, field);

  return group;
}

function createCompanionField(index) {
  const wrapper = document.createElement("div");
  const title = document.createElement("h4");
  const nameInput = document.createElement("input");
  const childSelect = document.createElement("select");
  const ageGroup = document.createElement("div");
  const ageLabel = document.createElement("label");
  const ageSelect = document.createElement("select");
  const help = document.createElement("small");

  wrapper.className = "guest-card";
  title.textContent = `Acompanhante ${index}`;

  nameInput.type = "text";
  nameInput.name = `guest_name_${index}`;
  nameInput.required = true;

  childSelect.className = "child-select";
  childSelect.dataset.index = index;
  childSelect.name = `guest_child_${index}`;
  childSelect.append(createOption("Não"), createOption("Sim"));

  ageGroup.className = "form-group child-age is-hidden";
  ageGroup.id = `childAge_${index}`;
  ageLabel.textContent = "Idade da criança no casamento";
  ageSelect.className = "child-age-select";
  ageSelect.name = `guest_age_${index}`;
  ChildAgeOptions.populateSelect(ageSelect);
  help.className = "field-help";
  help.textContent =
    "Considere a idade que a criança terá na data do casamento.";
  ageGroup.append(ageLabel, ageSelect, help);

  wrapper.append(
    title,
    createFormGroup("Nome", nameInput),
    createFormGroup("É criança?", childSelect),
    ageGroup,
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
  document.querySelectorAll(".child-select").forEach((select) => {
    select.addEventListener("change", () => {
      const index = select.dataset.index;

      const ageField = document.getElementById(`childAge_${index}`);
      const ageSelect = ageField.querySelector(".child-age-select");
      const isChild = select.value === "Sim";

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
    companions.push({
      name:
        document.querySelector(`input[name="guest_name_${i}"]`)?.value || "",

      is_child:
        document.querySelector(`select[name="guest_child_${i}"]`)?.value ||
        "Não",

      age: document.querySelector(`select[name="guest_age_${i}"]`)?.value || "",
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

    document.querySelector(`select[name="guest_child_${i}"]`).value =
      companion.is_child || "Não";

    if (companion.is_child === "Sim") {
      setElementVisibility(document.getElementById(`childAge_${i}`), true);

      const ageSelect = document.querySelector(
        `select[name="guest_age_${i}"]`,
      );
      ChildAgeOptions.populateSelect(ageSelect, companion.age);
      ageSelect.required = true;
    }
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
    return;
  }

  if (coupleMembersSection) {
    setElementVisibility(coupleMembersSection, true);
  }

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

    card.append(name, group);
    coupleMembersFields.appendChild(card);
  });

  document
    .querySelectorAll('input[name^="couple_member_"]')
    .forEach((input) => {
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

  document.querySelector('input[name="food"]').value = existingRSVP.food || "";

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
      companions.push({
        name: data[`guest_name_${i}`] || "",

        is_child: data[`guest_child_${i}`] || "Não",

        age: data[`guest_age_${i}`] || "",
      });
    }

    let coupleMembers = [];

    if (isCoupleInvite) {
      coupleMembers = (guest.couple_members || []).map((member, index) => ({
        name: member.name,

        presence: data[`couple_member_${index}`] || "Não",
      }));
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

    const rsvpPayload = {
      guest_id: guest.id,

      presence: finalPresence,

      email: data.email || "",

      phone: data.phone || "",

      food: data.food || "",

      message: data.message || "",

      updated_at: new Date().toISOString(),

      guest_data: {
        name: data.name,

        email: data.email || "",

        phone: data.phone || "",

        guest_count: Number(data.guestCount || 0),

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
