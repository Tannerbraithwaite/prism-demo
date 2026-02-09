import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjectTypeSuggestions } from '../services/authService'

const PricingCalculatorPage = () => {
  const navigate = useNavigate()
  
  // Form state
  const [projectType, setProjectType] = useState('')
  const [currentHourlyRate, setCurrentHourlyRate] = useState<number | ''>('')
  const [estimatedHours, setEstimatedHours] = useState<number | ''>('')
  const [timeline, setTimeline] = useState('')
  const [complexity, setComplexity] = useState('')
  const [clientType, setClientType] = useState('')
  const [portfolioBoost, setPortfolioBoost] = useState('')
  
  // Autocomplete state for project type
  const [projectSuggestions, setProjectSuggestions] = useState<string[]>([])
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false)
  const projectInputRef = useRef<HTMLInputElement>(null)
  const projectSuggestionsRef = useRef<HTMLDivElement>(null)
  
  // Options for dropdowns
  const timelineOptions = ['Rush', 'Fast', 'Standard', 'Flexible']
  const complexityOptions = ['Simple', 'Moderate', 'Complex', 'Very Complex']
  const clientTypeOptions = ['Start Up', 'Small Biz', 'Mid-Large', 'Enterprise']
  const portfolioBoostOptions = [
    'Nothing will change',
    'Will look good on my portfolio',
    'My life might change'
  ]

  // Load initial project type suggestions
  useEffect(() => {
    loadProjectSuggestions()
  }, [])

  // Handle clicks outside suggestion box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectSuggestionsRef.current && !projectSuggestionsRef.current.contains(event.target as Node) &&
          projectInputRef.current && !projectInputRef.current.contains(event.target as Node)) {
        setShowProjectSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadProjectSuggestions = async (query?: string) => {
    const suggestions = await getProjectTypeSuggestions(query)
    setProjectSuggestions(suggestions)
  }

  const handleProjectTypeChange = (value: string) => {
    setProjectType(value)
    if (value.length > 0) {
      loadProjectSuggestions(value)
      setShowProjectSuggestions(true)
    } else {
      loadProjectSuggestions()
      setShowProjectSuggestions(true)
    }
  }

  const selectProjectType = (type: string) => {
    setProjectType(type)
    setShowProjectSuggestions(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Calculate pricing and show results
    console.log('Form submitted:', {
      projectType,
      currentHourlyRate,
      estimatedHours,
      timeline,
      complexity,
      clientType,
      portfolioBoost
    })
    alert('Pricing calculation will be implemented next!')
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1>Pricing Calculator</h1>
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

        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Project Information</h2>
          <p style={{ 
            marginBottom: '2rem', 
            color: '#666',
            fontSize: '0.9rem'
          }}>
            Enter the details of your project to calculate the optimal pricing
          </p>
          
          <form onSubmit={handleSubmit}>
            {/* Type of Project */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <label 
                htmlFor="project-type" 
                style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
              >
                Type of Project *
              </label>
              <input
                ref={projectInputRef}
                id="project-type"
                type="text"
                value={projectType}
                onChange={(e) => handleProjectTypeChange(e.target.value)}
                onFocus={() => setShowProjectSuggestions(true)}
                required
                placeholder="Search or type project type"
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
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginTop: '0.25rem'
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
            </div>

            {/* Current Hourly Rate */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                htmlFor="hourly-rate" 
                style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
              >
                Current Hourly Rate ($) *
              </label>
              <input
                id="hourly-rate"
                type="number"
                value={currentHourlyRate}
                onChange={(e) => setCurrentHourlyRate(e.target.value ? parseFloat(e.target.value) : '')}
                required
                min="0"
                step="0.01"
                placeholder="e.g., 50.00"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Estimated Hours */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                htmlFor="estimated-hours" 
                style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
              >
                Estimate Hours for This Project *
              </label>
              <input
                id="estimated-hours"
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value ? parseFloat(e.target.value) : '')}
                required
                min="0"
                step="0.5"
                placeholder="e.g., 40"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Timeline */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                htmlFor="timeline" 
                style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
              >
                Timeline *
              </label>
              <select
                id="timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select timeline</option>
                {timelineOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Complexity */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                htmlFor="complexity" 
                style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
              >
                Complexity *
              </label>
              <select
                id="complexity"
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select complexity</option>
                {complexityOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Client Type */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                htmlFor="client-type" 
                style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
              >
                Client Type *
              </label>
              <select
                id="client-type"
                value={clientType}
                onChange={(e) => setClientType(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select client type</option>
                {clientTypeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Portfolio Boost */}
            <div style={{ marginBottom: '2rem' }}>
              <label 
                htmlFor="portfolio-boost" 
                style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
              >
                Portfolio Boost *
              </label>
              <select
                id="portfolio-boost"
                value={portfolioBoost}
                onChange={(e) => setPortfolioBoost(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select portfolio boost</option>
                {portfolioBoostOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Calculate Pricing
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PricingCalculatorPage

