import React, { useState, useEffect } from 'react'
import { getApprovedJobs } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

const Home = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    const { data, error } = await getApprovedJobs()
    if (!error && data) {
      setJobs(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="loading">Loading jobs...</div>
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Available Jobs</h1>
        <p>Browse all approved job listings</p>
      </div>

      {jobs.length === 0 ? (
        <div className="no-data">
          <p>No jobs available at the moment.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <h3>{job.title}</h3>
              <p className="job-location">📍 {job.location}</p>
              <p className="job-salary">💰 {job.salary}</p>
              <p className="job-description">{job.description}</p>
              <div className="job-meta">
                <span className="job-date">
                  Posted: {new Date(job.created_at).toLocaleDateString()}
                </span>
                {user && (
                  <Link to="/dashboard" className="apply-link">
                    Apply Now →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!user && (
        <div className="cta-section">
          <h3>Want to apply for jobs?</h3>
          <p>
            <Link to="/register">Register</Link> or <Link to="/login">Login</Link> to start applying!
          </p>
        </div>
      )}
    </div>
  )
}

export default Home