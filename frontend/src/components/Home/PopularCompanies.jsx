import React from "react";
import { FaMicrosoft, FaApple } from "react-icons/fa";
import { SiTesla } from "react-icons/si";

const PopularCompanies = () => {
  const companies = [
    {
      id: 1,
      title: "Microsoft",
      location: "Millennium City Centre, Gurugram",
      openPositions: 10,
      icon: <FaMicrosoft />,
    },
    {
      id: 2,
      title: "Tesla",
      location: "Millennium City Centre, Gurugram",
      openPositions: 5,
      icon: <SiTesla />,
    },
    {
      id: 3,
      title: "Apple",
      location: "Millennium City Centre, Gurugram",
      openPositions: 20,
      icon: <FaApple />,
    },
  ];

  return (
    <div style={{ backgroundColor: "#0c111f", padding: "60px 0", color: "#fff" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <h3 style={{ textAlign: "center", color: "#00ffff", fontSize: "24px", marginBottom: "40px" }}>
          TOP COMPANIES
        </h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "30px",
          }}
        >
          {companies.map((company) => (
            <div
              key={company.id}
              style={{
                backgroundColor: "#1a1e2e",
                padding: "24px",
                borderRadius: "12px",
                width: "280px",
                textAlign: "center",
                boxShadow: "0 0 10px rgba(0, 255, 255, 0.1)",
                transition: "transform 0.3s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "36px", color: "#00ffff" }}>{company.icon}</div>
                <div>
                  <p style={{ fontWeight: "bold", margin: 0 }}>{company.title}</p>
                  <p style={{ fontSize: "14px", color: "#ccc", marginTop: "5px" }}>{company.location}</p>
                </div>
              </div>
              <button
                style={{
                  backgroundColor: "#00ffff",
                  border: "none",
                  color: "#000",
                  fontWeight: "bold",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Open Positions {company.openPositions}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularCompanies;
