import React, { useEffect, useState } from 'react';
import { subscribeSecurityEvents, RealtimeSecurityEvent } from '../services/realtimeService';
import { AlertTriangle, Eye, EyeOff, WifiOff, Lock, Filter, User } from 'lucide-react';

export type SecurityEvent = {
  type: string;
  message: string;
  timestamp: number;
};

const eventIcon = (type: string) => {
  switch (type) {
    case 'tab-switch':
      return <EyeOff className="h-5 w-5 text-yellow-600" />;
    case 'dev-tools':
      return <Eye className="h-5 w-5 text-red-600" />;
    case 'network-loss':
      return <WifiOff className="h-5 w-5 text-red-600" />;
    case 'fullscreen-exit':
      return <Lock className="h-5 w-5 text-red-600" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
  }
};

interface RealtimeMonitorProps {
  onClose: () => void;
}

const RealtimeMonitor: React.FC<RealtimeMonitorProps> = ({ onClose }) => {
  const [events, setEvents] = useState<RealtimeSecurityEvent[]>([]);
  const [filterUser, setFilterUser] = useState<string>('');
  const [grouped, setGrouped] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeSecurityEvents('securityEvents', (newEvents) => {
      setEvents(newEvents);
    });
    return () => unsubscribe();
  }, []);

  const uniqueUsers = [...new Set(events.map(e => e.userId))];
  const filteredEvents = events.filter(e => !filterUser || e.userId === filterUser);

  const groupedEvents = grouped
    ? filteredEvents.reduce((acc, evt) => {
        const key = evt.userId;
        acc[key] = acc[key] || [];
        acc[key].push(evt);
        return acc;
      }, {} as Record<string, RealtimeSecurityEvent[]>)
    : { all: filteredEvents };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Live Security Monitor</h2>

        {/* Filters */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm"
            >
              <option value="">All users</option>
              {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={grouped}
                onChange={(e) => setGrouped(e.target.checked)}
                className="rounded"
              />
              <span>Group by user</span>
            </label>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
          >
            Close
          </button>
        </div>

        {/* Events */}
        <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
          {Object.keys(groupedEvents).length === 0 && (
            <p className="text-gray-600 dark:text-gray-300 text-sm">No security events recorded.</p>
          )}
          {Object.entries(groupedEvents).map(([userId, userEvents]) => (
            <div key={userId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <User className="h-4 w-4 mr-2 text-indigo-600" />
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{userId}</span>
                <span className="ml-auto text-xs text-gray-500">{userEvents.length} events</span>
              </div>
              <div className="space-y-2">
                {userEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-2 rounded-md bg-gray-50 dark:bg-gray-900/40">
                    {eventIcon(evt.type)}
                    <div className="text-sm text-gray-800 dark:text-gray-200">
                      <p>{evt.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(evt.timestamp).toLocaleTimeString()} – {evt.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealtimeMonitor;
