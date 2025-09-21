import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth functions
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Profile functions
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const createProfile = async (userId, email, role = 'seeker') => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ id: userId, email, role }])
    .select()
    .single()
  return { data, error }
}

// Job functions
export const getApprovedJobs = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getAllJobs = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export const createJob = async (jobData) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert([jobData])
    .select()
    .single()
  return { data, error }
}

export const updateJobStatus = async (jobId, status) => {
  const { data, error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)
    .select()
    .single()
  return { data, error }
}

// Application functions
export const getUserApplications = async (userId) => {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs (
        id,
        title,
        description,
        location,
        salary,
        status
      )
    `)
    .eq('seeker_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getAllApplications = async () => {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs (
        id,
        title,
        description,
        location,
        salary
      ),
      profiles (
        id,
        email
      )
    `)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const createApplication = async (jobId, seekerId) => {
  const { data, error } = await supabase
    .from('applications')
    .insert([{ job_id: jobId, seeker_id: seekerId }])
    .select()
    .single()
  return { data, error }
}

export const updateApplicationStatus = async (applicationId, status) => {
  const { data, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single()
  return { data, error }
}

export const checkExistingApplication = async (jobId, seekerId) => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('job_id', jobId)
    .eq('seeker_id', seekerId)
    .single()
  return { data, error }
}