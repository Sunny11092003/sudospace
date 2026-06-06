import axios from "axios";

const BREVO_URL =
  "https://api.brevo.com/v3/smtp/email";

export async function sendEmail({
  email,
  firstName,
  companyName
}) {
  if (!email) {
    throw new Error(
      "Recipient email is required"
    );
  }

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

          subject: `Quick idea for ${companyName}`,

          htmlContent: `
            <p>Hi ${firstName || "there"},</p>

            <p>
              I came across <strong>${companyName}</strong>
              and thought there might be an opportunity
              to improve outbound prospecting and lead generation.
            </p>

            <p>
              Would you be open to a short conversation
              sometime this week?
            </p>

            <p>
              Best Regards,<br/>
              ${process.env.SENDER_NAME}
            </p>
          `
        },
        {
          headers: {
            accept: "application/json",
            "content-type":
              "application/json",
            "api-key":
              process.env.BREVO_API_KEY
          }
        }
      );

    console.log(
      `Email sent to ${email}`
    );

    return response.data;

  } catch (error) {
    console.error(
      "Brevo Error:",
      error.response?.data ||
      error.message
    );

    throw new Error(
      error.response?.data?.message ||
      "Failed to send email"
    );
  }
}