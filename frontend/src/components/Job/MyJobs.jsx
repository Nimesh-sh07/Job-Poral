import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { Context } from "../../main";
import { useNavigate } from "react-router-dom";
import "./MyJobs.css";

const MyJobs = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [editingMode, setEditingMode] = useState(null);
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  // 🔒 Route protection inside useEffect
  useEffect(() => {
    if (!isAuthorized || (user && user.role !== "Employer")) {
      navigateTo("/");
    }
  }, [isAuthorized, user, navigateTo]);

  // 📥 Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/job/getmyjobs",
          { withCredentials: true }
        );
        setMyJobs(Array.isArray(data.jobs) ? data.jobs : []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch jobs");
        setMyJobs([]);
      }
    };
    fetchJobs();
  }, []);

  const handleEnableEdit = (jobId) => {
    setEditingMode(jobId);
  };

  const handleDisableEdit = () => {
    setEditingMode(null);
  };

  const handleUpdateJob = async (jobId) => {
    const updatedJob = myJobs.find((job) => job._id === jobId);
    try {
      const { data } = await axios.put(
        `http://localhost:4000/api/v1/job/update/${jobId}`,
        updatedJob,
        { withCredentials: true }
      );
      toast.success(data.message);
      setEditingMode(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update job");
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:4000/api/v1/job/delete/${jobId}`,
        { withCredentials: true }
      );
      toast.success(data.message);
      setMyJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete job");
    }
  };

  const handleInputChange = (jobId, field, value) => {
    setMyJobs((prevJobs) =>
      prevJobs.map((job) =>
        job._id === jobId ? { ...job, [field]: value } : job
      )
    );
  };

  return (
    <div className="myJobs page">
      <div className="container">
        <h1>Your Posted Jobs</h1>
        {myJobs.length > 0 ? (
          <div className="banner">
            {myJobs.map((element) => (
              <div className="card" key={element._id}>
                <div className="content">
                  <div className="short_fields">
                    <div>
                      <span>Title:</span>
                      <input
                        type="text"
                        disabled={editingMode !== element._id}
                        value={element.title}
                        onChange={(e) =>
                          handleInputChange(element._id, "title", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <span>Country:</span>
                      <input
                        type="text"
                        disabled={editingMode !== element._id}
                        value={element.country}
                        onChange={(e) =>
                          handleInputChange(element._id, "country", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <span>City:</span>
                      <input
                        type="text"
                        disabled={editingMode !== element._id}
                        value={element.city}
                        onChange={(e) =>
                          handleInputChange(element._id, "city", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <span>Category:</span>
                      <select
                        disabled={editingMode !== element._id}
                        value={element.category}
                        onChange={(e) =>
                          handleInputChange(element._id, "category", e.target.value)
                        }
                      >
                        <option value="Graphics & Design">Graphics & Design</option>
                        <option value="Mobile App Development">Mobile App Development</option>
                        <option value="Frontend Web Development">Frontend Web Development</option>
                        <option value="MERN Stack Development">MERN STACK Development</option>
                        <option value="Account & Finance">Account & Finance</option>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Video Animation">Video Animation</option>
                        <option value="MEAN Stack Development">MEAN STACK Development</option>
                        <option value="MEVN Stack Development">MEVN STACK Development</option>
                        <option value="Data Entry Operator">Data Entry Operator</option>
                      </select>
                    </div>
                    <div>
                      <span>Salary:</span>
                      {element.fixedSalary ? (
                        <input
                          type="number"
                          disabled={editingMode !== element._id}
                          value={element.fixedSalary}
                          onChange={(e) =>
                            handleInputChange(element._id, "fixedSalary", e.target.value)
                          }
                        />
                      ) : (
                        <div>
                          <input
                            type="number"
                            placeholder="From"
                            disabled={editingMode !== element._id}
                            value={element.salaryFrom}
                            onChange={(e) =>
                              handleInputChange(element._id, "salaryFrom", e.target.value)
                            }
                          />
                          <input
                            type="number"
                            placeholder="To"
                            disabled={editingMode !== element._id}
                            value={element.salaryTo}
                            onChange={(e) =>
                              handleInputChange(element._id, "salaryTo", e.target.value)
                            }
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <span>Expired:</span>
                      <select
                        disabled={editingMode !== element._id}
                        value={element.expired}
                        onChange={(e) =>
                          handleInputChange(element._id, "expired", e.target.value === "true")
                        }
                      >
                        <option value={true}>TRUE</option>
                        <option value={false}>FALSE</option>
                      </select>
                    </div>
                  </div>

                  <div className="long_field">
                    <div>
                      <span>Description:</span>
                      <textarea
                        rows={5}
                        disabled={editingMode !== element._id}
                        value={element.description}
                        onChange={(e) =>
                          handleInputChange(element._id, "description", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <span>Location:</span>
                      <textarea
                        rows={5}
                        disabled={editingMode !== element._id}
                        value={element.location}
                        onChange={(e) =>
                          handleInputChange(element._id, "location", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="button_wrapper">
                  <div className="edit_btn_wrapper">
                    {editingMode === element._id ? (
                      <>
                        <button
                          onClick={() => handleUpdateJob(element._id)}
                          className="check_btn"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={handleDisableEdit}
                          className="cross_btn"
                        >
                          <RxCross2 />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEnableEdit(element._id)}
                        className="edit_btn"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteJob(element._id)}
                    className="delete_btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't posted any jobs yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
