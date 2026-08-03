(function () {
  function normalizeValue(value) {
    if (value === null || value === undefined) {
      return "";
    }

    if (Array.isArray(value)) {
      return value.join("; ");
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  }

  function escapeCSVValue(value) {
    const normalizedValue = normalizeValue(value);

    if (/[",\r\n;]/.test(normalizedValue)) {
      return `"${normalizedValue.replace(/"/g, '""')}"`;
    }

    return normalizedValue;
  }

  function buildCSV(columns, rows) {
    const header = columns.map((column) => escapeCSVValue(column.label)).join(";");
    const body = rows.map((row) =>
      columns
        .map((column) => {
          const value =
            typeof column.value === "function"
              ? column.value(row)
              : row[column.value];

          return escapeCSVValue(value);
        })
        .join(";"),
    );

    return [header, ...body].join("\r\n");
  }

  function buildRows(columns, rows) {
    return [
      columns.map((column) => column.label),
      ...rows.map((row) =>
        columns.map((column) =>
          typeof column.value === "function"
            ? column.value(row)
            : row[column.value],
        ),
      ),
    ];
  }

  function getTimestamp() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");

    return [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
      pad(now.getHours()),
      pad(now.getMinutes()),
    ].join("");
  }

  function downloadCSV(filename, columns, rows) {
    downloadCSVRows(filename, buildRows(columns, rows));
  }

  function downloadCSVRows(filename, rows) {
    const csv = `\ufeff${rows.map((row) => row.map(escapeCSVValue).join(";")).join("\r\n")}`;
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${filename}-${getTimestamp()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function getCellStyle(type) {
    const border = {
      bottom: { style: "thin", color: { rgb: "D9E2EC" } },
      left: { style: "thin", color: { rgb: "D9E2EC" } },
      right: { style: "thin", color: { rgb: "D9E2EC" } },
      top: { style: "thin", color: { rgb: "D9E2EC" } },
    };

    if (type === "header") {
      return {
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border,
        fill: { fgColor: { rgb: "8E7AB5" } },
        font: { bold: true, color: { rgb: "FFFFFF" } },
      };
    }

    if (type === "total") {
      return {
        alignment: { vertical: "center", wrapText: true },
        border,
        fill: { fgColor: { rgb: "F3EFFA" } },
        font: { bold: true },
      };
    }

    if (type === "danger") {
      return {
        alignment: { vertical: "center", wrapText: true },
        border,
        fill: { fgColor: { rgb: "FDECEC" } },
        font: { bold: true, color: { rgb: "8C2323" } },
      };
    }

    if (type === "warning") {
      return {
        alignment: { vertical: "center", wrapText: true },
        border,
        fill: { fgColor: { rgb: "FFF7E0" } },
        font: { color: { rgb: "755000" } },
      };
    }

    return {
      alignment: { vertical: "center", wrapText: true },
      border,
      fill: { fgColor: { rgb: "FFFFFF" } },
    };
  }

  function getColumnWidths(rows) {
    return (rows[0] || []).map((_, columnIndex) => {
      const maxLength = rows.reduce((max, row) => {
        const value = normalizeValue(row[columnIndex]);
        return Math.max(max, value.length);
      }, 0);

      return { wch: Math.min(Math.max(maxLength + 2, 12), 38) };
    });
  }

  function styleWorksheet(worksheet, rows, xlsx, options = {}) {
    const range = xlsx.utils.decode_range(worksheet["!ref"]);
    const headerStyle = getCellStyle("header");
    const bodyStyle = getCellStyle("body");
    const dangerStyle = getCellStyle("danger");
    const totalStyle = getCellStyle("total");
    const warningStyle = getCellStyle("warning");

    for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex += 1) {
      const rowValues = rows[rowIndex] || [];
      const isTotalRow = rowValues.some(
        (value) => normalizeValue(value) === "Total esperado geral",
      );
      const customRowType =
        rowIndex > 0 && typeof options.getRowType === "function"
          ? options.getRowType(rowValues, rowIndex - 1)
          : "";
      const configuredRowType = options.rowTypes?.[rowIndex] || "";

      for (
        let columnIndex = range.s.c;
        columnIndex <= range.e.c;
        columnIndex += 1
      ) {
        const cellAddress = xlsx.utils.encode_cell({
          c: columnIndex,
          r: rowIndex,
        });

        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = { t: "s", v: "" };
        }

        const rowType =
          configuredRowType ||
          (rowIndex === 0
            ? "header"
            : isTotalRow
              ? "total"
              : customRowType);

        worksheet[cellAddress].s =
          rowType === "header"
            ? headerStyle
            : rowType === "total"
              ? totalStyle
              : rowType === "danger"
                ? dangerStyle
                : rowType === "warning"
                  ? warningStyle
                  : bodyStyle;
      }
    }

    if (options.autoFilter !== false) {
      worksheet["!autofilter"] = {
        ref: options.autoFilterRange || xlsx.utils.encode_range(range),
      };
    }

    worksheet["!cols"] = getColumnWidths(rows);
  }

  function downloadXLSXWorkbook(filename, sheets) {
    if (!window.XLSX) {
      return false;
    }

    const xlsx = window.XLSX;
    const workbook = xlsx.utils.book_new();

    sheets.forEach(({ sheetName, rows, merges = [], options = {} }) => {
      const worksheet = xlsx.utils.aoa_to_sheet(rows);

      styleWorksheet(worksheet, rows, xlsx, options);

      if (merges.length) {
        worksheet["!merges"] = merges;
      }

      xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    xlsx.writeFile(workbook, `${filename}-${getTimestamp()}.xlsx`);

    return true;
  }

  function downloadXLSX(filename, sheetName, rows, merges = [], options = {}) {
    return downloadXLSXWorkbook(filename, [
      { merges, options, rows, sheetName },
    ]);
  }

  function formatGeneratedAt(date = new Date()) {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  }

  function createPDFDocument({
    columns,
    getBodyRow,
    getRowStyle,
    orientation = "landscape",
    rows,
    summary = "",
    subtitle = "",
    title,
  }) {
    const JsPDF = window.jspdf?.jsPDF;

    if (!JsPDF) {
      return null;
    }

    const documentPdf = new JsPDF({
      format: "a4",
      orientation,
      unit: "pt",
    });

    if (typeof documentPdf.autoTable !== "function") {
      return null;
    }

    const pageWidth = documentPdf.internal.pageSize.getWidth();
    const pageHeight = documentPdf.internal.pageSize.getHeight();
    const generatedAt = `Gerado em ${formatGeneratedAt()}`;
    const head = [columns.map((column) => column.label)];
    const body = rows.map((row, rowIndex) => {
      const customBodyRow =
        typeof getBodyRow === "function"
          ? getBodyRow(row, rowIndex, columns)
          : null;

      if (customBodyRow) {
        return customBodyRow;
      }

      const rowStyle =
        typeof getRowStyle === "function" ? getRowStyle(row, rowIndex) : null;

      return columns.map((column) => {
        const value =
          typeof column.value === "function"
            ? column.value(row)
            : row[column.value];
        const content = normalizeValue(value);

        return rowStyle ? { content, styles: rowStyle } : content;
      });
    });

    const summaryLines = Array.isArray(summary)
      ? summary.filter(Boolean)
      : summary
        ? [summary]
        : [];
    const headerLineY = summaryLines.length
      ? 70 + (summaryLines.length - 1) * 10
      : 57;
    const tableTopMargin = headerLineY + 12;

    function drawHeader() {
      documentPdf.setTextColor(78, 59, 104);
      documentPdf.setFont("helvetica", "bold");
      documentPdf.setFontSize(15);
      documentPdf.text(title, 36, 32);
      documentPdf.setFont("helvetica", "normal");
      documentPdf.setFontSize(8);
      documentPdf.setTextColor(90, 90, 90);

      if (subtitle) {
        documentPdf.text(subtitle, 36, 47);
      }

      if (summaryLines.length) {
        documentPdf.setFont("helvetica", "bold");
        summaryLines.forEach((summaryLine, index) => {
          documentPdf.text(summaryLine, 36, 60 + index * 10);
        });
        documentPdf.setFont("helvetica", "normal");
      }

      documentPdf.text(generatedAt, pageWidth - 36, 32, { align: "right" });
      documentPdf.setDrawColor(142, 122, 181);
      documentPdf.line(36, headerLineY, pageWidth - 36, headerLineY);
    }

    documentPdf.autoTable({
      body,
      head,
      headStyles: {
        fillColor: [142, 122, 181],
        fontStyle: "bold",
        halign: "center",
        textColor: [255, 255, 255],
      },
      margin: { bottom: 34, left: 36, right: 36, top: tableTopMargin },
      showHead: "everyPage",
      styles: {
        cellPadding: 4,
        font: "helvetica",
        fontSize: 7.5,
        lineColor: [217, 226, 236],
        lineWidth: 0.5,
        overflow: "linebreak",
        textColor: [35, 35, 35],
        valign: "middle",
      },
      tableLineColor: [217, 226, 236],
      tableLineWidth: 0.5,
      theme: "grid",
      willDrawPage: drawHeader,
    });

    const pageCount = documentPdf.internal.getNumberOfPages();

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      documentPdf.setPage(pageNumber);
      documentPdf.setFont("helvetica", "normal");
      documentPdf.setFontSize(8);
      documentPdf.setTextColor(100, 100, 100);
      documentPdf.text(
        `Página ${pageNumber} de ${pageCount}`,
        pageWidth - 36,
        pageHeight - 16,
        { align: "right" },
      );
    }

    return documentPdf;
  }

  function downloadPDF(filename, options) {
    const documentPdf = createPDFDocument(options);

    if (!documentPdf) {
      return false;
    }

    documentPdf.save(`${filename}-${getTimestamp()}.pdf`);
    return true;
  }

  window.AdminExport = {
    buildRows,
    createPDFDocument,
    downloadCSV,
    downloadCSVRows,
    downloadPDF,
    downloadXLSX,
    downloadXLSXWorkbook,
  };
})();
