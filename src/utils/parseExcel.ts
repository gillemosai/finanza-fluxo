import * as XLSX from 'xlsx';

// Constantes de segurança
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_RECORDS_PER_SHEET = 1000;
const MAX_STRING_LENGTH = 255;
const MAX_OBSERVACOES_LENGTH = 500;
const MAX_VALOR = 99999999.99;
const MIN_VALOR = 0;

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

// Sanitização de strings
const sanitizeString = (str: unknown, maxLength: number): string => {
  if (str === null || str === undefined) return '';
  const sanitized = String(str)
    .trim()
    .slice(0, maxLength)
    // Remove caracteres de controle potencialmente perigosos
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return sanitized;
};

// Validação e sanitização de valores numéricos
const sanitizeNumber = (value: unknown, min: number = MIN_VALOR, max: number = MAX_VALOR): number => {
  if (value === null || value === undefined) return 0;
  
  const strValue = String(value).replace(/[^\d,.-]/g, '').replace(',', '.');
  const num = parseFloat(strValue);
  
  if (isNaN(num)) return 0;
  return Math.max(min, Math.min(num, max));
};

export async function parseExcelFile(filePath: string): Promise<ExcelData> {
  const response = await fetch(filePath);
  const arrayBuffer = await response.arrayBuffer();
  
  // Validação de tamanho do arquivo
  if (arrayBuffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Arquivo muito grande. Tamanho máximo permitido: ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`);
  }
  
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(arrayBuffer, { type: 'array' });
  } catch (error) {
    throw new Error('Erro ao processar arquivo Excel. Verifique se o arquivo não está corrompido.');
  }
  
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
    
    // Limitar número de registros por planilha
    const limitedRows = rows.slice(0, MAX_RECORDS_PER_SHEET);
    
    // Detect sheet type based on name or headers
    const lowerSheetName = sheetName.toLowerCase();
    
    if (lowerSheetName.includes('receita') || headers.some(h => h && h.toString().toLowerCase().includes('receita'))) {
      // Parse receitas
      limitedRows.forEach((row: unknown[]) => {
        if (Array.isArray(row) && row.length > 0 && row[0]) {
          const receita = {
            descricao: sanitizeString(row[0], MAX_STRING_LENGTH) || 'Sem descrição',
            categoria: sanitizeString(row[1], MAX_STRING_LENGTH) || 'Outros',
            valor: sanitizeNumber(row[2]),
            data_recebimento: formatDate(row[3]) || new Date().toISOString().split('T')[0],
            mes_referencia: sanitizeString(row[4], 7) || new Date().toISOString().slice(0, 7),
            observacoes: sanitizeString(row[5], MAX_OBSERVACOES_LENGTH) || null
          };
          if (receita.valor > 0) result.receitas.push(receita);
        }
      });
    } else if (lowerSheetName.includes('despesa') || headers.some(h => h && h.toString().toLowerCase().includes('despesa'))) {
      // Parse despesas
      limitedRows.forEach((row: unknown[]) => {
        if (Array.isArray(row) && row.length > 0 && row[0]) {
          const despesa = {
            descricao: sanitizeString(row[0], MAX_STRING_LENGTH) || 'Sem descrição',
            categoria: sanitizeString(row[1], MAX_STRING_LENGTH) || 'Outros',
            valor: sanitizeNumber(row[2]),
            data_pagamento: formatDate(row[3]) || new Date().toISOString().split('T')[0],
            mes_referencia: sanitizeString(row[4], 7) || new Date().toISOString().slice(0, 7),
            observacoes: sanitizeString(row[5], MAX_OBSERVACOES_LENGTH) || null
          };
          if (despesa.valor > 0) result.despesas.push(despesa);
        }
      });
    } else if (lowerSheetName.includes('divida') || headers.some(h => h && h.toString().toLowerCase().includes('divida'))) {
      // Parse dividas
      limitedRows.forEach((row: unknown[]) => {
        if (Array.isArray(row) && row.length > 0 && row[0]) {
          const valorTotal = sanitizeNumber(row[2]);
          const valorPago = sanitizeNumber(row[3]);
          
          const divida = {
            descricao: sanitizeString(row[0], MAX_STRING_LENGTH) || 'Sem descrição',
            categoria: sanitizeString(row[1], MAX_STRING_LENGTH) || null,
            valor_total: valorTotal,
            valor_pago: Math.min(valorPago, valorTotal), // Valor pago não pode exceder total
            valor_restante: Math.max(0, valorTotal - valorPago),
            data_vencimento: formatDate(row[4]) || null,
            status: valorPago >= valorTotal ? 'pago' : 'pendente',
            observacoes: sanitizeString(row[5], MAX_OBSERVACOES_LENGTH) || null
          };
          if (divida.valor_total > 0) result.dividas.push(divida);
        }
      });
    }
  });

  // Validação final de limites totais
  const totalRecords = result.receitas.length + result.despesas.length + result.dividas.length;
  if (totalRecords > MAX_RECORDS_PER_SHEET * 3) {
    throw new Error(`Número máximo de registros excedido. Máximo permitido: ${MAX_RECORDS_PER_SHEET * 3}`);
  }

  return result;
}

function formatDate(dateValue: unknown): string | null {
  if (!dateValue) return null;
  
  try {
    // If it's already a string in YYYY-MM-DD format
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue;
    }
    
    // If it's an Excel date number
    if (typeof dateValue === 'number') {
      const date = XLSX.SSF.parse_date_code(dateValue);
      if (date) {
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
    }
    
    // Try to parse as date string
    const date = new Date(String(dateValue));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch {
    // Silently handle date parsing errors
  }
  
  return null;
}
