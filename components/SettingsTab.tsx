import React, { useState } from 'react';
import { 
  Moon, Sun, Volume2, VolumeX, Info, LogOut, Shield, 
  Building2, X, Zap, Target, Flag, MapPin, Users, CheckCircle2, Flame,
  History, Calendar
} from 'lucide-react';
import { Theme } from '../types';

interface SettingsTabProps {
  theme: Theme;
  toggleTheme: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  onLogout: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ 
  theme, 
  toggleTheme, 
  soundEnabled, 
  toggleSound,
  onLogout 
}) => {
  const [showAboutModal, setShowAboutModal] = useState(false);

  return (
    <div className="pb-24 space-y-6 animate-in fade-in slide-in-from-bottom-4 relative">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">الإعدادات</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">تخصيص تجربة الاستخدام الخاصة بك</p>
      </div>

      {/* About Station Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-1 shadow-lg cursor-pointer transform transition-transform active:scale-[0.98]" onClick={() => setShowAboutModal(true)}>
        <div className="bg-white/10 backdrop-blur-sm rounded-[1.4rem] p-5 flex items-center justify-between relative overflow-hidden">
           {/* Decorative bg */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
           
           <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                 <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-white">
                 <h3 className="font-black text-lg">عن المحطة</h3>
                 <p className="text-indigo-100 text-xs opacity-90 font-medium">تاريخنا، رؤيتنا، وقيمنا الجوهرية</p>
              </div>
           </div>
           <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
              <Info className="w-5 h-5" />
           </div>
        </div>
      </div>

      {/* Preferences Group */}
      <div className="space-y-3">
        <h3 className="px-2 text-sm font-bold text-gray-500 dark:text-gray-400">التفضيلات العامة</h3>
        
        <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
          
          {/* Theme Toggle */}
          <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={toggleTheme}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-orange-100 text-orange-500'}`}>
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">المظهر</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{theme === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري'}</p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-indigo-500' : 'bg-gray-200'}`}>
               <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${theme === 'dark' ? '-translate-x-6' : 'translate-x-0'}`} style={{ right: '4px' }}></div> 
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={toggleSound}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${soundEnabled ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'}`}>
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">أصوات التنبيهات</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{soundEnabled ? 'مفعل' : 'صامت'}</p>
              </div>
            </div>
             <div className={`w-12 h-7 rounded-full transition-colors relative ${soundEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}>
               <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${soundEnabled ? '-translate-x-6' : 'translate-x-0'}`} style={{ right: '4px' }}></div>
            </div>
          </div>

        </div>
      </div>

      {/* Info Group */}
      <div className="space-y-3">
        <h3 className="px-2 text-sm font-bold text-gray-500 dark:text-gray-400">معلومات التطبيق</h3>
        <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
           <div className="p-4 flex items-center gap-4 border-b border-gray-100 dark:border-white/5">
              <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                 <Info className="w-5 h-5" />
              </div>
              <div>
                 <p className="font-bold text-gray-900 dark:text-white">الإصدار</p>
                 <p className="text-xs text-gray-500 dark:text-gray-400">v4.0.0 (Build 2024)</p>
              </div>
           </div>
           
           <div className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                 <Shield className="w-5 h-5" />
              </div>
              <div>
                 <p className="font-bold text-gray-900 dark:text-white">سياسة الخصوصية</p>
                 <p className="text-xs text-gray-500 dark:text-gray-400">بياناتك مشفرة ومحفوظة بأمان</p>
              </div>
           </div>
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="w-full bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold py-4 rounded-3xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        <LogOut className="w-5 h-5" />
        تسجيل الخروج
      </button>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowAboutModal(false)}></div>
          
          <div className="bg-white dark:bg-[#151923] w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-white/10">
             
             {/* Modal Header Image */}
             <div className="h-40 bg-gradient-to-r from-blue-900 to-indigo-900 relative overflow-hidden flex items-end p-6">
                <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1565514020125-167818adc9bc?q=80&w=2070')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#151923] via-transparent to-transparent"></div>
                
                <button 
                  onClick={() => setShowAboutModal(false)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="relative z-10">
                   <h2 className="text-3xl font-black text-white mb-1">محطة الخيرات</h2>
                   <p className="text-blue-200 text-sm font-medium">Al-Khairat Gas Power Station</p>
                </div>
             </div>

             <div className="p-6 space-y-8">
                
                {/* Intro */}
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                   <MapPin className="w-5 h-5" />
                   <span>كربلاء المقدسة، العراق</span>
                </div>

                {/* History Timeline Section */}
                <div>
                   <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                     <History className="w-5 h-5 text-indigo-500" />
                     نبذة تاريخية
                   </h3>
                   <div className="relative border-r-2 border-indigo-100 dark:border-indigo-500/10 mr-2 pr-6 space-y-6">
                      
                      {/* Timeline Item 1 */}
                      <div className="relative">
                         <div className="absolute top-1.5 -right-[31px] w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-[#151923]"></div>
                         <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full mb-1 inline-block">2011</span>
                         <h4 className="font-bold text-gray-900 dark:text-white text-sm">التأسيس والانطلاق</h4>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                            بدء العمل في مشروع محطة الخيرات الغازية كأحد أكبر مشاريع البنية التحتية للطاقة في الفرات الأوسط.
                         </p>
                      </div>
                      
                      {/* Timeline Item 2 */}
                      <div className="relative">
                         <div className="absolute top-1.5 -right-[31px] w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white dark:ring-[#151923]"></div>
                         <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full mb-1 inline-block">2013</span>
                         <h4 className="font-bold text-gray-900 dark:text-white text-sm">التشغيل التجاري</h4>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                            افتتاح المحطة رسمياً ودخول الوحدات التوربينية (GE-9E) للخدمة لرفد الشبكة الوطنية.
                         </p>
                      </div>

                       {/* Timeline Item 3 */}
                      <div className="relative">
                         <div className="absolute top-1.5 -right-[31px] w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-[#151923]"></div>
                         <span className="text-[10px] font-black bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full mb-1 inline-block">الحاضر</span>
                         <h4 className="font-bold text-gray-900 dark:text-white text-sm">استدامة وتطوير</h4>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                            تعمل المحطة بكامل طاقتها (1250 MW) مع خطط مستمرة للتطوير والصيانة للحفاظ على ديمومة الإنتاج.
                         </p>
                      </div>

                   </div>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center">
                      <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                      <h4 className="font-black text-gray-900 dark:text-white text-xl">1250</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">ميغاواط (MW)</p>
                   </div>
                   <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center">
                      <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                      <h4 className="font-black text-gray-900 dark:text-white text-xl">10</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">وحدات توليدية</p>
                   </div>
                </div>

                {/* Mission & Vision */}
                <div className="space-y-4">
                   <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                         <Target className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="font-bold text-gray-900 dark:text-white mb-1">رؤيتنا</h3>
                         <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            أن نكون نموذجاً رائداً في إنتاج الطاقة الكهربائية بأعلى معايير الكفاءة والاستدامة، داعمين لعجلة التنمية في عراقنا الحبيب.
                         </p>
                      </div>
                   </div>

                   <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                         <Flag className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="font-bold text-gray-900 dark:text-white mb-1">رسالتنا</h3>
                         <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            الالتزام بتوفير طاقة موثوقة ومستقرة، مع مراعاة السلامة المهنية والحفاظ على البيئة، وتطوير كوادرنا الوطنية.
                         </p>
                      </div>
                   </div>
                </div>

                {/* Values */}
                <div>
                   <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                     <Users className="w-5 h-5 text-purple-500" />
                     قيمنا الجوهرية
                   </h3>
                   <div className="grid grid-cols-2 gap-2">
                      {['السلامة أولاً', 'النزاهة والشفافية', 'العمل بروح الفريق', 'الابتكار والتطوير'].map((val, idx) => (
                         <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{val}</span>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="pt-4 text-center border-t border-gray-100 dark:border-white/10">
                   <p className="text-[10px] text-gray-400">
                      محطة كهرباء الخيرات الغازية - وزارة الكهرباء العراقية
                   </p>
                </div>

             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SettingsTab;