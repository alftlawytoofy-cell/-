import { Employee, SalaryRecord, GenericRecord } from '../types';

// URLs provided in the files
const URLS = {
  ADMIN: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTji7xqDlsIEqmdqSFJnunFov95noGe4OcaSVoBkzTl1uPWTevB2lRU1oMmDCD4hvkjzOgf5d6Vve7x/pub?output=csv',
  CURRENT_SALARY: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRTsXbqGO6bjMlqDv9mIj79NqaN48VrYAxJcfapTqnYbyTyBPXkhz22YsKKH2fDeQfDuHfkZl2BmCrG/pub?gid=666661995&single=true&output=csv',
  ARCHIVE_SALARY: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRTsXbqGO6bjMlqDv9mIj79NqaN48VrYAxJcfapTqnYbyTyBPXkhz22YsKKH2fDeQfDuHfkZl2BmCrG/pub?gid=1417662678&single=true&output=csv',
  BONUS: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRTsXbqGO6bjMlqDv9mIj79NqaN48VrYAxJcfapTqnYbyTyBPXkhz22YsKKH2fDeQfDuHfkZl2BmCrG/pub?gid=1629531206&single=true&output=csv',
  DISPATCHES: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRTsXbqGO6bjMlqDv9mIj79NqaN48VrYAxJcfapTqnYbyTyBPXkhz22YsKKH2fDeQfDuHfkZl2BmCrG/pub?gid=1862138881&single=true&output=csv',
  EXTRA_HOURS: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRTsXbqGO6bjMlqDv9mIj79NqaN48VrYAxJcfapTqnYbyTyBPXkhz22YsKKH2fDeQfDuHfkZl2BmCrG/pub?gid=604832310&single=true&output=csv'
};

// CSV Parser Helper
const parseCSV = (text: string) => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // Skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      if (char === '\r') i++; // Skip \n
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentRow.length > 0 || currentCell !== '') {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows;
};

const findAmountIndex = (headerRow: string[]) => {
  const possibleNames = ['مبلغ', 'قيمة', 'إجمالي', 'مكافأة', 'إيفاد', 'ساعات إضافية', 'القيمة', 'الإضافي'];
  for (const name of possibleNames) {
    const index = headerRow.findIndex(h => h.includes(name));
    if (index !== -1) return index;
  }
  return -1;
};

