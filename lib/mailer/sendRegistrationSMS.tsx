function normalizePhoneNumber(raw: string): string {
  let cleaned = raw.trim().replace(/\s+/g, "");
  if (/^0\d{9,}$/.test(cleaned)) {
    cleaned = "+880" + cleaned.slice(1);
  }
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }
  return cleaned;
}

export async function sendRegistrationSMS(number: string, message: string) {
  try {
    const normalizedNumber = normalizePhoneNumber(number);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/send-sms`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: normalizedNumber, message }),
      },
    );

    const text = await res.text();
    console.log("SMS API response:", text);

    return res.ok;
  } catch (err) {
    console.error("Failed to send registration SMS:", err);
    return false;
  }
}
