import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import "./PostJob.css";

const PostJob = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [fixedSalary, setFixedSalary] = useState("");
  const [salaryType, setSalaryType] = useState("default");
  const [skillsRequired, setSkillsRequired] = useState(""); // 🔥 NEW

  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthorized || (user && user.role !== "Employer")) {
      navigateTo("/");
    }
  }, [isAuthorized, user, navigateTo]);

  const handleJobPost = async (e) => {
    e.preventDefault();

    // Convert comma-separated string to trimmed array
    const skillArray = skillsRequired
      .split(",")
      .map((skill) => skill.trim().toLowerCase())
      .filter((skill) => skill.length > 0);

    const jobData =
      fixedSalary.length >= 4
        ? {
            title,
            description,
            category,
            country,
            city,
            location,
            fixedSalary,
            skillsRequired: skillArray,
          }
        : {
            title,
            description,
            category,
            country,
            city,
            location,
            salaryFrom,
            salaryTo,
            skillsRequired: skillArray,
          };

    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/job/post",
        jobData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(res.data.message);

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setCountry("");
      setCity("");
      setLocation("");
      setSalaryFrom("");
      setSalaryTo("");
      setFixedSalary("");
      setSalaryType("default");
      setSkillsRequired("");

      navigateTo("/job/me");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="job_post page">
      <div className="container">
        <h3>POST NEW JOB</h3>
        <form onSubmit={handleJobPost}>
          <div className="wrapper">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Job Title"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              <option value="Graphics & Design">Graphics & Design</option>
  <option value="Mobile App Development">Mobile App Development</option>
  <option value="Frontend Web Development">Frontend Web Development</option>
  <option value="Business Development Executive">Business Development Executive</option>
  <option value="Account & Finance">Account & Finance</option>
  <option value="Artificial Intelligence">Artificial Intelligence</option>
  <option value="Video Animation">Video Animation</option>
  <option value="MEAN Stack Development">MEAN STACK Development</option>
  <option value="MERN Stack Development">MERN STACK Development</option>
  <option value="Data Entry Operator">Data Entry Operator</option>

  <option value="Accounting & Finance">Accounting & Finance</option>
  <option value="Admin & Office">Admin & Office</option>
  <option value="Customer Service">Customer Service</option>
  <option value="Data Science & Analytics">Data Science & Analytics</option>
  <option value="Design & Creative">Design & Creative</option>
  <option value="Education & Training">Education & Training</option>
  <option value="Engineering">Engineering</option>
  <option value="Human Resources">Human Resources</option>
  <option value="Information Technology">Information Technology</option>
  <option value="Legal">Legal</option>
  <option value="Marketing & Communications">Marketing & Communications</option>
  <option value="Media & Entertainment">Media & Entertainment</option>
  <option value="Medical & Healthcare">Medical & Healthcare</option>
  <option value="Project Management">Project Management</option>
  <option value="Sales & Business Development">Sales & Business Development</option>
  <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
  <option value="Writing & Translation">Writing & Translation</option>
  <option value="Others">Others</option>
            </select>
          </div>

          <div className="wrapper">
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
            />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
            />
          </div>

          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
          />

          <div className="salary_wrapper">
            <select
              value={salaryType}
              onChange={(e) => setSalaryType(e.target.value)}
            >
              <option value="default">Select Salary Type</option>
              <option value="Fixed Salary">Fixed Salary</option>
              <option value="Ranged Salary">Ranged Salary</option>
            </select>

            <div>
              {salaryType === "default" ? (
                <p>Please provide Salary Type *</p>
              ) : salaryType === "Fixed Salary" ? (
                <input
                  type="number"
                  placeholder="Enter Fixed Salary"
                  value={fixedSalary}
                  onChange={(e) => setFixedSalary(e.target.value)}
                />
              ) : (
                <div className="ranged_salary">
                  <input
                    type="number"
                    placeholder="Salary From"
                    value={salaryFrom}
                    onChange={(e) => setSalaryFrom(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Salary To"
                    value={salaryTo}
                    onChange={(e) => setSalaryTo(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 🔥 NEW FIELD for skills */}
          <input
            type="text"
            placeholder="Required Skills (comma separated)"
            value={skillsRequired}
            onChange={(e) => setSkillsRequired(e.target.value)}
          />

          <textarea
            rows="10"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Job Description"
          />

          <button type="submit">Create Job</button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
