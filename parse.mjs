import * as xlsx from 'xlsx';
import path from 'path';

const filePath = path.join(process.cwd(), 'products', 'Price List.xlsx');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

console.log(JSON.stringify(data, null, 2));
