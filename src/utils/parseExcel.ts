import * as XLSX from 'xlsx';

export interface ExcelData {
  receitas: Array<{
    descricao: string;
    categoria: string;
    valor: number;
    data_recebimento: string;
    mes_referencia: string;
    observacoes?: string;
  }>;
  despesas: Array<{
    descricao: string;
    categoria: string;
    valor: number;
    data_pagamento: string;
    mes_referencia: string;
    observacoes?: string;
  }>;
  dividas: Array<{
    descricao: string;
    categoria?: string;
    valor_total: number;
    valor_pago: number;
    valor_restante: number;
    data_vencimento?: string;
    status: string;
    observacoes?: string;
  }>;
}

export async function parseExcelFile(filePath: string): Promise<ExcelData> {
  const response = await fetch(filePath);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  const result: ExcelData = {
    receitas: [],
    despesas: [],
    dividas: []
  };

  // Parse each sheet
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    if (jsonData.length < 2) return; // Skip empty sheets
    
    const headers = jsonData[0] as string[];
    const rows = jsonData.slice(1);
    
    // Detect sheet type based on name or headers
    const lowerSheetName = sheetName.toLowerCase();
    
    if (lowerSheetName.includes('receita') || headers.some(h => h && h.toString().toLowerCase().includes('receita'))) {
      // Parse receitas
      rows.forEach((row: any[]) => {
        if (row.length > 0 && row[0]) {
          const receita = {
            descricao: row[0]?.toString() || '',
            categoria: row[1]?.toString() || 'Outros',
            valor: parseFloat(row[2]?.toString().replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            data_recebimento: formatDate(row[3]) || new Date().toISOString().split('T')[0],
            mes_referencia: row[4]?.toString() || new Date().toISOString().slice(0, 7),
            observacoes: row[5]?.toString() || null
          };
          if (receita.valor > 0) result.receitas.push(receita);
        }
      });
    } else if (lowerSheetName.includes('despesa') || headers.some(h => h && h.toString().toLowerCase().includes('despesa'))) {
      // Parse despesas
      rows.forEach((row: any[]) => {
        if (row.length > 0 && row[0]) {
          const despesa = {
            descricao: row[0]?.toString() || '',
            categoria: row[1]?.toString() || 'Outros',
            valor: parseFloat(row[2]?.toString().replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            data_pagamento: formatDate(row[3]) || new Date().toISOString().split('T')[0],
            mes_referencia: row[4]?.toString() || new Date().toISOString().slice(0, 7),
            observacoes: row[5]?.toString() || null
          };
          if (despesa.valor > 0) result.despesas.push(despesa);
        }
      });
    } else if (lowerSheetName.includes('divida') || headers.some(h => h && h.toString().toLowerCase().includes('divida'))) {
      // Parse dividas
      rows.forEach((row: any[]) => {
        if (row.length > 0 && row[0]) {
          const valorTotal = parseFloat(row[2]?.toString().replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
          const valorPago = parseFloat(row[3]?.toString().replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
          
          const divida = {
            descricao: row[0]?.toString() || '',
            categoria: row[1]?.toString() || null,
            valor_total: valorTotal,
            valor_pago: valorPago,
            valor_restante: valorTotal - valorPago,
            data_vencimento: formatDate(row[4]) || null,
            status: valorPago >= valorTotal ? 'pago' : 'pendente',
            observacoes: row[5]?.toString() || null
          };
          if (divida.valor_total > 0) result.dividas.push(divida);
        }
      });
    }
  });

  return result;
}

function formatDate(dateValue: any): string | null {
  if (!dateValue) return null;
  
  try {
    // If it's already a string in YYYY-MM-DD format
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue;
    }
    
    // If it's an Excel date number
    if (typeof dateValue === 'number') {
      const date = XLSX.SSF.parse_date_code(dateValue);
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }
    
    // Try to parse as date string
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error('Error parsing date:', dateValue, error);
  }
  
  return null;
}