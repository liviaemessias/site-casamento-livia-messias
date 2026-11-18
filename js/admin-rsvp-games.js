AdminCommon.setupLogout();

const GAME_TYPES = {
  general: "Convidados em geral",
  parents: "Pais",
  godparents_couple: "Casal de Padrinhos/Madrinhas",
  godfather: "Somente Padrinho",
  godmother: "Somente Madrinha",
};

const showAdminToast = AdminCommon.showToast;
const { escapeAttribute, safeText } = SecurityUtils;
const rsvpGameForm = document.getElementById("rsvpGameForm");
const rsvpGameIdInput = document.getElementById("rsvpGameIdInput");
const rsvpGameGuestInput = document.getElementById("rsvpGameGuestInput");
const rsvpGameTypeInput = document.getElementById("rsvpGameTypeInput");
const rsvpGameNamesInput = document.getElementById("rsvpGameNamesInput");
const rsvpGameRelationshipInput = document.getElementById(
  "rsvpGameRelationshipInput",
);
const rsvpGameEnabledInput = document.getElementById("rsvpGameEnabledInput");
const rsvpGameFormHeading = document.getElementById("rsvpGameFormHeading");
const candidateList = document.getElementById("rsvpGameCandidateList");
const gamesTableBody = document.getElementById("rsvpGamesTableBody");
const gamesMobileList = document.getElementById("rsvpGamesMobileList");
const gameFiltersPanel = document.getElementById("rsvpGameFiltersPanel");
const gameFilterCount = document.getElementById("rsvpGameFilterCount");
const gameSearchInput = document.getElementById("rsvpGameSearchInput");
const gameTypeFilter = document.getElementById("rsvpGameTypeFilter");
const gameStatusFilter = document.getElementById("rsvpGameStatusFilter");
const gameParticipationFilter = document.getElementById("rsvpGameParticipationFilter");
const clearGameFiltersButton = document.getElementById("clearRsvpGameFiltersButton");
const templatesGrid = document.getElementById("rsvpGameTemplatesGrid");
const createBulkButton = document.getElementById("createRsvpGamesBulkButton");
const refreshButton = document.getElementById("refreshRsvpGamesButton");
const newRsvpGameButton = document.getElementById("newRsvpGameButton");
const openBulkRsvpGamesButton = document.getElementById("openBulkRsvpGamesButton");
const gameEditorModal = document.getElementById("rsvpGameEditorModal");
const gameDetailsModal = document.getElementById("rsvpGameDetailsModal");
const gameDetailsTitle = document.getElementById("rsvpGameDetailsTitle");
const gameDetailsContent = document.getElementById("rsvpGameDetailsContent");
const bulkGamesModal = document.getElementById("rsvpGameBulkModal");

let inviteCandidates = [];
let configuredGames = [];
let templateRows = [];
let relationshipWasManuallyEdited = false;
let gameSortState = { key: "guest", direction: "asc" };

function getDefaultRelationship(gameType) {
  return {
    general: "Convidados",
    parents: "Pais",
    godparents_couple: "Padrinhos e madrinhas",
    godfather: "Padrinho",
    godmother: "Madrinha",
  }[gameType] || "Convidados";
}

function getCandidateNames(candidate) {
  if (candidate?.invite_type === "couple" && Array.isArray(candidate.couple_members)) {
    const names = candidate.couple_members
      .map((member) => String(member?.name || "").trim())
      .filter(Boolean);

    if (names.length) return names;
  }

  return candidate?.guest_name ? [candidate.guest_name] : [];
}

function getInviteLabel(candidate) {
  const typeLabel = candidate?.invite_type === "couple" ? "Casal" : "Individual";
  const memberNames = getCandidateNames(candidate);
  const secondary = memberNames.length && memberNames.join(" e ") !== candidate.guest_name
    ? ` — ${memberNames.join(" e ")}`
    : "";
  return `${candidate?.guest_name || "Convite sem nome"}${secondary} · ${typeLabel}`;
}

