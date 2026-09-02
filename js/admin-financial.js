AdminCommon.setupLogout();

const DEFAULT_BRAND_COLOR = AdminCommon.BRAND_COLOR;

const financialContextButtons = document.querySelectorAll("[data-financial-context]");
const refreshFinancialButton = document.getElementById("refreshFinancialButton");
const newBudgetItemButton = document.getElementById("newBudgetItemButton");
const newExpenseButton = document.getElementById("newExpenseButton");
const financialPaymentsTableBody = document.getElementById(
  "financialPaymentsTableBody",
);
const financialPaymentsMobileList = document.getElementById(
  "financialPaymentsMobileList",
);
const financialAllPaymentsTableBody = document.getElementById(
  "financialAllPaymentsTableBody",
);
const financialAllPaymentsSummary = document.getElementById(
  "financialAllPaymentsSummary",
);
const financialAllPaymentsMobileList = document.getElementById(
  "financialAllPaymentsMobileList",
);
const financialPaymentDetailsModal = document.getElementById(
  "financialPaymentDetailsModal",
);
const closeFinancialPaymentDetailsModalButton = document.getElementById(
  "closeFinancialPaymentDetailsModalButton",
);
const financialPaymentDetailsTitle = document.getElementById(
  "financialPaymentDetailsTitle",
);
const financialPaymentDetailsContent = document.getElementById(
  "financialPaymentDetailsContent",
);
const editFinancialPaymentDetailsButton = document.getElementById(
  "editFinancialPaymentDetailsButton",
);
const deleteFinancialPaymentDetailsButton = document.getElementById(
  "deleteFinancialPaymentDetailsButton",
);
const financialPaymentSearchInput = document.getElementById(
  "financialPaymentSearchInput",
);
const financialPaymentCategoryFilter = document.getElementById(
  "financialPaymentCategoryFilter",
);
const financialPaymentStatusFilter = document.getElementById(
  "financialPaymentStatusFilter",
);
const financialPaymentPayerFilter = document.getElementById(
  "financialPaymentPayerFilter",
);
const financialPaymentDueFromFilter = document.getElementById(
  "financialPaymentDueFromFilter",
);
const financialPaymentDueToFilter = document.getElementById(
  "financialPaymentDueToFilter",
);
const clearFinancialPaymentFiltersButton = document.getElementById(
  "clearFinancialPaymentFiltersButton",
);
const financialPaymentFilterCount = document.getElementById(
  "financialPaymentFilterCount",
);
const financialPaymentFiltersPanel = document.getElementById(
  "financialPaymentFiltersPanel",
);
const financialExpensesTableBody = document.getElementById(
  "financialExpensesTableBody",
);
const financialAllExpensesTableBody = document.getElementById(
  "financialAllExpensesTableBody",
);
const financialAllExpensesSummary = document.getElementById(
  "financialAllExpensesSummary",
);
const financialAllExpensesMobileList = document.getElementById(
  "financialAllExpensesMobileList",
);
const financialExpenseSearchInput = document.getElementById(
  "financialExpenseSearchInput",
);
const financialExpenseCategoryFilter = document.getElementById(
  "financialExpenseCategoryFilter",
);
const financialExpenseTypeFilter = document.getElementById(
  "financialExpenseTypeFilter",
);
const financialExpenseStatusFilter = document.getElementById(
  "financialExpenseStatusFilter",
);
const financialExpensePayerFilter = document.getElementById(
  "financialExpensePayerFilter",
);
const financialExpenseVendorFilter = document.getElementById(
  "financialExpenseVendorFilter",
);
const financialExpenseBudgetLinkFilter = document.getElementById(
  "financialExpenseBudgetLinkFilter",
);
const financialExpenseBudgetItemFilter = document.getElementById(
  "financialExpenseBudgetItemFilter",
);
const clearFinancialExpenseFiltersButton = document.getElementById(
  "clearFinancialExpenseFiltersButton",
);
const financialExpenseFilterCount = document.getElementById(
  "financialExpenseFilterCount",
);
const financialExpenseFiltersPanel = document.getElementById(
  "financialExpenseFiltersPanel",
);
const financialBudgetTableBody = document.getElementById("financialBudgetTableBody");
const financialBudgetScenarioFilter = document.getElementById(
  "financialBudgetScenarioFilter",
);
const financialBudgetSearchInput = document.getElementById(
  "financialBudgetSearchInput",
);
const financialBudgetCategoryFilter = document.getElementById(
  "financialBudgetCategoryFilter",
);
const financialBudgetStatusFilter = document.getElementById(
  "financialBudgetStatusFilter",
);
const financialBudgetActiveFilter = document.getElementById(
  "financialBudgetActiveFilter",
);
const financialBudgetBalanceFilter = document.getElementById(
  "financialBudgetBalanceFilter",
);
const clearFinancialBudgetFiltersButton = document.getElementById(
  "clearFinancialBudgetFiltersButton",
);
const financialBudgetFilterCount = document.getElementById(
  "financialBudgetFilterCount",
);
const financialBudgetFiltersPanel = document.getElementById(
  "financialBudgetFiltersPanel",
);
const financialBudgetMobileList = document.getElementById(
  "financialBudgetMobileList",
);
const financialScenariosList = document.getElementById("financialScenariosList");
const financialCategoriesList = document.getElementById("financialCategoriesList");
const financialPayersList = document.getElementById("financialPayersList");
const financialLoadStatus = document.getElementById("financialLoadStatus");
const openFinancialCategoryModalButton = document.getElementById(
  "openFinancialCategoryModalButton",
);
const openFinancialOrderModalButton = document.getElementById(
  "openFinancialOrderModalButton",
);
const financialOrderModal = document.getElementById("financialOrderModal");
const closeFinancialOrderModalButton = document.getElementById(
  "closeFinancialOrderModalButton",
);
const financialOrderTypeInput = document.getElementById("financialOrderTypeInput");
const financialOrderContextGroup = document.getElementById(
  "financialOrderContextGroup",
);
const financialOrderContextInput = document.getElementById(
  "financialOrderContextInput",
);
const financialOrderList = document.getElementById("financialOrderList");
const saveFinancialOrderButton = document.getElementById("saveFinancialOrderButton");
const openFinancialScenarioModalButton = document.getElementById(
  "openFinancialScenarioModalButton",
);
const financialScenarioModal = document.getElementById("financialScenarioModal");
const financialScenarioModalTitle = document.getElementById(
  "financialScenarioModalTitle",
);
const closeFinancialScenarioModalButton = document.getElementById(
  "closeFinancialScenarioModalButton",
);
const financialScenarioDetailsModal = document.getElementById(
  "financialScenarioDetailsModal",
);
const financialScenarioDetailsTitle = document.getElementById(
  "financialScenarioDetailsTitle",
);
const financialScenarioDetailsContent = document.getElementById(
  "financialScenarioDetailsContent",
);
const closeFinancialScenarioDetailsModalButton = document.getElementById(
  "closeFinancialScenarioDetailsModalButton",
);
const editFinancialScenarioDetailsButton = document.getElementById(
  "editFinancialScenarioDetailsButton",
);
const deleteFinancialScenarioDetailsButton = document.getElementById(
  "deleteFinancialScenarioDetailsButton",
);
const financialScenarioForm = document.getElementById("financialScenarioForm");
const financialScenarioNameInput = document.getElementById(
  "financialScenarioNameInput",
);
const financialScenarioContextInput = document.getElementById(
  "financialScenarioContextInput",
);
const financialScenarioOrderInput = document.getElementById(
  "financialScenarioOrderInput",
);
const financialScenarioDescriptionInput = document.getElementById(
  "financialScenarioDescriptionInput",
);
const financialScenarioReferenceInput = document.getElementById(
  "financialScenarioReferenceInput",
);
const financialScenarioActiveInput = document.getElementById(
  "financialScenarioActiveInput",
);
const cancelFinancialScenarioEditButton = document.getElementById(
  "cancelFinancialScenarioEditButton",
);
const financialScenarioList = document.getElementById("financialScenarioList");
const financialCategoryModal = document.getElementById("financialCategoryModal");
const financialCategoryModalTitle = document.getElementById(
  "financialCategoryModalTitle",
);
const closeFinancialCategoryModalButton = document.getElementById(
  "closeFinancialCategoryModalButton",
);
const financialCategoryDetailsModal = document.getElementById(
  "financialCategoryDetailsModal",
);
const financialCategoryDetailsTitle = document.getElementById(
  "financialCategoryDetailsTitle",
);
const financialCategoryDetailsContent = document.getElementById(
  "financialCategoryDetailsContent",
);
const closeFinancialCategoryDetailsModalButton = document.getElementById(
  "closeFinancialCategoryDetailsModalButton",
);
const editFinancialCategoryDetailsButton = document.getElementById(
  "editFinancialCategoryDetailsButton",
);
const deleteFinancialCategoryDetailsButton = document.getElementById(
  "deleteFinancialCategoryDetailsButton",
);
const financialCategoryForm = document.getElementById("financialCategoryForm");
const financialCategoryNameInput = document.getElementById(
  "financialCategoryNameInput",
);
const financialCategoryContextInput = document.getElementById(
  "financialCategoryContextInput",
);
const financialCategoryColorInput = document.getElementById(
  "financialCategoryColorInput",
);
const financialCategoryIconInput = document.getElementById(
  "financialCategoryIconInput",
);
const financialCategoryIconPreview = document.getElementById(
  "financialCategoryIconPreview",
);
const financialCategoryOrderInput = document.getElementById(
  "financialCategoryOrderInput",
);
const financialCategoryActiveInput = document.getElementById(
  "financialCategoryActiveInput",
);
const cancelFinancialCategoryEditButton = document.getElementById(
  "cancelFinancialCategoryEditButton",
);
const financialCategoryList = document.getElementById("financialCategoryList");
const openFinancialPayerModalButton = document.getElementById(
  "openFinancialPayerModalButton",
);
const financialPayerModal = document.getElementById("financialPayerModal");
const financialPayerModalTitle = document.getElementById(
  "financialPayerModalTitle",
);
const closeFinancialPayerModalButton = document.getElementById(
  "closeFinancialPayerModalButton",
);
const financialPayerDetailsModal = document.getElementById(
  "financialPayerDetailsModal",
);
const financialPayerDetailsTitle = document.getElementById(
  "financialPayerDetailsTitle",
);
const financialPayerDetailsContent = document.getElementById(
  "financialPayerDetailsContent",
);
const closeFinancialPayerDetailsModalButton = document.getElementById(
  "closeFinancialPayerDetailsModalButton",
);
const editFinancialPayerDetailsButton = document.getElementById(
  "editFinancialPayerDetailsButton",
);
const deleteFinancialPayerDetailsButton = document.getElementById(
  "deleteFinancialPayerDetailsButton",
);
const financialPayerForm = document.getElementById("financialPayerForm");
const financialPayerNameInput = document.getElementById("financialPayerNameInput");
const financialPayerDescriptionInput = document.getElementById(
  "financialPayerDescriptionInput",
);
const financialPayerColorInput = document.getElementById("financialPayerColorInput");
const financialPayerIconInput = document.getElementById("financialPayerIconInput");
const financialPayerIconPreview = document.getElementById(
  "financialPayerIconPreview",
);
const financialPayerOrderInput = document.getElementById("financialPayerOrderInput");
const financialPayerActiveInput = document.getElementById(
  "financialPayerActiveInput",
);
const cancelFinancialPayerEditButton = document.getElementById(
  "cancelFinancialPayerEditButton",
);
const financialPayerList = document.getElementById("financialPayerList");
const financialBudgetItemModal = document.getElementById("financialBudgetItemModal");
const financialBudgetItemModalTitle = document.getElementById(
  "financialBudgetItemModalTitle",
);
const closeFinancialBudgetItemModalButton = document.getElementById(
  "closeFinancialBudgetItemModalButton",
);
const financialBudgetItemForm = document.getElementById("financialBudgetItemForm");
const financialBudgetTitleInput = document.getElementById(
  "financialBudgetTitleInput",
);
const financialBudgetScenarioInput = document.getElementById(
  "financialBudgetScenarioInput",
);
const financialBudgetCategoryInput = document.getElementById(
  "financialBudgetCategoryInput",
);
const financialBudgetAmountInput = document.getElementById(
  "financialBudgetAmountInput",
);
const financialBudgetPriorityInput = document.getElementById(
  "financialBudgetPriorityInput",
);
const financialBudgetStatusInput = document.getElementById(
  "financialBudgetStatusInput",
);
const financialBudgetOrderInput = document.getElementById("financialBudgetOrderInput");
const financialBudgetVendorInput = document.getElementById(
  "financialBudgetVendorInput",
);
const financialBudgetNotesInput = document.getElementById("financialBudgetNotesInput");
const financialBudgetActiveInput = document.getElementById(
  "financialBudgetActiveInput",
);
const deleteFinancialBudgetItemButton = document.getElementById(
  "deleteFinancialBudgetItemButton",
);
const financialBudgetItemDetailsModal = document.getElementById(
  "financialBudgetItemDetailsModal",
);
const closeFinancialBudgetItemDetailsModalButton = document.getElementById(
  "closeFinancialBudgetItemDetailsModalButton",
);
const financialBudgetItemDetailsTitle = document.getElementById(
  "financialBudgetItemDetailsTitle",
);
const financialBudgetItemDetailsContent = document.getElementById(
  "financialBudgetItemDetailsContent",
);
const editFinancialBudgetItemDetailsButton = document.getElementById(
  "editFinancialBudgetItemDetailsButton",
);
const deleteFinancialBudgetItemDetailsButton = document.getElementById(
  "deleteFinancialBudgetItemDetailsButton",
);
const financialExpenseDetailsModal = document.getElementById(
  "financialExpenseDetailsModal",
);
const closeFinancialExpenseDetailsModalButton = document.getElementById(
  "closeFinancialExpenseDetailsModalButton",
);
const financialExpenseDetailsTitle = document.getElementById(
  "financialExpenseDetailsTitle",
);
const financialExpenseDetailsContent = document.getElementById(
  "financialExpenseDetailsContent",
);
const editFinancialExpenseDetailsButton = document.getElementById(
  "editFinancialExpenseDetailsButton",
);
const deleteFinancialExpenseDetailsButton = document.getElementById(
  "deleteFinancialExpenseDetailsButton",
);
const financialExpenseModal = document.getElementById("financialExpenseModal");
const financialExpenseModalTitle = document.getElementById(
  "financialExpenseModalTitle",
);
const closeFinancialExpenseModalButton = document.getElementById(
  "closeFinancialExpenseModalButton",
);
const financialExpenseForm = document.getElementById("financialExpenseForm");
const financialExpenseTitleInput = document.getElementById(
  "financialExpenseTitleInput",
);
const financialExpenseContextInput = document.getElementById(
  "financialExpenseContextInput",
);
const financialExpenseCategoryInput = document.getElementById(
  "financialExpenseCategoryInput",
);
const financialExpenseBudgetItemInput = document.getElementById(
  "financialExpenseBudgetItemInput",
);
const financialExpenseAmountInput = document.getElementById(
  "financialExpenseAmountInput",
);
const financialExpenseTypeInput = document.getElementById("financialExpenseTypeInput");
const financialExpensePaymentMethodInput = document.getElementById(
  "financialExpensePaymentMethodInput",
);
const financialExpenseStatusInput = document.getElementById(
  "financialExpenseStatusInput",
);
const financialExpenseContractedAtInput = document.getElementById(
  "financialExpenseContractedAtInput",
);
const financialExpensePayerInput = document.getElementById(
  "financialExpensePayerInput",
);
const financialExpenseVendorInput = document.getElementById(
  "financialExpenseVendorInput",
);
const financialExpenseDescriptionInput = document.getElementById(
  "financialExpenseDescriptionInput",
);
const financialExpenseReferenceUrlInput = document.getElementById(
  "financialExpenseReferenceUrlInput",
);
const financialExpenseNotesInput = document.getElementById(
  "financialExpenseNotesInput",
);
const financialExpenseActiveInput = document.getElementById(
  "financialExpenseActiveInput",
);
const deleteFinancialExpenseButton = document.getElementById(
  "deleteFinancialExpenseButton",
);
const financialExpensePaymentsSection = document.getElementById(
  "financialExpensePaymentsSection",
);
const financialExpensePaymentsSummary = document.getElementById(
  "financialExpensePaymentsSummary",
);
const financialExpensePaymentsHint = document.getElementById(
  "financialExpensePaymentsHint",
);
const financialExpensePaymentEditor = document.getElementById(
  "financialExpensePaymentEditor",
);
const financialPaymentGenerator = document.getElementById("financialPaymentGenerator");
const financialPaymentGeneratorDisclosure = document.getElementById(
  "financialPaymentGeneratorDisclosure",
);
const openFinancialPaymentModalButton = document.getElementById(
  "openFinancialPaymentModalButton",
);
const financialPaymentModal = document.getElementById("financialPaymentModal");
const financialPaymentModalTitle = document.getElementById(
  "financialPaymentModalTitle",
);
const closeFinancialPaymentModalButton = document.getElementById(
  "closeFinancialPaymentModalButton",
);
const financialPaymentEntryGroup = document.getElementById(
  "financialPaymentEntryGroup",
);
const financialPaymentEntryAmountInput = document.getElementById(
  "financialPaymentEntryAmountInput",
);
const financialPaymentEntryDueDateGroup = document.getElementById(
  "financialPaymentEntryDueDateGroup",
);
const financialPaymentEntryDueDateInput = document.getElementById(
  "financialPaymentEntryDueDateInput",
);
const financialPaymentInstallmentsGroup = document.getElementById(
  "financialPaymentInstallmentsGroup",
);
const financialPaymentInstallmentsCountInput = document.getElementById(
  "financialPaymentInstallmentsCountInput",
);
const financialPaymentFirstDueDateInput = document.getElementById(
  "financialPaymentFirstDueDateInput",
);
const financialPaymentFirstDueDateLabel = document.getElementById(
  "financialPaymentFirstDueDateLabel",
);
const financialPaymentDueIntervalGroup = document.getElementById(
  "financialPaymentDueIntervalGroup",
);
const financialPaymentDueIntervalInput = document.getElementById(
  "financialPaymentDueIntervalInput",
);
const financialPaymentGeneratePaidGroup = document.getElementById(
  "financialPaymentGeneratePaidGroup",
);
const financialPaymentGeneratePaidInput = document.getElementById(
  "financialPaymentGeneratePaidInput",
);
const generateFinancialPaymentsButton = document.getElementById(
  "generateFinancialPaymentsButton",
);
const financialPaymentIdInput = document.getElementById("financialPaymentIdInput");
const financialPaymentInstallmentInput = document.getElementById(
  "financialPaymentInstallmentInput",
);
const financialPaymentLabelInput = document.getElementById(
  "financialPaymentLabelInput",
);
const financialPaymentAmountInput = document.getElementById(
  "financialPaymentAmountInput",
);
const financialPaymentDueDateInput = document.getElementById(
  "financialPaymentDueDateInput",
);
const financialPaymentStatusInput = document.getElementById(
  "financialPaymentStatusInput",
);
const financialPaymentPaidAtInput = document.getElementById(
  "financialPaymentPaidAtInput",
);
const financialPaymentPayerInput = document.getElementById(
  "financialPaymentPayerInput",
);
const financialPaymentNotesInput = document.getElementById(
  "financialPaymentNotesInput",
);
const saveFinancialPaymentButton = document.getElementById(
  "saveFinancialPaymentButton",
);
const cancelFinancialPaymentEditButton = document.getElementById(
  "cancelFinancialPaymentEditButton",
);
const financialExpensePaymentsTableBody = document.getElementById(
  "financialExpensePaymentsTableBody",
);
const financialQuickPaymentModal = document.getElementById(
  "financialQuickPaymentModal",
);
const closeFinancialQuickPaymentModalButton = document.getElementById(
  "closeFinancialQuickPaymentModalButton",
);
const financialQuickPaymentSummary = document.getElementById(
  "financialQuickPaymentSummary",
);
const financialQuickPaymentPaidAtInput = document.getElementById(
  "financialQuickPaymentPaidAtInput",
);
const financialQuickPaymentPayerInput = document.getElementById(
  "financialQuickPaymentPayerInput",
);
const confirmFinancialQuickPaymentButton = document.getElementById(
  "confirmFinancialQuickPaymentButton",
);
const cancelFinancialQuickPaymentButton = document.getElementById(
  "cancelFinancialQuickPaymentButton",
);

const showAdminToast = AdminCommon.showToast;

const CONTEXT_LABELS = {
  all: "Todos",
  both: "Compartilhado",
  honeymoon: "Lua de Mel",
  wedding: "Casamento",
};

const PAYMENT_STATUS_LABELS = {
  cancelled: "Cancelada",
  overdue: "Atrasada",
  paid: "Paga",
  unpaid: "Não paga",
};

const EXPENSE_STATUS_LABELS = {
  cancelled: "Cancelado",
  contracted: "Contratado",
  paid: "Pago",
  planned: "Planejado",
  purchased: "Comprado",
  quoting: "Cotando",
};

const EXPENSE_TYPE_LABELS = {
  fee: "Taxa",
  lodging: "Hospedagem",
  one_off_purchase: "Compra avulsa",
  other: "Outro",
  product: "Produto",
  reservation: "Reserva",
  service: "Serviço",
  supplier: "Fornecedor",
  transport: "Transporte",
  travel: "Viagem",
};

const EXPENSE_PAYMENT_METHOD_LABELS = {
  cash: "À vista",
  custom: "A definir/personalizado",
  deposit_installments: "Entrada + parcelas",
  installments: "Parcelado",
};

const BUDGET_STATUS_LABELS = {
  approved: "Aprovado",
  discarded: "Descartado",
  planned: "Previsto",
  researching: "Em pesquisa",
  replaced: "Substituído",
};

const BUDGET_PRIORITY_LABELS = {
  high: "Alta",
  low: "Baixa",
  normal: "Normal",
};

const FINANCIAL_CATEGORY_ICON_OPTIONS = [
  ["wallet", "Financeiro"],
  ["utensils", "Buffet"],
  ["clipboard-check", "Cerimonial"],
  ["glass-water", "Bebidas"],
  ["cake-slice", "Doces e Bolo"],
  ["church", "Igreja"],
  ["flower-2", "Decoração"],
  ["camera", "Foto e Vídeo"],
  ["shirt", "Trajes"],
  ["sparkles", "Beleza"],
  ["music", "Música"],
  ["party-popper", "Festa"],
  ["handshake", "Fornecedores"],
  ["file-check", "Documentação"],
  ["mail", "Papelaria e Convites"],
  ["package", "Caixinhas"],
  ["calendar-heart", "Save the Date"],
  ["car", "Transporte"],
  ["plane", "Lua de Mel"],
  ["hotel", "Hotel"],
  ["bed-double", "Hospedagem"],
  ["map", "Passeios"],
  ["gift", "Presentes"],
  ["users", "Convidados"],
  ["heart", "Família"],
  ["more-horizontal", "Outros"],
];

const FINANCIAL_PAYER_ICON_OPTIONS = [
  ["user", "Pessoa"],
  ["users", "Casal ou Grupo"],
  ["heart", "Família"],
  ["home", "Família/Casa"],
  ["handshake", "Acordo"],
  ["wallet", "Carteira"],
  ["credit-card", "Cartão"],
  ["banknote", "Dinheiro"],
  ["landmark", "Banco"],
  ["piggy-bank", "Reserva"],
  ["circle-dollar-sign", "Outro Pagador"],
  ["help-circle", "A definir"],
];

let activeContext = "wedding";
let cachedSummaryRows = [];
let cachedScenarios = [];
let cachedCategories = [];
let cachedPayers = [];
let cachedBudgetItems = [];
let cachedExpenses = [];
let cachedPayments = [];
let cachedVendors = [];
let selectedFinancialScenarioId = null;
let selectedFinancialScenarioDetailsId = null;
let selectedFinancialCategoryId = null;
let selectedFinancialCategoryDetailsId = null;
let selectedFinancialPayerId = null;
let selectedFinancialPayerDetailsId = null;
let selectedFinancialBudgetItemId = null;
let selectedFinancialBudgetDetailsItemId = null;
let selectedFinancialExpenseId = null;
let selectedFinancialExpenseDetailsId = null;
let selectedFinancialPaymentId = null;
let selectedFinancialPaymentDetailsId = null;
let selectedQuickPaymentId = null;
let orderedFinancialBaseIds = [];
let draggedFinancialOrderId = null;
let financialExpenseSortState = {
  direction: "desc",
  key: "contracted_at",
};
let financialBudgetSortState = {
  direction: "asc",
  key: "title",
};
let financialPaymentSortState = {
  direction: "asc",
  key: "due",
};
let selectedBudgetScenarioFilter = "";
let hasAppliedFinancialUrlContext = false;
let pendingFinancialExpenseBudgetItemFilter = "";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

function formatBudgetBalanceLabel(value) {
  const amount = Number(value || 0);

  if (amount > 0) {
    return `Estouro ${formatCurrency(amount)}`;
  }

  if (amount < 0) {
    return `Saldo ${formatCurrency(Math.abs(amount))}`;
  }

  return "No limite";
}

function formatBudgetRemainingLabel(value) {
  const amount = Number(value || 0);

  if (amount > 0) {
    return `Estouro ${formatCurrency(amount)}`;
  }

  if (amount < 0) {
    return `Falta gastar ${formatCurrency(Math.abs(amount))}`;
  }

  return "No limite";
}

function getBudgetBalanceClass(value) {
  const amount = Number(value || 0);

  if (amount > 0) {
    return "financial-budget-balance-over";
  }

  if (amount < 0) {
    return "financial-budget-balance-under";
  }

  return "financial-budget-balance-even";
}

function createBudgetBalanceCell(value) {
  const cell = createCell("", "financial-money-cell");
  const pill = document.createElement("span");

  pill.className = `financial-budget-balance-pill ${getBudgetBalanceClass(value)}`;
  pill.textContent = formatBudgetBalanceLabel(value);
  cell.appendChild(pill);

  return cell;
}

function getCurrencyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCurrencyInputValue(value) {
  const digits = getCurrencyDigits(value);
  const cents = digits ? Number(digits) : 0;

  return formatCurrency(cents / 100);
}

function formatCurrencyInputFromNumber(value) {
  return formatCurrency(Number(value || 0));
}

function parseCurrencyInputValue(value) {
  const digits = getCurrencyDigits(value);

  if (!digits) {
    return 0;
  }

  return Number((Number(digits) / 100).toFixed(2));
}

