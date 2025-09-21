import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from '../lib/supabase'

const Navbar = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Job Hunt
        </Link>
        
        <div className="nav-links">
          <Link to="/">Home</Link>
          
          {user ? (
            <>
              {profile?.role === 'admin' ? (
                <Link to="/admin">Admin Panel</Link>
              ) : (
                <Link to="/dashboard">Dashboard</Link>
              )}
              <button onClick={handleSignOut} className="nav-button">
                Sign Out ({profile?.email})
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar