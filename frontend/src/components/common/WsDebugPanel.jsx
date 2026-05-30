import React, { useState } from 'react';
import { useUserStatusContext } from '../../contexts/UserStatusContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * WsDebugPanel
 *
 * Panel debug chỉ hiển thị ở môi trường development.
 * Cho phép kiểm tra kết nối WebSocket và statusMap hiện tại.
 *
 * Thêm vào cuối App.jsx (chỉ dev):
 *   {import.meta..env.DEV && <WsDebugPanel />}
 */
const WsDebugPanel = () => {
  const { statusMap, connected } = useUserStatusContext();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] font-mono text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`px-3 py-1.5 rounded-full font-bold shadow-lg border transition-all ${
          connected
            ? 'bg-emerald-500 text-white border-emerald-600'
            : 'bg-zinc-400 text-white border-zinc-500'
        }`}
      >
        WS {connected ? '● LIVE' : '○ OFF'}
      </button>

      {open && (
        <div className="mt-2 bg-zinc-900 text-zinc-100 rounded-2xl shadow-2xl p-4 min-w-[240px] max-h-[320px] overflow-y-auto">
          <p className="font-bold text-zinc-400 mb-2">
            My userId: <span className="text-white">{user?.id ?? '—'}</span>
          </p>
          <p className="font-bold text-zinc-400 mb-1">statusMap:</p>
          {Object.keys(statusMap).length === 0 ? (
            <p className="text-zinc-500 italic">Chưa có data</p>
          ) : (
            <ul className="space-y-1">
              {Object.entries(statusMap).map(([uid, status]) => (
                <li key={uid} className="flex justify-between gap-4">
                  <span className="text-zinc-300">user {uid}</span>
                  <span
                    className={
                      status === 'ONLINE' ? 'text-emerald-400' : 'text-zinc-500'
                    }
                  >
                    {status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default WsDebugPanel;