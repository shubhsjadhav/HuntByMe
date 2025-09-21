import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  getApprovedJobs, 
  getUserApplications, 
  createApplication, 
  checkExistingApplication 
} from '../lib/supabase'

const Dashboard = () => {
  const { user, profile } = useAuth()
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState({})

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    const [jobsResult, applicationsResult] = await Promise.all([
      getApprovedJobs(),
      getUserApplications(user.id)
    ])

    if (!jobsResult.error && jobsResult.data) {
      setJobs(jobsResult.data)
    }

    if (!applicationsResult.error && applicationsResult.data) {
      setApplications(applicationsResult.data)
    }

    setLoading(false)
  }

  const handleApply = async (jobId) => {
    setApplying(prev => ({ ...prev, [jobId]: true }))

    // Check if already applied
    const { data: existingApp } = await checkExistingApplication(jobId, user.id)
    if (existingApp) {
      alert('You have already applied for this job!')
      setApplying(prev => ({ ...prev, [jobId]: false }))
      return
    }

    const { error } = await createApplication(jobId, user.id)
    
    if (error) {
      alert('Error applying for job: ' + error.message)
    } else {
      alert('Application submitted successfully!')
      fetchData() // Refresh data
    }

    setApplying(prev => ({ ...prev, [jobId]: false }))
  }

  const getApplicationStatus = (jobId) => {
    const application = applications.find(app => app.job_id === jobId)
    return application?.status || null
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#22c55e'
      case 'rejected': return '#ef4444'
      case 'pending': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Job Seeker Dashboard</h1>
        <p>Welcome back, {profile?.email}!</p>
      </div>

      {/* My Applications Section */}
      <section className="dashboard-section">
        <h2>My Applications ({applications.length})</h2>
        {applications.length === 0 ? (
          <p>You haven't applied to any jobs yet.</p>
        ) : (
          <div className="applications-list">
            {applications.map((application) => (
              <div key={application.id} className="application-card">
                <div className="application-header">
                  <h3>{application.jobs.title}</h3>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(application.status) }}
                  >
                    {application.status.toUpperCase()}
                  </span>
                </div>
                <p>📍 {application.jobs.location}</p>
                <p>💰 {application.jobs.salary}</p>
                <p className="application-date">
                  Applied: {new Date(application.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Available Jobs Section */}
      <section className="dashboard-section">
        <h2>Available Jobs ({jobs.length})</h2>
        {jobs.length === 0 ? (
          <p>No jobs available at the moment.</p>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => {
              const applicationStatus = getApplicationStatus(job.id)
              const isApplying = applying[job.id]
              
              return (
                <div key={job.id} className="job-card">
                  <h3>{job.title}</h3>
                  <p className="job-location">📍 {job.location}</p>
                  <p className="job-salary">💰 {job.salary}</p>
                  <p className="job-description">{job.description}</p>
                  
                  <div className="job-actions">
                    {applicationStatus ? (
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(applicationStatus) }}
                      >
                        {applicationStatus.toUpperCase()}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={isApplying}
                        className="apply-button"
                      >
                        {isApplying ? 'Applying...' : 'Apply Now'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard