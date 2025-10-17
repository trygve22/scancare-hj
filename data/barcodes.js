// Simple demo mapping from barcode values to product names.
// In a real app, this would come from a backend or an open product DB.
export const barcodeToProductName = {
  // EAN-13 style examples (fictional/demo codes)
  '5901234123457': 'CeraVe Moisturizing Cream',
  '4005808812345': 'Nivea Soft Moisturizing Cream',
  '737628064502': 'La Roche-Posay Toleriane Double Repair Face Moisturizer',
  '036000291452': 'Neutrogena Hydro Boost Water Gel',
  '8809647391234': 'Cosrx Advanced Snail 92 All in One Cream',
  // UPC-A/E examples
  '012345678905': 'Cetaphil Moisturizing Cream',
};

export function resolveProductByBarcode(barcode, sections) {
  const name = barcodeToProductName[String(barcode)] || null;
  if (!name) return null;
  // Find the matching product and its category from sections
  for (const section of sections || []) {
    const hit = (section.data || []).find((p) => p.toLowerCase() === name.toLowerCase());
    if (hit) {
      return { name: hit, category: section.title, id: `${section.title}-${hit}` };
    }
  }
  // If not found in sections, still return a basic object
  return { name, category: 'Ukendt kategori', id: `unknown-${name}` };
}
