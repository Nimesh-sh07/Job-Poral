import React, { useContext, useState } from "react";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLock2Fill } from "react-icons/ri";
import { FaPencilAlt } from "react-icons/fa";
import { FaPhoneFlip } from "react-icons/fa6";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";
import "./AuthForm.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const { isAuthorized, setIsAuthorized, setUser } = useContext(Context);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("password", password);
      formData.append("role", role);
      if (role === "Job Seeker" && resumeFile) {
        formData.append("resume", resumeFile);
      }

      const { data } = await axios.post(
        "http://localhost:4000/api/v1/user/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      toast.success(data.message);
      setUser(data.user);          // ✅ Set user data after registration
      setIsAuthorized(true);       // ✅ Mark as logged in
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  if (isAuthorized) {
    return <Navigate to="/" />;
  }

  return (
    <section className="authPage">
      <div className="container">
        <div className="header">
          <img src="/careerconnect-black.png" alt="logo" />
          <h3>Create a new account</h3>
        </div>
        <form onSubmit={handleRegister}>
          <div className="inputTag">
            <label>Register As</label>
            <div>
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="">Select Role</option>
                <option value="Employer">Employer</option>
                <option value="Job Seeker">Job Seeker</option>
              </select>
              <FaRegUser />
            </div>
          </div>

          <div className="inputTag">
            <label>Name</label>
            <div>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <FaPencilAlt />
            </div>
          </div>

          <div className="inputTag">
            <label>Email Address</label>
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <MdOutlineMailOutline />
            </div>
          </div>

          <div className="inputTag">
            <label>Phone Number</label>
            <div>
              <input
                type="number"
                placeholder="Enter your phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <FaPhoneFlip />
            </div>
          </div>

          <div className="inputTag">
            <label>Password</label>
            <div>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <RiLock2Fill />
            </div>
          </div>

          {role === "Job Seeker" && (
            <div className="inputTag">
              <label>Upload Resume (PDF, PNG, JPG, WEBP)</label>
              <div>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
              </div>
            </div>
          )}

          <button type="submit">Register</button>
          <Link to="/login">Login Now</Link>
        </form>
      </div>

      <div className="banner">
        <img src="/register.png" alt="register" />
      </div>
    </section>
  );
};

export default Register;
