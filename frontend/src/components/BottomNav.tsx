import { Link, useLocation } from 'react-router-dom'
import './BottomNav.css'

function BottomNav() {
  const location = useLocation()
  const tabs = [
    { path: '/dashboard', icon: '🏠', label: 'الرئيسية' },
    { path: '/expenses', icon: '💸', label: 'المصاريف' },
    { path: '/debts', icon: '💰', label: 'الديون' },
    { path: '/budgets', icon: '📊', label: 'الميزانية' },
    { path: '/settings', icon: '⚙️', label: 'الإعدادات' },
  ]

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">{tab.icon}</span>
            <span className="bottom-nav-label">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default BottomNav