function setFormDefaults() {
  rsvpGameIdInput.value = "";
  rsvpGameFormHeading.textContent = "Novo Jogo";
  rsvpGameEnabledInput.checked = true;
  rsvpGameTypeInput.value = "general";
  rsvpGameGuestInput.disabled = false;
  relationshipWasManuallyEdited = false;

  const candidate = inviteCandidates.find(
    (item) => item.guest_id === rsvpGameGuestInput.value,
  );
  rsvpGameNamesInput.value = getCandidateNames(candidate).join("\n");
  rsvpGameRelationshipInput.value = getDefaultRelationship("general");
}

function renderGuestSelect(selectedGuestId = "") {
  const selectedGame = configuredGames.find(
    (game) => game.guest_id === selectedGuestId,
  );
  const selectableCandidates = inviteCandidates.filter(
    (candidate) => !candidate.has_game || candidate.guest_id === selectedGuestId,
  );

  rsvpGameGuestInput.innerHTML = [
    '<option value="">Selecione um convite</option>',
    ...selectableCandidates.map((candidate) => `
      <option value="${escapeAttribute(candidate.guest_id)}" ${candidate.guest_id === selectedGuestId ? "selected" : ""}>
        ${safeText(getInviteLabel(candidate))}
      </option>
    `),
  ].join("");

  if (selectedGame && !selectableCandidates.some((item) => item.guest_id === selectedGuestId)) {
    rsvpGameGuestInput.insertAdjacentHTML(
      "beforeend",
      `<option value="${escapeAttribute(selectedGame.guest_id)}" selected>${safeText(selectedGame.guest_name)}</option>`,
    );
  }
}

function renderCandidates() {
  const candidates = inviteCandidates.filter((candidate) => !candidate.has_game);
  createBulkButton.disabled = candidates.length === 0;
  newRsvpGameButton.disabled = candidates.length === 0;

  if (!candidates.length) {
    candidateList.innerHTML = '<p class="rsvp-game-empty-state">Todos os convites ativos já têm um jogo configurado.</p>';
    return;
  }

  candidateList.innerHTML = candidates.map((candidate) => `
    <label class="rsvp-game-candidate-row">
      <input type="checkbox" value="${escapeAttribute(candidate.guest_id)}" />
      <span>${safeText(getInviteLabel(candidate))}<small>${candidate.invite_type === "couple" ? "Nomes do casal serão sugeridos" : "Nome do convite será sugerido"}</small></span>
    </label>
  `).join("");
}

function createActionButton(action, label, icon, guestId, className = "") {
  return `
    <button type="button" class="admin-action-button icon-action ${className}"
      data-game-action="${action}" data-game-guest-id="${escapeAttribute(guestId)}"
      title="${escapeAttribute(label)}">
      <i data-lucide="${icon}" aria-hidden="true"></i>${safeText(label)}
    </button>
  `;
}

function renderGameStatusSwitch(game) {
  const active = Boolean(game.is_active);
  const statusLabel = active ? "Ativo" : "Desativado";
  return `
    <div class="rsvp-game-status-control">
      <label class="admin-toggle-switch" title="${active ? "Desativar" : "Ativar"} jogo no RSVP">
        <input type="checkbox" data-game-active-switch="true"
          data-game-guest-id="${escapeAttribute(game.guest_id)}"
          aria-label="Jogo de ${escapeAttribute(game.guest_name)}: ${statusLabel}"
          ${active ? "checked" : ""} />
        <span aria-hidden="true"></span>
      </label>
    </div>
  `;
}

function renderGameActions(game) {
  return `
    <div class="admin-actions compact-actions">
      ${createActionButton("edit", "Editar", "edit", game.guest_id)}
      ${createActionButton("delete", "Remover", "trash-2", game.guest_id, "danger")}
    </div>
  `;
}

function renderGameRow(game) {
  return `
    <tr data-game-row-id="${escapeAttribute(game.guest_id)}" tabindex="0">
      <td>
        <strong class="rsvp-game-table-primary">${safeText(game.guest_name)}</strong>
        <span class="admin-muted rsvp-game-table-secondary">${game.invite_type === "couple" ? "Casal" : "Individual"}</span>
      </td>
      <td>${safeText(GAME_TYPES[game.game_type] || game.game_type)}</td>
      <td>
        <span class="rsvp-game-table-primary">${safeText((game.display_names || []).join(", "))}</span>
        <span class="admin-muted rsvp-game-table-secondary">${safeText(game.relationship_label)}</span>
      </td>
      <td>${renderGameStatusSwitch(game)}</td>
      <td>${Number(game.play_count || 0)}</td>
      <td>${safeText(game.last_completed_at ? AdminCommon.formatDate(game.last_completed_at) : "Ainda não jogou")}</td>
      <td>${renderGameActions(game)}</td>
    </tr>
  `;
}

