import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Event, SummaryResult } from '../types';

export async function exportSummaryToPDF(event: Event, summary: SummaryResult) {
  // Tạo một container ẩn để render HTML
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = 'Arial, sans-serif';
  
  document.body.appendChild(container);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('vi-VN');
  };

  // Tạo HTML content
  let htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #000;">
      <h1 style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px;">
        BÁO CÁO TỔNG KẾT
      </h1>
      
      <div style="margin-bottom: 20px; font-size: 12px;">
        <p><strong>Sự kiện:</strong> ${event.name}</p>
        <p><strong>Ngày tạo:</strong> ${formatDate(event.createdAt)}</p>
        <p><strong>Mã truy cập:</strong> ${event.accessCode}</p>
        <p><strong>Thành viên:</strong> ${event.members.join(', ')}</p>
      </div>

      <div style="background-color: #f3e8ff; border: 1px solid #c084fc; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <h2 style="font-size: 14px; font-weight: bold; color: #7c3aed; margin-bottom: 8px;">
          TỔNG CHI PHÍ CHUYẾN ĐI
        </h2>
        <p style="font-size: 18px; font-weight: bold; color: #9333ea; margin: 0;">
          ${formatCurrency(summary.totalExpenses)} VNĐ
        </p>
      </div>
  `;

  // Quỹ chung (nếu có)
  if (summary.remainingFund !== undefined) {
    htmlContent += `
      <div style="background-color: #dbeafe; border: 1px solid #60a5fa; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <h2 style="font-size: 12px; font-weight: bold; color: #1e40af; margin-bottom: 8px;">
          QUỸ CHUNG CÒN LẠI
        </h2>
        <p style="font-size: 16px; font-weight: bold; color: #2563eb; margin: 0;">
          ${formatCurrency(summary.remainingFund)} VNĐ
        </p>
      </div>
    `;
  }

  // Tiền trả lại từ quỹ (nếu có)
  if (summary.fundRefunds && Object.keys(summary.fundRefunds).length > 0) {
    htmlContent += `
      <div style="background-color: #dcfce7; border: 1px solid #4ade80; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <h2 style="font-size: 12px; font-weight: bold; color: #166534; margin-bottom: 12px;">
          TIỀN TRẢ LẠI TỪ QUỸ:
        </h2>
        <ul style="list-style: none; padding: 0; margin: 0;">
    `;
    Object.entries(summary.fundRefunds).forEach(([person, amount]) => {
      htmlContent += `
        <li style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 11px;">
          <span>${person}:</span>
          <span style="font-weight: bold; color: #16a34a;">${formatCurrency(amount)} VNĐ</span>
        </li>
      `;
    });
    htmlContent += `</ul></div>`;
  }

  // Số dư của từng người
  htmlContent += `
    <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <h2 style="font-size: 12px; font-weight: bold; margin-bottom: 12px;">
        SỐ DƯ CỦA TỪNG NGƯỜI:
      </h2>
  `;

  summary.balances.forEach((balance) => {
    const balanceColor = balance.balance >= 0 ? '#16a34a' : '#dc2626';
    htmlContent += `
      <div style="border-bottom: 1px solid #f3f4f6; padding: 12px 0; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-weight: 600; font-size: 11px;">${balance.person}</span>
          <span style="font-weight: bold; font-size: 11px; color: ${balanceColor};">
            ${balance.balance >= 0 ? '+' : ''}${formatCurrency(Math.round(balance.balance))} VNĐ
          </span>
        </div>
        <div style="font-size: 9px; color: #6b7280; margin-left: 5px;">
          Đã trả: ${formatCurrency(balance.totalPaid)} | Phải trả: ${formatCurrency(balance.totalOwed)}
        </div>
      </div>
    `;
  });

  htmlContent += `</div>`;

  // Các khoản cần thanh toán
  if (summary.debts.length > 0) {
    htmlContent += `
      <div style="background-color: #fef9c3; border: 1px solid #eab308; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <h2 style="font-size: 12px; font-weight: bold; color: #854d0e; margin-bottom: 12px;">
          CÁC KHOẢN CẦN THANH TOÁN (ĐÃ TỐI ƯU):
        </h2>
        <ul style="list-style: none; padding: 0; margin: 0;">
    `;
    summary.debts.forEach((debt, index) => {
      htmlContent += `
        <li style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 11px;">
          <span>${index + 1}. <strong>${debt.from}</strong> cần trả cho <strong>${debt.to}</strong>:</span>
          <span style="font-weight: bold; color: #a16207;">${formatCurrency(debt.amount)} VNĐ</span>
        </li>
      `;
    });
    htmlContent += `</ul></div>`;
  } else {
    htmlContent += `
      <div style="background-color: #dcfce7; border: 1px solid #4ade80; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px;">
        <p style="font-weight: 600; color: #166534; margin: 0; font-size: 11px;">
          Tất cả đã được cân bằng! Không có khoản nợ nào.
        </p>
      </div>
    `;
  }

  // Thêm footer vào HTML
  htmlContent += `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="font-size: 8px; color: #808080; margin: 0;">
        Được tạo bởi Split Bill App
      </p>
    </div>
  `;

  htmlContent += `</div>`;

  container.innerHTML = htmlContent;

  try {
    // Capture HTML as canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = 297; // A4 height in mm
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Generate filename
    const fileName = `Bao-cao-${event.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

    // Save PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.');
  } finally {
    // Cleanup
    document.body.removeChild(container);
  }
}
