import React, { useContext, useEffect, useState } from "react";
import "./App.css";
import { Context } from "./main";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Home from "./components/Home/Home";
import Jobs from "./components/Job/Jobs";
import JobDetails from "./components/Job/JobDetails";
import Application from "./components/Application/Application";
import MyApplications from "./components/Application/MyApplications";
import PostJob from "./components/Job/PostJob";
import NotFound from "./components/NotFound/NotFound";
import MyJobs from "./components/Job/MyJobs";
import ResumeUploader from "./components/Resume/ResumeUploader";
import EditProfile from "./components/user/EditProfile";
import SavedJobs from "./components/Job/SavedJobs";

const App = () => {
  const { isAuthorized, setIsAuthorized, user, setUser } = useContext(Context);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/v1/user/getuser", {
          withCredentials: true,
        });
        setUser(response.data.user);
        setIsAuthorized(true);
      } catch (error) {
        setIsAuthorized(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              isAuthorized ? (
                // Redirect logged in user based on role
                user?.role === "Employer" ? (
                  <Navigate to="/job/me" replace />
                ) : (
                  <Navigate to="/resume-match" replace />
                )
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={isAuthorized ? <Navigate to="/" replace /> : <Register />}
          />

          {/* Protected routes */}
          <Route path="/" element={<Home />} />
          <Route path="/job/getall" element={<Jobs />} />
          <Route path="/job/:id" element={<JobDetails />} />
          <Route path="/application/:id" element={<Application />} />
          <Route path="/applications/me" element={<MyApplications />} />
          <Route path="/job/post" element={<PostJob />} />

          {/* Employer Dashboard */}
          <Route
            path="/job/me"
            element={
              isAuthorized && user?.role === "Employer" ? (
                <MyJobs />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Other user routes */}
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/saved-jobs" element={<SavedJobs />} />
          <Route path="/resume-match" element={<ResumeUploader />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <Toaster />
      </BrowserRouter>
    </>
  );
};

export default App;
