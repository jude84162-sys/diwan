// تصدير PDF — يستخدم print إذا المكتبات غير متوفرة

export async function exportElementToPDF(elementId: string, filename: string = 'diwan-report') {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error('Element not found:', elementId)
    return
  }

  // فتح نافذة طباعة
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) {
    window.print()
    return
  }

  const styles = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n')
      } catch {
        return ''
      }
    })
    .join('\n')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>${filename}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
        <style>
          ${styles}
          body { 
            font-family: 'Cairo', sans-serif; 
            padding: 20px; 
            background: white;
            color: #1a1a1a;
          }
          @media print {
            body { padding: 0; }
            button, .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `)

  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
  }, 500)
}
