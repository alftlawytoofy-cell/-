import React, { useState, useEffect } from 'react';
import { User, Loader2, ArrowLeft, Fingerprint, ShieldCheck, AlertCircle, Zap, ScanFace } from 'lucide-react';
import { fetchEmployeeData } from '../services/dataService';
import { Employee } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (employee: Employee) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem('remembered_employee_id');
    if (savedId) {
      setEmployeeId(savedId);
      setRememberMe(true);
      setHasBiometric(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) {
        setError('يرجى إدخال الرقم الوظيفي');
        return;
    };

    setLoading(true);
    setError('');

    try {
      const data = await fetchEmployeeData(employeeId);
      
      if (rememberMe) {
        localStorage.setItem('remembered_employee_id', employeeId);
        setHasBiometric(true);
      } else {
        localStorage.removeItem('remembered_employee_id');
        setHasBiometric(false);
      }

      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = () => {
    if (!hasBiometric) {
      setError('يرجى تسجيل الدخول يدوياً أولاً لتفعيل البصمة');
      return;
    }

    setBiometricScanning(true);
    setError('');
    
    // Simulate Biometric Auth Process
    // In a real Native app, this would call the Biometric Plugin
    setTimeout(async () => {
      try {
        const idToUse = localStorage.getItem('remembered_employee_id');
        if (!idToUse) throw new Error('No credentials');

        // Verify ID still valid
        const data = await fetchEmployeeData(idToUse); 
        onLoginSuccess(data);
      } catch (err) {
        setBiometricScanning(false);
        setError('فشل التحقق من البصمة. يرجى استخدام الرمز الوظيفي.');
      }
    }, 1500);
  };

  const cancelBiometric = () => {
    setBiometricScanning(false);
    setError('');
  };

  const handleForgotId = () => {
    window.open(`https://wa.me/9647831546302?text=${encodeURIComponent("مرحباً، نسيت رقمي الوظيفي")}`, '_blank' );
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-[Cairo] flex flex-col" dir="rtl">
      
      {/* Header / Brand Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
           <div className="absolute bottom-[-10%] left-[-20%] w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="relative z-10 text-center space-y-6 max-w-sm w-full">
            <div className="mx-auto w-20 h-20 bg-indigo-600 rounded-[20px] flex items-center justify-center shadow-2xl shadow-indigo-200 rotate-3 transition-transform hover:rotate-0 duration-500">
               <Zap className="w-10 h-10 text-white fill-white" />
            </div>
            
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">تسجيل الدخول</h1>
              <p className="text-slate-500 font-medium text-sm">أدخل الرقم الوظيفي للمتابعة</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6 pt-4">
               <div className={`relative transition-all duration-300 ${isFocused ? 'transform -translate-y-1' : ''}`}>
                  <label className="block text-right text-xs font-bold text-slate-700 mb-2 mr-1">الرقم الوظيفي</label>
                  <div className={`relative flex items-center bg-slate-50 rounded-2xl border-2 transition-all duration-300 ${isFocused ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-100' : 'border-slate-100'}`}>
                     <div className="pl-4 pr-5 text-slate-400">
                        <User className="w-5 h-5" />
                     </div>
                     <input 
                        type="text" 
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="أدخل الرقم الوظيفي"
                        className={`w-full bg-transparent border-none py-4 text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:ring-0 text-right ${employeeId ? 'font-mono tracking-[0.2em]' : 'font-sans'}`}
                     />
                  </div>
               </div>

               <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                     <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                        {rememberMe && <Zap className="w-3 h-3 text-white fill-white" />}
                     </div>
                     <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                     <span className="text-xs font-bold text-slate-500">تذكرني</span>
                  </label>
                  
                  <button type="button" onClick={handleForgotId} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                     نسيت الرقم؟
                  </button>
               </div>

               {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold animate-in slide-in-from-top-2">
                     <AlertCircle className="w-4 h-4 shrink-0" />
                     {error}
                  </div>
               )}

               <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-slate-200 hover:bg-black active:scale-[0.98] transition-all"
               >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>دخول آمن</span>}
                  {!loading && <ArrowLeft className="w-5 h-5" />}
               </button>
            </form>
        </div>
      </div>

      {/* Footer / Biometrics */}
      <div className="p-6 bg-white z-20">
         <button 
            onClick={handleBiometricLogin}
            disabled={!hasBiometric}
            className={`w-full border-2 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all mb-6 
              ${hasBiometric 
                ? 'border-indigo-100 hover:border-indigo-200 bg-indigo-50/50 text-indigo-700 cursor-pointer shadow-sm hover:shadow-md' 
                : 'border-slate-50 bg-slate-50 text-slate-300 cursor-not-allowed opacity-70'
              }`}
         >
            {hasBiometric ? <Fingerprint className="w-5 h-5" /> : <ScanFace className="w-5 h-5" />}
            {hasBiometric ? 'تسجيل الدخول بالبصمة' : 'تفعيل البصمة يتطلب دخولاً مسبقاً'}
         </button>
         
         <div className="flex items-center justify-center gap-2 opacity-50">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <p className="text-[10px] text-slate-400 font-bold">بوابة الخيرات - نظام محمي ومشفر</p>
         </div>
      </div>

      {/* Biometric Overlay */}
      {biometricScanning && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="relative mb-8 cursor-pointer" onClick={cancelBiometric}>
              {/* Animated Rings */}
              <span className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping duration-1000"></span>
              <span className="absolute -inset-4 rounded-full border border-indigo-500/10 animate-pulse duration-2000"></span>
              
              <div className="w-24 h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center relative z-10 shadow-2xl shadow-indigo-300">
                 <Fingerprint className="w-12 h-12 animate-pulse" />
              </div>
           </div>
           
           <h3 className="text-2xl font-black text-slate-900 mb-2">جارِ التحقق...</h3>
           <p className="text-slate-500 font-medium text-sm mb-8 animate-pulse">يرجى تأكيد هويتك عبر البصمة</p>
           
           <button 
             onClick={cancelBiometric}
             className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
           >
             إلغاء واستخدام الرقم الوظيفي
           </button>
        </div>
      )}

    </div>
  );
};

export default LoginScreen;