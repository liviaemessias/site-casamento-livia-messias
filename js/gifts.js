const guest = window.currentGuest;
PublicCommon.setupNavbar();
PublicCommon.setupLogout();
PublicCommon.showGuestName(guest);
updateGuestSpecificCopy();

function updateGuestSpecificCopy() {
  if (guest?.invite_type !== "couple") {
    return;
  }

  const title = document.getElementById("giftsHeroTitle");
  const description = document.getElementById("giftsHeroDescription");
  const purchaseMethodModalTitle = document.getElementById(
    "purchaseMethodModalTitle",
  );

  if (title) {
    title.textContent = "Compartilhem esse momento conosco 💜";
  }

  if (description) {
    description.textContent =
      "A presença de vocês é o nosso maior presente. Mas, caso desejem nos presentear, preparamos algumas opções com muito carinho.";
  }

  if (purchaseMethodModalTitle) {
    purchaseMethodModalTitle.textContent = "Como desejam presentear?";
  }
}

let settings = null;
let selectedGift = null;
let selectedContribution = null;

const giftsGrid = document.getElementById("giftsGrid");
const giftsPendingSection = document.getElementById("giftsPendingSection");
const reserveModal = document.getElementById("reserveModal");
const pixModal = document.getElementById("pixModal");
const purchaseMethodModal = document.getElementById("purchaseMethodModal");
const purchaseMethodOptions = document.getElementById("purchaseMethodOptions");
const reserveForm = document.getElementById("reserveForm");
const reservationConfirmationModal = document.getElementById(
  "reservationConfirmationModal",
);
const reservationConfirmationDescription = document.getElementById(
  "reservationConfirmationDescription",
);
const confirmReservationConfirmation = document.getElementById(
  "confirmReservationConfirmation",
);
let pendingReservationData = null;

const toast = document.getElementById("toast");
const cardPaymentButton = document.getElementById("cardPaymentButton");
const cardPaymentBlock = document.getElementById("cardPaymentBlock");
const moneyPaymentSection = document.getElementById("moneyPaymentSection");
const externalPurchaseSection = document.getElementById(
  "externalPurchaseSection",
);
const externalPurchaseOptions = document.getElementById(
  "externalPurchaseOptions",
);
const pixPaymentBlock = document.getElementById("pixPaymentBlock");
const paymentModalTitle = document.getElementById("paymentModalTitle");

const paymentModalDescription = document.getElementById(
  "paymentModalDescription",
);
const sendReceiptButton = document.getElementById("sendReceiptButton");
const confirmPaymentButton = document.getElementById("confirmPaymentButton");
const paymentConfirmationModal = document.getElementById(
  "paymentConfirmationModal",
);
const paymentConfirmationTitle = document.getElementById(
  "paymentConfirmationTitle",
);
const paymentConfirmationDescription = document.getElementById(
  "paymentConfirmationDescription",
);
const confirmPaymentConfirmation = document.getElementById(
  "confirmPaymentConfirmation",
);
let pendingPaymentConfirmation = null;

const paymentModalFooterText = document.getElementById(
  "paymentModalFooterText",
);
const quotaSelectionSection = document.getElementById("quotaSelectionSection");
const quotaQuantityInput = document.getElementById("quotaQuantityInput");
const quotaAvailabilityText = document.getElementById("quotaAvailabilityText");
const quotaTotalText = document.getElementById("quotaTotalText");
const decreaseQuotaButton = document.getElementById("decreaseQuotaButton");
const increaseQuotaButton = document.getElementById("increaseQuotaButton");

document
  .getElementById("closePurchaseMethodModal")
  .addEventListener("click", () => {
    purchaseMethodModal.classList.remove("active");
  });

decreaseQuotaButton?.addEventListener("click", () => {
  quotaQuantityInput.value = Math.max(1, Number(quotaQuantityInput.value || 1) - 1);
  updateQuotaSelectionSummary();
});

increaseQuotaButton?.addEventListener("click", () => {
  quotaQuantityInput.value = Number(quotaQuantityInput.value || 1) + 1;
  updateQuotaSelectionSummary();
});

quotaQuantityInput?.addEventListener("input", updateQuotaSelectionSummary);

/* Toast */
function showToast(message, duration = 3000) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/* Settings */
async function loadSettings() {
  const { data, error } = await GuestData.loadSettings();

  if (error) {
    console.error(error);
    return;
  }

  settings = data;
}

/* Gifts */
async function loadGifts() {
  const {
    contributions,
    contributionsError,
    data,
    error,
  } = await GuestData.loadGiftCatalog();

  if (error) {
    console.error(error);
    showToast("Erro ao carregar presentes.");
    return;
  }

  if (contributionsError) {
    console.error(contributionsError);
    showToast("Presentes carregados, mas as cotas não puderam ser lidas.");
  }

  renderGifts(
    GuestAuth.isSecureMode()
      ? data || []
      : withGiftContributionStats(data || [], contributions || []),
  );
}

function withGiftContributionStats(gifts, contributions) {
  const contributionsByGift = contributions.reduce((groups, contribution) => {
    groups[contribution.gift_id] = groups[contribution.gift_id] || [];
    groups[contribution.gift_id].push(contribution);

    return groups;
  }, {});

  return gifts.map((gift) => {
    const giftContributions = contributionsByGift[gift.id] || [];
    const reservedCount = giftContributions.reduce(
      (total, contribution) => total + Number(contribution.quota_quantity || 0),
      0,
    );
    const confirmedCount = giftContributions
      .filter((contribution) => contribution.payment_status === "Confirmado")
      .reduce(
        (total, contribution) =>
          total + Number(contribution.quota_quantity || 0),
        0,
      );

    return {
      ...gift,
      contributions: giftContributions,
      own_contributions: giftContributions.filter(
        (contribution) => contribution.guest_id === guest.id,
      ),
      quota_reserved_count: reservedCount,
      quota_confirmed_count: confirmedCount,
    };
  });
}

