(function () {
  const { formatDate } = AdminCommon;

  let reportData = {
    activeGuests: [],
    activeRSVPs: [],
    buffetPayingAge: BuffetMetrics.DEFAULT_PAYING_AGE,
    contributions: [],
    financialMetrics: null,
    gifts: [],
  };

  const attendanceReportModal = document.getElementById("attendanceReportModal");
  const closeAttendanceReportModalButton = document.getElementById(
    "closeAttendanceReportModalButton",
  );
  const financialReportModal = document.getElementById("financialReportModal");
  const closeFinancialReportModalButton = document.getElementById(
    "closeFinancialReportModalButton",
  );
  const pendingReportModal = document.getElementById("pendingReportModal");
  const closePendingReportModalButton = document.getElementById(
    "closePendingReportModalButton",
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

  function openFinancialReportModal() {
    financialReportModal?.classList.add("active");
  }

  function closeFinancialReportModal() {
    financialReportModal?.classList.remove("active");
  }

  function openPendingReportModal() {
    pendingReportModal?.classList.add("active");
  }

  function closePendingReportModal() {
    pendingReportModal?.classList.remove("active");
  }

  function getGuestMap() {
    return reportData.activeGuests.reduce((map, guest) => {
      map[guest.id] = guest.name;
      return map;
    }, {});
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

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatBoolean(value) {
    return value ? "Sim" : "Não";
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
      AdminCommon.showToast("Selecione pelo menos uma coluna para exportar.");
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
      AdminCommon.showToast("XLSX indisponível. Tente novamente em instantes.");
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

    return reportData.activeGuests
      .map((guest) => {
        const rsvp = rsvpMap[guest.id];

        return {
          buffetMetrics: getBuffetMetrics(guest, rsvp),
          guest,
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
      food: row.rsvp.food,
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
        food: row.rsvp.food,
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
      "inviteSent",
      "expectedCount",
      "childCount",
      "payingCount",
      "payingChildCount",
      "nonPayingChildCount",
      "unknownChildCount",
      "buffetRule",
      "food",
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
          food: index === 0 ? row.rsvp.food || "" : "",
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
      AdminCommon.showToast("Nenhuma presença confirmada para exportar.");
      return;
    }

    if (!columns.length) {
      AdminCommon.showToast("Selecione pelo menos uma coluna para exportar.");
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
        AdminCommon.showToast("XLSX indisponível. Tente novamente em instantes.");
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
        AdminCommon.showToast("XLSX indisponível. Tente novamente em instantes.");
        return;
      }
    }

    closeAttendanceReportModal();
    AdminCommon.showToast("Relatório de presença exportado.");
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
      AdminCommon.showToast("Nenhum valor reservado para exportar.");
      return;
    }

    const exported = downloadReport({
      columns,
      filename: "relatorio-financeiro",
      format,
      rows,
      sheetName: "Valores",
    });

    if (exported) {
      closeFinancialReportModal();
      AdminCommon.showToast("Relatório financeiro exportado.");
    }
  }

  function getPendingRSVPRows(rsvpMap) {
    return reportData.activeGuests
      .filter((guest) => !rsvpMap[guest.id])
      .map((guest) => ({
        type: "RSVP pendente",
        item: guest.name,
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
        owner: guest.invite_code,
        status: "Não enviado",
        action: "Enviar convite e marcar como enviado",
      }));
  }

  function getPendingGiftRows(giftMap, guestMap) {
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
      { key: "owner", label: "Responsável", value: "owner" },
      { key: "status", label: "Status", value: "status" },
      { key: "action", label: "Ação sugerida", value: "action" },
    ];
  }

  function getPendingReportRows() {
    const rsvpMap = getRSVPMap();
    const giftMap = getGiftMap();
    const guestMap = getGuestMap();

    return [
      ...getPendingInviteRows(),
      ...getPendingRSVPRows(rsvpMap),
      ...getPendingGiftRows(giftMap, guestMap),
    ];
  }

  function exportPendingReport(format) {
    const rows = getPendingReportRows();
    const columns = filterColumns(
      getPendingReportColumns(),
      getSelectedColumns("[data-pending-column]:checked", "pendingColumn"),
    );

    if (!rows.length) {
      AdminCommon.showToast("Nenhuma pendência para exportar.");
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
      AdminCommon.showToast("Relatório de pendências exportado.");
    }
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

  window.AdminDashboardReports = {
    setData,
  };
})();
