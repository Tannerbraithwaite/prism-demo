import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  getAccountProfile, 
  updateAccountProfile,
  createAccount,
  getFreelancerTypeSuggestions, 
  getProjectTypeSuggestions 
} from '../services/authService'

const AccountPage = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [freelancerType, setFreelancerType] = useState('')
  const [projectTypes, setProjectTypes] = useState<string[]>([])
  const [currentProjectType, setCurrentProjectType] = useState('')
  const [location, setLocation] = useState('')
  const [yearsExperience, setYearsExperience] = useState<number | ''>('')
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState<number | ''>('')
  
  const [freelancerSuggestions, setFreelancerSuggestions] = useState<string[]>([])
  const [projectSuggestions, setProjectSuggestions] = useState<string[]>([])
  const [showFreelancerSuggestions, setShowFreelancerSuggestions] = useState(false)
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false)
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileExists, setProfileExists] = useState(false)
  
  const freelancerInputRef = useRef<HTMLInputElement>(null)
  const projectInputRef = useRef<HTMLInputElement>(null)
  const freelancerSuggestionsRef = useRef<HTMLDivElement>(null)
  const projectSuggestionsRef = useRef<HTMLDivElement>(null)

  const token = localStorage.getItem('token')

  // Load profile data on mount
  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    loadProfile()
    loadFreelancerSuggestions()
    loadProjectSuggestions()
  }, [navigate, token])

  // Handle clicks outside suggestion boxes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (freelancerSuggestionsRef.current && !freelancerSuggestionsRef.current.contains(event.target as Node) &&
          freelancerInputRef.current && !freelancerInputRef.current.contains(event.target as Node)) {
        setShowFreelancerSuggestions(false)
      }
      if (projectSuggestionsRef.current && !projectSuggestionsRef.current.contains(event.target as Node) &&
          projectInputRef.current && !projectInputRef.current.contains(event.target as Node)) {
        setShowProjectSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadProfile = async () => {
    if (!token) return
    
    try {
      const response = await getAccountProfile(token)
      if (response.success && response.profile) {
        setName(response.profile.name || '')
        setFreelancerType(response.profile.freelancer_type || '')
        setProjectTypes(response.profile.project_types || [])
        setLocation(response.profile.location || '')
        setYearsExperience(response.profile.years_experience || '')
        setMonthlyIncomeGoal(response.profile.monthly_income_goal || '')
        setProfileExists(true)
      } else {
        // Profile doesn't exist yet - this is okay, user can create it
        setProfileExists(false)
        setError('') // Clear any error since this is expected
      }
    } catch (err: any) {
      // If profile not found, that's okay - user can create one
      setProfileExists(false)
      setError('')
      console.log('Profile not found - user can create one')
    } finally {
      setLoadingProfile(false)
    }
  }

  const loadFreelancerSuggestions = async (query?: string) => {
    const suggestions = await getFreelancerTypeSuggestions(query)
    setFreelancerSuggestions(suggestions)
  }

  const loadProjectSuggestions = async (query?: string) => {
    const suggestions = await getProjectTypeSuggestions(query)
    setProjectSuggestions(suggestions)
  }

  const handleFreelancerTypeChange = (value: string) => {
    setFreelancerType(value)
    if (value.length > 0) {
      loadFreelancerSuggestions(value)
      setShowFreelancerSuggestions(true)
    } else {
      loadFreelancerSuggestions()
      setShowFreelancerSuggestions(true)
    }
  }

  const handleProjectTypeChange = (value: string) => {
    setCurrentProjectType(value)
    if (value.length > 0) {
      loadProjectSuggestions(value)
      setShowProjectSuggestions(true)
    } else {
      loadProjectSuggestions()
      setShowProjectSuggestions(true)
    }
  }

  const selectFreelancerType = (type: string) => {
    setFreelancerType(type)
    setShowFreelancerSuggestions(false)
  }

  const selectProjectType = (type: string) => {
    if (!projectTypes.includes(type)) {
      setProjectTypes([...projectTypes, type])
    }
    setCurrentProjectType('')
    setShowProjectSuggestions(false)
  }

  const removeProjectType = (typeToRemove: string) => {
    setProjectTypes(projectTypes.filter(type => type !== typeToRemove))
  }

  const handleProjectTypeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentProjectType.trim()) {
      e.preventDefault()
      if (!projectTypes.includes(currentProjectType.trim())) {
        setProjectTypes([...projectTypes, currentProjectType.trim()])
        setCurrentProjectType('')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (!freelancerType.trim()) {
      setError('Type of freelancer is required')
      return
    }

    if (projectTypes.length === 0) {
      setError('At least one project type is required')
      return
    }

    if (!token) {
      setError('Not authenticated. Please login again.')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
      return
    }

    setLoading(true)

    try {
      const accountData = {
        name: name.trim(),
        freelancer_type: freelancerType.trim(),
        project_types: projectTypes,
        location: location.trim() || undefined,
        years_experience: yearsExperience ? Number(yearsExperience) : undefined,
        monthly_income_goal: monthlyIncomeGoal ? Number(monthlyIncomeGoal) : undefined
      }

      let response
      if (profileExists) {
        // Update existing profile
        response = await updateAccountProfile(accountData, token)
      } else {
        // Create new profile
        response = await createAccount(accountData, token)
      }

      if (response.success) {
        setSuccess(profileExists ? 'Profile updated successfully!' : 'Profile created successfully!')
        setProfileExists(true)
        // Reload profile to ensure we have latest data
        setTimeout(() => {
          loadProfile()
        }, 1000)
      } else {
        setError(response.message || (profileExists ? 'Failed to update profile' : 'Failed to create profile'))
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
      console.error('Save profile error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loadingProfile) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading profile...</div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0 }}>My Account</h1>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Back to Dashboard
          </button>
        </div>
        <p style={{ 
          marginBottom: '2rem', 
          color: '#666',
          fontSize: '0.9rem'
        }}>
          {profileExists 
            ? 'Update your account information and project details'
            : 'Create your account profile and project information'}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label 
              htmlFor="name" 
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
            >
              Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem', position: 'relative' }}>
            <label 
              htmlFor="freelancer-type" 
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
            >
              Type of Freelancer *
            </label>
            <input
              ref={freelancerInputRef}
              id="freelancer-type"
              type="text"
              value={freelancerType}
              onChange={(e) => handleFreelancerTypeChange(e.target.value)}
              onFocus={() => setShowFreelancerSuggestions(true)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            {showFreelancerSuggestions && freelancerSuggestions.length > 0 && (
              <div
                ref={freelancerSuggestionsRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {freelancerSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => selectFreelancerType(suggestion)}
                    style={{
                      padding: '0.75rem',
                      cursor: 'pointer',
                      borderBottom: index < freelancerSuggestions.length - 1 ? '1px solid #eee' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white'
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1rem', position: 'relative' }}>
            <label 
              htmlFor="project-types" 
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
            >
              Type of Projects * (Press Enter to add)
            </label>
            <input
              ref={projectInputRef}
              id="project-types"
              type="text"
              value={currentProjectType}
              onChange={(e) => handleProjectTypeChange(e.target.value)}
              onFocus={() => setShowProjectSuggestions(true)}
              onKeyDown={handleProjectTypeKeyDown}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            {showProjectSuggestions && projectSuggestions.length > 0 && (
              <div
                ref={projectSuggestionsRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {projectSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => selectProjectType(suggestion)}
                    style={{
                      padding: '0.75rem',
                      cursor: 'pointer',
                      borderBottom: index < projectSuggestions.length - 1 ? '1px solid #eee' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white'
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
            {projectTypes.length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {projectTypes.map((type, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '16px',
                      fontSize: '0.9rem'
                    }}
                  >
                    {type}
                    <button
                      type="button"
                      onClick={() => removeProjectType(type)}
                      style={{
                        marginLeft: '0.5rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        color: '#666'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label 
              htmlFor="location" 
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., New York, NY"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label 
              htmlFor="years-experience" 
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
            >
              Years of Experience
            </label>
            <input
              id="years-experience"
              type="number"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value ? parseInt(e.target.value) : '')}
              min="0"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="monthly-income-goal" 
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
            >
              Monthly Income Goal ($)
            </label>
            <input
              id="monthly-income-goal"
              type="number"
              value={monthlyIncomeGoal}
              onChange={(e) => setMonthlyIncomeGoal(e.target.value ? parseFloat(e.target.value) : '')}
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#efe',
              color: '#3c3',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading 
              ? (profileExists ? 'Updating Profile...' : 'Creating Profile...') 
              : (profileExists ? 'Update Profile' : 'Create Profile')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AccountPage

