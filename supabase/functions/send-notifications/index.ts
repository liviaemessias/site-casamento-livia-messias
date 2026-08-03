import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const MAX_EVENTS_PER_RUN = 10;
const MAX_ERROR_LENGTH = 1000;
const EMAIL_BRAND_COLOR = "#5b1166";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const adminEmail = Deno.env.get("ADMIN_EMAIL") || "liviaemessias23@gmail.com";
const smtpHost = Deno.env.get("SMTP_HOST");
const smtpPort = Number(Deno.env.get("SMTP_PORT") || 587);
const smtpSecure = (Deno.env.get("SMTP_SECURE") || "false").toLowerCase() ===
  "true";
const smtpUser = Deno.env.get("SMTP_USER");
const smtpPass = Deno.env.get("SMTP_PASS");
const smtpFromEmail = Deno.env.get("SMTP_FROM_EMAIL");
const smtpFromName = Deno.env.get("SMTP_FROM_NAME") || "Livia & Messias";
const allowedOrigins = new Set(
  (Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  !serviceRoleKey ||
  !smtpHost ||
  !smtpUser ||
  !smtpPass ||
  !smtpFromEmail
) {
  throw new Error("Missing required notification environment variables.");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const mailer = nodemailer.createTransport({
  auth: {
    pass: smtpPass,
    user: smtpUser,
  },
  host: smtpHost,
  port: smtpPort,
  requireTLS: !smtpSecure,
  secure: smtpSecure,
  tls: {
    minVersion: "TLSv1.2",
  },
});

type NotificationEvent = {
  id: string;
  event_type: string;
  aggregate_type: string;
  aggregate_id: string;
  aggregate_version: string | null;
  origin?: string | null;
  guest_id: string | null;
  dedupe_key: string;
  payload: Record<string, unknown>;
};

type DeliveryRecipient = {
  email: string | null;
  reason?: string;
  type: "admin" | "guest";
};

type NotificationActor = {
  guestId: string | null;
  isAdmin: boolean;
};

type PendingEventFilters = {
  aggregateId: string | null;
  eventType: string | null;
  eventId: string | null;
};

type NotificationPreference = {
  admin_enabled: boolean;
  automatic_enabled: boolean;
  guest_enabled: boolean;
  manual_enabled: boolean;
};

const defaultNotificationPreference: NotificationPreference = {
  admin_enabled: true,
  automatic_enabled: true,
  guest_enabled: true,
  manual_enabled: false,
};

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "";
  const allowedOrigin = allowedOrigins.has(origin) ? origin : "";

  return {
    ...(allowedOrigin ? { "Access-Control-Allow-Origin": allowedOrigin } : {}),
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    Vary: "Origin",
  };
}

function jsonResponse(
  request: Request,
  body: Record<string, unknown>,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    headers: getCorsHeaders(request),
    status,
  });
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";

  return authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
    };
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;

    return {
      code: record.code,
      message: record.message,
      name: record.name,
      status: record.status,
    };
  }

  return {
    message: String(error),
  };
}

function getSafeErrorMessage(error: unknown) {
  return JSON.stringify(serializeError(error)).slice(0, MAX_ERROR_LENGTH);
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeText(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function getDietaryRestrictionText(payload: Record<string, unknown>) {
  const hasRestriction = typeof payload.food_restriction === "boolean"
    ? payload.food_restriction
    : Boolean(normalizeText(payload.food));

  if (!hasRestriction) {
    return "Não";
  }

  return normalizeText(payload.food, "Sim, sem detalhes informados");
}

function hasPersonDietaryRestriction(person: Record<string, unknown>) {
  if (typeof person.food_restriction === "boolean") {
    return person.food_restriction;
  }

  const restriction = normalizeText(person.food_restriction).toLowerCase();

  return restriction === "sim" || restriction === "true" ||
    Boolean(normalizeText(person.food));
}

function removeDuplicatedPersonPrefix(food: unknown, personName: unknown) {
  const text = normalizeText(food);
  const name = normalizeText(personName);

  if (!text || !name) {
    return text;
  }

  const prefix = `${name}:`;

  return text.toLowerCase().startsWith(prefix.toLowerCase())
    ? normalizeText(text.slice(prefix.length))
    : text;
}

function getPersonDietaryRestrictionDetails(person: Record<string, unknown>) {
  if (!hasPersonDietaryRestriction(person)) {
    return "";
  }

  return removeDuplicatedPersonPrefix(person.food, person.name) ||
    "Sim, sem detalhes informados";
}

function getDietaryRestrictionLines(payload: Record<string, unknown>) {
  const guestData = getGuestData(payload);
  const people: Array<Record<string, unknown>> = [];
  const isCouple = payload.invite_type === "couple";

  if (isCouple) {
    people.push(...asArray(guestData.members));
  } else {
    people.push({
      food: guestData.food ?? payload.food,
      food_restriction: guestData.food_restriction ?? payload.food_restriction,
      name: guestData.name || payload.guest_name,
      presence: payload.presence,
    });
  }

  people.push(...asArray(guestData.companions));

  const lines = people
    .filter((person) => normalizeText(person.presence, "Sim") !== "Não")
    .map((person) => {
      const details = getPersonDietaryRestrictionDetails(person);

      return details
        ? `${normalizeText(person.name, "Sem nome")}: ${details}`
        : "";
    })
    .filter(Boolean);

  if (lines.length) {
    return lines;
  }

  const legacyDietaryRestriction = getDietaryRestrictionText(payload);

  return legacyDietaryRestriction === "Não" ? [] : [legacyDietaryRestriction];
}

function isValidEmail(value: unknown) {
  const email = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function asArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === "object" && !Array.isArray(item)
    )
    : [];
}

function getGuestData(payload: Record<string, unknown>) {
  const guestData = payload.guest_data;

  return guestData && typeof guestData === "object" && !Array.isArray(guestData)
    ? guestData as Record<string, unknown>
    : {};
}

function getOperationLabel(payload: Record<string, unknown>) {
  return normalizeText(payload.operation_label, "RSVP Recebido");
}

function getGuestEmail(payload: Record<string, unknown>) {
  const payloadEmail = normalizeText(payload.email);
  const guestData = getGuestData(payload);
  const guestDataEmail = normalizeText(guestData.email);

  return payloadEmail || guestDataEmail || null;
}

function getSubjectPrefix(payload: Record<string, unknown>) {
  return payload.operation === "updated"
    ? "RSVP Atualizado"
    : "RSVP Recebido";
}

function formatCurrency(value: unknown) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(amount);
}

function getGiftEventTitle(eventType: string, recipientType: "admin" | "guest") {
  const titles: Record<string, string> = {
    gift_contribution_confirmed: "Cota Confirmada",
    gift_contribution_payment_reported: "Pagamento Informado",
    gift_contribution_released: "Cota Liberada",
    gift_contribution_reminder: "Lembrete de Cota",
    gift_contribution_reserved: "Cota Reservada",
    gift_payment_reported: "Pagamento Informado",
    gift_purchase_confirmed: "Presente Confirmado",
    gift_reservation_reminder: "Lembrete de Presente",
    gift_reservation_released: "Presente Liberado",
    gift_reserved: "Presente Reservado",
  };
  const title = titles[eventType] || "Atualização de Presente";

  return recipientType === "guest" ? `${title} 💜` : `[Casamento] ${title} 💜`;
}

function isWallMessageEvent(eventType: string) {
  return [
    "wall_message_approved",
    "wall_message_replied",
    "wall_message_submitted",
  ].includes(eventType);
}

function getWallMessageEventTitle(eventType: string, recipientType: "admin" | "guest") {
  const titles: Record<string, string> = {
    wall_message_approved: "Recado Aprovado",
    wall_message_replied: "Recado Respondido",
    wall_message_submitted: "Novo Recado",
  };
  const title = titles[eventType] || "Recado";

  return recipientType === "guest" ? `${title} 💜` : `[Casamento] ${title} 💜`;
}

function getWallMessageGuestIntro(eventType: string, inviteType: unknown) {
  const isCouple = inviteType === "couple";
  const messages: Record<string, [string, string]> = {
    wall_message_approved: [
      "O recado de vocês já está no nosso mural! Muito obrigado por deixarem esse carinho registrado com a gente! 💜",
      "Seu recado já está no nosso mural! Muito obrigado por deixar esse carinho registrado com a gente! 💜",
    ],
    wall_message_replied: [
      "Respondemos o recado de vocês no nosso mural! Ficamos muito felizes em receber essa mensagem de vocês! 💜",
      "Respondemos seu recado no nosso mural! Ficamos muito felizes em receber sua mensagem! 💜",
    ],
  };
  const [coupleMessage, individualMessage] =
    messages[eventType] || ["Temos uma atualização sobre o recado de vocês. 💜", "Temos uma atualização sobre seu recado. 💜"];

  return isCouple ? coupleMessage : individualMessage;
}

function getWallMessageAdminIntro(eventType: string) {
  const messages: Record<string, string> = {
    wall_message_approved: "Um recado foi aprovado para o mural público.",
    wall_message_replied: "Um recado recebeu resposta dos noivos.",
    wall_message_submitted: "Um convidado enviou ou atualizou um recado no mural.",
  };

  return messages[eventType] || "Houve uma atualização no Mural de Recados.";
}

function isExternalPurchaseMethod(value: unknown) {
  const method = normalizeText(value);

  return method === "online" || method === "physical";
}

