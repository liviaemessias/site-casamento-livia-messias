AdminCommon.setupLogout();

const { setText } = AdminCommon;

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getExpectedPeople(rsvps) {
  return rsvps.reduce((total, rsvp) => {
    if (rsvp.presence !== "Sim") {
      return total;
    }

    const companions = Number(rsvp.guest_data?.guest_count || 0);
    const members = rsvp.guest_data?.members || [];
    const invitedPeople = members.length
      ? members.filter((member) => member.presence === "Sim").length
      : 1;

    return total + invitedPeople + companions;
  }, 0);
}

function getPlannedPeople(guests) {
  return guests.reduce((total, guest) => {
    const invitedPeople = guest.invite_type === "couple" ? 2 : 1;
    const companions = Math.max(0, Number(guest.max_guests || 0));
    return total + invitedPeople + companions;
  }, 0);
}

function getContributionValue(contribution) {
  return (
    Number(contribution.total_value || 0) ||
    Number(contribution.quota_quantity || 0) *
      Number(contribution.quota_value || 0)
  );
}

function getGiftOverview(gifts, contributions) {
  const contributionMap = contributions.reduce((map, contribution) => {
    const current = map.get(contribution.gift_id) || [];
    current.push(contribution);
    map.set(contribution.gift_id, current);
    return map;
  }, new Map());

  const metrics = {
    available: 0,
    confirmed: 0,
    confirmedValue: 0,
    reported: 0,
    reserved: 0,
  };

  gifts.forEach((gift) => {
    if (gift.gift_type === "quota") {
      const giftContributions = contributionMap.get(gift.id) || [];
      const totalQuotas = Number(gift.quota_count || 0);
      const reservedQuotas = giftContributions.reduce(
        (total, item) => total + Number(item.quota_quantity || 0),
        0,
      );
      const confirmedQuotas = giftContributions
        .filter((item) => item.payment_status === "Confirmado")
        .reduce((total, item) => total + Number(item.quota_quantity || 0), 0);

      if (totalQuotas > reservedQuotas) {
        metrics.available += 1;
      }

      if (totalQuotas > 0 && confirmedQuotas >= totalQuotas) {
        metrics.confirmed += 1;
      } else if (giftContributions.length) {
        metrics.reserved += 1;
      }

      giftContributions.forEach((contribution) => {
        if (contribution.payment_status === "Confirmado") {
          metrics.confirmedValue += getContributionValue(contribution);
        } else if (contribution.payment_status === "Informado") {
          metrics.reported += 1;
        }
      });
      return;
    }

    const isConfirmed =
      gift.status === "Comprado" || gift.payment_status === "Confirmado";
    const isReserved =
      gift.status === "Reservado" || gift.payment_status === "Informado";

    if (isConfirmed) {
      metrics.confirmed += 1;
      metrics.confirmedValue += Number(gift.price || 0);
    } else if (isReserved) {
      metrics.reserved += 1;
      if (gift.payment_status === "Informado") {
        metrics.reported += 1;
      }
    } else {
      metrics.available += 1;
    }
  });

  return metrics;
}

function updateAttendanceDonut({ yes, no, pending }) {
  const donut = document.getElementById("overviewAttendanceDonut");
  const total = yes + no + pending;
  let canvas = donut.querySelector("canvas");

  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "overview-donut-canvas";
    canvas.width = 150;
    canvas.height = 150;
    donut.prepend(canvas);
  }

  const context = canvas.getContext("2d");
  const segments = [
    { value: yes, color: "#6f3fa7" },
    { value: no, color: "#b76b7c" },
    { value: pending, color: "#ded7e5" },
  ];
  let startAngle = -Math.PI / 2;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ece7f0";
  context.beginPath();
  context.arc(75, 75, 75, 0, Math.PI * 2);
  context.fill();

  if (total) {
    segments.forEach(({ value, color }) => {
      const endAngle = startAngle + (value / total) * Math.PI * 2;
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(75, 75);
      context.arc(75, 75, 75, startAngle, endAngle);
      context.closePath();
      context.fill();
      startAngle = endAngle;
    });
  }
  donut.setAttribute(
    "aria-label",
    `${yes} confirmados, ${no} não comparecerão e ${pending} pendentes`,
  );
}

