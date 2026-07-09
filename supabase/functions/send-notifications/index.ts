import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const MAX_EVENTS_PER_RUN = 10;
const MAX_ERROR_LENGTH = 1000;

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
  guest_id: string | null;
  dedupe_key: string;
  payload: Record<string, unknown>;
};

type DeliveryRecipient = {
  email: string | null;
  reason?: string;
  type: "admin" | "guest";
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

function renderEmailShell(title: string, body: string) {
  return `
    <div style="margin:0;padding:24px;background:#f7f2fb;font-family:Arial,sans-serif;color:#2f2933;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px;border:1px solid #eadff3;">
        <h1 style="margin:0 0 16px;color:#6f3fa7;font-size:24px;line-height:1.25;">${escapeHtml(title)}</h1>
        ${body}
        <p style="margin:24px 0 0;color:#6b6473;font-size:13px;">Livia & Messias 💜</p>
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
  const memberResponses = payload.invite_type === "couple"
    ? `
        <h2 style="margin:0 0 8px;color:#6f3fa7;font-size:16px;">Respostas do convite</h2>
        <div style="margin-bottom:18px;">${renderList(members)}</div>
      `
    : "";
  const intro = payload.invite_type === "couple"
    ? payload.operation === "updated"
      ? "Atualizamos a confirmação de presença de vocês para o nosso casamento."
      : "Recebemos a confirmação de presença de vocês para o nosso casamento."
    : payload.operation === "updated"
    ? "Atualizamos sua confirmação de presença para o nosso casamento."
    : "Recebemos sua confirmação de presença para o nosso casamento.";

  return {
    html: renderEmailShell(
      title,
      `
        <p style="margin:0 0 16px;">Olá, ${escapeHtml(guestName)}! 💜</p>
        <p style="margin:0 0 18px;">${escapeHtml(intro)}</p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 18px;background:#fbf8fd;border-radius:8px;">
          ${renderKeyValue("Presença", presence)}
          ${renderKeyValue("Restrição alimentar", payload.food)}
        </table>
        ${memberResponses}
        <h2 style="margin:0 0 8px;color:#6f3fa7;font-size:16px;">Acompanhantes</h2>
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
          ${renderKeyValue("Restrição alimentar", payload.food)}
          ${renderKeyValue("Mensagem", payload.message)}
        </table>
        <h2 style="margin:0 0 8px;color:#6f3fa7;font-size:16px;">Membros do convite</h2>
        <div style="margin-bottom:18px;">${renderList(members)}</div>
        <h2 style="margin:0 0 8px;color:#6f3fa7;font-size:16px;">Acompanhantes</h2>
        ${renderList(companions)}
      `,
    ),
    subject: title,
  };
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

async function loadPendingEvents(guestId: string | null, limit: number) {
  let query = supabaseAdmin
    .from("notification_events")
    .select("*")
    .eq("status", "pending")
    .eq("event_type", "rsvp_saved")
    .lte("next_attempt_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(limit);

  if (guestId) {
    query = query.eq("guest_id", guestId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []) as NotificationEvent[];
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
  const message = recipientType === "admin"
    ? buildAdminEmail(event)
    : buildGuestEmail(event);

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

function resolveRecipients(event: NotificationEvent): DeliveryRecipient[] {
  const guestEmail = getGuestEmail(event.payload);

  return [
    {
      email: adminEmail,
      type: "admin",
    },
    isValidEmail(guestEmail)
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
  const claimed = await claimEvent(event.id);

  if (!claimed) {
    return { failed: false, skipped: true };
  }

  const recipients = resolveRecipients(event);
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

    const isServiceDispatch = accessToken === serviceRoleKey;
    const guestId = isServiceDispatch ? null : await getCurrentGuestId(accessToken);

    if (!isServiceDispatch && !guestId) {
      return jsonResponse(request, { error: "Unauthorized." }, 401);
    }

    const events = await loadPendingEvents(guestId, MAX_EVENTS_PER_RUN);
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
      failed,
      ok: true,
      processed,
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