function getGiftGuestIntro(
  eventType: string,
  inviteType: unknown,
  purchaseMethod: unknown,
) {
  const isCouple = inviteType === "couple";
  const giftPaymentReportedMessages: [string, string] = isExternalPurchaseMethod(purchaseMethod)
    ? [
      "Recebemos a informação de compra do presente de vocês. Ficamos muito felizes e agradecemos de coração! Vamos verificar tudo logo logo! 💜❤️",
      "Recebemos sua informação de compra do presente. Ficamos muito felizes e agradecemos de coração! Vamos verificar tudo logo logo! 💜❤️",
    ]
    : [
      "Recebemos a informação de pagamento do presente de vocês. Ficamos muito felizes e agradecemos de coração! Vamos verificar tudo logo logo! 💜❤️",
      "Recebemos sua informação de pagamento do presente. Ficamos muito felizes e agradecemos de coração! Vamos verificar tudo logo logo! 💜❤️",
    ];
  const messages: Record<string, [string, string]> = {
    gift_contribution_confirmed: [
      "Confirmamos a contribuição de vocês para o nosso presente! Muito obrigado pelo carinho e por fazerem parte desse momento com a gente! 💜❤️",
      "Confirmamos sua contribuição para o nosso presente! Muito obrigado pelo carinho e por fazer parte desse momento com a gente! 💜❤️",
    ],
    gift_contribution_payment_reported: [
      "Recebemos a informação de pagamento da cota de vocês. Ficamos muito felizes e agradecemos de coração! Vamos verificar tudo logo logo! 💜❤️",
      "Recebemos sua informação de pagamento da cota. Ficamos muito felizes e agradecemos de coração! Vamos verificar tudo logo logo! 💜❤️",
    ],
    gift_contribution_released: [
      "A reserva de cota de vocês foi liberada, mas está tudo bem! Se quiserem, vocês podem escolher outra cota ou outro presente na nossa lista. 💜",
      "Sua reserva de cota foi liberada, mas está tudo bem! Se quiser, você pode escolher outra cota ou outro presente na nossa lista. 💜",
    ],
    gift_contribution_reserved: [
      "Recebemos a reserva de cota de vocês para o nosso presente. Desde já, muito obrigado pela contribuição de vocês! 💜",
      "Recebemos sua reserva de cota para o nosso presente. Desde já, muito obrigado pela sua contribuição! 💜",
    ],
    gift_contribution_reminder: [
      "Passando para lembrar com carinho da reserva de cota de vocês. Se vocês já tiverem feito o pagamento, podem desconsiderar este aviso. Se possível, informem o pagamento pelo site para conseguirmos acompanhar tudo direitinho! 💜❤️",
      "Passando para lembrar com carinho da sua reserva de cota. Se você já tiver feito o pagamento, pode desconsiderar este aviso. Se possível, informe o pagamento pelo site para conseguirmos acompanhar tudo direitinho! 💜❤️",
    ],
    gift_payment_reported: giftPaymentReportedMessages,
    gift_purchase_confirmed: [
      "Confirmamos o presente de vocês! Muito obrigado pelo carinho e por fazerem parte desse momento com a gente! 💜❤️",
      "Confirmamos seu presente! Muito obrigado pelo carinho e por fazer parte desse momento com a gente! 💜❤️",
    ],
    gift_reservation_released: [
      "A reserva de presente de vocês foi liberada, mas está tudo bem! Se quiserem, vocês podem escolher outro presente na nossa lista. 💜",
      "Sua reserva de presente foi liberada, mas está tudo bem! Se quiser, você pode escolher outro presente na nossa lista. 💜",
    ],
    gift_reservation_reminder: [
      "Passando para lembrar com carinho da reserva de presente de vocês. Se vocês já tiverem feito a compra, podem desconsiderar este aviso. Se possível, informem a compra pelo site para conseguirmos acompanhar tudo direitinho! 💜❤️",
      "Passando para lembrar com carinho da sua reserva de presente. Se você já tiver feito a compra, pode desconsiderar este aviso. Se possível, informe a compra pelo site para conseguirmos acompanhar tudo direitinho! 💜❤️",
    ],
    gift_reserved: [
      "Recebemos a reserva de presente de vocês para o nosso casamento. Desde já, agradecemos a vocês! 💜",
      "Recebemos sua reserva de presente para o nosso casamento. Desde já, agradecemos a você! 💜",
    ],
  };
  const [coupleMessage, individualMessage] =
    messages[eventType] || ["Temos uma atualização sobre o presente de vocês.", "Temos uma atualização sobre seu presente."];

  return isCouple ? coupleMessage : individualMessage;
}

function getGiftAdminIntro(eventType: string, purchaseMethod: unknown) {
  if (eventType === "gift_payment_reported") {
    return isExternalPurchaseMethod(purchaseMethod)
      ? "Um convidado informou compra de presente."
      : "Um convidado informou pagamento de presente.";
  }

  const messages: Record<string, string> = {
    gift_contribution_confirmed: "Uma contribuição de cota foi confirmada pelo admin.",
    gift_contribution_payment_reported: "Um convidado informou pagamento de cota.",
    gift_contribution_released: "Uma reserva de cota foi liberada pelo admin.",
    gift_contribution_reminder: "Um lembrete manual de cota pendente foi enviado.",
    gift_contribution_reserved: "Um convidado reservou cota de presente.",
    gift_purchase_confirmed: "Um presente foi confirmado pelo admin.",
    gift_reservation_reminder: "Um lembrete manual de presente pendente foi enviado.",
    gift_reservation_released: "Uma reserva de presente foi liberada pelo admin.",
    gift_reserved: "Um convidado reservou um presente.",
  };

  return messages[eventType] || "Houve uma atualização em presentes.";
}

