import React, { useState, useEffect } from 'react'
import { 
  getAllJobs, 
  getAllApplications, 
  createJob, 
  updateJobStatus, 
  updateApplicationStatus 
} from '../lib/supabase'

const Admin = () => {
  const [activeTab, setActiveTab] = useState('jobs')
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  
  // New job form state
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    status: 'approved'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [jobsResult, applicationsResult] = await Promise.all([
      getAllJobs(),
      getAllApplications()
    ])

    if (!jobsResult.error && jobsResult.data) {
      setJobs(jobsResult.data)
    }

    if (!applicationsResult.error && applicationsResult.data) {
      setApplications(applicationsResult.data)
    }

    setLoading(false)
  }

  const handleCreateJob = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const { error } = await createJob(newJob)
    
    if (error) {
      alert('Error creating job: ' + error.message)
    } else {
      alert('Job created successfully!')
      setNewJob({
        title: '',
        description: '',
        location: '',
        salary: '',
        status: 'approved'
      })
      fetchData()
    }

    setSubmitting(false)
  }

  const handleJobStatusUpdate = async (jobId, status) => {
    const { error } = await updateJobStatus(jobId, status)
    
    if (error) {
      alert('Error updating job status: ' + error.message)
    } else {
      fetchData()
    }
  }

  const handleApplicationStatusUpdate = async (applicationId, status) => {
    const { error } = await updateApplicationStatus(applicationId, status)
    
    if (error) {
      alert('Error updating application status: ' + error.message)
    } else {
      fetchData()
    }
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
    return <div className="loading">Loading admin panel...</div>
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Manage jobs and applications</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={activeTab === 'jobs' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('jobs')}
        >
          Jobs ({jobs.length})
        </button>
        <button 
          className={activeTab === 'applications' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('applications')}
        >
          Applications ({applications.length})
        </button>
        <button 
          className={activeTab === 'create' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('create')}
        >
          Create Job
        </button>
      </div>

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="tab-content">
          <h2>All Jobs</h2>
          {jobs.length === 0 ? (
            <p>No jobs created yet.</p>
          ) : (
            <div className="admin-jobs-list">
              {jobs.map((job) => (
                <div key={job.id} className="admin-job-card">
                  <div className="job-header">
                    <h3>{job.title}</h3>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(job.status) }}
                    >
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                  <p>📍 {job.location}</p>
                  <p>💰 {job.salary}</p>
                  <p>{job.description}</p>
                  <p className="job-date">
                    Created: {new Date(job.created_at).toLocaleDateString()}
                  </p>
                  
                  <div className="job-actions">
                    {job.status === 'pending' && (
                      <button 
                        onClick={() => handleJobStatusUpdate(job.id, 'approved')}
                        className="approve-button"
                      >
                        Approve
                      </button>
                    )}
                    {job.status === 'approved' && (
                      <button 
                        onClick={() => handleJobStatusUpdate(job.id, 'pending')}
                        className="pending-button"
                      >
                        Mark Pending
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="tab-content">
          <h2>All Applications</h2>
          {applications.length === 0 ? (
            <p>No applications received yet.</p>
          ) : (
            <div className="admin-applications-list">
              {applications.map((application) => (
                <div key={application.id} className="admin-application-card">
                  <div className="application-header">
                    <div>
                      <h3>{application.jobs.title}</h3>
                      <p className="applicant-email">👤 {application.profiles.email}</p>
                    </div>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(application.status) }}
                    >
                      {application.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="job-details">
                    <p>📍 {application.jobs.location}</p>
                    <p>💰 {application.jobs.salary}</p>
                  </div>
                  
                  <p className="application-date">
                    Applied: {new Date(application.created_at).toLocaleDateString()}
                  </p>
                  
                  {application.status === 'pending' && (
                    <div className="application-actions">
                      <button 
                        onClick={() => handleApplicationStatusUpdate(application.id, 'approved')}
                        className="approve-button"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleApplicationStatusUpdate(application.id, 'rejected')}
                        className="reject-button"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Job Tab */}
      {activeTab === 'create' && (
        <div className="tab-content">
          <h2>Create New Job</h2>
          <form onSubmit={handleCreateJob} className="create-job-form">
            <div className="form-group">
              <label htmlFor="title">Job Title:</label>
              <input
                type="text"
                id="title"
                value={newJob.title}
                onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location:</label>
              <input
                type="text"
                id="location"
                value={newJob.location}
                onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="salary">Salary:</label>
              <input
                type="text"
                id="salary"
                value={newJob.salary}
                onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                required
                placeholder="e.g., $50,000 - $70,000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                value={newJob.description}
                onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                required
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status:</label>
              <select
                id="status"
                value={newJob.status}
                onChange={(e) => setNewJob({...newJob, status: e.target.value})}
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <button type="submit" disabled={submitting} className="submit-button">
              {submitting ? 'Creating...' : 'Create Job'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Admin