import { supabase } from "@/integrations/supabase/client";
import { parseExcelFile, ExcelData } from "./parseExcel";

export async function importDataFromExcel(userId: string): Promise<void> {
  try {
    // Parse the Excel file
    const data = await parseExcelFile('/temp-data.xlsx');
    
    // Clear existing data for the user
    await clearUserData(userId);
    
    // Import new data
    await importReceitas(data.receitas, userId);
    await importDespesas(data.despesas, userId);
    await importDividas(data.dividas, userId);
    
    console.log('Data imported successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
}

async function clearUserData(userId: string) {
  // Delete all existing data for this user
  await supabase.from('receitas').delete().eq('user_id', userId);
  await supabase.from('despesas').delete().eq('user_id', userId);
  await supabase.from('dividas').delete().eq('user_id', userId);
}

async function importReceitas(receitas: ExcelData['receitas'], userId: string) {
  if (receitas.length === 0) return;
  
  const { error } = await supabase
    .from('receitas')
    .insert(receitas.map(receita => ({
      ...receita,
      user_id: userId
    })));
    
  if (error) {
    console.error('Error importing receitas:', error);
    throw error;
  }
}

async function importDespesas(despesas: ExcelData['despesas'], userId: string) {
  if (despesas.length === 0) return;
  
  const { error } = await supabase
    .from('despesas')
    .insert(despesas.map(despesa => ({
      ...despesa,
      user_id: userId
    })));
    
  if (error) {
    console.error('Error importing despesas:', error);
    throw error;
  }
}

async function importDividas(dividas: ExcelData['dividas'], userId: string) {
  if (dividas.length === 0) return;
  
  const { error } = await supabase
    .from('dividas')
    .insert(dividas.map(divida => ({
      ...divida,
      user_id: userId
    })));
    
  if (error) {
    console.error('Error importing dividas:', error);
    throw error;
  }
}