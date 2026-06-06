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

  for (const contact of contacts) {
    try {
      const personId =
        contact.person?.person_id;

      if (!personId) {
        enriched.push({
          ...contact,
          email: null,
          emailStatus: "NOT_FOUND"
        });
        continue;
      }

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

      enriched.push({
        ...contact,
        personId,
        email:
          person?.email?.email ||
          null,
        emailStatus:
          person?.email?.status ||
          "NOT_FOUND"
      });

      console.log(
        `Enriched ${
          person?.full_name ||
          personId
        }`
      );

      // Prospeo Free Plan
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

      // Keep contact even if enrichment fails
      enriched.push({
        ...contact,
        email: null,
        emailStatus:
          data?.error_code ||
          "NOT_FOUND"
      });

      // Rate limit reached
      if (status === 429) {
        console.error(
          "Prospeo rate limit reached"
        );
      }

      await sleep(1500);
    }
  }

  return enriched;
}