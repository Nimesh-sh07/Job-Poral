import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import "./ResumeUploader.css";

const ResumeUploader = () => {
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("");
  const { isAuthorized } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.post(
          "http://localhost:4000/api/v1/resume/match-profile-resume",
          {},
          {
            withCredentials: true,
          }
        );

        if (response.data && response.data.matches) {
          setMatchedJobs(response.data.matches);
          setFilteredJobs(response.data.matches);
        } else {
          console.warn("No matches received:", response.data);
          setMatchedJobs([]);
          setFilteredJobs([]);
        }
      } catch (error) {
        console.error("❌ Error matching resume:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthorized) {
      fetchMatches();
    } else {
      setLoading(false);
    }
  }, [isAuthorized]);

  // Extract unique categories from matched jobs
  const categories = Array.from(
    new Set(matchedJobs.map(({ job }) => job?.category).filter(Boolean))
  );

  useEffect(() => {
    let filtered = matchedJobs;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(({ job }) => job?.title?.toLowerCase().includes(lower));
    }

    if (minScore > 0) {
      filtered = filtered.filter(({ score }) => score >= minScore);
    }

    if (categoryFilter) {
      filtered = filtered.filter(({ job }) => job?.category === categoryFilter);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, minScore, categoryFilter, matchedJobs]);

  return (
    <div className="resume-uploader-container">
      <h2 className="page-title">Find Jobs Matching Your Resume</h2>

      {loading ? (
        <p className="status-text">🔍 Matching your resume...</p>
      ) : matchedJobs.length === 0 ? (
        <p className="status-text">❌ No matching jobs found.</p>
      ) : (
        <>
          <div className="filters" style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Search by job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginRight: "1rem", padding: "0.5rem" }}
            />

            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              style={{ marginRight: "1rem", padding: "0.5rem" }}
            >
              <option value={0}>Min Match Score: Any</option>
              <option value={50}>50%</option>
              <option value={60}>60%</option>
              <option value={70}>70%</option>
              <option value={80}>80%</option>
              <option value={90}>90%</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: "0.5rem" }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {filteredJobs.length === 0 ? (
            <p className="status-text">❌ No jobs match the filters.</p>
          ) : (
            <div className="matches">
              {filteredJobs.map(({ job, score }) => (
                <div
                  key={job._id}
                  className="job-card"
                  onClick={() => navigate(`/job/${job._id}`)}
                  title={`Category: ${job.category || "N/A"}`}
                  style={{ cursor: "pointer" }}
                >
                  <h4>{job.title}</h4>
                  <p>{job.description}</p>
                  <small>🎯 Match Score: {score}%</small>
                  <br />
                  <small>📂 Category: {job.category || "N/A"}</small>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResumeUploader;
