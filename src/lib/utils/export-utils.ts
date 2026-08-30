/**
 * Utilitários para exportação de relatórios em CSV e PDF
 */

// Exportar para CSV
export function exportToCSV(data: any[], headers: { label: string; key: string }[], filename: string) {
  const csvRows = [];
  
  // Headers
  csvRows.push(headers.map(header => `"${header.label}"`).join(','));
  
  // Data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header.key];
      const escaped = ('' + (val !== undefined && val !== null ? val : '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvContent = '\uFEFF' + csvRows.join('\n'); // UTF-8 BOM para Excel
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Exportar para PDF usando layout de impressão nativo
export function exportToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Elemento com ID ${elementId} não encontrado.`);
    return;
  }

  // Clona o elemento para impressão
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(style => style.outerHTML)
    .join('\n');

  printWindow.document.write(`
    <html>
      <head>
        <title>${filename}</title>
        ${styles}
        <style>
          body {
            background-color: white !important;
            color: black !important;
            padding: 20px !important;
            font-family: sans-serif !important;
          }
          .glass-card, .glass {
            background: white !important;
            border: 1px solid #ddd !important;
            color: black !important;
            box-shadow: none !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #ddd !important;
            padding: 8px !important;
            color: black !important;
          }
          th {
            background-color: #f2f2f2 !important;
          }
          /* Remove botões de exportação e ações da impressão */
          .no-print, button, a[href="/"] {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div style="margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
          <h1 style="margin: 0; font-size: 24px;">EduRio-Insights | Relatório de Inteligência</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Secretaria Municipal de Educação do Rio de Janeiro · Gerado em ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        ${element.outerHTML}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
