import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjectTypeSuggestions } from '../services/authService'
import { calculatePricing, PricingResult, getAllProjectTypes } from '../utils/pricingCalculator'

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
    // Get all project types from base prices
    const allProjectTypes = getAllProjectTypes()
    
    if (query && query.trim().length > 0) {
      // Filter project types that match the query
      const filtered = allProjectTypes.filter(type => 
        type.toLowerCase().includes(query.toLowerCase())
      )
      setProjectSuggestions(filtered.slice(0, 20)) // Limit to 20 results
    } else {
      // Show all project types if no query
      setProjectSuggestions(allProjectTypes.slice(0, 20))
    }
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
    setError('')
    
    // Validate required fields
    if (!projectType || !timeline || !complexity || !clientType) {
      setError('Please fill in all required fields')
      return
    }
    
    // Calculate pricing
    try {
      const result = calculatePricing({
        projectType,
        currentHourlyRate: currentHourlyRate ? Number(currentHourlyRate) : undefined,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        timeline,
        complexity,
        clientType,
        portfolioBoost: portfolioBoost || undefined,
      })
      
      setPricingResult(result)
      // Scroll to results
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError('An error occurred while calculating pricing. Please try again.')
      console.error('Pricing calculation error:', err)
    }
  }
  
  const handleNewCalculation = () => {
    setPricingResult(null)
    setProjectType('')
    setCurrentHourlyRate('')
    setEstimatedHours('')
    setTimeline('')
    setComplexity('')
    setClientType('')
    setPortfolioBoost('')
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

        {/* Results Display */}
        {pricingResult && (
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ margin: 0 }}>Pricing Results</h2>
              <button
                onClick={handleNewCalculation}
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
                New Calculation
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                padding: '1.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginBottom: '0.5rem'
                }}>
                  Recommended Price
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#007bff'
                }}>
                  ${pricingResult.recommendedPrice.toLocaleString()}
                </div>
              </div>

              <div style={{
                padding: '1.5rem',
                backgroundColor: '#e8f5e9',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginBottom: '0.5rem'
                }}>
                  Optimistic Price
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#28a745'
                }}>
                  ${pricingResult.optimisticPrice.toLocaleString()}
                </div>
              </div>

              <div style={{
                padding: '1.5rem',
                backgroundColor: '#fff3e0',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginBottom: '0.5rem'
                }}>
                  Conservative Price
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#ff9800'
                }}>
                  ${pricingResult.conservativePrice.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Calculation Breakdown */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Calculation Breakdown</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                fontSize: '0.9rem'
              }}>
                <div>
                  <strong>Base Price:</strong> ${pricingResult.calculationBreakdown.basePrice.toLocaleString()}
                </div>
                <div>
                  <strong>Timeline Multiplier:</strong> {pricingResult.calculationBreakdown.timelineMultiplier}x
                </div>
                <div>
                  <strong>Complexity Multiplier:</strong> {pricingResult.calculationBreakdown.complexityMultiplier}x
                </div>
                <div>
                  <strong>Client Type Multiplier:</strong> {pricingResult.calculationBreakdown.clientTypeMultiplier}x
                </div>
                <div>
                  <strong>Experience Multiplier:</strong> {pricingResult.calculationBreakdown.experienceMultiplier}x
                </div>
                <div>
                  <strong>Final Multiplier:</strong> {pricingResult.calculationBreakdown.finalMultiplier.toFixed(2)}x
                </div>
              </div>
              <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #ddd',
                fontSize: '0.9rem'
              }}>
                <strong>Formula:</strong> Base Price × Timeline × Complexity × Client Type × Experience
                <br />
                <strong>Calculation:</strong> ${pricingResult.calculationBreakdown.basePrice.toLocaleString()} × {pricingResult.calculationBreakdown.finalMultiplier.toFixed(2)} = ${pricingResult.recommendedPrice.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

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

