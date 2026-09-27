import { Link } from 'react-router-dom'
import './Support.css'

function Support() {
  const WHATSAPP = '963937522989'
  const EMAIL = 'dajo2162@gmail.com'

  return (
    <div className="page-container support-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="page-content support-content">
        <Link to="/settings" className="back-btn">
          <span>→</span>
          <span>رجوع</span>
        </Link>

        <div className="support-header">
          <div className="support-icon">💬</div>
          <h1 className="support-title">نحن هنا لمساعدتك</h1>
          <p className="support-sub">اختر طريقة التواصل المناسبة</p>
        </div>

        <div className="support-options">
          <a
            href={`https://wa.me/${WHATSAPP}?text=مرحباً%20ديوان%20👋`}
            target="_blank"
            rel="noopener noreferrer"
            className="support-option whatsapp"
          >
            <span className="support-option-icon">💬</span>
            <div className="support-option-info">
              <span className="support-option-title">واتساب</span>
              <span className="support-option-sub">رد سريع خلال ساعة</span>
            </div>
            <span className="support-option-arrow">←</span>
          </a>

          <a
            href={`mailto:${EMAIL}?subject=استفسار%20عن%20ديوان`}
            className="support-option email"
          >
            <span className="support-option-icon">📧</span>
            <div className="support-option-info">
              <span className="support-option-title">البريد الإلكتروني</span>
              <span className="support-option-sub">{EMAIL}</span>
            </div>
            <span className="support-option-arrow">←</span>
          </a>

          <a
            href={`mailto:${EMAIL}?subject=اقتراح%20ميزة%20جديدة`}
            className="support-option suggest"
          >
            <span className="support-option-icon">💡</span>
            <div className="support-option-info">
              <span className="support-option-title">اقترح ميزة</span>
              <span className="support-option-sub">رأيك يهمنا</span>
            </div>
            <span className="support-option-arrow">←</span>
          </a>

          <a
            href={`mailto:${EMAIL}?subject=مشكلة%20في%20ديوان`}
            className="support-option bug"
          >
            <span className="support-option-icon">🐛</span>
            <div className="support-option-info">
              <span className="support-option-title">الإبلاغ عن مشكلة</span>
              <span className="support-option-sub">ساعدنا نحسّن التطبيق</span>
            </div>
            <span className="support-option-arrow">←</span>
          </a>
        </div>

        {/* FAQ */}
        <div className="support-faq">
          <h2 className="support-faq-title">❓ أسئلة شائعة</h2>

          <details className="faq-item">
            <summary>كيف أضيف أول بيعة؟</summary>
            <p>افتح Dashboard → اضغط "إضافة دخل" → أدخل المبلغ → احفظ</p>
          </details>

          <details className="faq-item">
            <summary>كيف أتابع ديون العملاء؟</summary>
            <p>افتح "الديون" → اضغط "يدينون لي" → أضف الشخص والمبلغ</p>
          </details>

          <details className="faq-item">
            <summary>هل بياناتي آمنة؟</summary>
            <p>نعم. البيانات محفوظة على جهازك في localStorage. لا تُرسل لأي جهة.</p>
          </details>

          <details className="faq-item">
            <summary>كيف أنقل بياناتي لجوال جديد؟</summary>
            <p>الإعدادات → تصدير البيانات → احفظ الملف → في الجوال الجديد: استيراد البيانات</p>
          </details>

          <details className="faq-item">
            <summary>هل يعمل بدون إنترنت؟</summary>
            <p>نعم! بعد أول تحميل، يعمل التطبيق بدون إنترنت.</p>
          </details>
        </div>

        <div className="support-footer">
          <p>صُنع بـ 💚 للتاجر العربي</p>
          <p className="support-version">ديوان v1.0.0</p>
        </div>
      </div>
    </div>
  )
}

export default Support
