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

      if (
        error.response?.status === 429
      ) {
        throw new Error(
          "Prospeo daily quota exceeded"
        );
      }

      console.error(
        "Prospeo Error:",
        error.response?.data ||
        error.message
      );
    }
  }

  return contacts;
}