function applyCurrencyInputMask(input) {
  if (!input) {
    return;
  }

  input.value = formatCurrencyInputValue(input.value);
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getTodayISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toCurrencyCents(value) {
  if (typeof value === "number") {
    return Math.round(Number(value || 0) * 100);
  }

  const textValue = String(value || "");
  const numericValue =
    textValue.includes("R$") || textValue.includes(",")
      ? parseCurrencyInputValue(textValue)
      : Number(textValue || 0);

  return Math.round(Number(numericValue || 0) * 100);
}

function fromCurrencyCents(value) {
  return Number((Number(value || 0) / 100).toFixed(2));
}

function splitCurrencyCents(totalCents, count) {
  const safeCount = Math.max(1, Number(count || 1));
  const baseValue = Math.floor(totalCents / safeCount);
  const remainder = totalCents - baseValue * safeCount;

  return Array.from({ length: safeCount }, (_, index) =>
    baseValue + (index < remainder ? 1 : 0),
  );
}

function addDaysToISODate(value, days) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setDate(date.getDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

function addMonthsToISODate(value, months) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const originalDay = date.getDate();
  date.setMonth(date.getMonth() + Number(months || 0));

  if (date.getDate() !== originalDay) {
    date.setDate(0);
  }

  return date.toISOString().slice(0, 10);
}

function getContextLabel(context) {
  return CONTEXT_LABELS[context] || "-";
}

function getInitialCategoryContext() {
  return activeContext === "honeymoon" || activeContext === "wedding"
    ? activeContext
    : "wedding";
}

function getInitialScenarioContext() {
  return activeContext === "honeymoon" || activeContext === "wedding"
    ? activeContext
    : "wedding";
}

function getInitialExpenseContext() {
  return activeContext === "honeymoon" || activeContext === "wedding"
    ? activeContext
    : "wedding";
}

function getScenarioById(scenarioId) {
  return cachedScenarios.find((scenario) => scenario.id === scenarioId);
}

function getBudgetItemById(itemId) {
  return cachedBudgetItems.find((item) => String(item.id) === String(itemId));
}

function getFinancialUrlParams() {
  return new URLSearchParams(window.location.search);
}

function getBudgetItemExpensesUrl(item) {
  const params = new URLSearchParams();

  params.set("context", item.context);
  params.set("budgetItem", item.id);

  return `./admin-financial-expenses.html?${params.toString()}`;
}

function getExpenseById(expenseId) {
  return cachedExpenses.find(
    (expense) => String(expense.id) === String(expenseId),
  );
}

function getPaymentById(paymentId) {
  return cachedPayments.find(
    (payment) => String(payment.id) === String(paymentId),
  );
}

function getPaymentsByExpenseId(expenseId) {
  return cachedPayments
    .filter((payment) => payment.expense_id === expenseId)
    .sort((first, second) => {
      const numberResult =
        Number(first.installment_number || 0) - Number(second.installment_number || 0);

      if (numberResult !== 0) {
        return numberResult;
      }

      const firstDue = first.due_date || "9999-12-31";
      const secondDue = second.due_date || "9999-12-31";
      return firstDue.localeCompare(secondDue);
    });
}

function getCategoryById(categoryId) {
  return cachedCategories.find((category) => category.id === categoryId);
}

function getPayerById(payerId) {
  return cachedPayers.find((payer) => payer.id === payerId);
}

function isSafeHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || ""));
}

function getNextFinancialCategoryOrder() {
  const sameContextCategories = cachedCategories.filter(
    (category) => category.context === getInitialCategoryContext(),
  );
  const highestOrder = sameContextCategories.reduce(
    (highest, category) => Math.max(highest, Number(category.display_order || 0)),
    0,
  );

  return highestOrder + 10;
}

function getNextFinancialScenarioOrder() {
  const sameContextScenarios = cachedScenarios.filter(
    (scenario) => scenario.context === getInitialScenarioContext(),
  );
  const highestOrder = sameContextScenarios.reduce(
    (highest, scenario) => Math.max(highest, Number(scenario.display_order || 0)),
    0,
  );

  return highestOrder + 10;
}

function hasOtherActiveReferenceScenario(context, ignoredScenarioId = null) {
  return cachedScenarios.some(
    (scenario) =>
      scenario.context === context &&
      scenario.id !== ignoredScenarioId &&
      scenario.is_reference &&
      scenario.is_active,
  );
}

function getNextFinancialPayerOrder() {
  const highestOrder = cachedPayers.reduce(
    (highest, payer) => Math.max(highest, Number(payer.display_order || 0)),
    0,
  );

  return highestOrder + 10;
}

function getScenarioContext(scenarioId) {
  return getScenarioById(scenarioId)?.context || getInitialScenarioContext();
}

function getNextFinancialBudgetItemOrder(scenarioId) {
  const highestOrder = cachedBudgetItems
    .filter((item) => item.scenario_id === scenarioId)
    .reduce(
      (highest, item) => Math.max(highest, Number(item.display_order || 0)),
      0,
    );

  return highestOrder + 10;
}

function getAvailableBudgetScenarios() {
  return cachedScenarios
    .filter((scenario) => scenario.is_active)
    .filter((scenario) => activeContext === "all" || scenario.context === activeContext)
    .sort(compareFinancialOrderItems);
}

function getAvailableBudgetCategories(scenarioId) {
  const context = getScenarioContext(scenarioId);

  return cachedCategories
    .filter((category) => category.is_active)
    .filter((category) => category.context === context || category.context === "both")
    .sort(compareFinancialOrderItems);
}

function getAvailableExpenseCategories(context = getInitialExpenseContext()) {
  return cachedCategories
    .filter((category) => category.is_active)
    .filter((category) => category.context === context || category.context === "both")
    .sort(compareFinancialOrderItems);
}

function getReferenceScenarioIdsForActiveContext() {
  return cachedScenarios
    .filter((scenario) => scenario.is_active && scenario.is_reference)
    .filter((scenario) => activeContext === "all" || scenario.context === activeContext)
    .map((scenario) => scenario.id);
}

function getBudgetScenarioFilterOptions() {
  const scenarios = cachedScenarios
    .filter((scenario) => scenario.is_active)
    .filter((scenario) => activeContext === "all" || scenario.context === activeContext)
    .sort((first, second) => {
      if (first.context !== second.context) {
        return first.context === "wedding" ? -1 : 1;
      }

      if (first.is_reference !== second.is_reference) {
        return first.is_reference ? -1 : 1;
      }

      return compareFinancialOrderItems(first, second);
    });

  if (activeContext === "all") {
    return [
      {
        label: "Cenários de referência",
        value: "__reference__",
      },
      ...scenarios.map((scenario) => ({
        label: `${scenario.name || "-"} · ${getContextLabel(scenario.context)}${
          scenario.is_reference ? " · Referência" : ""
        }`,
        value: scenario.id,
      })),
    ];
  }

  return scenarios.map((scenario) => ({
    label: `${scenario.name || "-"}${scenario.is_reference ? " · Referência" : ""}`,
    value: scenario.id,
  }));
}

function getDefaultBudgetScenarioFilter() {
  if (activeContext === "all") {
    return "__reference__";
  }

  return (
    cachedScenarios.find(
      (scenario) =>
        scenario.context === activeContext &&
        scenario.is_active &&
        scenario.is_reference,
    )?.id ||
    cachedScenarios.find(
      (scenario) => scenario.context === activeContext && scenario.is_active,
    )?.id ||
    ""
  );
}

function updateBudgetScenarioFilterOptions(options = {}) {
  if (!financialBudgetScenarioFilter) {
    selectedBudgetScenarioFilter = getDefaultBudgetScenarioFilter();
    return;
  }

  const { reset = false } = options;
  const filterOptions = getBudgetScenarioFilterOptions();
  const currentValue = reset
    ? getDefaultBudgetScenarioFilter()
    : selectedBudgetScenarioFilter || getDefaultBudgetScenarioFilter();
  const nextValue = filterOptions.some((option) => option.value === currentValue)
    ? currentValue
    : getDefaultBudgetScenarioFilter();

  financialBudgetScenarioFilter.replaceChildren();
  filterOptions.forEach((option) => {
    financialBudgetScenarioFilter.appendChild(new Option(option.label, option.value));
  });

  selectedBudgetScenarioFilter = nextValue;
  financialBudgetScenarioFilter.value = nextValue;
}

function matchesSelectedBudgetScenario(item) {
  if (!selectedBudgetScenarioFilter) {
    return true;
  }

  if (selectedBudgetScenarioFilter === "__reference__") {
    return getReferenceScenarioIdsForActiveContext().includes(item.scenario_id);
  }

  return item.scenario_id === selectedBudgetScenarioFilter;
}

function getStatusLabel(status, labels) {
  return labels[status] || status || "-";
}

