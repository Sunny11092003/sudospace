import axios from "axios";

const BREVO_URL =
  "https://api.brevo.com/v3/smtp/email";

export async function sendEmail({
  email,
  firstName,
  companyName
}) {
  try {
    const response =
      await axios.post(
        BREVO_URL,
        {
          sender: {
            name:
              process.env.SENDER_NAME,
            email:
              process.env.SENDER_EMAIL
          },
          to: [
            {
              email
            }
          ],
          subject:
            `Quick idea for ${companyName}`,
          htmlContent: `
            <p>Hi ${firstName},</p>

            <p>
              I noticed ${companyName}
              and thought there may be
              an opportunity to improve
              outbound prospecting.
            </p>

            <p>
              Would you be open to a
              short conversation?
            </p>

            <p>
              Best Regards,<br/>
              ${process.env.SENDER_NAME}
            </p>
          `
        },
        {
          headers: {
            accept:
              "application/json",
            "content-type":
              "application/json",
            "api-key":
              process.env.BREVO_API_KEY
          }
        }
      );

    return response.data;
  } catch (error) {
    console.error(
      "Brevo Error:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
}