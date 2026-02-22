import React, { useState, useMemo } from 'react';
import { 
  X, CheckCheck, Trash2, Filter, Bell, 
  DollarSign, Briefcase, Info, AlertCircle, Calendar,
  ArrowUpDown, Check
} from 'lucide-react';
import { AppNotification, NotificationType } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id?: number) => void;
  onClearAll: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onClearAll
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'financial' | 'general'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'priority'>('newest');

  // Filter and Sort Logic
  const processedNotifications = useMemo(() => {
    let filtered = notifications;

    if (activeFilter === 'financial') {
      filtered = notifications.filter(n => n.type === 'salary' || n.type === 'admin');
    } else if (activeFilter === 'general') {
      filtered = notifications.filter(n => n.type === 'general' || n.type === 'system');
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityWeight = { high: 3, normal: 2, low: 1 };
        const diff = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (diff !== 0) return diff;
      }
      return b.timestamp - a.timestamp;
    });
  }, [notifications, activeFilter, sortBy]);

  // Grouping Logic (Today, Yesterday, Older)
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: AppNotification[] } = {
      'اليوم': [],
      'أمس': [],
      'أقدم': []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;

    processedNotifications.forEach(n => {
      if (n.timestamp >= today) {
        groups['اليوم'].push(n);
      } else if (n.timestamp >= yesterday) {
        groups['أمس'].push(n);
      } else {
        groups['أقدم'].push(n);
      }
    });

    return groups;
  }, [processedNotifications]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'salary': return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case 'admin': return <Briefcase className="w-5 h-5 text-blue-500" />;
      case 'system': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="w-full md:w-[450px] md:rounded-[2.5rem] bg-[#f8fafc] dark:bg-[#151923] h-[85vh] md:h-[80vh] flex flex-col shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 duration-300 rounded-t-[2.5rem] pointer-events-auto border border-white/20">
        
        {/* Header */}
        <div className="p-6 pb-2 shrink-0">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <Bell className="w-5 h-5" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">الإشعارات</h2>
                    <p className="text-xs text-slate-500 font-bold">لديك {notifications.filter(n => !n.read).length} إشعار غير مقروء</p>
                 </div>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-white/10 rounded-full hover:bg-slate-200 transition-colors">
                 <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
           </div>

           {/* Actions Toolbar */}
           <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex bg-slate-200 dark:bg-white/5 p-1 rounded-xl">
                 {(['all', 'financial', 'general'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeFilter === filter ? 'bg-white dark:bg-indigo-500 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                    >
                       {filter === 'all' ? 'الكل' : filter === 'financial' ? 'المالية' : 'عام'}
                    </button>
                 ))}
              </div>
              
              <button 
                onClick={() => setSortBy(prev => prev === 'newest' ? 'priority' : 'newest')}
                className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                 <ArrowUpDown className="w-3 h-3" />
                 {sortBy === 'newest' ? 'الأحدث' : 'الأهمية'}
              </button>
           </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
           {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
                 <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                    <Bell className="w-8 h-8 text-slate-300" />
                 </div>
                 <p className="text-sm font-bold text-slate-400">لا توجد إشعارات حالياً</p>
              </div>
           ) : (
              Object.entries(groupedNotifications).map(([group, items]) => {
                 const typedItems = items as AppNotification[];
                 return (
                 typedItems.length > 0 && (
                    <div key={group} className="animate-in fade-in duration-500">
                       <h3 className="text-xs font-black text-slate-400 mb-3 px-2 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {group}
                       </h3>
                       <div className="space-y-3">
                          {typedItems.map((notif) => (
                             <div 
                               key={notif.id}
                               onClick={() => onMarkRead(notif.id)}
                               className={`
                                  relative p-4 rounded-2xl border transition-all duration-200 active:scale-[0.98] cursor-pointer group overflow-hidden
                                  ${notif.read 
                                    ? 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 opacity-70' 
                                    : 'bg-white dark:bg-[#1c212e] border-indigo-100 dark:border-indigo-500/20 shadow-sm'
                                  }
                                  ${notif.priority === 'high' && !notif.read ? 'ring-1 ring-red-500/50 dark:ring-red-400/50' : ''}
                               `}
                             >
                                {notif.priority === 'high' && !notif.read && (
                                   <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500"></div>
                                )}
                                
                                <div className="flex gap-4">
                                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.read ? 'bg-slate-50 dark:bg-white/5' : 'bg-indigo-50 dark:bg-indigo-500/10'}`}>
                                      {getIcon(notif.type)}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start mb-1">
                                         <h4 className={`text-sm font-bold truncate ${notif.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                            {notif.title}
                                         </h4>
                                         <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                                      </div>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                         {notif.message}
                                      </p>
                                   </div>
                                </div>
                                
                                {!notif.read && (
                                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">تحديد كمقروء</span>
                                  </div>
                                )}
                             </div>
                          ))}
                       </div>
                    </div>
                 )
              )})
           )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white/50 dark:bg-[#151923]/50 backdrop-blur-md rounded-b-[2.5rem] shrink-0">
           <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onMarkRead()}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 transition-colors"
              >
                 <CheckCheck className="w-4 h-4" />
                 تحديد الكل كمقروء
              </button>
              <button 
                onClick={onClearAll}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-100 transition-colors"
              >
                 <Trash2 className="w-4 h-4" />
                 مسح الكل
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;