function renderGameCard(game) {
  return `
    <article class="rsvp-game-mobile-card" data-game-card-id="${escapeAttribute(game.guest_id)}" tabindex="0">
      <div class="rsvp-game-mobile-card-header">
        <strong>${safeText(game.guest_name)}</strong>
        ${renderGameStatusSwitch(game)}
      </div>
      <dl class="admin-mobile-card-meta rsvp-game-mobile-meta">
        <div><dt>Tipo de jogo</dt><dd>${safeText(GAME_TYPES[game.game_type] || game.game_type)}</dd></div>
        <div><dt>Nomes</dt><dd>${safeText((game.display_names || []).join(", "))}</dd></div>
        <div><dt>Relação</dt><dd>${safeText(game.relationship_label)}</dd></div>
        <div><dt>Conclusões</dt><dd>${Number(game.play_count || 0)}</dd></div>
        <div><dt>Última conclusão</dt><dd>${safeText(game.last_completed_at ? AdminCommon.formatDate(game.last_completed_at) : "Ainda não jogou")}</dd></div>
      </dl>
      <div class="admin-mobile-card-actions rsvp-game-mobile-actions">
        ${createActionButton("edit", "Editar", "edit", game.guest_id)}
        ${createActionButton("delete", "Remover", "trash-2", game.guest_id, "danger")}
      </div>
    </article>
  `;
}

function renderGameDetailsActions(game) {
  return `
    <div class="admin-detail-action-grid">
      <button
        type="button"
        class="admin-detail-action-card"
        data-game-action="edit"
        data-game-guest-id="${escapeAttribute(game.guest_id)}"
      >
        <span class="admin-detail-action-icon"><i data-lucide="edit" aria-hidden="true"></i></span>
        <span>
          <strong>Editar Jogo</strong>
          <small>Altera o tipo, os nomes e a relação apresentados na brincadeira.</small>
        </span>
      </button>
      <button
        type="button"
        class="admin-detail-action-card danger"
        data-game-action="delete"
        data-game-guest-id="${escapeAttribute(game.guest_id)}"
      >
        <span class="admin-detail-action-icon"><i data-lucide="trash-2" aria-hidden="true"></i></span>
        <span>
          <strong>Remover Jogo</strong>
          <small>Remove a configuração e o histórico de conclusões, sem alterar o convite ou o RSVP.</small>
        </span>
      </button>
    </div>
  `;
}

