import axios from "axios";

const OCEAN_URL =
  "https://api.ocean.io/v3/search/companies";

export async function findSimilarCompanies(
  domain
) {
  try {
    const response =
      await axios.post(
        OCEAN_URL,
        {
          companiesFilters: {
            lookalikeDomains: [
              domain
            ]
          },
          size: 20,
          fields: [
            "domain",
            "name",
            "companySize",
            "industries",
            "description"
          ]
        },
        {
          headers: {
            "x-api-token":
              process.env.OCEAN_API_KEY,
            "Content-Type":
              "application/json"
          }
        }
      );

    return (
      response.data.companies || []
    );
  } catch (error) {
    console.error(
      "Ocean Error:",
      error.response?.data ||
        error.message
    );

    throw new Error(
      "Failed to fetch similar companies"
    );
  }
}