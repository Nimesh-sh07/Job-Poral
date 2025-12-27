import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ResumeModal from "./ResumeModal";
import "./MyApplications.css";

const MyApplications = () => {
  const { user, isAuthorized } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeImageUrl, setResumeImageUrl] = useState("");
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/");
      return;
    }

    const fetchApplications = async () => {
      try {
        const endpoint =
          user?.role === "Employer"
            ? "/api/v1/application/employer/getall"
            : "/api/v1/application/jobseeker/getall";

        const res = await axios.get(`http://localhost:4000${endpoint}`, {
          withCredentials: true,
        });

        setApplications(res.data.applications);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching applications");
      }
    };

    fetchApplications();
  }, [isAuthorized, user, navigateTo]);

  const deleteApplication = async (id) => {
    try {
      const res = await axios.delete(
        `http://localhost:4000/api/v1/application/delete/${id}`,
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setApplications((prev) => prev.filter((application) => application._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting application");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:4000/api/v1/application/status/${id}`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setApplications((prev) =>
        prev.map((app) =>
          app._id === id ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const openModal = (imageUrl) => {
    setResumeImageUrl(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setResumeImageUrl("");
  };

  const isJobSeeker = user?.role === "Job Seeker";

  return (
    <section className="my_applications page">
      <div className="container">
        <h1>{isJobSeeker ? "My Applications" : "Applications From Job Seekers"}</h1>

        {applications.length === 0 ? (
          <center>
            <h4>No Applications Found</h4>
          </center>
        ) : (
          <div className="application-grid">
            {applications.map((element) =>
              isJobSeeker ? (
                <JobSeekerCard
                  key={element._id}
                  element={element}
                  openModal={openModal}
                  deleteApplication={deleteApplication}
                />
              ) : (
                <EmployerCard
                  key={element._id}
                  element={element}
                  openModal={openModal}
                  updateStatus={updateStatus}
                />
              )
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <ResumeModal imageUrl={resumeImageUrl} onClose={closeModal} />
      )}
    </section>
  );
};

export default MyApplications;

// 🔹 Card for Job Seekers
const JobSeekerCard = ({ element, openModal, deleteApplication }) => (
  <div className="job_seeker_card">
    <div className="detail">
      <p><span>Job Title:</span> {element?.jobId?.title || "N/A"}</p>
      <p><span>Name:</span> {element.name}</p>
      <p><span>Email:</span> {element.email}</p>
      <p><span>Phone:</span> {element.phone}</p>
      <p><span>Address:</span> {element.address}</p>
      <p><span>CoverLetter:</span> {element.coverLetter}</p>
      <p><span>Status:</span> {element.status}</p>
    </div>
    <div className="resume">
      <img
        src={element.resume.url}
        alt="resume"
        onClick={() => openModal(element.resume.url)}
        style={{ cursor: "pointer" }}
      />
    </div>
    <div className="btn_area">
      <button onClick={() => deleteApplication(element._id)}>
        Delete Application
      </button>
    </div>
  </div>
);

// 🔹 Card for Employers
const EmployerCard = ({ element, openModal, updateStatus }) => (
  <div className="job_seeker_card">
    <div className="detail">
      <p><span>Job Title:</span> {element?.jobId?.title || "N/A"}</p>
      <p><span>Name:</span> {element.name}</p>
      <p><span>Email:</span> {element.email}</p>
      <p><span>Phone:</span> {element.phone}</p>
      <p><span>Address:</span> {element.address}</p>
      <p><span>CoverLetter:</span> {element.coverLetter}</p>
      <p><span>Status:</span> {element.status}</p>
      <label>
        Update Status:
        <select
          value={element.status}
          onChange={(e) => updateStatus(element._id, e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </label>
    </div>
    <div className="resume">
      <img
        src={element.resume.url}
        alt="resume"
        onClick={() => openModal(element.resume.url)}
        style={{ cursor: "pointer" }}
      />
    </div>
  </div>
);
