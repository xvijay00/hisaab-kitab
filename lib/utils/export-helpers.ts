import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Transaction, Category, Business } from "@/types";
import { paiseToRupee, formatINR, formatDateDisplay } from "@/lib/utils";

export interface ExportDataParams {
  business: Business;
  transactions: Transaction[];
  categories: Category[];
  startDate?: string;
  endDate?: string;
  periodLabel?: string;
}

/**
 * Generates and downloads a branded PDF statement/ledger.
 */
export function exportToPDF({
  business,
  transactions,
  categories,
  startDate,
  endDate,
  periodLabel = "Selected Period",
}: ExportDataParams) {
  const doc = new jsPDF();
  const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  // Brand Header
  doc.setFillColor(16, 185, 129); // Emerald primary
  doc.rect(0, 0, 210, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("HisaabKitab - Business Ledger Statement", 14, 16);

  // Business Details & Period
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.text(business.name, 14, 34);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Business Type: ${business.type.toUpperCase()} | Currency: ${business.currency} | Generated: ${new Date().toLocaleString("en-IN")}`,
    14,
    40
  );
  doc.text(
    `Statement Period: ${periodLabel} ${startDate && endDate ? `(${startDate} to ${endDate})` : ""}`,
    14,
    45
  );

  // Financial summary metrics
  let totalIncome = 0;
  let totalExpense = 0;

  const rows = transactions.map((tx) => {
    const isIncome = tx.type === "income";
    if (isIncome) totalIncome += tx.amount;
    else totalExpense += tx.amount;

    const cat = catMap.get(tx.categoryId);
    return [
      formatDateDisplay(tx.dateKey),
      tx.partyName || "-",
      cat?.name || "General",
      tx.paymentMode.toUpperCase(),
      isIncome ? `+₹${paiseToRupee(tx.amount).toLocaleString("en-IN")}` : "-",
      !isIncome ? `-₹${paiseToRupee(tx.amount).toLocaleString("en-IN")}` : "-",
      tx.note || "-",
    ];
  });

  const netBalance = totalIncome - totalExpense;

  // Render Summary Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 50, 182, 16, 3, 3, "FD");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text(`Total Income: ₹${paiseToRupee(totalIncome).toLocaleString("en-IN")}`, 20, 60);

  doc.setTextColor(239, 68, 68);
  doc.text(`Total Expense: ₹${paiseToRupee(totalExpense).toLocaleString("en-IN")}`, 80, 60);

  doc.setTextColor(netBalance >= 0 ? 16 : 239, netBalance >= 0 ? 185 : 68, netBalance >= 0 ? 129 : 68);
  doc.text(`Net Balance: ₹${paiseToRupee(netBalance).toLocaleString("en-IN")}`, 140, 60);

  // Render Transactions Table using jspdf-autotable
  autoTable(doc, {
    startY: 72,
    head: [["Date", "Party / Description", "Category", "Mode", "Income (+)", "Expense (-)", "Remarks"]],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    foot: [
      [
        "Total",
        "",
        "",
        "",
        `+₹${paiseToRupee(totalIncome).toLocaleString("en-IN")}`,
        `-₹${paiseToRupee(totalExpense).toLocaleString("en-IN")}`,
        `Net: ₹${paiseToRupee(netBalance).toLocaleString("en-IN")}`,
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 8,
    },
  });

  // Save the PDF
  const filename = `${business.name.replace(/\s+/g, "_")}_Ledger_${startDate || "all"}.pdf`;
  doc.save(filename);
}

/**
 * Generates and downloads an Excel spreadsheet (.xlsx) using SheetJS.
 */
export function exportToExcel({
  business,
  transactions,
  categories,
  startDate,
  endDate,
  periodLabel = "Selected Period",
}: ExportDataParams) {
  const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  let totalIncome = 0;
  let totalExpense = 0;

  const dataRows = transactions.map((tx) => {
    const isIncome = tx.type === "income";
    if (isIncome) totalIncome += tx.amount;
    else totalExpense += tx.amount;

    return {
      Date: tx.dateKey,
      "Customer / Supplier": tx.partyName || "",
      Category: catMap.get(tx.categoryId)?.name || "",
      Type: isIncome ? "Income" : "Expense",
      "Payment Mode": tx.paymentMode.toUpperCase(),
      "Amount (Rupees)": paiseToRupee(tx.amount),
      Remarks: tx.note || "",
    };
  });

  // Append Totals row
  dataRows.push({
    Date: "TOTALS",
    "Customer / Supplier": "",
    Category: "",
    Type: "",
    "Payment Mode": `Net: ₹${paiseToRupee(totalIncome - totalExpense)}`,
    "Amount (Rupees)": paiseToRupee(totalIncome - totalExpense),
    Remarks: `Total Income: ₹${paiseToRupee(totalIncome)} | Total Expense: ₹${paiseToRupee(totalExpense)}`,
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Records");

  const filename = `${business.name.replace(/\s+/g, "_")}_Ledger_${startDate || "all"}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Formats a clean WhatsApp message and triggers either navigator.share or wa.me URL.
 */
export async function shareToWhatsApp({
  business,
  transactions,
  categories,
  periodLabel = "Today",
  partyFilter,
}: {
  business: Business;
  transactions: Transaction[];
  categories: Category[];
  periodLabel?: string;
  partyFilter?: string;
}) {
  const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === "income") totalIncome += tx.amount;
    else totalExpense += tx.amount;
  });

  const netBalance = totalIncome - totalExpense;

  // Build message
  let message = `📊 *${business.name} - Daily Hisaab*\n`;
  message += `🗓 Period: ${periodLabel}\n`;
  if (partyFilter) {
    message += `👤 Ledger for: *${partyFilter}*\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🟢 Total Income: *₹${paiseToRupee(totalIncome).toLocaleString("en-IN")}*\n`;
  message += `🔴 Total Expense: *₹${paiseToRupee(totalExpense).toLocaleString("en-IN")}*\n`;
  message += `💰 Net Balance: *${netBalance >= 0 ? "+" : ""}₹${paiseToRupee(netBalance).toLocaleString("en-IN")}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;

  // Include recent entries
  const previewTx = transactions.slice(0, 8);
  if (previewTx.length > 0) {
    message += `*Recent Records:*\n`;
    previewTx.forEach((tx) => {
      const isInc = tx.type === "income";
      const cat = catMap.get(tx.categoryId)?.name || "General";
      const sign = isInc ? "🟢 +" : "🔴 -";
      message += `${sign}₹${paiseToRupee(tx.amount)} (${cat}${tx.partyName ? ` - ${tx.partyName}` : ""})\n`;
    });
    if (transactions.length > 8) {
      message += `_...and ${transactions.length - 8} more entries._\n`;
    }
  }

  message += `\n_Recorded via HisaabKitab SaaS_ 🚀`;

  // Web Share API fallback to wa.me
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: `${business.name} - Ledger`,
        text: message,
      });
      return;
    } catch {
      // If user cancelled or not supported, fallback to window.open
    }
  }

  const encoded = encodeURIComponent(message);
  window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
}
