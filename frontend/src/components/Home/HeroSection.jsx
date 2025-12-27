import React, { useEffect, useState } from "react";
import { FaBuilding, FaSuitcase, FaUsers, FaUserPlus } from "react-icons/fa";
import axios from "axios";
import "./HeroSection.css";

const HeroSection = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalJobSeekers: 0,
    totalEmployers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/v1/user/stats", {
          withCredentials: true,
        });
        setStats(data);
      } catch (error) {
        console.error("Failed to load platform stats");
      }
    };
    fetchStats();
  }, []);

  const details = [
    {
      id: 1,
      title: stats.totalJobs.toLocaleString(),
      subTitle: "Live Jobs",
      icon: <FaSuitcase />,
    },
    {
      id: 2,
      title: stats.totalEmployers.toLocaleString(),
      subTitle: "Employers",
      icon: <FaUserPlus />,
    },
    {
      id: 3,
      title: stats.totalJobSeekers.toLocaleString(),
      subTitle: "Job Seekers",
      icon: <FaUsers />,
    },
    {
      id: 4,
      title: stats.totalEmployers.toLocaleString(),
      subTitle: "Companies",
      icon: <FaBuilding />,
    },
  ];

  return (
    <div className="hero-section">
      <div className="hero-container">
        <div className="hero-text">
          <h1>Find a job that suits your interests and skills</h1>
          <p>
            Discover job opportunities that match your skills and passions.
            Connect with employers seeking talent like yours for rewarding careers.
          </p>
        </div>
        <div className="hero-image">
          <img src="/heroS.jpg" alt="hero" />
        </div>
      </div>

      <div className="hero-stats">
        {details.map((item) => (
          <div className="hero-card" key={item.id}>
            <div className="hero-icon">{item.icon}</div>
            <div className="hero-content">
              <p className="hero-title">{item.title}</p>
              <p className="hero-subtitle">{item.subTitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