function updateGiftBar(metrics) {
  const total = metrics.available + metrics.reserved + metrics.confirmed;
  const bar = document.getElementById("overviewGiftBar");
  const segments = {
    available: metrics.available,
    reserved: metrics.reserved,
    confirmed: metrics.confirmed,
  };

  Object.entries(segments).forEach(([name, value]) => {
    const segment = bar.querySelector(`.${name}`);
    const percentage = total ? (value / total) * 100 : 0;
    const step = Math.max(0, Math.min(20, Math.round(percentage / 5)));
    [...segment.classList]
      .filter((className) => className.startsWith("chart-size-"))
      .forEach((className) => segment.classList.remove(className));
    segment.classList.add(`chart-size-${step}`);
  });
  bar.setAttribute(
    "aria-label",
    `${metrics.available} disponíveis, ${metrics.reserved} reservados e ${metrics.confirmed} comprados`,
  );
}

async function loadOverview() {
  const [guestsResult, rsvpsResult, giftsResult, contributionsResult, settingsResult] =
    await Promise.all([
      supabaseClient.from("guests").select("*"),
      supabaseClient.from("rsvps").select("*"),
      supabaseClient.from("gifts").select("*"),
      supabaseClient.from("gift_contributions").select("*"),
      supabaseClient
        .rpc("get_public_settings")
        .maybeSingle(),
    ]);

  const error =
    guestsResult.error ||
    rsvpsResult.error ||
    giftsResult.error ||
    contributionsResult.error ||
    settingsResult.error;

  if (error) {
    console.error(error);
    setText("overviewStatus", "Não foi possível atualizar a visão geral.");
    AdminCommon.showToast("⚠️ Erro ao carregar o Dashboard.");
    return;
  }

  const activeGuests = (guestsResult.data || []).filter((guest) => guest.active);
  const activeGuestIds = new Set(activeGuests.map((guest) => guest.id));
  const activeRSVPs = (rsvpsResult.data || []).filter((rsvp) =>
    activeGuestIds.has(rsvp.guest_id),
  );
  const yes = activeRSVPs.filter((rsvp) => rsvp.presence === "Sim").length;
  const no = activeRSVPs.filter((rsvp) => rsvp.presence === "Não").length;
  const pending = Math.max(0, activeGuests.length - activeRSVPs.length);
  const buffetPayingAge = BuffetMetrics.normalizePayingAge(
    settingsResult.data?.buffet_paying_age,
  );
  const buffetMetrics = BuffetMetrics.getAttendanceMetrics(
    activeGuests,
    activeRSVPs,
    buffetPayingAge,
  );
  const giftMetrics = getGiftOverview(
    giftsResult.data || [],
    contributionsResult.data || [],
  );

  setText("overviewExpectedPeople", getExpectedPeople(activeRSVPs));
  setText("overviewPlannedPeople", getPlannedPeople(activeGuests));
  setText("overviewPendingRSVPs", pending);
  setText("overviewPayingGuests", buffetMetrics.payingPeople);
  setText("overviewReportedGifts", giftMetrics.reported);
  setText("overviewReservedGifts", giftMetrics.reserved);
  setText("overviewConfirmedValue", formatCurrency(giftMetrics.confirmedValue));
  setText("overviewInviteTotal", activeGuests.length);
  setText("overviewYesRSVPs", yes);
  setText("overviewNoRSVPs", no);
  setText("overviewPendingLegend", pending);
  setText("overviewAvailableGifts", giftMetrics.available);
  setText("overviewReservedLegend", giftMetrics.reserved);
  setText("overviewConfirmedGifts", giftMetrics.confirmed);
  setText("overviewStatus", "Dados atualizados.");

  updateAttendanceDonut({ yes, no, pending });
  updateGiftBar(giftMetrics);
}

loadOverview();
