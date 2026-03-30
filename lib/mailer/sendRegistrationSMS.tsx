export async function sendRegistrationSMS(number: string, message: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-sms`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number, message }),
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
