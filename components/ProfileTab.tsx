import React, { useRef, useMemo, useState } from 'react';
import { 
  Briefcase, Award, TrendingUp, 
  User, Camera, QrCode, X,
  CheckCircle2, Building2, ChevronLeft, GraduationCap, Wallet,
  Sparkles, Clock, Layers, ArrowUpCircle, MessageCircle, Star,
  CalendarDays, HeartPulse
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { Employee } from '../types';

interface ProfileTabProps {
  employee: Employee;
  onUpdateProfileImage: (newImage: string) => void;
}

// --- OPTIMIZATION: Extracted components outside to prevent re-creation on every render ---

const InfoCard = React.memo(({ title, value, icon: Icon, colorClass, subValue }: { title: string, value: string, icon: any, colorClass: string, subValue?: string }) => {
  // Check if value has numbers and text
  const match = value.match(/^([\d.,]+)\s+(.+)$/);
  
  return (
    <div className={`relative overflow-hidden rounded-3xl p-5 ${colorClass} shadow-lg transition-transform hover:-translate-y-1`}>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-2">
          {/* Optimization: Removed backdrop-blur-sm for better scrolling performance */}
          <div className="p-2.5 bg-white/20 rounded-2xl text-white">
            <Icon className="w-5 h-5" />
          </div>
          {subValue && <span className="text-[10px] font-bold bg-black/10 text-white/90 px-2 py-1 rounded-full">{subValue}</span>}
        </div>
        <div>
          <p className="text-white/80 text-xs font-bold mb-1">{title}</p>
          {match ? (
             <h3 className="text-white font-black leading-tight flex items-baseline gap-1">
                <span className="text-3xl tracking-tight">{match[1]}</span>
                <span className="text-sm opacity-80">{match[2]}</span>
             </h3>
          ) : (
             <h3 className="text-white text-2xl font-black leading-tight tracking-tight">{value}</h3>
          )}
        </div>
      </div>
    </div>
  );
});

const DetailRow = React.memo(({ 
  label, 
  value, 
  icon: Icon, 
  colorBg, 
  colorText 
}: { 
  label: string, 
  value: string, 
  icon: any, 
  colorBg: string, 
  colorText: string 
}) => (
  <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-all group">
     <div className="flex items-center gap-4">
       <div className={`p-2.5 rounded-xl ${colorBg} ${colorText} group-hover:scale-110 transition-transform shadow-sm`}>
         <Icon className="w-5 h-5" />
       </div>
       <span className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">{label}</span>
     </div>
     <span className="font-black text-gray-800 dark:text-white text-base">
       {value}
     </span>
  </div>
));

const ProfileTab: React.FC<ProfileTabProps> = ({ employee, onUpdateProfileImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onUpdateProfileImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/9647710482197', '_blank');
  };

  // --- LOGIC FOR PARSING AND DISPLAYING THANKS LETTERS ---

  const thanksLetters = useMemo(() => {
    const text = employee.p_thanks;
    if (!text || text.toLowerCase().includes('لا يوجد')) {
      return [];
    }
    const cleanedText = text.trim().replace(/\s+/g, ' ');
    const letters = cleanedText.split(/\s+(?=\d+\s*في)/);
    return letters.filter(l => l.length > 0);
  }, [employee.p_thanks]);

  const lettersCount = thanksLetters.length;

  const splitLetterForDisplay = (letter: string) => {
    const parts = letter.split(/\s*في\s*/);
    if (parts.length > 1) {
      const id = parts[0].trim();
      const details = parts.slice(1).join(' في ').trim(); 
      return { id, details };
    }
    return { id: '', details: letter.trim() };
  };
  
  // Format data for QR Code as simple text instead of JSON
  // Adding BOM (\uFEFF) to force UTF-8 recognition in some scanners
  const qrData = `\uFEFFمحطة كهرباء الخيرات الغازية
الاسم: ${employee.p_name}
الرقم الوظيفي: ${employee.p_id}
العنوان: ${employee.p_job_title}
القسم: ${employee.p_grade} / ${employee.p_stage}`;

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 space-y-6">
      
      {/* Floating WhatsApp Button */}
      <button 
        onClick={handleWhatsAppClick}
        className="fixed bottom-28 left-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-500/40 transition-all active:scale-90 animate-bounce-subtle"
        title="تواصل مع القسم الإداري"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
        </span>
      </button>

      {/* Colorful Header Section */}
      <div className="relative mt-8">
          <div className="bg-white dark:bg-[#151923] rounded-[2.5rem] p-6 pt-12 shadow-xl border border-gray-100 dark:border-white/5 text-center relative overflow-visible mt-16">
            
            {/* QR Code Button */}
            <div className="absolute top-4 left-4 z-20">
               <button 
                 onClick={() => setShowQrModal(true)}
                 className="p-2.5 bg-gray-50 dark:bg-white/10 rounded-xl text-slate-600 dark:text-white hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 transition-all active:scale-90"
                 title="الهوية الرقمية"
               >
                 <QrCode className="w-5 h-5" />
               </button>
            </div>

            {/* Avatar Floating */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-[6px] border-white dark:border-[#151923] shadow-2xl overflow-hidden bg-white dark:bg-gray-800 relative z-10">
                    {/* Optimization: Lazy loading and async decoding */}
                    <img 
                      src={employee.p_img} 
                      alt={employee.p_name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                      loading="lazy"
                      decoding="async"
                      onClick={() => fileInputRef.current?.click()}
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://avatar.iran.liara.run/public/boy?username=${encodeURIComponent(employee.p_name)}`; }}
                    />
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-2.5 bg-gray-900 text-white rounded-full shadow-lg border-2 border-white dark:border-[#151923] hover:bg-black transition-colors z-20"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
            </div>

            <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-16 mb-1">{employee.p_name}</h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{employee.p_job_title}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
               <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <span className="text-xs text-gray-400 block mb-1">الرقم الوظيفي</span>
                  <span className="text-lg font-black text-gray-900 dark:text-white font-mono tracking-wider">{employee.p_id}</span>
               </div>
               <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <span className="text-xs text-gray-400 block mb-1">تاريخ التعيين</span>
                  <span className="text-lg font-black text-gray-900 dark:text-white">{employee.p_join_date}</span>
               </div>
            </div>
          </div>
      </div>

      {/* Vibrant Grid Stats */}
      <div className="grid grid-cols-2 gap-3">
        <InfoCard 
          title="الراتب الاسمي" 
          value={`${employee.p_salary} د.ع`} 
          icon={Wallet} 
          colorClass="bg-gradient-to-br from-emerald-400 to-teal-600"
        />
        <InfoCard 
          title="الدرجة والمرحلة" 
          value={`د / ${employee.p_grade} - م / ${employee.p_stage}`} 
          icon={Building2} 
          colorClass="bg-gradient-to-br from-violet-500 to-purple-700"
        />
        <InfoCard 
          title="التحصيل الدراسي" 
          value={employee.p_education} 
          icon={GraduationCap} 
          colorClass="bg-gradient-to-br from-blue-400 to-indigo-600"
        />
        <InfoCard 
          title="حالة الترقية" 
          value={employee.p_promo_status} 
          icon={TrendingUp} 
          colorClass="bg-gradient-to-br from-amber-400 to-orange-600"
          subValue={employee.p_promo_date}
        />
      </div>

      {/* Leaves Balance Section (New) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <CalendarDays className="w-5 h-5 text-cyan-500 fill-cyan-500/20" />
          <h3 className="font-bold text-gray-900 dark:text-white">رصيد الإجازات</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InfoCard 
            title="إجازات متراكمة" 
            value={employee.p_annual_leave?.includes('يوم') ? employee.p_annual_leave : `${employee.p_annual_leave || 0} يوم`} 
            icon={CalendarDays} 
            colorClass="bg-gradient-to-br from-cyan-400 to-blue-600"
          />
          <InfoCard 
            title="إجازات مرضية" 
            value={employee.p_sick_leave?.includes('يوم') ? employee.p_sick_leave : `${employee.p_sick_leave || 0} يوم`} 
            icon={HeartPulse} 
            colorClass="bg-gradient-to-br from-rose-400 to-red-600"
          />
        </div>
      </div>

      {/* Details Sections */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <h3 className="font-bold text-gray-900 dark:text-white">تفاصيل العلاوة والترقية</h3>
        </div>
        
        <div className="bg-white dark:bg-[#151923] p-3 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 space-y-2">
           <DetailRow 
             label="العنوان الوظيفي" 
             value={employee.p_job} 
             icon={Layers} 
             colorBg="bg-blue-100 dark:bg-blue-500/20"
             colorText="text-blue-600 dark:text-blue-400"
           />
           <DetailRow 
             label="آخر علاوة سنوية" 
             value={employee.p_last_bonus} 
             icon={ArrowUpCircle} 
             colorBg="bg-emerald-100 dark:bg-emerald-500/20"
             colorText="text-emerald-600 dark:text-emerald-400"
           />
           <DetailRow 
             label="تاريخ الترقية الحالية" 
             value={employee.p_promo_date} 
             icon={Award} 
             colorBg="bg-purple-100 dark:bg-purple-500/20"
             colorText="text-purple-600 dark:text-purple-400"
           />
           <DetailRow 
             label="تاريخ الاستحقاق القادم" 
             value={employee.p_due_post} 
             icon={Clock} 
             colorBg="bg-orange-100 dark:bg-orange-500/20"
             colorText="text-orange-600 dark:text-orange-400"
           />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="font-bold text-gray-900 dark:text-white">كتب الشكر والتقدير</h3>
          </div>
          {lettersCount > 0 && (
            <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/20 px-3 py-1.5 rounded-full">
              {lettersCount} كتب
            </span>
          )}
        </div>
        
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 p-6 rounded-[2rem] border border-rose-100 dark:border-rose-500/10 relative overflow-hidden">
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 bg-white dark:bg-rose-500/20 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                    <Sparkles className="w-6 h-6 text-rose-500" />
                 </div>
                 <div>
                    <h4 className="font-bold text-rose-900 dark:text-rose-100">سجل كتب الشكر</h4>
                    <p className="text-xs text-rose-600 dark:text-rose-300 font-medium opacity-80">
                       {lettersCount > 0 ? `لديك ${lettersCount} كتاب شكر مسجل` : 'لا يوجد كتب حالياً'}
                    </p>
                 </div>
              </div>

              {lettersCount > 0 ? (
                <ul className="space-y-3 list-none p-0 m-0">
                  {thanksLetters.map((letter, index) => {
                    const { id, details } = splitLetterForDisplay(letter);
                    return (
                      <li 
                        key={index} 
                        // Optimization: Removed backdrop-blur-sm
                        className="flex items-start gap-3 text-sm text-rose-800 dark:text-rose-200 font-medium leading-relaxed bg-white/50 dark:bg-black/10 p-4 rounded-2xl border border-rose-200/50 dark:border-rose-700/50 shadow-inner hover:bg-white dark:hover:bg-white/5 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-rose-500 flex-shrink-0" />
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-rose-900 dark:text-rose-50 text-base font-mono">{id}</span>
                          <span className="flex items-center justify-center text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/20 px-2 py-0.5 rounded-full">في</span>
                          <span className="text-gray-700 dark:text-gray-300 font-bold">{details}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center py-6">
                   <p className="text-sm text-rose-700 dark:text-rose-200 font-medium">
                     {employee.p_thanks || 'لا يوجد كتب شكر مسجلة حالياً'}
                   </p>
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pt-4 pb-2 opacity-70">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
             ملاحظة: يتم تحديث البيانات تلقائياً في كل شهر
          </p>
      </div>

      {/* --- QR CODE MODAL --- */}
      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowQrModal(false)}></div>
          
          <div className="bg-white dark:bg-[#151923] w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-200 dark:border-white/10">
              {/* ID Card Header */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 text-center pt-8 pb-16 relative">
                  <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                     <X className="w-4 h-4"/>
                  </button>
                  <h3 className="text-xl font-black text-white">الهوية الرقمية</h3>
                  <p className="text-indigo-100 text-sm opacity-80">محطة كهرباء الخيرات الغازية</p>
              </div>
              
              {/* QR Container */}
              <div className="px-6 pb-8 -mt-10 relative z-20">
                  <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 mx-auto w-fit mb-6">
                       <QRCode 
                          value={qrData}
                          level="H" // High Error Correction
                          size={200}
                          viewBox={`0 0 256 256`}
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                       />
                  </div>
                  
                  <div className="text-center space-y-1">
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">{employee.p_name}</h2>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-full">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{employee.p_job_title}</span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 font-bold tracking-widest pt-2">{employee.p_id}</p>
                      <p className="text-[10px] text-red-400 pt-2 font-bold opacity-80">
                         ملاحظة: إذا ظهرت النصوص غريبة، تأكد من تحويل لغة إدخال الجهاز الماسح إلى العربية
                      </p>
                  </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-white/5 p-4 text-center border-t border-gray-100 dark:border-white/5">
                  <p className="text-[10px] text-gray-400">قم بمسح الرمز للتحقق من بيانات الموظف</p>
              </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default React.memo(ProfileTab);