import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap, Layers, ShieldCheck } from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

const IMAGES = [
  "/1.jpg",
  "/2.jpg",
  "/3.jpg"
];

const CONTENT = [
  {
    title: "بوابة الخيرات",
    subtitle: "المستقبل الرقمي",
    desc: "إدارة متكاملة لبياناتك الوظيفية والمالية في مكان واحد، بكل سهولة وأمان."
  },
  {
    title: "راتبك، بتفاصيله",
    subtitle: "شفافية ودقة",
    desc: "اطلع على تفاصيل الراتب، الاستقطاعات، والمكافآت الشهرية لحظة بلحظة."
  },
  {
    title: "خدمات الموظفين",
    subtitle: "دائماً معك",
    desc: "تابع الإيفادات، سجلات الشكر، والترقيات من خلال هاتفك المحمول."
  }
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Auto-advance slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length); // Swipe Left
    }
    if (touchStart - touchEnd < -75) {
      setCurrentIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length); // Swipe Right
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black text-white font-sans overflow-hidden" 
      dir="rtl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* --- Background Slider --- */}
      <div className="absolute inset-0 w-full h-full">
        {IMAGES.map((img, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
             {/* Image */}
             <img 
               src={img} 
               alt={`Slide ${index}`}
               className="w-full h-full object-cover transform scale-105" // slight zoom to hide edges
             />
             
             {/* Dark Gradient Overlay (Cinematic Look) */}
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90"></div>
          </div>
        ))}
      </div>

      {/* --- Foreground Content --- */}
      <div className="relative z-20 h-full flex flex-col justify-between p-8 pb-10">
        
        {/* Top Header */}
        <div className="flex justify-between items-center pt-4 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Secure Portal</span>
           </div>
           {/* Logo / Brand Icon */}
           <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <Zap className="w-6 h-6 text-white fill-white" />
           </div>
        </div>

        {/* Bottom Content Area */}
        <div className="flex flex-col gap-6">
           
           {/* Dynamic Text Area */}
           <div className="relative min-h-[180px] w-full"> 
              {CONTENT.map((item, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <div 
                    key={idx} 
                    className={`absolute bottom-0 left-0 right-0 flex flex-col items-start justify-end transition-opacity duration-500 ${
                        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                     {/* Subtitle - Stagger 1 */}
                     <div className={`flex items-center gap-2 mb-2 transition-all duration-700 ease-out delay-100 ${
                        isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                     }`}>
                       <div className="w-8 h-[2px] bg-indigo-500"></div>
                       <span className="text-indigo-400 font-bold text-sm tracking-wide">{item.subtitle}</span>
                     </div>

                     {/* Title - Stagger 2 */}
                     <h1 className={`text-4xl font-black leading-tight mb-3 text-white drop-shadow-lg transition-all duration-700 ease-out delay-200 ${
                        isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                     }`}>
                       {item.title}
                     </h1>

                     {/* Desc - Stagger 3 */}
                     <p className={`text-gray-300 text-sm leading-relaxed font-medium max-w-xs transition-all duration-700 ease-out delay-300 ${
                        isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                     }`}>
                       {item.desc}
                     </p>
                  </div>
                );
              })}
           </div>

           {/* Indicators (Progress Bars) */}
           <div className="flex gap-2 mb-2">
             {IMAGES.map((_, idx) => (
               <div key={idx} className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                 <div 
                   className={`h-full bg-white transition-all duration-500 ease-out ${
                     idx === currentIndex ? 'w-full' : 'w-0'
                   }`}
                 />
               </div>
             ))}
           </div>

           {/* Action Button */}
           <button 
             onClick={onEnter}
             className="group relative w-full bg-white text-black py-4 rounded-2xl font-black text-lg flex items-center justify-between px-6 overflow-hidden shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-transform active:scale-[0.98]"
           >
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
             
             <span className="relative z-10 flex items-center gap-3">
               <Layers className="w-5 h-5 text-indigo-600" />
               تسجيل الدخول
             </span>
             
             <div className="relative z-10 w-10 h-10 bg-black rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-300">
               <ArrowLeft className="w-5 h-5 text-white" />
             </div>
           </button>
           
           <p className="text-center text-[10px] text-white/40 font-mono tracking-widest mt-2">
             AL-KHAIRAT POWER STATION v4.0
           </p>

        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;