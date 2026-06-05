import axios from "axios";

const ENRICH_URL =
  "https://api.prospeo.io/enrich-person";

export async function enrichContacts(
  contacts
) {
  const enriched = [];

  for (const contact of contacts) {
    try {
      const personId =
        contact.person?.person_id;

      if (!personId) continue;

      const response =
        await axios.post(
          ENRICH_URL,
          {
            only_verified_email: true,
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
          null
      });
    } catch (error) {
      console.error(
        "Enrich Error:",
        error.response?.data ||
          error.message
      );
    }
  }

  return enriched;
}