function compareFinancialOrderItems(first, second) {
  const orderResult =
    Number(first.display_order || 0) - Number(second.display_order || 0);

  if (orderResult !== 0) {
    return orderResult;
  }

  return String(first.name || first.title || "").localeCompare(
    String(second.name || second.title || ""),
    "pt-BR",
    {
      numeric: true,
      sensitivity: "base",
    },
  );
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

function getBadgeClass(status) {
  const badgeClasses = {
    approved: "badge-available",
    bought: "badge-payment",
    cancelled: "badge-muted",
    contracted: "badge-bought",
    overdue: "badge-danger",
    paid: "badge-available",
    planning: "badge-muted",
    planned: "badge-muted",
    quoted: "badge-reserved",
    purchased: "badge-payment",
    quoting: "badge-reserved",
    researching: "badge-reserved",
    replaced: "badge-partial",
    unpaid: "badge-reserved",
  };

  return badgeClasses[status] || "badge-muted";
}

function setText(id, value) {
  AdminCommon.setText(id, value);
}

function setLoadStatus(message = "", type = "") {
  if (!financialLoadStatus) {
    return;
  }

  financialLoadStatus.textContent = message;
  financialLoadStatus.className = "financial-load-status";

  if (type) {
    financialLoadStatus.classList.add(type);
  }
}

function createCell(text, className = "") {
  const cell = document.createElement("td");

  if (className) {
    cell.className = className;
  }

  cell.textContent = text;
  return cell;
}

function createBadge(label, status) {
  const badge = document.createElement("span");
  badge.className = `admin-badge ${getBadgeClass(status)}`;
  badge.textContent = label;
  return badge;
}

function createIcon(name) {
  const icon = document.createElement("i");
  icon.setAttribute("data-lucide", name || "wallet");
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function populateFinancialCategoryIconSelect() {
  if (!financialCategoryIconInput) {
    return;
  }

  const currentValue = financialCategoryIconInput.value || "wallet";

  financialCategoryIconInput.replaceChildren();
  FINANCIAL_CATEGORY_ICON_OPTIONS.forEach(([value, label]) => {
    financialCategoryIconInput.appendChild(new Option(label, value));
  });

  financialCategoryIconInput.value = FINANCIAL_CATEGORY_ICON_OPTIONS.some(
    ([value]) => value === currentValue,
  )
    ? currentValue
    : "wallet";
}

function updateFinancialCategoryIconPreview() {
  if (
    !financialCategoryColorInput ||
    !financialCategoryIconInput ||
    !financialCategoryIconPreview
  ) {
    return;
  }

  const color = isSafeHexColor(financialCategoryColorInput.value)
    ? financialCategoryColorInput.value
    : DEFAULT_BRAND_COLOR;

  financialCategoryIconPreview.replaceChildren(
    createIcon(financialCategoryIconInput.value || "wallet"),
  );
  financialCategoryIconPreview.style.backgroundColor = color;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function populateFinancialPayerIconSelect() {
  if (!financialPayerIconInput) {
    return;
  }

  const currentValue = financialPayerIconInput.value || "user";

  financialPayerIconInput.replaceChildren();
  FINANCIAL_PAYER_ICON_OPTIONS.forEach(([value, label]) => {
    financialPayerIconInput.appendChild(new Option(label, value));
  });

  financialPayerIconInput.value = FINANCIAL_PAYER_ICON_OPTIONS.some(
    ([value]) => value === currentValue,
  )
    ? currentValue
    : "user";
}

function updateFinancialPayerIconPreview() {
  if (!financialPayerColorInput || !financialPayerIconInput || !financialPayerIconPreview) {
    return;
  }

  const color = isSafeHexColor(financialPayerColorInput.value)
    ? financialPayerColorInput.value
    : DEFAULT_BRAND_COLOR;

  financialPayerIconPreview.replaceChildren(
    createIcon(financialPayerIconInput.value || "user"),
  );
  financialPayerIconPreview.style.backgroundColor = color;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function createEmptyRow(message, colSpan) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");

  cell.colSpan = colSpan;
  cell.className = "admin-empty-state";
  cell.textContent = message;
  row.appendChild(cell);

  return row;
}

function createChip(label, detail = "", options = {}) {
  const chip = document.createElement("span");
  const labelElement = document.createElement("strong");

  chip.className = "financial-chip";

  if (options.muted) {
    chip.classList.add("muted");
  }

  if (options.color) {
    chip.style.setProperty("--financial-chip-color", options.color);
  }

  labelElement.textContent = label;
  chip.appendChild(labelElement);

  if (detail) {
    const detailElement = document.createElement("small");
    detailElement.textContent = detail;
    chip.appendChild(detailElement);
  }

  return chip;
}

function createFinancialBaseItemCard(label, details = [], options = {}) {
  const card = document.createElement("article");
  const iconWrap = document.createElement("span");
  const content = document.createElement("span");
  const titleRow = document.createElement("span");
  const title = document.createElement("strong");
  const meta = document.createElement("small");
  const actions = document.createElement("span");

  card.className = "financial-base-item-card";
  iconWrap.className = "financial-base-item-icon";
  content.className = "financial-base-item-content";
  titleRow.className = "financial-base-item-title-row";
  actions.className = "financial-base-item-actions";
  title.textContent = label;

  if (options.muted) {
    card.classList.add("muted");
  }

  if (options.color && isSafeHexColor(options.color)) {
    card.style.setProperty("--financial-base-item-color", options.color);
  }

  if (options.actionType && options.itemId) {
    card.dataset.financialBaseType = options.actionType;
    card.dataset.financialBaseId = options.itemId;
    card.tabIndex = 0;
  }

  iconWrap.appendChild(createIcon(options.icon || "circle"));
  meta.textContent = details.filter(Boolean).join(" · ");

  titleRow.appendChild(title);

  if (options.badge) {
    const badge = document.createElement("span");

    badge.className = "financial-base-item-badge";
    badge.textContent = options.badge;
    titleRow.appendChild(badge);
  }

  content.appendChild(titleRow);

  if (meta.textContent) {
    content.appendChild(meta);
  }

  if (options.actionType && options.itemId) {
    const detailsButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    detailsButton.type = "button";
    detailsButton.className = "checklist-period-action";
    detailsButton.dataset.financialBaseAction = "details";
    detailsButton.dataset.financialBaseType = options.actionType;
    detailsButton.dataset.financialBaseId = options.itemId;
    detailsButton.title = `Detalhes de ${label}`;
    detailsButton.setAttribute("aria-label", `Detalhes de ${label}`);
    detailsButton.appendChild(createIcon("eye"));

    deleteButton.type = "button";
    deleteButton.className = "checklist-period-action danger";
    deleteButton.dataset.financialBaseAction = "delete";
    deleteButton.dataset.financialBaseType = options.actionType;
    deleteButton.dataset.financialBaseId = options.itemId;
    deleteButton.title = `Excluir ${label}`;
    deleteButton.setAttribute("aria-label", `Excluir ${label}`);
    deleteButton.appendChild(createIcon("trash-2"));

    actions.append(detailsButton, deleteButton);
  }

  card.append(iconWrap, content);

  if (actions.childElementCount) {
    card.appendChild(actions);
  }

  return card;
}

function createFinancialBaseEmptyCard(message) {
  return createFinancialBaseItemCard(message, [], {
    icon: "info",
    muted: true,
  });
}

function getSummaryForActiveContext() {
  return cachedSummaryRows.find((row) => row.context === activeContext) || null;
}

function matchesActiveContext(item) {
  if (activeContext === "all") {
    return true;
  }

  return item.context === activeContext;
}

function matchesActiveCategoryContext(category) {
  if (activeContext === "all") {
    return true;
  }

  return category.context === activeContext || category.context === "both";
}

function getExpenseSearchText(expense) {
  return [
    expense.title,
    expense.description,
    expense.category_name,
    expense.budget_item_title,
    expense.vendor_name,
    expense.default_payer_name,
    getStatusLabel(expense.type, EXPENSE_TYPE_LABELS),
    getStatusLabel(expense.status, EXPENSE_STATUS_LABELS),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("pt-BR");
}

function matchesExpenseManagementFilters(expense) {
  if (
    !financialExpenseSearchInput ||
    !financialExpenseCategoryFilter ||
    !financialExpenseTypeFilter ||
    !financialExpenseStatusFilter ||
    !financialExpensePayerFilter ||
    !financialExpenseVendorFilter ||
    !financialExpenseBudgetLinkFilter ||
    !financialExpenseBudgetItemFilter
  ) {
    return true;
  }

  const searchTerm = financialExpenseSearchInput.value
    .trim()
    .toLocaleLowerCase("pt-BR");
  const categoryFilter = financialExpenseCategoryFilter.value;
  const typeFilter = financialExpenseTypeFilter.value;
  const statusFilter = financialExpenseStatusFilter.value;
  const payerFilter = financialExpensePayerFilter.value;
  const vendorFilter = financialExpenseVendorFilter.value;
  const budgetLinkFilter = financialExpenseBudgetLinkFilter.value;
  const budgetItemFilter = financialExpenseBudgetItemFilter.value;

  return (
    (!searchTerm || getExpenseSearchText(expense).includes(searchTerm)) &&
    (!categoryFilter || expense.category_id === categoryFilter) &&
    (!typeFilter || expense.type === typeFilter) &&
    (!statusFilter || expense.status === statusFilter) &&
    (!payerFilter || expense.default_payer_id === payerFilter) &&
    (!vendorFilter || expense.vendor_id === vendorFilter) &&
    (!budgetLinkFilter ||
      (budgetLinkFilter === "linked" && expense.budget_item_id) ||
      (budgetLinkFilter === "unlinked" && !expense.budget_item_id)) &&
    (!budgetItemFilter || expense.budget_item_id === budgetItemFilter)
  );
}

function getBudgetItemSearchText(item) {
  return [
    item.title,
    item.expected_vendor_name,
    item.notes,
    item.category_name,
    item.scenario_name,
    getContextLabel(item.context),
    getStatusLabel(item.status, BUDGET_STATUS_LABELS),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("pt-BR");
}

function matchesBudgetManagementFilters(item) {
  if (
    !financialBudgetSearchInput ||
    !financialBudgetCategoryFilter ||
    !financialBudgetStatusFilter ||
    !financialBudgetActiveFilter ||
    !financialBudgetBalanceFilter
  ) {
    return true;
  }

  const searchTerm = financialBudgetSearchInput.value
    .trim()
    .toLocaleLowerCase("pt-BR");
  const categoryFilter = financialBudgetCategoryFilter.value;
  const statusFilter = financialBudgetStatusFilter.value;
  const activeFilter = financialBudgetActiveFilter.value;
  const balanceFilter = financialBudgetBalanceFilter.value;
  const linkedExpenseCount = Number(item.linked_expense_count || 0);
  const linkedDelta = Number(item.linked_delta || 0);

  return (
    (!searchTerm || getBudgetItemSearchText(item).includes(searchTerm)) &&
    (!categoryFilter || item.category_id === categoryFilter) &&
    (!statusFilter || item.status === statusFilter) &&
    (!activeFilter ||
      (activeFilter === "active" && item.is_active) ||
      (activeFilter === "inactive" && !item.is_active)) &&
    (!balanceFilter ||
      (balanceFilter === "under" && linkedDelta < 0) ||
      (balanceFilter === "over" && linkedExpenseCount > 0 && linkedDelta > 0) ||
      (balanceFilter === "even" && linkedExpenseCount > 0 && linkedDelta === 0) ||
      (balanceFilter === "unlinked" && linkedExpenseCount === 0))
  );
}

function getPaymentSearchText(payment) {
  return [
    payment.expense_title,
    payment.label,
    payment.category_name,
    payment.payer_name,
    getContextLabel(payment.context),
    getStatusLabel(payment.display_status || payment.status, PAYMENT_STATUS_LABELS),
    payment.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("pt-BR");
}

function matchesPaymentManagementFilters(payment) {
  if (
    !financialPaymentSearchInput ||
    !financialPaymentCategoryFilter ||
    !financialPaymentStatusFilter ||
    !financialPaymentPayerFilter ||
    !financialPaymentDueFromFilter ||
    !financialPaymentDueToFilter
  ) {
    return true;
  }

  const searchTerm = financialPaymentSearchInput.value
    .trim()
    .toLocaleLowerCase("pt-BR");
  const categoryFilter = financialPaymentCategoryFilter.value;
  const statusFilter = financialPaymentStatusFilter.value;
  const payerFilter = financialPaymentPayerFilter.value;
  const dueFromFilter = financialPaymentDueFromFilter.value;
  const dueToFilter = financialPaymentDueToFilter.value;
  const status = payment.display_status || payment.status;

  return (
    (!searchTerm || getPaymentSearchText(payment).includes(searchTerm)) &&
    (!categoryFilter || payment.category_id === categoryFilter) &&
    (!statusFilter || status === statusFilter || payment.status === statusFilter) &&
    (!payerFilter || payment.payer_id === payerFilter) &&
    (!dueFromFilter || payment.due_date >= dueFromFilter) &&
    (!dueToFilter || payment.due_date <= dueToFilter)
  );
}

function updateContextTabs() {
  financialContextButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.financialContext === activeContext,
    );
  });
}

function updateSummaryCards() {
  const summary = getSummaryForActiveContext();
  const referenceBudget = Number(summary?.reference_budget_amount || 0);
  const totalContracted = Number(summary?.total_contracted || 0);
  const totalPaid = Number(summary?.total_paid || 0);
  const totalRemaining = Number(summary?.total_remaining || 0);
  const committedDelta = Number(summary?.committed_delta || 0);
  const committedPercent = summary?.committed_percent;
  const overdueCount = Number(summary?.overdue_payment_count || 0);
  const budgetRemainingFromPaid = referenceBudget - totalPaid;

  setText("financialReferenceBudget", formatCurrency(referenceBudget));
  setText(
    "financialReferenceScenario",
    `Cenário: ${summary?.reference_scenario_name || "-"}`,
  );
  setText("financialContractedTotal", formatCurrency(totalContracted));
  setText(
    "financialCommittedDelta",
    `Diferença: ${formatCurrency(committedDelta)}`,
  );
  setText("financialPaidTotal", formatCurrency(totalPaid));
  setText(
    "financialCommittedPercent",
    `Comprometido: ${
      committedPercent === null || committedPercent === undefined
        ? "-"
        : `${percentFormatter.format(Number(committedPercent))}%`
    }`,
  );
  setText(
    "financialBudgetRemainingTotal",
    formatCurrency(Math.abs(budgetRemainingFromPaid)),
  );
  setText(
    "financialBudgetRemainingStatus",
    budgetRemainingFromPaid >= 0
      ? "Ainda falta pagar até o orçamento"
      : "Pago acima do orçamento de referência",
  );
  setText("financialRemainingTotal", formatCurrency(totalRemaining));
  setText(
    "financialDueThisMonth",
    `Este mês: ${formatCurrency(summary?.due_this_month_amount || 0)}`,
  );
  setText("financialNextDueDate", formatDate(summary?.next_due_date));
  setText(
    "financialOverdueCount",
    `Atrasadas: ${overdueCount}`,
  );
}

function createFinancialOverviewPaymentCard(payment) {
  const card = document.createElement("article");
  const main = document.createElement("div");
  const titleWrap = document.createElement("div");
  const side = document.createElement("div");
  const title = document.createElement("strong");
  const meta = document.createElement("span");
  const amount = document.createElement("strong");
  const status = payment.display_status || payment.status;
  const statusBadge = createBadge(
    getStatusLabel(status, PAYMENT_STATUS_LABELS),
    status,
  );
  const actions = document.createElement("div");
  const payButton = document.createElement("button");
  const isDueToday = payment.due_date === getTodayISODate();

  card.className = "financial-overview-payment-card";
  card.dataset.financialOverviewPaymentId = payment.id;
  card.tabIndex = 0;
  card.classList.toggle("financial-payment-card-overdue", status === "overdue");
  card.classList.toggle(
    "financial-payment-card-due-today",
    status !== "overdue" && isDueToday,
  );

  main.className = "financial-overview-payment-main";
  titleWrap.className = "financial-overview-payment-title-group";
  title.textContent = payment.expense_title || "-";
  meta.textContent = [
    `Venc. ${formatDate(payment.due_date)}`,
    payment.payer_name || "Pagador a definir",
    payment.label ||
      (payment.installment_number ? `Parcela ${payment.installment_number}` : ""),
  ]
    .filter(Boolean)
    .join(" · ");
  titleWrap.append(title, meta);

  side.className = "financial-overview-payment-side";
  amount.textContent = formatCurrency(payment.amount);
  side.append(amount, statusBadge);
  main.append(titleWrap, side);

  actions.className = "financial-overview-payment-actions";
  payButton.type = "button";
  payButton.className = "checklist-period-action financial-quick-payment-action";
  payButton.dataset.financialPaymentAction = "quick-paid";
  payButton.dataset.financialPaymentId = payment.id;
  payButton.title = "Marcar parcela como paga";
  payButton.setAttribute("aria-label", "Marcar parcela como paga");
  payButton.appendChild(createIcon("check"));
  actions.appendChild(payButton);

  card.append(main, actions);

  return card;
}

function renderPaymentsTable() {
  if (!financialPaymentsTableBody) {
    return;
  }

  const payments = cachedPayments
    .filter(matchesActiveContext)
    .filter((payment) => payment.status === "unpaid")
    .sort((first, second) => {
      const firstDue = first.due_date || "9999-12-31";
      const secondDue = second.due_date || "9999-12-31";
      return firstDue.localeCompare(secondDue);
    })
    .slice(0, 8);

  financialPaymentsTableBody.replaceChildren();
  financialPaymentsMobileList?.replaceChildren();

  if (!payments.length) {
    financialPaymentsTableBody.appendChild(
      createEmptyRow("Nenhuma parcela em aberto neste contexto.", 5),
    );
    if (financialPaymentsMobileList) {
      const emptyState = document.createElement("div");
      emptyState.className = "admin-empty-state";
      emptyState.textContent = "Nenhuma parcela em aberto neste contexto.";
      financialPaymentsMobileList.appendChild(emptyState);
    }
    return;
  }

  payments.forEach((payment) => {
    const row = document.createElement("tr");
    const status = payment.display_status || payment.status;
    const isDueToday = payment.due_date === getTodayISODate();
    const statusCell = createCell("");
    const expenseCell = createCell("");
    const actionCell = createCell("");
    const expenseTitle = document.createElement("strong");
    const payer = document.createElement("small");
    const payButton = document.createElement("button");

    row.dataset.financialOverviewPaymentId = payment.id;
    row.tabIndex = 0;
    statusCell.appendChild(
      createBadge(getStatusLabel(status, PAYMENT_STATUS_LABELS), status),
    );
    row.classList.toggle("financial-payment-row-overdue", status === "overdue");
    row.classList.toggle(
      "financial-payment-row-due-today",
      status !== "overdue" && isDueToday,
    );

    expenseTitle.className = "financial-payment-expense-title";
    expenseTitle.textContent = payment.expense_title || "-";
    payer.className = "admin-muted financial-payment-expense-payer";
    payer.textContent = payment.payer_name || "A definir";
    expenseCell.append(expenseTitle, payer);

    actionCell.className = "financial-quick-payment-cell";
    payButton.type = "button";
    payButton.className = "checklist-period-action financial-quick-payment-action";
    payButton.dataset.financialPaymentAction = "quick-paid";
    payButton.dataset.financialPaymentId = payment.id;
    payButton.title = "Marcar parcela como paga";
    payButton.setAttribute("aria-label", "Marcar parcela como paga");
    payButton.appendChild(createIcon("check"));
    actionCell.appendChild(payButton);

    row.append(
      createCell(formatDate(payment.due_date)),
      expenseCell,
      createCell(formatCurrency(payment.amount), "financial-money-cell"),
      statusCell,
      actionCell,
    );
    financialPaymentsTableBody.appendChild(row);

    if (financialPaymentsMobileList) {
      financialPaymentsMobileList.appendChild(
        createFinancialOverviewPaymentCard(payment),
      );
    }
  });
}

function populateFinancialQuickPaymentPayerSelect(selectedPayerId = "") {
  if (!financialQuickPaymentPayerInput) {
    return;
  }

  const payers = cachedPayers
    .filter((payer) => payer.is_active || payer.id === selectedPayerId)
    .sort(compareFinancialOrderItems);

  financialQuickPaymentPayerInput.replaceChildren();
  financialQuickPaymentPayerInput.appendChild(new Option("Sem pagador definido", ""));
  payers.forEach((payer) => {
    financialQuickPaymentPayerInput.appendChild(new Option(payer.name || "-", payer.id));
  });
  financialQuickPaymentPayerInput.value = payers.some(
    (payer) => payer.id === selectedPayerId,
  )
    ? selectedPayerId
    : "";
}

function openFinancialQuickPaymentModal(paymentId) {
  const payment = getPaymentById(paymentId);

  if (!payment) {
    showAdminToast("⚠️ Parcela não encontrada");
    return;
  }

  if (
    !financialQuickPaymentModal ||
    !financialQuickPaymentPaidAtInput ||
    !financialQuickPaymentSummary
  ) {
    return;
  }

  selectedQuickPaymentId = payment.id;
  financialQuickPaymentSummary.textContent = `${
    payment.label || `Parcela ${payment.installment_number || "-"}`
  } · ${payment.expense_title || "-"} · ${formatCurrency(payment.amount)}`;
  financialQuickPaymentPaidAtInput.value = getTodayISODate();
  populateFinancialQuickPaymentPayerSelect(payment.payer_id || "");
  financialQuickPaymentModal.classList.add("active");
  financialQuickPaymentModal.setAttribute("aria-hidden", "false");
  financialQuickPaymentPaidAtInput.focus();
}

function closeFinancialQuickPaymentModal() {
  if (!financialQuickPaymentModal) {
    return;
  }

  selectedQuickPaymentId = null;
  financialQuickPaymentModal.classList.remove("active");
  financialQuickPaymentModal.setAttribute("aria-hidden", "true");
}

async function confirmFinancialQuickPayment() {
  const payment = getPaymentById(selectedQuickPaymentId);

  if (!payment || !financialQuickPaymentPaidAtInput || !financialQuickPaymentPayerInput) {
    showAdminToast("⚠️ Parcela não encontrada");
    return;
  }

  const { data, error } = await supabaseClient.rpc(
    "admin_save_financial_expense_payment",
    {
      submitted_amount: Number(payment.amount || 0),
      submitted_due_date: payment.due_date || null,
      submitted_expense_id: payment.expense_id,
      submitted_installment_number: Number(payment.installment_number || 1),
      submitted_label: payment.label || "",
      submitted_notes: payment.notes || "",
      submitted_paid_at: financialQuickPaymentPaidAtInput.value || getTodayISODate(),
      submitted_payer_id: financialQuickPaymentPayerInput.value || null,
      submitted_status: "paid",
      target_payment_id: payment.id,
    },
  );

  if (error || !data?.length) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível marcar a parcela como paga");
    return;
  }

  showAdminToast("💜 Parcela marcada como paga!");
  closeFinancialQuickPaymentModal();
  await loadFinancialData();
}

function sortPaymentsByDueDate(first, second) {
  const firstDue = first.due_date || "9999-12-31";
  const secondDue = second.due_date || "9999-12-31";
  const dueResult = firstDue.localeCompare(secondDue);

  if (dueResult !== 0) {
    return dueResult;
  }

  const titleResult = String(first.expense_title || "").localeCompare(
    String(second.expense_title || ""),
    "pt-BR",
    {
      numeric: true,
      sensitivity: "base",
    },
  );

  if (titleResult !== 0) {
    return titleResult;
  }

  return Number(first.installment_number || 0) - Number(second.installment_number || 0);
}

function getFinancialPaymentSortValue(payment) {
  const sortValues = {
    amount: Number(payment.amount || 0),
    category: payment.category_name,
    due: payment.due_date || "9999-12-31",
    expense: payment.expense_title,
    label: payment.label || `Parcela ${payment.installment_number || ""}`,
    paidAt: payment.paid_at || "9999-12-31",
    payer: payment.payer_name || "A definir",
    status: getStatusLabel(payment.display_status || payment.status, PAYMENT_STATUS_LABELS),
  };

  return sortValues[financialPaymentSortState.key] ?? "";
}

function sortFinancialPayments(payments) {
  return [...payments].sort((first, second) => {
    const result = compareValues(
      getFinancialPaymentSortValue(first),
      getFinancialPaymentSortValue(second),
    );

    if (result !== 0) {
      return financialPaymentSortState.direction === "asc" ? result : -result;
    }

    return sortPaymentsByDueDate(first, second);
  });
}

function updateFinancialPaymentSortButtons() {
  document.querySelectorAll("[data-financial-payment-sort]").forEach((button) => {
    button.classList.remove("sorted-asc", "sorted-desc");

    if (button.dataset.financialPaymentSort === financialPaymentSortState.key) {
      button.classList.add(`sorted-${financialPaymentSortState.direction}`);
    }
  });
}

function setFinancialPaymentSort(key) {
  if (financialPaymentSortState.key === key) {
    financialPaymentSortState.direction =
      financialPaymentSortState.direction === "asc" ? "desc" : "asc";
  } else {
    financialPaymentSortState = {
      direction: "asc",
      key,
    };
  }

  renderAllPaymentsTable();
}

function createFinancialPaymentMobileCard(payment) {
  const card = document.createElement("article");
  const main = document.createElement("div");
  const titleGroup = document.createElement("div");
  const side = document.createElement("div");
  const footer = document.createElement("div");
  const title = document.createElement("strong");
  const meta = document.createElement("span");
  const amount = document.createElement("strong");
  const dueDate = document.createElement("span");
  const status = payment.display_status || payment.status;
  const statusBadge = createBadge(
    getStatusLabel(status, PAYMENT_STATUS_LABELS),
    status,
  );
  const actions = document.createElement("div");
  const detailsButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  card.className = "financial-payment-mobile-card";
  card.dataset.financialPaymentId = payment.id;
  card.tabIndex = 0;

  main.className = "financial-payment-mobile-main";
  titleGroup.className = "financial-payment-mobile-title-group";
  title.textContent = payment.expense_title || "-";
  meta.textContent = [
    payment.label || `Parcela ${payment.installment_number || "-"}`,
    payment.category_name || "-",
    payment.payer_name || "Pagador a definir",
  ]
    .filter(Boolean)
    .join(" · ");
  titleGroup.append(title, meta);

  side.className = "financial-payment-mobile-side";
  amount.textContent = formatCurrency(payment.amount);
  dueDate.textContent = `Venc. ${formatDate(payment.due_date)}`;
  side.append(amount, dueDate);
  main.append(titleGroup, side);

  footer.className = "financial-payment-mobile-footer";
  actions.className = "financial-payment-mobile-actions";

  detailsButton.type = "button";
  detailsButton.className = "checklist-period-action";
  detailsButton.dataset.financialPaymentAction = "details";
  detailsButton.dataset.financialPaymentId = payment.id;
  detailsButton.title = "Detalhes da parcela";
  detailsButton.setAttribute("aria-label", "Detalhes da parcela");
  detailsButton.appendChild(createIcon("eye"));

  deleteButton.type = "button";
  deleteButton.className = "checklist-period-action danger";
  deleteButton.dataset.financialPaymentAction = "delete";
  deleteButton.dataset.financialPaymentId = payment.id;
  deleteButton.title = "Excluir parcela";
  deleteButton.setAttribute("aria-label", "Excluir parcela");
  deleteButton.appendChild(createIcon("trash-2"));

  actions.append(detailsButton, deleteButton);
  footer.append(statusBadge, actions);
  card.append(main, footer);

  return card;
}

function renderAllPaymentsTable() {
  if (!financialAllPaymentsTableBody || !financialAllPaymentsSummary) {
    return;
  }

  const contextPayments = cachedPayments.filter(matchesActiveContext);
  const payments = contextPayments.filter(matchesPaymentManagementFilters);
  const sortedPayments = sortFinancialPayments(payments);

  financialAllPaymentsTableBody.replaceChildren();
  financialAllPaymentsMobileList?.replaceChildren();
  financialAllPaymentsSummary.textContent = "";
  updateFinancialFilterCount(
    financialPaymentFilterCount,
    payments.length,
    contextPayments.length,
    "parcela",
    "parcelas",
  );
  if (financialPaymentFiltersPanel) {
    financialPaymentFiltersPanel.dataset.hasActiveFilters = String(
      payments.length !== contextPayments.length,
    );
  }

  if (!payments.length) {
    updateFinancialPaymentSortButtons();
    financialAllPaymentsTableBody.appendChild(
      createEmptyRow("Nenhuma parcela encontrada neste contexto.", 9),
    );
    if (financialAllPaymentsMobileList) {
      const emptyState = document.createElement("div");
      emptyState.className = "admin-mobile-empty-state";
      emptyState.textContent = "Nenhuma parcela encontrada neste contexto.";
      financialAllPaymentsMobileList.appendChild(emptyState);
    }
    return;
  }

  sortedPayments.forEach((payment) => {
    const row = document.createElement("tr");
    const status = payment.display_status || payment.status;
    const statusCell = createCell("");
    const expenseCell = createCell("");
    const expenseTitle = document.createElement("strong");
    const actionsCell = createCell("");
    const detailsButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    row.dataset.financialPaymentId = payment.id;
    row.tabIndex = 0;
    statusCell.appendChild(
      createBadge(getStatusLabel(status, PAYMENT_STATUS_LABELS), status),
    );
    expenseTitle.className = "financial-payment-expense-title";
    expenseTitle.textContent = payment.expense_title || "-";
    expenseCell.appendChild(expenseTitle);
    actionsCell.className = "admin-actions compact-actions";

    detailsButton.type = "button";
    detailsButton.className = "admin-action-button icon-action";
    detailsButton.dataset.financialPaymentAction = "details";
    detailsButton.dataset.financialPaymentId = payment.id;
    detailsButton.append(createIcon("eye"), document.createTextNode("Detalhes"));

    deleteButton.type = "button";
    deleteButton.className = "admin-action-button danger icon-action";
    deleteButton.dataset.financialPaymentAction = "delete";
    deleteButton.dataset.financialPaymentId = payment.id;
    deleteButton.append(createIcon("trash-2"), document.createTextNode("Excluir"));

    actionsCell.append(detailsButton, deleteButton);

    row.append(
      createCell(formatDate(payment.due_date)),
      expenseCell,
      createCell(payment.label || `Parcela ${payment.installment_number || "-"}`),
      createCell(payment.category_name || "-"),
      createCell(payment.payer_name || "A definir"),
      createCell(formatCurrency(payment.amount), "financial-money-cell"),
      createCell(formatDate(payment.paid_at)),
      statusCell,
      actionsCell,
    );
    financialAllPaymentsTableBody.appendChild(row);
    financialAllPaymentsMobileList?.appendChild(
      createFinancialPaymentMobileCard(payment),
    );
  });

  updateFinancialPaymentSortButtons();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function sortExpensesByDate(first, second) {
  const firstDate = first.contracted_at || "9999-12-31";
  const secondDate = second.contracted_at || "9999-12-31";
  const dateResult = firstDate.localeCompare(secondDate);

  if (dateResult !== 0) {
    return dateResult;
  }

  return String(first.title || "").localeCompare(String(second.title || ""), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
}

function sortExpensesByRecentDate(first, second) {
  const firstDate = first.contracted_at || "0000-01-01";
  const secondDate = second.contracted_at || "0000-01-01";
  const dateResult = secondDate.localeCompare(firstDate);

  if (dateResult !== 0) {
    return dateResult;
  }

  return String(first.title || "").localeCompare(String(second.title || ""), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
}

function getFinancialExpenseSortValue(expense) {
  const sortValues = {
    category: expense.category_name,
    contracted_at: expense.contracted_at || "",
    paid: Number(expense.paid_amount || 0),
    remaining: Number(expense.remaining_amount || 0),
    status: getStatusLabel(expense.status, EXPENSE_STATUS_LABELS),
    title: expense.title,
    total: Number(expense.total_amount || 0),
    type: getStatusLabel(expense.type, EXPENSE_TYPE_LABELS),
  };

  return sortValues[financialExpenseSortState.key] ?? "";
}

function sortFinancialExpenses(expenses) {
  return [...expenses].sort((first, second) => {
    const result = compareValues(
      getFinancialExpenseSortValue(first),
      getFinancialExpenseSortValue(second),
    );

    if (result !== 0) {
      return financialExpenseSortState.direction === "asc" ? result : -result;
    }

    return sortExpensesByDate(first, second);
  });
}

function updateFinancialExpenseSortButtons() {
  document.querySelectorAll("[data-financial-expense-sort]").forEach((button) => {
    button.classList.remove("sorted-asc", "sorted-desc");

    if (button.dataset.financialExpenseSort === financialExpenseSortState.key) {
      button.classList.add(`sorted-${financialExpenseSortState.direction}`);
    }
  });
}

function setFinancialExpenseSort(key) {
  if (financialExpenseSortState.key === key) {
    financialExpenseSortState.direction =
      financialExpenseSortState.direction === "asc" ? "desc" : "asc";
  } else {
    financialExpenseSortState = {
      direction: "asc",
      key,
    };
  }

  renderAllExpensesTable();
}

function sortBudgetItemsByOrder(first, second) {
  const firstOrder = Number(first.display_order || 0);
  const secondOrder = Number(second.display_order || 0);

  if (firstOrder !== secondOrder) {
    return firstOrder - secondOrder;
  }

  return String(first.title || "").localeCompare(String(second.title || ""), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
}

function getFinancialBudgetSortValue(item) {
  const sortValues = {
    amount: Number(item.estimated_amount || 0),
    category: item.category_name,
    context: getContextLabel(item.context),
    delta: Number(item.linked_delta || 0),
    realized: Number(item.linked_expense_total || 0),
    scenario: item.scenario_name,
    status: getStatusLabel(item.status, BUDGET_STATUS_LABELS),
    title: item.title,
  };

  return sortValues[financialBudgetSortState.key] ?? "";
}

function sortFinancialBudgetItems(items) {
  return [...items].sort((first, second) => {
    const result = compareValues(
      getFinancialBudgetSortValue(first),
      getFinancialBudgetSortValue(second),
    );

    if (result !== 0) {
      return financialBudgetSortState.direction === "asc" ? result : -result;
    }

    return sortBudgetItemsByOrder(first, second);
  });
}

function updateFinancialBudgetSortButtons() {
  document.querySelectorAll("[data-financial-budget-sort]").forEach((button) => {
    button.classList.remove("sorted-asc", "sorted-desc");

    if (button.dataset.financialBudgetSort === financialBudgetSortState.key) {
      button.classList.add(`sorted-${financialBudgetSortState.direction}`);
    }
  });
}

function setFinancialBudgetSort(key) {
  if (financialBudgetSortState.key === key) {
    financialBudgetSortState.direction =
      financialBudgetSortState.direction === "asc" ? "desc" : "asc";
  } else {
    financialBudgetSortState = {
      direction: "asc",
      key,
    };
  }

  renderBudgetTable();
}

function createExpenseTableRow(expense, options = {}) {
  const { includeDetails = false } = options;
    const row = document.createElement("tr");
    const statusCell = createCell("");
    const actionsCell = createCell("");
    const detailsButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    row.dataset.financialExpenseId = expense.id;
    row.tabIndex = 0;
    statusCell.appendChild(
      createBadge(
        getStatusLabel(expense.status, EXPENSE_STATUS_LABELS),
        expense.status,
      ),
    );
    actionsCell.className = "admin-actions compact-actions";

    detailsButton.type = "button";
    detailsButton.className = "admin-action-button icon-action";
    detailsButton.dataset.financialExpenseAction = "details";
    detailsButton.dataset.financialExpenseId = expense.id;
    detailsButton.append(createIcon("eye"), document.createTextNode("Detalhes"));

    deleteButton.type = "button";
    deleteButton.className = "admin-action-button danger icon-action";
    deleteButton.dataset.financialExpenseAction = "delete";
    deleteButton.dataset.financialExpenseId = expense.id;
    deleteButton.append(createIcon("trash-2"), document.createTextNode("Excluir"));

    actionsCell.append(detailsButton, deleteButton);
  const titleCell = createCell("");
  const typeCell = createCell("");
  const title = document.createElement("strong");
  const type = document.createElement("strong");
  const category = document.createElement("small");

  title.className = "financial-expense-title";
  title.textContent = expense.title || "-";
  titleCell.appendChild(title);

  if (includeDetails && expense.vendor_name) {
    const vendor = document.createElement("small");

    vendor.className = "admin-muted financial-expense-subtitle";
    vendor.textContent = expense.vendor_name;
    titleCell.appendChild(vendor);
  }

  if (includeDetails && expense.budget_item_title) {
    const budgetItem = document.createElement("small");

    budgetItem.className = "admin-muted financial-expense-subtitle";
    budgetItem.textContent = `Previsto: ${expense.budget_item_title}`;
    titleCell.appendChild(budgetItem);
  }

  if (includeDetails) {
    const payer = document.createElement("span");
    const dot = document.createElement("span");

    payer.className = "financial-expense-payer";
    payer.title = `Pagador: ${expense.default_payer_name || "A definir"}`;
    dot.className = "financial-expense-payer-dot";
    payer.append(dot, document.createTextNode(expense.default_payer_name || "A definir"));

    titleCell.appendChild(payer);
  }

  type.className = "financial-expense-title";
  type.textContent = getStatusLabel(expense.type, EXPENSE_TYPE_LABELS);
  category.className = "admin-muted financial-expense-subtitle";
  category.textContent = expense.category_name || "-";
  typeCell.append(type, category);

  row.append(
    titleCell,
    typeCell,
    createCell(formatDate(expense.contracted_at)),
  );

  row.append(
      createCell(formatCurrency(expense.total_amount), "financial-money-cell"),
      createCell(formatCurrency(expense.paid_amount), "financial-money-cell"),
  );

  if (includeDetails) {
    row.append(
      createCell(formatCurrency(expense.remaining_amount), "financial-money-cell"),
    );
  }

  row.append(
      statusCell,
      actionsCell,
    );

  return row;
}

function createRecentExpenseCard(expense) {
  const card = document.createElement("article");
  const titleGroup = document.createElement("div");
  const title = document.createElement("strong");
  const meta = document.createElement("small");
  const actions = document.createElement("div");
  const detailsButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  card.className = "financial-recent-expense-card";
  titleGroup.className = "financial-recent-expense-title-group";
  title.className = "financial-recent-expense-title";
  title.textContent = expense.title || "-";
  meta.className = "financial-recent-expense-meta";
  meta.textContent = `Pago ${formatCurrency(expense.paid_amount)} de ${formatCurrency(
    expense.total_amount,
  )}`;

  titleGroup.append(title, meta);

  actions.className = "financial-recent-expense-actions";

  detailsButton.type = "button";
  detailsButton.className = "checklist-period-action";
  detailsButton.dataset.financialExpenseAction = "details";
  detailsButton.dataset.financialExpenseId = expense.id;
  detailsButton.title = "Detalhes do gasto";
  detailsButton.setAttribute("aria-label", "Detalhes do gasto");
  detailsButton.appendChild(createIcon("eye"));

  deleteButton.type = "button";
  deleteButton.className = "checklist-period-action";
  deleteButton.dataset.financialExpenseAction = "delete";
  deleteButton.dataset.financialExpenseId = expense.id;
  deleteButton.title = "Excluir gasto";
  deleteButton.setAttribute("aria-label", "Excluir gasto");
  deleteButton.appendChild(createIcon("trash-2"));

  actions.append(detailsButton, deleteButton);
  card.append(titleGroup, actions);

  return card;
}

function createFinancialExpenseMobileCard(expense) {
  const card = document.createElement("article");
  const main = document.createElement("div");
  const titleGroup = document.createElement("div");
  const side = document.createElement("div");
  const footer = document.createElement("div");
  const title = document.createElement("strong");
  const meta = document.createElement("span");
  const paid = document.createElement("span");
  const amount = document.createElement("strong");
  const remaining = document.createElement("span");
  const statusBadge = createBadge(
    getStatusLabel(expense.status, EXPENSE_STATUS_LABELS),
    expense.status,
  );
  const actions = document.createElement("div");
  const detailsButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  card.className = "financial-expense-mobile-card";
  card.dataset.financialExpenseId = expense.id;
  card.tabIndex = 0;

  main.className = "financial-expense-mobile-main";
  titleGroup.className = "financial-expense-mobile-title-group";
  title.textContent = expense.title || "-";
  meta.textContent = [
    getStatusLabel(expense.type, EXPENSE_TYPE_LABELS),
    expense.category_name || "-",
    `Data: ${formatDate(expense.contracted_at)}`,
    expense.default_payer_name || "Pagador a definir",
  ]
    .filter(Boolean)
    .join(" · ");
  paid.className = "financial-expense-mobile-paid";
  paid.textContent = `Pago ${formatCurrency(expense.paid_amount)} de ${formatCurrency(
    expense.total_amount,
  )}`;
  titleGroup.append(title, meta, paid);

  side.className = "financial-expense-mobile-side";
  amount.textContent = formatCurrency(expense.total_amount);
  remaining.textContent = `Aberto: ${formatCurrency(expense.remaining_amount)}`;
  side.append(amount, remaining);
  main.append(titleGroup, side);

  footer.className = "financial-expense-mobile-footer";
  actions.className = "financial-expense-mobile-actions";

  detailsButton.type = "button";
  detailsButton.className = "checklist-period-action";
  detailsButton.dataset.financialExpenseAction = "details";
  detailsButton.dataset.financialExpenseId = expense.id;
  detailsButton.title = "Detalhes do gasto";
  detailsButton.setAttribute("aria-label", "Detalhes do gasto");
  detailsButton.appendChild(createIcon("eye"));

  deleteButton.type = "button";
  deleteButton.className = "checklist-period-action danger";
  deleteButton.dataset.financialExpenseAction = "delete";
  deleteButton.dataset.financialExpenseId = expense.id;
  deleteButton.title = "Excluir gasto";
  deleteButton.setAttribute("aria-label", "Excluir gasto");
  deleteButton.appendChild(createIcon("trash-2"));

  actions.append(detailsButton, deleteButton);
  footer.append(statusBadge, actions);
  card.append(main, footer);

  return card;
}

function renderExpensesTable() {
  if (!financialExpensesTableBody) {
    return;
  }

  const expenses = cachedExpenses
    .filter(matchesActiveContext)
    .sort(sortExpensesByRecentDate)
    .slice(0, 4);

  financialExpensesTableBody.replaceChildren();

  if (!expenses.length) {
    const emptyState = document.createElement("p");

    emptyState.className = "admin-muted financial-empty-card";
    emptyState.textContent = "Nenhum gasto real cadastrado neste contexto.";
    financialExpensesTableBody.appendChild(emptyState);
    return;
  }

  expenses.forEach((expense) => {
    financialExpensesTableBody.appendChild(createRecentExpenseCard(expense));
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderAllExpensesTable() {
  if (!financialAllExpensesTableBody || !financialAllExpensesSummary) {
    return;
  }

  const contextExpenses = cachedExpenses.filter(matchesActiveContext);
  const expenses = contextExpenses.filter(matchesExpenseManagementFilters);
  const sortedExpenses = sortFinancialExpenses(expenses);
  const totalAmount = expenses.reduce(
    (total, expense) => total + Number(expense.total_amount || 0),
    0,
  );

  financialAllExpensesSummary.textContent = formatCurrency(totalAmount);
  updateFinancialFilterCount(
    financialExpenseFilterCount,
    expenses.length,
    contextExpenses.length,
    "gasto",
    "gastos",
  );
  if (financialExpenseFiltersPanel) {
    financialExpenseFiltersPanel.dataset.hasActiveFilters = String(
      expenses.length !== contextExpenses.length,
    );
  }
  financialAllExpensesTableBody.replaceChildren();
  financialAllExpensesMobileList?.replaceChildren();

  if (!expenses.length) {
    updateFinancialExpenseSortButtons();
    financialAllExpensesTableBody.appendChild(
      createEmptyRow("Nenhum gasto real encontrado com os filtros atuais.", 8),
    );
    if (financialAllExpensesMobileList) {
      const emptyState = document.createElement("div");
      emptyState.className = "admin-mobile-empty-state";
      emptyState.textContent = "Nenhum gasto real encontrado com os filtros atuais.";
      financialAllExpensesMobileList.appendChild(emptyState);
    }
    return;
  }

  sortedExpenses.forEach((expense) => {
    const row = createExpenseTableRow(expense, { includeDetails: true });
    financialAllExpensesTableBody.appendChild(row);
    financialAllExpensesMobileList?.appendChild(
      createFinancialExpenseMobileCard(expense),
    );
  });

  updateFinancialExpenseSortButtons();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setSelectOptions(selectElement, options, placeholder) {
  if (!selectElement) {
    return;
  }

  const currentValue = selectElement.value;

  selectElement.replaceChildren();
  selectElement.appendChild(new Option(placeholder, ""));
  options.forEach((option) => {
    selectElement.appendChild(new Option(option.label, option.value));
  });

  selectElement.value = options.some((option) => option.value === currentValue)
    ? currentValue
    : "";
}

function formatFinancialFilterCount(filteredCount, totalCount, singular, plural) {
  const noun = totalCount === 1 ? singular : plural;

  return filteredCount === totalCount
    ? `${totalCount} ${noun}`
    : `${filteredCount} de ${totalCount} ${noun}`;
}

function updateFinancialFilterCount(element, filteredCount, totalCount, singular, plural) {
  if (!element) {
    return;
  }

  element.textContent = formatFinancialFilterCount(
    filteredCount,
    totalCount,
    singular,
    plural,
  );
}

function updateExpenseManagementFilters() {
  if (
    !financialExpenseCategoryFilter ||
    !financialExpenseTypeFilter ||
    !financialExpenseStatusFilter ||
    !financialExpensePayerFilter ||
    !financialExpenseVendorFilter ||
    !financialExpenseBudgetLinkFilter ||
    !financialExpenseBudgetItemFilter
  ) {
    return;
  }

  const contextExpenses = cachedExpenses.filter(matchesActiveContext);
  const availableCategoryIds = new Set(
    contextExpenses.map((expense) => expense.category_id).filter(Boolean),
  );
  const availablePayerIds = new Set(
    contextExpenses.map((expense) => expense.default_payer_id).filter(Boolean),
  );
  const availableVendorIds = new Set(
    contextExpenses.map((expense) => expense.vendor_id).filter(Boolean),
  );
  const availableBudgetItemIds = new Set(
    contextExpenses.map((expense) => expense.budget_item_id).filter(Boolean),
  );

  setSelectOptions(
    financialExpenseCategoryFilter,
    cachedCategories
      .filter((category) => availableCategoryIds.has(category.id))
      .sort(compareFinancialOrderItems)
      .map((category) => ({
        label: `${category.name || "-"} · ${getContextLabel(category.context)}`,
        value: category.id,
      })),
    "Todas",
  );
  setSelectOptions(
    financialExpenseTypeFilter,
    Object.entries(EXPENSE_TYPE_LABELS).map(([value, label]) => ({ label, value })),
    "Todos",
  );
  setSelectOptions(
    financialExpenseStatusFilter,
    Object.entries(EXPENSE_STATUS_LABELS).map(([value, label]) => ({
      label,
      value,
    })),
    "Todos",
  );
  setSelectOptions(
    financialExpensePayerFilter,
    cachedPayers
      .filter((payer) => availablePayerIds.has(payer.id))
      .sort(compareFinancialOrderItems)
      .map((payer) => ({ label: payer.name || "-", value: payer.id })),
    "Todos",
  );
  setSelectOptions(
    financialExpenseVendorFilter,
    cachedVendors
      .filter((vendor) => availableVendorIds.has(vendor.id))
      .sort((first, second) =>
        String(first.name || "").localeCompare(String(second.name || ""), "pt-BR", {
          numeric: true,
          sensitivity: "base",
        }),
      )
      .map((vendor) => ({
        label: `${vendor.name || "-"} · ${vendor.category || "-"}`,
        value: vendor.id,
      })),
    "Todos",
  );
  setSelectOptions(
    financialExpenseBudgetItemFilter,
    cachedBudgetItems
      .filter((item) => availableBudgetItemIds.has(item.id))
      .sort(sortBudgetItemsByOrder)
      .map((item) => ({
        label: `${item.title || "-"} · ${item.scenario_name || "-"} · ${formatCurrency(
          item.estimated_amount,
        )}`,
        value: item.id,
      })),
    "Todos",
  );
}

function updateBudgetManagementFilters() {
  if (
    !financialBudgetCategoryFilter ||
    !financialBudgetStatusFilter ||
    !financialBudgetBalanceFilter
  ) {
    return;
  }

  const contextBudgetItems = cachedBudgetItems
    .filter(matchesActiveContext)
    .filter(matchesSelectedBudgetScenario);
  const availableCategoryIds = new Set(
    contextBudgetItems.map((item) => item.category_id).filter(Boolean),
  );

  setSelectOptions(
    financialBudgetCategoryFilter,
    cachedCategories
      .filter((category) => availableCategoryIds.has(category.id))
      .sort(compareFinancialOrderItems)
      .map((category) => ({
        label: `${category.name || "-"} · ${getContextLabel(category.context)}`,
        value: category.id,
      })),
    "Todas",
  );
  setSelectOptions(
    financialBudgetStatusFilter,
    Object.entries(BUDGET_STATUS_LABELS).map(([value, label]) => ({
      label,
      value,
    })),
    "Todos",
  );
}

function updatePaymentManagementFilters() {
  if (
    !financialPaymentCategoryFilter ||
    !financialPaymentStatusFilter ||
    !financialPaymentPayerFilter
  ) {
    return;
  }

  const contextPayments = cachedPayments.filter(matchesActiveContext);
  const availableCategoryIds = new Set(
    contextPayments.map((payment) => payment.category_id).filter(Boolean),
  );
  const availablePayerIds = new Set(
    contextPayments.map((payment) => payment.payer_id).filter(Boolean),
  );

  setSelectOptions(
    financialPaymentCategoryFilter,
    cachedCategories
      .filter((category) => availableCategoryIds.has(category.id))
      .sort(compareFinancialOrderItems)
      .map((category) => ({
        label: `${category.name || "-"} · ${getContextLabel(category.context)}`,
        value: category.id,
      })),
    "Todas",
  );
  setSelectOptions(
    financialPaymentStatusFilter,
    [
      { label: "Não pagas", value: "unpaid" },
      { label: "Pagas", value: "paid" },
      { label: "Atrasadas", value: "overdue" },
      { label: "Canceladas", value: "cancelled" },
    ],
    "Todos",
  );
  setSelectOptions(
    financialPaymentPayerFilter,
    cachedPayers
      .filter((payer) => availablePayerIds.has(payer.id))
      .sort(compareFinancialOrderItems)
      .map((payer) => ({ label: payer.name || "-", value: payer.id })),
    "Todos",
  );
}

function clearFinancialBudgetFilters() {
  if (financialBudgetSearchInput) {
    financialBudgetSearchInput.value = "";
  }
  if (financialBudgetCategoryFilter) {
    financialBudgetCategoryFilter.value = "";
  }
  if (financialBudgetStatusFilter) {
    financialBudgetStatusFilter.value = "";
  }
  if (financialBudgetActiveFilter) {
    financialBudgetActiveFilter.value = "";
  }
  if (financialBudgetBalanceFilter) {
    financialBudgetBalanceFilter.value = "";
  }

  renderBudgetTable();
}

function clearFinancialExpenseFilters() {
  [
    financialExpenseSearchInput,
    financialExpenseCategoryFilter,
    financialExpenseTypeFilter,
    financialExpenseStatusFilter,
    financialExpensePayerFilter,
    financialExpenseVendorFilter,
    financialExpenseBudgetLinkFilter,
    financialExpenseBudgetItemFilter,
  ].forEach((filter) => {
    if (filter) {
      filter.value = "";
    }
  });

  renderAllExpensesTable();
}

function clearFinancialPaymentFilters() {
  [
    financialPaymentSearchInput,
    financialPaymentCategoryFilter,
    financialPaymentStatusFilter,
    financialPaymentPayerFilter,
    financialPaymentDueFromFilter,
    financialPaymentDueToFilter,
  ].forEach((filter) => {
    if (filter) {
      filter.value = "";
    }
  });

  renderAllPaymentsTable();
}

function createBudgetPreviewItem(item) {
  const card = document.createElement("article");
  const titleGroup = document.createElement("div");
  const title = document.createElement("strong");
  const meta = document.createElement("div");
  const valuesRow = document.createElement("div");
  const plannedValue = document.createElement("span");
  const realizedValue = document.createElement("span");
  const balanceValue = document.createElement("span");
  const actions = document.createElement("div");
  const editButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  card.className = "financial-overview-budget-item";
  titleGroup.className = "financial-overview-budget-title-group";
  title.className = "financial-overview-budget-title";
  title.textContent = item.title || "-";
  meta.className = "financial-overview-budget-meta";
  valuesRow.className = "financial-overview-budget-values";
  plannedValue.textContent = `Previsto ${formatCurrency(item.estimated_amount)}`;
  realizedValue.textContent = `Realizado ${formatCurrency(item.linked_expense_total)}`;
  balanceValue.className = `financial-overview-budget-balance ${getBudgetBalanceClass(
    item.linked_delta,
  )}`;
  balanceValue.textContent = formatBudgetRemainingLabel(item.linked_delta);
  valuesRow.append(plannedValue, realizedValue);
  meta.append(valuesRow, balanceValue);

  titleGroup.append(title, meta);

  actions.className = "financial-overview-budget-actions-list";

  editButton.type = "button";
  editButton.className = "checklist-period-action";
  editButton.dataset.financialBudgetAction = "details";
  editButton.dataset.financialBudgetItemId = item.id;
  editButton.title = "Detalhes do item previsto";
  editButton.setAttribute("aria-label", "Detalhes do item previsto");
  editButton.appendChild(createIcon("eye"));

  deleteButton.type = "button";
  deleteButton.className = "checklist-period-action";
  deleteButton.dataset.financialBudgetAction = "delete";
  deleteButton.dataset.financialBudgetItemId = item.id;
  deleteButton.title = "Excluir item previsto";
  deleteButton.setAttribute("aria-label", "Excluir item previsto");
  deleteButton.appendChild(createIcon("trash-2"));

  actions.append(editButton, deleteButton);
  card.append(titleGroup, actions);

  return card;
}

function renderBudgetPreviewList(budgetItems) {
  const previewItems = budgetItems.slice(0, 4);

  financialBudgetTableBody.replaceChildren();

  if (!previewItems.length) {
    const emptyState = document.createElement("p");

    emptyState.className = "admin-muted financial-empty-card";
    emptyState.textContent = "Nenhum item previsto ativo neste contexto.";
    financialBudgetTableBody.appendChild(emptyState);
    return;
  }

  previewItems.forEach((item) => {
    financialBudgetTableBody.appendChild(createBudgetPreviewItem(item));
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function createFinancialDetailsMetaItem(label, value) {
  const item = document.createElement("div");
  const labelElement = document.createElement("span");
  const valueElement = document.createElement("strong");

  item.className = "admin-details-meta-item";
  labelElement.textContent = label;
  valueElement.textContent = value || "-";
  item.append(labelElement, valueElement);

  return item;
}

function createFinancialDetailsSection(label) {
  const section = document.createElement("section");
  const title = document.createElement("span");

  section.className = "admin-details-section";
  title.className = "admin-details-label";
  title.textContent = label;
  section.appendChild(title);

  return section;
}

function createFinancialBaseVisualSummary(label, details, iconName, color) {
  const wrapper = document.createElement("div");

  wrapper.className = "financial-base-details-visual";
  wrapper.appendChild(
    createFinancialBaseItemCard(label, details, {
      color,
      icon: iconName,
    }),
  );

  return wrapper;
}

function openFinancialBudgetItemDetailsModal(item) {
  if (
    !financialBudgetItemDetailsModal ||
    !financialBudgetItemDetailsContent ||
    !financialBudgetItemDetailsTitle
  ) {
    return;
  }

  selectedFinancialBudgetDetailsItemId = item.id;
  financialBudgetItemDetailsTitle.textContent = item.title || "Detalhes do Item";
  financialBudgetItemDetailsContent.replaceChildren();

  const summarySection = createFinancialDetailsSection("Resumo");
  const summaryGrid = document.createElement("div");
  const realizedSection = createFinancialDetailsSection("Realizado vinculado");
  const realizedGrid = document.createElement("div");
  const detailsSection = createFinancialDetailsSection("Detalhes");
  const detailsGrid = document.createElement("div");
  const notesSection = createFinancialDetailsSection("Observações");
  const notesText = document.createElement("p");

  summaryGrid.className = "admin-details-meta-grid";
  summaryGrid.append(
    createFinancialDetailsMetaItem("Valor estimado", formatCurrency(item.estimated_amount)),
    createFinancialDetailsMetaItem("Contexto", getContextLabel(item.context)),
    createFinancialDetailsMetaItem("Cenário", item.scenario_name || "-"),
    createFinancialDetailsMetaItem("Categoria", item.category_name || "-"),
  );
  summarySection.appendChild(summaryGrid);

  realizedGrid.className = "admin-details-meta-grid";
  realizedGrid.append(
    createFinancialDetailsMetaItem(
      "Total de gastos",
      formatCurrency(item.linked_expense_total),
    ),
    createFinancialDetailsMetaItem("Pago", formatCurrency(item.linked_paid_total)),
    createFinancialDetailsMetaItem(
      "Em aberto",
      formatCurrency(item.linked_remaining_total),
    ),
    createFinancialDetailsMetaItem(
      "Saldo / Estouro",
      formatBudgetBalanceLabel(item.linked_delta),
    ),
    createFinancialDetailsMetaItem(
      "Gastos vinculados",
      String(Number(item.linked_expense_count || 0)),
    ),
  );
  realizedSection.appendChild(realizedGrid);

  if (Number(item.linked_expense_count || 0) > 0) {
    realizedSection.appendChild(
      createFinancialDetailsActionLink(
        "Ver gastos vinculados",
        getBudgetItemExpensesUrl(item),
        "receipt-text",
      ),
    );
  }

  detailsGrid.className = "admin-details-meta-grid";
  detailsGrid.append(
    createFinancialDetailsMetaItem(
      "Status",
      getStatusLabel(item.status, BUDGET_STATUS_LABELS),
    ),
    createFinancialDetailsMetaItem(
      "Prioridade",
      getStatusLabel(item.priority, BUDGET_PRIORITY_LABELS),
    ),
    createFinancialDetailsMetaItem("Ordem", String(Number(item.display_order || 0))),
    createFinancialDetailsMetaItem("Situação", item.is_active ? "Ativo" : "Inativo"),
    createFinancialDetailsMetaItem(
      "Fornecedor ou referência",
      item.expected_vendor_name || "-",
    ),
  );
  detailsSection.appendChild(detailsGrid);

  notesText.textContent = item.notes || "Nenhuma observação cadastrada.";
  notesSection.appendChild(notesText);

  financialBudgetItemDetailsContent.append(
    summarySection,
    realizedSection,
    detailsSection,
    notesSection,
  );
  financialBudgetItemDetailsModal.classList.add("active");
  financialBudgetItemDetailsModal.setAttribute("aria-hidden", "false");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeFinancialBudgetItemDetailsModal() {
  if (!financialBudgetItemDetailsModal) {
    return;
  }

  selectedFinancialBudgetDetailsItemId = null;
  financialBudgetItemDetailsModal.classList.remove("active");
  financialBudgetItemDetailsModal.setAttribute("aria-hidden", "true");
}

function createFinancialDetailsTextBlock(text) {
  const paragraph = document.createElement("p");

  paragraph.textContent = text || "Nenhuma informação cadastrada.";

  return paragraph;
}

function createFinancialDetailsLink(url) {
  if (!url) {
    return createFinancialDetailsTextBlock("Nenhum link cadastrado.");
  }

  const link = document.createElement("a");

  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = url;

  return link;
}

function createFinancialDetailsActionLink(label, href, iconName) {
  const link = document.createElement("a");

  link.href = href;
  link.className = "financial-details-action-link";
  link.append(createIcon(iconName), document.createTextNode(label));

  return link;
}

function openFinancialPaymentDetailsModal(payment) {
  if (
    !financialPaymentDetailsModal ||
    !financialPaymentDetailsContent ||
    !financialPaymentDetailsTitle
  ) {
    return;
  }

  const status = payment.display_status || payment.status;
  selectedFinancialPaymentDetailsId = payment.id;
  financialPaymentDetailsTitle.textContent =
    payment.label || `Parcela ${payment.installment_number || "-"}`;
  financialPaymentDetailsContent.replaceChildren();

  const summarySection = createFinancialDetailsSection("Resumo");
  const summaryGrid = document.createElement("div");
  const expenseSection = createFinancialDetailsSection("Gasto vinculado");
  const expenseGrid = document.createElement("div");
  const detailsSection = createFinancialDetailsSection("Detalhes");
  const detailsGrid = document.createElement("div");
  const notesSection = createFinancialDetailsSection("Observações");

  summaryGrid.className = "admin-details-meta-grid";
  summaryGrid.append(
    createFinancialDetailsMetaItem("Valor", formatCurrency(payment.amount)),
    createFinancialDetailsMetaItem("Vencimento", formatDate(payment.due_date)),
    createFinancialDetailsMetaItem("Pagamento", formatDate(payment.paid_at)),
    createFinancialDetailsMetaItem(
      "Status",
      getStatusLabel(status, PAYMENT_STATUS_LABELS),
    ),
  );
  summarySection.appendChild(summaryGrid);

  expenseGrid.className = "admin-details-meta-grid";
  expenseGrid.append(
    createFinancialDetailsMetaItem("Gasto", payment.expense_title || "-"),
    createFinancialDetailsMetaItem("Contexto", getContextLabel(payment.context)),
    createFinancialDetailsMetaItem("Categoria", payment.category_name || "-"),
    createFinancialDetailsMetaItem("Pagador", payment.payer_name || "A definir"),
  );
  expenseSection.appendChild(expenseGrid);

  detailsGrid.className = "admin-details-meta-grid";
  detailsGrid.append(
    createFinancialDetailsMetaItem(
      "Parcela Nº",
      String(Number(payment.installment_number || 1)),
    ),
    createFinancialDetailsMetaItem(
      "Descrição",
      payment.label || `Parcela ${payment.installment_number || "-"}`,
    ),
  );
  detailsSection.appendChild(detailsGrid);
  notesSection.appendChild(createFinancialDetailsTextBlock(payment.notes));

  financialPaymentDetailsContent.append(
    summarySection,
    expenseSection,
    detailsSection,
    notesSection,
  );
  financialPaymentDetailsModal.classList.add("active");
  financialPaymentDetailsModal.setAttribute("aria-hidden", "false");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeFinancialPaymentDetailsModal() {
  if (!financialPaymentDetailsModal) {
    return;
  }

  selectedFinancialPaymentDetailsId = null;
  financialPaymentDetailsModal.classList.remove("active");
  financialPaymentDetailsModal.setAttribute("aria-hidden", "true");
}

function openFinancialExpenseDetailsModal(expense) {
  if (
    !financialExpenseDetailsModal ||
    !financialExpenseDetailsContent ||
    !financialExpenseDetailsTitle
  ) {
    return;
  }

  selectedFinancialExpenseDetailsId = expense.id;
  financialExpenseDetailsTitle.textContent = expense.title || "Detalhes do Gasto";
  financialExpenseDetailsContent.replaceChildren();

  const payments = getPaymentsByExpenseId(expense.id);
  const activePayments = payments.filter((payment) => payment.status !== "cancelled");
  const paidPayments = activePayments.filter((payment) => payment.status === "paid");
  const pendingPayments = activePayments.filter((payment) => payment.status !== "paid");
  const nextPayment = pendingPayments
    .slice()
    .sort(sortPaymentsByDueDate)[0];
  const financialSection = createFinancialDetailsSection("Resumo financeiro");
  const financialGrid = document.createElement("div");
  const detailsSection = createFinancialDetailsSection("Detalhes");
  const detailsGrid = document.createElement("div");
  const paymentsSection = createFinancialDetailsSection("Parcelas");
  const paymentsGrid = document.createElement("div");
  const descriptionSection = createFinancialDetailsSection("Descrição");
  const referenceSection = createFinancialDetailsSection("Referência");
  const notesSection = createFinancialDetailsSection("Observações");

  financialGrid.className = "admin-details-meta-grid";
  financialGrid.append(
    createFinancialDetailsMetaItem("Valor total", formatCurrency(expense.total_amount)),
    createFinancialDetailsMetaItem("Pago", formatCurrency(expense.paid_amount)),
    createFinancialDetailsMetaItem(
      "Em aberto",
      formatCurrency(expense.remaining_amount),
    ),
    createFinancialDetailsMetaItem(
      "Forma de pagamento",
      getStatusLabel(expense.payment_method, EXPENSE_PAYMENT_METHOD_LABELS),
    ),
  );
  financialSection.appendChild(financialGrid);

  detailsGrid.className = "admin-details-meta-grid";
  detailsGrid.append(
    createFinancialDetailsMetaItem("Contexto", getContextLabel(expense.context)),
    createFinancialDetailsMetaItem("Categoria", expense.category_name || "-"),
    createFinancialDetailsMetaItem(
      "Item previsto",
      expense.budget_item_title || "Sem vínculo",
    ),
    createFinancialDetailsMetaItem(
      "Valor previsto",
      expense.budget_item_id
        ? formatCurrency(expense.budget_item_estimated_amount)
        : "-",
    ),
    createFinancialDetailsMetaItem(
      "Tipo",
      getStatusLabel(expense.type, EXPENSE_TYPE_LABELS),
    ),
    createFinancialDetailsMetaItem(
      "Status",
      getStatusLabel(expense.status, EXPENSE_STATUS_LABELS),
    ),
    createFinancialDetailsMetaItem(
      "Pagador principal",
      expense.default_payer_name || "A definir",
    ),
    createFinancialDetailsMetaItem("Fornecedor", expense.vendor_name || "-"),
    createFinancialDetailsMetaItem(
      "Contratação/compra",
      formatDate(expense.contracted_at),
    ),
    createFinancialDetailsMetaItem("Situação", expense.is_active ? "Ativo" : "Inativo"),
  );
  detailsSection.appendChild(detailsGrid);

  paymentsGrid.className = "admin-details-meta-grid";
  paymentsGrid.append(
    createFinancialDetailsMetaItem("Parcelas", String(payments.length)),
    createFinancialDetailsMetaItem("Pagas", String(paidPayments.length)),
    createFinancialDetailsMetaItem("Em aberto", String(pendingPayments.length)),
    createFinancialDetailsMetaItem(
      "Próximo vencimento",
      nextPayment ? formatDate(nextPayment.due_date) : "-",
    ),
  );
  paymentsSection.appendChild(paymentsGrid);

  descriptionSection.appendChild(
    createFinancialDetailsTextBlock(expense.description),
  );
  referenceSection.appendChild(createFinancialDetailsLink(expense.reference_url));
  notesSection.appendChild(createFinancialDetailsTextBlock(expense.notes));

  financialExpenseDetailsContent.append(
    financialSection,
    detailsSection,
    paymentsSection,
    descriptionSection,
    referenceSection,
    notesSection,
  );
  financialExpenseDetailsModal.classList.add("active");
  financialExpenseDetailsModal.setAttribute("aria-hidden", "false");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeFinancialExpenseDetailsModal() {
  if (!financialExpenseDetailsModal) {
    return;
  }

  selectedFinancialExpenseDetailsId = null;
  financialExpenseDetailsModal.classList.remove("active");
  financialExpenseDetailsModal.setAttribute("aria-hidden", "true");
}

function openFinancialScenarioDetailsModal(scenario) {
  if (
    !financialScenarioDetailsModal ||
    !financialScenarioDetailsContent ||
    !financialScenarioDetailsTitle
  ) {
    return;
  }

  selectedFinancialScenarioDetailsId = scenario.id;
  financialScenarioDetailsTitle.textContent = scenario.name || "Detalhes do Cenário";
  financialScenarioDetailsContent.replaceChildren();

  const summarySection = createFinancialDetailsSection("Resumo");
  const summaryGrid = document.createElement("div");
  const descriptionSection = createFinancialDetailsSection("Descrição");

  summaryGrid.className = "admin-details-meta-grid";
  summaryGrid.append(
    createFinancialDetailsMetaItem("Contexto", getContextLabel(scenario.context)),
    createFinancialDetailsMetaItem(
      "Tipo",
      scenario.is_reference ? "Referência" : "Alternativo",
    ),
    createFinancialDetailsMetaItem(
      "Itens previstos",
      String(Number(scenario.item_count || 0)),
    ),
    createFinancialDetailsMetaItem("Total previsto", formatCurrency(scenario.total_estimated)),
    createFinancialDetailsMetaItem("Ordem", String(Number(scenario.display_order || 0))),
    createFinancialDetailsMetaItem("Situação", scenario.is_active ? "Ativo" : "Inativo"),
  );
  summarySection.appendChild(summaryGrid);
  descriptionSection.appendChild(createFinancialDetailsTextBlock(scenario.description));

  financialScenarioDetailsContent.append(summarySection, descriptionSection);
  financialScenarioDetailsModal.classList.add("active");
  financialScenarioDetailsModal.setAttribute("aria-hidden", "false");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeFinancialScenarioDetailsModal() {
  selectedFinancialScenarioDetailsId = null;
  financialScenarioDetailsModal?.classList.remove("active");
  financialScenarioDetailsModal?.setAttribute("aria-hidden", "true");
}

function openFinancialCategoryDetailsModal(category) {
  if (
    !financialCategoryDetailsModal ||
    !financialCategoryDetailsContent ||
    !financialCategoryDetailsTitle
  ) {
    return;
  }

  selectedFinancialCategoryDetailsId = category.id;
  financialCategoryDetailsTitle.textContent =
    category.name || "Detalhes da Categoria";
  financialCategoryDetailsContent.replaceChildren();

  const visualSection = createFinancialDetailsSection("Identidade visual");
  const summarySection = createFinancialDetailsSection("Resumo");
  const summaryGrid = document.createElement("div");

  visualSection.appendChild(
    createFinancialBaseVisualSummary(
      category.name || "-",
      [category.color || DEFAULT_BRAND_COLOR, category.icon || "wallet"],
      category.icon || "wallet",
      category.color,
    ),
  );

  summaryGrid.className = "admin-details-meta-grid";
  summaryGrid.append(
    createFinancialDetailsMetaItem("Contexto", getContextLabel(category.context)),
    createFinancialDetailsMetaItem(
      "Itens previstos",
      String(Number(category.budget_item_count || 0)),
    ),
    createFinancialDetailsMetaItem("Gastos reais", String(Number(category.expense_count || 0))),
    createFinancialDetailsMetaItem("Ordem", String(Number(category.display_order || 0))),
    createFinancialDetailsMetaItem("Situação", category.is_active ? "Ativa" : "Inativa"),
  );
  summarySection.appendChild(summaryGrid);

  financialCategoryDetailsContent.append(visualSection, summarySection);
  financialCategoryDetailsModal.classList.add("active");
  financialCategoryDetailsModal.setAttribute("aria-hidden", "false");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeFinancialCategoryDetailsModal() {
  selectedFinancialCategoryDetailsId = null;
  financialCategoryDetailsModal?.classList.remove("active");
  financialCategoryDetailsModal?.setAttribute("aria-hidden", "true");
}

function openFinancialPayerDetailsModal(payer) {
  if (
    !financialPayerDetailsModal ||
    !financialPayerDetailsContent ||
    !financialPayerDetailsTitle
  ) {
    return;
  }

  selectedFinancialPayerDetailsId = payer.id;
  financialPayerDetailsTitle.textContent = payer.name || "Detalhes do Pagador";
  financialPayerDetailsContent.replaceChildren();

  const visualSection = createFinancialDetailsSection("Identidade visual");
  const summarySection = createFinancialDetailsSection("Resumo");
  const summaryGrid = document.createElement("div");
  const descriptionSection = createFinancialDetailsSection("Descrição");

  visualSection.appendChild(
    createFinancialBaseVisualSummary(
      payer.name || "-",
      [payer.color || DEFAULT_BRAND_COLOR, payer.icon || "user"],
      payer.icon || "user",
      payer.color,
    ),
  );

  summaryGrid.className = "admin-details-meta-grid";
  summaryGrid.append(
    createFinancialDetailsMetaItem("Gastos reais", String(Number(payer.expense_count || 0))),
    createFinancialDetailsMetaItem("Parcelas", String(Number(payer.payment_count || 0))),
    createFinancialDetailsMetaItem("Ordem", String(Number(payer.display_order || 0))),
    createFinancialDetailsMetaItem("Situação", payer.is_active ? "Ativo" : "Inativo"),
  );
  summarySection.appendChild(summaryGrid);
  descriptionSection.appendChild(createFinancialDetailsTextBlock(payer.description));

  financialPayerDetailsContent.append(visualSection, summarySection, descriptionSection);
  financialPayerDetailsModal.classList.add("active");
  financialPayerDetailsModal.setAttribute("aria-hidden", "false");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeFinancialPayerDetailsModal() {
  selectedFinancialPayerDetailsId = null;
  financialPayerDetailsModal?.classList.remove("active");
  financialPayerDetailsModal?.setAttribute("aria-hidden", "true");
}

function createFinancialBudgetMobileCard(item) {
  const card = document.createElement("article");
  const main = document.createElement("div");
  const titleGroup = document.createElement("div");
  const side = document.createElement("div");
  const footer = document.createElement("div");
  const title = document.createElement("strong");
  const meta = document.createElement("span");
  const amount = document.createElement("strong");
  const balance = document.createElement("span");
  const statusBadge = createBadge(
    getStatusLabel(item.status, BUDGET_STATUS_LABELS),
    item.status,
  );
  const values = document.createElement("span");
  const actions = document.createElement("div");
  const detailsButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  card.className = "financial-budget-mobile-card";
  card.dataset.financialBudgetItemId = item.id;
  card.tabIndex = 0;

  main.className = "financial-budget-mobile-main";
  titleGroup.className = "financial-budget-mobile-title-group";
  title.textContent = item.title || "-";
  meta.textContent = [
    item.category_name || "-",
    getContextLabel(item.context),
    item.scenario_name || "-",
  ]
    .filter(Boolean)
    .join(" · ");
  values.className = "financial-budget-mobile-realized";
  values.textContent = `Realizado: ${formatCurrency(item.linked_expense_total)}`;
  titleGroup.append(title, meta, values);

  side.className = "financial-budget-mobile-side";
  amount.textContent = formatCurrency(item.estimated_amount);
  balance.className = `financial-overview-budget-balance ${getBudgetBalanceClass(
    item.linked_delta,
  )}`;
  balance.textContent = formatBudgetBalanceLabel(item.linked_delta);
  side.append(amount, balance);
  main.append(titleGroup, side);

  footer.className = "financial-budget-mobile-footer";
  actions.className = "financial-budget-mobile-actions";

  detailsButton.type = "button";
  detailsButton.className = "checklist-period-action";
  detailsButton.dataset.financialBudgetAction = "details";
  detailsButton.dataset.financialBudgetItemId = item.id;
  detailsButton.title = "Detalhes do item previsto";
  detailsButton.setAttribute("aria-label", "Detalhes do item previsto");
  detailsButton.appendChild(createIcon("eye"));

  deleteButton.type = "button";
  deleteButton.className = "checklist-period-action danger";
  deleteButton.dataset.financialBudgetAction = "delete";
  deleteButton.dataset.financialBudgetItemId = item.id;
  deleteButton.title = "Excluir item previsto";
  deleteButton.setAttribute("aria-label", "Excluir item previsto");
  deleteButton.appendChild(createIcon("trash-2"));

  actions.append(detailsButton, deleteButton);
  footer.append(statusBadge, actions);
  card.append(main, footer);

  return card;
}

function renderBudgetTable() {
  if (!financialBudgetTableBody) {
    return;
  }

  const isBudgetPreviewList = financialBudgetTableBody.classList.contains(
    "financial-overview-budget-list",
  );
  const canManageBudgetItems =
    financialBudgetTableBody.closest("table")?.dataset.financialBudgetActions === "true";
  const scopedBudgetItems = cachedBudgetItems
    .filter(matchesActiveContext)
    .filter(matchesSelectedBudgetScenario);
  const budgetItems = sortFinancialBudgetItems(
    scopedBudgetItems.filter(matchesBudgetManagementFilters),
  );

  if (isBudgetPreviewList) {
    renderBudgetPreviewList(budgetItems.filter((item) => item.is_active));
    return;
  }

  financialBudgetTableBody.replaceChildren();
  financialBudgetMobileList?.replaceChildren();
  updateFinancialBudgetSortButtons();
  updateFinancialFilterCount(
    financialBudgetFilterCount,
    budgetItems.length,
    scopedBudgetItems.length,
    "item previsto",
    "itens previstos",
  );
  if (financialBudgetFiltersPanel) {
    financialBudgetFiltersPanel.dataset.hasActiveFilters = String(
      budgetItems.length !== scopedBudgetItems.length,
    );
  }

  if (!budgetItems.length) {
    financialBudgetTableBody.appendChild(
      createEmptyRow(
        "Nenhum item previsto cadastrado neste contexto.",
        canManageBudgetItems ? 8 : 7,
      ),
    );
    if (financialBudgetMobileList) {
      const emptyState = document.createElement("div");
      emptyState.className = "admin-mobile-empty-state";
      emptyState.textContent = "Nenhum item previsto cadastrado neste contexto.";
      financialBudgetMobileList.appendChild(emptyState);
    }
    return;
  }

  budgetItems.forEach((item) => {
    const row = document.createElement("tr");
    const titleCell = createCell("");
    const title = document.createElement("strong");
    const category = document.createElement("small");
    const statusCell = createCell("");

    row.dataset.financialBudgetItemId = item.id;
    row.tabIndex = 0;
    title.className = "financial-expense-title";
    title.textContent = item.title || "-";
    category.className = "admin-muted financial-expense-subtitle";
    category.textContent = item.category_name || "-";
    titleCell.append(title, category);

    statusCell.appendChild(
      createBadge(getStatusLabel(item.status, BUDGET_STATUS_LABELS), item.status),
    );
    row.append(
      titleCell,
      createCell(getContextLabel(item.context)),
      createCell(item.scenario_name || "-"),
      createCell(formatCurrency(item.estimated_amount), "financial-money-cell"),
      createCell(formatCurrency(item.linked_expense_total), "financial-money-cell"),
      createBudgetBalanceCell(item.linked_delta),
      statusCell,
    );

    if (canManageBudgetItems) {
      const actionsCell = createCell("");
      const detailsButton = document.createElement("button");
      const deleteButton = document.createElement("button");

      actionsCell.className = "admin-actions compact-actions";

      detailsButton.type = "button";
      detailsButton.className = "admin-action-button icon-action";
      detailsButton.dataset.financialBudgetAction = "details";
      detailsButton.dataset.financialBudgetItemId = item.id;
      detailsButton.append(createIcon("eye"), document.createTextNode("Detalhes"));

      deleteButton.type = "button";
      deleteButton.className = "admin-action-button danger icon-action";
      deleteButton.dataset.financialBudgetAction = "delete";
      deleteButton.dataset.financialBudgetItemId = item.id;
      deleteButton.append(createIcon("trash-2"), document.createTextNode("Excluir"));

      actionsCell.append(detailsButton, deleteButton);
      row.appendChild(actionsCell);
    }

    financialBudgetTableBody.appendChild(row);

    if (financialBudgetMobileList) {
      financialBudgetMobileList.appendChild(createFinancialBudgetMobileCard(item));
    }
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function getFilteredBudgetItems() {
  return cachedBudgetItems
    .filter(matchesActiveContext)
    .filter(matchesSelectedBudgetScenario);
}

function getBudgetSummaryScopeLabel() {
  if (selectedBudgetScenarioFilter === "__reference__") {
    return "Cenário: referência";
  }

  const scenario = cachedScenarios.find(
    (item) => item.id === selectedBudgetScenarioFilter,
  );

  return `Cenário: ${scenario?.name || "-"}`;
}

function updateBudgetSummaryCards() {
  if (!document.getElementById("financialBudgetSummaryTotal")) {
    return;
  }

  const budgetItems = getFilteredBudgetItems();
  const activeBudgetItems = budgetItems.filter((item) => item.is_active);
  const activeTotal = activeBudgetItems.reduce(
    (sum, item) => sum + Number(item.estimated_amount || 0),
    0,
  );
  const categoryCount = new Set(
    activeBudgetItems.map((item) => item.category_id).filter(Boolean),
  ).size;
  const average = activeBudgetItems.length
    ? activeTotal / activeBudgetItems.length
    : 0;
  const topItem = [...activeBudgetItems].sort(
    (first, second) =>
      Number(second.estimated_amount || 0) - Number(first.estimated_amount || 0),
  )[0];

  setText("financialBudgetSummaryTotal", formatCurrency(activeTotal));
  setText("financialBudgetSummaryScope", getBudgetSummaryScopeLabel());
  setText("financialBudgetSummaryItems", String(activeBudgetItems.length));
  setText("financialBudgetSummaryActiveItems", `Total no cenário: ${budgetItems.length}`);
  setText("financialBudgetSummaryCategories", String(categoryCount));
  setText("financialBudgetSummaryAverage", `Média: ${formatCurrency(average)}`);
  setText("financialBudgetSummaryTopItem", topItem?.title || "-");
  setText(
    "financialBudgetSummaryTopValue",
    formatCurrency(topItem?.estimated_amount || 0),
  );
}

function renderBaseLists() {
  if (!financialScenariosList || !financialCategoriesList || !financialPayersList) {
    return;
  }

  const scenarios = cachedScenarios.filter(matchesActiveContext);
  const categories = cachedCategories.filter(matchesActiveCategoryContext);
  const payers = cachedPayers;

  financialScenariosList.replaceChildren();
  financialCategoriesList.replaceChildren();
  financialPayersList.replaceChildren();
  setText(
    "financialScenariosCount",
    `${scenarios.length} cenário${scenarios.length === 1 ? "" : "s"}`,
  );
  setText(
    "financialCategoriesCount",
    `${categories.length} categoria${categories.length === 1 ? "" : "s"}`,
  );
  setText(
    "financialPayersCount",
    `${payers.length} pagador${payers.length === 1 ? "" : "es"}`,
  );

  if (!scenarios.length) {
    financialScenariosList.appendChild(createFinancialBaseEmptyCard("Nenhum cenário"));
  } else {
    scenarios.forEach((scenario) => {
      const detail = [
        getContextLabel(scenario.context),
        `${Number(scenario.item_count || 0)} itens`,
      ]
        .filter(Boolean);

      financialScenariosList.appendChild(
        createFinancialBaseItemCard(scenario.name || "-", detail, {
          actionType: "scenario",
          badge: scenario.is_reference ? "Referência" : "",
          icon: scenario.is_reference ? "star" : "layers-3",
          itemId: scenario.id,
          muted: !scenario.is_active,
        }),
      );
    });
  }

  if (!categories.length) {
    financialCategoriesList.appendChild(
      createFinancialBaseEmptyCard("Nenhuma categoria"),
    );
  } else {
    categories.forEach((category) => {
      const detail = [
        getContextLabel(category.context),
        `${Number(category.budget_item_count || 0)} previstos`,
        `${Number(category.expense_count || 0)} gastos`,
      ];

      financialCategoriesList.appendChild(
        createFinancialBaseItemCard(category.name || "-", detail, {
          actionType: "category",
          color: category.color,
          icon: category.icon || "wallet",
          itemId: category.id,
          muted: !category.is_active,
        }),
      );
    });
  }

  if (!payers.length) {
    financialPayersList.appendChild(createFinancialBaseEmptyCard("Nenhum pagador"));
  } else {
    payers.forEach((payer) => {
      const detail = [
        `${Number(payer.expense_count || 0)} gastos`,
        `${Number(payer.payment_count || 0)} parcelas`,
      ];

      financialPayersList.appendChild(
        createFinancialBaseItemCard(payer.name || "-", detail, {
          actionType: "payer",
          color: payer.color,
          icon: payer.icon || "user",
          itemId: payer.id,
          muted: !payer.is_active,
        }),
      );
    });
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function resetFinancialScenarioForm() {
  selectedFinancialScenarioId = null;
  financialScenarioForm.reset();
  financialScenarioNameInput.value = "";
  financialScenarioContextInput.value = getInitialScenarioContext();
  financialScenarioDescriptionInput.value = "";
  financialScenarioOrderInput.value = getNextFinancialScenarioOrder();
  financialScenarioReferenceInput.checked = false;
  financialScenarioActiveInput.checked = true;
  if (financialScenarioModalTitle) {
    financialScenarioModalTitle.textContent = "Novo Cenário";
  }
  cancelFinancialScenarioEditButton.classList.add("is-hidden");
}

function createScenarioManagerItem(scenario) {
  const item = document.createElement("article");
  const swatch = document.createElement("span");
  const content = document.createElement("div");
  const title = document.createElement("strong");
  const meta = document.createElement("small");
  const actions = document.createElement("div");
  const editButton = document.createElement("button");
  const deleteButton = document.createElement("button");
  const itemCount = Number(scenario.item_count || 0);

  item.className = "checklist-category-item";
  swatch.className = "checklist-category-swatch financial-category-icon-swatch";
  swatch.style.backgroundColor = scenario.is_reference ? DEFAULT_BRAND_COLOR : "#6b6473";
  swatch.appendChild(createIcon(scenario.is_reference ? "star" : "layers-3"));

  title.textContent = scenario.name || "-";
  meta.textContent = [
    getContextLabel(scenario.context),
    scenario.is_reference ? "Referência" : "Alternativo",
    `${itemCount} item${itemCount === 1 ? "" : "s"}`,
    formatCurrency(scenario.total_estimated),
    scenario.is_active ? "Ativo" : "Inativo",
  ].join(" · ");
  content.append(title, meta);

  if (scenario.description) {
    const description = document.createElement("small");
    description.textContent = scenario.description;
    content.appendChild(description);
  }

  actions.className = "admin-actions compact-actions";

  editButton.type = "button";
  editButton.className = "admin-action-button icon-action";
  editButton.dataset.financialScenarioAction = "edit";
  editButton.dataset.financialScenarioId = scenario.id;
  editButton.append(createIcon("edit"), document.createTextNode("Editar"));

  deleteButton.type = "button";
  deleteButton.className = "admin-action-button danger icon-action";
  deleteButton.dataset.financialScenarioAction = "delete";
  deleteButton.dataset.financialScenarioId = scenario.id;
  deleteButton.append(createIcon("trash-2"), document.createTextNode("Excluir"));

  actions.append(editButton, deleteButton);
  item.append(swatch, content, actions);

  return item;
}

function renderFinancialScenarioManagerList() {
  financialScenarioList.replaceChildren();

  if (!cachedScenarios.length) {
    const empty = document.createElement("div");
    empty.className = "admin-empty-state";
    empty.textContent = "Nenhum cenário financeiro cadastrado.";
    financialScenarioList.appendChild(empty);
    return;
  }

  cachedScenarios.forEach((scenario) => {
    financialScenarioList.appendChild(createScenarioManagerItem(scenario));
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function openFinancialScenarioModal(scenario = null) {
  resetFinancialScenarioForm();
  if (scenario) {
    selectedFinancialScenarioId = scenario.id;
    financialScenarioNameInput.value = scenario.name || "";
    financialScenarioContextInput.value = scenario.context || "wedding";
    financialScenarioDescriptionInput.value = scenario.description || "";
    financialScenarioOrderInput.value = Number(scenario.display_order || 0);
    financialScenarioReferenceInput.checked = Boolean(scenario.is_reference);
    financialScenarioActiveInput.checked = Boolean(scenario.is_active);
    cancelFinancialScenarioEditButton.classList.remove("is-hidden");
  }
  if (financialScenarioModalTitle) {
    financialScenarioModalTitle.textContent = scenario
      ? "Editar Cenário"
      : "Novo Cenário";
  }
  financialScenarioModal.classList.add("active");
  financialScenarioModal.setAttribute("aria-hidden", "false");
  financialScenarioNameInput.focus();
}

function closeFinancialScenarioModal() {
  financialScenarioModal.classList.remove("active");
  financialScenarioModal.setAttribute("aria-hidden", "true");
  resetFinancialScenarioForm();
}

async function saveFinancialScenario(event) {
  event.preventDefault();

  if (financialScenarioReferenceInput.checked && !financialScenarioActiveInput.checked) {
    showAdminToast("⚠️ O cenário de referência precisa estar ativo");
    return;
  }

  const currentScenario = selectedFinancialScenarioId
    ? getScenarioById(selectedFinancialScenarioId)
    : null;
  const submittedContext = financialScenarioContextInput.value;
  const willBeActiveReference =
    financialScenarioReferenceInput.checked && financialScenarioActiveInput.checked;
  const submittedContextHasReference =
    willBeActiveReference ||
    hasOtherActiveReferenceScenario(submittedContext, selectedFinancialScenarioId);

  if (!submittedContextHasReference) {
    showAdminToast("⚠️ Cada contexto precisa manter um cenário de referência ativo");
    return;
  }

  if (
    currentScenario?.context &&
    currentScenario.context !== submittedContext &&
    currentScenario.is_reference &&
    currentScenario.is_active &&
    !hasOtherActiveReferenceScenario(currentScenario.context, selectedFinancialScenarioId)
  ) {
    showAdminToast(
      "⚠️ Defina outro cenário como referência antes de mudar este de contexto",
    );
    return;
  }

  const { data, error } = await supabaseClient.rpc(
    "admin_save_financial_budget_scenario",
    {
      submitted_context: financialScenarioContextInput.value,
      submitted_description: financialScenarioDescriptionInput.value,
      submitted_display_order:
        financialScenarioOrderInput.value === ""
          ? getNextFinancialScenarioOrder()
          : Number(financialScenarioOrderInput.value || 0),
      submitted_is_active: financialScenarioActiveInput.checked,
      submitted_is_reference: financialScenarioReferenceInput.checked,
      submitted_name: financialScenarioNameInput.value,
      target_scenario_id: selectedFinancialScenarioId,
    },
  );

  if (error || !data?.length) {
    console.error(error);
    showAdminToast(
      error?.code === "23514"
        ? "⚠️ Cada contexto precisa manter um cenário de referência ativo"
        : "⚠️ Não foi possível salvar o cenário",
    );
    return;
  }

  showAdminToast(
    selectedFinancialScenarioId ? "💜 Cenário atualizado!" : "💜 Cenário criado!",
  );
  closeFinancialScenarioModal();
  resetFinancialScenarioForm();
  await loadFinancialData();
}

async function deleteFinancialScenario(scenarioId) {
  const scenario = getScenarioById(scenarioId);
  const itemCount = Number(scenario?.item_count || 0);

  if (
    !confirm(
      "Deseja excluir este cenário? Cenários com itens previstos não podem ser excluídos.",
    )
  ) {
    return;
  }

  if (scenario?.is_reference) {
    showAdminToast("⚠️ Defina outro cenário como referência antes de excluir este.");
    return;
  }

  if (itemCount > 0) {
    showAdminToast(
      "⚠️ Cenário em uso. Desative em vez de excluir para preservar o histórico.",
    );
    return;
  }

  const { data, error } = await supabaseClient.rpc(
    "admin_delete_financial_budget_scenario",
    {
      target_scenario_id: scenarioId,
    },
  );

  if (error || data !== true) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível excluir o cenário");
    return;
  }

  showAdminToast("💜 Cenário excluído!");
  await loadFinancialData();
}

function resetFinancialCategoryForm() {
  selectedFinancialCategoryId = null;
  financialCategoryForm.reset();
  financialCategoryNameInput.value = "";
  financialCategoryContextInput.value = getInitialCategoryContext();
  financialCategoryColorInput.value = DEFAULT_BRAND_COLOR;
  financialCategoryIconInput.value = "wallet";
  financialCategoryOrderInput.value = getNextFinancialCategoryOrder();
  financialCategoryActiveInput.checked = true;
  if (financialCategoryModalTitle) {
    financialCategoryModalTitle.textContent = "Nova Categoria";
  }
  updateFinancialCategoryIconPreview();
  cancelFinancialCategoryEditButton.classList.add("is-hidden");
}

function createCategoryManagerItem(category) {
  const item = document.createElement("article");
  const swatch = document.createElement("span");
  const content = document.createElement("div");
  const title = document.createElement("strong");
  const meta = document.createElement("small");
  const actions = document.createElement("div");
  const editButton = document.createElement("button");
  const deleteButton = document.createElement("button");
  const budgetItemCount = Number(category.budget_item_count || 0);
  const expenseCount = Number(category.expense_count || 0);

  item.className = "checklist-category-item";
  swatch.className = "checklist-category-swatch financial-category-icon-swatch";
  swatch.style.backgroundColor = isSafeHexColor(category.color)
    ? category.color
    : DEFAULT_BRAND_COLOR;
  swatch.appendChild(createIcon(category.icon || "wallet"));

  title.textContent = category.name || "-";
  meta.textContent = [
    getContextLabel(category.context),
    `${budgetItemCount} previsto${budgetItemCount === 1 ? "" : "s"}`,
    `${expenseCount} gasto${expenseCount === 1 ? "" : "s"}`,
    category.is_active ? "Ativa" : "Inativa",
  ].join(" · ");
  content.append(title, meta);

  actions.className = "admin-actions compact-actions";

  editButton.type = "button";
  editButton.className = "admin-action-button icon-action";
  editButton.dataset.financialCategoryAction = "edit";
  editButton.dataset.financialCategoryId = category.id;
  editButton.append(createIcon("edit"), document.createTextNode("Editar"));

  deleteButton.type = "button";
  deleteButton.className = "admin-action-button danger icon-action";
  deleteButton.dataset.financialCategoryAction = "delete";
  deleteButton.dataset.financialCategoryId = category.id;
  deleteButton.append(createIcon("trash-2"), document.createTextNode("Excluir"));

  actions.append(editButton, deleteButton);
  item.append(swatch, content, actions);

  return item;
}

function renderFinancialCategoryManagerList() {
  financialCategoryList.replaceChildren();

  if (!cachedCategories.length) {
    const empty = document.createElement("div");
    empty.className = "admin-empty-state";
    empty.textContent = "Nenhuma categoria financeira cadastrada.";
    financialCategoryList.appendChild(empty);
    return;
  }

  cachedCategories.forEach((category) => {
    financialCategoryList.appendChild(createCategoryManagerItem(category));
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function openFinancialCategoryModal(category = null) {
  resetFinancialCategoryForm();
  if (category) {
    selectedFinancialCategoryId = category.id;
    financialCategoryNameInput.value = category.name || "";
    financialCategoryContextInput.value = category.context || "wedding";
    financialCategoryColorInput.value = isSafeHexColor(category.color)
      ? category.color
      : DEFAULT_BRAND_COLOR;
    financialCategoryIconInput.value = category.icon || "wallet";
    updateFinancialCategoryIconPreview();
    financialCategoryOrderInput.value = Number(category.display_order || 0);
    financialCategoryActiveInput.checked = Boolean(category.is_active);
    cancelFinancialCategoryEditButton.classList.remove("is-hidden");
  }
  if (financialCategoryModalTitle) {
    financialCategoryModalTitle.textContent = category
      ? "Editar Categoria"
      : "Nova Categoria";
  }
  financialCategoryModal.classList.add("active");
  financialCategoryModal.setAttribute("aria-hidden", "false");
  financialCategoryNameInput.focus();
}

function closeFinancialCategoryModal() {
  financialCategoryModal.classList.remove("active");
  financialCategoryModal.setAttribute("aria-hidden", "true");
  resetFinancialCategoryForm();
}

function resetFinancialPayerForm() {
  selectedFinancialPayerId = null;
  financialPayerForm.reset();
  financialPayerNameInput.value = "";
  financialPayerDescriptionInput.value = "";
  financialPayerColorInput.value = DEFAULT_BRAND_COLOR;
  financialPayerIconInput.value = "user";
  financialPayerOrderInput.value = getNextFinancialPayerOrder();
  financialPayerActiveInput.checked = true;
  if (financialPayerModalTitle) {
    financialPayerModalTitle.textContent = "Novo Pagador";
  }
  updateFinancialPayerIconPreview();
  cancelFinancialPayerEditButton.classList.add("is-hidden");
}

function createPayerManagerItem(payer) {
  const item = document.createElement("article");
  const swatch = document.createElement("span");
  const content = document.createElement("div");
  const title = document.createElement("strong");
  const meta = document.createElement("small");
  const actions = document.createElement("div");
  const editButton = document.createElement("button");
  const deleteButton = document.createElement("button");
  const expenseCount = Number(payer.expense_count || 0);
  const paymentCount = Number(payer.payment_count || 0);

  item.className = "checklist-category-item";
  swatch.className = "checklist-category-swatch financial-category-icon-swatch";
  swatch.style.backgroundColor = isSafeHexColor(payer.color)
    ? payer.color
    : DEFAULT_BRAND_COLOR;
  swatch.appendChild(createIcon(payer.icon || "user"));

  title.textContent = payer.name || "-";
  meta.textContent = [
    `${expenseCount} gasto${expenseCount === 1 ? "" : "s"}`,
    `${paymentCount} parcela${paymentCount === 1 ? "" : "s"}`,
    payer.is_active ? "Ativo" : "Inativo",
  ].join(" · ");
  content.append(title, meta);

  if (payer.description) {
    const description = document.createElement("small");
    description.textContent = payer.description;
    content.appendChild(description);
  }

  actions.className = "admin-actions compact-actions";

  editButton.type = "button";
  editButton.className = "admin-action-button icon-action";
  editButton.dataset.financialPayerAction = "edit";
  editButton.dataset.financialPayerId = payer.id;
  editButton.append(createIcon("edit"), document.createTextNode("Editar"));

  deleteButton.type = "button";
  deleteButton.className = "admin-action-button danger icon-action";
  deleteButton.dataset.financialPayerAction = "delete";
  deleteButton.dataset.financialPayerId = payer.id;
  deleteButton.append(createIcon("trash-2"), document.createTextNode("Excluir"));

  actions.append(editButton, deleteButton);
  item.append(swatch, content, actions);

  return item;
}

function renderFinancialPayerManagerList() {
  financialPayerList.replaceChildren();

  if (!cachedPayers.length) {
    const empty = document.createElement("div");
    empty.className = "admin-empty-state";
    empty.textContent = "Nenhum pagador financeiro cadastrado.";
    financialPayerList.appendChild(empty);
    return;
  }

  cachedPayers.forEach((payer) => {
    financialPayerList.appendChild(createPayerManagerItem(payer));
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function openFinancialPayerModal(payer = null) {
  resetFinancialPayerForm();
  if (payer) {
    selectedFinancialPayerId = payer.id;
    financialPayerNameInput.value = payer.name || "";
    financialPayerDescriptionInput.value = payer.description || "";
    financialPayerColorInput.value = isSafeHexColor(payer.color)
      ? payer.color
      : DEFAULT_BRAND_COLOR;
    financialPayerIconInput.value = payer.icon || "user";
    updateFinancialPayerIconPreview();
    financialPayerOrderInput.value = Number(payer.display_order || 0);
    financialPayerActiveInput.checked = Boolean(payer.is_active);
    cancelFinancialPayerEditButton.classList.remove("is-hidden");
  }
  if (financialPayerModalTitle) {
    financialPayerModalTitle.textContent = payer ? "Editar Pagador" : "Novo Pagador";
  }
  financialPayerModal.classList.add("active");
  financialPayerModal.setAttribute("aria-hidden", "false");
  financialPayerNameInput.focus();
}

function closeFinancialPayerModal() {
  financialPayerModal.classList.remove("active");
  financialPayerModal.setAttribute("aria-hidden", "true");
  resetFinancialPayerForm();
}

async function saveFinancialPayer(event) {
  event.preventDefault();

  const { data, error } = await supabaseClient.rpc("admin_save_financial_payer", {
    submitted_color: financialPayerColorInput.value || DEFAULT_BRAND_COLOR,
    submitted_description: financialPayerDescriptionInput.value,
    submitted_display_order:
      financialPayerOrderInput.value === ""
        ? getNextFinancialPayerOrder()
        : Number(financialPayerOrderInput.value || 0),
    submitted_icon: financialPayerIconInput.value || "user",
    submitted_is_active: financialPayerActiveInput.checked,
    submitted_name: financialPayerNameInput.value,
    target_payer_id: selectedFinancialPayerId,
  });

  if (error || !data?.length) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar o pagador");
    return;
  }

  showAdminToast(
    selectedFinancialPayerId ? "💜 Pagador atualizado!" : "💜 Pagador criado!",
  );
  closeFinancialPayerModal();
  resetFinancialPayerForm();
  await loadFinancialData();
}

async function deleteFinancialPayer(payerId) {
  const payer = getPayerById(payerId);
  const expenseCount = Number(payer?.expense_count || 0);
  const paymentCount = Number(payer?.payment_count || 0);

  if (
    !confirm(
      "Deseja excluir este pagador? Pagadores usados em gastos ou parcelas não podem ser excluídos.",
    )
  ) {
    return;
  }

  if (expenseCount > 0 || paymentCount > 0) {
    showAdminToast(
      "⚠️ Pagador em uso. Desative em vez de excluir para preservar o histórico.",
    );
    return;
  }

  const { data, error } = await supabaseClient.rpc("admin_delete_financial_payer", {
    target_payer_id: payerId,
  });

  if (error || data !== true) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível excluir o pagador");
    return;
  }

  showAdminToast("💜 Pagador excluído!");
  await loadFinancialData();
}

async function saveFinancialCategory(event) {
  event.preventDefault();

  const { data, error } = await supabaseClient.rpc("admin_save_financial_category", {
    submitted_color: financialCategoryColorInput.value || DEFAULT_BRAND_COLOR,
    submitted_context: financialCategoryContextInput.value,
    submitted_display_order:
      financialCategoryOrderInput.value === ""
        ? getNextFinancialCategoryOrder()
        : Number(financialCategoryOrderInput.value || 0),
    submitted_icon: financialCategoryIconInput.value || "wallet",
    submitted_is_active: financialCategoryActiveInput.checked,
    submitted_name: financialCategoryNameInput.value,
    target_category_id: selectedFinancialCategoryId,
  });

  if (error || !data?.length) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar a categoria financeira");
    return;
  }

  showAdminToast(
    selectedFinancialCategoryId
      ? "💜 Categoria financeira atualizada!"
      : "💜 Categoria financeira criada!",
  );
  closeFinancialCategoryModal();
  resetFinancialCategoryForm();
  await loadFinancialData();
}

async function deleteFinancialCategory(categoryId) {
  const category = getCategoryById(categoryId);
  const budgetItemCount = Number(category?.budget_item_count || 0);
  const expenseCount = Number(category?.expense_count || 0);

  if (
    !confirm(
      "Deseja excluir esta categoria financeira? Categorias usadas em orçamento ou gastos não podem ser excluídas.",
    )
  ) {
    return;
  }

  if (budgetItemCount > 0 || expenseCount > 0) {
    showAdminToast(
      "⚠️ Categoria em uso. Desative em vez de excluir para preservar o histórico.",
    );
    return;
  }

  const { data, error } = await supabaseClient.rpc("admin_delete_financial_category", {
    target_category_id: categoryId,
  });

  if (error || data !== true) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível excluir a categoria financeira");
    return;
  }

  showAdminToast("💜 Categoria financeira excluída!");
  await loadFinancialData();
}

function populateFinancialBudgetScenarioSelect(selectedScenarioId = "") {
  const scenarios = getAvailableBudgetScenarios();
  const preferredContext = activeContext === "all" ? "wedding" : activeContext;
  const filteredScenarioId =
    selectedBudgetScenarioFilter && selectedBudgetScenarioFilter !== "__reference__"
      ? selectedBudgetScenarioFilter
      : "";
  const preferredScenario =
    selectedScenarioId ||
    filteredScenarioId ||
    scenarios.find((scenario) => scenario.context === preferredContext && scenario.is_reference)
      ?.id ||
    scenarios.find((scenario) => scenario.context === preferredContext)?.id ||
    scenarios.find((scenario) => scenario.is_reference)?.id ||
    scenarios[0]?.id ||
    "";

  financialBudgetScenarioInput.replaceChildren();
  scenarios.forEach((scenario) => {
    financialBudgetScenarioInput.appendChild(
      new Option(
        `${scenario.name || "-"} · ${getContextLabel(scenario.context)}${
          scenario.is_reference ? " · Referência" : ""
        }`,
        scenario.id,
      ),
    );
  });

  financialBudgetScenarioInput.value = scenarios.some(
    (scenario) => scenario.id === preferredScenario,
  )
    ? preferredScenario
    : scenarios[0]?.id || "";
}

function populateFinancialBudgetCategorySelect(selectedCategoryId = "") {
  const categories = getAvailableBudgetCategories(financialBudgetScenarioInput.value);
  const preferredCategory = categories.some(
    (category) => category.id === selectedCategoryId,
  )
    ? selectedCategoryId
    : categories[0]?.id || "";

  financialBudgetCategoryInput.replaceChildren();
  categories.forEach((category) => {
    financialBudgetCategoryInput.appendChild(
      new Option(
        `${category.name || "-"} · ${getContextLabel(category.context)}`,
        category.id,
      ),
    );
  });
  financialBudgetCategoryInput.value = preferredCategory;
}

function resetFinancialBudgetItemForm() {
  selectedFinancialBudgetItemId = null;
  financialBudgetItemForm.reset();
  financialBudgetItemModalTitle.textContent = "Novo Item Previsto";
  populateFinancialBudgetScenarioSelect();
  populateFinancialBudgetCategorySelect();
  financialBudgetTitleInput.value = "";
  financialBudgetAmountInput.value = formatCurrencyInputFromNumber(0);
  financialBudgetPriorityInput.value = "normal";
  financialBudgetStatusInput.value = "planned";
  financialBudgetOrderInput.value = financialBudgetScenarioInput.value
    ? getNextFinancialBudgetItemOrder(financialBudgetScenarioInput.value)
    : "";
  financialBudgetVendorInput.value = "";
  financialBudgetNotesInput.value = "";
  financialBudgetActiveInput.checked = true;
  deleteFinancialBudgetItemButton.hidden = true;
  deleteFinancialBudgetItemButton.classList.add("is-hidden");
}

function openFinancialBudgetItemModal(item = null) {
  resetFinancialBudgetItemForm();

  if (item) {
    selectedFinancialBudgetItemId = item.id;
    financialBudgetItemModalTitle.textContent = "Editar Item Previsto";
    populateFinancialBudgetScenarioSelect(item.scenario_id);
    populateFinancialBudgetCategorySelect(item.category_id);
    financialBudgetTitleInput.value = item.title || "";
    financialBudgetAmountInput.value = formatCurrencyInputFromNumber(
      item.estimated_amount,
    );
    financialBudgetPriorityInput.value = item.priority || "normal";
    financialBudgetStatusInput.value = item.status || "planned";
    financialBudgetOrderInput.value = Number(item.display_order || 0);
    financialBudgetVendorInput.value = item.expected_vendor_name || "";
    financialBudgetNotesInput.value = item.notes || "";
    financialBudgetActiveInput.checked = Boolean(item.is_active);
    deleteFinancialBudgetItemButton.hidden = false;
    deleteFinancialBudgetItemButton.classList.remove("is-hidden");
  }

  financialBudgetItemModal.classList.add("active");
  financialBudgetItemModal.setAttribute("aria-hidden", "false");
  financialBudgetTitleInput.focus();
}

function closeFinancialBudgetItemModal() {
  financialBudgetItemModal.classList.remove("active");
  financialBudgetItemModal.setAttribute("aria-hidden", "true");
  resetFinancialBudgetItemForm();
}

async function saveFinancialBudgetItem(event) {
  event.preventDefault();

  if (!financialBudgetScenarioInput.value || !financialBudgetCategoryInput.value) {
    showAdminToast("⚠️ Cadastre cenário e categoria antes de salvar o item");
    return;
  }

  const { data, error } = await supabaseClient.rpc("admin_save_financial_budget_item", {
    submitted_category_id: financialBudgetCategoryInput.value,
    submitted_display_order:
      financialBudgetOrderInput.value === ""
        ? getNextFinancialBudgetItemOrder(financialBudgetScenarioInput.value)
        : Number(financialBudgetOrderInput.value || 0),
    submitted_estimated_amount: parseCurrencyInputValue(
      financialBudgetAmountInput.value,
    ),
    submitted_expected_vendor_name: financialBudgetVendorInput.value,
    submitted_is_active: financialBudgetActiveInput.checked,
    submitted_notes: financialBudgetNotesInput.value,
    submitted_priority: financialBudgetPriorityInput.value || "normal",
    submitted_scenario_id: financialBudgetScenarioInput.value,
    submitted_status: financialBudgetStatusInput.value || "planned",
    submitted_title: financialBudgetTitleInput.value,
    target_item_id: selectedFinancialBudgetItemId,
  });

  if (error || !data?.length) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar o item previsto");
    return;
  }

  showAdminToast(
    selectedFinancialBudgetItemId
      ? "💜 Item previsto atualizado!"
      : "💜 Item previsto criado!",
  );
  closeFinancialBudgetItemModal();
  await loadFinancialData();
}

async function deleteFinancialBudgetItem(itemId = selectedFinancialBudgetItemId) {
  if (!itemId) {
    return;
  }

  if (!confirm("Deseja excluir este item previsto?")) {
    return;
  }

  const { data, error } = await supabaseClient.rpc("admin_delete_financial_budget_item", {
    target_item_id: itemId,
  });

  if (error || data !== true) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível excluir o item previsto");
    return;
  }

  showAdminToast("💜 Item previsto excluído!");
  closeFinancialBudgetItemModal();
  await loadFinancialData();
}

function populateFinancialExpenseCategorySelect(selectedCategoryId = "") {
  const categories = getAvailableExpenseCategories(financialExpenseContextInput.value);
  const preferredCategory = categories.some(
    (category) => category.id === selectedCategoryId,
  )
    ? selectedCategoryId
    : categories[0]?.id || "";

  financialExpenseCategoryInput.replaceChildren();
  categories.forEach((category) => {
    financialExpenseCategoryInput.appendChild(
      new Option(
        `${category.name || "-"} · ${getContextLabel(category.context)}`,
        category.id,
      ),
    );
  });
  financialExpenseCategoryInput.value = preferredCategory;
}

function populateFinancialExpenseBudgetItemSelect(selectedBudgetItemId = "") {
  if (!financialExpenseBudgetItemInput) {
    return;
  }

  const selectedContext = financialExpenseContextInput?.value || getInitialExpenseContext();
  const budgetItems = cachedBudgetItems
    .filter(
      (item) =>
        item.context === selectedContext &&
        (item.is_active || item.id === selectedBudgetItemId),
    )
    .sort((first, second) => {
      if (first.scenario_is_reference !== second.scenario_is_reference) {
        return first.scenario_is_reference ? -1 : 1;
      }

      return sortBudgetItemsByOrder(first, second);
    });

  financialExpenseBudgetItemInput.replaceChildren();
  financialExpenseBudgetItemInput.appendChild(
    new Option("Sem item previsto vinculado", ""),
  );

  budgetItems.forEach((item) => {
    const scenarioLabel = item.scenario_name ? ` · ${item.scenario_name}` : "";
    const categoryLabel = item.category_name ? ` · ${item.category_name}` : "";

    financialExpenseBudgetItemInput.appendChild(
      new Option(
        `${item.title || "-"} · ${formatCurrency(item.estimated_amount)}${scenarioLabel}${categoryLabel}`,
        item.id,
      ),
    );
  });

  financialExpenseBudgetItemInput.value = budgetItems.some(
    (item) => item.id === selectedBudgetItemId,
  )
    ? selectedBudgetItemId
    : "";
}

function populateFinancialExpensePayerSelect(selectedPayerId = "") {
  const payers = cachedPayers
    .filter((payer) => payer.is_active || payer.id === selectedPayerId)
    .sort(compareFinancialOrderItems);

  financialExpensePayerInput.replaceChildren();
  financialExpensePayerInput.appendChild(new Option("Sem pagador principal", ""));
  payers.forEach((payer) => {
    financialExpensePayerInput.appendChild(new Option(payer.name || "-", payer.id));
  });
  financialExpensePayerInput.value = payers.some((payer) => payer.id === selectedPayerId)
    ? selectedPayerId
    : "";
}

function populateFinancialExpenseVendorSelect(selectedVendorId = "") {
  const vendors = cachedVendors
    .filter((vendor) => vendor.is_visible !== false || vendor.id === selectedVendorId)
    .sort((first, second) =>
      String(first.name || "").localeCompare(String(second.name || ""), "pt-BR", {
        numeric: true,
        sensitivity: "base",
      }),
    );

  financialExpenseVendorInput.replaceChildren();
  financialExpenseVendorInput.appendChild(new Option("Sem fornecedor vinculado", ""));
  vendors.forEach((vendor) => {
    financialExpenseVendorInput.appendChild(
      new Option(`${vendor.name || "-"} · ${vendor.category || "-"}`, vendor.id),
    );
  });
  financialExpenseVendorInput.value = vendors.some(
    (vendor) => vendor.id === selectedVendorId,
  )
    ? selectedVendorId
    : "";
}

function getNextFinancialPaymentInstallmentNumber(expenseId = selectedFinancialExpenseId) {
  const highestInstallment = getPaymentsByExpenseId(expenseId).reduce(
    (highest, payment) =>
      Math.max(highest, Number(payment.installment_number || 0)),
    0,
  );

  return highestInstallment + 1;
}

function populateFinancialPaymentPayerSelect(selectedPayerId = "") {
  const expense = getExpenseById(selectedFinancialExpenseId);
  const preferredPayerId = selectedPayerId || expense?.default_payer_id || "";
  const payers = cachedPayers
    .filter((payer) => payer.is_active || payer.id === preferredPayerId)
    .sort(compareFinancialOrderItems);

  financialPaymentPayerInput.replaceChildren();
  financialPaymentPayerInput.appendChild(new Option("Sem pagador definido", ""));
  payers.forEach((payer) => {
    financialPaymentPayerInput.appendChild(new Option(payer.name || "-", payer.id));
  });
  financialPaymentPayerInput.value = payers.some(
    (payer) => payer.id === preferredPayerId,
  )
    ? preferredPayerId
    : "";
}

function updateFinancialPaymentPaidAtState() {
  const isPaid = financialPaymentStatusInput.value === "paid";
  financialPaymentPaidAtInput.disabled = !isPaid;

  if (
    isPaid &&
    !financialPaymentPaidAtInput.value &&
    financialPaymentDueDateInput.value
  ) {
    financialPaymentPaidAtInput.value = financialPaymentDueDateInput.value;
  }

  if (!isPaid) {
    financialPaymentPaidAtInput.value = "";
  }
}

function setFinancialPaymentGeneratePaidVisibility(isVisible) {
  if (!financialPaymentGeneratePaidGroup || !financialPaymentGeneratePaidInput) {
    return;
  }

  financialPaymentGeneratePaidGroup.hidden = !isVisible;
  financialPaymentGeneratePaidGroup.classList.toggle("is-hidden", !isVisible);
  financialPaymentGeneratePaidInput.disabled = !isVisible;

  if (!isVisible) {
    financialPaymentGeneratePaidInput.checked = false;
  }
}

function updateFinancialPaymentGeneratorState() {
  const paymentMethod = financialExpensePaymentMethodInput.value || "custom";
  const isCash = paymentMethod === "cash";
  const isInstallments = paymentMethod === "installments";
  const isDepositInstallments = paymentMethod === "deposit_installments";

  financialPaymentEntryGroup.classList.toggle("is-hidden", !isDepositInstallments);
  financialPaymentEntryDueDateGroup.classList.toggle(
    "is-hidden",
    !isDepositInstallments,
  );
  financialPaymentInstallmentsGroup.classList.toggle(
    "is-hidden",
    !(isInstallments || isDepositInstallments),
  );
  financialPaymentDueIntervalGroup.classList.toggle("is-hidden", isCash);
  setFinancialPaymentGeneratePaidVisibility(isCash);
  financialPaymentFirstDueDateLabel.textContent = isCash
    ? "Vencimento do pagamento"
    : isDepositInstallments
      ? "Primeiro vencimento das parcelas"
      : "Primeiro vencimento";

  if (isCash) {
    financialPaymentInstallmentsCountInput.value = "1";
    financialPaymentEntryAmountInput.value = formatCurrencyInputFromNumber(0);
    financialPaymentEntryDueDateInput.value = "";
    financialPaymentDueIntervalInput.value = "none";
  }

  if (paymentMethod === "custom") {
    financialPaymentInstallmentsCountInput.value =
      financialPaymentInstallmentsCountInput.value || "1";
  }

  generateFinancialPaymentsButton.textContent = isCash
    ? "Gerar Parcela Única"
    : "Gerar Parcelas";
}

function resetFinancialPaymentForm() {
  selectedFinancialPaymentId = null;
  financialPaymentIdInput.value = "";
  financialPaymentInstallmentInput.value = selectedFinancialExpenseId
    ? getNextFinancialPaymentInstallmentNumber()
    : "1";
  financialPaymentLabelInput.value = "";
  financialPaymentAmountInput.value = formatCurrencyInputFromNumber(0);
  financialPaymentDueDateInput.value = "";
  financialPaymentStatusInput.value = "unpaid";
  financialPaymentPaidAtInput.value = "";
  populateFinancialPaymentPayerSelect();
  financialPaymentNotesInput.value = "";
  cancelFinancialPaymentEditButton.classList.add("is-hidden");
  updateFinancialPaymentPaidAtState();
}

function createFinancialExpensePaymentCard(payment) {
  const card = document.createElement("article");
  const header = document.createElement("div");
  const titleGroup = document.createElement("div");
  const title = document.createElement("strong");
  const subtitle = document.createElement("span");
  const meta = document.createElement("div");
  const actions = document.createElement("div");
  const status = payment.display_status || payment.status;
  const installmentLabel = payment.installment_number
    ? `Parcela ${payment.installment_number}`
    : "Parcela";
  const canQuickPay = payment.status !== "paid" && payment.status !== "cancelled";

  card.className = "financial-expense-payment-card";
  header.className = "financial-expense-payment-card-header";
  titleGroup.className = "financial-expense-payment-card-title-group";
  title.className = "financial-expense-payment-card-title";
  subtitle.className = "financial-expense-payment-card-subtitle";
  meta.className = "financial-expense-payment-card-meta";
  actions.className = "financial-expense-payment-card-actions";

  title.textContent = payment.label || installmentLabel;
  subtitle.textContent = payment.label ? installmentLabel : "Pagamento do gasto";

  titleGroup.append(title, subtitle);
  header.append(
    titleGroup,
    createBadge(getStatusLabel(status, PAYMENT_STATUS_LABELS), status),
  );

  [
    ["Valor", formatCurrency(payment.amount)],
    ["Vencimento", formatDate(payment.due_date)],
    ["Pagador", payment.payer_name || "A definir"],
    ["Pago em", payment.paid_at ? formatDate(payment.paid_at) : "Ainda não pago"],
  ].forEach(([label, value]) => {
    const item = document.createElement("span");
    const itemLabel = document.createElement("small");
    const itemValue = document.createElement("strong");

    item.className = "financial-expense-payment-card-meta-item";
    itemLabel.textContent = label;
    itemValue.textContent = value;
    item.append(itemLabel, itemValue);
    meta.appendChild(item);
  });

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "checklist-period-action";
  editButton.dataset.financialPaymentAction = "edit";
  editButton.dataset.financialPaymentId = payment.id;
  editButton.setAttribute("aria-label", `Editar ${payment.label || installmentLabel}`);
  editButton.title = "Editar parcela";
  editButton.appendChild(createIcon("edit-2"));

  if (canQuickPay) {
    const quickPaidButton = document.createElement("button");
    quickPaidButton.type = "button";
    quickPaidButton.className = "checklist-period-action financial-quick-payment-action";
    quickPaidButton.dataset.financialPaymentAction = "quick-paid";
    quickPaidButton.dataset.financialPaymentId = payment.id;
    quickPaidButton.setAttribute(
      "aria-label",
      `Marcar ${payment.label || installmentLabel} como paga`,
    );
    quickPaidButton.title = "Marcar como paga";
    quickPaidButton.appendChild(createIcon("check"));
    actions.appendChild(quickPaidButton);
  }

  actions.appendChild(editButton);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "checklist-period-action danger";
  deleteButton.dataset.financialPaymentAction = "delete";
  deleteButton.dataset.financialPaymentId = payment.id;
  deleteButton.setAttribute("aria-label", `Excluir ${payment.label || installmentLabel}`);
  deleteButton.title = "Excluir parcela";
  deleteButton.appendChild(createIcon("trash-2"));
  actions.appendChild(deleteButton);

  card.append(header, meta, actions);

  if (payment.notes) {
    const notes = document.createElement("p");
    notes.className = "financial-expense-payment-card-notes";
    notes.textContent = payment.notes;
    card.insertBefore(notes, actions);
  }

  return card;
}

function updateFinancialPaymentDisclosures(payments) {
  const hasPayments = payments.length > 0;
  const shouldOpenActions = !hasPayments;

  if (financialPaymentGeneratorDisclosure) {
    financialPaymentGeneratorDisclosure.open = shouldOpenActions;
  }
}

function renderFinancialExpensePayments() {
  const hasSelectedExpense = Boolean(selectedFinancialExpenseId);
  const payments = hasSelectedExpense
    ? getPaymentsByExpenseId(selectedFinancialExpenseId)
    : [];
  const totalPayments = payments
    .filter((payment) => payment.status !== "cancelled")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  financialExpensePaymentsSection.classList.toggle(
    "is-hidden",
    !hasSelectedExpense,
  );
  financialExpensePaymentsHint.classList.add("is-hidden");
  financialPaymentGenerator.classList.toggle("is-hidden", !hasSelectedExpense);
  updateFinancialPaymentDisclosures(payments);
  setText(
    "financialExpensePaymentsSummary",
    `Total das parcelas: ${formatCurrency(totalPayments)}`,
  );
  financialExpensePaymentsTableBody.replaceChildren();

  if (!hasSelectedExpense) {
    const empty = document.createElement("p");
    empty.className = "admin-muted financial-empty-card";
    empty.textContent = "Salve o gasto real para cadastrar parcelas.";
    financialExpensePaymentsTableBody.appendChild(empty);
    return;
  }

  if (!payments.length) {
    const empty = document.createElement("p");
    empty.className = "admin-muted financial-empty-card";
    empty.textContent = "Nenhuma parcela cadastrada para este gasto.";
    financialExpensePaymentsTableBody.appendChild(empty);
    return;
  }

  payments.forEach((payment) => {
    financialExpensePaymentsTableBody.appendChild(
      createFinancialExpensePaymentCard(payment),
    );
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function openFinancialPaymentModal(payment = null) {
  if (payment?.expense_id) {
    selectedFinancialExpenseId = payment.expense_id;
  }

  if (!selectedFinancialExpenseId) {
    showAdminToast("⚠️ Salve o gasto real antes de cadastrar parcelas");
    return;
  }

  resetFinancialPaymentForm();
  cancelFinancialPaymentEditButton.classList.remove("is-hidden");

  if (payment) {
    selectedFinancialPaymentId = payment.id;
    financialPaymentIdInput.value = payment.id;
    financialPaymentInstallmentInput.value = Number(payment.installment_number || 1);
    financialPaymentLabelInput.value = payment.label || "";
    financialPaymentAmountInput.value = formatCurrencyInputFromNumber(payment.amount);
    financialPaymentDueDateInput.value = payment.due_date || "";
    financialPaymentStatusInput.value = payment.status || "unpaid";
    financialPaymentPaidAtInput.value = payment.paid_at || "";
    populateFinancialPaymentPayerSelect(payment.payer_id);
    financialPaymentNotesInput.value = payment.notes || "";
    cancelFinancialPaymentEditButton.classList.remove("is-hidden");
  }

  if (financialPaymentModalTitle) {
    financialPaymentModalTitle.textContent = payment
      ? "Editar Parcela"
      : "Nova Parcela";
  }

  updateFinancialPaymentPaidAtState();
  financialPaymentModal?.classList.add("active");
  financialPaymentModal?.setAttribute("aria-hidden", "false");
  financialPaymentInstallmentInput.focus();
}

function closeFinancialPaymentModal() {
  financialPaymentModal?.classList.remove("active");
  financialPaymentModal?.setAttribute("aria-hidden", "true");
  resetFinancialPaymentForm();
}

function getGeneratedPaymentDueDate(firstDueDate, index) {
  const interval = financialPaymentDueIntervalInput.value || "monthly";

  if (!firstDueDate) {
    return null;
  }

  if (interval === "weekly") {
    return addDaysToISODate(firstDueDate, index * 7);
  }

  if (interval === "none") {
    return firstDueDate;
  }

  return addMonthsToISODate(firstDueDate, index);
}

function buildGeneratedPayments() {
  const paymentMethod = financialExpensePaymentMethodInput.value || "custom";
  const totalCents = toCurrencyCents(financialExpenseAmountInput.value);
  const firstDueDate = financialPaymentFirstDueDateInput.value || null;
  const entryDueDate = financialPaymentEntryDueDateInput.value || null;
  const defaultPayerId = financialExpensePayerInput.value || null;

  if (totalCents <= 0) {
    showAdminToast("⚠️ Informe o valor total do gasto antes de gerar parcelas");
    return [];
  }

  if (paymentMethod === "cash") {
    const shouldGeneratePaid = financialPaymentGeneratePaidInput.checked;

    return [
      {
        amount: fromCurrencyCents(totalCents),
        dueDate: firstDueDate,
        installmentNumber: 1,
        label: "Pagamento à vista",
        paidAt: shouldGeneratePaid ? firstDueDate : null,
        payerId: defaultPayerId,
        status: shouldGeneratePaid ? "paid" : "unpaid",
      },
    ];
  }

  const installmentCount = Math.max(
    1,
    Number(financialPaymentInstallmentsCountInput.value || 1),
  );

  if (paymentMethod === "deposit_installments") {
    const entryCents = toCurrencyCents(financialPaymentEntryAmountInput.value);

    if (entryCents < 0 || entryCents >= totalCents) {
      showAdminToast("⚠️ A entrada precisa ser menor que o valor total");
      return [];
    }

    const remainingCents = totalCents - entryCents;
    const installmentValues = splitCurrencyCents(remainingCents, installmentCount);
    const generatedPayments = [];

    if (entryCents > 0) {
      generatedPayments.push({
        amount: fromCurrencyCents(entryCents),
        dueDate: entryDueDate,
        installmentNumber: 1,
        label: "Entrada",
        paidAt: null,
        payerId: defaultPayerId,
        status: "unpaid",
      });
    }

    installmentValues.forEach((amountCents, index) => {
      generatedPayments.push({
        amount: fromCurrencyCents(amountCents),
        dueDate: getGeneratedPaymentDueDate(firstDueDate, index),
        installmentNumber: generatedPayments.length + 1,
        label: `Parcela ${index + 1}`,
        paidAt: null,
        payerId: defaultPayerId,
        status: "unpaid",
      });
    });

    return generatedPayments;
  }

  const installmentValues = splitCurrencyCents(totalCents, installmentCount);

  return installmentValues.map((amountCents, index) => ({
    amount: fromCurrencyCents(amountCents),
    dueDate: getGeneratedPaymentDueDate(firstDueDate, index),
    installmentNumber: index + 1,
    label: installmentCount === 1 ? "Parcela única" : `Parcela ${index + 1}`,
    paidAt: null,
    payerId: defaultPayerId,
    status: "unpaid",
  }));
}

async function generateFinancialPayments() {
  if (!selectedFinancialExpenseId) {
    showAdminToast("⚠️ Salve o gasto real antes de gerar parcelas");
    return;
  }

  const existingPayments = getPaymentsByExpenseId(selectedFinancialExpenseId);

  if (
    existingPayments.length &&
    !confirm(
      "Este gasto já tem parcelas cadastradas. Deseja adicionar novas parcelas mesmo assim?",
    )
  ) {
    return;
  }

  const generatedPayments = buildGeneratedPayments();

  if (!generatedPayments.length) {
    return;
  }

  for (const payment of generatedPayments) {
    const { error } = await supabaseClient.rpc(
      "admin_save_financial_expense_payment",
      {
        submitted_amount: payment.amount,
        submitted_due_date: payment.dueDate,
        submitted_expense_id: selectedFinancialExpenseId,
        submitted_installment_number: payment.installmentNumber,
        submitted_label: payment.label,
        submitted_notes: "",
        submitted_paid_at: payment.paidAt,
        submitted_payer_id: payment.payerId,
        submitted_status: payment.status || "unpaid",
        target_payment_id: null,
      },
    );

    if (error) {
      console.error(error);
      showAdminToast("⚠️ Não foi possível gerar todas as parcelas");
      await loadFinancialData();
      resetFinancialPaymentForm();
      renderFinancialExpensePayments();
      return;
    }
  }

  showAdminToast("💜 Parcelas geradas!");
  await loadFinancialData();
  resetFinancialPaymentForm();
  renderFinancialExpensePayments();
}

function resetFinancialExpenseForm() {
  selectedFinancialExpenseId = null;
  financialExpenseForm.reset();
  financialExpenseModalTitle.textContent = "Novo Gasto Real";
  financialExpenseContextInput.value = getInitialExpenseContext();
  populateFinancialExpenseCategorySelect();
  populateFinancialExpenseBudgetItemSelect();
  populateFinancialExpensePayerSelect();
  populateFinancialExpenseVendorSelect();
  financialExpenseTitleInput.value = "";
  financialExpenseAmountInput.value = formatCurrencyInputFromNumber(0);
  financialExpenseTypeInput.value = "supplier";
  financialExpensePaymentMethodInput.value = "custom";
  financialExpenseStatusInput.value = "planned";
  financialExpenseContractedAtInput.value = "";
  financialPaymentEntryAmountInput.value = formatCurrencyInputFromNumber(0);
  financialPaymentEntryDueDateInput.value = "";
  financialPaymentInstallmentsCountInput.value = "1";
  financialPaymentFirstDueDateInput.value = "";
  financialPaymentDueIntervalInput.value = "monthly";
  financialPaymentGeneratePaidInput.checked = false;
  financialExpenseDescriptionInput.value = "";
  financialExpenseReferenceUrlInput.value = "";
  financialExpenseNotesInput.value = "";
  financialExpenseActiveInput.checked = true;
  deleteFinancialExpenseButton.hidden = true;
  deleteFinancialExpenseButton.classList.add("is-hidden");
  updateFinancialPaymentGeneratorState();
  resetFinancialPaymentForm();
  renderFinancialExpensePayments();
}

function openFinancialExpenseModal(expense = null) {
  resetFinancialExpenseForm();

  if (expense) {
    selectedFinancialExpenseId = expense.id;
    financialExpenseModalTitle.textContent = "Editar Gasto Real";
    financialExpenseContextInput.value = expense.context || getInitialExpenseContext();
    populateFinancialExpenseCategorySelect(expense.category_id);
    populateFinancialExpenseBudgetItemSelect(expense.budget_item_id);
    populateFinancialExpensePayerSelect(expense.default_payer_id);
    populateFinancialExpenseVendorSelect(expense.vendor_id);
    financialExpenseTitleInput.value = expense.title || "";
    financialExpenseAmountInput.value = formatCurrencyInputFromNumber(
      expense.total_amount,
    );
    financialExpenseTypeInput.value = expense.type || "supplier";
    financialExpensePaymentMethodInput.value = expense.payment_method || "custom";
    financialExpenseStatusInput.value = expense.status || "planned";
    financialExpenseContractedAtInput.value = expense.contracted_at || "";
    financialExpenseDescriptionInput.value = expense.description || "";
    financialExpenseReferenceUrlInput.value = expense.reference_url || "";
    financialExpenseNotesInput.value = expense.notes || "";
    financialExpenseActiveInput.checked = Boolean(expense.is_active);
    deleteFinancialExpenseButton.hidden = false;
    deleteFinancialExpenseButton.classList.remove("is-hidden");
    updateFinancialPaymentGeneratorState();
    resetFinancialPaymentForm();
    renderFinancialExpensePayments();
  }

  financialExpenseModal.classList.add("active");
  financialExpenseModal.setAttribute("aria-hidden", "false");
  financialExpenseTitleInput.focus();
}

function closeFinancialExpenseModal() {
  closeFinancialPaymentModal();
  financialExpenseModal.classList.remove("active");
  financialExpenseModal.setAttribute("aria-hidden", "true");
  resetFinancialExpenseForm();
}

async function saveFinancialExpense(event) {
  event.preventDefault();
  const wasCreatingExpense = !selectedFinancialExpenseId;

  if (!financialExpenseCategoryInput.value) {
    showAdminToast("⚠️ Cadastre uma categoria antes de salvar o gasto");
    return;
  }

  const { data, error } = await supabaseClient.rpc("admin_save_financial_expense", {
    submitted_budget_item_id: financialExpenseBudgetItemInput?.value || null,
    submitted_category_id: financialExpenseCategoryInput.value,
    submitted_context: financialExpenseContextInput.value,
    submitted_contracted_at: financialExpenseContractedAtInput.value || null,
    submitted_default_payer_id: financialExpensePayerInput.value || null,
    submitted_description: financialExpenseDescriptionInput.value,
    submitted_is_active: financialExpenseActiveInput.checked,
    submitted_notes: financialExpenseNotesInput.value,
    submitted_payment_method: financialExpensePaymentMethodInput.value || "custom",
    submitted_reference_url: financialExpenseReferenceUrlInput.value,
    submitted_status: financialExpenseStatusInput.value || "planned",
    submitted_title: financialExpenseTitleInput.value,
    submitted_total_amount: parseCurrencyInputValue(
      financialExpenseAmountInput.value,
    ),
    submitted_type: financialExpenseTypeInput.value || "supplier",
    submitted_vendor_id: financialExpenseVendorInput.value || null,
    target_expense_id: selectedFinancialExpenseId,
  });

  if (error || !data?.length) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar o gasto real");
    return;
  }

  showAdminToast(
    selectedFinancialExpenseId ? "💜 Gasto real atualizado!" : "💜 Gasto real criado!",
  );

  if (wasCreatingExpense) {
    const savedExpenseId = data[0]?.id;
    await loadFinancialData();
    openFinancialExpenseModal(getExpenseById(savedExpenseId));
    return;
  }

  closeFinancialExpenseModal();
  await loadFinancialData();
}

function editFinancialPayment(payment) {
  if (!payment) {
    return;
  }

  openFinancialPaymentModal(payment);
}

async function saveFinancialPayment() {
  if (!selectedFinancialExpenseId) {
    showAdminToast("⚠️ Salve o gasto real antes de cadastrar parcelas");
    return;
  }

  const status = financialPaymentStatusInput.value || "unpaid";
  const { data, error } = await supabaseClient.rpc(
    "admin_save_financial_expense_payment",
    {
      submitted_amount: parseCurrencyInputValue(financialPaymentAmountInput.value),
      submitted_due_date: financialPaymentDueDateInput.value || null,
      submitted_expense_id: selectedFinancialExpenseId,
      submitted_installment_number: Number(
        financialPaymentInstallmentInput.value || 1,
      ),
      submitted_label: financialPaymentLabelInput.value,
      submitted_notes: financialPaymentNotesInput.value,
      submitted_paid_at:
        status === "paid" ? financialPaymentPaidAtInput.value || null : null,
      submitted_payer_id: financialPaymentPayerInput.value || null,
      submitted_status: status,
      target_payment_id: selectedFinancialPaymentId,
    },
  );

  if (error || !data?.length) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar a parcela");
    return;
  }

  showAdminToast(
    selectedFinancialPaymentId ? "💜 Parcela atualizada!" : "💜 Parcela criada!",
  );
  closeFinancialPaymentModal();
  await loadFinancialData();
}

async function deleteFinancialPayment(paymentId = selectedFinancialPaymentId) {
  if (!paymentId) {
    return;
  }

  if (!confirm("Deseja excluir esta parcela?")) {
    return;
  }

  const { data, error } = await supabaseClient.rpc(
    "admin_delete_financial_expense_payment",
    {
      target_payment_id: paymentId,
    },
  );

  if (error || data !== true) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível excluir a parcela");
    return;
  }

  showAdminToast("💜 Parcela excluída!");
  await loadFinancialData();
  resetFinancialPaymentForm();
  renderFinancialExpensePayments();
}

async function deleteFinancialExpense(expenseId = selectedFinancialExpenseId) {
  if (!expenseId) {
    return;
  }

  if (!confirm("Deseja excluir este gasto real? As parcelas vinculadas também serão removidas.")) {
    return;
  }

  const { data, error } = await supabaseClient.rpc("admin_delete_financial_expense", {
    target_expense_id: expenseId,
  });

  if (error || data !== true) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível excluir o gasto real");
    return;
  }

  showAdminToast("💜 Gasto real excluído!");
  closeFinancialExpenseModal();
  await loadFinancialData();
}

function renderFinancialPage() {
  updateContextTabs();
  updateSummaryCards();
  updateBudgetScenarioFilterOptions();
  renderPaymentsTable();
  renderExpensesTable();
  updateExpenseManagementFilters();
  applyPendingFinancialExpenseUrlFilters();
  renderAllExpensesTable();
  updatePaymentManagementFilters();
  renderAllPaymentsTable();
  updateBudgetManagementFilters();
  updateBudgetSummaryCards();
  renderBudgetTable();
  renderBaseLists();

  if (financialExpenseModal?.classList.contains("active")) {
    renderFinancialExpensePayments();
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function applyFinancialUrlFilters() {
  if (hasAppliedFinancialUrlContext) {
    return;
  }

  hasAppliedFinancialUrlContext = true;

  const params = getFinancialUrlParams();
  const context = params.get("context");
  const budgetItemId = params.get("budgetItem");

  if (["wedding", "honeymoon", "all"].includes(context)) {
    activeContext = context;
  }

  if (budgetItemId) {
    pendingFinancialExpenseBudgetItemFilter = budgetItemId;
  }
}

function applyPendingFinancialExpenseUrlFilters() {
  if (!pendingFinancialExpenseBudgetItemFilter) {
    return;
  }

  const budgetItemId = pendingFinancialExpenseBudgetItemFilter;
  const hasBudgetItemOption = Array.from(
    financialExpenseBudgetItemFilter?.options || [],
  ).some((option) => option.value === budgetItemId);

  pendingFinancialExpenseBudgetItemFilter = "";

  if (!hasBudgetItemOption) {
    return;
  }

  if (financialExpenseBudgetLinkFilter) {
    financialExpenseBudgetLinkFilter.value = "linked";
  }

  financialExpenseBudgetItemFilter.value = budgetItemId;
}

function getFinancialOrderContextOptions() {
  const type = financialOrderTypeInput.value;

  if (type === "scenarios") {
    return [
      ["wedding", "Casamento"],
      ["honeymoon", "Lua de Mel"],
    ];
  }

  if (type === "categories") {
    return [
      ["wedding", "Casamento"],
      ["honeymoon", "Lua de Mel"],
      ["both", "Compartilhado"],
    ];
  }

  return [];
}

function updateFinancialOrderContextOptions() {
  const currentValue = financialOrderContextInput.value;
  const options = getFinancialOrderContextOptions();

  financialOrderContextInput.replaceChildren();
  options.forEach(([value, label]) => {
    financialOrderContextInput.appendChild(new Option(label, value));
  });

  financialOrderContextGroup.classList.toggle(
    "is-hidden",
    !options.length,
  );

  if (options.some(([value]) => value === currentValue)) {
    financialOrderContextInput.value = currentValue;
    return;
  }

  if (options.some(([value]) => value === activeContext)) {
    financialOrderContextInput.value = activeContext;
    return;
  }

  financialOrderContextInput.value = options[0]?.[0] || "";
}

function setupInitialFinancialOrderSelection() {
  if (activeContext === "wedding" || activeContext === "honeymoon") {
    financialOrderTypeInput.value = "scenarios";
    updateFinancialOrderContextOptions();
    financialOrderContextInput.value = activeContext;
    return;
  }

  financialOrderTypeInput.value = "scenarios";
  updateFinancialOrderContextOptions();
}

function getFinancialOrderItems() {
  const type = financialOrderTypeInput.value;
  const context = financialOrderContextInput.value;

  if (type === "scenarios") {
    return cachedScenarios
      .filter((scenario) => scenario.context === context)
      .sort(compareFinancialOrderItems);
  }

  if (type === "categories") {
    return cachedCategories
      .filter((category) => category.context === context)
      .sort(compareFinancialOrderItems);
  }

  return [...cachedPayers].sort(compareFinancialOrderItems);
}

function getFinancialOrderItemLabel(item) {
  const type = financialOrderTypeInput.value;

  if (type === "scenarios") {
    return [
      getContextLabel(item.context),
      item.is_reference ? "Referência" : "Alternativo",
      item.is_active ? "Ativo" : "Inativo",
    ].join(" · ");
  }

  if (type === "categories") {
    return [
      getContextLabel(item.context),
      `${Number(item.budget_item_count || 0)} previstos`,
      `${Number(item.expense_count || 0)} gastos`,
      item.is_active ? "Ativa" : "Inativa",
    ].join(" · ");
  }

  return [
    `${Number(item.expense_count || 0)} gastos`,
    `${Number(item.payment_count || 0)} parcelas`,
    item.is_active ? "Ativo" : "Inativo",
  ].join(" · ");
}

function createFinancialOrderItem(item, index, orderedItems) {
  const row = document.createElement("article");
  const handle = document.createElement("span");
  const content = document.createElement("div");
  const title = document.createElement("strong");
  const meta = document.createElement("span");
  const actions = document.createElement("div");
  const upButton = document.createElement("button");
  const downButton = document.createElement("button");

  row.className = "vendor-order-item";
  row.draggable = true;
  row.dataset.financialOrderId = item.id;

  handle.className = "vendor-order-handle";
  handle.setAttribute("aria-hidden", "true");
  handle.appendChild(createIcon("grip-vertical"));

  title.className = "vendor-order-name";
  title.textContent = item.name || "-";
  meta.className = "vendor-order-category";
  meta.textContent = getFinancialOrderItemLabel(item);
  content.append(title, meta);

  actions.className = "vendor-order-actions";

  upButton.type = "button";
  upButton.className = "vendor-order-action";
  upButton.dataset.financialOrderAction = "up";
  upButton.dataset.financialOrderId = item.id;
  upButton.disabled = index === 0;
  upButton.setAttribute("aria-label", "Subir item");
  upButton.appendChild(createIcon("chevron-up"));

  downButton.type = "button";
  downButton.className = "vendor-order-action";
  downButton.dataset.financialOrderAction = "down";
  downButton.dataset.financialOrderId = item.id;
  downButton.disabled = index === orderedItems.length - 1;
  downButton.setAttribute("aria-label", "Descer item");
  downButton.appendChild(createIcon("chevron-down"));

  actions.append(upButton, downButton);
  row.append(handle, content, actions);

  return row;
}

function renderFinancialOrderModal() {
  const itemsById = new Map(getFinancialOrderItems().map((item) => [item.id, item]));
  const orderedItems = orderedFinancialBaseIds
    .map((itemId) => itemsById.get(itemId))
    .filter(Boolean);

  financialOrderList.replaceChildren();

  if (!orderedItems.length) {
    const empty = document.createElement("div");
    empty.className = "admin-empty-state";
    empty.textContent = "Nenhum item para organizar neste cadastro.";
    financialOrderList.appendChild(empty);
    return;
  }

  orderedItems.forEach((item, index) => {
    financialOrderList.appendChild(
      createFinancialOrderItem(item, index, orderedItems),
    );
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function resetFinancialOrderIds() {
  orderedFinancialBaseIds = getFinancialOrderItems().map((item) => item.id);
}

function openFinancialOrderModal() {
  setupInitialFinancialOrderSelection();
  resetFinancialOrderIds();
  renderFinancialOrderModal();
  financialOrderModal.classList.add("active");
  financialOrderModal.setAttribute("aria-hidden", "false");
}

function closeFinancialOrderModal() {
  financialOrderModal.classList.remove("active");
  financialOrderModal.setAttribute("aria-hidden", "true");
  orderedFinancialBaseIds = [];
  draggedFinancialOrderId = null;
}

function moveFinancialOrderItem(itemId, direction) {
  const currentIndex = orderedFinancialBaseIds.indexOf(itemId);
  const nextIndex = currentIndex + direction;

  if (
    currentIndex < 0 ||
    nextIndex < 0 ||
    nextIndex >= orderedFinancialBaseIds.length
  ) {
    return;
  }

  const nextOrder = [...orderedFinancialBaseIds];
  [nextOrder[currentIndex], nextOrder[nextIndex]] = [
    nextOrder[nextIndex],
    nextOrder[currentIndex],
  ];
  orderedFinancialBaseIds = nextOrder;
  renderFinancialOrderModal();
}

function reorderDraggedFinancialOrderItem(targetItemId, shouldInsertAfter) {
  if (!draggedFinancialOrderId || draggedFinancialOrderId === targetItemId) {
    return;
  }

  const nextOrder = orderedFinancialBaseIds.filter(
    (itemId) => itemId !== draggedFinancialOrderId,
  );
  const targetIndex = nextOrder.indexOf(targetItemId);

  if (targetIndex < 0) {
    return;
  }

  nextOrder.splice(
    targetIndex + (shouldInsertAfter ? 1 : 0),
    0,
    draggedFinancialOrderId,
  );
  orderedFinancialBaseIds = nextOrder;
  renderFinancialOrderModal();
}

async function saveFinancialOrder() {
  const type = financialOrderTypeInput.value;
  const context = financialOrderContextInput.value;
  let rpcName = "admin_reorder_financial_payers";
  let params = {
    submitted_payer_ids: orderedFinancialBaseIds,
  };

  if (type === "scenarios") {
    rpcName = "admin_reorder_financial_budget_scenarios";
    params = {
      submitted_context: context,
      submitted_scenario_ids: orderedFinancialBaseIds,
    };
  }

  if (type === "categories") {
    rpcName = "admin_reorder_financial_categories";
    params = {
      submitted_category_ids: orderedFinancialBaseIds,
      submitted_context: context,
    };
  }

  saveFinancialOrderButton.disabled = true;
  const { error } = await supabaseClient.rpc(rpcName, params);
  saveFinancialOrderButton.disabled = false;

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar a ordem");
    return;
  }

  showAdminToast("💜 Ordem salva!");
  closeFinancialOrderModal();
  await loadFinancialData();
}

async function loadFinancialData() {
  if (refreshFinancialButton) {
    refreshFinancialButton.disabled = true;
  }
  setLoadStatus("Carregando dados financeiros...", "loading");

  try {
    const requests = [
      {
        key: "summary",
        label: "Resumo financeiro",
        request: supabaseClient.rpc("admin_get_financial_summary", {
          target_context: "all",
        }),
      },
      {
        key: "scenarios",
        label: "Cenários",
        request: supabaseClient.rpc("admin_list_financial_budget_scenarios"),
      },
      {
        key: "categories",
        label: "Categorias",
        request: supabaseClient.rpc("admin_list_financial_categories"),
      },
      {
        key: "payers",
        label: "Pagadores",
        request: supabaseClient.rpc("admin_list_financial_payers"),
      },
      {
        key: "vendors",
        label: "Fornecedores",
        request: supabaseClient.rpc("admin_list_vendors"),
      },
      {
        key: "budgetItems",
        label: "Orçamento previsto",
        request: supabaseClient.rpc("admin_list_financial_budget_items"),
      },
      {
        key: "expenses",
        label: "Gastos",
        request: supabaseClient.rpc("admin_list_financial_expenses"),
      },
      {
        key: "payments",
        label: "Parcelas",
        request: supabaseClient.rpc("admin_list_financial_expense_payments"),
      },
    ];
    const responses = await Promise.all(
      requests.map(async ({ key, label, request }) => {
        try {
          const response = await request;

          return {
            data: response.data || [],
            error: response.error || null,
            key,
            label,
          };
        } catch (error) {
          return {
            data: [],
            error,
            key,
            label,
          };
        }
      }),
    );
    const dataByKey = Object.fromEntries(
      responses.map((response) => [response.key, response.data]),
    );
    const failedLabels = responses
      .filter((response) => response.error)
      .map((response) => {
        console.error(`Erro ao carregar ${response.label}:`, response.error);
        return response.label;
      });

    cachedSummaryRows = dataByKey.summary || [];
    cachedScenarios = dataByKey.scenarios || [];
    cachedCategories = dataByKey.categories || [];
    cachedPayers = dataByKey.payers || [];
    cachedVendors = dataByKey.vendors || [];
    cachedBudgetItems = dataByKey.budgetItems || [];
    cachedExpenses = dataByKey.expenses || [];
    cachedPayments = dataByKey.payments || [];

    applyFinancialUrlFilters();
    renderFinancialPage();

    if (failedLabels.length) {
      setLoadStatus(
        `Alguns dados não foram carregados: ${failedLabels.join(", ")}.`,
        "error",
      );
      showAdminToast("⚠️ Alguns dados financeiros não foram carregados");
      return;
    }

    setLoadStatus("");
  } catch (error) {
    console.error(error);
    setLoadStatus("Não foi possível carregar os dados financeiros.", "error");
    showAdminToast("⚠️ Erro ao carregar financeiro");
  } finally {
    if (refreshFinancialButton) {
      refreshFinancialButton.disabled = false;
    }
  }
}

function focusActiveFinancialModuleTab() {
  const tabs = document.querySelector(".financial-module-tabs");
  const activeTab = tabs?.querySelector(".active");

  if (!tabs || !activeTab) {
    return;
  }

  window.requestAnimationFrame(() => {
    activeTab.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  });
}

financialContextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeContext = button.dataset.financialContext || "all";
    updateBudgetScenarioFilterOptions({ reset: true });
    renderFinancialPage();
  });
});

financialBudgetScenarioFilter?.addEventListener("change", () => {
  selectedBudgetScenarioFilter = financialBudgetScenarioFilter.value;
  updateBudgetManagementFilters();
  updateBudgetSummaryCards();
  renderBudgetTable();
});

[
  financialBudgetSearchInput,
  financialBudgetCategoryFilter,
  financialBudgetStatusFilter,
  financialBudgetActiveFilter,
  financialBudgetBalanceFilter,
].forEach((filter) => {
  filter?.addEventListener("input", renderBudgetTable);
  filter?.addEventListener("change", renderBudgetTable);
});
clearFinancialBudgetFiltersButton?.addEventListener(
  "click",
  clearFinancialBudgetFilters,
);

refreshFinancialButton?.addEventListener("click", () => {
  loadFinancialData();
});

newBudgetItemButton?.addEventListener("click", () => {
  openFinancialBudgetItemModal();
});

financialBudgetAmountInput?.addEventListener("input", () => {
  applyCurrencyInputMask(financialBudgetAmountInput);
});
financialBudgetAmountInput?.addEventListener("blur", () => {
  applyCurrencyInputMask(financialBudgetAmountInput);
});
[
  financialExpenseAmountInput,
  financialPaymentEntryAmountInput,
  financialPaymentAmountInput,
].forEach((input) => {
  input?.addEventListener("input", () => {
    applyCurrencyInputMask(input);
  });
  input?.addEventListener("blur", () => {
    applyCurrencyInputMask(input);
  });
});

newExpenseButton?.addEventListener("click", () => {
  openFinancialExpenseModal();
});

closeFinancialBudgetItemModalButton?.addEventListener(
  "click",
  closeFinancialBudgetItemModal,
);
financialBudgetItemForm?.addEventListener("submit", saveFinancialBudgetItem);
deleteFinancialBudgetItemButton?.addEventListener("click", () => {
  deleteFinancialBudgetItem();
});
financialBudgetScenarioInput?.addEventListener("change", () => {
  populateFinancialBudgetCategorySelect();
  financialBudgetOrderInput.value = getNextFinancialBudgetItemOrder(
    financialBudgetScenarioInput.value,
  );
});

financialBudgetTableBody?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-financial-budget-action]");

  if (button) {
    const item = getBudgetItemById(button.dataset.financialBudgetItemId);

    if (button.dataset.financialBudgetAction === "details" && item) {
      openFinancialBudgetItemDetailsModal(item);
      return;
    }

    if (button.dataset.financialBudgetAction === "edit" && item) {
      openFinancialBudgetItemModal(item);
      return;
    }

    if (button.dataset.financialBudgetAction === "delete") {
      deleteFinancialBudgetItem(button.dataset.financialBudgetItemId);
      return;
    }
  }

  const itemElement = event.target.closest("[data-financial-budget-item-id]");
  const item = itemElement
    ? getBudgetItemById(itemElement.dataset.financialBudgetItemId)
    : null;

  if (item) {
    openFinancialBudgetItemDetailsModal(item);
  }
});

financialBudgetTableBody?.addEventListener("keydown", (event) => {
  if (event.target.closest("[data-financial-budget-action]")) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const itemElement = event.target.closest("[data-financial-budget-item-id]");
  const item = itemElement
    ? getBudgetItemById(itemElement.dataset.financialBudgetItemId)
    : null;

  if (!item) {
    return;
  }

  event.preventDefault();
  openFinancialBudgetItemDetailsModal(item);
});

financialBudgetMobileList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-financial-budget-action]");

  if (button) {
    const item = getBudgetItemById(button.dataset.financialBudgetItemId);

    if (button.dataset.financialBudgetAction === "details" && item) {
      openFinancialBudgetItemDetailsModal(item);
      return;
    }

    if (button.dataset.financialBudgetAction === "delete") {
      deleteFinancialBudgetItem(button.dataset.financialBudgetItemId);
      return;
    }
  }

  const card = event.target.closest("[data-financial-budget-item-id]");
  const item = card ? getBudgetItemById(card.dataset.financialBudgetItemId) : null;

  if (item) {
    openFinancialBudgetItemDetailsModal(item);
  }
});

financialBudgetMobileList?.addEventListener("keydown", (event) => {
  if (event.target.closest("[data-financial-budget-action]")) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const card = event.target.closest("[data-financial-budget-item-id]");
  const item = card ? getBudgetItemById(card.dataset.financialBudgetItemId) : null;

  if (!item) {
    return;
  }

  event.preventDefault();
  openFinancialBudgetItemDetailsModal(item);
});

financialBudgetItemModal?.addEventListener("click", (event) => {
  if (event.target === financialBudgetItemModal) {
    closeFinancialBudgetItemModal();
  }
});

closeFinancialBudgetItemDetailsModalButton?.addEventListener(
  "click",
  closeFinancialBudgetItemDetailsModal,
);
financialBudgetItemDetailsModal?.addEventListener("click", (event) => {
  if (event.target === financialBudgetItemDetailsModal) {
    closeFinancialBudgetItemDetailsModal();
  }
});
editFinancialBudgetItemDetailsButton?.addEventListener("click", () => {
  const item = getBudgetItemById(selectedFinancialBudgetDetailsItemId);

  if (!item) {
    return;
  }

  closeFinancialBudgetItemDetailsModal();
  openFinancialBudgetItemModal(item);
});
deleteFinancialBudgetItemDetailsButton?.addEventListener("click", () => {
  const itemId = selectedFinancialBudgetDetailsItemId;

  if (!itemId) {
    return;
  }

  closeFinancialBudgetItemDetailsModal();
  deleteFinancialBudgetItem(itemId);
});

closeFinancialExpenseDetailsModalButton?.addEventListener(
  "click",
  closeFinancialExpenseDetailsModal,
);
financialExpenseDetailsModal?.addEventListener("click", (event) => {
  if (event.target === financialExpenseDetailsModal) {
    closeFinancialExpenseDetailsModal();
  }
});
editFinancialExpenseDetailsButton?.addEventListener("click", () => {
  const expense = getExpenseById(selectedFinancialExpenseDetailsId);

  if (!expense) {
    return;
  }

  closeFinancialExpenseDetailsModal();
  openFinancialExpenseModal(expense);
});
deleteFinancialExpenseDetailsButton?.addEventListener("click", () => {
  const expenseId = selectedFinancialExpenseDetailsId;

  if (!expenseId) {
    return;
  }

  closeFinancialExpenseDetailsModal();
  deleteFinancialExpense(expenseId);
});

closeFinancialExpenseModalButton?.addEventListener(
  "click",
  closeFinancialExpenseModal,
);
financialExpenseForm?.addEventListener("submit", saveFinancialExpense);
deleteFinancialExpenseButton?.addEventListener("click", () => {
  deleteFinancialExpense();
});
financialExpenseContextInput?.addEventListener("change", () => {
  populateFinancialExpenseCategorySelect();
  populateFinancialExpenseBudgetItemSelect();
});
financialExpensePaymentMethodInput?.addEventListener(
  "change",
  updateFinancialPaymentGeneratorState,
);
financialPaymentStatusInput?.addEventListener("change", updateFinancialPaymentPaidAtState);
generateFinancialPaymentsButton?.addEventListener("click", generateFinancialPayments);
openFinancialPaymentModalButton?.addEventListener("click", () => {
  openFinancialPaymentModal();
});
saveFinancialPaymentButton?.addEventListener("click", saveFinancialPayment);
cancelFinancialPaymentEditButton?.addEventListener("click", closeFinancialPaymentModal);
closeFinancialPaymentModalButton?.addEventListener("click", closeFinancialPaymentModal);
financialPaymentModal?.addEventListener("click", (event) => {
  if (event.target === financialPaymentModal) {
    closeFinancialPaymentModal();
  }
});

financialPaymentsTableBody?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-financial-payment-action]");

  if (button) {
    if (button.dataset.financialPaymentAction === "quick-paid") {
      openFinancialQuickPaymentModal(button.dataset.financialPaymentId);
    }
    return;
  }

  const row = event.target.closest("[data-financial-overview-payment-id]");
  const payment = row
    ? getPaymentById(row.dataset.financialOverviewPaymentId)
    : null;

  if (payment) {
    openFinancialPaymentDetailsModal(payment);
  }
});

financialPaymentsTableBody?.addEventListener("keydown", (event) => {
  if (event.target.closest("[data-financial-payment-action]")) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const row = event.target.closest("[data-financial-overview-payment-id]");
  const payment = row
    ? getPaymentById(row.dataset.financialOverviewPaymentId)
    : null;

  if (!payment) {
    return;
  }

  event.preventDefault();
  openFinancialPaymentDetailsModal(payment);
});

financialPaymentsMobileList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-financial-payment-action]");

  if (button) {
    if (button.dataset.financialPaymentAction === "quick-paid") {
      openFinancialQuickPaymentModal(button.dataset.financialPaymentId);
    }
    return;
  }

  const card = event.target.closest("[data-financial-overview-payment-id]");
  const payment = card
    ? getPaymentById(card.dataset.financialOverviewPaymentId)
    : null;

  if (payment) {
    openFinancialPaymentDetailsModal(payment);
  }
});

financialPaymentsMobileList?.addEventListener("keydown", (event) => {
  if (event.target.closest("[data-financial-payment-action]")) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const card = event.target.closest("[data-financial-overview-payment-id]");
  const payment = card
    ? getPaymentById(card.dataset.financialOverviewPaymentId)
    : null;

  if (!payment) {
    return;
  }

  event.preventDefault();
  openFinancialPaymentDetailsModal(payment);
});

closeFinancialQuickPaymentModalButton?.addEventListener(
  "click",
  closeFinancialQuickPaymentModal,
);
cancelFinancialQuickPaymentButton?.addEventListener(
  "click",
  closeFinancialQuickPaymentModal,
);
confirmFinancialQuickPaymentButton?.addEventListener(
  "click",
  confirmFinancialQuickPayment,
);
financialQuickPaymentModal?.addEventListener("click", (event) => {
  if (event.target === financialQuickPaymentModal) {
    closeFinancialQuickPaymentModal();
  }
});

closeFinancialPaymentDetailsModalButton?.addEventListener(
  "click",
  closeFinancialPaymentDetailsModal,
);
financialPaymentDetailsModal?.addEventListener("click", (event) => {
  if (event.target === financialPaymentDetailsModal) {
    closeFinancialPaymentDetailsModal();
  }
});
editFinancialPaymentDetailsButton?.addEventListener("click", () => {
  const payment = getPaymentById(selectedFinancialPaymentDetailsId);

  if (!payment) {
    return;
  }

  closeFinancialPaymentDetailsModal();
  openFinancialPaymentModal(payment);
});
deleteFinancialPaymentDetailsButton?.addEventListener("click", () => {
  const paymentId = selectedFinancialPaymentDetailsId;

  if (!paymentId) {
    return;
  }

  closeFinancialPaymentDetailsModal();
  deleteFinancialPayment(paymentId);
});

financialExpensesTableBody?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-financial-expense-action]");

  if (!button) {
    return;
  }

  const expense = getExpenseById(button.dataset.financialExpenseId);

  if (button.dataset.financialExpenseAction === "details" && expense) {
    openFinancialExpenseDetailsModal(expense);
  }

  if (button.dataset.financialExpenseAction === "delete") {
    deleteFinancialExpense(button.dataset.financialExpenseId);
  }
});

[
  financialExpenseSearchInput,
  financialExpenseCategoryFilter,
  financialExpenseTypeFilter,
  financialExpenseStatusFilter,
  financialExpensePayerFilter,
  financialExpenseVendorFilter,
  financialExpenseBudgetLinkFilter,
  financialExpenseBudgetItemFilter,
].forEach((filter) => {
  filter?.addEventListener("input", renderAllExpensesTable);
  filter?.addEventListener("change", renderAllExpensesTable);
});
clearFinancialExpenseFiltersButton?.addEventListener(
  "click",
  clearFinancialExpenseFilters,
);

[
  financialPaymentSearchInput,
  financialPaymentCategoryFilter,
  financialPaymentStatusFilter,
  financialPaymentPayerFilter,
  financialPaymentDueFromFilter,
  financialPaymentDueToFilter,
].forEach((filter) => {
  filter?.addEventListener("input", renderAllPaymentsTable);
  filter?.addEventListener("change", renderAllPaymentsTable);
});
clearFinancialPaymentFiltersButton?.addEventListener(
  "click",
  clearFinancialPaymentFilters,
);

document.querySelectorAll("[data-financial-payment-sort]").forEach((button) => {
  button.addEventListener("click", () => {
    setFinancialPaymentSort(button.dataset.financialPaymentSort);
  });
});

document.querySelectorAll("[data-financial-expense-sort]").forEach((button) => {
  button.addEventListener("click", () => {
    setFinancialExpenseSort(button.dataset.financialExpenseSort);
  });
});

document.querySelectorAll("[data-financial-budget-sort]").forEach((button) => {
  button.addEventListener("click", () => {
    setFinancialBudgetSort(button.dataset.financialBudgetSort);
  });
});

financialAllExpensesTableBody?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-financial-expense-action]");

  if (button) {
    const expense = getExpenseById(button.dataset.financialExpenseId);

    if (button.dataset.financialExpenseAction === "details" && expense) {
      openFinancialExpenseDetailsModal(expense);
      return;
    }

    if (button.dataset.financialExpenseAction === "delete") {
      deleteFinancialExpense(button.dataset.financialExpenseId);
      return;
    }
  }

  const row = event.target.closest("[data-financial-expense-id]");
  const expense = row ? getExpenseById(row.dataset.financialExpenseId) : null;

  if (expense) {
    openFinancialExpenseDetailsModal(expense);
  }
});

financialAllExpensesTableBody?.addEventListener("keydown", (event) => {
  if (event.target.closest("[data-financial-expense-action]")) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const row = event.target.closest("[data-financial-expense-id]");
  const expense = row ? getExpenseById(row.dataset.financialExpenseId) : null;

  if (!expense) {
    return;
  }

  event.preventDefault();
  openFinancialExpenseDetailsModal(expense);
});

financialAllExpensesMobileList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-financial-expense-action]");

  if (button) {
    const expense = getExpenseById(button.dataset.financialExpenseId);

    if (button.dataset.financialExpenseAction === "details" && expense) {
      openFinancialExpenseDetailsModal(expense);
      return;
    }

    if (button.dataset.financialExpenseAction === "delete") {
      deleteFinancialExpense(button.dataset.financialExpenseId);
      return;
    }
  }

  const card = event.target.closest("[data-financial-expense-id]");
  const expense = card ? getExpenseById(card.dataset.financialExpenseId) : null;

  if (expense) {
    openFinancialExpenseDetailsModal(expense);
  }
});

financialAllExpensesMobileList?.addEventListener("keydown", (event) => {
  if (event.target.closest("[data-financial-expense-action]")) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const card = event.target.closest("[data-financial-expense-id]");
  const expense = card ? getExpenseById(card.dataset.financialExpenseId) : null;

  if (!expense) {
    return;
  }

  event.preventDefault();
  openFinancialExpenseDetailsModal(expense);
});

financialAllPaymentsTableBody?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-financial-payment-action]");

  if (button) {
    const payment = getPaymentById(button.dataset.financialPaymentId);

    if (button.dataset.financialPaymentAction === "details" && payment) {
      openFinancialPaymentDetailsModal(payment);
      return;
    }

    if (button.dataset.financialPaymentAction === "delete") {
      deleteFinancialPayment(button.dataset.financialPaymentId);
      return;
    }
  }

  const row = event.target.closest("[data-financial-payment-id]");
  const payment = row ? getPaymentById(row.dataset.financialPaymentId) : null;

  if (payment) {
    openFinancialPaymentDetailsModal(payment);
  }
});

financialAllPaymentsTableBody?.addEventListener("keydown", (event) => {
  if (event.target.closest("[data-financial-payment-action]")) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const row = event.target.closest("[data-financial-payment-id]");
  const payment = row ? getPaymentById(row.dataset.financialPaymentId) : null;

  if (!payment) {
    return;
  }

  event.preventDefault();
  openFinancialPaymentDetailsModal(payment);
});

financialAllPaymentsMobileList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-financial-payment-action]");

  if (button) {
    const payment = getPaymentById(button.dataset.financialPaymentId);

    if (button.dataset.financialPaymentAction === "details" && payment) {
      openFinancialPaymentDetailsModal(payment);
      return;
    }

    if (button.dataset.financialPaymentAction === "delete") {
      deleteFinancialPayment(button.dataset.financialPaymentId);
      return;
    }
  }

  const card = event.target.closest("[data-financial-payment-id]");
  const payment = card ? getPaymentById(card.dataset.financialPaymentId) : null;

  if (payment) {
    openFinancialPaymentDetailsModal(payment);
  }
});

