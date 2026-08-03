(function () {
  const scheduleTimeline = document.getElementById("scheduleTimeline");
  const scheduleEmptyState = document.getElementById("scheduleEmptyState");
  const scheduleHeroDescription = document.getElementById(
    "scheduleHeroDescription",
  );
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  const ACTIVITY_TYPE_LABELS = {
    attraction: "Atração",
    island: "Ilha",
    moment: "Momento",
    other: "Outro",
    service: "Serviço",
  };

  function isCoupleInvite(guest) {
    return guest?.invite_type === "couple";
  }

  function updateHeroDescription(guest) {
    if (!scheduleHeroDescription) {
      return;
    }

    scheduleHeroDescription.textContent = isCoupleInvite(guest)
      ? "Vejam os principais momentos que preparamos para celebrar esse dia com vocês"
      : "Veja os principais momentos que preparamos para celebrar esse dia com você";
  }

  function showToast(message) {
    if (!toast || !toastMessage) {
      return;
    }

    toastMessage.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  function formatTime(value) {
    if (!value) {
      return "";
    }

    return String(value).slice(0, 5);
  }

  function getTimeLabel(activity, sectionTitle) {
    if (activity.time_mode === "available") {
      return `Disponível durante ${sectionTitle || "a etapa"}`;
    }

    if (activity.time_mode === "tbd") {
      return "Horário a definir";
    }

    if (activity.time_mode === "period") {
      return `${formatTime(activity.start_time)} - ${formatTime(activity.end_time)}`;
    }

    return formatTime(activity.start_time);
  }

  function groupScheduleRows(rows) {
    const sections = [];
    const sectionsById = new Map();

    rows.forEach((row) => {
      if (!sectionsById.has(row.section_id)) {
        const section = {
          activities: [],
          address: row.address,
          description: row.section_description,
          id: row.section_id,
          locationName: row.location_name,
          title: row.section_title,
        };

        sectionsById.set(row.section_id, section);
        sections.push(section);
      }

      if (!row.activity_id) {
        return;
      }

      sectionsById.get(row.section_id).activities.push({
        description: row.activity_description,
        end_time: row.end_time,
        id: row.activity_id,
        start_time: row.start_time,
        time_mode: row.time_mode,
        title: row.activity_title,
        type: row.activity_type,
      });
    });

    return sections;
  }

  function createActivityElement(activity, sectionTitle) {
    const item = document.createElement("article");
    const time = document.createElement("span");
    const content = document.createElement("div");
    const title = document.createElement("h3");
    const type = document.createElement("span");

    item.className = "schedule-activity";
    time.className = "schedule-activity-time";
    time.textContent = getTimeLabel(activity, sectionTitle);
    content.className = "schedule-activity-content";
    title.textContent = activity.title || "Atividade";
    type.className = "schedule-activity-type";
    type.textContent = ACTIVITY_TYPE_LABELS[activity.type] || "Outro";

    content.append(title, type);

    if (activity.description) {
      const description = document.createElement("p");
      description.textContent = activity.description;
      content.appendChild(description);
    }

    item.append(time, content);
    return item;
  }

  function createSectionElement(section) {
    const card = document.createElement("article");
    const header = document.createElement("header");
    const title = document.createElement("h2");
    const location = document.createElement("p");
    const activities = document.createElement("div");

    card.className = "schedule-section-card";
    header.className = "schedule-section-header";
    title.textContent = section.title || "Etapa";
    location.className = "schedule-location";
    location.textContent = section.locationName || "Local a definir";
    activities.className = "schedule-activities";

    header.append(title, location);

    if (section.address) {
      const address = document.createElement("p");
      address.className = "schedule-address";
      address.textContent = section.address;
      header.appendChild(address);
    }

    if (section.description) {
      const description = document.createElement("p");
      description.className = "schedule-description";
      description.textContent = section.description;
      header.appendChild(description);
    }

    section.activities.forEach((activity) => {
      activities.appendChild(createActivityElement(activity, section.title));
    });

    card.append(header, activities);
    return card;
  }

  function renderSchedule(rows) {
    if (!scheduleTimeline || !scheduleEmptyState) {
      return;
    }

    const sections = groupScheduleRows(rows);

    scheduleTimeline.replaceChildren();
    scheduleEmptyState.hidden = sections.length > 0;

    sections.forEach((section) => {
      scheduleTimeline.appendChild(createSectionElement(section));
    });
  }

  async function requireGuest() {
    const guest = await window.GuestAuth?.getGuest?.();

    if (!guest) {
      window.location.href = "login.html?redirect=schedule";
      return null;
    }

    window.currentGuest = guest;
    window.PublicCommon?.showGuestName(guest);
    updateHeroDescription(guest);
    document.body.classList.remove("guest-auth-pending");
    return guest;
  }

  async function loadSchedule() {
    const { data, error } = await supabaseClient.rpc("list_public_schedule");

    if (error) {
      console.error(error);
      renderSchedule([]);
      showToast("Não foi possível carregar a programação agora.");
      return;
    }

    renderSchedule(data || []);
  }

  window.PublicCommon?.setupNavbar();
  window.PublicCommon?.setupLogout();

  requireGuest()
    .then((guest) => {
      if (guest) {
        return loadSchedule();
      }

      return null;
    })
    .catch((error) => {
      console.error(error);
      window.location.href = "login.html?redirect=schedule";
    });
})();