function compareGameValues(first, second) {
  if (typeof first === "number" || typeof second === "number") {
    return Number(first || 0) - Number(second || 0);
  }

  return String(first || "").localeCompare(String(second || ""), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
}

function getGameSortValue(game) {
  const sortValues = {
    guest: game.guest_name,
    type: GAME_TYPES[game.game_type] || game.game_type,
    names: (game.display_names || []).join(", "),
    status: game.is_active ? "Ativo" : "Desativado",
    plays: Number(game.play_count || 0),
    completed: game.last_completed_at
      ? new Date(game.last_completed_at).getTime()
      : 0,
  };

  return sortValues[gameSortState.key] ?? "";
}

function sortGames(games) {
  return [...games].sort((first, second) => {
    const comparison = compareGameValues(
      getGameSortValue(first),
      getGameSortValue(second),
    );
    return gameSortState.direction === "asc" ? comparison : -comparison;
  });
}

function normalizeGameSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getFilteredGames() {
  const search = normalizeGameSearchText(gameSearchInput.value);
  const gameType = gameTypeFilter.value;
  const status = gameStatusFilter.value;
  const participation = gameParticipationFilter.value;

  return configuredGames.filter((game) => {
    const searchableText = normalizeGameSearchText([
      game.guest_name,
      ...(game.display_names || []),
      game.relationship_label,
      GAME_TYPES[game.game_type] || game.game_type,
    ].join(" "));
    const matchesSearch = !search || searchableText.includes(search);
    const matchesType = !gameType || game.game_type === gameType;
    const matchesStatus = !status || (status === "active" ? Boolean(game.is_active) : !game.is_active);
    const hasPlayed = Number(game.play_count || 0) > 0;
    const matchesParticipation = !participation || (participation === "played" ? hasPlayed : !hasPlayed);

    return matchesSearch && matchesType && matchesStatus && matchesParticipation;
  });
}

function updateGameSortButtons() {
  document.querySelectorAll("[data-game-sort]").forEach((button) => {
    button.classList.remove("sorted-asc", "sorted-desc");
    if (button.dataset.gameSort === gameSortState.key) {
      button.classList.add(`sorted-${gameSortState.direction}`);
    }
  });
}

function setGameSort(key) {
  if (gameSortState.key === key) {
    gameSortState.direction = gameSortState.direction === "asc" ? "desc" : "asc";
  } else {
    gameSortState = { key, direction: "asc" };
  }

  renderGames();
}

function renderGames() {
  updateGameSortButtons();
  const filteredGames = getFilteredGames();
  const totalGames = configuredGames.length;
  const hasActiveFilters = Boolean(
    gameSearchInput.value ||
    gameTypeFilter.value ||
    gameStatusFilter.value ||
    gameParticipationFilter.value,
  );

  gameFilterCount.textContent = filteredGames.length === totalGames
    ? `${totalGames} jogo${totalGames === 1 ? "" : "s"}`
    : `${filteredGames.length} de ${totalGames} jogos`;
  gameFiltersPanel.dataset.hasActiveFilters = String(hasActiveFilters);

  if (!filteredGames.length) {
    const emptyMessage = totalGames
      ? "Nenhum jogo encontrado para os filtros selecionados."
      : "Nenhum jogo cadastrado.";
    gamesTableBody.innerHTML = `<tr><td colspan="7">${emptyMessage}</td></tr>`;
    gamesMobileList.innerHTML = `<div class="admin-mobile-empty-state">${emptyMessage}</div>`;
    return;
  }

  const sortedGames = sortGames(filteredGames);
  gamesTableBody.innerHTML = sortedGames.map(renderGameRow).join("");
  gamesMobileList.innerHTML = sortedGames.map(renderGameCard).join("");
  window.lucide?.createIcons();
}

function renderTemplates() {
  templateRows.forEach((template) => {
    const card = templatesGrid.querySelector(
      `[data-template-type="${CSS.escape(template.game_type)}"]`,
    );
    if (!card) return;

    card.querySelector('[data-template-variant="singular"]').value =
      template.singular_message || "";
    card.querySelector('[data-template-variant="plural"]').value =
      template.plural_message || "";
  });
}

async function loadRsvpGames() {
  refreshButton.disabled = true;
  const [gamesResult, candidatesResult, templatesResult] = await Promise.all([
    supabaseClient.rpc("admin_list_rsvp_games"),
    supabaseClient.rpc("admin_list_rsvp_game_guests"),
    supabaseClient.rpc("admin_list_rsvp_game_message_templates"),
  ]);

  const error = gamesResult.error || candidatesResult.error || templatesResult.error;
  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível carregar os jogos do RSVP.");
    refreshButton.disabled = false;
    return;
  }

  configuredGames = gamesResult.data || [];
  inviteCandidates = candidatesResult.data || [];
  templateRows = templatesResult.data || [];
  renderGuestSelect(rsvpGameIdInput.value ? rsvpGameGuestInput.value : "");
  renderCandidates();
  renderGames();
  renderTemplates();
  refreshButton.disabled = false;
  if (window.lucide) window.lucide.createIcons();
}

function openGameModal(modal) {
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  window.lucide?.createIcons();
}

function closeGameModal(modal) {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
}

function openNewGameModal() {
  if (!inviteCandidates.some((candidate) => !candidate.has_game)) {
    showAdminToast("⚠️ Todos os convites ativos já têm um jogo configurado.");
    return;
  }

  rsvpGameForm.reset();
  renderGuestSelect();
  setFormDefaults();
  openGameModal(gameEditorModal);
  rsvpGameGuestInput.focus();
}

