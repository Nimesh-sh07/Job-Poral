import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Context } from "../../main";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./SavedJobs.css";

const SavedJobs = () => {
  const { isAuthorized } = useContext(Context);
  const [savedJobs, setSavedJobs] = useState([]);
  const navigateTo = useNavigate();

  const fetchSavedJobs = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v1/job/saved", {
        withCredentials: true,
      });
      setSavedJobs(res.data.savedJobs);
    } catch (error) {
      console.error("❌ Error fetching saved jobs:", error.response?.data || error.message);
      toast.error("Failed to load saved jobs");
    }
  };

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/");
      return;
    }
    fetchSavedJobs();
  }, [isAuthorized, navigateTo]);

  const handleUnsave = async (jobId) => {
    try {
      const res = await axios.delete(`http://localhost:4000/api/v1/job/unsave/${jobId}`, {
        withCredentials: true,
      });
      toast.success(res.data.message);
      setSavedJobs(savedJobs.filter((job) => job._id !== jobId));
    } catch (error) {
      toast.error("Failed to remove job");
    }
  };

  return (
    <section className="saved-jobs page">
      <div className="container">
        <h2>🔖 Saved Jobs</h2>
        {savedJobs.length === 0 ? (
          <p>No jobs saved yet.</p>
        ) : (
          <div className="banner">
            {savedJobs.map((job) => (
              <div className="card" key={job._id}>
                <h3>{job.title}</h3>
                <p>{job.category}</p>
                <p>{job.city}, {job.country}</p>
                <p>
                  {job.fixedSalary
                    ? `₹${job.fixedSalary}`
                    : `₹${job.salaryFrom} - ₹${job.salaryTo}`}
                </p>
                <Link to={`/job/${job._id}`}>View Details</Link>
                <button onClick={() => handleUnsave(job._id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SavedJobs;
