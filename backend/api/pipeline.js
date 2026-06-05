import { findSimilarCompanies }
from "../services/oceanService.js";

import { findContacts }
from "../services/prospeoService.js";

import { enrichContacts }
from "../services/enrichPersonService.js";

import { sendEmail }
from "../services/brevoService.js";

export default async function handler(
  req,
  res
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method not allowed"
      });
    }

    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: "Domain is required"
      });
    }

    console.log(
      `Starting pipeline for: ${domain}`
    );

    // Step 1: Find similar companies
    const companies =
      await findSimilarCompanies(
        domain
      );

    console.log(
      `Companies Found: ${companies.length}`
    );

    // Step 2: Find contacts
    let contacts = [];

    try {
      contacts =
        await findContacts(
          companies
        );
    } catch (error) {
      return res.status(429).json({
        success: false,
        message:
          error.message ||
          "Prospeo API quota exceeded"
      });
    }

    console.log(
      `Contacts Found: ${contacts.length}`
    );

    // Step 3: Enrich contacts
    const enrichedContacts =
      await enrichContacts(
        contacts
      );

    console.log(
      `Enriched Contacts: ${enrichedContacts.length}`
    );

    // Step 4: Filter valid emails
    const validEmails =
      enrichedContacts.filter(
        (contact) =>
          contact.email
      );

    console.log(
      `Verified Emails: ${validEmails.length}`
    );

    return res.status(200).json({
      success: true,
      totalCompanies:
        companies.length,
      totalContacts:
        contacts.length,
      verifiedEmails:
        validEmails.length,
      contacts:
        validEmails
    });

  } catch (error) {
    console.error(
      "Pipeline Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error"
    });
  }
}