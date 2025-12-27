import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";
import { Navigate } from "react-router-dom";
import "./EditProfile.css";

const EditProfile = () => {
  const { isAuthorized, user, setUser } = useContext(Context);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [resumeFile, setResumeFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    if (avatarFile) formData.append("avatar", avatarFile);
    if (resumeFile) formData.append("resume", resumeFile); // ✅ resume update

    try {
      setLoading(true);
      const { data } = await axios.put("http://localhost:4000/api/v1/user/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setUser(data.user); // ✅ refresh context
      toast.success(data.message || "Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) return <Navigate to="/login" />;

  return (
    <section className="edit-profile">
      <div className="container">
        <h2>📝 Edit Profile</h2>
        <form onSubmit={handleProfileUpdate}>
          <div className="input-field">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="input-field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="input-field">
            <label>Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          <div className="input-field">
            <label>Profile Picture</label>
            <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} />
          </div>

          {user?.role === "Job Seeker" && (
            <div className="input-field">
              <label>Resume (PDF, JPG, PNG, WebP)</label>
              <input type="file" accept=".pdf,image/*" onChange={(e) => setResumeFile(e.target.files[0])} />
              <p style={{ fontSize: "0.875rem", marginTop: "0.4rem" }}>
                {user?.resume?.url
                  ? "✅ Resume already uploaded"
                  : "⚠️ No resume uploaded yet"}
              </p>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default EditProfile;
