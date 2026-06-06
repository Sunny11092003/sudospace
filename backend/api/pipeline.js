import { findSimilarCompanies } from "../services/oceanService.js";
import { findContacts } from "../services/prospeoService.js";
import { enrichContacts } from "../services/enrichPersonService.js";

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://sudospace-i5rf.vercel.app"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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

    console.log(`Starting pipeline for: ${domain}`);

    // Step 1: Find similar companies
    const allCompanies =
      await findSimilarCompanies(domain);

    // Limit to 5 companies to avoid Prospeo rate limits
    const companies =
      allCompanies.slice(0, 5);

    console.log(
      `Companies Found: ${allCompanies.length}`
    );

    console.log(
      `Companies Processed: ${companies.length}`
    );

    // Step 2: Find contacts
    const contacts =
      await findContacts(companies);

    console.log(
      `Contacts Found: ${contacts.length}`
    );

    if (!contacts.length) {
      return res.status(200).json({
        success: true,
        totalCompanies: companies.length,
        totalContacts: 0,
        verifiedEmails: 0,
        contacts: [],
        message:
          "No contacts found or Prospeo rate limit reached"
      });
    }

    // Step 3: Enrich contacts
    const enrichedContacts =
      await enrichContacts(contacts);

    console.log(
      `Enriched Contacts: ${enrichedContacts.length}`
    );

    // Step 4: Filter valid emails
    const validEmails =
      enrichedContacts.filter(
        (contact) => contact.email
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
      contacts: validEmails
    });

  } catch (error) {
    console.error(
      "Pipeline Error:",
      error.stack || error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error"
    });
  }
}