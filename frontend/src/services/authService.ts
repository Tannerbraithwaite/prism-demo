import axios from 'axios'

const API_BASE_URL = '/api'

export interface LoginResponse {
  success: boolean
  message?: string
  token?: string
  user?: {
    id: number
    email: string
  }
  is_admin?: boolean
  password_changed?: boolean
}

export interface CreateUserRequest {
  email: string
  password: string
}

export interface CreateUserResponse {
  success: boolean
  message?: string
  user?: {
    id: number
    email: string
  }
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    })
    return response.data
  } catch (error: any) {
    if (error.response) {
      // If server returned an error response, return it
      const errorData = error.response.data
      return {
        success: false,
        message: errorData?.message || errorData?.detail || 'Login failed. Please try again.',
        ...errorData
      }
    }
    // Network error or other issues
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection and try again.'
    }
  }
}

export const createUser = async (email: string, password: string, token: string): Promise<CreateUserResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/create-user`,
      { email, password },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    return response.data
  } catch (error: any) {
    if (error.response) {
      return error.response.data
    }
    throw error
  }
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export interface ChangePasswordResponse {
  success: boolean
  message?: string
}

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  token: string
): Promise<ChangePasswordResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/change-password`,
      {
        current_password: currentPassword,
        new_password: newPassword
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    return response.data
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data
      return {
        success: false,
        message: errorData?.message || errorData?.detail || 'Failed to change password. Please try again.'
      }
    }
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection and try again.'
    }
  }
}

export interface CreateAccountRequest {
  name: string
  freelancer_type: string
  project_types: string[]
  location?: string
  years_experience?: number
  monthly_income_goal?: number
}

export interface CreateAccountResponse {
  success: boolean
  message?: string
}

export const createAccount = async (
  accountData: CreateAccountRequest,
  token: string
): Promise<CreateAccountResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/account/create`,
      accountData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    return response.data
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data
      return {
        success: false,
        message: errorData?.message || errorData?.detail || 'Failed to create account. Please try again.'
      }
    }
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection and try again.'
    }
  }
}

export const getFreelancerTypeSuggestions = async (query?: string): Promise<string[]> => {
  try {
    const params = query ? { query } : {}
    const response = await axios.get(`${API_BASE_URL}/autocomplete/freelancer-types`, { params })
    return response.data.suggestions || []
  } catch (error) {
    console.error('Error fetching freelancer type suggestions:', error)
    return []
  }
}

export const getProjectTypeSuggestions = async (query?: string): Promise<string[]> => {
  try {
    const params = query ? { query } : {}
    const response = await axios.get(`${API_BASE_URL}/autocomplete/project-types`, { params })
    return response.data.suggestions || []
  } catch (error) {
    console.error('Error fetching project type suggestions:', error)
    return []
  }
}

export interface UserProfile {
  name: string
  freelancer_type: string
  project_types: string[]
  location?: string
  years_experience?: number
  monthly_income_goal?: number
}

export interface GetAccountResponse {
  success: boolean
  message?: string
  profile?: UserProfile
}

export interface UpdateAccountRequest {
  name?: string
  freelancer_type?: string
  project_types?: string[]
  location?: string
  years_experience?: number
  monthly_income_goal?: number
}

export interface UpdateAccountResponse {
  success: boolean
  message?: string
}

export const getAccountProfile = async (token: string): Promise<GetAccountResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/account/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data
      return {
        success: false,
        message: errorData?.message || errorData?.detail || 'Failed to fetch profile.'
      }
    }
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection and try again.'
    }
  }
}

export const updateAccountProfile = async (
  profileData: UpdateAccountRequest,
  token: string
): Promise<UpdateAccountResponse> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/account/profile`,
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    return response.data
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data
      return {
        success: false,
        message: errorData?.message || errorData?.detail || 'Failed to update profile.'
      }
    }
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection and try again.'
    }
  }
}

