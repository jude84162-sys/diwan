import { Link } from 'react-router-dom'

export default function Invoices() {
  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header-row">
          <Link to="/dashboard" className="back-btn">
            <span>→</span>
            <span>رجوع</span>
          </Link>
        </div>
        <h1>الفواتير</h1>
        <p>قريباً...</p>
      </div>
    </div>
  )
}