function getGiftEventDisplayTitle(
  eventType: string,
  purchaseMethod: unknown,
  recipientType: "admin" | "guest",
) {
  if (eventType !== "gift_payment_reported") {
    return null;
  }

  const title = isExternalPurchaseMethod(purchaseMethod)
    ? "Compra Informada"
    : "Pagamento Informado";

  return recipientType === "guest" ? `${title} 💜` : `[Casamento] ${title} 💜`;
}

function getPurchaseMethodLabel(value: unknown) {
  const labels: Record<string, string> = {
    card: "Cartão",
    online: "Compra online",
    physical: "Loja física",
    pix: "PIX",
  };
  const method = normalizeText(value);

  return labels[method] || method || "Não informado";
}

function renderGiftDetails(
  payload: Record<string, unknown>,
  recipientType: "admin" | "guest",
) {
  const quotaQuantity = normalizeText(payload.quota_quantity);
  const totalValue = payload.total_value || payload.price;
  const method = payload.purchase_method || payload.payment_method;
  const inviteTypeRow = recipientType === "admin"
    ? renderKeyValue(
      "Tipo do convite",
      payload.invite_type === "couple" ? "Casal" : "Individual",
    )
    : "";

  return `
    <table style="width:100%;border-collapse:collapse;margin:0 0 18px;background:#fbf8fd;border-radius:8px;">
      ${renderKeyValue("Convidado", payload.guest_name)}
      ${inviteTypeRow}
      ${renderKeyValue("Presente", payload.gift_name)}
      ${renderKeyValue("Categoria", payload.gift_category)}
      ${quotaQuantity ? renderKeyValue("Quantidade de cotas", quotaQuantity) : ""}
      ${renderKeyValue("Valor", formatCurrency(totalValue))}
      ${renderKeyValue("Forma", getPurchaseMethodLabel(method))}
      ${renderKeyValue("Mensagem", payload.message)}
    </table>
  `;
}

function renderWallMessageDetails(payload: Record<string, unknown>, recipientType: "admin" | "guest") {
  const inviteTypeRow = recipientType === "admin"
    ? renderKeyValue(
      "Tipo do convite",
      payload.invite_type === "couple" ? "Casal" : "Individual",
    )
    : "";
  const replyRow = normalizeText(payload.couple_reply)
    ? renderKeyValue("Resposta dos noivos", payload.couple_reply)
    : "";

  return `
    <table style="width:100%;border-collapse:collapse;margin:0 0 18px;background:#fbf8fd;border-radius:8px;">
      ${renderKeyValue("Convidado", payload.guest_name)}
      ${inviteTypeRow}
      ${renderKeyValue("Recado", payload.message)}
      ${replyRow}
    </table>
  `;
}

function renderKeyValue(label: string, value: unknown) {
  const safeValue = normalizeText(value, "Não informado");

  return `
    <tr>
      <td style="padding:6px 10px;color:#6b6473;font-weight:700;">${escapeHtml(label)}</td>
      <td style="padding:6px 10px;color:#2f2933;">${escapeHtml(safeValue)}</td>
    </tr>
  `;
}