financialAllPaymentsMobileList?.addEventListener("keydown", (event) => {
  if (event.target.closest("[data-financial-payment-action]")) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const card = event.target.closest("[data-financial-payment-id]");
  const payment = card ? getPaymentById(card.dataset.financialPaymentId) : null;

  if (!payment) {
    return;
  }

  event.preventDefault();
  openFinancialPaymentDetailsModal(payment);
});

financialExpenseModal?.addEventListener("click", (event) => {
  if (event.target === financialExpenseModal) {
    closeFinancialExpenseModal();
  }
});

financialExpensePaymentsTableBody?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-financial-payment-action]");

  if (!button) {
    return;
  }

  const payment = getPaymentById(button.dataset.financialPaymentId);

  if (button.dataset.financialPaymentAction === "quick-paid") {
    openFinancialQuickPaymentModal(button.dataset.financialPaymentId);
    return;
  }

  if (button.dataset.financialPaymentAction === "edit" && payment) {
    editFinancialPayment(payment);
  }

  if (button.dataset.financialPaymentAction === "delete") {
    deleteFinancialPayment(button.dataset.financialPaymentId);
  }
});

openFinancialOrderModalButton?.addEventListener("click", openFinancialOrderModal);
closeFinancialOrderModalButton?.addEventListener("click", closeFinancialOrderModal);
saveFinancialOrderButton?.addEventListener("click", saveFinancialOrder);

