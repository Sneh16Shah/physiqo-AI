import React from 'react';
import { AppNotification } from '../../api/notification.api';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClose
}) => {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-surface-900 border border-surface-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[24rem]">
      <div className="p-4 border-b border-surface-800 flex justify-between items-center bg-surface-950/50">
        <h3 className="font-semibold text-white">Notifications</h3>
        <div className="flex items-center gap-3">
          <button onClick={onMarkAllRead} className="text-xs text-brand-500 hover:text-brand-400 font-medium">
            Mark all read
          </button>
          <button onClick={onClose} className="text-surface-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      </div>
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-surface-500 text-sm">No new notifications</div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`p-4 border-b border-surface-800/50 hover:bg-surface-800 cursor-pointer transition-colors ${!n.is_read ? 'bg-brand-500/5' : ''}`}
              onClick={() => {
                if (!n.is_read) onMarkRead(n.id);
              }}
            >
              <div className="flex gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.is_read ? 'bg-brand-500 shadow-[0_0_8px_rgba(var(--brand-500),0.8)]' : 'bg-surface-700'}`} />
                <div>
                  <div className={`text-sm ${!n.is_read ? 'font-semibold text-white' : 'font-medium text-surface-200'}`}>{n.title}</div>
                  <div className="text-sm text-surface-400 mt-1">{n.message}</div>
                  <div className="text-xs text-surface-500 mt-2 font-medium">
                    {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