function renderList(items: string[]) {
  if (!items.length) {
    return "<p style=\"margin:0;color:#6b6473;\">Nenhum.</p>";
  }

  return `
    <ul style="margin:0;padding-left:20px;color:#2f2933;">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function renderDietaryRestrictions(items: string[]) {
  return `
    <h2 style="margin:0 0 8px;color:${EMAIL_BRAND_COLOR};font-size:16px;">Restrições alimentares</h2>
    <div style="margin-bottom:18px;">${renderList(items)}</div>
  `;
}

function getCompanionLines(payload: Record<string, unknown>) {
  const guestData = getGuestData(payload);

  return asArray(guestData.companions).map((companion) => {
    const name = normalizeText(companion.name, "Sem nome");
    const child = normalizeText(companion.is_child, "Não");
    const age = normalizeText(companion.age);

    return child === "Sim" && age
      ? `${name} - criança, ${age}`
      : `${name}${child === "Sim" ? " - criança" : ""}`;
  });
}

function getMemberLines(payload: Record<string, unknown>) {
  const guestData = getGuestData(payload);

  return asArray(guestData.members).map((member) => {
    const name = normalizeText(member.name, "Sem nome");
    const presence = normalizeText(member.presence, "Não informado");

    return `${name}: ${presence}`;
  });
}

function isPresenceConfirmed(value: unknown) {
  return normalizeText(value).toLowerCase() === "sim";
}

function isGuestComing(payload: Record<string, unknown>) {
  const guestData = getGuestData(payload);
  const members = asArray(guestData.members);

  if (payload.invite_type === "couple" && members.length) {
    return members.some((member) => isPresenceConfirmed(member.presence));
  }

  return isPresenceConfirmed(payload.presence);
}

function getGuestRsvpIntro(payload: Record<string, unknown>) {
  const isUpdated = payload.operation === "updated";
  const isCouple = payload.invite_type === "couple";
  const isComing = isGuestComing(payload);

  if (isCouple && isComing) {
    const prefix = isUpdated
      ? "Atualizamos a confirmação de presença de vocês para o nosso casamento!"
      : "Recebemos a confirmação de presença de vocês para o nosso casamento!";

    return `${prefix} Ficamos muito felizes em saber que vocês estarão com a gente nesse dia tão especial! 💜❤️`;
  }

  if (isCouple) {
    const prefix = isUpdated
      ? "Atualizamos a resposta de vocês para o nosso casamento."
      : "Recebemos a resposta de vocês para o nosso casamento.";

    return `${prefix} Sentiremos muito a falta de vocês nesse dia especial, mas agradecemos muito pelo carinho em nos avisarem. 😔💜❤️`;
  }

  if (isComing) {
    const prefix = isUpdated
      ? "Atualizamos sua confirmação de presença para o nosso casamento!"
      : "Recebemos sua confirmação de presença para o nosso casamento!";

    return `${prefix} Ficamos muito felizes em saber que você estará com a gente nesse dia tão especial! 💜❤️`;
  }

  const prefix = isUpdated
    ? "Atualizamos sua resposta para o nosso casamento."
    : "Recebemos sua resposta para o nosso casamento.";

  return `${prefix} Sentiremos sua falta nesse dia especial, mas agradecemos muito pelo carinho em nos avisar. 😔💜❤️`;
}

function renderEmailShell(title: string, body: string) {
  return `
    <div style="margin:0;padding:24px;background:#f7f2fb;font-family:Arial,sans-serif;color:#2f2933;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px;border:1px solid #eadff3;">
        <h1 style="margin:0 0 16px;color:${EMAIL_BRAND_COLOR};font-size:24px;line-height:1.25;">${escapeHtml(title)}</h1>
        ${body}
        <p style="margin:24px 0 0;color:#6b6473;font-size:13px;">Livia & Messias 💜❤️</p>
      </div>
    </div>
  `;
}

function buildGuestEmail(event: NotificationEvent) {
  const payload = event.payload;
  const prefix = getSubjectPrefix(payload);
  const title = `${prefix} 💜`;
  const guestName = normalizeText(payload.guest_name, "Convidado");
  const presence = normalizeText(payload.presence, "Não informado");
  const companions = getCompanionLines(payload);
  const members = getMemberLines(payload);
  const dietaryRestrictions = getDietaryRestrictionLines(payload);
  const memberResponses = payload.invite_type === "couple"
    ? `
        <h2 style="margin:0 0 8px;color:${EMAIL_BRAND_COLOR};font-size:16px;">Respostas do convite</h2>
        <div style="margin-bottom:18px;">${renderList(members)}</div>
      `
    : "";
  const intro = getGuestRsvpIntro(payload);

  return {
    html: renderEmailShell(
      title,
      `
        <p style="margin:0 0 16px;">Olá, ${escapeHtml(guestName)}! 💜</p>
        <p style="margin:0 0 18px;">${escapeHtml(intro)}</p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 18px;background:#fbf8fd;border-radius:8px;">
          ${renderKeyValue("Presença", presence)}
        </table>
        ${memberResponses}
        ${renderDietaryRestrictions(dietaryRestrictions)}
        <h2 style="margin:0 0 8px;color:${EMAIL_BRAND_COLOR};font-size:16px;">Acompanhantes</h2>
        ${renderList(companions)}
      `,
    ),
    subject: `${title} - Livia & Messias`,
  };
}

function buildAdminEmail(event: NotificationEvent) {
  const payload = event.payload;
  const prefix = getSubjectPrefix(payload);
  const guestName = normalizeText(payload.guest_name, "Convidado");
  const title = `[Casamento] ${prefix} 💜 - ${guestName}`;
  const companions = getCompanionLines(payload);
  const members = getMemberLines(payload);
  const dietaryRestrictions = getDietaryRestrictionLines(payload);

  return {
    html: renderEmailShell(
      title,
      `
        <p style="margin:0 0 18px;">Um RSVP público foi ${payload.operation === "updated" ? "atualizado" : "respondido"}.</p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 18px;background:#fbf8fd;border-radius:8px;">
          ${renderKeyValue("Status", getOperationLabel(payload))}
          ${renderKeyValue("Convite", guestName)}
          ${renderKeyValue("Tipo", payload.invite_type === "couple" ? "Casal" : "Individual")}
          ${renderKeyValue("Presença", payload.presence)}
          ${renderKeyValue("E-mail", payload.email)}
          ${renderKeyValue("Telefone", payload.phone)}
          ${renderKeyValue("Mensagem", payload.message)}
        </table>
        ${renderDietaryRestrictions(dietaryRestrictions)}
        <h2 style="margin:0 0 8px;color:${EMAIL_BRAND_COLOR};font-size:16px;">Membros do convite</h2>
        <div style="margin-bottom:18px;">${renderList(members)}</div>
        <h2 style="margin:0 0 8px;color:${EMAIL_BRAND_COLOR};font-size:16px;">Acompanhantes</h2>
        ${renderList(companions)}
      `,
    ),
    subject: title,
  };
}

function buildGiftGuestEmail(event: NotificationEvent) {
  const payload = event.payload;
  const purchaseMethod = payload.purchase_method || payload.payment_method;
  const title =
    getGiftEventDisplayTitle(event.event_type, purchaseMethod, "guest") ||
    getGiftEventTitle(event.event_type, "guest");
  const guestName = normalizeText(payload.guest_name, "Convidado");
  const intro = getGiftGuestIntro(
    event.event_type,
    payload.invite_type,
    purchaseMethod,
  );

  return {
    html: renderEmailShell(
      title,
      `
        <p style="margin:0 0 16px;">Olá, ${escapeHtml(guestName)}! 💜</p>
        <p style="margin:0 0 18px;">${escapeHtml(intro)}</p>
        ${renderGiftDetails(payload, "guest")}
      `,
    ),
    subject: `${title} - Livia & Messias`,
  };
}

function buildGiftAdminEmail(event: NotificationEvent) {
  const payload = event.payload;
  const guestName = normalizeText(payload.guest_name, "Convidado");
  const purchaseMethod = payload.purchase_method || payload.payment_method;
  const baseTitle =
    getGiftEventDisplayTitle(event.event_type, purchaseMethod, "admin") ||
    getGiftEventTitle(event.event_type, "admin");
  const title = `${baseTitle} - ${guestName}`;

  return {
    html: renderEmailShell(
      title,
      `
        <p style="margin:0 0 18px;">${escapeHtml(getGiftAdminIntro(event.event_type, purchaseMethod))}</p>
        ${renderGiftDetails(payload, "admin")}
      `,
    ),
    subject: title,
  };
}

function buildWallMessageGuestEmail(event: NotificationEvent) {
  const payload = event.payload;
  const title = getWallMessageEventTitle(event.event_type, "guest");
  const guestName = normalizeText(payload.guest_name, "Convidado");
  const intro = getWallMessageGuestIntro(event.event_type, payload.invite_type);

  return {
    html: renderEmailShell(
      title,
      `
        <p style="margin:0 0 16px;">Olá, ${escapeHtml(guestName)}! 💜</p>
        <p style="margin:0 0 18px;">${escapeHtml(intro)}</p>
        ${renderWallMessageDetails(payload, "guest")}
      `,
    ),
    subject: `${title} - Livia & Messias`,
  };
}

function buildWallMessageAdminEmail(event: NotificationEvent) {
  const payload = event.payload;
  const guestName = normalizeText(payload.guest_name, "Convidado");
  const title = `${getWallMessageEventTitle(event.event_type, "admin")} - ${guestName}`;

  return {
    html: renderEmailShell(
      title,
      `
        <p style="margin:0 0 18px;">${escapeHtml(getWallMessageAdminIntro(event.event_type))}</p>
        ${renderWallMessageDetails(payload, "admin")}
      `,
    ),
    subject: title,
  };
}

function buildEmail(event: NotificationEvent, recipientType: "admin" | "guest") {
  if (event.event_type === "rsvp_saved") {
    return recipientType === "admin"
      ? buildAdminEmail(event)
      : buildGuestEmail(event);
  }

  if (isWallMessageEvent(event.event_type)) {
    return recipientType === "admin"
      ? buildWallMessageAdminEmail(event)
      : buildWallMessageGuestEmail(event);
  }

  return recipientType === "admin"
    ? buildGiftAdminEmail(event)
    : buildGiftGuestEmail(event);
}

async function getCurrentGuestId(accessToken: string) {
  const userClient = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
  const { data, error } = await userClient.rpc("get_current_guest_profile");
  const guest = Array.isArray(data) ? data[0] : data;

  if (error || !guest?.id) {
    return null;
  }

  return String(guest.id);
}

async function getNotificationActor(accessToken: string): Promise<NotificationActor | null> {
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  const userId = userData?.user?.id;

  if (!userError && userId) {
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .eq("active", true)
      .maybeSingle();

    if (adminError) {
      throw adminError;
    }

    if (adminUser) {
      return { guestId: null, isAdmin: true };
    }
  }

  const guestId = await getCurrentGuestId(accessToken);

  if (guestId) {
    return { guestId, isAdmin: false };
  }

  return null;
}

function normalizeOptionalFilter(value: unknown) {
  const text = normalizeText(value);

  return text || null;
}

async function getPendingEventFilters(request: Request): Promise<PendingEventFilters> {
  try {
    const body = await request.json();

    return {
      aggregateId: normalizeOptionalFilter(body?.aggregate_id),
      eventType: normalizeOptionalFilter(body?.event_type),
      eventId: normalizeOptionalFilter(body?.notification_event_id),
    };
  } catch (_error) {
    return {
      aggregateId: null,
      eventType: null,
      eventId: null,
    };
  }
}

async function loadPendingEvents(
  actor: NotificationActor,
  limit: number,
  filters: PendingEventFilters,
) {
  let query = supabaseAdmin
    .from("notification_events")
    .select("*")
    .eq("status", "pending")
    .lte("next_attempt_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(limit);

  if (!actor.isAdmin && actor.guestId) {
    query = query.eq("guest_id", actor.guestId);
  }

  if (filters.eventType) {
    query = query.eq("event_type", filters.eventType);
  }

  if (filters.eventId) {
    query = query.eq("id", filters.eventId);
  }

  if (filters.aggregateId) {
    query = query.eq("aggregate_id", filters.aggregateId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []) as NotificationEvent[];
}

async function countPendingEvents(
  actor: NotificationActor,
  filters: PendingEventFilters,
  onlyReady: boolean,
) {
  let query = supabaseAdmin
    .from("notification_events")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (onlyReady) {
    query = query.lte("next_attempt_at", new Date().toISOString());
  }

  if (!actor.isAdmin && actor.guestId) {
    query = query.eq("guest_id", actor.guestId);
  }

  if (filters.eventType) {
    query = query.eq("event_type", filters.eventType);
  }

  if (filters.eventId) {
    query = query.eq("id", filters.eventId);
  }

  if (filters.aggregateId) {
    query = query.eq("aggregate_id", filters.aggregateId);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count || 0;
}

function isMissingPreferenceTableError(error: Record<string, unknown>) {
  return error.code === "42P01" ||
    String(error.message || "").includes("notification_preferences");
}

async function getNotificationPreference(eventType: string) {
  const { data, error } = await supabaseAdmin
    .from("notification_preferences")
    .select("automatic_enabled, manual_enabled, admin_enabled, guest_enabled")
    .eq("event_type", eventType)
    .maybeSingle();

  if (error) {
    if (isMissingPreferenceTableError(error as unknown as Record<string, unknown>)) {
      return defaultNotificationPreference;
    }

    throw error;
  }

  const preference = data
    ? {
      admin_enabled: data.admin_enabled !== false,
      automatic_enabled: data.automatic_enabled !== false,
      guest_enabled: data.guest_enabled !== false,
      manual_enabled: data.manual_enabled === true,
    }
    : defaultNotificationPreference;

  return preference;
}

async function claimEvent(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from("notification_events")
    .update({
      claimed_at: new Date().toISOString(),
      status: "processing",
    })
    .eq("id", eventId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function createDelivery(event: NotificationEvent, recipient: DeliveryRecipient) {
  const dedupeKey = `${event.dedupe_key}:${recipient.type}`;
  const status = recipient.email ? "pending" : "skipped";
  const timestamp = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("notification_deliveries")
    .insert({
      channel: "email",
      dedupe_key: dedupeKey,
      event_id: event.id,
      last_error: recipient.email ? null : recipient.reason || "email_missing",
      recipient_email: recipient.email,
      recipient_type: recipient.type,
      skipped_at: recipient.email ? null : timestamp,
      status,
    })
    .select("*")
    .maybeSingle();

  if (!error) {
    return data;
  }

  if (error.code !== "23505") {
    throw error;
  }

  const existing = await supabaseAdmin
    .from("notification_deliveries")
    .select("*")
    .eq("dedupe_key", dedupeKey)
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  return existing.data;
}

async function claimDelivery(deliveryId: string) {
  const { data, error } = await supabaseAdmin
    .from("notification_deliveries")
    .update({
      attempts: 1,
      claimed_at: new Date().toISOString(),
      status: "processing",
    })
    .eq("id", deliveryId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function markDeliverySent(deliveryId: string) {
  const { error } = await supabaseAdmin
    .from("notification_deliveries")
    .update({
      sent_at: new Date().toISOString(),
      status: "sent",
    })
    .eq("id", deliveryId);

  if (error) {
    throw error;
  }
}

async function markDeliveryFailed(deliveryId: string, error: unknown) {
  const { error: updateError } = await supabaseAdmin
    .from("notification_deliveries")
    .update({
      failed_at: new Date().toISOString(),
      last_error: getSafeErrorMessage(error),
      status: "failed",
    })
    .eq("id", deliveryId);

  if (updateError) {
    throw updateError;
  }
}

async function sendDelivery(event: NotificationEvent, delivery: Record<string, unknown>) {
  if (delivery.status === "sent" || delivery.status === "skipped") {
    return { failed: false, skipped: true };
  }

  if (delivery.status !== "pending") {
    return { failed: false, skipped: true };
  }

  const claimed = await claimDelivery(String(delivery.id));

  if (!claimed) {
    return { failed: false, skipped: true };
  }

  const recipientType = delivery.recipient_type;
  const email = normalizeText(delivery.recipient_email);
  const message = buildEmail(
    event,
    recipientType === "admin" ? "admin" : "guest",
  );

  try {
    await mailer.sendMail({
      from: `"${smtpFromName}" <${smtpFromEmail}>`,
      html: message.html,
      subject: message.subject,
      to: email,
    });
    await markDeliverySent(String(delivery.id));
    return { failed: false, skipped: false };
  } catch (error) {
    await markDeliveryFailed(String(delivery.id), error);
    return { failed: true, skipped: false };
  }
}

function resolveRecipients(
  event: NotificationEvent,
  preference: NotificationPreference,
): DeliveryRecipient[] {
  const guestEmail = getGuestEmail(event.payload);
  const isManual = event.origin === "manual";
  const manualRecipientType = normalizeText(event.payload?.manual_recipient_type);
  const requestedRecipientType =
    manualRecipientType === "admin" || manualRecipientType === "guest"
      ? manualRecipientType
      : "";
  const flowEnabled = isManual
    ? preference.manual_enabled
    : preference.automatic_enabled;

  if (!flowEnabled) {
    const reason = isManual
      ? "manual_notification_disabled"
      : "automatic_notification_disabled";
    const disabledRecipients: DeliveryRecipient[] = [
      {
        email: null,
        reason,
        type: "admin",
      },
      {
        email: null,
        reason,
        type: "guest",
      },
    ];

    return requestedRecipientType
      ? disabledRecipients.filter((recipient) =>
        recipient.type === requestedRecipientType
      )
      : disabledRecipients;
  }

  const recipients: DeliveryRecipient[] = [
    preference.admin_enabled
      ? {
        email: adminEmail,
        type: "admin",
      }
      : {
        email: null,
        reason: "admin_notification_disabled",
        type: "admin",
      },
    !preference.guest_enabled
      ? {
        email: null,
        reason: "guest_notification_disabled",
        type: "guest",
      }
      : isValidEmail(guestEmail)
      ? {
        email: guestEmail,
        type: "guest",
      }
      : {
        email: null,
        reason: "guest_email_missing",
        type: "guest",
      },
  ];

  return requestedRecipientType
    ? recipients.filter((recipient) => recipient.type === requestedRecipientType)
    : recipients;
}

async function finalizeEvent(eventId: string, failed: boolean, lastError = "") {
  const { error } = await supabaseAdmin
    .from("notification_events")
    .update({
      attempts: 1,
      failed_at: failed ? new Date().toISOString() : null,
      last_error: failed ? lastError.slice(0, MAX_ERROR_LENGTH) : null,
      processed_at: failed ? null : new Date().toISOString(),
      status: failed ? "failed" : "processed",
    })
    .eq("id", eventId);

  if (error) {
    throw error;
  }
}

async function processEvent(event: NotificationEvent) {
  const preference = await getNotificationPreference(event.event_type);
  const claimed = await claimEvent(event.id);

  if (!claimed) {
    return { failed: false, skipped: true };
  }

  const recipients = resolveRecipients(event, preference);
  let failed = false;
  let lastError = "";

  for (const recipient of recipients) {
    const delivery = await createDelivery(event, recipient);

    if (!delivery || delivery.status === "skipped") {
      continue;
    }

    const result = await sendDelivery(event, delivery);

    if (result.failed) {
      failed = true;
      lastError = "delivery_failed";
    }
  }

  await finalizeEvent(event.id, failed, lastError);

  return { failed, skipped: false };
}

Deno.serve(async (request) => {
  const requestId = crypto.randomUUID();

  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin") || "";

    if (origin && !allowedOrigins.has(origin)) {
      return jsonResponse(request, { error: "Origin not allowed." }, 403);
    }

    return new Response(null, {
      headers: getCorsHeaders(request),
      status: 204,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(request, { error: "Method not allowed." }, 405);
  }

  const origin = request.headers.get("origin") || "";

  if (origin && !allowedOrigins.has(origin)) {
    return jsonResponse(request, { error: "Origin not allowed." }, 403);
  }

  try {
    const accessToken = getBearerToken(request);

    if (!accessToken) {
      return jsonResponse(request, { error: "Unauthorized." }, 401);
    }

    const actor = accessToken === serviceRoleKey
      ? { guestId: null, isAdmin: true }
      : await getNotificationActor(accessToken);

    if (!actor) {
      return jsonResponse(request, { error: "Unauthorized." }, 401);
    }

    const filters = await getPendingEventFilters(request);
    const pending = await countPendingEvents(actor, filters, false);
    const ready = await countPendingEvents(actor, filters, true);
    const events = await loadPendingEvents(actor, MAX_EVENTS_PER_RUN, filters);
    let processed = 0;
    let failed = 0;

    for (const event of events) {
      const result = await processEvent(event);

      if (!result.skipped) {
        processed += 1;
      }

      if (result.failed) {
        failed += 1;
      }
    }

    return jsonResponse(request, {
      actor: actor.isAdmin ? "admin" : "guest",
      failed,
      filters,
      ok: true,
      pending,
      processed,
      ready,
      selected: events.length,
    });
  } catch (error) {
    console.error(
      "send-notifications failed:",
      JSON.stringify({
        error: serializeError(error),
        requestId,
      }),
    );

    return jsonResponse(
      request,
      {
        error: "Não foi possível processar notificações.",
        requestId,
      },
      500,
    );
  }
});
