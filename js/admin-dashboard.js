AdminCommon.setupLogout();

const { setText } = AdminCommon;
const showAdminToast = AdminCommon.showToast;

const dashboardMetricLinks = {
  totalGuests: "./admin-guests.html?status=active",
  totalConfirmed: "./admin-guests.html?confirmed=confirmed",
  totalCompanions: "./admin-rsvps.html?companions=with",
  totalYesRSVP: "./admin-rsvps.html?presence=Sim",
  totalNoRSVP: "./admin-rsvps.html?presence=N%C3%A3o",
  totalExpectedGuests: "./admin-rsvps.html?presence=Sim",
  totalPlannedGuests: "./admin-guests.html?status=active",
  totalPlannedCompanions: "./admin-guests.html?status=active",
  totalPlannedPeople: "./admin-guests.html?status=active",
  totalBrideGuests: "./admin-guests.html?side=bride",
  totalGroomGuests: "./admin-guests.html?side=groom",
  totalCoupleSideGuests: "./admin-guests.html?side=couple",
  totalIndividualInvites: "./admin-guests.html?type=individual",
  totalCoupleInvites: "./admin-guests.html?type=couple",
  totalInviteSentGuests: "./admin-guests.html?invite_sent=sent",
  totalInvitePendingGuests: "./admin-guests.html?invite_sent=not_sent",
  totalTables: "./admin-tables.html",
  totalActiveTables: "./admin-tables.html?status=active",
  totalAvailableTables: "./admin-tables.html?status=available",
  totalFullTables: "./admin-tables.html?status=full",
  totalOverTables: "./admin-tables.html?status=over",
  totalGuestsWithTable: "./admin-guests.html?table=assigned",
  totalGuestsWithoutTable: "./admin-guests.html?table=unassigned",
  totalConfirmedWithoutTable: "./admin-rsvps.html?presence=Sim&table=unassigned",
  totalDeclinedWithTable: "./admin-rsvps.html?presence=N%C3%A3o&table=assigned",
  totalPayingGuests: "./admin-rsvps.html?presence=Sim&buffet=paying",
  totalChildren: "./admin-rsvps.html?presence=Sim&buffet=children",
  totalPayingChildren: "./admin-rsvps.html?presence=Sim&buffet=child-paying",
  totalNonPayingChildren:
    "./admin-rsvps.html?presence=Sim&buffet=child-non-paying",
  totalUnknownAgeChildren:
    "./admin-rsvps.html?presence=Sim&buffet=child-unknown",
  totalDietaryRestrictionPeople: "./admin-rsvps.html?presence=Sim&restriction=with",
  totalGifts: "./admin-gifts.html",
  totalAvailableGifts: "./admin-gifts.html?status=Dispon%C3%ADvel",
  totalPartialGifts: "./admin-gifts.html?status=Parcial",
  totalReservedGifts: "./admin-gifts.html?status=Reservado",
  totalBoughtGifts: "./admin-gifts.html?status=Comprado",
  totalPaymentsReported: "./admin-gifts.html?payment=Informado",
  totalAvailableQuotas: "./admin-gifts.html?type=quota&quota=available",
  totalConfirmedQuotas: "./admin-gifts.html?type=quota&quota=fully_confirmed",
  totalGiftValue: "./admin-gifts.html",
  totalReservedValue: "./admin-gifts.html?status=Reservado",
  totalAvailableValue: "./admin-gifts.html?status=Dispon%C3%ADvel",
  totalReportedValue: "./admin-gifts.html?payment=Informado",
  totalConfirmedValue: "./admin-gifts.html?payment=Confirmado",
  totalPendingValue: "./admin-gifts.html?payment=Pendente",
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function isQuotaGift(gift) {
  return gift.gift_type === "quota";
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

function getQuotaStats(gift, contributions) {
  const giftContributions = contributions.filter(
    (contribution) => contribution.gift_id === gift.id,
  );

  return giftContributions.reduce(
    (stats, contribution) => {
      const quantity = Number(contribution.quota_quantity || 0);

      stats.reserved += quantity;

      if (contribution.payment_status === "Confirmado") {
        stats.confirmed += quantity;
      }

      if (contribution.payment_status === "Informado") {
        stats.informedPayments += 1;
      }

      return stats;
    },
    {
      reserved: 0,
      confirmed: 0,
      informedPayments: 0,
    },
  );
}

function getGiftMetrics(gifts, contributions) {
  return gifts.reduce(
    (metrics, gift) => {
      metrics.total += 1;

      if (!isQuotaGift(gift)) {
        if (gift.status === "Disponível") {
          metrics.available += 1;
        }

        if (gift.status === "Reservado") {
          metrics.reserved += 1;
          metrics.reservedIncludingPartial += 1;
        }

        if (gift.status === "Comprado") {
          metrics.bought += 1;
        }

        if (gift.payment_status === "Informado") {
          metrics.paymentsReported += 1;
        }

        return metrics;
      }

      const totalQuotas = Number(gift.quota_count || 0);
      const quotaStats = getQuotaStats(gift, contributions);
      const availableQuotas = Math.max(0, totalQuotas - quotaStats.reserved);
      const fullyConfirmed =
        totalQuotas > 0 && quotaStats.confirmed >= totalQuotas;
      const fullyReserved =
        totalQuotas > 0 && quotaStats.reserved >= totalQuotas;

      if (availableQuotas > 0) {
        metrics.available += 1;
      }

      if (quotaStats.reserved > 0 && quotaStats.reserved < totalQuotas) {
        metrics.partial += 1;
        metrics.reservedIncludingPartial += 1;
      }

      if (fullyReserved && !fullyConfirmed) {
        metrics.reserved += 1;
        metrics.reservedIncludingPartial += 1;
      }

      if (fullyConfirmed) {
        metrics.bought += 1;
      }

      metrics.paymentsReported += quotaStats.informedPayments;
      metrics.availableQuotas += availableQuotas;
      metrics.confirmedQuotas += quotaStats.confirmed;

      return metrics;
    },
    {
      total: 0,
      available: 0,
      partial: 0,
      reserved: 0,
      reservedIncludingPartial: 0,
      bought: 0,
      paymentsReported: 0,
      availableQuotas: 0,
      confirmedQuotas: 0,
    },
  );
}

function getFinancialMetrics(gifts, contributions) {
  const metrics = {
    totalValue: 0,
    reservedValue: 0,
    availableValue: 0,
    reportedValue: 0,
    confirmedValue: 0,
    pendingValue: 0,
  };

  gifts.forEach((gift) => {
    const price = Number(gift.price || 0);

    if (price > 0) {
      metrics.totalValue += price;
    }

    if (isQuotaGift(gift)) {
      return;
    }

    const isReserved = gift.status === "Reservado" || gift.reserved_guest_id;
    const isBought =
      gift.status === "Comprado" || gift.payment_status === "Confirmado";
    const isReported = gift.payment_status === "Informado";

    if (!price || (!isReserved && !isBought && !isReported)) {
      return;
    }

    metrics.reservedValue += price;

    if (isBought) {
      metrics.confirmedValue += price;
      return;
    }

    if (isReported) {
      metrics.reportedValue += price;
      return;
    }

    metrics.pendingValue += price;
  });

  contributions.forEach((contribution) => {
    const contributionValue = getContributionValue(contribution);

    if (!contributionValue) {
      return;
    }

    metrics.reservedValue += contributionValue;

    if (contribution.payment_status === "Confirmado") {
      metrics.confirmedValue += contributionValue;
      return;
    }

    if (contribution.payment_status === "Informado") {
      metrics.reportedValue += contributionValue;
      return;
    }

    metrics.pendingValue += contributionValue;
  });

  metrics.availableValue = Math.max(
    0,
    metrics.totalValue - metrics.reservedValue,
  );

  return metrics;
}

function getGuestSideMetrics(activeGuests) {
  return activeGuests.reduce(
    (metrics, guest) => {
      const side = guest.guest_side || "couple";
      metrics[side] = (metrics[side] || 0) + 1;
      metrics.total += 1;
      return metrics;
    },
    {
      bride: 0,
      couple: 0,
      groom: 0,
      total: 0,
    },
  );
}

function getConfirmedGuestCount(guest, rsvp, buffetPayingAge) {
  return BuffetMetrics.getConfirmedPeople(guest, rsvp, buffetPayingAge).length;
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

function getHybridGuestCount(guest, rsvp, buffetPayingAge) {
  return rsvp
    ? getConfirmedGuestCount(guest, rsvp, buffetPayingAge)
    : getPlannedGuestCount(guest);
}

function getTableMetrics({
  activeGuests,
  activeRSVPs,
  assignments,
  buffetPayingAge,
  tables,
}) {
  const guestMap = new Map(activeGuests.map((guest) => [guest.id, guest]));
  const rsvpMap = new Map(activeRSVPs.map((rsvp) => [rsvp.guest_id, rsvp]));
  const assignmentGuestIds = new Set(assignments.map((assignment) => assignment.guest_id));
  const assignmentsByTable = assignments.reduce((map, assignment) => {
    if (!map.has(assignment.table_id)) {
      map.set(assignment.table_id, []);
    }

    map.get(assignment.table_id).push(assignment);
    return map;
  }, new Map());

  const metrics = {
    active: 0,
    available: 0,
    declinedWithTable: 0,
    full: 0,
    guestsWithTable: 0,
    guestsWithoutTable: 0,
    inactive: 0,
    over: 0,
    confirmedWithoutTable: 0,
    total: tables.length,
  };

  activeGuests.forEach((guest) => {
    const hasTable = assignmentGuestIds.has(guest.id);
    const rsvp = rsvpMap.get(guest.id);

    if (hasTable) {
      metrics.guestsWithTable += 1;
    } else {
      metrics.guestsWithoutTable += 1;
    }

    if (!hasTable && rsvp?.presence === "Sim") {
      metrics.confirmedWithoutTable += 1;
    }

    if (hasTable && rsvp?.presence === "Não") {
      metrics.declinedWithTable += 1;
    }
  });

  tables.forEach((tableItem) => {
    if (!tableItem.is_active) {
      metrics.inactive += 1;
      return;
    }

    metrics.active += 1;

    const occupancy = (assignmentsByTable.get(tableItem.id) || []).reduce(
      (total, assignment) => {
        const guest = guestMap.get(assignment.guest_id);

        if (!guest) {
          return total;
        }

        return total + getHybridGuestCount(guest, rsvpMap.get(guest.id), buffetPayingAge);
      },
      0,
    );
    const capacity = Number(tableItem.capacity || 0);

    if (capacity > 0 && occupancy > capacity) {
      metrics.over += 1;
    } else if (capacity > 0 && occupancy >= capacity) {
      metrics.full += 1;
    } else {
      metrics.available += 1;
    }
  });

  return metrics;
}

function setupDashboardMetricNavigation() {
  Object.entries(dashboardMetricLinks).forEach(([metricId, href]) => {
    const metric = document.getElementById(metricId);
    const card = metric?.closest(".admin-card");

    if (!card) {
      return;
    }

    card.classList.add("admin-card-link");
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    card.setAttribute(
      "aria-label",
      `Abrir detalhes de ${card.textContent.trim()}`,
    );

    card.addEventListener("click", () => {
      window.location.href = href;
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = href;
      }
    });
  });

  document.querySelectorAll(".metric-help").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  });
}

