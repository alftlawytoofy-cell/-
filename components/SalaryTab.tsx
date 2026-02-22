import React, { useState, useMemo } from 'react';
import { Employee } from '../types';
import { 
  Clock, ChevronLeft, MessageCircle,
  Banknote, ShieldCheck, Scale, CreditCard, 
  MinusCircle, PlusCircle, UserCheck, Briefcase, 
  Landmark, BadgePercent, 
  MapPin, Gem, Target, 
  Zap, Receipt, Download, Calendar, ArrowUpRight, Check,
  Bus, Wallet, PieChart
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface SalaryTabProps {
  employee: Employee;
}

// Helper to format date string to "Dayname, DD Month YYYY"
const formatFullDate = (dateStr?: string) => {
  if (!dateStr || dateStr.trim() === '') return 'تاريخ غير متوفر';
  const cleanStr = dateStr.trim();
  
  try {
    // 1. Check for YYYY only (e.g., "2026")
    if (/^\d{4}$/.test(cleanStr)) {
       return `سنة ${cleanStr}`;
    }

    // 2. Check for MM/YYYY or M/YYYY (e.g., "1/2026", "01-2026")
    const myMatch = cleanStr.match(/^(\d{1,2})[\/\-](\d{4})$/);
    if (myMatch) {
       const month = parseInt(myMatch[1]);
       const year = parseInt(myMatch[2]);
       // Validate month
       if (month >= 1 && month <= 12) {
          const d = new Date(year, month - 1);
          return new Intl.DateTimeFormat('ar-IQ', { month: 'long', year: 'numeric' }).format(d);
       }
    }

    let date: Date | null = null;

    // 3. Check for DD/MM/YYYY or DD-MM-YYYY format common in Iraq
    const dmyMatch = cleanStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    
    // 4. Check for YYYY/MM/DD or YYYY-MM-DD
    const ymdMatch = cleanStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);

    if (dmyMatch) {
      date = new Date(parseInt(dmyMatch[3]), parseInt(dmyMatch[2]) - 1, parseInt(dmyMatch[1]));
    } else if (ymdMatch) {
      date = new Date(parseInt(ymdMatch[1]), parseInt(ymdMatch[2]) - 1, parseInt(ymdMatch[3]));
    } else {
      // Fallback to standard parser
      const d = new Date(cleanStr);
      if (!isNaN(d.getTime())) {
        date = d;
      }
    }

    if (date && !isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('ar-IQ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    }
    
    // Return original if all parsing fails but string exists
    return cleanStr;
  } catch (e) {
    return cleanStr;
  }
};

// Helper to get icon and color for salary items
const getDetailMeta = (label: string, isDeduction: boolean) => {
  const l = label.toLowerCase();
  
  if (l.includes('الاسمي')) 
    return { icon: Banknote, color: 'indigo', bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' };
  if (l.includes('هندسية') || l.includes('مهنة') || l.includes('منصب')) 
    return { icon: Briefcase, color: 'blue', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' };
  if (l.includes('زوجية') || l.includes('اطفال')) 
    return { icon: UserCheck, color: 'cyan', bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' };
  if (l.includes('شهادة')) 
    return { icon: Receipt, color: 'purple', bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' };
  if (l.includes('خطورة')) 
    return { icon: ShieldCheck, color: 'orange', bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' };
  if (l.includes('تقاعد')) 
    return { icon: Landmark, color: 'amber', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' };
  if (l.includes('ضريبة')) 
    return { icon: Scale, color: 'rose', bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' };
  if (l.includes('سلفة')) 
    return { icon: CreditCard, color: 'red', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400' };
  if (l.includes('موقع') || l.includes('جغرافي')) 
    return { icon: MapPin, color: 'teal', bg: 'bg-teal-50 dark:bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400' };
  if (l.includes('نقل') || l.includes('transport'))
     return { icon: Bus, color: 'lime', bg: 'bg-lime-50 dark:bg-lime-500/10', text: 'text-lime-600 dark:text-lime-400' };
  if (l.includes('%')) 
    return { icon: BadgePercent, color: 'slate', bg: 'bg-slate-50 dark:bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400' };
  
  return isDeduction 
    ? { icon: MinusCircle, color: 'rose', bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' } 
    : { icon: PlusCircle, color: 'blue', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' };
};

interface DetailCardProps {
  item: { label: string; value: string };
  isDeduction: boolean;
  index: number;
}

// Optimization: Memoize DetailCard to prevent re-renders when parent state changes
const DetailCard: React.FC<DetailCardProps> = React.memo(({ item, isDeduction, index }) => {
  const meta = getDetailMeta(item.label, isDeduction);
  const Icon = meta.icon;
  
  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl p-4 mb-3 transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] group cursor-default border min-h-[4.5rem] flex flex-col justify-center
        ${isDeduction 
          ? 'bg-white dark:bg-[#1c212e] border-rose-100 dark:border-rose-900/20 shadow-sm' 
          : 'bg-white dark:bg-[#1c212e] border-slate-200 dark:border-white/10 shadow-sm'
        }
      `}
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      <div className="relative z-10 flex items-center justify-between gap-3 w-full">
        {/* Right Side: Icon & Label (RTL) */}
        <div className="flex items-center gap-3 flex-1 min-w-[35%]">
          <div className={`
            w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:rotate-6
            ${meta.bg} ${meta.text}
          `}>
            <Icon className="w-5 h-5 stroke-[2px]" />
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-black text-amber-600 dark:text-amber-400 leading-snug break-words whitespace-normal text-right">
              {item.label}
            </span>
            {isDeduction && (
              <span className="text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full w-fit bg-rose-50 text-rose-500 dark:bg-rose-500/10">
                استقطاع
              </span>
            )}
          </div>
        </div>

        {/* Left Side: Amount/Value (RTL) */}
        <div className="flex flex-col items-start shrink pl-2 max-w-[65%]" dir="ltr">
           <div className={`text-base font-black font-mono tracking-tight break-words whitespace-normal text-left ${isDeduction ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
             {item.value}
           </div>
        </div>
      </div>
    </div>
  );
});

const SalaryTab: React.FC<SalaryTabProps> = ({ employee }) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [activeSubPage, setActiveSubPage] = useState<'main' | 'bonus' | 'dispatch' | 'extra'>('main');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Optimization: Memoize salary data to prevent recalculation on unrelated renders
  const salaryData = useMemo(() => employee.salary_history[selectedMonthIndex] || { 
    net_salary: '0', details: [] as { label: string; value: string }[], month: 'N/A', year: 'N/A'
  }, [employee.salary_history, selectedMonthIndex]);

  // Improved categorization logic to handle deductions without negative signs
  // and exclude Net Salary from totals/lists
  const categorizedDetails = useMemo(() => {
    // Keywords that indicate a deduction even if the value is positive
    const deductionKeywords = [
      'استقطاع',
      'ضريبة',
      'تقاعد',
      'سلفة',
      'مصرف',
      'ضمان',
      'إيجار',
      'نفقة',
      'زين',
      'عقاري'
    ];

    const earnings: { label: string; value: string }[] = [];
    const deductions: { label: string; value: string }[] = [];

    salaryData.details.forEach(item => {
      const label = item.label.trim();
      
      // Exclude "Net Salary" from the breakdown list to avoid double counting in Total Earnings
      // and because it is already displayed in the main card.
      if (label.includes('صافي') || label.includes('Net Salary')) {
        return; 
      }

      const isNegative = item.value.toString().includes('-');
      const isDeductionKeyword = deductionKeywords.some(kw => label.includes(kw));

      if (isNegative || isDeductionKeyword) {
        deductions.push(item);
      } else {
        earnings.push(item);
      }
    });

    return { earnings, deductions };
  }, [salaryData.details]);

  // Calculations for total earnings and deductions
  const totalEarnings = useMemo(() => {
    return categorizedDetails.earnings.reduce((acc: number, item) => {
      // Remove all non-numeric chars (except decimal point) to parse safely
      const val = parseFloat(item.value.replace(/[^0-9.]/g, '')) || 0;
      return acc + val;
    }, 0);
  }, [categorizedDetails.earnings]);

  const totalDeductions = useMemo(() => {
    return categorizedDetails.deductions.reduce((acc: number, item) => {
      // Logic: Item usually is "-15,000" or similar. We want the sum of absolute values.
      const val = parseFloat(item.value.replace(/[^0-9.]/g, '')) || 0;
      return acc + val;
    }, 0);
  }, [categorizedDetails.deductions]);

  const calculatedNetSalary = useMemo(() => {
    return totalEarnings - totalDeductions;
  }, [totalEarnings, totalDeductions]);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/9647831546302', '_blank');
  };

  const downloadPDF = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const container = document.createElement('div');
      Object.assign(container.style, {
        position: 'fixed',
        top: '0',
        left: '0', 
        width: '794px',
        minHeight: '1123px',
        zIndex: '-9999',
        backgroundColor: '#ffffff',
        direction: 'rtl',
        fontFamily: "'Cairo', sans-serif",
        padding: '0',
        margin: '0',
        visibility: 'hidden' 
      });

      document.body.appendChild(container);

      // (PDF Template HTML truncated for brevity - same as original)
      container.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .pdf-wrapper { font-family: 'Cairo', sans-serif; padding: 40px; background: #fff; color: #1e293b; line-height: 1.4; width: 794px; }
          .header-section { border-bottom: 3px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo-area { text-align: right; }
          .meta-area { text-align: left; }
          .org-text { font-size: 14px; font-weight: 800; color: #1e3a8a; margin-bottom: 4px; }
          .main-title-container { text-align: center; margin: 20px 0 35px 0; padding: 15px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 16px; }
          .doc-title { font-size: 28px; font-weight: 900; color: #0f172a; margin: 0; }
          .doc-subtitle { font-size: 14px; font-weight: 700; color: #64748b; margin-top: 5px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .info-table td { padding: 12px 15px; border: 1px solid #e2e8f0; font-size: 14px; }
          .label-cell { background-color: #f1f5f9; font-weight: 800; color: #475569; width: 18%; white-space: nowrap; }
          .val-cell { font-weight: 700; color: #0f172a; width: 32%; }
          .details-table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #cbd5e1; }
          .details-table th { background-color: #1e3a8a; color: #fff; padding: 12px; font-size: 14px; font-weight: 800; border: 1px solid #1e3a8a; }
          .details-table td { padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 13px; font-weight: 700; }
          .row-earn { background-color: #f0fdf4; color: #14532d; }
          .row-deduct { background-color: #fef2f2; color: #7f1d1d; }
          .amount-cell { font-family: monospace; font-size: 15px; text-align: left; direction: ltr; font-weight: 800; }
          .total-box { margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: white; border-radius: 20px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .total-label { font-size: 16px; font-weight: 700; margin-bottom: 5px; opacity: 0.9; }
          .total-number { font-size: 42px; font-weight: 900; letter-spacing: 1px; line-height: 1; }
          .footer-sigs { margin-top: 60px; display: flex; justify-content: space-between; padding: 0 40px; }
          .sig-block { text-align: center; width: 200px; }
          .sig-line { border-top: 2px solid #334155; margin-bottom: 10px; }
          .sig-title { font-weight: 800; font-size: 13px; color: #334155; }
        </style>
        <div class="pdf-wrapper">
          <div class="header-section">
            <div class="logo-area">
              <div class="org-text">جمهورية العراق</div>
              <div class="org-text">وزارة الكهرباء</div>
              <div class="org-text">الشركة العامة لإنتاج الطاقة / الفرات الأوسط</div>
              <div class="org-text">محطة كهرباء الخيرات الغازية</div>
            </div>
            <div class="meta-area">
               <div class="org-text">القسم: الشؤون المالية</div>
               <div class="org-text">الشعبة: الرواتب</div>
               <div class="org-text">تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')}</div>
            </div>
          </div>
          <div class="main-title-container">
            <h1 class="doc-title">كشف الراتب الشهري</h1>
            <div class="doc-subtitle">عن شهر ${salaryData.month} لسنة ${salaryData.year}</div>
          </div>
          <table class="info-table">
            <tr>
              <td class="label-cell">اسم الموظف</td>
              <td class="val-cell">${employee.p_name}</td>
              <td class="label-cell">الرقم الوظيفي</td>
              <td class="val-cell" style="font-family:monospace; font-weight:900;">${employee.p_id}</td>
            </tr>
            <tr>
              <td class="label-cell">العنوان الوظيفي</td>
              <td class="val-cell">${employee.p_job_title}</td>
              <td class="label-cell">الدرجة / المرحلة</td>
              <td class="val-cell">${employee.p_grade} / ${employee.p_stage}</td>
            </tr>
          </table>
          <table class="details-table">
            <thead>
              <tr>
                <th style="width: 70%; text-align: right;">بيان التفاصيل</th>
                <th style="width: 30%; text-align: center;">المبلغ (د.ع)</th>
              </tr>
            </thead>
            <tbody>
              ${salaryData.details.map(item => {
                const isDeduction = item.value.toString().includes('-');
                return `
                  <tr class="${isDeduction ? 'row-deduct' : 'row-earn'}">
                    <td>${item.label}</td>
                    <td style="text-align: center;">
                       <span class="amount-cell">${item.value.replace(' د.ع', '').replace(' IQD', '')}</span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="total-box">
             <div class="total-label">صافي الراتب المستحق</div>
             <div class="total-number" style="font-family: monospace;">${calculatedNetSalary.toLocaleString()}</div>
             <div style="font-size: 12px; margin-top: 8px; opacity: 0.8; font-weight: 700;">دينار عراقي لا غير</div>
          </div>
          <div class="footer-sigs">
             <div class="sig-block"><div class="sig-line"></div><div class="sig-title">محاسب الرواتب</div></div>
             <div class="sig-block"><div class="sig-line"></div><div class="sig-title">مدير القسم المالي</div></div>
          </div>
        </div>
      `;

      await new Promise(resolve => setTimeout(resolve, 800));

      container.style.visibility = 'visible'; 
      const canvas = await html2canvas(container, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        windowWidth: 794,
      });
      container.style.visibility = 'hidden'; 
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (imgHeight <= pdfHeight) {
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
      } else {
          const scaleFactor = pdfHeight / imgHeight;
          const scaledWidth = pdfWidth * scaleFactor;
          const xOffset = (pdfWidth - scaledWidth) / 2;
          pdf.addImage(imgData, 'JPEG', xOffset, 0, scaledWidth, pdfHeight);
      }
      
      const fileName = `راتب_${employee.p_name.replace(/\s/g, '_')}_${salaryData.month}.pdf`;
      const pdfArrayBuffer = pdf.output('arraybuffer');
      const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
      
      await downloadDirectly(blob, fileName);

      document.body.removeChild(container);
      setTimeout(() => setDownloadSuccess(false), 3000);

    } catch (e) { 
      console.error("PDF Generation Error:", e);
      alert('حدث خطأ أثناء إنشاء ملف الـ PDF. يرجى المحاولة مرة أخرى.'); 
    } finally { 
      setIsDownloading(false); 
    }
  };

  const downloadDirectly = async (blob: Blob, fileName: string) => {
      // Use Capacitor Filesystem for Native (Android/iOS)
      if (Capacitor.isNativePlatform()) {
        try {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64data = (reader.result as string).split(',')[1];
            try {
              // Directory.Documents is safe for Android
              const result = await Filesystem.writeFile({
                path: fileName,
                data: base64data,
                directory: Directory.Documents,
              });
              alert('تم حفظ الملف في المستندات: ' + result.uri);
              setDownloadSuccess(true);
            } catch(e: any) {
               console.error(e);
               alert('فشل حفظ الملف: ' + (e.message || 'Error writing file'));
            }
          };
        } catch (e) {
          alert('خطأ في معالجة الملف.');
        }
      } else {
        // Fallback for Web
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setDownloadSuccess(true);
      }
  };

  if (activeSubPage !== 'main') {
    const getSubPageData = () => {
      switch (activeSubPage) {
        case 'bonus': return {
          title: 'سجل المكافآت',
          data: employee.bonuses,
          icon: Gem,
          gradient: 'from-purple-500 to-indigo-600',
          styles: {
             bg: 'bg-purple-50 dark:bg-purple-500/10',
             text: 'text-purple-600 dark:text-purple-400',
             border: 'border-purple-100 dark:border-purple-500/20',
             dateBadge: 'bg-purple-50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
          }
        };
        case 'dispatch': return {
          title: 'سجل الإيفادات',
          data: employee.dispatches,
          icon: Briefcase,
          gradient: 'from-teal-400 to-emerald-600',
           styles: {
             bg: 'bg-teal-50 dark:bg-teal-500/10',
             text: 'text-teal-600 dark:text-teal-400',
             border: 'border-teal-100 dark:border-teal-500/20',
             dateBadge: 'bg-teal-50 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300'
          }
        };
        case 'extra': return {
          title: 'ساعات إضافية',
          data: employee.extra_hours,
          icon: Zap,
          gradient: 'from-orange-400 to-amber-600',
           styles: {
             bg: 'bg-orange-50 dark:bg-orange-500/10',
             text: 'text-orange-600 dark:text-orange-400',
             border: 'border-orange-100 dark:border-orange-500/20',
             dateBadge: 'bg-orange-50 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
          }
        };
        default: return null;
      }
    };

    const subPageConfig = getSubPageData();
    if (!subPageConfig) return null;

    const totalAmount = subPageConfig.data.reduce((acc, curr) => acc + curr.amount, 0);
    const Icon = subPageConfig.icon;

    return (
      <div className="space-y-4 pb-20" dir="rtl">
        <div className="bg-white dark:bg-[#151923] p-4 rounded-3xl flex justify-between items-center shadow-sm border border-slate-100 dark:border-white/5">
           <div className="flex items-center gap-3">
             <button 
               onClick={() => setActiveSubPage('main')} 
               className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors"
             >
               <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
             </button>
             <div>
               <h2 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                 {subPageConfig.title}
               </h2>
               <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                 {subPageConfig.data.length} سجلات متوفرة
               </p>
             </div>
           </div>
        </div>

        <div className={`relative overflow-hidden rounded-[2rem] p-6 text-white shadow-lg bg-gradient-to-br ${subPageConfig.gradient}`}>
           <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
           
           <div className="relative z-10 flex items-center justify-between">
              <div>
                 <p className="text-xs font-medium text-white/80 mb-1">إجمالي المستحقات</p>
                 <h3 className="text-3xl font-black font-mono tracking-tight">
                   {totalAmount.toLocaleString()} <span className="text-sm font-bold opacity-70">د.ع</span>
                 </h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20">
                 <Icon className="w-6 h-6 text-white" />
              </div>
           </div>
        </div>

        {subPageConfig.data.length > 0 ? (
          <div className="space-y-3">
            {subPageConfig.data.map((item, index) => (
              <div 
                key={index} 
                className={`group relative flex flex-row items-center justify-between p-4 bg-white dark:bg-[#1c212e] rounded-2xl border ${subPageConfig.styles.border} shadow-sm hover:shadow-md transition-all duration-300 gap-4`}
              >
                {/* Icon & Name */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${subPageConfig.styles.bg} ${subPageConfig.styles.text} group-hover:scale-110 transition-transform shrink-0`}>
                     <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                      {item.name}
                    </span>
                  </div>
                </div>

                {/* Amount & Date - Vertically stacked for better mobile support */}
                <div className="flex flex-col items-end gap-1 pl-1 shrink-0">
                   {/* Amount first (more important) */}
                   <div className="flex items-center gap-1 text-slate-900 dark:text-white">
                      <span className="text-lg font-black font-mono tracking-tight">{item.amount.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-slate-400 self-end mb-1">د.ع</span>
                   </div>
                   
                   {/* Date Badge - Wraps nicely under amount */}
                   <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide ${subPageConfig.styles.dateBadge} justify-end`}>
                      <Calendar className="w-3 h-3 opacity-70 shrink-0" />
                      <span className="mt-0.5 whitespace-nowrap">{formatFullDate(item.date)}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-50">
             <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-slate-400" />
             </div>
             <p className="font-bold text-sm text-slate-500 dark:text-slate-400">لا توجد سجلات حالياً</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-16 animate-in fade-in duration-500" dir="rtl">
      
      <button 
        onClick={handleWhatsAppClick} 
        className="fixed bottom-28 left-6 z-50 w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-2xl animate-bounce-subtle"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
      </button>

      <div className="bg-white dark:bg-[#151923] p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex items-center gap-2">
        <div className="w-9 h-9 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex-1 px-2">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">اختر الشهر</p>
          <div className="relative">
            <select 
              value={selectedMonthIndex} 
              onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
              className="w-full bg-transparent border-none font-black text-sm text-slate-900 dark:text-white outline-none appearance-none cursor-pointer"
            >
              {employee.salary_history.map((s, i) => (
                <option key={i} value={i}>{s.month} {s.year}</option>
              ))}
            </select>
          </div>
        </div>
        <button 
            onClick={downloadPDF} 
            disabled={isDownloading} 
            className={`w-9 h-9 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all ${downloadSuccess ? 'bg-emerald-500' : 'bg-slate-900 dark:bg-white dark:text-slate-900'}`}
            title="تحميل كشف الراتب"
        >
          {isDownloading ? <div className="w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin" /> : downloadSuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
        </button>
      </div>

      <div className="relative w-full aspect-[1.586/1] rounded-[1.2rem] p-4 text-[#451a03] shadow-lg overflow-hidden group transition-all duration-500 select-none mx-auto max-w-sm border border-[#E6C680]/20">
         <div className="absolute inset-0 bg-gradient-to-br from-[#E6C680] via-[#F9E58E] to-[#C9A355]"></div>
         
         {/* Shimmer Effect - Refined */}
         <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none rounded-[1.2rem]">
            <div className="absolute top-[-50%] left-[-100%] w-[50%] h-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-sheen blur-[1px]"></div>
         </div>
         
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         {/* Optimization: Removed heavy blur effect */}
         <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/20 rounded-full"></div>
         
         <div className="relative z-10 h-full flex flex-col justify-between">
           <div className="flex justify-between items-start">
             <div className="flex flex-col">
                <span className="text-[7px] font-black uppercase tracking-wider opacity-60 mb-0.5">Net Salary</span>
                <div className="flex items-baseline gap-1">
                   <h1 className="text-3xl font-black font-mono tracking-tighter drop-shadow-sm text-[#451a03] whitespace-nowrap">
                     {calculatedNetSalary.toLocaleString()}
                   </h1>
                   <span className="text-[9px] font-bold opacity-60">IQD</span>
                </div>
             </div>
             <div className="flex flex-col items-end opacity-90">
               <h2 className="text-[10px] font-black tracking-tight flex items-center gap-1">
                 محطة الخيرات
                 <Zap className="w-3 h-3 fill-[#451a03]" strokeWidth={0} />
               </h2>
               <span className="text-[7px] font-bold uppercase tracking-wider opacity-60">Employee Card</span>
             </div>
           </div>
           <div className="flex justify-start">
              <div className="w-9 h-7 bg-gradient-to-br from-[#f0f0f0] to-[#dcdcdc] rounded-md border border-black/10 relative overflow-hidden flex items-center justify-center shadow-sm opacity-90 mt-1">
                 <div className="w-full h-[1px] bg-black/10 absolute top-1/2"></div>
                 <div className="h-full w-[1px] bg-black/10 absolute left-1/3"></div>
                 <div className="h-full w-[1px] bg-black/10 absolute right-1/3"></div>
              </div>
           </div>
           <div className="flex justify-between items-end">
              <div className="flex flex-col">
                 <span className="text-[6px] font-bold uppercase tracking-wider opacity-50">Holder Name</span>
                 <p className="text-[9px] font-black truncate max-w-[120px]">{employee.p_name}</p>
              </div>
              <div className="flex gap-3 text-right">
                 <div>
                    <span className="text-[6px] font-bold uppercase tracking-wider opacity-50 block">ID</span>
                    <span className="text-[9px] font-black font-mono">{employee.p_id}</span>
                 </div>
                 <div>
                    <span className="text-[6px] font-bold uppercase tracking-wider opacity-50 block">Date</span>
                    <span className="text-[9px] font-black font-mono">{salaryData.month}/{salaryData.year.slice(-2)}</span>
                 </div>
              </div>
           </div>
         </div>
      </div>

      <button 
        onClick={downloadPDF}
        disabled={isDownloading}
        className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all duration-300 ${
           downloadSuccess 
           ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
           : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30 hover:shadow-lg'
        }`}
      >
        {isDownloading ? (
          <>
             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             <span className="font-bold text-sm">جارِ التحميل...</span>
          </>
        ) : downloadSuccess ? (
           <>
            <Check className="w-5 h-5 animate-in zoom-in" />
            <span className="font-bold text-sm animate-in fade-in">تم التحميل بنجاح</span>
           </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span className="font-bold text-sm">تحميل كشف الراتب (PDF)</span>
          </>
        )}
      </button>

      <div className="grid grid-cols-3 gap-3 my-4">
        {[
          {
            id: 'extra',
            label: 'الساعات الاضافية',
            sub: 'Overtime',
            icon: Zap,
            gradient: 'from-amber-400 to-orange-500',
            shadow: 'shadow-orange-500/25',
          },
          {
            id: 'dispatch',
            label: 'الإيفادات',
            sub: 'Missions',
            icon: Briefcase,
            gradient: 'from-cyan-400 to-blue-500',
            shadow: 'shadow-blue-500/25',
          },
          {
            id: 'bonus',
            label: 'المكافآت',
            sub: 'Bonuses',
            icon: Gem,
            gradient: 'from-fuchsia-400 to-purple-500',
            shadow: 'shadow-purple-500/25',
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSubPage(item.id as any)}
            className="relative group flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#1c212e] border border-slate-100 dark:border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden"
          >
            {/* Hover Gradient Background (Subtle) */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

            {/* Icon Container */}
            <div className={`
              w-12 h-12 mb-2 rounded-2xl flex items-center justify-center
              bg-gradient-to-br ${item.gradient} ${item.shadow} shadow-lg
              transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3
            `}>
              <item.icon className="w-6 h-6 text-white" strokeWidth={2} />
            </div>

            {/* Labels */}
            <span className="text-xs font-black text-slate-700 dark:text-slate-200 relative z-10">
              {item.label}
            </span>
            <span className="text-[9px] font-bold text-slate-400 relative z-10 opacity-70 font-sans tracking-wide">
              {item.sub}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4 mt-2">
        {categorizedDetails.earnings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 mb-1">
              <h3 className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <div className="p-1 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                   <PlusCircle className="w-3.5 h-3.5" />
                </div>
                الاستحقاقات
              </h3>
            </div>
            <div className="flex flex-col">
              {categorizedDetails.earnings.map((item, idx) => (
                <DetailCard key={idx} index={idx} item={item} isDeduction={false} />
              ))}
            </div>
          </div>
        )}

        {categorizedDetails.deductions.length > 0 && (
          <div className="space-y-2">
             <div className="flex items-center justify-between px-1 mb-1">
              <h3 className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                 <div className="p-1 rounded-md bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                   <MinusCircle className="w-3.5 h-3.5" />
                </div>
                الاستقطاعات
              </h3>
            </div>
            <div className="flex flex-col">
              {categorizedDetails.deductions.map((item, idx) => (
                <DetailCard key={idx} index={idx} item={item} isDeduction={true} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* NEW: Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mt-6 mb-6">
        {/* Earnings Card */}
        <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-3xl border border-blue-100 dark:border-blue-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
           {/* Decorative Background */}
           <div className="absolute top-0 left-0 w-16 h-16 bg-blue-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500"></div>
           <div className="absolute bottom-0 right-0 w-12 h-12 bg-blue-500/10 rounded-full translate-x-1/2 translate-y-1/2"></div>
           
           <div className="relative z-10 flex flex-col h-full justify-between gap-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                 <div className="p-1.5 bg-white dark:bg-blue-500/20 rounded-xl shadow-sm">
                    <PlusCircle className="w-4 h-4" />
                 </div>
                 <span className="text-xs font-bold leading-tight">مجموع المخصصات</span>
              </div>
              
              <div className="mt-1">
                 <h3 className="text-xl font-black text-blue-700 dark:text-blue-300 font-mono tracking-tight flex flex-col">
                   <span>{totalEarnings.toLocaleString()}</span>
                   <span className="text-[10px] opacity-70 font-sans">دينار عراقي</span>
                 </h3>
              </div>
           </div>
        </div>

        {/* Deductions Card */}
        <div className="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-3xl border border-rose-100 dark:border-rose-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
           {/* Decorative Background */}
           <div className="absolute top-0 left-0 w-16 h-16 bg-rose-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500"></div>
           <div className="absolute bottom-0 right-0 w-12 h-12 bg-rose-500/10 rounded-full translate-x-1/2 translate-y-1/2"></div>

           <div className="relative z-10 flex flex-col h-full justify-between gap-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                 <div className="p-1.5 bg-white dark:bg-rose-500/20 rounded-xl shadow-sm">
                    <MinusCircle className="w-4 h-4" />
                 </div>
                 <span className="text-xs font-bold leading-tight">مجموع الاستقطاعات</span>
              </div>
              
              <div className="mt-1">
                 <h3 className="text-xl font-black text-rose-700 dark:text-rose-300 font-mono tracking-tight flex flex-col">
                   <span>{totalDeductions.toLocaleString()}</span>
                   <span className="text-[10px] opacity-70 font-sans">دينار عراقي</span>
                 </h3>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-1 pt-6 pb-2 opacity-40">
        <Landmark className="w-3 h-3 text-slate-400" />
        <p className="text-[8px] font-black text-slate-400 text-center tracking-[0.1em] uppercase">
          Finance Management System
        </p>
      </div>

      <style>{`
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-bounce-subtle { animation: bounce-subtle 4s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default React.memo(SalaryTab);