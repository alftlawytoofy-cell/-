import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Moon, Sun, User, Wallet, LogOut, Bell,
  Settings, RefreshCw
} from 'lucide-react';
import LoginScreen from './components/LoginScreen';
import WelcomeScreen from './components/WelcomeScreen';
import ProfileTab from './components/ProfileTab';
import SalaryTab from './components/SalaryTab';
import SettingsTab from './components/SettingsTab';
import NotificationCenter from './components/NotificationCenter';
import { Employee, Theme, GenericRecord, AppNotification, NotificationType, NotificationPriority } from './types';
import { fetchEmployeeData } from './services/dataService';

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'salary' | 'settings'>('profile');
  const [theme, setTheme] = useState<Theme>('dark');
  
  // Enhanced Notification State
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { 
      id: 1, 
      title: 'أهلاً بك', 
      message: 'مرحباً بك في بوابة الخيرات الإلكترونية المحدثة.', 
      time: 'الآن', 
      timestamp: Date.now(), 
      read: false,
      type: 'system',
      priority: 'normal'
    },
  ]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [isBellAnimating, setIsBellAnimating] = useState(false);
  
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => localStorage.getItem('sound_enabled') !== 'false');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Trigger bell animation when notifications arrive
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    if (unread > 0) {
      setIsBellAnimating(true);
      const timer = setTimeout(() => setIsBellAnimating(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [notifications.length]);

  // --- AUDIO SYNTHESIZER ---
  const playNotificationSound = useCallback((priority: NotificationPriority) => {
    if (!soundEnabled) return;
    
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (priority === 'high') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); 
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(0, ctx.currentTime + 0.11); 
        osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.2); 
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.error("Audio play failed", e);
    }
  }, [soundEnabled]);

  const handleRefresh = useCallback(async (silent = false) => {
    if (!employee) return;
    if (!silent) setIsRefreshing(true);
    
    try {
      const freshData = await fetchEmployeeData(employee.p_id);
      
      const newNotifs: AppNotification[] = [];
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });

      // Retrieve previous data from LocalStorage to allow cross-session notifications
      const cacheKey = `emp_cache_${employee.p_id}`;
      const cachedDataStr = localStorage.getItem(cacheKey);
      const cachedData = cachedDataStr ? JSON.parse(cachedDataStr) : null;

      const getRecordKey = (r: GenericRecord) => `${r.name.trim()}-${r.amount}-${r.date?.trim() || 'no-date'}`;

      const checkForNewRecords = (
        oldArr: GenericRecord[], 
        newArr: GenericRecord[], 
        singularLabel: string,
        categoryLabel: string,
        type: NotificationType,
        priority: NotificationPriority
      ) => {
        // If no cached data exists (first login ever), we don't notify to avoid spam
        // We only notify if we have a baseline to compare against
        if (!cachedData) return;

        const oldKeys = new Set(oldArr.map(getRecordKey));
        const addedItems = newArr.filter(r => !oldKeys.has(getRecordKey(r)));

        if (addedItems.length > 0) {
          if (addedItems.length === 1) {
            const item = addedItems[0];
            newNotifs.push({
              id: Date.now() + Math.random(),
              title: `${singularLabel} جديدة`,
              message: `تم إضافة ${singularLabel}: ${item.name} بقيمة ${item.amount.toLocaleString()}`,
              time: timeStr,
              timestamp: Date.now(),
              read: false,
              type,
              priority
            });
          } else {
             newNotifs.push({
              id: Date.now() + Math.random(),
              title: `تحديث في ${categoryLabel}`,
              message: `تم إضافة ${addedItems.length} سجلات جديدة في ${categoryLabel}.`,
              time: timeStr,
              timestamp: Date.now(),
              read: false,
              type,
              priority
            });
          }
        }
      };

      // Use cached data as baseline if available, otherwise fallback to current (which means no diff on first run)
      const baselineBonuses = cachedData ? cachedData.bonuses : employee.bonuses;
      const baselineDispatches = cachedData ? cachedData.dispatches : employee.dispatches;
      const baselineExtra = cachedData ? cachedData.extra_hours : employee.extra_hours;
      const baselineSalary = cachedData ? cachedData.salary_history : employee.salary_history;

      // 1. Check Bonuses (Financial, Normal Priority)
      checkForNewRecords(baselineBonuses, freshData.bonuses, 'مكافأة', 'سجل المكافآت', 'admin', 'normal');
      
      // 2. Check Dispatches (Admin, Normal Priority)
      checkForNewRecords(baselineDispatches, freshData.dispatches, 'إيفاد', 'سجل الإيفادات', 'admin', 'normal');
      
      // 3. Check Extra Hours (Financial, Normal)
      checkForNewRecords(baselineExtra, freshData.extra_hours, 'ساعات إضافية', 'سجل الإضافي', 'salary', 'normal');

      // 4. Check Salary (Financial, HIGH PRIORITY)
      if (freshData.salary_history.length > 0) {
        const latestFresh = freshData.salary_history[0];
        const latestOld = baselineSalary.length > 0 ? baselineSalary[0] : null;

        // Check against cache to notify even if app was closed
        if (!latestOld || (latestFresh.month !== latestOld.month || latestFresh.year !== latestOld.year)) {
           // Ensure we don't spam if it's the very first load and we match what's on screen, 
           // but `cachedData` check handles that above (if !cachedData, latestOld is from employee).
           // If cachedData exists, and old != new, we notify.
           if (cachedData) {
               newNotifs.push({
                  id: Date.now() + Math.random(),
                  title: 'راتب جديد',
                  message: `تم رفع تفاصيل راتب شهر ${latestFresh.month} لسنة ${latestFresh.year}`,
                  time: timeStr,
                  timestamp: Date.now(),
                  read: false,
                  type: 'salary',
                  priority: 'high' 
               });
           }
        }
      }

      setLastUpdate(now);
      
      // Update Employee State
      if (JSON.stringify(freshData) !== JSON.stringify(employee)) {
         setEmployee(freshData);
      }
      
      // Update Cache
      localStorage.setItem(cacheKey, JSON.stringify(freshData));

      if (newNotifs.length > 0) {
        setNotifications(prev => [...newNotifs, ...prev]);
        const hasHighPriority = newNotifs.some(n => n.priority === 'high');
        playNotificationSound(hasHighPriority ? 'high' : 'normal');

        if (navigator.vibrate) {
           navigator.vibrate(hasHighPriority ? [100, 50, 100] : 200); 
        }
      } else if (!silent) {
        setNotifications(prev => [{
          id: Date.now(),
          title: 'تم التحديث',
          message: 'تم التحقق من جميع السجلات، البيانات مطابقة.',
          time: timeStr,
          timestamp: Date.now(),
          read: false,
          type: 'system',
          priority: 'low'
        }, ...prev]);
      }
      
    } catch (error) {
      if (!silent) alert('فشل تحديث البيانات. يرجى التحقق من الاتصال.');
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [employee, soundEnabled, playNotificationSound]);

  // --- AUTOMATIC UPDATES ---
  useEffect(() => {
    if (!employee) return;
    handleRefresh(true);
    // Updated interval to 15 seconds (15000 ms) for faster notifications
    const intervalId = setInterval(() => handleRefresh(true), 15000); 
    const onFocus = () => handleRefresh(true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [employee, handleRefresh]);


  const handleLogout = () => {
    setEmployee(null);
    setShowWelcome(true);
    setActiveTab('profile');
  };

  const handleMarkRead = (id?: number) => {
    if (id) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleTabClick = (e: React.MouseEvent<HTMLButtonElement>, tabId: string) => {
    setActiveTab(tabId as any);
    const btn = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    const rect = btn.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");
    const rippleContainer = btn.querySelector(".ripple-container");
    if (rippleContainer) {
      rippleContainer.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    }
  };

  // Optimization: Memoize Tab Content to prevent heavy re-renders on notification updates
  const renderContent = useMemo(() => {
    if (!employee) return null;
    switch (activeTab) {
      case 'profile':
        return <ProfileTab employee={employee} onUpdateProfileImage={(img) => setEmployee(prev => prev ? {...prev, p_img: img} : null)} />;
      case 'salary':
        return <SalaryTab employee={employee} />;
      case 'settings':
        return <SettingsTab theme={theme} toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} soundEnabled={soundEnabled} toggleSound={() => setSoundEnabled(!soundEnabled)} onLogout={handleLogout} />;
      default:
        return null;
    }
  }, [activeTab, employee, theme, soundEnabled]); // Dependencies explicitly do NOT include notifications

  if (showWelcome) return <WelcomeScreen onEnter={() => setShowWelcome(false)} />;
  if (!employee) return <LoginScreen onLoginSuccess={setEmployee} />;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0e14] transition-colors duration-500 font-sans pb-32 overflow-x-hidden">
      
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 p-4">
        <div className="max-w-4xl mx-auto bg-white/90 dark:bg-[#151923]/90 backdrop-blur-sm border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
               <Wallet className="w-5 h-5" />
             </div>
             <div>
               <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">بوابة الموظف</h1>
               <div className="flex items-center gap-1">
                 <span className="relative flex h-1.5 w-1.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                 </span>
                 <p className="text-[9px] text-gray-500">
                   محدث: {lastUpdate.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
                 </p>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-2">
            
            <button 
              onClick={() => handleRefresh(false)}
              disabled={isRefreshing}
              className={`w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all ${isRefreshing ? 'bg-indigo-100 dark:bg-indigo-500/20' : ''}`}
              title="تحديث البيانات يدوياً"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Notifications Bell (Triggers Modal) */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationCenter(true)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-90 ${isBellAnimating ? 'animate-bell-ring' : ''}`}
              >
                <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-indigo-500 fill-indigo-500/20' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
            </div>

            <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button onClick={handleLogout} className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* --- NOTIFICATION CENTER MODAL --- */}
      <NotificationCenter 
        isOpen={showNotificationCenter} 
        onClose={() => setShowNotificationCenter(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onClearAll={handleClearAll}
      />

      <main className="max-w-4xl mx-auto px-4 mt-24 animate-in fade-in duration-500">
        {renderContent}
      </main>

      {/* --- Material 3 Bottom Navigation Bar --- */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-8 px-6 pointer-events-none">
        <div className="w-full max-w-[400px] bg-white/95 dark:bg-[#1c212e]/95 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] p-2 flex items-center justify-around pointer-events-auto">
          {[
            { id: 'profile', icon: User, label: 'ملفي', color: 'indigo' },
            { id: 'salary', icon: Wallet, label: 'راتبي', color: 'emerald' },
            { id: 'settings', icon: Settings, label: 'الإعدادات', color: 'slate' },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={(e) => handleTabClick(e, item.id)}
                className="relative flex flex-col items-center justify-center flex-1 py-1 outline-none group overflow-hidden rounded-2xl"
              >
                <div className="ripple-container absolute inset-0 overflow-hidden rounded-2xl pointer-events-none" />
                <div 
                  className={`
                    absolute top-0 w-16 h-8 rounded-full transition-all duration-400 cubic-bezier(0.4, 0, 0.2, 1)
                    ${isActive ? `bg-${item.color}-500/15 opacity-100 scale-x-100` : 'bg-transparent opacity-0 scale-x-0'}
                  `} 
                />
                <div className={`relative z-10 mb-1 transition-all duration-300 ${isActive ? `text-${item.color}-600 dark:text-${item.color}-400` : 'text-gray-400'}`}>
                  <item.icon className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110 stroke-[2.5px]' : 'scale-100 stroke-[1.5px]'}`} />
                </div>
                <span className={`relative z-10 text-[11px] font-bold transition-all duration-300 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <style>{`
        .cubic-bezier { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes bell-ring { 
          0%, 100% { transform: rotate(0deg); } 
          10% { transform: rotate(-20deg); } 
          20% { transform: rotate(20deg); } 
          30% { transform: rotate(-15deg); } 
          40% { transform: rotate(15deg); } 
          50% { transform: rotate(-10deg); } 
          60% { transform: rotate(10deg); } 
          70% { transform: rotate(-5deg); } 
          80% { transform: rotate(5deg); } 
        }
        .animate-bell-ring { animation: bell-ring 0.8s ease-in-out 3; transform-origin: top center; }
        span.ripple {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 600ms linear;
          background-color: rgba(0, 0, 0, 0.1);
          pointer-events: none;
        }
        .dark span.ripple {
          background-color: rgba(255, 255, 255, 0.1);
        }
        @keyframes ripple {
          to { transform: scale(4); opacity: 0; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;