function openEditGameModal(guestId) {
  const game = configuredGames.find((item) => item.guest_id === guestId);
  if (!game) return;

  rsvpGameForm.reset();
  renderGuestSelect(guestId);
  rsvpGameIdInput.value = game.game_id;
  rsvpGameGuestInput.value = guestId;
  rsvpGameGuestInput.disabled = true;
  rsvpGameTypeInput.value = game.game_type;
  rsvpGameNamesInput.value = (game.display_names || []).join("\n");
  rsvpGameRelationshipInput.value = game.relationship_label || "";
  rsvpGameEnabledInput.checked = Boolean(game.is_active);
  rsvpGameFormHeading.textContent = "Editar Jogo";
  relationshipWasManuallyEdited = true;
  closeGameModal(gameDetailsModal);
  openGameModal(gameEditorModal);
  rsvpGameTypeInput.focus();
}

function renderGameDetails(game) {
  gameDetailsTitle.textContent = game.guest_name || "Jogo do RSVP";
  gameDetailsContent.innerHTML = `
    <section class="admin-details-section">
      <span class="admin-details-label">Configuração</span>
      <div class="admin-details-meta-grid">
        <div class="admin-details-meta-item"><span>Convite</span><strong>${safeText(game.guest_name)}</strong></div>
        <div class="admin-details-meta-item"><span>Tipo de convite</span><strong>${game.invite_type === "couple" ? "Casal" : "Individual"}</strong></div>
        <div class="admin-details-meta-item"><span>Tipo de jogo</span><strong>${safeText(GAME_TYPES[game.game_type] || game.game_type)}</strong></div>
        <div class="admin-details-meta-item"><span>Status</span>${renderGameStatusSwitch(game)}</div>
        <div class="admin-details-meta-item"><span>Nomes envolvidos</span><strong>${safeText((game.display_names || []).join(", "))}</strong></div>
        <div class="admin-details-meta-item"><span>Relação</span><strong>${safeText(game.relationship_label)}</strong></div>
      </div>
    </section>
    <section class="admin-details-section">
      <span class="admin-details-label">Participação</span>
      <div class="admin-details-meta-grid">
        <div class="admin-details-meta-item"><span>Conclusões</span><strong>${Number(game.play_count || 0)}</strong></div>
        <div class="admin-details-meta-item"><span>Última conclusão</span><strong>${safeText(game.last_completed_at ? AdminCommon.formatDate(game.last_completed_at) : "Ainda não jogou")}</strong></div>
      </div>
    </section>
    <section class="admin-details-section">
      <span class="admin-details-label">Ações</span>
      ${renderGameDetailsActions(game)}
    </section>
  `;
  openGameModal(gameDetailsModal);
  window.lucide?.createIcons();
}

async function deleteGame(game) {
  const confirmed = window.confirm(
    `Deseja remover o jogo de "${game.guest_name}"?\n\n` +
      "A configuração e o histórico de conclusões serão removidos. O convite e os dados do RSVP não serão alterados.",
  );
  if (!confirmed) return;

  const { data, error } = await supabaseClient.rpc("admin_delete_rsvp_game", {
    p_game_id: game.game_id,
  });

  if (error || data !== true) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível remover o jogo. Atualize a lista e tente novamente.");
    return;
  }

  closeGameModal(gameDetailsModal);
  showAdminToast("💜 Jogo removido com sucesso!");
  await loadRsvpGames();
}

async function handleGameAction(action, guestId) {
  const game = configuredGames.find((item) => item.guest_id === guestId);
  if (!game) {
    showAdminToast("⚠️ Jogo não encontrado. Atualize a lista e tente novamente.");
    return;
  }

  if (action === "view") {
    renderGameDetails(game);
    return;
  }

  if (action === "edit") {
    openEditGameModal(guestId);
    return;
  }

  if (action === "delete") {
    await deleteGame(game);
    return;
  }

}