function getSelectedPurchaseMethodLabel(gift) {
  const method = gift.selected_purchase_method;

  if (method === "pix") {
    return "PIX";
  }

  if (method === "card") {
    return "Cartão de Crédito";
  }

  if (method === "online") {
    return "Compra Online";
  }

  if (method === "physical") {
    return "Loja Física";
  }

  return "";
}

function getPurchaseMode(gift) {
  return gift.purchase_mode || "money";
}

function hasGiftPrice(gift) {
  return Number(gift.price || 0) > 0;
}

function canUseMoneyPayment(gift) {
  const mode = getPurchaseMode(gift);

  return (mode === "money" || mode === "hybrid") && hasGiftPrice(gift);
}

function canUseCardPayment(gift) {
  return canUseMoneyPayment(gift) && Boolean(gift.card_payment_url);
}

function canUseExternalPurchase(gift) {
  const mode = getPurchaseMode(gift);

  return mode === "external" || mode === "hybrid";
}

function hasExternalOptions(gift) {
  return (
    Array.isArray(gift.external_purchase_options) &&
    gift.external_purchase_options.length > 0
  );
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

function getAvailableQuotaCount(gift) {
  return Math.max(
    0,
    Number(gift.quota_count || 0) - Number(gift.quota_reserved_count || 0),
  );
}

function isQuotaGiftFullyConfirmed(gift) {
  const total = Number(gift.quota_count || 0);

  return total > 0 && Number(gift.quota_confirmed_count || 0) >= total;
}

function getGuestPronoun() {
  return guest.invite_type === "couple" ? "vocês" : "você";
}

function getCompletedActionLabel(action) {
  const verb = guest.invite_type === "couple" ? "realizamos" : "realizei";

  return `Já ${verb} ${action}`;
}

function getGiftCompletedActionLabel(gift) {
  const isPurchase =
    gift.selected_purchase_method === "online" ||
    gift.selected_purchase_method === "physical";

  return getCompletedActionLabel(isPurchase ? "a compra" : "o pagamento");
}

function getOwnBoughtGiftLabel() {
  return `Presente comprado por ${getGuestPronoun()} 💜`;
}

function getOwnQuotaConfirmationLabel(quantity) {
  const quotaText = `${quantity} cota${quantity === 1 ? "" : "s"}`;

  if (guest.invite_type === "couple") {
    return `💜 A contribuição de vocês com ${quotaText} foi confirmada`;
  }

  return `💜 Sua contribuição com ${quotaText} foi confirmada`;
}

function getGiftCardClass(gift) {
  if (!isQuotaGift(gift)) {
    return (gift.status || "").toLowerCase();
  }

  return isQuotaGiftFullyConfirmed(gift) ? "comprado" : "";
}

function formatCurrency(value) {
  return `R$ ${Number(value || 0).toFixed(2)}`;
}

function renderGiftPrice(gift) {
  if (isQuotaGift(gift)) {
    return `${formatCurrency(gift.price)} no total`;
  }

  return hasGiftPrice(gift) ? formatCurrency(gift.price) : "";
}

function renderQuotaInfo(gift) {
  if (!isQuotaGift(gift)) {
    return "";
  }

  const total = Number(gift.quota_count || 0);
  const reserved = Number(gift.quota_reserved_count || 0);
  const confirmed = Number(gift.quota_confirmed_count || 0);
  const available = getAvailableQuotaCount(gift);
  const percentage = total ? Math.min(100, (reserved / total) * 100) : 0;

  return `
    <div class="quota-card-info">
      <div class="quota-progress-label">
        <span>${reserved} de ${total} cotas reservadas</span>
        <strong>${confirmed} ${confirmed === 1 ? "confirmada" : "confirmadas"}</strong>
      </div>
      <div class="quota-progress-bar">
        <span style="width: ${percentage}%"></span>
      </div>
      <small>
        ${
          isQuotaGiftFullyConfirmed(gift)
            ? "Presente comprado 💜"
            : `${
                available === 1
                  ? `${available} disponível`
                  : `${available} disponíveis`
              } · ${formatCurrency(getQuotaValue(gift))} por cota`
        }
      </small>
    </div>
  `;
}

function renderOwnQuotaContributions(gift) {
  if (!isQuotaGift(gift) || !gift.own_contributions?.length) {
    return "";
  }

  return gift.own_contributions
    .map((contribution) => {
      const isInformed = contribution.payment_status === "Informado";
      const isConfirmed = contribution.payment_status === "Confirmado";
      const quantity = Number(contribution.quota_quantity || 0);

      return `
        <div class="gift-status own-reservation ${isConfirmed ? "confirmed" : ""}">
          ${
            isConfirmed
              ? getOwnQuotaConfirmationLabel(quantity)
              : `${guest.invite_type === "couple" ? "Vocês reservaram" : "Você reservou"} ${quantity} cota${quantity === 1 ? "" : "s"}`
          }
        </div>

        ${
          isConfirmed
            ? ""
            : isInformed
            ? `
              <div class="payment-informed">
                <strong>💜 Pagamento informado</strong>
                <span>Aguardando confirmação dos noivos</span>
              </div>
            `
            : `
              <button
                class="gift-button payment-button payment-confirm-button"
                onclick='requestPaymentConfirmation(${JSON.stringify(gift)}, ${JSON.stringify(contribution)})'
              >
                ${getCompletedActionLabel("o pagamento")}
              </button>

              <button
                class="gift-button secondary payment-button"
                onclick='openPixModalForContribution(${JSON.stringify(gift)}, ${JSON.stringify(contribution)})'
              >
                Ver PIX
              </button>
            `
        }
      `;
    })
    .join("");
}

function isGiftPendingGuestAction(gift) {
  return (
    gift.reserved_guest_id === guest.id &&
    gift.status === "Reservado" &&
    gift.payment_status !== "Informado" &&
    gift.payment_status !== "Confirmado"
  );
}

function isContributionPendingGuestAction(contribution) {
  return (
    contribution.payment_status !== "Informado" &&
    contribution.payment_status !== "Confirmado"
  );
}

function getPendingGiftItems(gifts) {
  return gifts.flatMap((gift) => {
    if (isQuotaGift(gift)) {
      return (gift.own_contributions || [])
        .filter(isContributionPendingGuestAction)
        .map((contribution) => ({
          type: "quota",
          gift,
          contribution,
        }));
    }

    if (!isGiftPendingGuestAction(gift)) {
      return [];
    }

    return [
      {
        type: "single",
        gift,
      },
    ];
  });
}

function getPendingGiftStatusText(item) {
  if (item.type === "quota") {
    const quantity = Number(item.contribution.quota_quantity || 0);
    const quotaText = `${quantity} cota${quantity === 1 ? "" : "s"}`;

    return `${quotaText} reservada${quantity === 1 ? "" : "s"} · pagamento pendente`;
  }

  if (!item.gift.selected_purchase_method) {
    return "Forma de presentear pendente";
  }

  return `${getSelectedPurchaseMethodLabel(item.gift)} · confirmação pendente`;
}

function renderPendingGiftActions(item) {
  if (item.type === "quota") {
    return `
      <div class="pending-gift-actions">
        <button
          type="button"
          class="gift-button payment-confirm-button"
          onclick='requestPaymentConfirmation(${JSON.stringify(item.gift)}, ${JSON.stringify(item.contribution)})'
        >
          ${getCompletedActionLabel("o pagamento")}
        </button>

        <button
          type="button"
          class="gift-button secondary"
          onclick='openPixModalForContribution(${JSON.stringify(item.gift)}, ${JSON.stringify(item.contribution)})'
        >
          Ver PIX
        </button>
      </div>
    `;
  }

  if (!item.gift.selected_purchase_method) {
    return `
      <div class="pending-gift-actions">
        <button
          type="button"
          class="gift-button"
          onclick='openPurchaseMethodModal(${JSON.stringify(item.gift)})'
        >
          Escolher forma de presentear
        </button>
      </div>
    `;
  }

  return `
    <div class="pending-gift-actions">
      <button
        type="button"
        class="gift-button payment-confirm-button"
        onclick='requestPaymentConfirmation(${JSON.stringify(item.gift)})'
      >
        ${getGiftCompletedActionLabel(item.gift)}
      </button>

      <button
        type="button"
        class="gift-button secondary"
        onclick='openPixModalForGift(${JSON.stringify(item.gift)})'
      >
        Ver detalhes
      </button>
    </div>
  `;
}

function renderPendingGifts(gifts) {
  if (!giftsPendingSection) {
    return;
  }

  const pendingItems = getPendingGiftItems(gifts);

  if (!pendingItems.length) {
    giftsPendingSection.innerHTML = "";
    giftsPendingSection.classList.remove("active");
    return;
  }

  giftsPendingSection.classList.add("active");
  giftsPendingSection.innerHTML = `
    <div class="gifts-pending-header">
      <div>
        <span class="gifts-pending-kicker">Pendências</span>
        <h2>Presentes para concluir</h2>
      </div>

      <strong>
        ${pendingItems.length} ${pendingItems.length === 1 ? "item" : "itens"}
      </strong>
    </div>

    <div class="pending-gifts-grid">
      ${pendingItems
        .map(
          (item) => `
            <div class="pending-gift-card">
              <div class="pending-gift-content">
                <span>
                  ${item.type === "quota" ? "Presente por cotas" : "Presente individual"}
                </span>

                <h3>
                  ${item.gift.name}
                </h3>

                <p>
                  ${getPendingGiftStatusText(item)}
                </p>
              </div>

              ${renderPendingGiftActions(item)}
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function canCurrentGuestContributeToQuotaGift(gift) {
  return (
    isQuotaGift(gift) &&
    getAvailableQuotaCount(gift) > 0 &&
    !gift.own_contributions?.length
  );
}

function renderGifts(gifts) {
  const grouped = {};

  renderPendingGifts(gifts);

  gifts.forEach((gift) => {
    const category = gift.category || "Outros";

    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push(gift);
  });

  giftsGrid.innerHTML = Object.keys(grouped)
    .map(
      (category) => `
      <div class="gift-category-section">
        <div class="gift-category-header">
          <h2 class="section-title">
            ${category}
          </h2>
        </div>

        <div class="gifts-grid">
          ${grouped[category]
            .map((gift) => {
              const isReservedByCurrentGuest =
                gift.reserved_guest_id === guest.id;
              const giftPrice = renderGiftPrice(gift);

              return `
                <div class="gift-card ${getGiftCardClass(gift)}">
                  ${
                    gift.image_url && gift.image_url.trim() !== ""
                      ? `
                        <img
                          src="${gift.image_url}"
                          class="gift-image"
                          alt="${gift.name}"
                        />
                      `
                      : ""
                  }

                  <h3>
                    ${gift.name}
                  </h3>

                  <p>
                    ${gift.description || ""}
                  </p>

                  ${
                    giftPrice
                      ? `
                        <div class="gift-price">
                          ${giftPrice}
                        </div>
                      `
                      : ""
                  }

                  ${renderQuotaInfo(gift)}

                  ${
                    isQuotaGift(gift)
                      ? `
                        ${renderOwnQuotaContributions(gift)}
                        ${
                          canCurrentGuestContributeToQuotaGift(gift)
                            ? `
                              <button
                                class="gift-button"
                                onclick='openReserveModal(${JSON.stringify(gift)})'
                              >
                                Contribuir com cotas
                              </button>
                            `
                            : gift.own_contributions?.length
                              ? ""
                            : `
                              ${
                                isQuotaGiftFullyConfirmed(gift)
                                  ? `
                                    <div class="gift-status own-reservation">
                                      Presente comprado 💜
                                    </div>
                                  `
                                  : `
                                    <button class="gift-button disabled quota-unavailable-button" disabled>
                                      Todas as cotas foram reservadas
                                    </button>
                                  `
                              }
                            `
                        }
                      `
                      : gift.status === "Disponível"
                      ? `
                        <button
                          class="gift-button"
                          onclick='openReserveModal(${JSON.stringify(gift)})'
                        >
                          Presentear
                        </button>
                      `
                      : gift.status === "Reservado" && isReservedByCurrentGuest
                        ? `
                          <div class="gift-status own-reservation">
                            Reservado por ${getGuestPronoun()} 💜
                          </div>

                          ${
                            gift.selected_purchase_method
                              ? `
                                <div class="gift-method">
                                  Forma escolhida
                                  <strong>
                                    ${getSelectedPurchaseMethodLabel(gift)}
                                  </strong>
                                </div>
                              `
                              : ""
                          }

                          ${
                            gift.payment_status === "Informado"
                              ? `
      <div class="payment-informed">
        <strong>💜 Pagamento/Compra informada</strong>
        <span>Aguardando confirmação dos noivos</span>
      </div>
    `
                              : `
      ${
        gift.selected_purchase_method
          ? `
            <button
              class="gift-button payment-button payment-confirm-button"
              onclick='requestPaymentConfirmation(${JSON.stringify(gift)})'
            >
              ${getGiftCompletedActionLabel(gift)}
            </button>
          `
          : ""
      }

      <button
        class="gift-button secondary payment-button"
        onclick='openPurchaseMethodModal(${JSON.stringify(gift)})'
      >
        Ver / alterar forma de presentear
      </button>
    `
                          }
                        `
                        : gift.status === "Comprado" && isReservedByCurrentGuest
                          ? `
    <div class="gift-status own-reservation">
      ${getOwnBoughtGiftLabel()}
    </div>
  `
                          : `
    ${
      gift.status === "Comprado"
        ? `
          <div class="gift-status own-reservation">
            Presente comprado 💜
          </div>
        `
        : `
          <div class="gift-status own-reservation">
            Reservado temporariamente 💜
          </div>
        `
    }
  `
                  }
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `,
    )
    .join("");
}

/* Reserve Modal */
window.openReserveModal = function (gift) {
  selectedGift = gift;
  selectedContribution = null;

  const reserveModalDescription = document.getElementById(
    "reserveModalDescription",
  );

  if (reserveModalDescription) {
    reserveModalDescription.textContent =
      guest.invite_type === "couple"
        ? "Confirmem a reserva deste presente e, se desejarem, deixem uma mensagem para os noivos."
        : "Confirme a reserva deste presente e, se desejar, deixe uma mensagem para os noivos.";
  }

  document.getElementById("guestName").value = guest.name || "";

  document.getElementById("guestMessage").value = "";

  configureQuotaSelection(gift);

  reserveModal.classList.add("active");
};

function configureQuotaSelection(gift) {
  if (!quotaSelectionSection) {
    return;
  }

  const isQuota = isQuotaGift(gift);

  quotaSelectionSection.classList.toggle("is-hidden", !isQuota);

  if (!isQuota) {
    return;
  }

  quotaQuantityInput.value = 1;
  quotaQuantityInput.max = getAvailableQuotaCount(gift);
  updateQuotaSelectionSummary();
}

function updateQuotaSelectionSummary() {
  if (!selectedGift || !isQuotaGift(selectedGift)) {
    return;
  }

  const available = getAvailableQuotaCount(selectedGift);
  const quantity = Math.min(
    Math.max(1, Number(quotaQuantityInput.value || 1)),
    available,
  );

  quotaQuantityInput.value = quantity;
  quotaAvailabilityText.textContent =
    `${available} cota${available === 1 ? "" : "s"} ${available === 1 ? "disponível" : "disponíveis"}`;
  quotaTotalText.textContent =
    `Total: ${formatCurrency(quantity * getQuotaValue(selectedGift))}`;
}

function generatePixPayload(gift) {
  if (!hasGiftPrice(gift)) {
    showToast("⚠️ Este presente não possui valor para pagamento via PIX.");
    return "";
  }

  if (
    !settings?.pix_key ||
    !settings?.merchant_name ||
    !settings?.merchant_city
  ) {
    showToast("⚠️ As informações do PIX ainda não foram configuradas.");
    return "";
  }

  return PixPayment.generatePayload(settings, gift);
}

function configureReceiptLink(message) {
  const whatsappNumber = settings?.whatsapp_number;

  if (!whatsappNumber) {
    sendReceiptButton.removeAttribute("href");
    sendReceiptButton.style.display = "none";
    return;
  }

  sendReceiptButton.href =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function buildContributionPixGift(gift, contribution) {
  const quantity = Number(contribution.quota_quantity || 1);

  return {
    id: contribution.id,
    name: `${gift.name} (${quantity} cota${quantity === 1 ? "" : "s"})`,
    price: contribution.total_value,
  };
}

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

  const { error } = await supabaseClient
    .from("gifts")
    .update({
      status,
      payment_status: paymentStatus,
    })
    .eq("id", giftId);

  if (error) {
    console.error(error);
  }
}

/* =========================
   Card Payment
========================= */

async function createCardPaymentLink(gift) {
  return gift?.card_payment_url || null;
}

async function openCardPayment(gift) {
  if (!gift) {
    return;
  }

  const paymentUrl = await createCardPaymentLink(gift);

  if (paymentUrl) {
    window.open(paymentUrl, "_blank", "noopener,noreferrer");

    return;
  }

  showToast("💳 Link de pagamento com cartão não cadastrado.");
}

function renderExternalPurchaseOptions(gift) {
  const selectedMethod = gift.selected_purchase_method;

  const options = (gift.external_purchase_options || []).filter((option) => {
    if (selectedMethod === "online") {
      return option.type === "online";
    }

    if (selectedMethod === "physical") {
      return option.type === "physical";
    }

    return true;
  });

  if (!externalPurchaseOptions) {
    return;
  }

  if (!options.length) {
    externalPurchaseOptions.innerHTML = `
      <p class="external-option-empty">
        Nenhuma opção cadastrada para esta forma de compra.
      </p>
    `;

    return;
  }

  externalPurchaseOptions.innerHTML = options
    .map((option) => {
      const isOnline = option.type === "online";

      const icon = isOnline ? "🛒" : "🏬";

      const actionText = isOnline ? "Comprar online" : "Selecionar loja física";

      const isSelected =
        gift.selected_purchase_details?.store === option.store &&
        gift.selected_purchase_method === option.type;

      return `
          <button
            type="button"
            class="external-store-card ${isSelected ? "selected" : ""}"
            onclick='selectExternalPurchaseOption(${JSON.stringify(option)})'
          >

            <span class="external-store-icon">
              ${icon}
            </span>

            <span class="external-store-content">

              <strong>
                ${option.store || "Opção de compra"}
              </strong>

              ${
                option.notes
                  ? `
                    <small>
                      ${option.notes}
                    </small>
                  `
                  : ""
              }

              <em>
                ${isSelected ? "✓ Opção selecionada" : actionText}
              </em>

            </span>

          </button>
        `;
    })
    .join("");
}

window.selectExternalPurchaseOption = async function (option) {
  if (!selectedGift) {
    return;
  }

  const method = option.type === "physical" ? "physical" : "online";

  const success = await saveSelectedPurchaseMethod(
    selectedGift,
    method,
    option,
  );

  if (!success) {
    return;
  }

  if (option.type === "online" && option.url) {
    window.open(option.url, "_blank");
  }

  renderExternalPurchaseOptions(selectedGift);

  showToast("💜 Opção de compra selecionada!");
};

function openPurchaseMethodModal(gift) {
  selectedGift = gift;

  const options = [];

  if (canUseMoneyPayment(gift)) {
    options.push(`
      <button
        class="purchase-method-card"
        onclick="selectPurchaseMethod('pix')"
      >
        <span class="purchase-method-icon">
          💠
        </span>

        <span>
          <strong>PIX</strong>
          <small>QR Code e código copia e cola</small>
        </span>
      </button>
    `);
  }

  if (canUseCardPayment(gift)) {
    options.push(`
      <button
        class="purchase-method-card"
        onclick="selectPurchaseMethod('card')"
      >
        <span class="purchase-method-icon">
          💳
        </span>

        <span>
          <strong>Cartão de Crédito</strong>
          <small>Pagamento via checkout externo</small>
        </span>
      </button>
    `);
  }

  if (canUseExternalPurchase(gift)) {
    options.push(`
      <button
        class="purchase-method-card"
        onclick="selectPurchaseMethod('online')"
      >
        <span class="purchase-method-icon">
          🛒
        </span>

        <span>
          <strong>Comprar Online</strong>
          <small>Veja lojas e links disponíveis</small>
        </span>
      </button>
    `);

    options.push(`
      <button
        class="purchase-method-card"
        onclick="selectPurchaseMethod('physical')"
      >
        <span class="purchase-method-icon">
          🏬
        </span>

        <span>
          <strong>Loja Física</strong>
          <small>Veja informações de compra presencial</small>
        </span>
      </button>
    `);
  }

  purchaseMethodOptions.innerHTML = options.join("");

  purchaseMethodModal.classList.add("active");
}

function configurePaymentModalTexts(gift) {
  const method = gift.selected_purchase_method;

  if (method === "pix") {
    paymentModalTitle.textContent = "💜 Pagamento via PIX";

    paymentModalDescription.textContent =
      "Use o QR Code ou copie o código PIX abaixo para realizar o pagamento.";

    paymentModalFooterText.textContent =
      "Após realizar o pagamento, informe para que os noivos possam confirmar depois.";

    confirmPaymentButton.textContent =
      getCompletedActionLabel("o pagamento");

    sendReceiptButton.style.display = "flex";

    return;
  }

  if (method === "card") {
    paymentModalTitle.textContent = "💳 Pagamento com cartão";

    paymentModalDescription.textContent =
      "Clique no botão abaixo para abrir a página de pagamento com cartão.";

    paymentModalFooterText.textContent =
      "Após realizar o pagamento, informe para que os noivos possam confirmar depois.";

    confirmPaymentButton.textContent =
      getCompletedActionLabel("o pagamento");

    sendReceiptButton.style.display = "none";

    return;
  }

  if (method === "online") {
    paymentModalTitle.textContent = "🛒 Compra online";

    paymentModalDescription.textContent =
      "Veja abaixo as opções de lojas online para comprar este presente.";

    paymentModalFooterText.textContent =
      "Após realizar a compra, informe para que os noivos possam confirmar depois.";

    confirmPaymentButton.textContent = getCompletedActionLabel("a compra");

    sendReceiptButton.style.display = "none";

    return;
  }

  if (method === "physical") {
    paymentModalTitle.textContent = "🏬 Compra em loja física";

    paymentModalDescription.textContent =
      "Veja abaixo as informações para comprar este presente presencialmente.";

    paymentModalFooterText.textContent =
      "Após realizar a compra, informe para que os noivos possam confirmar depois.";

    confirmPaymentButton.textContent = getCompletedActionLabel("a compra");

    sendReceiptButton.style.display = "none";

    return;
  }

  paymentModalTitle.textContent = "💜 Forma de presentear";

  paymentModalDescription.textContent =
    "Siga as instruções abaixo para concluir o presente.";

  confirmPaymentButton.textContent =
    getCompletedActionLabel("o pagamento / compra");

  sendReceiptButton.style.display = "none";
}

function updatePaymentGiftSummary(gift) {
  const giftNameElement = document.getElementById("pixGiftName");
  const giftPriceElement = document.getElementById("pixGiftPrice");
  const giftPriceLabelElement = giftPriceElement?.previousElementSibling;
  const giftPrice = renderGiftPrice(gift);

  if (giftNameElement) {
    giftNameElement.textContent = gift.name;
  }

  if (!giftPriceElement) {
    return;
  }

  giftPriceElement.textContent = giftPrice;
  giftPriceElement.style.display = giftPrice ? "" : "none";

  if (giftPriceLabelElement) {
    giftPriceLabelElement.style.display = giftPrice ? "" : "none";
  }
}

/* PIX Modal */
window.openPixModalForContribution = function (gift, contribution) {
  selectedGift = gift;
  selectedContribution = contribution;

  const pixGift = buildContributionPixGift(gift, contribution);

  configurePaymentModalTexts({
    ...gift,
    selected_purchase_method: "pix",
  });

  updatePaymentGiftSummary(pixGift);

  if (moneyPaymentSection) {
    moneyPaymentSection.style.display = "block";
  }

  if (pixPaymentBlock) {
    pixPaymentBlock.style.display = "block";
  }

  if (cardPaymentButton) {
    cardPaymentButton.style.display = "inline-flex";
  }

  if (cardPaymentBlock) {
    cardPaymentBlock.style.display = "none";
  }

  if (externalPurchaseSection) {
    externalPurchaseSection.style.display = "none";
  }

  const pixPayload = generatePixPayload(pixGift);

  if (!pixPayload) {
    return false;
  }

  document.getElementById("pixKey").textContent = pixPayload;
  document.getElementById("pixQrCode").src = PixPayment.getQrCodeUrl(pixPayload);

  const message =
    `Olá, Livia e Messias! Acabei de contribuir com ${contribution.quota_quantity} ` +
    `cota${Number(contribution.quota_quantity) === 1 ? "" : "s"} do presente "${gift.name}" e estou enviando o comprovante.`;

  configureReceiptLink(message);

  pixModal.classList.add("active");
  return true;
};

window.openPixModalForGift = function (gift) {
  selectedGift = gift;
  selectedContribution = null;

  configurePaymentModalTexts(gift);

  const selectedMethod = gift.selected_purchase_method;

  const showPix = selectedMethod === "pix";

  const showCard = selectedMethod === "card";

  const showOnline = selectedMethod === "online";

  const showPhysical = selectedMethod === "physical";

  const showMoney = showPix || showCard;

  const showExternal = showOnline || showPhysical;

  updatePaymentGiftSummary(gift);

  if (moneyPaymentSection) {
    moneyPaymentSection.style.display = showMoney ? "block" : "none";
  }

  if (pixPaymentBlock) {
    pixPaymentBlock.style.display = showPix ? "block" : "none";
  }

  if (cardPaymentBlock) {
    cardPaymentBlock.style.display = showCard ? "block" : "none";
  }

  if (cardPaymentButton) {
    cardPaymentButton.style.display = showCard ? "inline-flex" : "none";
  }

  if (externalPurchaseSection) {
    externalPurchaseSection.style.display = showExternal ? "block" : "none";
  }

  if (showPix) {
    const pixPayload = generatePixPayload(gift);

    if (!pixPayload) {
      return false;
    }

    document.getElementById("pixKey").textContent = pixPayload;

    document.getElementById("pixQrCode").src =
      PixPayment.getQrCodeUrl(pixPayload);
  }

  if (showExternal) {
    renderExternalPurchaseOptions(gift);
  }

  const message = `Olá, Livia e Messias! Acabei de reservar o presente "${gift.name}" e estou enviando o comprovante.`;

  configureReceiptLink(message);

  pixModal.classList.add("active");
  return true;
};

async function saveSelectedPurchaseMethod(gift, method, details = null) {
  const { data, error } = await GuestData.setGiftPurchaseMethod(
    gift.id,
    method,
    details,
  );

  if (error || (GuestAuth.isSecureMode() && data !== true)) {
    console.error(error);
    showToast("Erro ao salvar forma de presentear.");
    return false;
  }

  selectedGift.selected_purchase_method = method;
  selectedGift.selected_purchase_details = details;

  await loadGifts();

  return true;
}

window.selectPurchaseMethod = async function (method) {
  if (method === "pix" && !generatePixPayload(selectedGift)) {
    return;
  }

  purchaseMethodModal.classList.remove("active");

  if (method === "pix") {
    const success = await saveSelectedPurchaseMethod(selectedGift, "pix", {
      type: "pix",
    });

    if (success) {
      openPixModalForGift(selectedGift);
    }

    return;
  }

  if (method === "card") {
    if (!canUseCardPayment(selectedGift)) {
      showToast("💳 Link de pagamento com cartão não cadastrado.");
      return;
    }

    const success = await saveSelectedPurchaseMethod(selectedGift, "card", {
      type: "card",
      url: selectedGift.card_payment_url,
    });

    if (success) {
      openPixModalForGift(selectedGift);
    }

    return;
  }

  if (method === "online" || method === "physical") {
    const success = await saveSelectedPurchaseMethod(
      selectedGift,
      method,
      null,
    );

    if (success) {
      openPixModalForGift(selectedGift);
    }

    return;
  }
};

/* Reserve Gift */
async function handleReservationAvailabilityChange(message) {
  closeReservationConfirmationModal();
  reserveModal.classList.remove("active");
  reserveForm.reset();
  selectedGift = null;
  showToast(message, 5000);
  await loadGifts();
}

async function reserveGift(reservationData) {
  const { data, error } = await GuestData.reserveGift(
    selectedGift.id,
    reservationData,
  );

  if (error) {
    console.error(error);
    showToast("Erro ao reservar presente.");
    return null;
  }

  if (!data) {
    await handleReservationAvailabilityChange(
      "⚠️ Este presente acabou de ser reservado por outro convidado. A lista foi atualizada.",
    );
    return null;
  }

  return data;
}

async function createQuotaContribution(reservationData) {
  const quantity = Number(quotaQuantityInput.value || 1);
  const available = getAvailableQuotaCount(selectedGift);
  const safeQuantity = Math.min(Math.max(1, quantity), available);
  const quotaValue = getQuotaValue(selectedGift);

  if (!available || safeQuantity <= 0) {
    showToast("Não há cotas disponíveis para este presente.");
    return null;
  }

  const { data, error } = await GuestData.reserveGiftQuotas(
    selectedGift.id,
    {
      ...reservationData,
      quotaValue,
    },
    safeQuantity,
  );

  if (error) {
    console.error(error);
    showToast("Erro ao reservar cotas.");
    return null;
  }

  if (!data) {
    await handleReservationAvailabilityChange(
      "⚠️ A quantidade de cotas disponível mudou. A lista foi atualizada para você tentar novamente.",
    );
    return null;
  }

  if (!GuestAuth.isSecureMode()) {
    await syncQuotaGiftStatus(selectedGift.id);
  }

  return data;
}

async function completeReservation(reservationData) {
  if (isQuotaGift(selectedGift)) {
    const contribution = await createQuotaContribution(reservationData);

    if (!contribution) {
      return false;
    }

    closeReservationConfirmationModal();
    reserveModal.classList.remove("active");
    showToast("💜 Cotas reservadas!");
    reserveForm.reset();

    await loadGifts();

    openPixModalForContribution(selectedGift, contribution);

    return true;
  }

  const reservedGift = await reserveGift(reservationData);

  if (!reservedGift) {
    return false;
  }

  closeReservationConfirmationModal();
  reserveModal.classList.remove("active");

  showToast("💜 Presente reservado!");

  reserveForm.reset();

  await loadGifts();

  openPurchaseMethodModal(reservedGift);
  return true;
}

function closeReservationConfirmationModal() {
  reservationConfirmationModal.classList.remove("active");
  pendingReservationData = null;
}

function requestReservationConfirmation(reservationData) {
  const isCouple = guest.invite_type === "couple";
  const subject = isCouple ? "Vocês desejam" : "Você deseja";

  if (isQuotaGift(selectedGift)) {
    const quantity = Number(quotaQuantityInput.value || 1);
    const quotaLabel = quantity === 1 ? "cota" : "cotas";

    reservationConfirmationDescription.textContent =
      `${subject} reservar ${quantity} ${quotaLabel} deste presente?`;
  } else {
    reservationConfirmationDescription.textContent =
      `${subject} reservar este presente?`;
  }

  pendingReservationData = reservationData;
  reservationConfirmationModal.classList.add("active");
}

/* Submit Reservation */
reserveForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const reservationData = {
    name: guest.name,
    message: document.getElementById("guestMessage").value,
  };

  if (
    isQuotaGift(selectedGift) &&
    !generatePixPayload({
      ...selectedGift,
      price: getQuotaValue(selectedGift),
    })
  ) {
    return;
  }

  requestReservationConfirmation(reservationData);
});

confirmReservationConfirmation.addEventListener("click", async () => {
  if (!pendingReservationData) {
    return;
  }

  confirmReservationConfirmation.disabled = true;

  try {
    await completeReservation(pendingReservationData);
  } finally {
    confirmReservationConfirmation.disabled = false;
  }
});

document
  .getElementById("closeReservationConfirmationModal")
  .addEventListener("click", closeReservationConfirmationModal);

document
  .getElementById("cancelReservationConfirmation")
  .addEventListener("click", closeReservationConfirmationModal);

/* Payment Report */
async function reportContributionPayment(gift, contribution) {
  const { data, error } = await GuestData.reportContributionPayment(
    contribution.id,
  );

  if (error || (GuestAuth.isSecureMode() && data !== true)) {
    console.error(error);
    showToast("Erro ao informar pagamento.");
    return false;
  }

  showToast("💜 Pagamento informado com sucesso!");

  if (!GuestAuth.isSecureMode()) {
    await syncQuotaGiftStatus(gift.id);
  }

  await loadGifts();
  selectedContribution = null;
  return true;
}

window.markPaymentAsDone = async function (gift) {
  const { data, error } = await GuestData.reportGiftPayment(gift);

  if (error || (GuestAuth.isSecureMode() && data !== true)) {
    console.error(error);
    showToast("Erro ao informar pagamento.");
    return false;
  }

  showToast("💜 Pagamento informado com sucesso!");
  await loadGifts();
  return true;
};

function closePaymentConfirmationModal() {
  paymentConfirmationModal.classList.remove("active");
  pendingPaymentConfirmation = null;
}

window.requestPaymentConfirmation = function (gift, contribution = null) {
  const isPurchase =
    !contribution &&
    (gift.selected_purchase_method === "online" ||
      gift.selected_purchase_method === "physical");
  const action = isPurchase ? "compra" : "pagamento";
  const actionWithArticle = isPurchase ? "a compra" : "o pagamento";
  const subject = guest.invite_type === "couple" ? "vocês" : "você";
  const completedVerb =
    guest.invite_type === "couple" ? "realizaram" : "realizou";
  const confirmVerb =
    guest.invite_type === "couple" ? "Confirmem" : "Confirme";

  pendingPaymentConfirmation = { gift, contribution };
  paymentConfirmationTitle.textContent = `Confirmar ${action}?`;
  paymentConfirmationDescription.textContent =
    `${confirmVerb} somente se ${subject} já ${completedVerb} ${actionWithArticle}. ` +
    "Os noivos receberão a informação e farão a validação depois.";
  confirmPaymentConfirmation.textContent = `Sim, confirmar ${action}`;
  paymentConfirmationModal.classList.add("active");
};

document
  .getElementById("confirmPaymentButton")
  .addEventListener("click", () => {
    if (!selectedGift) {
      return;
    }

    requestPaymentConfirmation(selectedGift, selectedContribution);
  });

confirmPaymentConfirmation.addEventListener("click", async () => {
  if (!pendingPaymentConfirmation) {
    return;
  }

  const { gift, contribution } = pendingPaymentConfirmation;
  confirmPaymentConfirmation.disabled = true;

  const success = contribution
    ? await reportContributionPayment(gift, contribution)
    : await markPaymentAsDone(gift);

  confirmPaymentConfirmation.disabled = false;

  if (!success) {
    return;
  }

  closePaymentConfirmationModal();
  pixModal.classList.remove("active");
});

document
  .getElementById("closePaymentConfirmationModal")
  .addEventListener("click", closePaymentConfirmationModal);

document
  .getElementById("cancelPaymentConfirmation")
  .addEventListener("click", closePaymentConfirmationModal);

/* Copy PIX */
document.getElementById("copyPixButton").addEventListener("click", async () => {
  try {
    const pixGift =
      selectedGift && selectedContribution
        ? buildContributionPixGift(selectedGift, selectedContribution)
        : selectedGift;
    const pixCode = pixGift ? generatePixPayload(pixGift) : "";

    await navigator.clipboard.writeText(pixCode);

    showToast("💜 Código PIX copiado!");
  } catch {
    showToast("Erro ao copiar código PIX.");
  }
});

/* =========================
   Card Payment
========================= */

if (cardPaymentButton) {
  cardPaymentButton.addEventListener("click", async () => {
    await openCardPayment(selectedGift);
  });
}

/* Close Modals */
document.getElementById("closeReserveModal").addEventListener("click", () => {
  reserveModal.classList.remove("active");
});

document.getElementById("closePixModal").addEventListener("click", () => {
  pixModal.classList.remove("active");
});

window.addEventListener("click", (e) => {
  if (e.target === reserveModal) {
    reserveModal.classList.remove("active");
  }

  if (e.target === purchaseMethodModal) {
    purchaseMethodModal.classList.remove("active");
  }

  if (e.target === reservationConfirmationModal) {
    closeReservationConfirmationModal();
  }

  if (e.target === pixModal) {
    pixModal.classList.remove("active");
  }

  if (e.target === paymentConfirmationModal) {
    closePaymentConfirmationModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    reserveModal.classList.remove("active");
    closeReservationConfirmationModal();
    purchaseMethodModal.classList.remove("active");
    pixModal.classList.remove("active");
    closePaymentConfirmationModal();
  }
});

/* Init */
async function init() {
  await loadSettings();
  await loadGifts();
}

init();
