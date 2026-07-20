AdminCommon.setupLogout();

const showAdminToast = AdminCommon.showToast;
const eventDefaults = window.WeddingEventConfig?.getDefaults() || {};
const { escapeAttribute, replaceSafeContent, safeText } = SecurityUtils;

const settingsForm = document.getElementById("settingsForm");
const notificationPreferencesTableBody = document.getElementById(
  "notificationPreferencesTableBody",
);
const refreshNotificationPreferencesButton = document.getElementById(
  "refreshNotificationPreferencesButton",
);
const pixKeyInput = document.getElementById("pixKeyInput");
const merchantNameInput = document.getElementById("merchantNameInput");
const merchantCityInput = document.getElementById("merchantCityInput");
const whatsappNumberInput = document.getElementById("whatsappNumberInput");
const buffetPayingAgeInput = document.getElementById(
  "buffetPayingAgeInput",
);
const brideNameInput = document.getElementById("brideNameInput");
const groomNameInput = document.getElementById("groomNameInput");
const weddingDateInput = document.getElementById("weddingDateInput");
const rsvpDeadlineInput = document.getElementById("rsvpDeadlineInput");
const ceremonyNameInput = document.getElementById("ceremonyNameInput");
const ceremonyAddressInput = document.getElementById("ceremonyAddressInput");
const ceremonyTimeInput = document.getElementById("ceremonyTimeInput");
const receptionNameInput = document.getElementById("receptionNameInput");
const receptionAddressInput = document.getElementById("receptionAddressInput");
const receptionTimeInput = document.getElementById("receptionTimeInput");

let cachedNotificationPreferences = [];

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidBrazilianWhatsapp(value) {
  return /^55\d{10,11}$/.test(value);
}

function formatDateTimeLocal(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function fillSettingsForm(settings) {
  pixKeyInput.value = settings?.pix_key || "";
  merchantNameInput.value = settings?.merchant_name || "";
  merchantCityInput.value = settings?.merchant_city || "";
  whatsappNumberInput.value = settings?.whatsapp_number || "";
  buffetPayingAgeInput.value = settings?.buffet_paying_age || 7;
  brideNameInput.value = settings?.bride_name || eventDefaults.bride_name || "";
  groomNameInput.value = settings?.groom_name || eventDefaults.groom_name || "";
  weddingDateInput.value = formatDateTimeLocal(
    settings?.wedding_date || eventDefaults.wedding_date,
  );
  rsvpDeadlineInput.value =
    settings?.rsvp_deadline || eventDefaults.rsvp_deadline || "";
  ceremonyNameInput.value = settings?.ceremony_name || "";
  ceremonyAddressInput.value = settings?.ceremony_address || "";
  ceremonyTimeInput.value = String(settings?.ceremony_time || "").slice(0, 5);
  receptionNameInput.value = settings?.reception_name || "";
  receptionAddressInput.value = settings?.reception_address || "";
  receptionTimeInput.value = String(settings?.reception_time || "").slice(0, 5);
}

function getNotificationGroupLabel(group) {
  const labels = {
    gift: "Presente",
    gift_contribution: "Cota",
    manual: "Manual",
    rsvp: "RSVP",
    wall_message: "Recados",
  };

  return labels[group] || group || "-";
}

function renderPreferenceCheckbox(preference, field, label) {
  return `
    <label class="admin-table-checkbox notification-preference-toggle">
      <input
        type="checkbox"
        ${preference[field] ? "checked" : ""}
        data-notification-preference-action="toggle"
        data-notification-preference-event="${escapeAttribute(preference.event_type)}"
        data-notification-preference-field="${escapeAttribute(field)}"
        aria-label="${escapeAttribute(`${label}: ${preference.label}`)}"
      />
    </label>
  `;
}

function renderNotificationPreferences(preferences) {
  if (!preferences.length) {
    replaceSafeContent(
      notificationPreferencesTableBody,
      `
        <tr>
          <td colspan="6" class="admin-empty-state">
            Nenhuma preferência de notificação cadastrada.
          </td>
        </tr>
      `,
    );
    return;
  }

  replaceSafeContent(
    notificationPreferencesTableBody,
    preferences
      .map(
        (preference) => `
          <tr>
            <td>
              <strong class="notification-preference-name">${safeText(preference.label)}</strong>
              <span class="notification-preference-description">
                ${safeText(preference.description, preference.event_type)}
              </span>
            </td>
            <td>${safeText(getNotificationGroupLabel(preference.event_group))}</td>
            <td>${renderPreferenceCheckbox(preference, "automatic_enabled", "Envio automático")}</td>
            <td>${renderPreferenceCheckbox(preference, "manual_enabled", "Envio manual")}</td>
            <td>${renderPreferenceCheckbox(preference, "admin_enabled", "Enviar para admin")}</td>
            <td>${renderPreferenceCheckbox(preference, "guest_enabled", "Enviar para convidado")}</td>
          </tr>
        `,
      )
      .join(""),
  );
}

async function loadSettings() {
  const { data, error } = await supabaseClient
    .rpc("get_public_settings")
    .maybeSingle();

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Erro ao carregar configurações");
    return;
  }

  fillSettingsForm(data);
}

async function loadNotificationPreferences() {
  refreshNotificationPreferencesButton.disabled = true;
  refreshNotificationPreferencesButton.textContent = "Atualizando...";

  const { data, error } = await supabaseClient.rpc(
    "admin_list_notification_preferences",
  );

  refreshNotificationPreferencesButton.disabled = false;
  refreshNotificationPreferencesButton.textContent = "Atualizar Preferências";

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível carregar as preferências");
    return;
  }

  cachedNotificationPreferences = data || [];
  renderNotificationPreferences(cachedNotificationPreferences);
}

