(function () {
  const { formatDate } = AdminCommon;

  let reportData = {
    allGuests: [],
    allRSVPs: [],
    activeGuests: [],
    activeRSVPs: [],
    buffetPayingAge: BuffetMetrics.DEFAULT_PAYING_AGE,
    checklistItems: [],
    contributions: [],
    financialBudgetItems: [],
    financialCategories: [],
    financialExpenses: [],
    financialMetrics: null,
    financialPayments: [],
    financialPayers: [],
    financialScenarios: [],
    gifts: [],
    tableAssignments: [],
    tables: [],
  };

  const attendanceReportModal = document.getElementById("attendanceReportModal");
  const closeAttendanceReportModalButton = document.getElementById(
    "closeAttendanceReportModalButton",
  );
  const buffetFinalReportModal = document.getElementById(
    "buffetFinalReportModal",
  );
  const closeBuffetFinalReportModalButton = document.getElementById(
    "closeBuffetFinalReportModalButton",
  );
  const financialReportModal = document.getElementById("financialReportModal");
  const closeFinancialReportModalButton = document.getElementById(
    "closeFinancialReportModalButton",
  );
  const financialBudgetReportModal = document.getElementById(
    "financialBudgetReportModal",
  );
  const closeFinancialBudgetReportModalButton = document.getElementById(
    "closeFinancialBudgetReportModalButton",
  );
  const financialExpensesReportModal = document.getElementById(
    "financialExpensesReportModal",
  );
  const closeFinancialExpensesReportModalButton = document.getElementById(
    "closeFinancialExpensesReportModalButton",
  );
  const financialPaymentsReportModal = document.getElementById(
    "financialPaymentsReportModal",
  );
  const closeFinancialPaymentsReportModalButton = document.getElementById(
    "closeFinancialPaymentsReportModalButton",
  );
  const pendingReportModal = document.getElementById("pendingReportModal");
  const closePendingReportModalButton = document.getElementById(
    "closePendingReportModalButton",
  );
  const tablesReportModal = document.getElementById("tablesReportModal");
  const closeTablesReportModalButton = document.getElementById(
    "closeTablesReportModalButton",
  );
  const receptionReportModal = document.getElementById("receptionReportModal");
  const closeReceptionReportModalButton = document.getElementById(
    "closeReceptionReportModalButton",
  );

  function setData(data) {
    reportData = {
      ...reportData,
      ...data,
    };
  }

  function openAttendanceReportModal() {
    attendanceReportModal?.classList.add("active");
  }

  function closeAttendanceReportModal() {
    attendanceReportModal?.classList.remove("active");
  }

  function openBuffetFinalReportModal() {
    buffetFinalReportModal?.classList.add("active");
  }

  function closeBuffetFinalReportModal() {
    buffetFinalReportModal?.classList.remove("active");
  }

  function openFinancialReportModal() {
    financialReportModal?.classList.add("active");
  }

  function closeFinancialReportModal() {
    financialReportModal?.classList.remove("active");
  }

  function openFinancialBudgetReportModal() {
    populateFinancialBudgetReportFilters();
    financialBudgetReportModal?.classList.add("active");
  }

  function closeFinancialBudgetReportModal() {
    financialBudgetReportModal?.classList.remove("active");
  }

  function openFinancialExpensesReportModal() {
    populateFinancialExpensesReportFilters();
    financialExpensesReportModal?.classList.add("active");
  }

  function closeFinancialExpensesReportModal() {
    financialExpensesReportModal?.classList.remove("active");
  }

  function openFinancialPaymentsReportModal() {
    populateFinancialPaymentsReportFilters();
    financialPaymentsReportModal?.classList.add("active");
  }

  function closeFinancialPaymentsReportModal() {
    financialPaymentsReportModal?.classList.remove("active");
  }

  function openPendingReportModal() {
    pendingReportModal?.classList.add("active");
  }

  function closePendingReportModal() {
    pendingReportModal?.classList.remove("active");
  }

  function openTablesReportModal() {
    tablesReportModal?.classList.add("active");
  }

  function closeTablesReportModal() {
    tablesReportModal?.classList.remove("active");
  }

  function openReceptionReportModal() {
    receptionReportModal?.classList.add("active");
  }

  function closeReceptionReportModal() {
    receptionReportModal?.classList.remove("active");
  }

  function getGuestMap() {
    return reportData.activeGuests.reduce((map, guest) => {
      map[guest.id] = guest.name;
      return map;
    }, {});
  }

  function getAllGuestMap() {
    return reportData.allGuests.reduce((map, guest) => {
      map[guest.id] = guest;
      return map;
    }, {});
  }

  function getGuestSideMap() {
    return reportData.activeGuests.reduce((map, guest) => {
      map[guest.id] = getGuestSideLabel(guest.guest_side);
      return map;
    }, {});
  }

  function getGuestTableMap() {
    const tableMap = reportData.tables.reduce((map, tableItem) => {
      map[tableItem.id] = tableItem.name;
      return map;
    }, {});

    return reportData.tableAssignments.reduce((map, assignment) => {
      map[assignment.guest_id] =
        tableMap[assignment.table_id] || "Mesa não encontrada";
      return map;
    }, {});
  }

  function getGuestTableGuestNoteMap() {
    return reportData.tableAssignments.reduce((map, assignment) => {
      map[assignment.guest_id] = String(assignment.notes || "").trim();
      return map;
    }, {});
  }

  function getGuestTableName(guestId, guestTableMap) {
    return guestTableMap[guestId] || "Sem mesa";
  }

  function getGuestTableGuestNote(guestId, guestTableGuestNoteMap) {
    return guestTableGuestNoteMap[guestId] || "";
  }

  function getGiftMap() {
    return reportData.gifts.reduce((map, gift) => {
      map[gift.id] = gift;
      return map;
    }, {});
  }

  function getRSVPMap() {
    return reportData.activeRSVPs.reduce((map, rsvp) => {
      map[rsvp.guest_id] = rsvp;
      return map;
    }, {});
  }

  function getAllRSVPMap() {
    return reportData.allRSVPs.reduce((map, rsvp) => {
      map[rsvp.guest_id] = rsvp;
      return map;
    }, {});
  }

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatBoolean(value) {
    return value ? "Sim" : "Não";
  }

  function getFinancialContextLabel(context) {
    const labels = {
      all: "Todos",
      both: "Compartilhado",
      honeymoon: "Lua de Mel",
      wedding: "Casamento",
    };

    return labels[context] || "";
  }

  function getFinancialStatusLabel(status, labels) {
    return labels[status] || status || "";
  }

  const financialBudgetStatusLabels = {
    approved: "Aprovado",
    discarded: "Descartado",
    planned: "Previsto",
    researching: "Em pesquisa",
    replaced: "Substituído",
  };

  const financialBudgetPriorityLabels = {
    high: "Alta",
    low: "Baixa",
    normal: "Normal",
  };

  const financialExpenseTypeLabels = {
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

  const financialExpenseStatusLabels = {
    cancelled: "Cancelado",
    contracted: "Contratado",
    paid: "Pago",
    planned: "Planejado",
    purchased: "Comprado",
    quoting: "Cotando",
  };

  const financialPaymentMethodLabels = {
    cash: "À vista",
    custom: "A definir/personalizado",
    deposit_installments: "Entrada + parcelas",
    installments: "Parcelado",
  };

  const financialPaymentStatusLabels = {
    cancelled: "Cancelada",
    overdue: "Atrasada",
    paid: "Paga",
    unpaid: "Não paga",
  };

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

  function getTableStatusLabel(status) {
    const labels = {
      available: "Com vagas",
      full: "Lotada",
      inactive: "Inativa",
      over: "Acima da capacidade",
    };

    return labels[status] || "Com vagas";
  }

  function hasDietaryRestriction(rsvp) {
    const people = [
      rsvp?.guest_data,
      ...(rsvp?.guest_data?.members || []),
      ...(rsvp?.guest_data?.companions || []),
    ];

    if (people.some((person) => BuffetMetrics.hasPersonDietaryRestriction(person))) {
      return true;
    }

    if (typeof rsvp?.food_restriction === "boolean") {
      return rsvp.food_restriction;
    }

    return Boolean(String(rsvp?.food || "").trim());
  }

  function getDietaryRestrictionDetails(rsvp) {
    if (!hasDietaryRestriction(rsvp)) {
      return "";
    }

    const people = [
      rsvp?.guest_data,
      ...(rsvp?.guest_data?.members || []),
      ...(rsvp?.guest_data?.companions || []),
    ]
      .filter(Boolean)
      .filter((person) => person.presence !== "Não")
      .filter((person) => BuffetMetrics.hasPersonDietaryRestriction(person))
      .map((person) => ({
        food:
          BuffetMetrics.getPersonDietaryRestrictionDetails(person) ||
          "Sim, sem detalhes informados",
        name: person.name || "Sem nome",
      }));

    if (people.length) {
      return people.map((person) => `${person.name}: ${person.food}`).join("; ");
    }

    return String(rsvp?.food || "").trim() || "Sim, sem detalhes informados";
  }

  function formatPersonDietaryRestriction(person) {
    if (!BuffetMetrics.hasPersonDietaryRestriction(person)) {
      return "";
    }

    return (
      BuffetMetrics.getPersonDietaryRestrictionDetails(person) ||
      "Sim, sem detalhes informados"
    );
  }

  function isQuotaGift(gift) {
    return gift?.gift_type === "quota";
  }

  function getContributionValue(contribution) {
    const totalValue = Number(contribution.total_value || 0);

    if (totalValue > 0) {
      return totalValue;
    }

    return (
      Number(contribution.quota_quantity || 0) *
      Number(contribution.quota_value || 0)
    );
  }

  function getGuestName(guestId, guestMap, fallback = "") {
    return guestMap[guestId] || fallback || "Convidado não encontrado";
  }

  function getAttendingNames(guest, rsvp) {
    const members = rsvp?.guest_data?.members || [];

    if (members.length) {
      return members
        .filter((member) => member.presence === "Sim")
        .map((member) => member.name)
        .filter(Boolean)
        .join("; ");
    }

    return rsvp?.presence === "Sim" ? guest.name : "";
  }

  function getCompanionNames(rsvp) {
    return (rsvp?.guest_data?.companions || [])
      .map((companion) => companion.name)
      .filter(Boolean)
      .join("; ");
  }

  function getBuffetMetrics(guest, rsvp) {
    return BuffetMetrics.getRSVPMetrics(
      guest,
      rsvp,
      reportData.buffetPayingAge,
    );
  }

  function getBuffetRuleLabel() {
    const age = BuffetMetrics.normalizePayingAge(reportData.buffetPayingAge);
    return `Pagante a partir de ${age} ${age === 1 ? "ano" : "anos"}`;
  }

  function getExpectedCount(guest, rsvp) {
    if (!rsvp || rsvp.presence !== "Sim") {
      return 0;
    }

    const companionCount = Number(rsvp.guest_data?.guest_count || 0);
    const members = rsvp.guest_data?.members || [];

    if (members.length) {
      const attendingMembers = members.filter(
        (member) => member.presence === "Sim",
      ).length;

      return attendingMembers + companionCount;
    }

    return 1 + companionCount;
  }

  function getPlannedGuestCount(guest) {
    if (!guest?.active) {
      return 0;
    }

    const invitePeople =
      guest.invite_type === "couple"
        ? Math.max((guest.couple_members || []).length, 2)
        : 1;

    return invitePeople + Number(guest.max_guests || 0);
  }

  function getConfirmedGuestCount(guest, rsvp) {
    if (!guest?.active) {
      return 0;
    }

    return BuffetMetrics.getConfirmedPeople(
      guest,
      rsvp,
      reportData.buffetPayingAge,
    ).length;
  }

  function getHybridGuestCount(guest, rsvp) {
    if (rsvp) {
      return getConfirmedGuestCount(guest, rsvp);
    }

    return getPlannedGuestCount(guest);
  }

  function getTableAssignments(tableId, guestMap) {
    return reportData.tableAssignments
      .filter((assignment) => assignment.table_id === tableId)
      .map((assignment) => ({
        assignment,
        guest: guestMap[assignment.guest_id],
      }))
      .filter((item) => item.guest)
      .sort((first, second) =>
        String(first.guest.name || "").localeCompare(
          String(second.guest.name || ""),
          "pt-BR",
          {
            numeric: true,
            sensitivity: "base",
          },
        ),
      );
  }

  function getTableOccupancy(tableItem, guestMap, rsvpMap) {
    return getTableAssignments(tableItem.id, guestMap).reduce(
      (totals, item) => {
        const rsvp = rsvpMap[item.guest.id];

        totals.confirmed += getConfirmedGuestCount(item.guest, rsvp);
        totals.hybrid += getHybridGuestCount(item.guest, rsvp);
        totals.planned += getPlannedGuestCount(item.guest);

        return totals;
      },
      { confirmed: 0, hybrid: 0, planned: 0 },
    );
  }

  function getTableStatus(tableItem, occupancy, mode = "hybrid") {
    if (!tableItem.is_active) {
      return "inactive";
    }

    const capacity = Number(tableItem.capacity || 0);
    const currentOccupancy = Number(occupancy[mode] || 0);

    if (capacity > 0 && currentOccupancy > capacity) {
      return "over";
    }

    if (capacity > 0 && currentOccupancy >= capacity) {
      return "full";
    }

    return "available";
  }

  function getSortedTables() {
    return [...reportData.tables].sort((first, second) => {
      const firstOrder = Number(first.display_order ?? 0);
      const secondOrder = Number(second.display_order ?? 0);

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }

      return String(first.name || "").localeCompare(
        String(second.name || ""),
        "pt-BR",
        {
          numeric: true,
          sensitivity: "base",
        },
      );
    });
  }

  function getSelectedAttendanceColumns() {
    const selectedColumns = Array.from(
      document.querySelectorAll("[data-attendance-column]:checked"),
    ).map((input) => input.dataset.attendanceColumn);

    return new Set(selectedColumns);
  }

  function getSelectedColumns(selector, datasetKey) {
    return new Set(
      Array.from(document.querySelectorAll(selector)).map(
        (input) => input.dataset[datasetKey],
      ),
    );
  }

  function filterColumns(columns, selectedColumns) {
    return columns.filter((column) => selectedColumns.has(column.key));
  }

  function downloadReport({ filename, format, rows, sheetName, columns }) {
    if (!columns.length) {
      AdminCommon.showToast("⚠️ Selecione pelo menos uma coluna para exportar");
      return false;
    }

    if (format === "csv") {
      AdminExport.downloadCSV(filename, columns, rows);
      return true;
    }

    const exported = AdminExport.downloadXLSX(
      filename,
      sheetName,
      AdminExport.buildRows(columns, rows),
    );

    if (!exported) {
      AdminCommon.showToast("⚠️ XLSX indisponível. Tente novamente em instantes");
      return false;
    }

    return true;
  }

  function getAttendanceTotals(rows) {
    return rows.reduce(
      (totals, row) => {
        totals.expectedCount += Number(row.expectedCount || 0);
        totals.childCount += row.buffetMetrics.children;
        totals.payingCount += row.buffetMetrics.payingPeople;
        totals.payingChildCount += row.buffetMetrics.payingChildren;
        totals.nonPayingChildCount += row.buffetMetrics.nonPayingChildren;
        totals.unknownChildCount += row.buffetMetrics.unknownAgeChildren;

        return totals;
      },
      {
        childCount: 0,
        expectedCount: 0,
        nonPayingChildCount: 0,
        payingChildCount: 0,
        payingCount: 0,
        unknownChildCount: 0,
      },
    );
  }

  function applyTotalLabel(totalRow, columns) {
    const firstColumn = columns[0];

    if (firstColumn) {
      totalRow[firstColumn.value] = "Total esperado geral";
    }

    return totalRow;
  }

  function getFilteredAttendanceColumns(mode) {
    const selectedColumns = getSelectedAttendanceColumns();
    const columns =
      mode === "summary"
        ? getAttendanceSummaryColumns()
        : getDetailedAttendanceColumns();

    return filterColumns(columns, selectedColumns);
  }

  function getAttendanceRows() {
    const rsvpMap = getRSVPMap();
    const guestTableMap = getGuestTableMap();
    const guestTableGuestNoteMap = getGuestTableGuestNoteMap();

    return reportData.activeGuests
      .map((guest) => {
        const rsvp = rsvpMap[guest.id];

        return {
          buffetMetrics: getBuffetMetrics(guest, rsvp),
          guest,
          guestTable: getGuestTableName(guest.id, guestTableMap),
          guestTableGuestNote: getGuestTableGuestNote(
            guest.id,
            guestTableGuestNoteMap,
          ),
          rsvp,
          expectedCount: getExpectedCount(guest, rsvp),
        };
      })
      .filter((row) => row.rsvp?.presence === "Sim" && row.expectedCount > 0);
  }

  function getAttendanceSummaryColumns() {
    return [
      { key: "invite", label: "Convite", value: "invite" },
      { key: "code", label: "Código", value: "code" },
      { key: "guestSide", label: "Convidado de", value: "guestSide" },
      { key: "guestTable", label: "Mesa", value: "guestTable" },
      {
        key: "guestTableGuestNote",
        label: "Observação do convidado na mesa",
        value: "guestTableGuestNote",
      },
      { key: "inviteSent", label: "Convite enviado", value: "inviteSent" },
      { key: "people", label: "Pessoas do convite", value: "people" },
      { key: "companions", label: "Acompanhantes", value: "companions" },
      { key: "expectedCount", label: "Total esperado", value: "expectedCount" },
      { key: "childCount", label: "Crianças", value: "childCount" },
      { key: "payingCount", label: "Pagantes", value: "payingCount" },
      {
        key: "payingChildCount",
        label: "Crianças pagantes",
        value: "payingChildCount",
      },
      {
        key: "nonPayingChildCount",
        label: "Crianças não pagantes",
        value: "nonPayingChildCount",
      },
      {
        key: "unknownChildCount",
        label: "Crianças sem idade",
        value: "unknownChildCount",
      },
      {
        key: "buffetRule",
        label: "Regra do buffet",
        value: "buffetRule",
      },
      {
        key: "hasFoodRestriction",
        label: "Possui restrição alimentar",
        value: "hasFoodRestriction",
      },
      { key: "food", label: "Restrição alimentar", value: "food" },
      { key: "message", label: "Mensagem", value: "message" },
      { key: "updatedAt", label: "Atualizado em", value: "updatedAt" },
    ];
  }

  function buildSummaryAttendanceData(rows, columns) {
    const totals = getAttendanceTotals(rows);
    const dataRows = rows.map((row) => ({
      invite: row.guest.name,
      code: row.guest.invite_code,
      guestSide: getGuestSideLabel(row.guest.guest_side),
      guestTable: row.guestTable,
      guestTableGuestNote: row.guestTableGuestNote,
      inviteSent: formatBoolean(row.guest.invite_sent),
      people: getAttendingNames(row.guest, row.rsvp),
      companions: getCompanionNames(row.rsvp),
      expectedCount: row.expectedCount,
      childCount: row.buffetMetrics.children,
      payingCount: row.buffetMetrics.payingPeople,
      payingChildCount: row.buffetMetrics.payingChildren,
      nonPayingChildCount: row.buffetMetrics.nonPayingChildren,
      unknownChildCount: row.buffetMetrics.unknownAgeChildren,
      buffetRule: getBuffetRuleLabel(),
      hasFoodRestriction: formatBoolean(hasDietaryRestriction(row.rsvp)),
      food: getDietaryRestrictionDetails(row.rsvp),
      message: row.rsvp.message,
      updatedAt: formatDate(row.rsvp.updated_at || row.rsvp.created_at),
    }));
    const totalRow = applyTotalLabel(
      {
        childCount: totals.childCount,
        buffetRule: getBuffetRuleLabel(),
        expectedCount: totals.expectedCount,
        nonPayingChildCount: totals.nonPayingChildCount,
        payingChildCount: totals.payingChildCount,
        payingCount: totals.payingCount,
        unknownChildCount: totals.unknownChildCount,
      },
      columns,
    );

    return [...dataRows, totalRow];
  }

  function getConfirmedPeople(row) {
    return BuffetMetrics.getConfirmedPeople(
      row.guest,
      row.rsvp,
      reportData.buffetPayingAge,
    );
  }

  function getDetailedAttendanceColumns() {
    return [
      { key: "invite", label: "Convite", value: "invite" },
      { key: "code", label: "Código", value: "code" },
      { key: "guestSide", label: "Convidado de", value: "guestSide" },
      { key: "guestTable", label: "Mesa", value: "guestTable" },
      {
        key: "guestTableGuestNote",
        label: "Observação do convidado na mesa",
        value: "guestTableGuestNote",
      },
      { key: "inviteSent", label: "Convite enviado", value: "inviteSent" },
      { key: "people", label: "Pessoa", value: "person" },
      { key: "type", label: "Tipo", value: "type" },
      { key: "child", label: "Criança", value: "child" },
      { key: "age", label: "Idade", value: "age" },
      {
        key: "buffetCategory",
        label: "Categoria do buffet",
        value: "buffetCategory",
      },
      { key: "paying", label: "Pagante", value: "paying" },
      { key: "expectedCount", label: "Total esperado", value: "expectedCount" },
      { key: "childCount", label: "Total crianças", value: "childCount" },
      { key: "payingCount", label: "Total pagantes", value: "payingCount" },
      {
        key: "payingChildCount",
        label: "Crianças pagantes",
        value: "payingChildCount",
      },
      {
        key: "nonPayingChildCount",
        label: "Crianças não pagantes",
        value: "nonPayingChildCount",
      },
      {
        key: "unknownChildCount",
        label: "Crianças sem idade",
        value: "unknownChildCount",
      },
      {
        key: "buffetRule",
        label: "Regra do buffet",
        value: "buffetRule",
      },
      {
        key: "hasFoodRestriction",
        label: "Possui restrição alimentar",
        value: "hasFoodRestriction",
      },
      { key: "food", label: "Restrição alimentar", value: "food" },
      { key: "message", label: "Mensagem", value: "message" },
      { key: "updatedAt", label: "Atualizado em", value: "updatedAt" },
    ];
  }

  function buildDetailedAttendanceData(rows, columns) {
    const totals = getAttendanceTotals(rows);
    return rows.flatMap((row) => {
      const people = getConfirmedPeople(row);
      const childCount = people.filter((person) => person.child === "Sim").length;

      return people.map((person) => ({
        invite: row.guest.name,
        code: row.guest.invite_code,
        guestSide: getGuestSideLabel(row.guest.guest_side),
        guestTable: row.guestTable,
        guestTableGuestNote: row.guestTableGuestNote,
        inviteSent: formatBoolean(row.guest.invite_sent),
        person: person.name,
        type: person.type,
        child: person.child,
        age: person.age,
        buffetCategory: BuffetMetrics.getCategoryLabel(person.category),
        paying: person.paying ? "Sim" : "Não",
        expectedCount: row.expectedCount,
        childCount,
        payingCount: row.buffetMetrics.payingPeople,
        payingChildCount: row.buffetMetrics.payingChildren,
        nonPayingChildCount: row.buffetMetrics.nonPayingChildren,
        unknownChildCount: row.buffetMetrics.unknownAgeChildren,
        buffetRule: getBuffetRuleLabel(),
        hasFoodRestriction: formatBoolean(
          BuffetMetrics.hasPersonDietaryRestriction(person),
        ),
        food: formatPersonDietaryRestriction(person),
        message: row.rsvp.message,
        updatedAt: formatDate(row.rsvp.updated_at || row.rsvp.created_at),
      }));
    }).concat(
      applyTotalLabel(
        {
          childCount: totals.childCount,
          buffetRule: getBuffetRuleLabel(),
          expectedCount: totals.expectedCount,
          nonPayingChildCount: totals.nonPayingChildCount,
          payingChildCount: totals.payingChildCount,
          payingCount: totals.payingCount,
          unknownChildCount: totals.unknownChildCount,
        },
        columns,
      ),
    );
  }

  function buildDetailedAttendanceSheet(rows, columns) {
    const sheetRows = [columns.map((column) => column.label)];
    const merges = [];
    const mergeColumnKeys = [
      "invite",
      "code",
      "guestSide",
      "guestTable",
      "guestTableGuestNote",
      "inviteSent",
      "expectedCount",
      "childCount",
      "payingCount",
      "payingChildCount",
      "nonPayingChildCount",
      "unknownChildCount",
      "buffetRule",
      "message",
      "updatedAt",
    ];
    const mergeColumns = columns
      .map((column, index) => (mergeColumnKeys.includes(column.key) ? index : null))
      .filter((index) => index !== null);
    let currentRowIndex = 1;

    rows.forEach((row) => {
      const people = getConfirmedPeople(row);
      const childCount = people.filter((person) => person.child === "Sim").length;
      const startRow = currentRowIndex;

      people.forEach((person, index) => {
        const sheetRow = {
          age: person.age,
          buffetCategory: BuffetMetrics.getCategoryLabel(person.category),
          child: person.child,
          code: index === 0 ? row.guest.invite_code : "",
          guestSide: index === 0 ? getGuestSideLabel(row.guest.guest_side) : "",
          guestTable: index === 0 ? row.guestTable : "",
          guestTableGuestNote: index === 0 ? row.guestTableGuestNote : "",
          inviteSent: index === 0 ? formatBoolean(row.guest.invite_sent) : "",
          expectedCount: index === 0 ? row.expectedCount : "",
          childCount: index === 0 ? childCount : "",
          payingCount:
            index === 0 ? row.buffetMetrics.payingPeople : "",
          payingChildCount:
            index === 0 ? row.buffetMetrics.payingChildren : "",
          nonPayingChildCount:
            index === 0 ? row.buffetMetrics.nonPayingChildren : "",
          unknownChildCount:
            index === 0 ? row.buffetMetrics.unknownAgeChildren : "",
          buffetRule: index === 0 ? getBuffetRuleLabel() : "",
          food: formatPersonDietaryRestriction(person),
          hasFoodRestriction: formatBoolean(
            BuffetMetrics.hasPersonDietaryRestriction(person),
          ),
          invite: index === 0 ? row.guest.name : "",
          message: index === 0 ? row.rsvp.message || "" : "",
          person: person.name,
          paying: person.paying ? "Sim" : "Não",
          type: person.type,
          updatedAt:
            index === 0
              ? formatDate(row.rsvp.updated_at || row.rsvp.created_at)
              : "",
        };

        sheetRows.push(columns.map((column) => sheetRow[column.value] || ""));
      });

      if (people.length > 1) {
        mergeColumns.forEach((column) => {
          merges.push({
            s: { r: startRow, c: column },
            e: { r: currentRowIndex + people.length - 1, c: column },
          });
        });
      }

      currentRowIndex += people.length;
    });

    const totals = getAttendanceTotals(rows);
    const totalRow = applyTotalLabel(
      {
        childCount: totals.childCount,
        buffetRule: getBuffetRuleLabel(),
        expectedCount: totals.expectedCount,
        nonPayingChildCount: totals.nonPayingChildCount,
        payingChildCount: totals.payingChildCount,
        payingCount: totals.payingCount,
        unknownChildCount: totals.unknownChildCount,
      },
      columns,
    );
    sheetRows.push(columns.map((column) => totalRow[column.value] || ""));

    return {
      merges,
      rows: sheetRows,
    };
  }

  function exportAttendanceReport(mode, format) {
    const rows = getAttendanceRows();
    const columns = getFilteredAttendanceColumns(mode);

    if (!rows.length) {
      AdminCommon.showToast("⚠️ Nenhuma presença confirmada para exportar");
      return;
    }

    if (!columns.length) {
      AdminCommon.showToast("⚠️ Selecione pelo menos uma coluna para exportar");
      return;
    }

    if (mode === "summary" && format === "csv") {
      AdminExport.downloadCSV(
        "relatorio-presenca-buffet-resumo",
        columns,
        buildSummaryAttendanceData(rows, columns),
      );
    }

    if (mode === "summary" && format === "xlsx") {
      const exported = AdminExport.downloadXLSX(
        "relatorio-presenca-buffet-resumo",
        "Confirmados",
        AdminExport.buildRows(columns, buildSummaryAttendanceData(rows, columns)),
      );

      if (!exported) {
        AdminCommon.showToast("⚠️ XLSX indisponível. Tente novamente em instantes");
        return;
      }
    }

    if (mode === "detailed" && format === "csv") {
      AdminExport.downloadCSV(
        "relatorio-presenca-buffet-detalhado",
        columns,
        buildDetailedAttendanceData(rows, columns),
      );
    }

    if (mode === "detailed" && format === "xlsx") {
      const sheet = buildDetailedAttendanceSheet(rows, columns);
      const exported = AdminExport.downloadXLSX(
        "relatorio-presenca-buffet-detalhado",
        "Confirmados",
        sheet.rows,
        sheet.merges,
      );

      if (!exported) {
        AdminCommon.showToast("⚠️ XLSX indisponível. Tente novamente em instantes");
        return;
      }
    }

    closeAttendanceReportModal();
    AdminCommon.showToast("💜 Relatório de presença exportado!");
  }

  function getBuffetFinalRestrictionRows(attendanceRows) {
    return attendanceRows
      .flatMap((row) =>
        getConfirmedPeople(row)
          .filter((person) => BuffetMetrics.hasPersonDietaryRestriction(person))
          .map((person) => ({
            buffetCategory: BuffetMetrics.getCategoryLabel(person.category),
            invite: row.guest.name,
            person: person.name || row.guest.name,
            restriction: formatPersonDietaryRestriction(person),
            role: person.type || "Convidado",
            table: row.guestTable,
          })),
      )
      .sort((first, second) =>
        compareReceptionText(first.person, second.person),
      );
  }

  function getBuffetFinalPeopleRows(attendanceRows) {
    return attendanceRows
      .flatMap((row) => {
        return getConfirmedPeople(row).map((person) => ({
          _category: person.category,
          _guestId: row.guest.id,
          age: person.age || "",
          buffetCategory: BuffetMetrics.getCategoryLabel(person.category),
          child: person.child,
          invite: row.guest.name,
          paying: formatBoolean(person.paying),
          person: person.name || row.guest.name,
          restriction: formatPersonDietaryRestriction(person),
          role: person.type || "Convidado",
          table: row.guestTable,
        }));
      })
      .sort((first, second) => {
        const firstWithoutTable = first.table === "Sem mesa" ? 0 : 1;
        const secondWithoutTable = second.table === "Sem mesa" ? 0 : 1;

        if (firstWithoutTable !== secondWithoutTable) {
          return firstWithoutTable - secondWithoutTable;
        }

        const tableResult = compareReceptionText(first.table, second.table);

        if (tableResult !== 0) {
          return tableResult;
        }

        return compareReceptionText(first.person, second.person);
      });
  }

  function getBuffetFinalPendingRSVPCount() {
    const rsvpMap = getRSVPMap();

    return reportData.activeGuests.filter((guest) => {
      const presence = rsvpMap[guest.id]?.presence;
      return presence !== "Sim" && presence !== "Não";
    }).length;
  }

  function getBuffetFinalSummary(attendanceRows, restrictionRows, peopleRows) {
    const totals = getAttendanceTotals(attendanceRows);

    return {
      adultPayingCount: Math.max(
        totals.payingCount - totals.payingChildCount,
        0,
      ),
      childCount: totals.childCount,
      confirmedCount: totals.expectedCount,
      nonPayingChildCount: totals.nonPayingChildCount,
      payingChildCount: totals.payingChildCount,
      payingCount: totals.payingCount,
      pendingRSVPCount: getBuffetFinalPendingRSVPCount(),
      restrictionInviteCount: new Set(restrictionRows.map((row) => row.invite))
        .size,
      restrictionPeopleCount: restrictionRows.length,
      withoutTableCount: peopleRows.filter((row) => row.table === "Sem mesa")
        .length,
      unknownChildCount: totals.unknownChildCount,
    };
  }

  function getBuffetFinalSummarySheetRows(summary) {
    return [
      ["Resumo Final do Buffet", ""],
      ["Casamento", getWeddingDateLabel() || "Não informado"],
      ["Regra aplicada", getBuffetRuleLabel()],
      ["Escopo", "Somente pessoas com presença confirmada"],
      ["", ""],
      ["Indicador", "Quantidade"],
      ["Pessoas confirmadas", summary.confirmedCount],
      ["Pessoas pagantes", summary.payingCount],
      ["Adultos pagantes", summary.adultPayingCount],
      ["Total de crianças", summary.childCount],
      ["Crianças pagantes", summary.payingChildCount],
      ["Crianças não pagantes", summary.nonPayingChildCount],
      ["Crianças sem idade", summary.unknownChildCount],
      ["Convites com restrição alimentar", summary.restrictionInviteCount],
      ["Pessoas com restrição alimentar", summary.restrictionPeopleCount],
      ["RSVPs pendentes", summary.pendingRSVPCount],
      ["Pessoas confirmadas sem mesa", summary.withoutTableCount],
    ];
  }

  function getBuffetFinalPeopleColumns() {
    return [
      { key: "table", label: "Mesa", value: "table" },
      { key: "person", label: "Pessoa", value: "person" },
      {
        key: "invite",
        label: "Responsável pelo convite",
        value: "invite",
      },
      { key: "role", label: "Papel", value: "role" },
      { key: "child", label: "Criança", value: "child" },
      { key: "age", label: "Idade", value: "age" },
      {
        key: "buffetCategory",
        label: "Categoria do Buffet",
        value: "buffetCategory",
      },
      {
        key: "food",
        label: "Restrição alimentar",
        value: "food",
      },
      { key: "paying", label: "Pagante", value: "paying" },
    ];
  }

  function getBuffetFinalCompletePDFColumns() {
    return [
      ...getBuffetFinalPeopleColumns().filter(
        (column) => column.key !== "child",
      ),
      {
        key: "restriction",
        label: "Restrição da pessoa",
        value: "restriction",
      },
    ];
  }

  function getBuffetFinalTableRows(peopleRows) {
    const tableDetails = new Map(
      reportData.tables.map((tableItem) => [tableItem.name, tableItem]),
    );
    const tableRows = peopleRows.reduce((map, person) => {
      if (!map.has(person.table)) {
        const tableItem = tableDetails.get(person.table);

        map.set(person.table, {
          _restrictionGuestIds: new Set(),
          adultPayingCount: 0,
          confirmedCount: 0,
          location: tableItem?.location || "",
          nonPayingChildCount: 0,
          payingChildCount: 0,
          table: person.table,
          tableNotes: tableItem?.notes || "",
          unknownChildCount: 0,
        });
      }

      const tableRow = map.get(person.table);
      tableRow.confirmedCount += 1;

      if (person._category === "adult-paying") {
        tableRow.adultPayingCount += 1;
      } else if (person._category === "child-paying") {
        tableRow.payingChildCount += 1;
      } else if (person._category === "child-non-paying") {
        tableRow.nonPayingChildCount += 1;
      } else if (person._category === "child-unknown") {
        tableRow.unknownChildCount += 1;
      }

      if (person.restriction) {
        tableRow._restrictionGuestIds.add(person.person);
      }

      return map;
    }, new Map());

    return Array.from(tableRows.values())
      .map((row) => {
        const { _restrictionGuestIds, ...exportRow } = row;

        return {
          ...exportRow,
          restrictionInviteCount: _restrictionGuestIds.size,
        };
      })
      .sort((first, second) => {
        if (first.table === "Sem mesa" && second.table !== "Sem mesa") {
          return -1;
        }

        if (second.table === "Sem mesa" && first.table !== "Sem mesa") {
          return 1;
        }

        return compareReceptionText(first.table, second.table);
      });
  }

  function getBuffetFinalTableColumns() {
    return [
      { key: "table", label: "Mesa", value: "table" },
      { key: "location", label: "Localização", value: "location" },
      {
        key: "confirmedCount",
        label: "Confirmados",
        value: "confirmedCount",
      },
      {
        key: "adultPayingCount",
        label: "Adultos pagantes",
        value: "adultPayingCount",
      },
      {
        key: "payingChildCount",
        label: "Crianças pagantes",
        value: "payingChildCount",
      },
      {
        key: "nonPayingChildCount",
        label: "Crianças não pagantes",
        value: "nonPayingChildCount",
      },
      {
        key: "unknownChildCount",
        label: "Crianças sem idade",
        value: "unknownChildCount",
      },
      {
        key: "restrictionInviteCount",
        label: "Pessoas com restrição",
        value: "restrictionInviteCount",
      },
      {
        key: "tableNotes",
        label: "Observações da mesa",
        value: "tableNotes",
      },
    ];
  }

  function getBuffetFinalRestrictionColumns() {
    return [
      { key: "table", label: "Mesa", value: "table" },
      {
        key: "person",
        label: "Pessoa",
        value: "person",
      },
      {
        key: "invite",
        label: "Responsável pelo convite",
        value: "invite",
      },
      { key: "role", label: "Papel", value: "role" },
      {
        key: "buffetCategory",
        label: "Categoria do Buffet",
        value: "buffetCategory",
      },
      {
        key: "restriction",
        label: "Restrição alimentar",
        value: "restriction",
      },
    ];
  }

  function getBuffetFinalRestrictionExportRows(restrictionRows) {
    if (restrictionRows.length) {
      return restrictionRows;
    }

    return [
      {
        invite: "",
        buffetCategory: "",
        person: "",
        restriction: "",
        role: "",
        table: "Nenhuma restrição alimentar informada",
      },
    ];
  }

  function getBuffetFinalSummaryLines(summary) {
    return [
      `Confirmados: ${summary.confirmedCount} | Pagantes: ${summary.payingCount} | Adultos pagantes: ${summary.adultPayingCount}`,
      `Crianças: ${summary.childCount} | Pagantes: ${summary.payingChildCount} | Não pagantes: ${summary.nonPayingChildCount} | Sem idade: ${summary.unknownChildCount}`,
      `Pessoas com restrição: ${summary.restrictionPeopleCount} | Convites com restrição: ${summary.restrictionInviteCount} | RSVPs pendentes: ${summary.pendingRSVPCount} | Confirmados sem mesa: ${summary.withoutTableCount}`,
    ];
  }

  function exportBuffetFinalReport(format, mode = "summary") {
    const attendanceRows = getAttendanceRows();

    if (!attendanceRows.length) {
      AdminCommon.showToast("⚠️ Nenhuma presença confirmada para exportar");
      return;
    }

    const restrictionRows = getBuffetFinalRestrictionRows(attendanceRows);
    const restrictionExportRows =
      getBuffetFinalRestrictionExportRows(restrictionRows);
    const restrictionColumns = getBuffetFinalRestrictionColumns();
    const peopleRows = getBuffetFinalPeopleRows(attendanceRows);
    const peopleColumns = getBuffetFinalPeopleColumns();
    const tableRows = getBuffetFinalTableRows(peopleRows);
    const tableColumns = getBuffetFinalTableColumns();
    const summary = getBuffetFinalSummary(
      attendanceRows,
      restrictionRows,
      peopleRows,
    );
    let exported = false;

    if (format === "xlsx") {
      const summaryRowTypes = {
        5: "header",
        6: "total",
        7: "total",
        8: "total",
        9: "total",
        10: "total",
        11: "total",
        12: "total",
        13: "total",
        14: "total",
        15: summary.pendingRSVPCount ? "warning" : "total",
        16: summary.withoutTableCount ? "danger" : "total",
      };

      exported = AdminExport.downloadXLSXWorkbook(
        "resumo-final-buffet",
        [
          {
            merges: [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }],
            options: { autoFilter: false, rowTypes: summaryRowTypes },
            rows: getBuffetFinalSummarySheetRows(summary),
            sheetName: "Resumo",
          },
          {
            options: {
              getRowType: (rowValues) =>
                rowValues[0] === "Sem mesa" ? "danger" : "",
            },
            rows: AdminExport.buildRows(peopleColumns, peopleRows),
            sheetName: "Pessoas Confirmadas",
          },
          {
            options: {
              getRowType: (rowValues) =>
                rowValues[0] === "Sem mesa" ? "danger" : "",
            },
            rows: AdminExport.buildRows(tableColumns, tableRows),
            sheetName: "Resumo por Mesa",
          },
          {
            rows: AdminExport.buildRows(
              restrictionColumns,
              restrictionExportRows,
            ),
            sheetName: "Restrições Alimentares",
          },
        ],
      );
    } else if (format === "pdf") {
      const subtitleParts = [getBuffetRuleLabel()];
      const weddingDateLabel = getWeddingDateLabel();

      if (weddingDateLabel) {
        subtitleParts.unshift(`Casamento em ${weddingDateLabel}`);
      }

      const complete = mode === "complete";

      exported = AdminExport.downloadPDF(
        complete ? "relatorio-completo-buffet" : "resumo-final-buffet",
        {
          columns: complete
            ? getBuffetFinalCompletePDFColumns()
            : restrictionColumns,
          getRowStyle: complete
            ? (row) =>
                row.table === "Sem mesa"
                  ? { fillColor: [255, 240, 240], textColor: [140, 35, 35] }
                  : null
            : undefined,
          orientation: "landscape",
          rows: complete ? peopleRows : restrictionExportRows,
          subtitle: subtitleParts.join(" - "),
          summary: getBuffetFinalSummaryLines(summary),
          title: `${getWeddingCoupleLabel()} - ${
            complete
              ? "Relatório Completo do Buffet"
              : "Resumo Final do Buffet"
          }`,
        },
      );
    }

    if (!exported) {
      AdminCommon.showToast(
        `⚠️ ${format.toUpperCase()} indisponível. Tente novamente em instantes`,
      );
      return;
    }

    closeBuffetFinalReportModal();
    AdminCommon.showToast("💜 Resumo final do buffet exportado!");
  }

  function getSingleGiftFinancialRows(gift, guestMap) {
    const price = Number(gift.price || 0);
    const isReserved = gift.status === "Reservado" || gift.reserved_guest_id;
    const isBought =
      gift.status === "Comprado" || gift.payment_status === "Confirmado";
    const isReported = gift.payment_status === "Informado";

    if (isQuotaGift(gift) || !price || (!isReserved && !isBought && !isReported)) {
      return [];
    }

    return [
      {
        type: "Presente individual",
        item: gift.name,
        guest: getGuestName(gift.reserved_guest_id, guestMap, gift.reserved_name),
        status: gift.payment_status || gift.status || "Pendente",
        value: price,
        date: gift.reserved_at,
      },
    ];
  }

  function getContributionFinancialRows(giftMap, guestMap) {
    return reportData.contributions
      .map((contribution) => {
        const gift = giftMap[contribution.gift_id];
        const value = getContributionValue(contribution);

        if (!value) {
          return null;
        }

        return {
          type: "Cota",
          item: gift?.name || "Presente não encontrado",
          guest: getGuestName(
            contribution.guest_id,
            guestMap,
            contribution.contributor_name,
          ),
          status: contribution.payment_status || "Pendente",
          value,
          date: contribution.payment_reported_at || contribution.created_at,
        };
      })
      .filter(Boolean);
  }

  function getFinancialReportColumns() {
    return [
      { key: "type", label: "Tipo", value: "type" },
      { key: "item", label: "Item", value: "item" },
      { key: "guest", label: "Convidado", value: "guest" },
      { key: "status", label: "Status", value: "status" },
      { key: "value", label: "Valor", value: "formattedValue" },
      { key: "date", label: "Data", value: "formattedDate" },
    ];
  }

  function getFinancialReportRows() {
    const giftMap = getGiftMap();
    const guestMap = getGuestMap();

    return [
      ...reportData.gifts.flatMap((gift) =>
        getSingleGiftFinancialRows(gift, guestMap),
      ),
      ...getContributionFinancialRows(giftMap, guestMap),
    ].map((row) => ({
      ...row,
      formattedDate: formatDate(row.date),
      formattedValue: formatCurrency(row.value),
    }));
  }

  function exportFinancialReport(format) {
    const rows = getFinancialReportRows();
    const columns = filterColumns(
      getFinancialReportColumns(),
      getSelectedColumns("[data-financial-column]:checked", "financialColumn"),
    );

    if (!rows.length) {
      AdminCommon.showToast("⚠️ Nenhum valor reservado para exportar");
      return;
    }

    const exported = downloadReport({
      columns,
      filename: "relatorio-presentes-cotas",
      format,
      rows,
      sheetName: "Valores",
    });

    if (exported) {
      closeFinancialReportModal();
      AdminCommon.showToast("💜 Relatório de presentes e cotas exportado!");
    }
  }

  function setReportSelectOptions(selectId, options, placeholder = "Todos") {
    const select = document.getElementById(selectId);
    const currentValue = select?.value || "";

    if (!select) {
      return;
    }

    select.replaceChildren(new Option(placeholder, ""));
    options.forEach((option) => {
      select.appendChild(new Option(option.label, option.value));
    });
    select.value = options.some((option) => option.value === currentValue)
      ? currentValue
      : "";
  }

  function getReportSelectValue(selectId) {
    return document.getElementById(selectId)?.value || "";
  }

  function isFinancialContextMatch(itemContext, filterContext) {
    return !filterContext || filterContext === "all" || itemContext === filterContext;
  }

  function getFinancialBudgetBalanceLabel(item) {
    const delta = Number(item.linked_delta || 0);

    if (delta > 0) {
      return `Estouro ${formatCurrency(delta)}`;
    }

    if (delta < 0) {
      return `Saldo ${formatCurrency(Math.abs(delta))}`;
    }

    return "No limite";
  }

  function getFinancialBudgetBalanceStatus(item) {
    const linkedCount = Number(item.linked_expense_count || 0);
    const delta = Number(item.linked_delta || 0);

    if (!linkedCount) {
      return "Sem gasto vinculado";
    }

    if (delta > 0) {
      return "Estourado";
    }

    if (delta < 0) {
      return "Com saldo";
    }

    return "No limite";
  }

  function isFinancialBudgetBalanceMatch(item, filter) {
    const linkedCount = Number(item.linked_expense_count || 0);
    const delta = Number(item.linked_delta || 0);

    return (
      !filter ||
      (filter === "under" && delta < 0) ||
      (filter === "over" && linkedCount > 0 && delta > 0) ||
      (filter === "even" && linkedCount > 0 && delta === 0) ||
      (filter === "unlinked" && linkedCount === 0)
    );
  }

  function populateFinancialBudgetReportFilters() {
    const context = getReportSelectValue("financialBudgetReportContextFilter") || "all";
    const scenarios = reportData.financialScenarios
      .filter((scenario) => isFinancialContextMatch(scenario.context, context))
      .map((scenario) => ({
        label: `${scenario.name || "-"} · ${getFinancialContextLabel(scenario.context)}`,
        value: scenario.id,
      }));
    const categories = reportData.financialCategories
      .filter((category) =>
        reportData.financialBudgetItems.some(
          (item) =>
            item.category_id === category.id &&
            isFinancialContextMatch(item.context, context),
        ),
      )
      .map((category) => ({
        label: `${category.name || "-"} · ${getFinancialContextLabel(category.context)}`,
        value: category.id,
      }));

    setReportSelectOptions("financialBudgetReportScenarioFilter", [
      { label: "Cenário de referência", value: "__reference__" },
      ...scenarios,
    ]);
    const scenarioSelect = document.getElementById("financialBudgetReportScenarioFilter");

    if (scenarioSelect && !scenarioSelect.value) {
      scenarioSelect.value = "__reference__";
    }

    setReportSelectOptions("financialBudgetReportCategoryFilter", categories, "Todas");
    setReportSelectOptions(
      "financialBudgetReportStatusFilter",
      Object.entries(financialBudgetStatusLabels).map(([value, label]) => ({
        label,
        value,
      })),
      "Todos",
    );
  }

  function populateFinancialExpensesReportFilters() {
    const context = getReportSelectValue("financialExpensesReportContextFilter") || "all";
    const expenses = reportData.financialExpenses.filter((expense) =>
      isFinancialContextMatch(expense.context, context),
    );
    const categoryIds = new Set(expenses.map((expense) => expense.category_id));
    const payerIds = new Set(expenses.map((expense) => expense.default_payer_id));
    const vendorIds = new Set(expenses.map((expense) => expense.vendor_id));
    const budgetItemIds = new Set(expenses.map((expense) => expense.budget_item_id));

    setReportSelectOptions(
      "financialExpensesReportCategoryFilter",
      reportData.financialCategories
        .filter((category) => categoryIds.has(category.id))
        .map((category) => ({
          label: `${category.name || "-"} · ${getFinancialContextLabel(category.context)}`,
          value: category.id,
        })),
      "Todas",
    );
    setReportSelectOptions(
      "financialExpensesReportTypeFilter",
      Object.entries(financialExpenseTypeLabels).map(([value, label]) => ({
        label,
        value,
      })),
      "Todos",
    );
    setReportSelectOptions(
      "financialExpensesReportStatusFilter",
      Object.entries(financialExpenseStatusLabels).map(([value, label]) => ({
        label,
        value,
      })),
      "Todos",
    );
    setReportSelectOptions(
      "financialExpensesReportPayerFilter",
      reportData.financialPayers
        .filter((payer) => payerIds.has(payer.id))
        .map((payer) => ({ label: payer.name || "-", value: payer.id })),
      "Todos",
    );
    setReportSelectOptions(
      "financialExpensesReportVendorFilter",
      [...new Map(
        expenses
          .filter((expense) => vendorIds.has(expense.vendor_id))
          .map((expense) => [
            expense.vendor_id,
            { label: expense.vendor_name || "-", value: expense.vendor_id },
          ]),
      ).values()],
      "Todos",
    );
    setReportSelectOptions(
      "financialExpensesReportBudgetItemFilter",
      reportData.financialBudgetItems
        .filter((item) => budgetItemIds.has(item.id))
        .map((item) => ({
          label: `${item.title || "-"} · ${item.scenario_name || "-"}`,
          value: item.id,
        })),
      "Todos",
    );
  }

  function populateFinancialPaymentsReportFilters() {
    const context = getReportSelectValue("financialPaymentsReportContextFilter") || "all";
    const payments = reportData.financialPayments.filter((payment) =>
      isFinancialContextMatch(payment.context, context),
    );
    const categoryIds = new Set(payments.map((payment) => payment.category_id));
    const payerIds = new Set(payments.map((payment) => payment.payer_id));

    setReportSelectOptions(
      "financialPaymentsReportCategoryFilter",
      reportData.financialCategories
        .filter((category) => categoryIds.has(category.id))
        .map((category) => ({
          label: `${category.name || "-"} · ${getFinancialContextLabel(category.context)}`,
          value: category.id,
        })),
      "Todas",
    );
    setReportSelectOptions(
      "financialPaymentsReportStatusFilter",
      Object.entries(financialPaymentStatusLabels).map(([value, label]) => ({
        label,
        value,
      })),
      "Todos",
    );
    setReportSelectOptions(
      "financialPaymentsReportPayerFilter",
      reportData.financialPayers
        .filter((payer) => payerIds.has(payer.id))
        .map((payer) => ({ label: payer.name || "-", value: payer.id })),
      "Todos",
    );
  }

  function getFilteredFinancialBudgetItems() {
    const context = getReportSelectValue("financialBudgetReportContextFilter") || "all";
    const scenario = getReportSelectValue("financialBudgetReportScenarioFilter");
    const category = getReportSelectValue("financialBudgetReportCategoryFilter");
    const status = getReportSelectValue("financialBudgetReportStatusFilter");
    const activeSelect = document.getElementById("financialBudgetReportActiveFilter");
    const active = activeSelect ? activeSelect.value : "active";
    const balance = getReportSelectValue("financialBudgetReportBalanceFilter");

    return reportData.financialBudgetItems
      .filter((item) => isFinancialContextMatch(item.context, context))
      .filter(
        (item) =>
          !scenario ||
          (scenario === "__reference__" && item.scenario_is_reference) ||
          item.scenario_id === scenario,
      )
      .filter((item) => !category || item.category_id === category)
      .filter((item) => !status || item.status === status)
      .filter(
        (item) =>
          !active ||
          (active === "active" && item.is_active) ||
          (active === "inactive" && !item.is_active),
      )
      .filter((item) => isFinancialBudgetBalanceMatch(item, balance));
  }

  function getFilteredFinancialBudgetRows() {
    return getFilteredFinancialBudgetItems()
      .map((item) => ({
        active: item.is_active ? "Ativo" : "Inativo",
        balanceLabel: getFinancialBudgetBalanceLabel(item),
        balanceStatus: getFinancialBudgetBalanceStatus(item),
        category: item.category_name,
        context: getFinancialContextLabel(item.context),
        expectedVendor: item.expected_vendor_name,
        linkedCount: Number(item.linked_expense_count || 0),
        linkedOpen: formatCurrency(item.linked_remaining_total),
        linkedPaid: formatCurrency(item.linked_paid_total),
        linkedTotal: formatCurrency(item.linked_expense_total),
        notes: item.notes,
        priority: getFinancialStatusLabel(item.priority, financialBudgetPriorityLabels),
        scenario: item.scenario_name,
        status: getFinancialStatusLabel(item.status, financialBudgetStatusLabels),
        title: item.title,
        total: formatCurrency(item.estimated_amount),
      }));
  }

  function exportFinancialBudgetReport(format = "csv") {
    const rows = getFilteredFinancialBudgetRows();
    const columns = filterColumns(
      [
        { key: "context", label: "Contexto", value: "context" },
        { key: "scenario", label: "Cenário", value: "scenario" },
        { key: "title", label: "Item Previsto", value: "title" },
        { key: "category", label: "Categoria", value: "category" },
        { key: "total", label: "Valor Previsto", value: "total" },
        { key: "linkedTotal", label: "Realizado Vinculado", value: "linkedTotal" },
        { key: "linkedPaid", label: "Pago Vinculado", value: "linkedPaid" },
        { key: "linkedOpen", label: "Em Aberto", value: "linkedOpen" },
        { key: "balanceLabel", label: "Saldo / Estouro", value: "balanceLabel" },
        {
          key: "balanceStatus",
          label: "Situação do Orçamento",
          value: "balanceStatus",
        },
        { key: "linkedCount", label: "Gastos Vinculados", value: "linkedCount" },
        { key: "status", label: "Status", value: "status" },
        { key: "active", label: "Situação", value: "active" },
        { key: "priority", label: "Prioridade", value: "priority" },
        {
          key: "expectedVendor",
          label: "Fornecedor/Referência",
          value: "expectedVendor",
        },
        { key: "notes", label: "Observações", value: "notes" },
      ],
      getSelectedColumns(
        "[data-financial-budget-column]:checked",
        "financialBudgetColumn",
      ),
    );

    if (!rows.length) {
      AdminCommon.showToast("⚠️ Nenhum item previsto encontrado para exportar");
      return;
    }

    if (format === "pdf") {
      exportFinancialBudgetPDF();
      return;
    }

    const exported = downloadReport({
      columns,
      filename: "financeiro-orcamento-previsto",
      format,
      rows,
      sheetName: "Orçamento",
    });

    if (exported) {
      closeFinancialBudgetReportModal();
      AdminCommon.showToast("💜 Orçamento previsto exportado!");
    }
  }

  function getSelectedFinancialContextLabel(selectId) {
    const value = getReportSelectValue(selectId) || "all";

    if (value === "all") {
      return "Todos os contextos";
    }

    return getFinancialContextLabel(value);
  }

  function getFinancialReportSubtitle(parts = []) {
    const weddingDateLabel = getWeddingDateLabel();
    const subtitleParts = parts.filter(Boolean);

    if (weddingDateLabel) {
      subtitleParts.push(`Casamento em ${weddingDateLabel}`);
    }

    return subtitleParts.join(" - ");
  }

  function getFinancialBudgetPDFSummary(items) {
    const totals = items.reduce(
      (accumulator, item) => {
        accumulator.estimated += Number(item.estimated_amount || 0);
        accumulator.linked += Number(item.linked_expense_total || 0);
        accumulator.paid += Number(item.linked_paid_total || 0);
        accumulator.open += Number(item.linked_remaining_total || 0);

        if (getFinancialBudgetBalanceStatus(item) === "Estourado") {
          accumulator.over += 1;
        }

        if (!Number(item.linked_expense_count || 0)) {
          accumulator.unlinked += 1;
        }

        return accumulator;
      },
      {
        estimated: 0,
        linked: 0,
        open: 0,
        over: 0,
        paid: 0,
        unlinked: 0,
      },
    );

    return [
      `Itens: ${items.length} | Previsto: ${formatCurrency(totals.estimated)} | Realizado: ${formatCurrency(totals.linked)}`,
      `Pago: ${formatCurrency(totals.paid)} | Em aberto: ${formatCurrency(totals.open)} | Estourados: ${totals.over} | Sem gasto vinculado: ${totals.unlinked}`,
    ];
  }

  function getFinancialBudgetPDFColumns() {
    return [
      { label: "Item previsto", value: "title" },
      { label: "Categoria", value: "category" },
      { label: "Previsto", value: "total" },
      { label: "Realizado", value: "linkedTotal" },
      { label: "Pago", value: "linkedPaid" },
      { label: "Em aberto", value: "linkedOpen" },
      { label: "Saldo/Estouro", value: "balanceLabel" },
      { label: "Status", value: "status" },
      { label: "Situação", value: "active" },
    ];
  }

  function exportFinancialBudgetPDF() {
    const items = getFilteredFinancialBudgetItems();
    const rows = getFilteredFinancialBudgetRows();
    const scenarioLabel =
      document.getElementById("financialBudgetReportScenarioFilter")
        ?.selectedOptions?.[0]?.textContent || "Cenário selecionado";
    const exported = AdminExport.downloadPDF("financeiro-orcamento-previsto", {
      columns: getFinancialBudgetPDFColumns(),
      getRowStyle: (row) => {
        if (row.active === "Inativo") {
          return { fillColor: [250, 250, 250], textColor: [100, 100, 100] };
        }

        if (row.balanceStatus === "Estourado") {
          return { fillColor: [253, 236, 236], textColor: [140, 35, 35] };
        }

        if (row.balanceStatus === "Sem gasto vinculado") {
          return { fillColor: [255, 247, 224], textColor: [117, 80, 0] };
        }

        return null;
      },
      orientation: "landscape",
      rows,
      subtitle: getFinancialReportSubtitle([
        getSelectedFinancialContextLabel("financialBudgetReportContextFilter"),
        scenarioLabel,
      ]),
      summary: getFinancialBudgetPDFSummary(items),
      title: `${getWeddingCoupleLabel()} - Orçamento Previsto`,
    });

    if (!exported) {
      AdminCommon.showToast("⚠️ PDF indisponível. Tente novamente em instantes");
      return;
    }

    closeFinancialBudgetReportModal();
    AdminCommon.showToast("💜 Orçamento previsto exportado!");
  }

  function getFilteredFinancialExpenses() {
    const context = getReportSelectValue("financialExpensesReportContextFilter") || "all";
    const category = getReportSelectValue("financialExpensesReportCategoryFilter");
    const type = getReportSelectValue("financialExpensesReportTypeFilter");
    const status = getReportSelectValue("financialExpensesReportStatusFilter");
    const payer = getReportSelectValue("financialExpensesReportPayerFilter");
    const vendor = getReportSelectValue("financialExpensesReportVendorFilter");
    const budgetLink = getReportSelectValue("financialExpensesReportBudgetLinkFilter");
    const budgetItem = getReportSelectValue("financialExpensesReportBudgetItemFilter");

    return reportData.financialExpenses
      .filter((expense) => isFinancialContextMatch(expense.context, context))
      .filter((expense) => !category || expense.category_id === category)
      .filter((expense) => !type || expense.type === type)
      .filter((expense) => !status || expense.status === status)
      .filter((expense) => !payer || expense.default_payer_id === payer)
      .filter((expense) => !vendor || expense.vendor_id === vendor)
      .filter(
        (expense) =>
          !budgetLink ||
          (budgetLink === "linked" && expense.budget_item_id) ||
          (budgetLink === "unlinked" && !expense.budget_item_id),
      )
      .filter((expense) => !budgetItem || expense.budget_item_id === budgetItem)
      .sort((first, second) =>
        String(first.title || "").localeCompare(String(second.title || ""), "pt-BR", {
          numeric: true,
          sensitivity: "base",
        }),
      );
  }

  function getExpensePaymentRows(expense) {
    return reportData.financialPayments
      .filter((payment) => payment.expense_id === expense.id)
      .sort((first, second) =>
        String(first.due_date || "").localeCompare(String(second.due_date || "")),
      );
  }

  function mapFinancialExpenseRow(expense, payment = null) {
    return {
      budgetItem: expense.budget_item_title || "",
      category: expense.category_name || "",
      context: getFinancialContextLabel(expense.context),
      contractedAt: formatReportDateOnly(expense.contracted_at),
      dueDate: payment ? formatReportDateOnly(payment.due_date) : "",
      expense: expense.title || "",
      lineType: payment ? "Parcela" : "Gasto",
      _expenseId: expense.id,
      notes: payment ? payment.notes || "" : expense.notes || "",
      paidAt: payment ? formatReportDateOnly(payment.paid_at) : "",
      paidValue: payment ? "" : formatCurrency(expense.paid_amount),
      payer: expense.default_payer_name || "",
      paymentLabel: payment
        ? payment.label || `Parcela ${payment.installment_number || ""}`.trim()
        : "",
      paymentMethod: getFinancialStatusLabel(
        expense.payment_method,
        financialPaymentMethodLabels,
      ),
      paymentPayer: payment ? payment.payer_name || "" : "",
      paymentStatus: payment
        ? getFinancialStatusLabel(
            payment.display_status || payment.status,
            financialPaymentStatusLabels,
          )
        : "",
      paymentValue: payment ? formatCurrency(payment.amount) : "",
      referenceUrl: payment ? "" : expense.reference_url || "",
      remainingValue: payment ? "" : formatCurrency(expense.remaining_amount),
      status: payment
        ? ""
        : getFinancialStatusLabel(expense.status, financialExpenseStatusLabels),
      totalValue: payment ? "" : formatCurrency(expense.total_amount),
      type: payment ? "" : getFinancialStatusLabel(expense.type, financialExpenseTypeLabels),
      vendor: expense.vendor_name || "",
    };
  }

  function getFinancialExpenseReportRows() {
    const includePayments = document.getElementById(
      "financialExpensesReportIncludePayments",
    )?.checked;

    return getFilteredFinancialExpenses().flatMap((expense) => {
      const rows = [mapFinancialExpenseRow(expense)];

      if (includePayments) {
        getExpensePaymentRows(expense).forEach((payment) => {
          rows.push(mapFinancialExpenseRow(expense, payment));
        });
      }

      return rows;
    });
  }

  function getFinancialGroupedMerges(rows, columns, groupKey, columnKeys) {
    const columnIndexes = columns
      .map((column, index) => (columnKeys.includes(column.key) ? index : null))
      .filter((index) => index !== null);
    const merges = [];
    let start = 0;

    while (start < rows.length) {
      const groupValue = rows[start][groupKey];
      let end = start;

      while (end + 1 < rows.length && rows[end + 1][groupKey] === groupValue) {
        end += 1;
      }

      if (groupValue && end > start) {
        columnIndexes.forEach((columnIndex) => {
          merges.push({
            s: { r: start + 1, c: columnIndex },
            e: { r: end + 1, c: columnIndex },
          });
        });
      }

      start = end + 1;
    }

    return merges;
  }

  function buildFinancialExpensesSheet(rows, columns) {
    const includePayments = document.getElementById(
      "financialExpensesReportIncludePayments",
    )?.checked;
    const mergeColumnKeys = [
      "context",
      "expense",
      "budgetItem",
      "category",
      "type",
      "vendor",
      "payer",
      "totalValue",
      "paidValue",
      "remainingValue",
      "paymentMethod",
      "status",
      "contractedAt",
      "referenceUrl",
    ];

    return {
      merges: includePayments
        ? getFinancialGroupedMerges(rows, columns, "_expenseId", mergeColumnKeys)
        : [],
      rows: AdminExport.buildRows(columns, rows),
    };
  }

  function getFinancialExpensesPDFColumns() {
    return [
      { label: "Item", value: "item" },
      { label: "Vencimento/Data", value: "date" },
      { label: "Valor", value: "value" },
      { label: "Pago", value: "paid" },
      { label: "Em aberto/Pago em", value: "openOrPaidAt" },
      { label: "Pagador", value: "payer" },
      { label: "Status", value: "status" },
    ];
  }

  function getFinancialExpenseSectionLabel(expense) {
    return [
      expense.title || "Gasto sem nome",
      expense.category_name ? `Categoria: ${expense.category_name}` : "",
      expense.vendor_name ? `Fornecedor: ${expense.vendor_name}` : "",
      expense.budget_item_title ? `Previsto: ${expense.budget_item_title}` : "",
      `Total: ${formatCurrency(expense.total_amount)}`,
    ]
      .filter(Boolean)
      .join(" | ");
  }

  function getFinancialExpensesPDFRows(expenses) {
    const includePayments = document.getElementById(
      "financialExpensesReportIncludePayments",
    )?.checked;

    return expenses.flatMap((expense) => {
      const baseRows = [
        {
          _rowType: "section",
          sectionLabel: getFinancialExpenseSectionLabel(expense),
        },
      ];

      if (!includePayments) {
        baseRows.push({
          date: formatReportDateOnly(expense.contracted_at),
          item: getFinancialStatusLabel(expense.type, financialExpenseTypeLabels),
          openOrPaidAt: formatCurrency(expense.remaining_amount),
          paid: formatCurrency(expense.paid_amount),
          payer: expense.default_payer_name || "",
          status: getFinancialStatusLabel(
            expense.status,
            financialExpenseStatusLabels,
          ),
          value: formatCurrency(expense.total_amount),
        });

        return baseRows;
      }

      const payments = getExpensePaymentRows(expense);

      if (!payments.length) {
        baseRows.push({
          _rowType: "empty",
          item: "Nenhuma parcela cadastrada para este gasto.",
        });

        return baseRows;
      }

      payments.forEach((payment) => {
        const status = getFinancialStatusLabel(
          payment.display_status || payment.status,
          financialPaymentStatusLabels,
        );

        baseRows.push({
          _rowType: status === "Atrasada" ? "danger" : "",
          date: formatReportDateOnly(payment.due_date),
          item: payment.label || `Parcela ${payment.installment_number || ""}`.trim(),
          openOrPaidAt: formatReportDateOnly(payment.paid_at),
          paid: "",
          payer: payment.payer_name || "",
          status,
          value: formatCurrency(payment.amount),
        });
      });

      return baseRows;
    });
  }

  function getFinancialExpensesPDFSummary(expenses) {
    const totals = expenses.reduce(
      (accumulator, expense) => {
        accumulator.total += Number(expense.total_amount || 0);
        accumulator.paid += Number(expense.paid_amount || 0);
        accumulator.open += Number(expense.remaining_amount || 0);
        return accumulator;
      },
      { open: 0, paid: 0, total: 0 },
    );
    const paymentCount = expenses.reduce(
      (total, expense) => total + getExpensePaymentRows(expense).length,
      0,
    );

    return [
      `Gastos: ${expenses.length} | Total: ${formatCurrency(totals.total)} | Pago: ${formatCurrency(totals.paid)} | Em aberto: ${formatCurrency(totals.open)}`,
      `Parcelas relacionadas: ${paymentCount}`,
    ];
  }

  function getFinancialPDFBodyRow(row, _rowIndex, columns) {
    if (row._rowType === "section") {
      return [
        {
          content: row.sectionLabel,
          colSpan: columns.length,
          styles: {
            fillColor: [243, 239, 250],
            fontStyle: "bold",
            textColor: [78, 59, 104],
          },
        },
      ];
    }

    if (row._rowType === "empty") {
      return [
        {
          content: row.item,
          colSpan: columns.length,
          styles: {
            fillColor: [250, 250, 250],
            fontStyle: "italic",
            textColor: [100, 100, 100],
          },
        },
      ];
    }

    return null;
  }

  function exportFinancialExpensesPDF() {
    const expenses = getFilteredFinancialExpenses();
    const includePayments = document.getElementById(
      "financialExpensesReportIncludePayments",
    )?.checked;
    const exported = AdminExport.downloadPDF("financeiro-gastos-reais", {
      columns: getFinancialExpensesPDFColumns(),
      getBodyRow: getFinancialPDFBodyRow,
      getRowStyle: (row) =>
        row._rowType === "danger"
          ? { fillColor: [253, 236, 236], textColor: [140, 35, 35] }
          : null,
      orientation: "landscape",
      rows: getFinancialExpensesPDFRows(expenses),
      subtitle: getFinancialReportSubtitle([
        getSelectedFinancialContextLabel("financialExpensesReportContextFilter"),
        includePayments ? "Com parcelas" : "Resumo dos gastos",
      ]),
      summary: getFinancialExpensesPDFSummary(expenses),
      title: `${getWeddingCoupleLabel()} - Gastos Reais`,
    });

    if (!exported) {
      AdminCommon.showToast("⚠️ PDF indisponível. Tente novamente em instantes");
      return;
    }

    closeFinancialExpensesReportModal();
    AdminCommon.showToast("💜 Gastos reais exportados!");
  }

  function exportFinancialExpensesReport(format = "csv") {
    const rows = getFinancialExpenseReportRows();
    const columns = filterColumns(
      [
        { key: "lineType", label: "Tipo de Linha", value: "lineType" },
        { key: "context", label: "Contexto", value: "context" },
        { key: "expense", label: "Gasto", value: "expense" },
        {
          key: "budgetItem",
          label: "Item Previsto Vinculado",
          value: "budgetItem",
        },
        { key: "category", label: "Categoria", value: "category" },
        { key: "type", label: "Tipo", value: "type" },
        { key: "vendor", label: "Fornecedor", value: "vendor" },
        { key: "payer", label: "Pagador Principal", value: "payer" },
        { key: "totalValue", label: "Valor Total", value: "totalValue" },
        { key: "paidValue", label: "Pago", value: "paidValue" },
        { key: "remainingValue", label: "Em Aberto", value: "remainingValue" },
        {
          key: "paymentMethod",
          label: "Forma de Pagamento",
          value: "paymentMethod",
        },
        { key: "status", label: "Status do Gasto", value: "status" },
        {
          key: "contractedAt",
          label: "Data de Contratação/Compra",
          value: "contractedAt",
        },
        { key: "paymentLabel", label: "Parcela", value: "paymentLabel" },
        {
          key: "paymentPayer",
          label: "Pagador da Parcela",
          value: "paymentPayer",
        },
        {
          key: "paymentValue",
          label: "Valor da Parcela",
          value: "paymentValue",
        },
        { key: "dueDate", label: "Vencimento", value: "dueDate" },
        { key: "paidAt", label: "Pago em", value: "paidAt" },
        {
          key: "paymentStatus",
          label: "Status da Parcela",
          value: "paymentStatus",
        },
        { key: "referenceUrl", label: "Link/Referência", value: "referenceUrl" },
        { key: "notes", label: "Observações", value: "notes" },
      ],
      getSelectedColumns(
        "[data-financial-expenses-column]:checked",
        "financialExpensesColumn",
      ),
    );

    if (!rows.length) {
      AdminCommon.showToast("⚠️ Nenhum gasto real encontrado para exportar");
      return;
    }

    if (format === "pdf") {
      exportFinancialExpensesPDF();
      return;
    }

    if (!columns.length) {
      AdminCommon.showToast("⚠️ Selecione pelo menos uma coluna para exportar");
      return;
    }

    const sheet = format === "xlsx" ? buildFinancialExpensesSheet(rows, columns) : null;
    const exported =
      format === "xlsx"
        ? AdminExport.downloadXLSX(
            "financeiro-gastos-reais",
            "Gastos",
            sheet.rows,
            sheet.merges,
          )
        : downloadReport({
            columns,
            filename: "financeiro-gastos-reais",
            format,
            rows,
            sheetName: "Gastos",
          });

    if (exported) {
      closeFinancialExpensesReportModal();
      AdminCommon.showToast("💜 Gastos reais exportados!");
      return;
    }

    if (format === "xlsx") {
      AdminCommon.showToast("⚠️ XLSX indisponível. Tente novamente em instantes");
    }
  }

  function getFilteredFinancialPaymentRows() {
    const context = getReportSelectValue("financialPaymentsReportContextFilter") || "all";
    const category = getReportSelectValue("financialPaymentsReportCategoryFilter");
    const status = getReportSelectValue("financialPaymentsReportStatusFilter");
    const payer = getReportSelectValue("financialPaymentsReportPayerFilter");
    const dueFrom = getReportSelectValue("financialPaymentsReportDueFromFilter");
    const dueTo = getReportSelectValue("financialPaymentsReportDueToFilter");
    const expenseMap = new Map(
      reportData.financialExpenses.map((expense) => [expense.id, expense]),
    );

    return reportData.financialPayments
      .filter((payment) => isFinancialContextMatch(payment.context, context))
      .filter((payment) => !category || payment.category_id === category)
      .filter(
        (payment) =>
          !status ||
          payment.status === status ||
          payment.display_status === status,
      )
      .filter((payment) => !payer || payment.payer_id === payer)
      .filter((payment) => !dueFrom || payment.due_date >= dueFrom)
      .filter((payment) => !dueTo || payment.due_date <= dueTo)
      .sort((first, second) =>
        String(first.due_date || "").localeCompare(String(second.due_date || "")),
      )
      .map((payment) => {
        const expense = expenseMap.get(payment.expense_id);

        return {
          _dueDateSort: payment.due_date || "",
          _expenseId: payment.expense_id,
          budgetItem: expense?.budget_item_title || "",
          category: payment.category_name || "",
          context: getFinancialContextLabel(payment.context),
          dueDate: formatReportDateOnly(payment.due_date),
          expense: payment.expense_title || "",
          notes: payment.notes || "",
          paidAt: formatReportDateOnly(payment.paid_at),
          payer: payment.payer_name || "",
          payment: payment.label || `Parcela ${payment.installment_number || ""}`.trim(),
          status: getFinancialStatusLabel(
            payment.display_status || payment.status,
            financialPaymentStatusLabels,
          ),
          value: formatCurrency(payment.amount),
        };
      });
  }

  function buildFinancialPaymentsSheet(rows, columns) {
    const xlsxRows = [...rows].sort((first, second) => {
      const expenseComparison = String(first.expense || "").localeCompare(
        String(second.expense || ""),
        "pt-BR",
        {
          numeric: true,
          sensitivity: "base",
        },
      );

      if (expenseComparison !== 0) {
        return expenseComparison;
      }

      const idComparison = String(first._expenseId || "").localeCompare(
        String(second._expenseId || ""),
      );

      if (idComparison !== 0) {
        return idComparison;
      }

      return String(first._dueDateSort || "").localeCompare(
        String(second._dueDateSort || ""),
      );
    });
    const mergeColumnKeys = ["context", "expense", "budgetItem", "category"];

    return {
      merges: getFinancialGroupedMerges(
        xlsxRows,
        columns,
        "_expenseId",
        mergeColumnKeys,
      ),
      rows: AdminExport.buildRows(columns, xlsxRows),
    };
  }

  function getFinancialPaymentMonthLabel(row) {
    if (!row._dueDateSort) {
      return "Sem vencimento";
    }

    const [year, month] = String(row._dueDateSort).split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);

    if (Number.isNaN(date.getTime())) {
      return "Sem vencimento";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(date);
  }

  function getFinancialPaymentsPDFColumns() {
    return [
      { label: "Vencimento", value: "dueDate" },
      { label: "Gasto", value: "expense" },
      { label: "Parcela", value: "payment" },
      { label: "Valor", value: "value" },
      { label: "Pagador", value: "payer" },
      { label: "Status", value: "status" },
      { label: "Pago em", value: "paidAt" },
    ];
  }

  function getFinancialPaymentsPDFRows(rows) {
    const sortedRows = [...rows].sort((first, second) => {
      const dateComparison = String(first._dueDateSort || "").localeCompare(
        String(second._dueDateSort || ""),
      );

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return String(first.expense || "").localeCompare(String(second.expense || ""), "pt-BR", {
        numeric: true,
        sensitivity: "base",
      });
    });
    const pdfRows = [];
    let currentMonth = "";

    sortedRows.forEach((row) => {
      const monthLabel = getFinancialPaymentMonthLabel(row);

      if (monthLabel !== currentMonth) {
        currentMonth = monthLabel;
        pdfRows.push({
          _rowType: "section",
          sectionLabel: monthLabel,
        });
      }

      pdfRows.push({
        ...row,
        _rowType: row.status === "Atrasada" ? "danger" : "",
      });
    });

    return pdfRows;
  }

  function getFinancialPaymentsPDFSummary(rows) {
    const totals = rows.reduce(
      (accumulator, row) => {
        const amount = Number(
          String(row.value || "")
            .replace(/[^\d,-]/g, "")
            .replace(/\./g, "")
            .replace(",", "."),
        ) || 0;

        accumulator.total += amount;

        if (row.status === "Paga") {
          accumulator.paid += amount;
          accumulator.paidCount += 1;
        } else if (row.status === "Atrasada") {
          accumulator.overdue += amount;
          accumulator.overdueCount += 1;
        } else {
          accumulator.open += amount;
          accumulator.openCount += 1;
        }

        return accumulator;
      },
      {
        open: 0,
        openCount: 0,
        overdue: 0,
        overdueCount: 0,
        paid: 0,
        paidCount: 0,
        total: 0,
      },
    );

    return [
      `Parcelas: ${rows.length} | Total: ${formatCurrency(totals.total)} | Pagas: ${totals.paidCount} (${formatCurrency(totals.paid)})`,
      `Em aberto: ${totals.openCount} (${formatCurrency(totals.open)}) | Atrasadas: ${totals.overdueCount} (${formatCurrency(totals.overdue)})`,
    ];
  }

  function exportFinancialPaymentsPDF() {
    const rows = getFilteredFinancialPaymentRows();
    const exported = AdminExport.downloadPDF("financeiro-parcelas", {
      columns: getFinancialPaymentsPDFColumns(),
      getBodyRow: getFinancialPDFBodyRow,
      getRowStyle: (row) =>
        row._rowType === "danger"
          ? { fillColor: [253, 236, 236], textColor: [140, 35, 35] }
          : null,
      orientation: "landscape",
      rows: getFinancialPaymentsPDFRows(rows),
      subtitle: getFinancialReportSubtitle([
        getSelectedFinancialContextLabel("financialPaymentsReportContextFilter"),
        "Agenda financeira por vencimento",
      ]),
      summary: getFinancialPaymentsPDFSummary(rows),
      title: `${getWeddingCoupleLabel()} - Parcelas`,
    });

    if (!exported) {
      AdminCommon.showToast("⚠️ PDF indisponível. Tente novamente em instantes");
      return;
    }

    closeFinancialPaymentsReportModal();
    AdminCommon.showToast("💜 Parcelas exportadas!");
  }

  function exportFinancialPaymentsReport(format = "csv") {
    const rows = getFilteredFinancialPaymentRows();
    const columns = filterColumns(
      [
        { key: "context", label: "Contexto", value: "context" },
        { key: "expense", label: "Gasto", value: "expense" },
        {
          key: "budgetItem",
          label: "Item Previsto Vinculado",
          value: "budgetItem",
        },
        { key: "category", label: "Categoria", value: "category" },
        { key: "payment", label: "Parcela", value: "payment" },
        { key: "payer", label: "Pagador", value: "payer" },
        { key: "value", label: "Valor", value: "value" },
        { key: "dueDate", label: "Vencimento", value: "dueDate" },
        { key: "paidAt", label: "Pago em", value: "paidAt" },
        { key: "status", label: "Status", value: "status" },
        { key: "notes", label: "Observações", value: "notes" },
      ],
      getSelectedColumns(
        "[data-financial-payments-column]:checked",
        "financialPaymentsColumn",
      ),
    );

    if (!rows.length) {
      AdminCommon.showToast("⚠️ Nenhuma parcela encontrada para exportar");
      return;
    }

    if (format === "pdf") {
      exportFinancialPaymentsPDF();
      return;
    }

    if (!columns.length) {
      AdminCommon.showToast("⚠️ Selecione pelo menos uma coluna para exportar");
      return;
    }

    const sheet = format === "xlsx" ? buildFinancialPaymentsSheet(rows, columns) : null;
    const exported =
      format === "xlsx"
        ? AdminExport.downloadXLSX(
            "financeiro-parcelas",
            "Parcelas",
            sheet.rows,
            sheet.merges,
          )
        : downloadReport({
            columns,
            filename: "financeiro-parcelas",
            format,
            rows,
            sheetName: "Parcelas",
          });

    if (exported) {
      closeFinancialPaymentsReportModal();
      AdminCommon.showToast("💜 Parcelas exportadas!");
      return;
    }

    if (format === "xlsx") {
      AdminCommon.showToast("⚠️ XLSX indisponível. Tente novamente em instantes");
    }
  }

  function getPendingRSVPRows(rsvpMap) {
    return reportData.activeGuests
      .filter((guest) => !rsvpMap[guest.id])
      .map((guest) => ({
        type: "RSVP pendente",
        item: guest.name,
        guestSide: getGuestSideLabel(guest.guest_side),
        owner: guest.invite_code,
        status: "Sem RSVP",
        action: "Confirmar presença ou ausência",
      }));
  }

  function getPendingInviteRows() {
    return reportData.activeGuests
      .filter((guest) => !guest.invite_sent)
      .map((guest) => ({
        type: "Convite pendente",
        item: guest.name,
        guestSide: getGuestSideLabel(guest.guest_side),
        owner: guest.invite_code,
        status: "Não enviado",
        action: "Enviar convite e marcar como enviado",
      }));
  }

  function getPendingTableRows(rsvpMap, guestTableMap) {
    return reportData.activeGuests
      .filter(
        (guest) =>
          rsvpMap[guest.id]?.presence === "Sim" && !guestTableMap[guest.id],
      )
      .map((guest) => ({
        type: "Mesa pendente",
        item: guest.name,
        guestSide: getGuestSideLabel(guest.guest_side),
        owner: guest.invite_code,
        status: "Confirmado sem mesa",
        action: "Definir mesa do convite confirmado",
      }));
  }

  function getPendingTableAuditRows() {
    const guestMap = getAllGuestMap();
    const rsvpMap = getAllRSVPMap();

    return getSortedTables().flatMap((tableItem) => {
      const occupancy = getTableOccupancy(tableItem, guestMap, rsvpMap);
      const capacity = Number(tableItem.capacity || 0);
      const assignments = getTableAssignments(tableItem.id, guestMap);
      const rows = [];

      if (tableItem.is_active && capacity > 0 && occupancy.hybrid > capacity) {
        rows.push({
          type: "Mesa",
          item: tableItem.name,
          guestSide: "",
          owner: "Mapa de mesas",
          status: "Acima da capacidade",
          action: `Revisar distribuição: ${occupancy.hybrid}/${capacity} lugares no modo híbrido`,
        });
      }

      if (!tableItem.is_active && assignments.length) {
        rows.push({
          type: "Mesa",
          item: tableItem.name,
          guestSide: "",
          owner: "Mapa de mesas",
          status: "Inativa com convidados",
          action: "Ativar a mesa ou mover os convidados para outra mesa",
        });
      }

      assignments.forEach((item) => {
        const rsvp = rsvpMap[item.guest.id];

        if (!item.guest.active) {
          rows.push({
            type: "Mesa",
            item: item.guest.name,
            guestSide: getGuestSideLabel(item.guest.guest_side),
            owner: tableItem.name,
            status: "Convidado inativo em mesa",
            action: "Remover da mesa ou reativar o convidado",
          });
        }

        if (rsvp?.presence === "Não") {
          rows.push({
            type: "Mesa",
            item: item.guest.name,
            guestSide: getGuestSideLabel(item.guest.guest_side),
            owner: tableItem.name,
            status: "Não vai",
            action: "Remover da mesa ou manter apenas se for intencional",
          });
        }
      });

      return rows;
    });
  }

  function getPendingBuffetAuditRows(rsvpMap) {
    return reportData.activeGuests.flatMap((guest) => {
      const rsvp = rsvpMap[guest.id];

      if (rsvp?.presence !== "Sim") {
        return [];
      }

      const metrics = BuffetMetrics.getRSVPMetrics(
        guest,
        rsvp,
        reportData.buffetPayingAge,
      );
      const rows = [];

      if (metrics.unknownAgeChildren > 0) {
        rows.push({
          type: "Buffet",
          item: guest.name,
          guestSide: getGuestSideLabel(guest.guest_side),
          owner: guest.invite_code,
          status: "Criança sem idade",
          action: "Revisar idade para calcular pagantes do buffet",
        });
      }

      return rows;
    });
  }

  function getPendingGiftRows(giftMap, guestMap, guestSideMap) {
    const singleGiftRows = reportData.gifts
      .filter(
        (gift) =>
          !isQuotaGift(gift) &&
          gift.payment_status !== "Confirmado" &&
          (gift.status === "Reservado" || gift.payment_status === "Informado"),
      )
      .map((gift) => ({
        type: "Presente",
        item: gift.name,
        guestSide: guestSideMap[gift.reserved_guest_id] || "",
        owner: getGuestName(gift.reserved_guest_id, guestMap, gift.reserved_name),
        status: gift.payment_status || gift.status || "Pendente",
        action:
          gift.payment_status === "Informado"
            ? "Confirmar pagamento"
            : "Aguardar ou liberar reserva",
      }));

    const contributionRows = reportData.contributions
      .filter((contribution) => contribution.payment_status !== "Confirmado")
      .map((contribution) => {
        const gift = giftMap[contribution.gift_id];

        return {
          type: "Cota",
          item: gift?.name || "Presente não encontrado",
          guestSide: guestSideMap[contribution.guest_id] || "",
          owner: getGuestName(
            contribution.guest_id,
            guestMap,
            contribution.contributor_name,
          ),
          status: contribution.payment_status || "Pendente",
          action:
            contribution.payment_status === "Informado"
              ? "Confirmar contribuição"
              : "Aguardar pagamento",
        };
      });

    return [...singleGiftRows, ...contributionRows];
  }

  function getPendingReportColumns() {
    return [
      { key: "type", label: "Tipo", value: "type" },
      { key: "item", label: "Item", value: "item" },
      { key: "guestSide", label: "Convidado de", value: "guestSide" },
      { key: "owner", label: "Responsável", value: "owner" },
      { key: "status", label: "Status", value: "status" },
      { key: "action", label: "Ação sugerida", value: "action" },
    ];
  }

  function getPendingReportRows() {
    const rsvpMap = getRSVPMap();
    const giftMap = getGiftMap();
    const guestMap = getGuestMap();
    const guestSideMap = getGuestSideMap();
    const guestTableMap = getGuestTableMap();

    const rows = [
      ...getPendingInviteRows(),
      ...getPendingRSVPRows(rsvpMap),
      ...getPendingTableRows(rsvpMap, guestTableMap),
      ...getPendingTableAuditRows(),
      ...getPendingBuffetAuditRows(rsvpMap),
      ...getPendingGiftRows(giftMap, guestMap, guestSideMap),
    ];

    const seenRows = new Set();

    return rows.filter((row) => {
      const rowKey = [
        row.type,
        row.item,
        row.guestSide,
        row.owner,
        row.status,
        row.action,
      ].join("\u0000");

      if (seenRows.has(rowKey)) {
        return false;
      }

      seenRows.add(rowKey);
      return true;
    });
  }

  function exportPendingReport(format) {
    const rows = getPendingReportRows();
    const columns = filterColumns(
      getPendingReportColumns(),
      getSelectedColumns("[data-pending-column]:checked", "pendingColumn"),
    );

    if (!rows.length) {
      AdminCommon.showToast("⚠️ Nenhuma pendência para exportar");
      return;
    }

    const exported = downloadReport({
      columns,
      filename: "relatorio-pendencias",
      format,
      rows,
      sheetName: "Pendências",
    });

    if (exported) {
      closePendingReportModal();
      AdminCommon.showToast("💜 Relatório de pendências exportado!");
    }
  }

  function formatReportDateOnly(value) {
    const rawValue = String(value || "");

    if (!/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
      return value ? formatDate(value) : "";
    }

    const [year, month, day] = rawValue.split("-");
    return `${day}/${month}/${year}`;
  }

  function getReportTodayKey() {
    const parts = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date())
      .reduce((map, part) => {
        if (part.type !== "literal") {
          map[part.type] = part.value;
        }

        return map;
      }, {});

    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function getOperationalArea(type) {
    const areas = {
      "Convite pendente": "Convites",
      "RSVP pendente": "RSVP",
      "Mesa pendente": "Mesas",
      Mesa: "Mesas",
      Buffet: "Buffet",
      Presente: "Presentes e pagamentos",
      Cota: "Presentes e pagamentos",
    };

    return areas[type] || type || "Operação";
  }

  function getAutomaticOperationalPriority(row) {
    if (
      [
        "Acima da capacidade",
        "Confirmado sem mesa",
        "Criança sem idade",
        "Informado",
      ].includes(row.status)
    ) {
      return "Alta";
    }

    if (row.status === "Não enviado") {
      return "Baixa";
    }

    return "Normal";
  }

  function getChecklistPriorityLabel(priority) {
    const labels = {
      high: "Alta",
      low: "Baixa",
      normal: "Normal",
    };

    return labels[priority] || "Normal";
  }

  function getChecklistPeriodLabel(periodKey) {
    const labels = {
      "12_months_before": "12 meses antes",
      "11_months_before": "11 meses antes",
      "10_months_before": "10 meses antes",
      "9_months_before": "9 meses antes",
      "8_months_before": "8 meses antes",
      "7_months_before": "7 meses antes",
      "6_months_before": "6 meses antes",
      "5_months_before": "5 meses antes",
      "4_months_before": "4 meses antes",
      "3_months_before": "3 meses antes",
      "2_months_before": "2 meses antes",
      "1_month_before": "1 mês antes",
      wedding_week: "Semana do casamento",
      wedding_day: "Dia do casamento",
      after_wedding: "Depois do casamento",
    };

    return labels[periodKey] || "Checklist";
  }

  function getChecklistResponsibleLabel(item) {
    const ownerLabels = {
      bride: "Noiva",
      couple: "Casal",
      family: "Família",
      groom: "Noivo",
      planner: "Cerimonial",
    };

    return item.responsible_name || ownerLabels[item.owner] || "Casal";
  }

  function getSelectedOperationalScope() {
    return (
      document.querySelector("[data-operational-scope]:checked")?.value || "all"
    );
  }

  function getOperationalScopeConfig(scope) {
    const configurations = {
      all: {
        filename: "checklist-operacional-final",
        label: "Tudo consolidado",
        sheetName: "Checklist Operacional",
        titleSuffix: "Checklist Operacional Final",
      },
      automatic: {
        filename: "checklist-operacional-pendencias",
        label: "Somente pendências automáticas",
        sheetName: "Pendências Operacionais",
        titleSuffix: "Checklist Operacional - Pendências",
      },
      checklist: {
        filename: "checklist-operacional-tarefas",
        label: "Somente tarefas do checklist",
        sheetName: "Tarefas do Checklist",
        titleSuffix: "Checklist Operacional - Tarefas",
      },
    };

    return configurations[scope] || configurations.all;
  }

  function getOperationalChecklistRows(scope = "all") {
    const automaticRows = getPendingReportRows().map((row) => ({
      _overdue: false,
      action: row.action,
      area: getOperationalArea(row.type),
      checkIn: "[   ]",
      dueDate: "",
      item: row.item,
      origin: "Sistema",
      period: "",
      priority: getAutomaticOperationalPriority(row),
      responsible: row.owner,
      status: row.status,
    }));
    const todayKey = getReportTodayKey();
    const checklistRows = reportData.checklistItems
      .filter((item) => item.status !== "completed")
      .map((item) => {
        const overdue = Boolean(item.due_date && item.due_date < todayKey);
        const actionDetails = [item.description, item.notes]
          .map((value) => String(value || "").trim())
          .filter(Boolean)
          .join(" | ");

        return {
          _overdue: overdue,
          action: actionDetails || "Concluir tarefa do checklist",
          area: item.category_name || "Checklist",
          checkIn: "[   ]",
          dueDate: formatReportDateOnly(item.due_date),
          item: item.title,
          origin: "Checklist",
          period: getChecklistPeriodLabel(item.period_key),
          priority: getChecklistPriorityLabel(item.priority),
          responsible: getChecklistResponsibleLabel(item),
          status:
            overdue
              ? "Atrasada"
              : item.status === "in_progress"
                ? "Em andamento"
                : "Pendente",
        };
      });
    const priorityOrder = { Alta: 0, Normal: 1, Baixa: 2 };

    const rowsByScope = {
      all: [...automaticRows, ...checklistRows],
      automatic: automaticRows,
      checklist: checklistRows,
    };

    return (rowsByScope[scope] || rowsByScope.all).sort((first, second) => {
      if (first._overdue !== second._overdue) {
        return first._overdue ? -1 : 1;
      }

      const priorityResult =
        (priorityOrder[first.priority] ?? 1) -
        (priorityOrder[second.priority] ?? 1);

      if (priorityResult !== 0) {
        return priorityResult;
      }

      const areaResult = compareReceptionText(first.area, second.area);

      if (areaResult !== 0) {
        return areaResult;
      }

      return compareReceptionText(first.item, second.item);
    });
  }

  function getOperationalChecklistColumns() {
    return [
      { key: "checkIn", label: "Concluído", value: "checkIn" },
      { key: "priority", label: "Prioridade", value: "priority" },
      { key: "area", label: "Área", value: "area" },
      { key: "origin", label: "Origem", value: "origin" },
      { key: "item", label: "Item", value: "item" },
      { key: "responsible", label: "Responsável", value: "responsible" },
      { key: "status", label: "Status", value: "status" },
      { key: "dueDate", label: "Prazo", value: "dueDate" },
      { key: "period", label: "Período", value: "period" },
      { key: "action", label: "Ação / Detalhes", value: "action" },
    ];
  }

  function getOperationalChecklistSummary(rows) {
    return rows.reduce(
      (summary, row) => {
        summary.total += 1;
        summary[row.priority.toLowerCase()] += 1;

        if (row._overdue) {
          summary.overdue += 1;
        }

        return summary;
      },
      { alta: 0, baixa: 0, normal: 0, overdue: 0, total: 0 },
    );
  }

  function getOperationalRowType(row) {
    if (row._overdue || row.priority === "Alta") {
      return "danger";
    }

    if (row.status === "Em andamento") {
      return "warning";
    }

    return "";
  }

  function exportOperationalChecklist(format) {
    const scope = getSelectedOperationalScope();
    const scopeConfig = getOperationalScopeConfig(scope);
    const rows = getOperationalChecklistRows(scope);
    const columns = getOperationalChecklistColumns();

    if (!rows.length) {
      AdminCommon.showToast("⚠️ Nenhum item no conteúdo escolhido para exportar");
      return;
    }

    const summary = getOperationalChecklistSummary(rows);
    const summaryLabel = [
      `Total: ${summary.total}`,
      `Alta: ${summary.alta}`,
      `Normal: ${summary.normal}`,
      `Baixa: ${summary.baixa}`,
      `Atrasadas: ${summary.overdue}`,
    ].join(" | ");
    let exported = false;

    if (format === "xlsx") {
      const sheetRows = AdminExport.buildRows(columns, rows);
      const priorityIndex = columns.findIndex((column) => column.key === "priority");
      const statusIndex = columns.findIndex((column) => column.key === "status");

      exported = AdminExport.downloadXLSX(
        scopeConfig.filename,
        scopeConfig.sheetName,
        sheetRows,
        [],
        {
          getRowType: (rowValues) => {
            if (
              rowValues[priorityIndex] === "Alta" ||
              rowValues[statusIndex] === "Atrasada"
            ) {
              return "danger";
            }

            return rowValues[statusIndex] === "Em andamento" ? "warning" : "";
          },
        },
      );
    } else if (format === "pdf") {
      const weddingDateLabel = getWeddingDateLabel();
      const subtitleParts = [
        `${scopeConfig.label} - ${rows.length} ações operacionais`,
      ];

      if (weddingDateLabel) {
        subtitleParts.push(`Casamento em ${weddingDateLabel}`);
      }

      exported = AdminExport.downloadPDF(scopeConfig.filename, {
        columns,
        getRowStyle: (row) => {
          const rowType = getOperationalRowType(row);

          if (rowType === "danger") {
            return { fillColor: [253, 236, 236], textColor: [140, 35, 35] };
          }

          if (rowType === "warning") {
            return { fillColor: [255, 247, 224], textColor: [117, 80, 0] };
          }

          return null;
        },
        orientation: "landscape",
        rows,
        subtitle: subtitleParts.join(" - "),
        summary: summaryLabel,
        title: `${getWeddingCoupleLabel()} - ${scopeConfig.titleSuffix}`,
      });
    }

    if (!exported) {
      AdminCommon.showToast(
        `⚠️ ${format.toUpperCase()} indisponível. Tente novamente em instantes`,
      );
      return;
    }

    closePendingReportModal();
    AdminCommon.showToast("💜 Checklist operacional exportado!");
  }

  function getSelectedTablesMode() {
    return (
      document.querySelector("[data-tables-mode]:checked")?.value || "hybrid"
    );
  }

  function getTablesReportColumns(detailLevel) {
    const columns = [
      { key: "table", label: "Mesa", value: "table" },
      { key: "active", label: "Ativa", value: "active" },
      { key: "status", label: "Situação", value: "status" },
      { key: "capacity", label: "Capacidade", value: "capacity" },
      { key: "planned", label: "Planejado", value: "planned" },
      { key: "confirmed", label: "Confirmado", value: "confirmed" },
      { key: "hybrid", label: "Híbrido", value: "hybrid" },
      { key: "available", label: "Vagas/Sobra", value: "available" },
      { key: "location", label: "Localização", value: "location" },
      { key: "tableNotes", label: "Observação da mesa", value: "tableNotes" },
      { key: "guest", label: "Convidado", value: "guest" },
      { key: "guestActive", label: "Convidado ativo", value: "guestActive" },
      { key: "guestPresence", label: "Presença RSVP", value: "guestPresence" },
      {
        key: "guestExpected",
        label: "Pessoas do convite",
        value: "guestExpected",
      },
      {
        key: "guestTableNote",
        label: "Observação do convidado na mesa",
        value: "guestTableNote",
      },
      ...(detailLevel === "detailed"
        ? [
            { key: "person", label: "Pessoa", value: "person" },
            { key: "personRole", label: "Papel", value: "personRole" },
            { key: "child", label: "Criança", value: "child" },
            { key: "age", label: "Idade", value: "age" },
            {
              key: "buffetCategory",
              label: "Categoria do buffet",
              value: "buffetCategory",
            },
            {
              key: "hasFoodRestriction",
              label: "Possui restrição alimentar",
              value: "hasFoodRestriction",
            },
            {
              key: "food",
              label: "Restrição alimentar",
              value: "food",
            },
            { key: "paying", label: "Pagante", value: "paying" },
          ]
        : []),
      { key: "inviteType", label: "Tipo", value: "inviteType" },
      { key: "guestSide", label: "Convidado de", value: "guestSide" },
    ];

    return filterColumns(
      columns,
      getSelectedColumns("[data-tables-column]:checked", "tablesColumn"),
    );
  }

  function getPlannedPeople(guest) {
    if (!guest?.active) {
      return [];
    }

    const invitedPeople =
      guest.invite_type === "couple"
        ? (guest.couple_members || []).map((member) => ({
            age: "",
            category: "adult-paying",
            child: "Não",
            name: member.name || "Membro do convite",
            paying: true,
            type: "Membro do convite",
          }))
        : [
            {
              age: "",
              category: "adult-paying",
              child: "Não",
              name: guest.name || "Convidado",
              paying: true,
              type: "Convidado",
            },
          ];
    const normalizedInvitedPeople =
      guest.invite_type === "couple" && invitedPeople.length < 2
        ? [
            ...invitedPeople,
            ...Array.from({ length: 2 - invitedPeople.length }, (_, index) => ({
              age: "",
              category: "adult-paying",
              child: "Não",
              name: `Membro previsto ${index + invitedPeople.length + 1}`,
              paying: true,
              type: "Membro do convite",
            })),
          ]
        : invitedPeople;
    const companions = Array.from(
      { length: Number(guest.max_guests || 0) },
      (_, index) => ({
        age: "",
        category: "",
        child: "",
        name: `Acompanhante previsto ${index + 1}`,
        paying: "",
        type: "Acompanhante previsto",
      }),
    );

    return [...normalizedInvitedPeople, ...companions];
  }

  function getPeopleForTablesReport(guest, rsvp, mode) {
    if (!guest?.active) {
      return [];
    }

    if (mode === "planned") {
      return getPlannedPeople(guest);
    }

    if (mode === "confirmed") {
      return BuffetMetrics.getConfirmedPeople(
        guest,
        rsvp,
        reportData.buffetPayingAge,
      );
    }

    if (rsvp) {
      return BuffetMetrics.getConfirmedPeople(
        guest,
        rsvp,
        reportData.buffetPayingAge,
      );
    }

    return getPlannedPeople(guest);
  }

  function getGuestCountForTablesReport(guest, rsvp, mode) {
    const counts = {
      confirmed: getConfirmedGuestCount(guest, rsvp),
      hybrid: getHybridGuestCount(guest, rsvp),
      planned: getPlannedGuestCount(guest),
    };

    return counts[mode] ?? counts.hybrid;
  }

  function getEmptyPersonFields() {
    return {
      age: "",
      buffetCategory: "",
      child: "",
      food: "",
      hasFoodRestriction: "",
      paying: "",
      person: "",
      personRole: "",
    };
  }

  function getPersonFields(person) {
    if (!person) {
      return getEmptyPersonFields();
    }

    return {
      age: person.age || "",
      buffetCategory: person.category
        ? BuffetMetrics.getCategoryLabel(person.category)
        : "",
      child: person.child || "",
      food: formatPersonDietaryRestriction(person),
      hasFoodRestriction: person.name
        ? formatBoolean(BuffetMetrics.hasPersonDietaryRestriction(person))
        : "",
      paying:
        typeof person.paying === "boolean"
          ? formatBoolean(person.paying)
          : person.paying || "",
      person: person.name || "",
      personRole: person.type || "",
    };
  }

  function getTablesReportRows(detailLevel, mode) {
    const guestMap = getAllGuestMap();
    const rsvpMap = getAllRSVPMap();

    return getSortedTables().flatMap((tableItem) => {
      const occupancy = getTableOccupancy(tableItem, guestMap, rsvpMap);
      const capacity = Number(tableItem.capacity || 0);
      const baseRow = {
        _tableId: tableItem.id,
        active: formatBoolean(tableItem.is_active),
        available: capacity ? capacity - Number(occupancy[mode] || 0) : "",
        capacity,
        confirmed: occupancy.confirmed,
        hybrid: occupancy.hybrid,
        location: tableItem.location || "",
        planned: occupancy.planned,
        status: getTableStatusLabel(getTableStatus(tableItem, occupancy, mode)),
        table: tableItem.name,
        tableNotes: tableItem.notes || "",
      };
      const assignments = getTableAssignments(tableItem.id, guestMap);

      if (!assignments.length) {
        return [
          {
            ...baseRow,
            _guestId: "",
            guest: "",
            guestActive: "",
            guestExpected: "",
            guestPresence: "",
            guestSide: "",
            guestTableNote: "",
            inviteType: "",
            ...getEmptyPersonFields(),
          },
        ];
      }

      return assignments.flatMap((item) => {
        const rsvp = rsvpMap[item.guest.id];
        const guestRow = {
          _guestId: item.guest.id,
          guest: item.guest.name,
          guestActive: formatBoolean(item.guest.active),
          guestExpected: getGuestCountForTablesReport(item.guest, rsvp, mode),
          guestPresence: rsvp?.presence || "Sem RSVP",
          guestSide: getGuestSideLabel(item.guest.guest_side),
          guestTableNote: String(item.assignment.notes || "").trim(),
          inviteType: getInviteTypeLabel(item.guest.invite_type),
        };

        if (detailLevel !== "detailed") {
          return {
            ...baseRow,
            ...guestRow,
            ...getEmptyPersonFields(),
          };
        }

        const people = getPeopleForTablesReport(item.guest, rsvp, mode);

        if (!people.length) {
          return {
            ...baseRow,
            ...guestRow,
            ...getEmptyPersonFields(),
          };
        }

        return people.map((person) => ({
          ...baseRow,
          ...guestRow,
          ...getPersonFields(person),
        }));
      });
    });
  }

  function getGroupMerges(rows, columns, groupKey, columnKeys) {
    const columnIndexes = columns
      .map((column, index) => (columnKeys.includes(column.key) ? index : null))
      .filter((index) => index !== null);
    const merges = [];
    let start = 0;

    while (start < rows.length) {
      const groupValue = rows[start][groupKey];
      let end = start;

      while (end + 1 < rows.length && rows[end + 1][groupKey] === groupValue) {
        end += 1;
      }

      if (groupValue && end > start) {
        columnIndexes.forEach((columnIndex) => {
          merges.push({
            s: { r: start + 1, c: columnIndex },
            e: { r: end + 1, c: columnIndex },
          });
        });
      }

      start = end + 1;
    }

    return merges;
  }

  function buildTablesReportSheet(rows, columns, detailLevel) {
    const tableMergeKeys = [
      "table",
      "active",
      "status",
      "capacity",
      "planned",
      "confirmed",
      "hybrid",
      "available",
      "location",
      "tableNotes",
    ];
    const guestMergeKeys = [
      "guest",
      "guestActive",
      "guestPresence",
      "guestExpected",
      "guestTableNote",
      "inviteType",
      "guestSide",
    ];
    const merges = [
      ...getGroupMerges(rows, columns, "_tableId", tableMergeKeys),
      ...(detailLevel === "detailed"
        ? getGroupMerges(rows, columns, "_guestId", guestMergeKeys)
        : []),
    ];

    return {
      merges,
      rows: AdminExport.buildRows(columns, rows),
    };
  }

  function getTablesModeLabel(mode) {
    const labels = {
      confirmed: "Confirmado",
      hybrid: "Híbrido",
      planned: "Planejado",
    };

    return labels[mode] || labels.hybrid;
  }

  function getTablesOperationalPDFColumns() {
    return [
      { label: "Mesa", value: "table" },
      { label: "Pessoa", value: "person" },
      { label: "Responsável pelo convite", value: "guest" },
      { label: "Papel", value: "personRole" },
      { label: "Presença RSVP", value: "guestPresence" },
      { label: "Categoria do Buffet", value: "buffetCategory" },
      { label: "Restrição alimentar", value: "food" },
      { label: "Observação na mesa", value: "guestTableNote" },
    ];
  }

  function getTablesOperationalPeople(assignments, rsvpMap, mode, table) {
    return assignments.flatMap((item) => {
      const rsvp = rsvpMap[item.guest.id];

      return getPeopleForTablesReport(item.guest, rsvp, mode).map((person) => ({
        ...getPersonFields(person),
        guest: item.guest.name,
        guestPresence: rsvp?.presence || "Sem RSVP",
        guestTableNote: String(item.assignment?.notes || "").trim(),
        table,
      }));
    });
  }

  function getTablesOperationalSectionLabel({
    available,
    capacity,
    location,
    name,
    notes,
    occupancy,
    status,
  }) {
    const parts = [
      name,
      `Situação: ${status}`,
      capacity ? `Capacidade: ${capacity}` : "Capacidade não informada",
      `Ocupação: ${occupancy}`,
    ];

    if (capacity) {
      parts.push(`Vagas/Sobra: ${available}`);
    }

    if (location) {
      parts.push(`Localização: ${location}`);
    }

    if (notes) {
      parts.push(`Observação da mesa: ${notes}`);
    }

    return parts.join(" | ");
  }

  function getTablesOperationalPDFData(mode) {
    const guestMap = getAllGuestMap();
    const rsvpMap = getAllRSVPMap();
    const assignedGuestIds = new Set(
      reportData.tableAssignments.map((assignment) => assignment.guest_id),
    );
    const groups = getSortedTables().map((tableItem) => {
      const occupancyTotals = getTableOccupancy(tableItem, guestMap, rsvpMap);
      const occupancy = Number(occupancyTotals[mode] || 0);
      const capacity = Number(tableItem.capacity || 0);
      const statusCode = getTableStatus(tableItem, occupancyTotals, mode);

      return {
        available: capacity ? capacity - occupancy : "",
        capacity,
        inactive: !tableItem.is_active,
        location: tableItem.location || "",
        name: tableItem.name,
        notes: tableItem.notes || "",
        occupancy,
        overCapacity: statusCode === "over",
        people: getTablesOperationalPeople(
          getTableAssignments(tableItem.id, guestMap),
          rsvpMap,
          mode,
          tableItem.name,
        ),
        status: getTableStatusLabel(statusCode),
      };
    });
    const unassignedPeople = reportData.allGuests
      .filter((guest) => !assignedGuestIds.has(guest.id))
      .flatMap((guest) => {
        const rsvp = rsvpMap[guest.id];

        return getPeopleForTablesReport(guest, rsvp, mode).map((person) => ({
          ...getPersonFields(person),
          guest: guest.name,
          guestPresence: rsvp?.presence || "Sem RSVP",
          guestTableNote: "",
          table: "Sem mesa",
        }));
      })
      .sort((first, second) => compareReceptionText(first.person, second.person));

    if (unassignedPeople.length) {
      groups.push({
        available: "",
        capacity: 0,
        inactive: false,
        location: "",
        name: "Sem mesa",
        notes: "Realizar a alocação antes de finalizar o mapa.",
        occupancy: unassignedPeople.length,
        overCapacity: false,
        people: unassignedPeople,
        status: "Pendente",
        withoutTable: true,
      });
    }

    const rows = groups.flatMap((group) => [
      {
        _groupType: group.withoutTable
          ? "danger"
          : group.overCapacity || (group.inactive && group.occupancy)
            ? "danger"
            : group.inactive
              ? "warning"
              : "section",
        _rowType: "section",
        sectionLabel: getTablesOperationalSectionLabel(group),
      },
      ...(group.people.length
        ? group.people
        : [
            {
              _rowType: "empty",
              emptyLabel: "Nenhuma pessoa considerada neste modo.",
            },
          ]),
    ]);

    return {
      rows,
      summary: [
        `Mesas cadastradas: ${reportData.tables.length} | Pessoas consideradas: ${groups.reduce((total, group) => total + group.occupancy, 0)} | Sem mesa: ${unassignedPeople.length}`,
        `Acima da capacidade: ${groups.filter((group) => group.overCapacity).length} | Mesas inativas com pessoas: ${groups.filter((group) => group.inactive && group.occupancy).length}`,
      ],
    };
  }

  function getTablesOperationalPDFBodyRow(row, _rowIndex, columns) {
    if (row._rowType === "section") {
      const styles = {
        fillColor: [243, 239, 250],
        fontStyle: "bold",
        textColor: [78, 59, 104],
      };

      if (row._groupType === "danger") {
        styles.fillColor = [253, 236, 236];
        styles.textColor = [140, 35, 35];
      } else if (row._groupType === "warning") {
        styles.fillColor = [255, 247, 224];
        styles.textColor = [117, 80, 0];
      }

      return [
        {
          content: row.sectionLabel,
          colSpan: columns.length,
          styles,
        },
      ];
    }

    if (row._rowType === "empty") {
      return [
        {
          content: row.emptyLabel,
          colSpan: columns.length,
          styles: {
            fillColor: [250, 250, 250],
            fontStyle: "italic",
            textColor: [100, 100, 100],
          },
        },
      ];
    }

    return null;
  }

  function exportTablesReport(format, detailLevel = "summary") {
    const mode = getSelectedTablesMode();
    const rows =
      format === "pdf" ? [] : getTablesReportRows(detailLevel, mode);
    const columns =
      format === "pdf" ? [] : getTablesReportColumns(detailLevel);

    if (format !== "pdf" && !rows.length) {
      AdminCommon.showToast("⚠️ Nenhuma mesa para exportar");
      return;
    }

    if (format !== "pdf" && !columns.length) {
      AdminCommon.showToast("⚠️ Selecione pelo menos uma coluna para exportar");
      return;
    }

    const suffix = `${mode === "hybrid" ? "hibrido" : mode}-${detailLevel}`;

    if (format === "csv") {
      AdminExport.downloadCSV(`relatorio-mesas-${suffix}`, columns, rows);
      closeTablesReportModal();
      AdminCommon.showToast("💜 Relatório de mesas exportado!");
      return;
    }

    if (format === "pdf") {
      const report = getTablesOperationalPDFData(mode);
      const subtitleParts = [`Modo ${getTablesModeLabel(mode)}`];
      const weddingDateLabel = getWeddingDateLabel();

      if (weddingDateLabel) {
        subtitleParts.unshift(`Casamento em ${weddingDateLabel}`);
      }

      const exported = AdminExport.downloadPDF(`mapa-de-mesas-${suffix}`, {
        columns: getTablesOperationalPDFColumns(),
        getBodyRow: getTablesOperationalPDFBodyRow,
        orientation: "landscape",
        rows: report.rows,
        subtitle: subtitleParts.join(" - "),
        summary: report.summary,
        title: `${getWeddingCoupleLabel()} - Mapa de Mesas`,
      });

      if (!exported) {
        AdminCommon.showToast("⚠️ PDF indisponível. Tente novamente em instantes");
        return;
      }

      closeTablesReportModal();
      AdminCommon.showToast("💜 Mapa de mesas exportado!");
      return;
    }

    const sheet = buildTablesReportSheet(rows, columns, detailLevel);
    const exported = AdminExport.downloadXLSX(
      `relatorio-mesas-${suffix}`,
      "Mesas",
      sheet.rows,
      sheet.merges,
    );

    if (exported) {
      closeTablesReportModal();
      AdminCommon.showToast("💜 Relatório de mesas exportado!");
      return;
    }

    AdminCommon.showToast("⚠️ XLSX indisponível. Tente novamente em instantes");
  }

  function getReceptionReportMode() {
    return (
      document.querySelector("[data-reception-mode]:checked")?.value ||
      "alphabetical"
    );
  }

  function getReceptionReportColumns() {
    const columns = [
      { key: "checkIn", label: "Chegada", value: "checkIn" },
      { key: "person", label: "Pessoa", value: "person" },
      { key: "invite", label: "Responsável pelo convite", value: "invite" },
      { key: "role", label: "Papel", value: "role" },
      { key: "table", label: "Mesa", value: "table" },
      {
        key: "tableNote",
        label: "Observação na mesa",
        value: "tableNote",
      },
      { key: "guestSide", label: "Convidado de", value: "guestSide" },
      {
        key: "buffetCategory",
        label: "Categoria do Buffet",
        value: "buffetCategory",
      },
      { key: "food", label: "Restrição alimentar", value: "food" },
    ];

    return filterColumns(
      columns,
      getSelectedColumns(
        "[data-reception-column]:checked",
        "receptionColumn",
      ),
    );
  }

  function compareReceptionText(first, second) {
    return String(first || "").localeCompare(String(second || ""), "pt-BR", {
      numeric: true,
      sensitivity: "base",
    });
  }

  function getWeddingReportSettings() {
    return (
      window.publicEventSettings || window.WeddingEventConfig?.defaults || {}
    );
  }

  function getWeddingCoupleLabel() {
    const settings = getWeddingReportSettings();
    const brideName = String(settings.bride_name || "Livia").trim();
    const groomName = String(settings.groom_name || "Messias").trim();

    return `${brideName} & ${groomName}`;
  }

  function getWeddingDateLabel() {
    const weddingDate = new Date(getWeddingReportSettings().wedding_date || "");

    if (Number.isNaN(weddingDate.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
    }).format(weddingDate);
  }

  function getReceptionReportRows(mode = "alphabetical") {
    const rows = getAttendanceRows().flatMap((attendanceRow) =>
      getConfirmedPeople(attendanceRow).map((person) => ({
        buffetCategory: BuffetMetrics.getCategoryLabel(person.category),
        checkIn: "[   ]",
        guestSide: getGuestSideLabel(attendanceRow.guest.guest_side),
        invite: attendanceRow.guest.name,
        person: person.name || attendanceRow.guest.name,
        food: formatPersonDietaryRestriction(person),
        role: person.type || "Convidado",
        table: attendanceRow.guestTable,
        tableNote: attendanceRow.guestTableGuestNote,
      })),
    );

    return rows.sort((first, second) => {
      if (mode === "table") {
        const firstWithoutTable = first.table === "Sem mesa" ? 0 : 1;
        const secondWithoutTable = second.table === "Sem mesa" ? 0 : 1;

        if (firstWithoutTable !== secondWithoutTable) {
          return firstWithoutTable - secondWithoutTable;
        }

        const tableComparison = compareReceptionText(first.table, second.table);

        if (tableComparison !== 0) {
          return tableComparison;
        }
      }

      return compareReceptionText(first.person, second.person);
    });
  }

  function exportReceptionReport(format) {
    const mode = getReceptionReportMode();
    const rows = getReceptionReportRows(mode);
    const columns = getReceptionReportColumns();

    if (!rows.length) {
      AdminCommon.showToast("⚠️ Nenhuma pessoa confirmada para exportar");
      return;
    }

    if (!columns.length) {
      AdminCommon.showToast("⚠️ Selecione pelo menos uma coluna para exportar");
      return;
    }

    const suffix = mode === "table" ? "por-mesa" : "alfabetica";
    let exported = false;

    if (format === "csv") {
      AdminExport.downloadCSV(`lista-recepcao-${suffix}`, columns, rows);
      exported = true;
    } else if (format === "xlsx") {
      exported = AdminExport.downloadXLSX(
        `lista-recepcao-${suffix}`,
        "Recepção",
        AdminExport.buildRows(columns, rows),
      );
    } else if (format === "pdf") {
      const weddingDateLabel = getWeddingDateLabel();
      const reportModeLabel =
        mode === "table" ? "Agrupada por mesa" : "Ordem alfabética";
      const confirmedPeopleLabel = `${rows.length} ${
        rows.length === 1 ? "pessoa confirmada" : "pessoas confirmadas"
      }`;
      const subtitleParts = [
        reportModeLabel,
        confirmedPeopleLabel,
      ];

      if (weddingDateLabel) {
        subtitleParts.push(`Casamento em ${weddingDateLabel}`);
      }

      exported = AdminExport.downloadPDF(`lista-recepcao-${suffix}`, {
        columns,
        getRowStyle: (row) =>
          row.table === "Sem mesa"
            ? { fillColor: [255, 240, 240], textColor: [140, 35, 35] }
            : null,
        orientation: "landscape",
        rows,
        subtitle: subtitleParts.join(" - "),
        title: `${getWeddingCoupleLabel()} - Lista para Recepção`,
      });
    }

    if (!exported) {
      AdminCommon.showToast(
        `⚠️ ${format.toUpperCase()} indisponível. Tente novamente em instantes`,
      );
      return;
    }

    closeReceptionReportModal();
    AdminCommon.showToast("💜 Lista para recepção exportada!");
  }

  document
    .getElementById("exportAttendanceReportButton")
    ?.addEventListener("click", openAttendanceReportModal);
  closeAttendanceReportModalButton?.addEventListener(
    "click",
    closeAttendanceReportModal,
  );
  attendanceReportModal?.addEventListener("click", (event) => {
    if (event.target === attendanceReportModal) {
      closeAttendanceReportModal();
    }
  });
  document.querySelectorAll("[data-attendance-export-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      exportAttendanceReport(
        button.dataset.attendanceExportMode,
        button.dataset.attendanceExportFormat,
      );
    });
  });
  document
    .getElementById("exportBuffetFinalReportButton")
    ?.addEventListener("click", openBuffetFinalReportModal);
  closeBuffetFinalReportModalButton?.addEventListener(
    "click",
    closeBuffetFinalReportModal,
  );
  buffetFinalReportModal?.addEventListener("click", (event) => {
    if (event.target === buffetFinalReportModal) {
      closeBuffetFinalReportModal();
    }
  });
  document
    .querySelectorAll("[data-buffet-final-export-format]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        exportBuffetFinalReport(
          button.dataset.buffetFinalExportFormat,
          button.dataset.buffetFinalExportMode,
        );
      });
    });
  document
    .getElementById("exportFinancialReportButton")
    ?.addEventListener("click", openFinancialReportModal);
  closeFinancialReportModalButton?.addEventListener(
    "click",
    closeFinancialReportModal,
  );
  financialReportModal?.addEventListener("click", (event) => {
    if (event.target === financialReportModal) {
      closeFinancialReportModal();
    }
  });
  document.querySelectorAll("[data-financial-export-format]").forEach((button) => {
    button.addEventListener("click", () => {
      exportFinancialReport(button.dataset.financialExportFormat);
    });
  });
  document
    .getElementById("exportFinancialBudgetReportButton")
    ?.addEventListener("click", openFinancialBudgetReportModal);
  closeFinancialBudgetReportModalButton?.addEventListener(
    "click",
    closeFinancialBudgetReportModal,
  );
  financialBudgetReportModal?.addEventListener("click", (event) => {
    if (event.target === financialBudgetReportModal) {
      closeFinancialBudgetReportModal();
    }
  });
  document
    .getElementById("financialBudgetReportContextFilter")
    ?.addEventListener("change", populateFinancialBudgetReportFilters);
  document.querySelectorAll("[data-financial-budget-export-format]").forEach((button) => {
    button.addEventListener("click", () => {
      exportFinancialBudgetReport(button.dataset.financialBudgetExportFormat);
    });
  });
  document
    .getElementById("exportFinancialExpensesReportButton")
    ?.addEventListener("click", openFinancialExpensesReportModal);
  closeFinancialExpensesReportModalButton?.addEventListener(
    "click",
    closeFinancialExpensesReportModal,
  );
  financialExpensesReportModal?.addEventListener("click", (event) => {
    if (event.target === financialExpensesReportModal) {
      closeFinancialExpensesReportModal();
    }
  });
  document
    .getElementById("financialExpensesReportContextFilter")
    ?.addEventListener("change", populateFinancialExpensesReportFilters);
  document.querySelectorAll("[data-financial-expenses-export-format]").forEach((button) => {
    button.addEventListener("click", () => {
      exportFinancialExpensesReport(button.dataset.financialExpensesExportFormat);
    });
  });
  document
    .getElementById("exportFinancialPaymentsReportButton")
    ?.addEventListener("click", openFinancialPaymentsReportModal);
  closeFinancialPaymentsReportModalButton?.addEventListener(
    "click",
    closeFinancialPaymentsReportModal,
  );
  financialPaymentsReportModal?.addEventListener("click", (event) => {
    if (event.target === financialPaymentsReportModal) {
      closeFinancialPaymentsReportModal();
    }
  });
  document
    .getElementById("financialPaymentsReportContextFilter")
    ?.addEventListener("change", populateFinancialPaymentsReportFilters);
  document.querySelectorAll("[data-financial-payments-export-format]").forEach((button) => {
    button.addEventListener("click", () => {
      exportFinancialPaymentsReport(button.dataset.financialPaymentsExportFormat);
    });
  });
  document
    .getElementById("exportPendingReportButton")
    ?.addEventListener("click", openPendingReportModal);
  closePendingReportModalButton?.addEventListener(
    "click",
    closePendingReportModal,
  );
  pendingReportModal?.addEventListener("click", (event) => {
    if (event.target === pendingReportModal) {
      closePendingReportModal();
    }
  });
  document.querySelectorAll("[data-pending-export-format]").forEach((button) => {
    button.addEventListener("click", () => {
      exportPendingReport(button.dataset.pendingExportFormat);
    });
  });
  document.querySelectorAll("[data-operational-export-format]").forEach((button) => {
    button.addEventListener("click", () => {
      exportOperationalChecklist(button.dataset.operationalExportFormat);
    });
  });
  document
    .getElementById("exportTablesReportButton")
    ?.addEventListener("click", openTablesReportModal);
  closeTablesReportModalButton?.addEventListener(
    "click",
    closeTablesReportModal,
  );
  tablesReportModal?.addEventListener("click", (event) => {
    if (event.target === tablesReportModal) {
      closeTablesReportModal();
    }
  });
  document.querySelectorAll("[data-tables-export-format]").forEach((button) => {
    button.addEventListener("click", () => {
      exportTablesReport(
        button.dataset.tablesExportFormat,
        button.dataset.tablesExportDetail,
      );
    });
  });
  document
    .getElementById("exportReceptionReportButton")
    ?.addEventListener("click", openReceptionReportModal);
  closeReceptionReportModalButton?.addEventListener(
    "click",
    closeReceptionReportModal,
  );
  receptionReportModal?.addEventListener("click", (event) => {
    if (event.target === receptionReportModal) {
      closeReceptionReportModal();
    }
  });
  document.querySelectorAll("[data-reception-export-format]").forEach((button) => {
    button.addEventListener("click", () => {
      exportReceptionReport(button.dataset.receptionExportFormat);
    });
  });

  window.AdminDashboardReports = {
    setData,
  };
})();
