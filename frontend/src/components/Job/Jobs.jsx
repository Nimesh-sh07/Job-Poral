import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import "./Jobs.css";

const Jobs = () => {
  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  // Jobs & saved
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);

  // Filters & pagination
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Debounce timer
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Parse sort dropdown value into backend params
  const getSortParams = (sortValue) => {
    switch (sortValue) {
      case "salary_asc":
        return { sortBy: "fixedSalary", sortOrder: "asc" };
      case "salary_desc":
        return { sortBy: "fixedSalary", sortOrder: "desc" };
      case "date_new":
        return { sortBy: "jobPostedOn", sortOrder: "desc" };
      case "date_old":
        return { sortBy: "jobPostedOn", sortOrder: "asc" };
      default:
        return { sortBy: "jobPostedOn", sortOrder: "desc" };
    }
  };

  // Fetch jobs from backend with filters
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { sortBy, sortOrder } = getSortParams(sort);
      const res = await axios.get("http://localhost:4000/api/v1/job/getall", {
        withCredentials: true,
        params: {
          keyword,
          category,
          location,
          jobType,
          minSalary: minSalary || undefined,
          maxSalary: maxSalary || undefined,
          sortBy,
          sortOrder,
          page,
          limit: 10,
        },
      });
      setJobs(res.data.jobs);
      setPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
    setLoading(false);
  };

  // Fetch saved jobs once
  const fetchSavedJobs = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v1/job/saved", {
        withCredentials: true,
      });
      const savedIds = res.data.savedJobs.map((job) => job._id);
      setSavedJobIds(savedIds);
    } catch (err) {
      console.error("Failed to load saved jobs", err);
    }
  };

  // Auth redirect
  useEffect(() => {
    if (!isAuthorized) navigateTo("/");
  }, [isAuthorized, navigateTo]);

  // Fetch saved jobs on mount
  useEffect(() => {
    fetchSavedJobs();
  }, []);

  // Fetch jobs with debounce on filter changes (except page)
  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      setPage(1); // reset page on filters change
      fetchJobs();
    }, 400);

    setDebounceTimer(timer);

    return () => clearTimeout(timer);
  }, [keyword, category, location, jobType, minSalary, maxSalary, sort]);

  // Fetch jobs immediately on page change
  useEffect(() => {
    fetchJobs();
  }, [page]);

  // Save / unsave job handlers
  const handleSaveJob = async (jobId) => {
    try {
      await axios.post(`http://localhost:4000/api/v1/job/save/${jobId}`, {}, { withCredentials: true });
      setSavedJobIds((prev) => [...prev, jobId]);
    } catch (err) {
      console.error("Error saving job:", err);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      await axios.delete(`http://localhost:4000/api/v1/job/unsave/${jobId}`, { withCredentials: true });
      setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
    } catch (err) {
      console.error("Error unsaving job:", err);
    }
  };

  const isSaved = (jobId) => savedJobIds.includes(jobId);

  // Clear all filters
  const clearFilters = () => {
    setKeyword("");
    setCategory("");
    setLocation("");
    setJobType("");
    setMinSalary("");
    setMaxSalary("");
    setSort("");
    setPage(1);
  };

  return (
    <section className="jobs page">
      <div className="container">
        <h1>All Available Jobs</h1>

        {/* Filters */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search title, description or category..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="IT">IT</option>
            <option value="Finance">Finance</option>
            <option value="Design">Design</option>
            {/* Add more categories if needed */}
          </select>

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
            <option value="">All Job Types</option>
            <option value="fixed">Fixed Salary</option>
            <option value="ranged">Ranged Salary</option>
          </select>

          <input
            type="number"
            min="0"
            placeholder="Min Salary"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
          />

          <input
            type="number"
            min="0"
            placeholder="Max Salary"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
          />

          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">Sort By</option>
            <option value="salary_asc">Salary ↑</option>
            <option value="salary_desc">Salary ↓</option>
            <option value="date_new">Newest</option>
            <option value="date_old">Oldest</option>
          </select>

          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && <p style={{ textAlign: "center" }}>Loading jobs...</p>}

        {/* Job Cards */}
        <div className="banner">
          {!loading && jobs.length === 0 && <p>No jobs found.</p>}
          {jobs.map((job) => (
            <div className="card" key={job._id}>
              <div className="job-header">
                <p>{job.title}</p>
                {isSaved(job._id) ? (
                  <FaBookmark title="Unsave Job" className="bookmark-icon saved" onClick={() => handleUnsaveJob(job._id)} />
                ) : (
                  <FaRegBookmark title="Save Job" className="bookmark-icon" onClick={() => handleSaveJob(job._id)} />
                )}
              </div>
              <p>{job.category}</p>
              <p>{job.country}</p>
              <p>
                {job.city}, {job.location}
              </p>
              <p>
                {job.fixedSalary
                  ? `₹${job.fixedSalary}`
                  : `₹${job.salaryFrom} - ₹${job.salaryTo}`}
              </p>
              <Link to={`/job/${job._id}`}>Job Details</Link>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              className={page === i + 1 ? "active" : ""}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Jobs;
