(function () {
  const { setText } = AdminCommon;

  function formatPercentage(value) {
    return `${Math.round(Number(value || 0))}%`;
  }

  function setStyleWidth(id, value) {
    const element = document.getElementById(id);

    if (element) {
      element.style.width = `${Math.max(0, Number(value || 0))}%`;
    }
  }

  function renderStackedChart({ total, totalLabel, totalElementId, barId, segments }) {
    setText(totalElementId, totalLabel);

    const normalizedSegments = segments.map((segment) => ({
      ...segment,
      percentage: total > 0 ? (segment.value / total) * 100 : 0,
    }));

    normalizedSegments.forEach((segment) => {
      setStyleWidth(
        segment.segmentId,
        segment.value > 0 ? Math.max(segment.percentage, 1.5) : 0,
      );
      setText(
        segment.legendId,
        `${segment.formattedValue || segment.value} · ${formatPercentage(segment.percentage)}`,
      );
    });

    const stackedBar = document.getElementById(barId);

    if (stackedBar) {
      stackedBar.setAttribute(
        "aria-label",
        normalizedSegments
          .map(
            (segment) =>
              `${segment.label}: ${segment.formattedValue || segment.value} (${formatPercentage(segment.percentage)})`,
          )
          .join(", "),
      );
    }
  }

  function updateAttendanceChart({ totalGuests, yesRSVP, noRSVP }) {
    const pendingRSVP = Math.max(0, totalGuests - yesRSVP - noRSVP);

    renderStackedChart({
      total: totalGuests,
      totalLabel: `${totalGuests} convite${totalGuests === 1 ? "" : "s"}`,
      totalElementId: "attendanceChartTotal",
      barId: "attendanceStackedBar",
      segments: [
        {
          label: "Confirmaram",
          value: yesRSVP,
          segmentId: "attendanceYesSegment",
          legendId: "attendanceYesLegend",
        },
        {
          label: "Não comparecerão",
          value: noRSVP,
          segmentId: "attendanceNoSegment",
          legendId: "attendanceNoLegend",
        },
        {
          label: "Sem RSVP",
          value: pendingRSVP,
          segmentId: "attendancePendingSegment",
          legendId: "attendancePendingLegend",
        },
      ],
    });
  }

  function updateGiftChart(giftMetrics) {
    renderStackedChart({
      total: giftMetrics.total,
      totalLabel: `${giftMetrics.total} presente${giftMetrics.total === 1 ? "" : "s"}`,
      totalElementId: "giftChartTotal",
      barId: "giftStackedBar",
      segments: [
        {
          label: "Disponíveis",
          value: giftMetrics.available,
          segmentId: "giftAvailableSegment",
          legendId: "giftAvailableLegend",
        },
        {
          label: "Parciais",
          value: giftMetrics.partial,
          segmentId: "giftPartialSegment",
          legendId: "giftPartialLegend",
        },
        {
          label: "Reservados",
          value: giftMetrics.reserved,
          segmentId: "giftReservedSegment",
          legendId: "giftReservedLegend",
        },
        {
          label: "Comprados",
          value: giftMetrics.bought,
          segmentId: "giftBoughtSegment",
          legendId: "giftBoughtLegend",
        },
      ],
    });
  }

  function updateBuffetChart(buffetMetrics) {
    const adultPaying = Math.max(
      0,
      buffetMetrics.payingPeople - buffetMetrics.payingChildren,
    );

    renderStackedChart({
      total: buffetMetrics.totalPeople,
      totalLabel: `${buffetMetrics.totalPeople} ${
        buffetMetrics.totalPeople === 1 ? "pessoa" : "pessoas"
      }`,
      totalElementId: "buffetChartTotal",
      barId: "buffetStackedBar",
      segments: [
        {
          label: "Adultos pagantes",
          value: adultPaying,
          segmentId: "buffetAdultSegment",
          legendId: "buffetAdultLegend",
        },
        {
          label: "Crianças pagantes",
          value: buffetMetrics.payingChildren,
          segmentId: "buffetPayingChildSegment",
          legendId: "buffetPayingChildLegend",
        },
        {
          label: "Crianças não pagantes",
          value: buffetMetrics.nonPayingChildren,
          segmentId: "buffetNonPayingChildSegment",
          legendId: "buffetNonPayingChildLegend",
        },
        {
          label: "Crianças sem idade",
          value: buffetMetrics.unknownAgeChildren,
          segmentId: "buffetUnknownChildSegment",
          legendId: "buffetUnknownChildLegend",
        },
      ],
    });
  }

  function updateFinancialChart(financialMetrics, formatCurrency) {
    const chartTotal =
      financialMetrics.totalValue > 0
        ? financialMetrics.totalValue
        : financialMetrics.reservedValue;

    renderStackedChart({
      total: chartTotal,
      totalLabel: formatCurrency(chartTotal),
      totalElementId: "financialChartTotal",
      barId: "financialStackedBar",
      segments: [
        {
          label: "Disponível",
          value: financialMetrics.availableValue,
          formattedValue: formatCurrency(financialMetrics.availableValue),
          segmentId: "financialAvailableSegment",
          legendId: "financialAvailableLegend",
        },
        {
          label: "Pendente",
          value: financialMetrics.pendingValue,
          formattedValue: formatCurrency(financialMetrics.pendingValue),
          segmentId: "financialPendingSegment",
          legendId: "financialPendingLegend",
        },
        {
          label: "Informado",
          value: financialMetrics.reportedValue,
          formattedValue: formatCurrency(financialMetrics.reportedValue),
          segmentId: "financialReportedSegment",
          legendId: "financialReportedLegend",
        },
        {
          label: "Confirmado",
          value: financialMetrics.confirmedValue,
          formattedValue: formatCurrency(financialMetrics.confirmedValue),
          segmentId: "financialConfirmedSegment",
          legendId: "financialConfirmedLegend",
        },
      ],
    });
  }

  window.AdminDashboardCharts = {
    updateAttendanceChart,
    updateBuffetChart,
    updateFinancialChart,
    updateGiftChart,
  };
})();
