(function () {
  const gameButton = document.getElementById("rsvpGameFloatingButton");
  const modal = document.getElementById("rsvpGameModal");
  const title = document.getElementById("rsvpGameDialogTitle");
  const stepLabel = document.getElementById("rsvpGameStepLabel");
  const recipient = document.getElementById("rsvpGameRecipient");
  const question = document.getElementById("rsvpGameQuestion");
  const answerList = document.getElementById("rsvpGameAnswers");
  const quizFeedback = document.getElementById("rsvpGameQuizFeedback");
  const puzzleBoard = document.getElementById("rsvpGamePuzzleBoard");
  const pieceTray = document.getElementById("rsvpGamePieceTray");
  const puzzleFeedback = document.getElementById("rsvpGamePuzzleFeedback");
  const revealButton = document.getElementById("rsvpGameRevealButton");
  const finalRelationship = document.getElementById(
    "rsvpGameFinalRelationship",
  );
  const finalMessage = document.getElementById("rsvpGameFinalMessage");
  const playCountLabel = document.getElementById("rsvpGamePlayCount");
  const reviewButton = document.getElementById("rsvpGameReviewButton");
  const panels = [
    document.getElementById("rsvpGameWelcomePanel"),
    document.getElementById("rsvpGameQuizPanel"),
    document.getElementById("rsvpGamePuzzlePanel"),
    document.getElementById("rsvpGameFinalPanel"),
  ];

  const TYPE_LABELS = {
    general: "Convidados em geral",
    parents: "Pais",
    godparents_couple: "Casal de Padrinhos/Madrinhas",
    godfather: "Padrinho",
    godmother: "Madrinha",
  };
  const ART_FOLDERS = {
    general: "general",
    parents: "parents",
    godparents_couple: "godparents",
    godfather: "godparents",
    godmother: "godparents",
  };

  let game = null;
  let selectedPiece = null;
  let draggedPieceId = null;
  let placedPieces = new Set();
  let previousFocus = null;

  function setPanel(activePanel) {
    panels.forEach((panel) => {
      panel.hidden = panel !== activePanel;
    });
  }

  function showModal() {
    if (!game || !modal) return;
    previousFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("rsvp-game-open");
    showWelcome();
    document.getElementById("rsvpGameCloseButton")?.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("rsvp-game-open");
    previousFocus?.focus?.();
  }

  function formatNames(names) {
    const cleanedNames = (Array.isArray(names) ? names : [])
      .map((name) => String(name || "").trim())
      .filter(Boolean);

    if (cleanedNames.length < 2) return cleanedNames[0] || "Convidado";
    if (cleanedNames.length === 2) return `${cleanedNames[0]} e ${cleanedNames[1]}`;
    return `${cleanedNames.slice(0, -1).join(", ")} e ${cleanedNames[cleanedNames.length - 1]}`;
  }

  function applyTemplate() {
    const nameCount = Array.isArray(game.display_names)
      ? game.display_names.length
      : 0;
    const message = nameCount > 1 ? game.plural_message : game.singular_message;

    return String(message || "")
      .replaceAll("{{names}}", formatNames(game.display_names))
      .replaceAll("{{relationship}}", String(game.relationship_label || ""));
  }

  function showWelcome() {
    const group = game.display_names.length > 1;
    title.textContent = game.play_count > 0
      ? group ? "Que bom ter vocês de volta!" : "Que bom ter você de volta!"
      : group ? "Uma brincadeira para vocês" : "Uma brincadeira para você";
    recipient.textContent = formatNames(game.display_names);
    document.querySelector(".rsvp-game-intro-copy").textContent = group
      ? "Temos uma pequena surpresa. Respondam uma pergunta e montem a imagem para revelar a mensagem."
      : "Temos uma pequena surpresa. Responda uma pergunta e monte a imagem para revelar a mensagem.";
    stepLabel.textContent = game.play_count > 0
      ? `Este convite já concluiu ${game.play_count} ${game.play_count === 1 ? "partida" : "partidas"}.`
      : "Uma pergunta, quatro peças e uma mensagem especial.";
    document.getElementById("rsvpGameStartButton").textContent =
      game.play_count > 0 ? "Jogar novamente" : "Começar";
    reviewButton.hidden = game.play_count <= 0;
    setPanel(panels[0]);
  }

  function getQuestionData() {
    const group = Array.isArray(game.display_names) && game.display_names.length > 1;
    const sweetToothDistractor = group
      ? "Especialistas em fazer docinhos desaparecerem"
      : "Especialista em fazer docinhos desaparecerem";
    const distractors = [sweetToothDistractor, "Padrinhos e madrinhas", "Pais"];
    const questionText = game.game_type === "general"
      ? group
        ? "Qual é a missão mais importante de vocês no nosso grande dia?"
        : "Qual é a missão mais importante no nosso grande dia?"
      : group
        ? "Qual é o papel especial de vocês no nosso dia?"
        : `Qual é o papel especial de ${formatNames(game.display_names)} no nosso dia?`;
    const correctLabels = {
      general: "Celebrar com a gente",
      parents: "Pais",
      godparents_couple: "Padrinhos e madrinhas",
      godfather: "Padrinho",
      godmother: "Madrinha",
    };
    const correct = correctLabels[game.game_type] || correctLabels.general;
    const options = game.game_type === "general"
      ? ["Celebrar com a gente", "Avaliar o buffet", "Levar a decoração para casa"]
      : [...new Set([correct, ...distractors])].slice(0, 3);

    return { correct, options, questionText };
  }

  function startQuiz() {
    const data = getQuestionData();
    const group = game.display_names.length > 1;
    title.textContent = group ? "Uma pergunta para vocês" : "Uma pergunta para você";
    question.textContent = data.questionText;
    quizFeedback.textContent = "";
    answerList.replaceChildren();
    stepLabel.textContent = "Pergunta surpresa";

    data.options.forEach((answer) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "rsvp-game-answer-button";
      button.textContent = answer;
      button.addEventListener("click", () => {
        if (answer === data.correct) {
          answerList.querySelectorAll("button").forEach((answerButton) => {
            answerButton.disabled = true;
          });
          quizFeedback.textContent = game.display_names.length > 1
            ? "Isso mesmo! Agora montem a surpresa 💜"
            : "Isso mesmo! Agora monte a surpresa 💜";
          window.setTimeout(startPuzzle, 2000);
          return;
        }

        quizFeedback.textContent = game.display_names.length > 1
          ? "Hmm… essa resposta não bate com a nossa lista secreta 😄 Tentem de novo!"
          : "Hmm… essa resposta não bate com a nossa lista secreta 😄 Tente de novo!";
      });
      answerList.appendChild(button);
    });

    setPanel(panels[1]);
    answerList.querySelector("button")?.focus();
  }

  function createPiece(pieceNumber) {
    const button = document.createElement("button");
    const image = document.createElement("img");
    const cropClasses = [
      "is-crop-top-left",
      "is-crop-top-right",
      "is-crop-bottom-left",
      "is-crop-bottom-right",
    ];
    button.type = "button";
    button.className = "rsvp-game-piece";
    button.draggable = true;
    button.dataset.piece = String(pieceNumber);
    button.setAttribute("aria-label", `Peça ${pieceNumber + 1}`);
    image.className = `rsvp-game-piece-image ${cropClasses[pieceNumber]}`;
    image.src = `./assets/images/rsvp-game/examples/${ART_FOLDERS[game.game_type]}/art.svg`;
    image.alt = "";
    image.draggable = false;
    button.appendChild(image);
    button.addEventListener("click", () => selectPiece(button));
    button.addEventListener("dragstart", (event) => {
      draggedPieceId = button.dataset.piece;
      event.dataTransfer?.setData("text/plain", draggedPieceId);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    });
    return button;
  }

  function selectPiece(button) {
    if (placedPieces.has(Number(button.dataset.piece))) return;
    selectedPiece?.classList.remove("is-selected");
    selectedPiece = button;
    selectedPiece.classList.add("is-selected");
    puzzleFeedback.textContent = "Agora escolha o espaço onde essa peça se encaixa.";
  }

  function placePiece(pieceId, slot) {
    const expectedPiece = Number(slot.dataset.slot);
    const parsedPieceId = Number(pieceId);
    if (!Number.isInteger(parsedPieceId) || placedPieces.has(parsedPieceId)) return;

    if (parsedPieceId !== expectedPiece) {
      puzzleFeedback.textContent = game.display_names.length > 1
        ? "Essa peça pertence a outro espaço. Tentem mais uma vez!"
        : "Essa peça pertence a outro espaço. Tente mais uma vez!";
      slot.classList.remove("is-over");
      return;
    }

    const piece = pieceTray.querySelector(`[data-piece="${parsedPieceId}"]`);
    if (!piece) return;
    slot.replaceChildren(piece);
    slot.classList.add("is-filled");
    slot.setAttribute("aria-label", `Espaço ${expectedPiece + 1}, preenchido`);
    placedPieces.add(parsedPieceId);
    selectedPiece = null;
    puzzleFeedback.textContent = placedPieces.size === 4
      ? "Perfeito! A imagem está completa."
      : `Boa! ${4 - placedPieces.size} ${4 - placedPieces.size === 1 ? "peça restante" : "peças restantes"}.`;

    if (placedPieces.size === 4) {
      revealButton.hidden = false;
      revealButton.focus();
    }
  }

  function startPuzzle() {
    placedPieces = new Set();
    selectedPiece = null;
    draggedPieceId = null;
    puzzleFeedback.textContent = "";
    revealButton.hidden = true;
    puzzleBoard.replaceChildren();
    pieceTray.replaceChildren();
    stepLabel.textContent = "Quebra-cabeça · 4 peças";

    for (let slotIndex = 0; slotIndex < 4; slotIndex += 1) {
      const slot = document.createElement("div");
      const number = document.createElement("span");
      slot.className = "rsvp-game-drop-slot";
      slot.dataset.slot = String(slotIndex);
      slot.setAttribute("role", "group");
      slot.setAttribute("tabindex", "0");
      slot.setAttribute("aria-label", `Espaço ${slotIndex + 1}`);
      number.setAttribute("aria-hidden", "true");
      number.textContent = String(slotIndex + 1);
      slot.appendChild(number);
      slot.addEventListener("dragover", (event) => {
        event.preventDefault();
        slot.classList.add("is-over");
      });
      slot.addEventListener("dragleave", () => slot.classList.remove("is-over"));
      slot.addEventListener("drop", (event) => {
        event.preventDefault();
        slot.classList.remove("is-over");
        placePiece(event.dataTransfer?.getData("text/plain") || draggedPieceId, slot);
        draggedPieceId = null;
      });
      slot.addEventListener("click", () => {
        if (selectedPiece) placePiece(selectedPiece.dataset.piece, slot);
      });
      slot.addEventListener("keydown", (event) => {
        if ((event.key === "Enter" || event.key === " ") && selectedPiece) {
          event.preventDefault();
          placePiece(selectedPiece.dataset.piece, slot);
        }
      });
      puzzleBoard.appendChild(slot);
    }

    const pieces = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    pieces.forEach((pieceNumber) => pieceTray.appendChild(createPiece(pieceNumber)));
    setPanel(panels[2]);
  }

  function showFinal() {
    finalRelationship.textContent = game.relationship_label;
    finalMessage.textContent = applyTemplate();
    playCountLabel.textContent = `Este convite já concluiu ${game.play_count} ${game.play_count === 1 ? "partida" : "partidas"}.`;
    title.textContent = game.display_names.length > 1
      ? "Uma surpresa para vocês"
      : "Uma surpresa para você";
    stepLabel.textContent = game.display_names.length > 1
      ? "Que bom ter vocês na nossa história"
      : "Que bom ter você na nossa história";
    setPanel(panels[3]);
    document.getElementById("rsvpGameDoneButton").focus();
  }

  async function completeGame() {
    revealButton.disabled = true;
    puzzleFeedback.textContent = "Abrindo a surpresa…";
    const { data, error } = await supabaseClient.rpc(
      "complete_current_rsvp_game",
      { p_game_id: game.game_id },
    );
    revealButton.disabled = false;

    if (error) {
      console.error(error);
      puzzleFeedback.textContent = "Não foi possível registrar a conclusão agora. Tente novamente.";
      return;
    }

    game.play_count = Number(data || game.play_count + 1);
    game.last_completed_at = new Date().toISOString();
    gameButton.querySelector("span:last-child").textContent = "Rever surpresa";
    showFinal();
  }

  async function loadGame() {
    if (typeof supabaseClient === "undefined") return;
    const { data, error } = await supabaseClient.rpc("get_current_rsvp_game");
    if (error) {
      console.warn("Não foi possível carregar o jogo do convite.", error);
      return;
    }

    game = data?.[0] || null;
    if (!game || !gameButton) return;
    gameButton.hidden = false;
    gameButton.classList.remove("is-hidden");
    gameButton.querySelector("span:last-child").textContent =
      game.play_count > 0
        ? "Rever surpresa"
        : game.display_names.length > 1
          ? "Uma surpresa para vocês"
          : "Uma surpresa para você";
  }

  gameButton?.addEventListener("click", showModal);
  document.getElementById("rsvpGameCloseButton")?.addEventListener("click", closeModal);
  document.getElementById("rsvpGameDoneButton")?.addEventListener("click", closeModal);
  document.getElementById("rsvpGameStartButton")?.addEventListener("click", startQuiz);
  document.getElementById("rsvpGameReplayButton")?.addEventListener("click", startQuiz);
  reviewButton?.addEventListener("click", showFinal);
  revealButton?.addEventListener("click", completeGame);
  document.querySelectorAll("[data-rsvp-game-skip]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) closeModal();
  });

  loadGame();
})();
