import { Link, useNavigate } from 'react-router-dom'
import './PageHeader.css'

interface Props {
  title: string
  subtitle?: string
  backTo?: string
  showBack?: boolean
  rightAction?: React.ReactNode
}

function PageHeader({ title, subtitle, backTo, showBack = true, rightAction }: Props) {
  const navigate = useNavigate()

  return (
    <header className="page-header">
      <div className="page-header-side">
        {showBack && (
          <button
            className="page-header-back"
            onClick={() => backTo ? navigate(backTo) : navigate(-1)}
            aria-label="رجوع"
          >
            →
          </button>
        )}
      </div>

      <div className="page-header-center">
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>

      <div className="page-header-side right">
        {rightAction}
      </div>
    </header>
  )
}

export default PageHeader