async function updateGameStatus(guestId, nextActive, input) {
  const game = configuredGames.find((item) => item.guest_id === guestId);
  if (!game) {
    showAdminToast("⚠️ Jogo não encontrado. Atualize a lista e tente novamente.");
    await loadRsvpGames();
    return;
  }

  input.disabled = true;
  const { data, error } = await supabaseClient.rpc("admin_set_rsvp_game_active", {
    p_game_id: game.game_id,
    p_is_active: nextActive,
  });

  if (error || data !== true) {
    console.error(error);
    input.disabled = false;
    input.checked = Boolean(game.is_active);
    showAdminToast(`⚠️ Não foi possível ${nextActive ? "ativar" : "desativar"} o jogo.`);
    await loadRsvpGames();
    if (gameDetailsModal.classList.contains("active")) {
      const refreshedGame = configuredGames.find((item) => item.guest_id === guestId);
      if (refreshedGame) renderGameDetails(refreshedGame);
    }
    return;
  }

  showAdminToast(`💜 Jogo ${nextActive ? "ativado" : "desativado"} no RSVP!`);
  await loadRsvpGames();
  if (gameDetailsModal.classList.contains("active")) {
    const updatedGame = configuredGames.find((item) => item.guest_id === guestId);
    if (updatedGame) renderGameDetails(updatedGame);
  }
}

function handleGameStatusChange(event) {
  const input = event.target.closest('[data-game-active-switch="true"]');
  if (!input) return;
  updateGameStatus(input.dataset.gameGuestId, input.checked, input);
}

rsvpGameGuestInput.addEventListener("change", () => {
  const candidate = inviteCandidates.find(
    (item) => item.guest_id === rsvpGameGuestInput.value,
  );
  rsvpGameNamesInput.value = getCandidateNames(candidate).join("\n");
  relationshipWasManuallyEdited = false;
  rsvpGameRelationshipInput.value = getDefaultRelationship(rsvpGameTypeInput.value);
});

rsvpGameTypeInput.addEventListener("change", () => {
  if (!relationshipWasManuallyEdited) {
    rsvpGameRelationshipInput.value = getDefaultRelationship(rsvpGameTypeInput.value);
  }
});

rsvpGameRelationshipInput.addEventListener("input", () => {
  relationshipWasManuallyEdited = true;
});

rsvpGameForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const guestId = rsvpGameGuestInput.value;
  const displayNames = rsvpGameNamesInput.value
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);

  if (!guestId || !displayNames.length) {
    showAdminToast("⚠️ Selecione um convite e informe pelo menos um nome.");
    return;
  }

  if (
    (rsvpGameTypeInput.value === "godparents_couple" && displayNames.length !== 2) ||
    (["godfather", "godmother"].includes(rsvpGameTypeInput.value) && displayNames.length !== 1)
  ) {
    showAdminToast("⚠️ Casal de Padrinhos exige dois nomes; Padrinho/Madrinha individual exige um.");
    return;
  }

  const saveButton = document.getElementById("saveRsvpGameButton");
  saveButton.disabled = true;
  const { error } = await supabaseClient.rpc("admin_save_rsvp_game", {
    p_guest_id: guestId,
    p_game_type: rsvpGameTypeInput.value,
    p_display_names: displayNames,
    p_relationship_label: rsvpGameRelationshipInput.value,
    p_is_active: rsvpGameEnabledInput.checked,
  });
  saveButton.disabled = false;

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar o jogo. Confira os dados.");
    return;
  }

  showAdminToast("💜 Jogo salvo para o convite!");
  closeGameModal(gameEditorModal);
  rsvpGameForm.reset();
  setFormDefaults();
  await loadRsvpGames();
});

function shouldIgnoreGameItemClick(target) {
  return Boolean(
    target.closest("button, a, input, select, textarea, label, [data-game-action], .admin-action-button"),
  );
}

function openGameDetailsFromItem(item) {
  const guestId = item?.dataset.gameRowId || item?.dataset.gameCardId;
  const game = guestId ? configuredGames.find((entry) => entry.guest_id === guestId) : null;
  if (game) renderGameDetails(game);
}

function handleGameListClick(event) {
  const button = event.target.closest("[data-game-action]");
  if (button) {
    handleGameAction(button.dataset.gameAction, button.dataset.gameGuestId);
    return;
  }

  const item = event.target.closest("[data-game-row-id], [data-game-card-id]");
  if (item && !shouldIgnoreGameItemClick(event.target)) {
    openGameDetailsFromItem(item);
  }
}

function handleGameListKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;

  const item = event.target.closest("[data-game-row-id], [data-game-card-id]");
  if (!item || shouldIgnoreGameItemClick(event.target)) return;

  event.preventDefault();
  openGameDetailsFromItem(item);
}

