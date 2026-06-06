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

    console.log(
      `Starting pipeline for: ${domain}`
    );

    // Step 1: Find Similar Companies
    const allCompanies =
      await findSimilarCompanies(domain);

    const companies =
      allCompanies.slice(0, 5);

    console.log(
      `Companies Found: ${allCompanies.length}`
    );

    console.log(
      `Companies Processed: ${companies.length}`
    );

    // Step 2: Find Contacts
    const allContacts =
      await findContacts(companies);

    console.log(
      `Contacts Found: ${allContacts.length}`
    );

    if (!allContacts.length) {
      return res.status(200).json({
        success: true,
        totalCompanies: companies.length,
        totalContacts: 0,
        processedContacts: 0,
        verifiedEmails: 0,
        contacts: [],
        message: "No contacts found"
      });
    }

    // Limit contacts for enrichment
    const contacts =
      allContacts.slice(0, 5);

    console.log(
      `Contacts Processed For Enrichment: ${contacts.length}`
    );

    // Step 3: Enrich Contacts
    const enrichedContacts =
      await enrichContacts(contacts);

    console.log(
      `Enriched Contacts: ${enrichedContacts.length}`
    );

    // Count verified emails
    const verifiedEmails =
      enrichedContacts.filter(
        (contact) => contact.email
      ).length;

    console.log(
      `Verified Emails: ${verifiedEmails}`
    );

    return res.status(200).json({
      success: true,
      totalCompanies:
        companies.length,
      totalContacts:
        allContacts.length,
      processedContacts:
        contacts.length,
      verifiedEmails,

      // IMPORTANT:
      // Return ALL enriched contacts
      contacts: enrichedContacts
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