financialOrderTypeInput?.addEventListener("change", () => {
  updateFinancialOrderContextOptions();
  resetFinancialOrderIds();
  renderFinancialOrderModal();
});

financialOrderContextInput?.addEventListener("change", () => {
  resetFinancialOrderIds();
  renderFinancialOrderModal();
});

financialOrderList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-financial-order-action]");

  if (!button) {
    return;
  }

  moveFinancialOrderItem(
    button.dataset.financialOrderId,
    button.dataset.financialOrderAction === "up" ? -1 : 1,
  );
});

financialOrderList?.addEventListener("dragstart", (event) => {
  const item = event.target.closest("[data-financial-order-id]");

  if (!item) {
    return;
  }

  draggedFinancialOrderId = item.dataset.financialOrderId;
  item.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedFinancialOrderId);
});

financialOrderList?.addEventListener("dragend", (event) => {
  const item = event.target.closest("[data-financial-order-id]");

  item?.classList.remove("is-dragging");
  draggedFinancialOrderId = null;
});

financialOrderList?.addEventListener("dragover", (event) => {
  const item = event.target.closest("[data-financial-order-id]");

  if (!item || !draggedFinancialOrderId) {
    return;
  }

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
});

financialOrderList?.addEventListener("drop", (event) => {
  const item = event.target.closest("[data-financial-order-id]");

  if (!item) {
    return;
  }

  event.preventDefault();

  const rect = item.getBoundingClientRect();
  const shouldInsertAfter = event.clientY > rect.top + rect.height / 2;
  reorderDraggedFinancialOrderItem(
    item.dataset.financialOrderId,
    shouldInsertAfter,
  );
});

