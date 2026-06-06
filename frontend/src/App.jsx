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
        "https://sudospace-blue.vercel.app//api/pipeline",
        {
          domain,
        }
      );

      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to run pipeline. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="hero">
        <h1>
          🚀 Subspace Lead Generator
        </h1>

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
                {
                  result.totalCompanies
                }
              </h2>
              <p>Companies Found</p>
            </div>

            <div className="card">
              <h2>
                {
                  result.totalContacts
                }
              </h2>
              <p>Contacts Found</p>
            </div>

            <div className="card">
              <h2>
                {
                  result.verifiedEmails
                }
              </h2>
              <p>Verified Emails</p>
            </div>
          </div>

          <div className="results-header">
            <h2>
              🎯 Decision Makers
            </h2>
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
                {result.contacts?.map(
                  (
                    contact,
                    index
                  ) => (
                    <tr key={index}>
                      <td>
                        <div className="avatar">
                          {contact.person?.full_name?.charAt(
                            0
                          ) || "?"}
                        </div>
                      </td>

                      <td>
                        {
                          contact.person
                            ?.full_name
                        }
                      </td>

                      <td>
                        {
                          contact.person
                            ?.current_job_title
                        }
                      </td>

                      <td>
                        <div className="company-cell">
                          {contact
                            .company
                            ?.logo_url && (
                            <img
                              src={
                                contact
                                  .company
                                  .logo_url
                              }
                              alt=""
                              className="company-logo"
                            />
                          )}

                          <span>
                            {
                              contact
                                .company
                                ?.name
                            }
                          </span>
                        </div>
                      </td>

                      <td>
                        {contact.email}
                      </td>

                      <td>
                        <span className="verified">
                          {
                            contact.emailStatus
                          }
                        </span>
                      </td>

                      <td>
                        {contact
                          .person
                          ?.linkedin_url ? (
                          <a
                            href={
                              contact
                                .person
                                .linkedin_url
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="linkedin-btn"
                          >
                            View
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  )
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