async function updateNotificationPreference(eventType, field, checked, input) {
  const preference = cachedNotificationPreferences.find(
    (item) => item.event_type === eventType,
  );

  if (!preference) {
    showAdminToast("⚠️ Preferência não encontrada. Atualize a lista");
    input.checked = !checked;
    return;
  }

  const previousValue = preference[field];
  preference[field] = checked;
  input.disabled = true;

  const { data, error } = await supabaseClient.rpc(
    "admin_update_notification_preference",
    {
      submitted_admin_enabled: preference.admin_enabled,
      submitted_automatic_enabled: preference.automatic_enabled,
      submitted_guest_enabled: preference.guest_enabled,
      submitted_manual_enabled: preference.manual_enabled,
      target_event_type: eventType,
    },
  );

  input.disabled = false;

  if (error || data !== true) {
    console.error(error);
    preference[field] = previousValue;
    input.checked = previousValue;
    showAdminToast("⚠️ Não foi possível salvar a preferência");
    return;
  }

  showAdminToast("💜 Preferência atualizada!");
}

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    pix_key: pixKeyInput.value.trim(),
    merchant_name: merchantNameInput.value.trim(),
    merchant_city: merchantCityInput.value.trim(),
    whatsapp_number: normalizePhone(whatsappNumberInput.value),
    buffet_paying_age: Number.parseInt(buffetPayingAgeInput.value, 10),
    bride_name: brideNameInput.value.trim(),
    groom_name: groomNameInput.value.trim(),
    wedding_date: weddingDateInput.value,
    rsvp_deadline: rsvpDeadlineInput.value,
    ceremony_name: ceremonyNameInput.value.trim(),
    ceremony_address: ceremonyAddressInput.value.trim(),
    ceremony_time: ceremonyTimeInput.value,
    reception_name: receptionNameInput.value.trim(),
    reception_address: receptionAddressInput.value.trim(),
    reception_time: receptionTimeInput.value,
  };

  if (
    !payload.pix_key ||
    !payload.merchant_name ||
    !payload.merchant_city
  ) {
    showAdminToast("⚠️ Preencha todos os dados necessários para o PIX");
    return;
  }

  if (
    !payload.bride_name ||
    !payload.groom_name ||
    !payload.wedding_date ||
    !payload.rsvp_deadline ||
    !payload.ceremony_name ||
    !payload.ceremony_address ||
    !payload.ceremony_time ||
    !payload.reception_name ||
    !payload.reception_address ||
    !payload.reception_time
  ) {
    showAdminToast("⚠️ Preencha todos os dados do casamento");
    return;
  }

  if (payload.rsvp_deadline > payload.wedding_date.slice(0, 10)) {
    showAdminToast("⚠️ A data limite do RSVP deve ser anterior ao casamento");
    return;
  }

  if (!isValidBrazilianWhatsapp(payload.whatsapp_number)) {
    showAdminToast("⚠️ Informe o WhatsApp no formato 55 + DDD + número");
    return;
  }

  if (
    !Number.isInteger(payload.buffet_paying_age) ||
    payload.buffet_paying_age < 1 ||
    payload.buffet_paying_age > 18
  ) {
    showAdminToast("⚠️ Informe uma idade mínima pagante entre 1 e 18 anos");
    return;
  }

  const result = await supabaseClient.rpc("admin_save_settings", {
    submitted_pix_key: payload.pix_key,
    submitted_merchant_name: payload.merchant_name,
    submitted_merchant_city: payload.merchant_city,
    submitted_whatsapp_number: payload.whatsapp_number,
    submitted_buffet_paying_age: payload.buffet_paying_age,
    submitted_event_settings: {
      bride_name: payload.bride_name,
      groom_name: payload.groom_name,
      wedding_date: new Date(payload.wedding_date).toISOString(),
      rsvp_deadline: payload.rsvp_deadline,
      ceremony_name: payload.ceremony_name,
      ceremony_address: payload.ceremony_address,
      ceremony_time: payload.ceremony_time,
      reception_name: payload.reception_name,
      reception_address: payload.reception_address,
      reception_time: payload.reception_time,
    },
  });

  if (result.error || !result.data) {
    console.error(result.error);
    showAdminToast(
      "⚠️ Não foi possível salvar as configurações. Revise os dados informados",
    );
    return;
  }

  window.publicEventSettings = {
    ...(window.publicEventSettings || {}),
    bride_name: payload.bride_name,
    groom_name: payload.groom_name,
    wedding_date: new Date(payload.wedding_date).toISOString(),
  };
  window.dispatchEvent(
    new CustomEvent("wedding-settings-loaded", {
      detail: window.publicEventSettings,
    }),
  );

  showAdminToast("💜 Configurações salvas com sucesso!");
});

refreshNotificationPreferencesButton.addEventListener("click", () =>
  loadNotificationPreferences(),
);

notificationPreferencesTableBody.addEventListener("change", (event) => {
  const input = event.target.closest("[data-notification-preference-action]");

  if (!input) {
    return;
  }

  updateNotificationPreference(
    input.dataset.notificationPreferenceEvent,
    input.dataset.notificationPreferenceField,
    input.checked,
    input,
  );
});

loadSettings();
loadNotificationPreferences();