financialOrderModal?.addEventListener("click", (event) => {
  if (event.target === financialOrderModal) {
    closeFinancialOrderModal();
  }
});

function handleFinancialBaseCardAction(event) {
  const button = event.target.closest("[data-financial-base-action]");

  if (button) {
    const { financialBaseAction: action, financialBaseType: type, financialBaseId: id } =
      button.dataset;

    if (type === "scenario") {
      const scenario = getScenarioById(id);

      if (action === "details" && scenario) {
        openFinancialScenarioDetailsModal(scenario);
      }
      if (action === "delete") {
        deleteFinancialScenario(id);
      }
    }

    if (type === "category") {
      const category = getCategoryById(id);

      if (action === "details" && category) {
        openFinancialCategoryDetailsModal(category);
      }
      if (action === "delete") {
        deleteFinancialCategory(id);
      }
    }

    if (type === "payer") {
      const payer = getPayerById(id);

      if (action === "details" && payer) {
        openFinancialPayerDetailsModal(payer);
      }
      if (action === "delete") {
        deleteFinancialPayer(id);
      }
    }

    return;
  }

  const card = event.target.closest("[data-financial-base-type][data-financial-base-id]");

  if (!card) {
    return;
  }

  const { financialBaseType: type, financialBaseId: id } = card.dataset;

  if (type === "scenario") {
    const scenario = getScenarioById(id);
    if (scenario) {
      openFinancialScenarioDetailsModal(scenario);
    }
  }

  if (type === "category") {
    const category = getCategoryById(id);
    if (category) {
      openFinancialCategoryDetailsModal(category);
    }
  }

  if (type === "payer") {
    const payer = getPayerById(id);
    if (payer) {
      openFinancialPayerDetailsModal(payer);
    }
  }
}

