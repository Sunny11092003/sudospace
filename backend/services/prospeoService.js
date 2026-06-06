import axios from "axios";

export async function findContacts(companies) {
  const contacts = [];

  for (const company of companies) {
    const domain =
      company.company?.domain ||
      company.domain;

    if (!domain) continue;

    try {
      const response = await axios.post(
        "https://api.prospeo.io/search-person",
        {
          page: 1,
          filters: {
            company: {
              websites: {
                include: [domain]
              }
            }
          }
        },
        {
          headers: {
            "X-KEY":
              process.env.PROSPEO_API_KEY,
            "Content-Type":
              "application/json"
          }
        }
      );

      contacts.push(
        ...(response.data.results || [])
      );

    } catch (error) {
      const status =
        error.response?.status;

      const data =
        error.response?.data;

      console.error(
        `Prospeo Error for ${domain}:`,
        {
          status,
          data
        }
      );

      // No contacts found for this company
      if (
        data?.error_code ===
        "NO_RESULTS"
      ) {
        continue;
      }

      // Daily quota / rate limit exceeded
      if (status === 429) {
        console.error(
          "Prospeo quota exceeded. Returning collected contacts."
        );
        break;
      }

      // Continue with next company on other errors
      continue;
    }
  }

  return contacts;
}