gamesTableBody.addEventListener("click", handleGameListClick);
gamesMobileList.addEventListener("click", handleGameListClick);
gamesTableBody.addEventListener("keydown", handleGameListKeydown);
gamesMobileList.addEventListener("keydown", handleGameListKeydown);
gameDetailsContent.addEventListener("click", handleGameListClick);
gamesTableBody.addEventListener("change", handleGameStatusChange);
gamesMobileList.addEventListener("change", handleGameStatusChange);
gameDetailsContent.addEventListener("change", handleGameStatusChange);

newRsvpGameButton.addEventListener("click", openNewGameModal);
openBulkRsvpGamesButton.addEventListener("click", () => {
  renderCandidates();
  openGameModal(bulkGamesModal);
});
refreshButton.addEventListener("click", loadRsvpGames);

[gameSearchInput, gameTypeFilter, gameStatusFilter, gameParticipationFilter].forEach((filter) => {
  filter.addEventListener("input", renderGames);
  filter.addEventListener("change", renderGames);
});

clearGameFiltersButton.addEventListener("click", () => {
  gameSearchInput.value = "";
  gameTypeFilter.value = "";
  gameStatusFilter.value = "";
  gameParticipationFilter.value = "";
  renderGames();
});

document.querySelectorAll("[data-game-sort]").forEach((button) => {
  button.addEventListener("click", () => setGameSort(button.dataset.gameSort));
});

document.querySelectorAll("[data-close-rsvp-game-editor]").forEach((button) => {
  button.addEventListener("click", () => closeGameModal(gameEditorModal));
});
document.querySelectorAll("[data-close-rsvp-game-details]").forEach((button) => {
  button.addEventListener("click", () => closeGameModal(gameDetailsModal));
});
document.querySelectorAll("[data-close-rsvp-game-bulk]").forEach((button) => {
  button.addEventListener("click", () => closeGameModal(bulkGamesModal));
});
[gameEditorModal, gameDetailsModal, bulkGamesModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target !== modal) return;
    closeGameModal(modal);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  [gameEditorModal, gameDetailsModal, bulkGamesModal].forEach((modal) => {
    if (modal.classList.contains("active")) closeGameModal(modal);
  });
});

createBulkButton.addEventListener("click", async () => {
  const guestIds = Array.from(
    candidateList.querySelectorAll('input[type="checkbox"]:checked'),
  ).map((input) => input.value);

  if (!guestIds.length) {
    showAdminToast("⚠️ Selecione pelo menos um convite sem jogo.");
    return;
  }

  createBulkButton.disabled = true;
  const { data, error } = await supabaseClient.rpc(
    "admin_create_rsvp_games_bulk",
    { p_guest_ids: guestIds },
  );
  createBulkButton.disabled = false;

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível criar os jogos em lote.");
    return;
  }

  const createdCount = Number(data || 0);
  showAdminToast(
    createdCount > 0
      ? `💜 ${createdCount} ${createdCount === 1 ? "jogo geral criado" : "jogos gerais criados"}! Confira nomes e relação.`
      : "⚠️ Nenhum jogo novo foi criado. Confira se os convites estão ativos e ainda não têm jogo.",
  );
  closeGameModal(bulkGamesModal);
  await loadRsvpGames();
});

templatesGrid.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-save-template]");
  if (!button) return;

  const gameType = button.dataset.saveTemplate;
  const card = templatesGrid.querySelector(
    `[data-template-type="${CSS.escape(gameType)}"]`,
  );
  const singularMessage = card.querySelector(
    '[data-template-variant="singular"]',
  ).value.trim();
  const pluralMessage = card.querySelector(
    '[data-template-variant="plural"]',
  ).value.trim();

  if (!singularMessage || !pluralMessage) {
    showAdminToast("⚠️ Preencha as mensagens no singular e no plural.");
    return;
  }

  button.disabled = true;
  const { error } = await supabaseClient.rpc(
    "admin_save_rsvp_game_message_template",
    {
      p_game_type: gameType,
      p_singular_message: singularMessage,
      p_plural_message: pluralMessage,
    },
  );
  button.disabled = false;

  if (error) {
    console.error(error);
    showAdminToast("⚠️ Não foi possível salvar o modelo de mensagem.");
    return;
  }

  showAdminToast("💜 Modelo padrão atualizado para esse tipo de jogo!");
  await loadRsvpGames();
});

loadRsvpGames();
