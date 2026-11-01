/**
 * BulksmsBD (bulksmsbd.net) HTTP API helper.
 *
 * The provider expects the recipient as a plain country-coded number
 * (`8801XXXXXXXXX`) and rejects a leading `+` with "Invalid Number", so numbers
 * are always normalised before sending.
 *
 * Responses are usually JSON (`response_code: 202` means "submitted
 * successfully") but some endpoints reply with the bare code, so both are
 * handled.
 */

const BULK_SMS_BD_ENDPOINT = "http://bulksmsbd.net/api/smsapi";
const DEFAULT_SENDER_ID = "Octal TTI";

/** Approved BulksmsBD response codes and their meaning. */
const RESPONSE_CODES: Record<number, string> = {
  1001: "Invalid mobile number",
  1002: "Invalid sender ID",
  1003: "Invalid API key",
  1004: "Invalid message type",
  1005: "Insufficient SMS balance",
  1006: "Sender ID is not approved for this account",
  1007: "Not a valid BulksmsBD user",
  1032: "API key not found for this account",
};

/** `880` + `1` + operator digit (3-9) + 8 digits. */
export const BULK_SMS_BD_NUMBER_PATTERN = /^8801[3-9]\d{8}$/;

/**
 * Normalises any Bangladeshi mobile input (017…, +88017…, 88017…, 17…) into the
 * `8801XXXXXXXXX` form BulksmsBD requires. Unknown shapes are returned as bare
 * digits so the caller can report them as invalid instead of sending garbage.
 */
export function toBulkSmsBdNumber(raw: string): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("880")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `88${digits}`;
  if (digits.length === 10 && digits.startsWith("1")) return `880${digits}`;
  return digits;
}

export type BulkSmsDispatchResult = {
  ok: boolean;
  error?: string;
  providerResponse?: string;
};

function parseResponse(raw: string): BulkSmsDispatchResult {
  const trimmed = raw.trim();
  let code: number | undefined;
  let providerMessage = "";

  try {
    const parsed = JSON.parse(trimmed) as {
      response_code?: number | string;
      success_message?: string;
      error_message?: string;
    };
    code = Number(parsed?.response_code);
    providerMessage = String(
      parsed?.error_message || parsed?.success_message || "",
    ).trim();
  } catch {
    const match = trimmed.match(/response_code["']?\s*[:=]\s*["']?(\d+)/);
    if (match) code = Number(match[1]);
    else if (/^\d+$/.test(trimmed)) code = Number(trimmed);
    providerMessage = trimmed;
  }

  if (code === 202) {
    return { ok: true, providerResponse: trimmed };
  }

  const known = code !== undefined ? RESPONSE_CODES[code] : undefined;
  return {
    ok: false,
    error:
      known ||
      providerMessage ||
      `Unrecognised SMS provider response: ${trimmed.slice(0, 200) || "(empty)"}`,
    providerResponse: trimmed,
  };
}

export async function sendBulkSmsBd({
  number,
  message,
  apiKey = process.env.SMS_API_KEY,
  senderId = DEFAULT_SENDER_ID,
}: {
  number: string;
  message: string;
  apiKey?: string;
  senderId?: string;
}): Promise<BulkSmsDispatchResult> {
  if (!apiKey) {
    return { ok: false, error: "SMS_API_KEY is not configured" };
  }

  const recipient = toBulkSmsBdNumber(number);
  if (!BULK_SMS_BD_NUMBER_PATTERN.test(recipient)) {
    return { ok: false, error: `Invalid mobile number "${number}"` };
  }

  try {
    const url =
      `${BULK_SMS_BD_ENDPOINT}?api_key=${encodeURIComponent(apiKey)}` +
      `&type=text&number=${recipient}` +
      `&senderid=${encodeURIComponent(senderId)}` +
      `&message=${encodeURIComponent(message)}`;

    // `no-store` is essential: a cached response would report success (or a
    // stale error) without ever reaching the provider.
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    const raw = await res.text();

    if (!raw.trim() && !res.ok) {
      return {
        ok: false,
        error: `SMS provider returned HTTP ${res.status}`,
        providerResponse: raw,
      };
    }

    return parseResponse(raw);
  } catch (err: any) {
    return {
      ok: false,
      error:
        err?.message || "Network error while contacting the SMS provider",
    };
  }
}
