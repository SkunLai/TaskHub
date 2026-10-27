export async function downloadTable(filename, table) {
  const { tableXlsx, xlsxMime } = await import("../shared/xlsx.mjs");
  const blob = new Blob([tableXlsx(table)], { type: xlsxMime }),
    url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
