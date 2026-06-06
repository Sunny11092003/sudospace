import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
const [domain, setDomain] = useState("");
const [loading, setLoading] = useState(false);
const [result, setResult] = useState(null);
const [error, setError] = useState("");

const runPipeline = async () => {
if (!domain.trim()) {
alert("Please enter a domain");
return;
}

try {
  setLoading(true);
  setError("");
  setResult(null);

  const res = await axios.post(
    "https://sudospace-blue.vercel.app/api/pipeline",
    {
      domain,
    }
  );

  setResult(res.data);
} catch (err) {
  console.error(err);
  setError(
    err.response?.data?.message ||
      "Failed to run pipeline."
  );
} finally {
  setLoading(false);
}

};

return ( 
<div className="app"> <div className="hero"> <h1>Subspace Lead Generator</h1>

    <div className="search-box">
      <input
        type="text"
        placeholder="Enter company domain (e.g. openai.com)"
        value={domain}
        onChange={(e) =>
          setDomain(e.target.value)
        }
      />

      <button
        onClick={runPipeline}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="loader"></span>
            Processing...
          </>
        ) : (
          "Run Pipeline"
        )}
      </button>
    </div>

    {error && (
      <div className="error">
        {error}
      </div>
    )}
  </div>

  {result && (
    <>
      <div className="summary">
        <div className="card">
          <h2>
            {result.totalCompanies ||
              0}
          </h2>
          <p>Companies Found</p>
        </div>

        <div className="card">
          <h2>
            {result.totalContacts ||
              0}
          </h2>
          <p>Contacts Found</p>
        </div>

        <div className="card">
          <h2>
            {result.verifiedEmails ||
              0}
          </h2>
          <p>Verified Emails</p>
        </div>

        <div className="card">
          <h2>
            {result.contacts
              ?.length || 0}
          </h2>
          <p>Displayed Results</p>
        </div>
      </div>

      <div className="results-header">
        <h2>
          🎯 Decision Makers
        </h2>

        <p>
          People discovered from
          similar companies
        </p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Title</th>
              <th>Company</th>
              <th>Email</th>
              <th>Status</th>
              <th>LinkedIn</th>
            </tr>
          </thead>

          <tbody>
            {result.contacts &&
            result.contacts.length >
              0 ? (
              result.contacts.map(
                (
                  contact,
                  index
                ) => {
                  const person =
                    contact.person ||
                    {};

                  const company =
                    contact.company ||
                    {};

                  return (
                    <tr
                      key={index}
                    >
                      <td>
                        <div className="avatar">
                          {(
                            person.full_name ||
                            "?"
                          )
                            .charAt(
                              0
                            )
                            .toUpperCase()}
                        </div>
                      </td>

                      <td>
                        {person.full_name ||
                          "Not Found"}
                      </td>

                      <td>
                        {person.current_job_title ||
                          "Not Found"}
                      </td>

                      <td>
                        <div className="company-cell">
                          {company.logo_url ? (
                            <img
                              src={
                                company.logo_url
                              }
                              alt=""
                              className="company-logo"
                            />
                          ) : (
                            <div className="company-placeholder">
                              🏢
                            </div>
                          )}

                          <span>
                            {company.name ||
                              "Not Found"}
                          </span>
                        </div>
                      </td>

                      <td>
                        {contact.email ||
                          "Not Found"}
                      </td>

                      <td>
                        <span
                          className={
                            contact.email
                              ? "verified"
                              : "not-found"
                          }
                        >
                          {contact.emailStatus ||
                            "Not Found"}
                        </span>
                      </td>

                      <td>
                        {person.linkedin_url ? (
                          <a
                            href={
                              person.linkedin_url
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="linkedin-btn"
                          >
                            View
                          </a>
                        ) : (
                          <span className="not-found">
                            Not Found
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign:
                      "center",
                    padding:
                      "40px",
                  }}
                >
                  No contacts
                  found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="footer-actions">
        <button className="send-btn">
          📧 Send Emails
        </button>
      </div>
    </>
  )}
</div>

);
}

export default App;
