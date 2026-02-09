import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import CreateAccountPage from './pages/CreateAccountPage'
import DashboardPage from './pages/DashboardPage'
import AccountPage from './pages/AccountPage'
import PricingCalculatorPage from './pages/PricingCalculatorPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/pricing-calculator" element={<PricingCalculatorPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  )
}

export default App

