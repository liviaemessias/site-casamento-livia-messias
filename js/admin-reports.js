AdminCommon.setupLogout();

async function loadReports() {
  const reportCards = document.querySelectorAll(".dashboard-report-card");
  const reportsStatus = document.getElementById("reportsStatus");

  reportCards.forEach((card) => {
    card.disabled = true;
  });

  const [
    guestsResult,
    rsvpsResult,
    giftsResult,
    contributionsResult,
    settingsResult,
    tablesResult,
    assignmentsResult,
    checklistItemsResult,
    financialScenariosResult,
    financialCategoriesResult,
    financialPayersResult,
    financialBudgetItemsResult,
    financialExpensesResult,
    financialPaymentsResult,
  ] =
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
      supabaseClient.rpc("admin_list_wedding_tables"),
      supabaseClient.rpc("admin_list_wedding_table_assignments"),
      supabaseClient.rpc("admin_list_checklist_items"),
      supabaseClient.rpc("admin_list_financial_budget_scenarios"),
      supabaseClient.rpc("admin_list_financial_categories"),
      supabaseClient.rpc("admin_list_financial_payers"),
      supabaseClient.rpc("admin_list_financial_budget_items"),
      supabaseClient.rpc("admin_list_financial_expenses"),
      supabaseClient.rpc("admin_list_financial_expense_payments"),
    ]);

  const error =
    guestsResult.error ||
    rsvpsResult.error ||
    giftsResult.error ||
    contributionsResult.error ||
    settingsResult.error ||
    tablesResult.error ||
    assignmentsResult.error ||
    checklistItemsResult.error ||
    financialScenariosResult.error ||
    financialCategoriesResult.error ||
    financialPayersResult.error ||
    financialBudgetItemsResult.error ||
    financialExpensesResult.error ||
    financialPaymentsResult.error;

  if (error) {
    console.error(error);
    reportsStatus.textContent = "Não foi possível carregar os dados dos relatórios.";
    AdminCommon.showToast("⚠️ Erro ao carregar relatórios");
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
    allGuests: guestsResult.data || [],
    allRSVPs: rsvpsResult.data || [],
    activeGuests,
    activeRSVPs,
    contributions: contributionsResult.data || [],
    tableAssignments: assignmentsResult.data || [],
    tables: tablesResult.data || [],
    buffetPayingAge: BuffetMetrics.normalizePayingAge(
      settingsResult.data?.buffet_paying_age,
    ),
    checklistItems: checklistItemsResult.data || [],
    financialBudgetItems: financialBudgetItemsResult.data || [],
    financialCategories: financialCategoriesResult.data || [],
    financialExpenses: financialExpensesResult.data || [],
    financialPayments: financialPaymentsResult.data || [],
    financialPayers: financialPayersResult.data || [],
    financialScenarios: financialScenariosResult.data || [],
    gifts: giftsResult.data || [],
  });

  reportCards.forEach((card) => {
    card.disabled = false;
  });
  reportsStatus.textContent = "Dados carregados e prontos para exportação.";
}

loadReports();
