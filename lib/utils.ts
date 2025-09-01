import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}

export function numberToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  function convertHundreds(num: number): string {
    let result = '';
    
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      result += teens[num - 10] + ' ';
      return result;
    }
    
    if (num > 0) {
      result += ones[num] + ' ';
    }
    
    return result;
  }

  if (amount === 0) return 'Zero Rupees Only';
  
  let rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let result = '';
  
  if (rupees >= 10000000) {
    result += convertHundreds(Math.floor(rupees / 10000000)) + 'Crore ';
    rupees %= 10000000;
  }
  
  if (rupees >= 100000) {
    result += convertHundreds(Math.floor(rupees / 100000)) + 'Lakh ';
    rupees %= 100000;
  }
  
  if (rupees >= 1000) {
    result += convertHundreds(Math.floor(rupees / 1000)) + 'Thousand ';
    rupees %= 1000;
  }
  
  if (rupees > 0) {
    result += convertHundreds(rupees);
  }
  
  result += 'Rupees ';
  
  if (paise > 0) {
    result += 'and ' + convertHundreds(paise) + 'Paise ';
  }
  
  result += 'Only';
  
  return result.replace(/\s+/g, ' ').trim();
}

export function getStateCodeFromGSTIN(gstin: string): string {
  if (!gstin || gstin.length < 2) return '';
  
  const stateCode = gstin.substring(0, 2);
  const stateCodes: { [key: string]: string } = {
    '01': 'Jammu and Kashmir',
    '02': 'Himachal Pradesh', 
    '03': 'Punjab',
    '04': 'Chandigarh',
    '05': 'Uttarakhand',
    '06': 'Haryana',
    '07': 'Delhi',
    '08': 'Rajasthan',
    '09': 'Uttar Pradesh',
    '10': 'Bihar',
    '11': 'Sikkim',
    '12': 'Arunachal Pradesh',
    '13': 'Nagaland',
    '14': 'Manipur',
    '15': 'Mizoram',
    '16': 'Tripura',
    '17': 'Meghalaya',
    '18': 'Assam',
    '19': 'West Bengal',
    '20': 'Jharkhand',
    '21': 'Odisha',
    '22': 'Chhattisgarh',
    '23': 'Madhya Pradesh',
    '24': 'Gujarat',
    '25': 'Daman and Diu',
    '26': 'Dadra and Nagar Haveli',
    '27': 'Maharashtra',
    '28': 'Andhra Pradesh',
    '29': 'Karnataka',
    '30': 'Goa',
    '31': 'Lakshadweep',
    '32': 'Kerala',
    '33': 'Tamil Nadu',
    '34': 'Puducherry',
    '35': 'Andaman and Nicobar Islands',
    '36': 'Telangana',
    '37': 'Andhra Pradesh'
  };
  
  return stateCodes[stateCode] || '';
}

export function calculateGST(
  amount: number,
  taxRate: number,
  fromState: string,
  toState: string
) {
  const taxAmount = (amount * taxRate) / 100;
  
  if (fromState === toState) {
    // Intra-state: CGST + SGST
    return {
      cgst: taxAmount / 2,
      sgst: taxAmount / 2,
      igst: 0,
      total: taxAmount
    };
  } else {
    // Inter-state: IGST
    return {
      cgst: 0,
      sgst: 0,
      igst: taxAmount,
      total: taxAmount
    };
  }
}

export function generateInvoiceNumber(year: number, counter: number): string {
  return `INV/${(year % 100).toString().padStart(2, '0')}-${((year + 1) % 100).toString().padStart(2, '0')}/${counter.toString().padStart(6, '0')}`;
}