async function loadDashboard() {
  const { data: guests, error: guestsError } = await supabaseClient
    .from("guests")
    .select("*");

  const { data: rsvps, error: rsvpsError } = await supabaseClient
    .from("rsvps")
    .select("*");

  const { data: gifts, error: giftsError } = await supabaseClient
    .from("gifts")
    .select("*");

  const { data: contributions, error: contributionsError } =
    await supabaseClient
      .from("gift_contributions")
      .select(
        "gift_id, guest_id, contributor_name, message, quota_quantity, quota_value, total_value, payment_status, payment_reported_at, created_at",
      );

  const { data: settings, error: settingsError } = await supabaseClient
    .rpc("get_public_settings")
    .maybeSingle();

  const { data: tables, error: tablesError } = await supabaseClient
    .rpc("admin_list_wedding_tables");

  const { data: tableAssignments, error: tableAssignmentsError } =
    await supabaseClient.rpc("admin_list_wedding_table_assignments");

  if (
    guestsError ||
    rsvpsError ||
    giftsError ||
    contributionsError ||
    settingsError ||
    tablesError ||
    tableAssignmentsError
  ) {
    console.error(
      guestsError ||
        rsvpsError ||
        giftsError ||
        contributionsError ||
        settingsError ||
        tablesError ||
        tableAssignmentsError,
    );
    showAdminToast("⚠️ Erro ao carregar dashboard");
    return;
  }

  const activeGuests = guests.filter((guest) => guest.active);
  const activeGuestIds = activeGuests.map((guest) => guest.id);
  const plannedGuestMetrics = activeGuests.reduce(
    (metrics, guest) => {
      const invitedGuests = guest.invite_type === "couple" ? 2 : 1;
      const companions = Math.max(0, Number(guest.max_guests || 0));

      metrics.guests += invitedGuests;
      metrics.companions += companions;
      metrics.total += invitedGuests + companions;

      return metrics;
    },
    {
      companions: 0,
      guests: 0,
      total: 0,
    },
  );

  const activeRSVPs = rsvps.filter((rsvp) =>
    activeGuestIds.includes(rsvp.guest_id),
  );
  const buffetPayingAge = BuffetMetrics.normalizePayingAge(
    settings?.buffet_paying_age,
  );
  const buffetMetrics = BuffetMetrics.getAttendanceMetrics(
    activeGuests,
    activeRSVPs,
    buffetPayingAge,
  );

  const totalYesRSVP = activeRSVPs.filter(
    (rsvp) => rsvp.presence === "Sim",
  ).length;

  const totalNoRSVP = activeRSVPs.filter(
    (rsvp) => rsvp.presence === "Não",
  ).length;

  const totalExpectedGuests = activeRSVPs.reduce((total, rsvp) => {
    const guestCount = Number(rsvp.guest_data?.guest_count || 0);
    const members = rsvp.guest_data?.members || [];

    if (members.length) {
      const coupleCount = members.filter(
        (member) => member.presence === "Sim",
      ).length;

      return coupleCount === 0 ? total : total + coupleCount + guestCount;
    }

    if (rsvp.presence !== "Sim") {
      return total;
    }

    return total + 1 + guestCount;
  }, 0);

  const totalCompanions = activeRSVPs.reduce((total, rsvp) => {
    if (rsvp.presence !== "Sim") {
      return total;
    }

    return total + Number(rsvp.guest_data?.guest_count || 0);
  }, 0);

  const giftMetrics = getGiftMetrics(gifts || [], contributions || []);
  const financialMetrics = getFinancialMetrics(
    gifts || [],
    contributions || [],
  );
  const guestSideMetrics = getGuestSideMetrics(activeGuests);
  const tableMetrics = getTableMetrics({
    activeGuests,
    activeRSVPs,
    assignments: tableAssignments || [],
    buffetPayingAge,
    tables: tables || [],
  });

  setText("totalGuests", activeGuests.length);
  setText(
    "totalConfirmed",
    activeGuests.filter((guest) => guest.confirmed).length,
  );
  setText("totalCompanions", totalCompanions);
  setText("totalYesRSVP", totalYesRSVP);
  setText("totalNoRSVP", totalNoRSVP);
  setText("totalExpectedGuests", totalExpectedGuests);
  setText("totalPlannedGuests", plannedGuestMetrics.guests);
  setText("totalPlannedCompanions", plannedGuestMetrics.companions);
  setText("totalPlannedPeople", plannedGuestMetrics.total);
  setText("totalBrideGuests", guestSideMetrics.bride);
  setText("totalGroomGuests", guestSideMetrics.groom);
  setText("totalCoupleSideGuests", guestSideMetrics.couple);
  setText(
    "totalIndividualInvites",
    activeGuests.filter((guest) => guest.invite_type === "individual").length,
  );
  setText(
    "totalCoupleInvites",
    activeGuests.filter((guest) => guest.invite_type === "couple").length,
  );
  setText(
    "totalInviteSentGuests",
    activeGuests.filter((guest) => guest.invite_sent).length,
  );
  setText(
    "totalInvitePendingGuests",
    activeGuests.filter((guest) => !guest.invite_sent).length,
  );
  AdminDashboardCharts.updateGuestSideChart(guestSideMetrics);

  setText("totalTables", tableMetrics.total);
  setText("totalActiveTables", tableMetrics.active);
  setText("totalAvailableTables", tableMetrics.available);
  setText("totalFullTables", tableMetrics.full + tableMetrics.over);
  setText("totalOverTables", tableMetrics.over);
  setText("totalGuestsWithTable", tableMetrics.guestsWithTable);
  setText("totalGuestsWithoutTable", tableMetrics.guestsWithoutTable);
  setText("totalConfirmedWithoutTable", tableMetrics.confirmedWithoutTable);
  setText("totalDeclinedWithTable", tableMetrics.declinedWithTable);
  AdminDashboardCharts.updateTableChart(tableMetrics);

  setText("totalPayingGuests", buffetMetrics.payingPeople);
  setText("totalChildren", buffetMetrics.children);
  setText("totalPayingChildren", buffetMetrics.payingChildren);
  setText("totalNonPayingChildren", buffetMetrics.nonPayingChildren);
  setText("totalUnknownAgeChildren", buffetMetrics.unknownAgeChildren);
  setText("totalDietaryRestrictionPeople", buffetMetrics.dietaryRestrictionPeople);
  setText(
    "buffetPayingRule",
    `Pagantes a partir de ${buffetPayingAge} ${
      buffetPayingAge === 1 ? "ano" : "anos"
    }.`,
  );
  AdminDashboardCharts.updateBuffetChart(buffetMetrics);
  AdminDashboardCharts.updateAttendanceChart({
    totalGuests: activeGuests.length,
    yesRSVP: totalYesRSVP,
    noRSVP: totalNoRSVP,
  });

  setText("totalGifts", giftMetrics.total);
  setText("totalAvailableGifts", giftMetrics.available);
  setText("totalPartialGifts", giftMetrics.partial);
  setText("totalReservedGifts", giftMetrics.reservedIncludingPartial);
  setText("totalBoughtGifts", giftMetrics.bought);
  setText("totalPaymentsReported", giftMetrics.paymentsReported);
  setText("totalAvailableQuotas", giftMetrics.availableQuotas);
  setText("totalConfirmedQuotas", giftMetrics.confirmedQuotas);
  AdminDashboardCharts.updateGiftChart(giftMetrics);

  setText("totalGiftValue", formatCurrency(financialMetrics.totalValue));
  setText("totalReservedValue", formatCurrency(financialMetrics.reservedValue));
  setText(
    "totalAvailableValue",
    formatCurrency(financialMetrics.availableValue),
  );
  setText("totalReportedValue", formatCurrency(financialMetrics.reportedValue));
  setText(
    "totalConfirmedValue",
    formatCurrency(financialMetrics.confirmedValue),
  );
  setText("totalPendingValue", formatCurrency(financialMetrics.pendingValue));
  AdminDashboardCharts.updateFinancialChart(financialMetrics, formatCurrency);

}

setupDashboardMetricNavigation();
loadDashboard();
