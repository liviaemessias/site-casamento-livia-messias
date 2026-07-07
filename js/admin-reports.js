AdminCommon.setupLogout();

async function loadReports() {
  const reportCards = document.querySelectorAll(".dashboard-report-card");
  const reportsStatus = document.getElementById("reportsStatus");

  reportCards.forEach((card) => {
    card.disabled = true;
  });

  const [guestsResult, rsvpsResult, giftsResult, contributionsResult, settingsResult] =
    await Promise.all([
      supabaseClient.from("guests").select("*"),
      supabaseClient.from("rsvps").select("*"),
      supabaseClient.from("gifts").select("*"),
      supabaseClient
        .from("gift_contributions")
        .select(
          "gift_id, guest_id, contributor_name, message, quota_quantity, quota_value, total_value, payment_status, payment_reported_at, created_at",
        ),
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
    reportsStatus.textContent = "Não foi possível carregar os dados dos relatórios.";
    AdminCommon.showToast("⚠️ Erro ao carregar relatórios.");
    return;
  }

  const activeGuests = (guestsResult.data || []).filter(
    (guest) => guest.active,
  );
  const activeGuestIds = new Set(activeGuests.map((guest) => guest.id));
  const activeRSVPs = (rsvpsResult.data || []).filter((rsvp) =>
    activeGuestIds.has(rsvp.guest_id),
  );

  AdminDashboardReports.setData({
    activeGuests,
    activeRSVPs,
    contributions: contributionsResult.data || [],
    buffetPayingAge: BuffetMetrics.normalizePayingAge(
      settingsResult.data?.buffet_paying_age,
    ),
    gifts: giftsResult.data || [],
  });

  reportCards.forEach((card) => {
    card.disabled = false;
  });
  reportsStatus.textContent = "Dados carregados e prontos para exportação.";
}

loadReports();
