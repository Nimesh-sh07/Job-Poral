import React, { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Context } from "../../main";
import toast from "react-hot-toast";
import "./JobDetails.css";


const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const navigateTo = useNavigate();

  const { isAuthorized, user } = useContext(Context);

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/login");
    }
  }, [isAuthorized, navigateTo]);

  useEffect(() => {
    axios
      .get(`http://localhost:4000/api/v1/job/${id}`, {
        withCredentials: true,
      })
      .then((res) => {
        setJob(res.data.job);
      })
      .catch(() => {
        navigateTo("/notfound");
      });
  }, [id, navigateTo]);

  const refreshSavedStatus = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v1/user/getuser", {
        withCredentials: true,
      });
      const updatedUser = res.data.user;
      if (updatedUser.savedJobs?.includes(id)) {
        setIsSaved(true);
      } else {
        setIsSaved(false);
      }
    } catch (err) {
      console.error("Failed to refresh saved status", err);
    }
  };

  useEffect(() => {
    refreshSavedStatus();
  }, [user, id]);

  const handleSaveJob = async () => {
    try {
      const res = await axios.post(
        `http://localhost:4000/api/v1/job/save/${id}`,
        {},
        { withCredentials: true }
      );
      toast.success(res.data.message);
      refreshSavedStatus();
    } catch (error) {
      toast.error("Failed to save job.");
    }
  };

  const handleUnsaveJob = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:4000/api/v1/job/unsave/${id}`,
        { withCredentials: true }
      );
      toast.success(res.data.message);
      refreshSavedStatus();
    } catch (error) {
      toast.error("Failed to unsave job.");
    }
  };

  if (!job.title) return <p>Loading job details...</p>;

  return (
    <section className="jobDetail page">
      <div className="container">
        <h3>Job Details</h3>
        <div className="banner">
          <p>
            Title: <span>{job.title}</span>
          </p>
          <p>
            Category: <span>{job.category}</span>
          </p>
          <p>
            Country: <span>{job.country}</span>
          </p>
          <p>
            City: <span>{job.city}</span>
          </p>
          <p>
            Location: <span>{job.location}</span>
          </p>
          <p>
            Description: <span>{job.description}</span>
          </p>
          <p>
            Job Posted On:{" "}
            <span>
              {job.jobPostedOn && new Date(job.jobPostedOn).toDateString()}
            </span>
          </p>
          <p>
            Salary:{" "}
            <span>
              {job.fixedSalary
                ? job.fixedSalary
                : `${job.salaryFrom} - ${job.salaryTo}`}
            </span>
          </p>

          {/* ✅ Employer Info */}
          {job.postedBy && (
            <div className="employer-info" style={{ marginTop: "1rem" }}>
              <p>
                Posted By: <strong>{job.postedBy.name}</strong>
              </p>
              {job.postedBy.avatar?.url && (
                <img
                  src={job.postedBy.avatar.url}
                  alt="Employer Avatar"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    marginTop: "0.5rem",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          )}

          {user?.role === "Job Seeker" && (
              <div className="action-buttons">
                <Link to={`/application/${job._id}`} className="apply-btn">
                   Apply Now
                </Link>
                <button
                  onClick={isSaved ? handleUnsaveJob : handleSaveJob}
                  className={`save-btn ${isSaved ? "unsave" : "save"}`}
                >
                 {isSaved ? "★ Unsave" : "☆ Save Job"}
             </button>
          </div>
)}

        </div>
      </div>
    </section>
  );
};

export default JobDetails;
