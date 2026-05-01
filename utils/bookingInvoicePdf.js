// import { jsPDF } from "jspdf";

const formatCurrency = (value) => `PHP ${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const generateBookingInvoicePdf = ({
  company,
  invoice,
  customer,
  booking,
  items,
  subtotal,
  tax,
  totalWithTax,
}) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const left = 40;
  const right = 555;
  let y = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(company.name, left, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y += 16;
  doc.text(company.address, left, y);
  y += 14;
  doc.text(company.email, left, y);
  y += 14;
  doc.text(company.phone, left, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Booking Invoice", right, 48, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Invoice #: ${invoice.number}`, right, 70, { align: "right" });
  doc.text(`Issue Date: ${invoice.issueDate}`, right, 84, { align: "right" });
  doc.text(`Due Date: ${invoice.dueDate}`, right, 98, { align: "right" });
  doc.text(`Status: ${invoice.status}`, right, 112, { align: "right" });

  y = 138;
  doc.setDrawColor(230);
  doc.rect(left, y, 250, 110);
  doc.rect(305, y, 250, 110);

  doc.setFont("helvetica", "bold");
  doc.text("Bill To", left + 10, y + 18);
  doc.text("Booking Details", 315, y + 18);

  doc.setFont("helvetica", "normal");
  doc.text(customer.name, left + 10, y + 38);
  doc.text(customer.email, left + 10, y + 54);
  doc.text(customer.phone, left + 10, y + 70);

  doc.text(booking.packageName, 315, y + 38);
  doc.text(`Reference: ${booking.reference}`, 315, y + 54);
  doc.text(`Travel Date: ${booking.travelDates}`, 315, y + 70);
  doc.text(`Travelers: ${booking.travelers}`, 315, y + 86);

  y = 272;
  doc.setFont("helvetica", "bold");
  doc.setFillColor(249, 250, 251);
  doc.rect(left, y, 515, 24, "F");
  doc.rect(left, y, 515, 24);
  doc.text("Description", left + 10, y + 16);
  doc.text("Qty", left + 290, y + 16);
  doc.text("Rate", left + 360, y + 16);
  doc.text("Amount", left + 445, y + 16);

  doc.setFont("helvetica", "normal");
  let rowY = y + 24;
  items.forEach((item) => {
    doc.rect(left, rowY, 515, 24);
    doc.text(String(item.description), left + 10, rowY + 16);
    doc.text(String(item.qty), left + 295, rowY + 16);
    doc.text(formatCurrency(item.rate), left + 360, rowY + 16);
    doc.text(formatCurrency(item.amount), left + 445, rowY + 16);
    rowY += 24;
  });

  doc.setFont("helvetica", "normal");
  doc.text(`Subtotal: ${formatCurrency(subtotal)}`, right, rowY + 24, { align: "right" });
  doc.text(`Tax (12%): ${formatCurrency(tax)}`, right, rowY + 40, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.text(`Total: ${formatCurrency(totalWithTax)}`, right, rowY + 58, { align: "right" });

  return {
    blob: doc.output("blob"),
    dataUri: doc.output("datauristring"),
    fileName: `${invoice.number || "booking-invoice"}.pdf`,
  };
};