function handleFinancialBaseCardKeydown(event) {
  if (event.target.closest("[data-financial-base-action]")) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  handleFinancialBaseCardAction(event);
}

financialScenariosList?.addEventListener("click", handleFinancialBaseCardAction);
financialCategoriesList?.addEventListener("click", handleFinancialBaseCardAction);
financialPayersList?.addEventListener("click", handleFinancialBaseCardAction);
financialScenariosList?.addEventListener("keydown", handleFinancialBaseCardKeydown);
financialCategoriesList?.addEventListener("keydown", handleFinancialBaseCardKeydown);
financialPayersList?.addEventListener("keydown", handleFinancialBaseCardKeydown);

openFinancialScenarioModalButton?.addEventListener("click", () => {
  openFinancialScenarioModal();
});
closeFinancialScenarioModalButton?.addEventListener(
  "click",
  closeFinancialScenarioModal,
);
cancelFinancialScenarioEditButton?.addEventListener(
  "click",
  resetFinancialScenarioForm,
);
financialScenarioForm?.addEventListener("submit", saveFinancialScenario);

closeFinancialScenarioDetailsModalButton?.addEventListener(
  "click",
  closeFinancialScenarioDetailsModal,
);
financialScenarioDetailsModal?.addEventListener("click", (event) => {
  if (event.target === financialScenarioDetailsModal) {
    closeFinancialScenarioDetailsModal();
  }
});
editFinancialScenarioDetailsButton?.addEventListener("click", () => {
  const scenario = getScenarioById(selectedFinancialScenarioDetailsId);

  if (!scenario) {
    return;
  }

  closeFinancialScenarioDetailsModal();
  openFinancialScenarioModal(scenario);
});
deleteFinancialScenarioDetailsButton?.addEventListener("click", () => {
  const scenarioId = selectedFinancialScenarioDetailsId;

  if (!scenarioId) {
    return;
  }

  closeFinancialScenarioDetailsModal();
  deleteFinancialScenario(scenarioId);
});

