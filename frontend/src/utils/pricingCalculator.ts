// Project Type Base Prices
export const PROJECT_TYPE_BASE_PRICES: Record<string, number> = {
  // Design, Brand, and Creative
  'Brand identity (logo, colours, typography)': 5000,
  'Marketing collateral (deck, brochure, one-pager)': 1500,
  'Social media design kit (templates)': 1200,
  'Website UX/UI design': 3500,
  'App or SaaS interface design': 4500,
  'Product or feature redesign': 3000,
  
  // Web and Digital Build
  'Website build (custom or CMS)': 4000,
  'Website redesign or rebuild': 3500,
  'Landing page build': 2000,
  'Front-end build from designs': 3500,
  'UI implementation for site or app': 3000,
  'Performance or UI optimization project': 2500,
  
  // Content and Media
  'Content package (defined deliverables)': 1500,
  'Campaign-based content creation': 2000,
  'Brand content sprint': 1800,
  'UGC video package': 1200,
  'Product-focused content shoot': 1000,
  'Campaign-specific UGC content': 1500,
  'Brand or lifestyle photoshoot': 1800,
  'Product photography shoot': 1500,
  'Event photography (single event)': 2000,
  'Brand video project': 3500,
  'Promotional or launch video': 3000,
  'Event video coverage': 2500,
  
  // Illustration and Editorial
  'Custom illustration project': 1500,
  'Illustration set for brand or web': 2000,
  'Editorial or publication illustration': 1200,
  'Manuscript editing': 2000,
  'Long-form content editing': 1500,
  'Editorial review and refinement': 1200,
  
  // Copy, Strategy, and Marketing
  'Website copywriting': 1500,
  'Brand messaging or tone-of-voice': 2000,
  'Sales page or email sequence': 1800,
  'Social media strategy setup': 1500,
  'Content calendar creation': 1200,
  'Platform audit and recommendations': 1000,
  'Marketing strategy project': 2500,
  'Campaign planning and setup': 2000,
  'Funnel or launch strategy': 3000,
  'SEO audit': 1500,
  'On-page SEO optimization (defined scope)': 2000,
  'Keyword research project': 1200,
  
  // Brand and Go-to-Market
  'Brand positioning and strategy': 4000,
  'Brand messaging framework': 3000,
  'Rebrand strategy project': 4500,
  'Go-to-market strategy': 3500,
  'Campaign or launch consulting project': 2500,
  'Marketing audit and recommendations': 2000,
  
  // Operations, Advisory, and Systems
  'Project setup and planning': 2000,
  'Launch or campaign management (fixed scope)': 3000,
  'Short-term project coordination': 2500,
  'Strategy audit': 2500,
  'Advisory project (fixed duration)': 3000,
  'Systems or process design': 3500,
  'Coaching package (fixed sessions)': 2000,
  'Intensive or deep-dive program': 3500,
  'Workshop or facilitated session': 2500,
  
  // Engineering and Product
  'Backend system build': 5000,
  'API or integration project': 4000,
  'Database or infrastructure setup': 4500,
  'MVP application build': 6000,
  'Feature-complete app build': 8000,
  'Product rebuild or major upgrade': 7000,
}

const DEFAULT_BASE_PRICE = 2650

// Get all project type names for autocomplete
export function getAllProjectTypes(): string[] {
  return Object.keys(PROJECT_TYPE_BASE_PRICES)
}

// Timeline Multipliers
export const TIMELINE_MULTIPLIERS: Record<string, number> = {
  'Rush': 1.5,
  'Fast': 1.25, // Maps to "Tight" in spec
  'Standard': 1.0,
  'Flexible': 0.9,
}

// Complexity Multipliers
export const COMPLEXITY_MULTIPLIERS: Record<string, number> = {
  'Simple': 1.0,
  'Moderate': 1.2,
  'Complex': 1.5,
  'Very Complex': 2.0,
}

// Client Type Multipliers
export const CLIENT_TYPE_MULTIPLIERS: Record<string, number> = {
  'Start Up': 1.0,
  'Small Biz': 1.4,
  'Mid-Large': 1.8,
  'Enterprise': 2.5,
}

// Experience Level Multiplier (always Beginner for MVP1)
const EXPERIENCE_LEVEL_MULTIPLIER = 0.5

export interface PricingCalculationInput {
  projectType: string
  currentHourlyRate?: number
  estimatedHours?: number
  timeline: string
  complexity: string
  clientType: string
  portfolioBoost?: string
}

export interface PricingResult {
  recommendedPrice: number
  optimisticPrice: number
  conservativePrice: number
  basePrice: number
  calculationBreakdown: {
    basePrice: number
    timelineMultiplier: number
    complexityMultiplier: number
    clientTypeMultiplier: number
    experienceMultiplier: number
    finalMultiplier: number
  }
}

export function calculatePricing(input: PricingCalculationInput): PricingResult {
  // Get base price for project type
  const basePrice = PROJECT_TYPE_BASE_PRICES[input.projectType] || DEFAULT_BASE_PRICE
  
  // Get multipliers
  const timelineMultiplier = TIMELINE_MULTIPLIERS[input.timeline] || 1.0
  const complexityMultiplier = COMPLEXITY_MULTIPLIERS[input.complexity] || 1.0
  const clientTypeMultiplier = CLIENT_TYPE_MULTIPLIERS[input.clientType] || 1.0
  
  // Calculate final multiplier
  const finalMultiplier = timelineMultiplier * complexityMultiplier * clientTypeMultiplier * EXPERIENCE_LEVEL_MULTIPLIER
  
  // Calculate recommended price
  const recommendedPrice = basePrice * finalMultiplier
  
  // Calculate optimistic (10% higher) and conservative (10% lower) prices
  const optimisticPrice = recommendedPrice * 1.1
  const conservativePrice = recommendedPrice * 0.9
  
  return {
    recommendedPrice: Math.round(recommendedPrice),
    optimisticPrice: Math.round(optimisticPrice),
    conservativePrice: Math.round(conservativePrice),
    basePrice,
    calculationBreakdown: {
      basePrice,
      timelineMultiplier,
      complexityMultiplier,
      clientTypeMultiplier,
      experienceMultiplier: EXPERIENCE_LEVEL_MULTIPLIER,
      finalMultiplier,
    },
  }
}

