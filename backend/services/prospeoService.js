import axios from "axios";

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

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

      console.log(
        `Found ${
          response.data.results?.length || 0
        } contacts for ${domain}`
      );

      // Prospeo free plan: 1 request per second
      await sleep(1500);

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

      // No contacts found
      if (
        data?.error_code ===
        "NO_RESULTS"
      ) {
        await sleep(1500);
        continue;
      }

      // Rate limit exceeded
      if (status === 429) {
        console.error(
          "Prospeo rate limit reached. Returning collected contacts."
        );
        break;
      }

      // Other errors
      await sleep(1500);
      continue;
    }
  }

  return contacts;
}