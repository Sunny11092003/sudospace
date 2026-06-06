import { sendEmail }
from "../services/brevoService.js";

export default async function handler(
  req,
  res
) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://sudospace-i5rf.vercel.app"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message:
          "Method not allowed"
      });
    }

    const { contacts } =
      req.body;

    const validContacts =
      contacts.filter(
        (contact) =>
          contact.email
      );

    if (
      validContacts.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No valid email addresses found"
      });
    }

    let successCount = 0;
    let failedCount = 0;

    for (const contact of validContacts) {
      try {
        await sendEmail({
          email:
            contact.email,

          firstName:
            contact.person
              ?.full_name ||
            "there",

          companyName:
            contact.company
              ?.name ||
            "your company"
        });

        successCount++;
      } catch (err) {
        console.error(err);
        failedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      sent:
        successCount,
      failed:
        failedCount
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
}