financialScenarioList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-financial-scenario-action]");

  if (!button) {
    return;
  }

  const scenario = getScenarioById(button.dataset.financialScenarioId);

  if (button.dataset.financialScenarioAction === "edit" && scenario) {
    selectedFinancialScenarioId = scenario.id;
    financialScenarioNameInput.value = scenario.name || "";
    financialScenarioContextInput.value = scenario.context || "wedding";
    financialScenarioDescriptionInput.value = scenario.description || "";
    financialScenarioOrderInput.value = Number(scenario.display_order || 0);
    financialScenarioReferenceInput.checked = Boolean(scenario.is_reference);
    financialScenarioActiveInput.checked = Boolean(scenario.is_active);
    cancelFinancialScenarioEditButton.classList.remove("is-hidden");
    financialScenarioForm.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    financialScenarioNameInput.focus({ preventScroll: true });
  }

  if (button.dataset.financialScenarioAction === "delete") {
    deleteFinancialScenario(button.dataset.financialScenarioId);
  }
});

financialScenarioModal?.addEventListener("click", (event) => {
  if (event.target === financialScenarioModal) {
    closeFinancialScenarioModal();
  }
});

openFinancialCategoryModalButton?.addEventListener("click", () => {
  openFinancialCategoryModal();
});
closeFinancialCategoryModalButton?.addEventListener(
  "click",
  closeFinancialCategoryModal,
);
cancelFinancialCategoryEditButton?.addEventListener(
  "click",
  resetFinancialCategoryForm,
);
financialCategoryForm?.addEventListener("submit", saveFinancialCategory);

closeFinancialCategoryDetailsModalButton?.addEventListener(
  "click",
  closeFinancialCategoryDetailsModal,
);
financialCategoryDetailsModal?.addEventListener("click", (event) => {
  if (event.target === financialCategoryDetailsModal) {
    closeFinancialCategoryDetailsModal();
  }
});
editFinancialCategoryDetailsButton?.addEventListener("click", () => {
  const category = getCategoryById(selectedFinancialCategoryDetailsId);

  if (!category) {
    return;
  }

  closeFinancialCategoryDetailsModal();
  openFinancialCategoryModal(category);
});
deleteFinancialCategoryDetailsButton?.addEventListener("click", () => {
  const categoryId = selectedFinancialCategoryDetailsId;

  if (!categoryId) {
    return;
  }

  closeFinancialCategoryDetailsModal();
  deleteFinancialCategory(categoryId);
});

financialCategoryList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-financial-category-action]");

  if (!button) {
    return;
  }

  const category = getCategoryById(button.dataset.financialCategoryId);

  if (button.dataset.financialCategoryAction === "edit" && category) {
    selectedFinancialCategoryId = category.id;
    financialCategoryNameInput.value = category.name || "";
    financialCategoryContextInput.value = category.context || "wedding";
    financialCategoryColorInput.value = isSafeHexColor(category.color)
      ? category.color
      : DEFAULT_BRAND_COLOR;
    financialCategoryIconInput.value = category.icon || "wallet";
    updateFinancialCategoryIconPreview();
    financialCategoryOrderInput.value = Number(category.display_order || 0);
    financialCategoryActiveInput.checked = Boolean(category.is_active);
    cancelFinancialCategoryEditButton.classList.remove("is-hidden");
    financialCategoryForm.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    financialCategoryNameInput.focus({ preventScroll: true });
  }

  if (button.dataset.financialCategoryAction === "delete") {
    deleteFinancialCategory(button.dataset.financialCategoryId);
  }
});

financialCategoryModal?.addEventListener("click", (event) => {
  if (event.target === financialCategoryModal) {
    closeFinancialCategoryModal();
  }
});

openFinancialPayerModalButton?.addEventListener("click", () => {
  openFinancialPayerModal();
});
closeFinancialPayerModalButton?.addEventListener("click", closeFinancialPayerModal);
cancelFinancialPayerEditButton?.addEventListener("click", resetFinancialPayerForm);
financialPayerForm?.addEventListener("submit", saveFinancialPayer);

closeFinancialPayerDetailsModalButton?.addEventListener(
  "click",
  closeFinancialPayerDetailsModal,
);
financialPayerDetailsModal?.addEventListener("click", (event) => {
  if (event.target === financialPayerDetailsModal) {
    closeFinancialPayerDetailsModal();
  }
});
editFinancialPayerDetailsButton?.addEventListener("click", () => {
  const payer = getPayerById(selectedFinancialPayerDetailsId);

  if (!payer) {
    return;
  }

  closeFinancialPayerDetailsModal();
  openFinancialPayerModal(payer);
});
deleteFinancialPayerDetailsButton?.addEventListener("click", () => {
  const payerId = selectedFinancialPayerDetailsId;

  if (!payerId) {
    return;
  }

  closeFinancialPayerDetailsModal();
  deleteFinancialPayer(payerId);
});

financialPayerList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-financial-payer-action]");

  if (!button) {
    return;
  }

  const payer = getPayerById(button.dataset.financialPayerId);

  if (button.dataset.financialPayerAction === "edit" && payer) {
    selectedFinancialPayerId = payer.id;
    financialPayerNameInput.value = payer.name || "";
    financialPayerDescriptionInput.value = payer.description || "";
    financialPayerColorInput.value = isSafeHexColor(payer.color)
      ? payer.color
      : DEFAULT_BRAND_COLOR;
    financialPayerIconInput.value = payer.icon || "user";
    updateFinancialPayerIconPreview();
    financialPayerOrderInput.value = Number(payer.display_order || 0);
    financialPayerActiveInput.checked = Boolean(payer.is_active);
    cancelFinancialPayerEditButton.classList.remove("is-hidden");
    financialPayerForm.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    financialPayerNameInput.focus({ preventScroll: true });
  }

  if (button.dataset.financialPayerAction === "delete") {
    deleteFinancialPayer(button.dataset.financialPayerId);
  }
});

financialPayerModal?.addEventListener("click", (event) => {
  if (event.target === financialPayerModal) {
    closeFinancialPayerModal();
  }
});

financialCategoryIconInput?.addEventListener(
  "change",
  updateFinancialCategoryIconPreview,
);
financialCategoryColorInput?.addEventListener(
  "input",
  updateFinancialCategoryIconPreview,
);
financialPayerIconInput?.addEventListener("change", updateFinancialPayerIconPreview);
financialPayerColorInput?.addEventListener("input", updateFinancialPayerIconPreview);

populateFinancialCategoryIconSelect();
updateFinancialCategoryIconPreview();
populateFinancialPayerIconSelect();
updateFinancialPayerIconPreview();
focusActiveFinancialModuleTab();
loadFinancialData();
