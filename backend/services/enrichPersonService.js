import axios from "axios";

const ENRICH_URL =
  "https://api.prospeo.io/enrich-person";

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

export async function enrichContacts(
  contacts
) {
  const enriched = [];

  // Free plan protection
  const limitedContacts =
    contacts.slice(0, 5);

  for (const contact of limitedContacts) {
    try {
      const personId =
        contact.person?.person_id;

      if (!personId) continue;

      const response =
        await axios.post(
          ENRICH_URL,
          {
            only_verified_email: false,
            data: {
              person_id: personId
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

      const person =
        response.data.person;

        console.log(
  JSON.stringify(response.data, null, 2)
);

      enriched.push({
        ...contact,
        personId,
        email:
          person?.email?.email ||
          null,
        emailStatus:
          person?.email?.status ||
          null
      });

      console.log(
        `Enriched: ${person?.email?.email || "No Email"}`
      );

      // Prospeo limit: 1 request/sec
      await sleep(1500);

    } catch (error) {
      const status =
        error.response?.status;

      const data =
        error.response?.data;

      console.error(
        "Enrich Error:",
        {
          status,
          data
        }
      );

      // Rate limit hit
      if (status === 429) {
        console.error(
          "Prospeo enrich rate limit reached."
        );
        break;
      }

      // No verified email
      if (
        data?.error_code ===
        "NO_MATCH"
      ) {
        await sleep(1500);
        continue;
      }

      await sleep(1500);
    }
  }

  return enriched;
}