// Fetch and Parse Functions
export const fetchEmployeeData = async (employeeId: string): Promise<Employee> => {
  const uniqueParam = `&_t=${Date.now()}`;
  const requestOptions: RequestInit = {
    method: 'GET',
    cache: 'no-store'
  };

  const responses = await Promise.all([
    fetch(URLS.ADMIN + uniqueParam, requestOptions),
    fetch(URLS.CURRENT_SALARY + uniqueParam, requestOptions),
    fetch(URLS.ARCHIVE_SALARY + uniqueParam, requestOptions),
    fetch(URLS.BONUS + uniqueParam, requestOptions),
    fetch(URLS.DISPATCHES + uniqueParam, requestOptions),
    fetch(URLS.EXTRA_HOURS + uniqueParam, requestOptions)
  ]);

  for (const res of responses) {
    if (!res.ok) throw new Error(`فشل الاتصال بالخادم: ${res.status}`);
  }

  const texts = await Promise.all(responses.map(res => res.text()));
  
  const [adminCsv, currentSalaryCsv, archiveSalaryCsv, bonusCsv, dispatchesCsv, extraHoursCsv] = texts;

  // 1. Parse Admin Data
  const adminRows = parseCSV(adminCsv);
  if (adminRows.length < 2) {
    throw new Error('بيانات الإدارة فارغة');
  }
  
  const adminHeader = adminRows[0];
  const adminIdIndex = adminHeader.findIndex(h => h.includes('الرقم الوظيفي') || h.includes('ID'));
  
  const adminData = adminRows.slice(1).find(row => row[adminIdIndex !== -1 ? adminIdIndex : 0] === employeeId);

  if (!adminData && !employeeId) {
    throw new Error('الرقم الوظيفي غير موجود');
  }

  if (!adminData) {
     throw new Error('لم يتم العثور على البيانات الإدارية لهذا الموظف');
  }

  // Helper to find index by keywords
  const findCol = (keywords: string[]) => {
    const idx = adminHeader.findIndex(h => keywords.some(kw => h.includes(kw)));
    return idx !== -1 ? adminData[idx] : '';
  };

  const administrativeProfile = {
    p_id: adminData[adminIdIndex !== -1 ? adminIdIndex : 0] || '',
    p_name: findCol(['الاسم', 'اسم الموظف', 'Name']) || adminData[1] || '',
    p_education: findCol(['التحصيل', 'الشهادة', 'Education']) || adminData[2] || '',
    p_job: findCol(['العنوان الوظيفي', 'الوظيفة', 'Job']) || adminData[3] || '', 
    p_grade: findCol(['الدرجة', 'Grade']) || adminData[4] || '',
    p_stage: findCol(['المرحلة', 'Stage']) || adminData[5] || '',
    p_salary: findCol(['الراتب الاسمي', 'الراتب', 'Salary']) || adminData[6] || '',
    p_promo_date: findCol(['تاريخ العلاوة', 'تاريخ الترفيع', 'Promotion Date']) || adminData[7] || '',
    p_last_bonus: findCol(['اخر مكافأة', 'المكافأة', 'Last Bonus']) || adminData[8] || '',
    p_due_pre: findCol(['الاستحقاق السابق', 'Due Pre']) || adminData[9] || '',
    p_thanks: findCol(['كتب الشكر', 'الشكر', 'Thanks']) || adminData[10] || '',
    p_due_post: findCol(['الاستحقاق القادم', 'Due Post']) || adminData[11] || '',
    p_join_date: findCol(['تاريخ المباشرة', 'تاريخ التعيين', 'Join Date']) || adminData[12] || '',
    p_promo_status: findCol(['حالة الترفيع', 'Promotion Status']) || adminData[13] || '',
    p_rollover: findCol(['المدور', 'Rollover']) || adminData[14] || '',
    p_annual_leave: findCol(['الاجازات الاعتيادية', 'الاعتيادية', 'Annual Leave']) || adminData[16] || '0', 
    p_sick_leave: findCol(['الاجازات المرضية', 'المرضية', 'Sick Leave']) || adminData[17] || '0',   
    p_img: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(findCol(['الاسم', 'اسم الموظف', 'Name']) || adminData[1] || 'User') + '&background=random',
    p_job_title: findCol(['العنوان الوظيفي', 'الوظيفة', 'Job']) || adminData[3] || ''
  };

  // 2. Parse Salary Data
  const parseSalarySheet = (csv: string) => {
    const rows = parseCSV(csv);
    if (rows.length < 2) return [];
    
    const header = rows[0];
    const idIndex = header.findIndex(h => ['الرقم الوظيفي', 'ID', 'Employee ID', 'رقم الموظف'].some(k => h.includes(k)));
    const netSalaryIndex = header.findIndex(h => ['صافي الراتب', 'Net Salary', 'الصافي', 'المبلغ الصافي'].some(k => h.includes(k)));
    const dateIndex = header.findIndex(h => ['التاريخ', 'Date', 'Time', 'الشهر', 'السنة'].some(k => h.includes(k)));
    
    if (idIndex === -1) return [];

    return rows.slice(1)
      .filter(row => row[idIndex] === employeeId)
      .map(row => {
        const details: { label: string; value: string }[] = [];
        header.forEach((h, idx) => {
          if (idx !== idIndex && idx !== dateIndex && row[idx] && row[idx] !== '0' && h.trim() !== '') {
            details.push({ label: h, value: row[idx] });
          }
        });

        const dateStr = dateIndex !== -1 ? row[dateIndex] : '';
        let month = 'الحالي';
        let year = new Date().getFullYear().toString();
        
        if (dateStr) {
            const match = dateStr.match(/(\d{4})[/-](\d{1,2})/);
            if (match) {
                year = match[1];
                const mIndex = parseInt(match[2]) - 1;
                month = new Date(parseInt(year), mIndex).toLocaleString('ar-IQ', { month: 'long' });
            }
        }

        return {
          month,
          year,
          net_salary: netSalaryIndex !== -1 ? row[netSalaryIndex] : '0',
          details,
          raw_date: dateStr
        };
      });
  };

  const currentSalaries = parseSalarySheet(currentSalaryCsv);
  const archiveSalaries = parseSalarySheet(archiveSalaryCsv);
  
  const salary_history = [...currentSalaries, ...archiveSalaries].sort((a, b) => {
     if (a.raw_date && b.raw_date) return a.raw_date > b.raw_date ? -1 : 1;
     return 0;
  });

  // 3. Parse Sub-sheets (Bonus, Dispatch, Extra) with improved Date detection
  const parseGenericSheet = (csv: string): GenericRecord[] => {
    const rows = parseCSV(csv);
    if (rows.length < 2) return [];
    
    const header = rows[0];
    const idIndex = header.findIndex(h => ['الرقم الوظيفي', 'ID', 'Employee ID', 'رقم الموظف'].some(k => h.includes(k)));
    const amountIndex = findAmountIndex(header);
    
    // Improved logic for Date and Name columns
    const nameIndex = header.findIndex(h => 
      ['اسم', 'عنوان', 'السبب', 'نوع', 'البيان', 'تفاصيل', 'ملاحظات', 'Name', 'Title', 'Reason', 'Details', 'Note'].some(k => h.includes(k))
    ); 
    
    const dateIndex = header.findIndex(h => 
      ['تاريخ', 'Date', 'date', 'وقت', 'شهر', 'سنة', 'عام', 'Year', 'Month', 'time'].some(k => h.includes(k))
    );

    if (idIndex === -1) return [];

    return rows.slice(1)
      .filter(row => row[idIndex] === employeeId)
      .map(row => {
        const amountStr = amountIndex !== -1 ? row[amountIndex] : '0';
        const amount = parseFloat(amountStr.replace(/[^\d.-]/g, '')) || 0;
        
        const name = nameIndex !== -1 ? row[nameIndex] : (header[amountIndex] || 'Record');
        
        // Extract raw date
        let dateStr = dateIndex !== -1 ? row[dateIndex] : undefined;
        
        // Clean date if it exists
        if (dateStr) {
            dateStr = dateStr.split(' ')[0]; // Remove time if present
        }

        return { name, amount, date: dateStr };
      })
      .filter(r => r.amount > 0); // Keep all positive records, removed arbitrary date filtering for now
  };

  return {
    ...administrativeProfile,
    salary_history,
    bonuses: parseGenericSheet(bonusCsv),
    dispatches: parseGenericSheet(dispatchesCsv),
    extra_hours: parseGenericSheet(extraHoursCsv),
  };
};