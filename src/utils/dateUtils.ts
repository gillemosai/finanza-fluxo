/**
 * Converte uma data para o formato abreviado de mês/ano
 * Ex: "2025-09-20" -> "SET/25"
 */
export const formatDateToMonthRef = (dateString: string): string => {
  if (!dateString) return '';
  
  // Parse the date string correctly to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month - 1 because months are 0-indexed
  
  const monthIndex = date.getMonth();
  const yearShort = date.getFullYear().toString().slice(-2);
  
  const monthAbbreviations = [
    'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
    'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
  ];
  
  const result = `${monthAbbreviations[monthIndex]}/${yearShort}`;
  
  return result;
};

/**
 * Converte um formato de mês/ano abreviado para uma data
 * Ex: "SET/25" -> nova data do primeiro dia do mês
 */
export const parseMonthRefToDate = (monthRef: string): string => {
  if (!monthRef || !monthRef.includes('/')) return '';
  
  const [monthAbbr, year] = monthRef.split('/');
  const fullYear = parseInt(year) + 2000;
  
  const monthAbbreviations = [
    'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
    'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
  ];
  
  const monthIndex = monthAbbreviations.indexOf(monthAbbr.toUpperCase());
  if (monthIndex === -1) return '';
  
  return `${fullYear}-${String(monthIndex + 1).padStart(2, '0')}-01`;
};