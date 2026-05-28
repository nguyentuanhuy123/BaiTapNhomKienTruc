import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';

const UserStatusContext = createContext(null);

const WS_URL = (import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:9000') + '/ws';

export const UserStatusProvider = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const clientRef = useRef(null);
  const [statusMap, setStatusMap] = useState({});
  const [connected, setConnected] = useState(false);

  const updateStatus = useCallback((userId, status) => {
    setStatusMap((prev) => ({ ...prev, [String(userId)]: status }));
  }, []);

  const sendAdminNotification = useCallback((title, message, type = 'general') => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: '/topic/admin-notifications',
        body: JSON.stringify({
          title,
          message,
          type,
          time: new Date().toLocaleTimeString('vi-VN')
        })
      });
    }
  }, []);

  useEffect(() => {
    // 1. Kiểm tra điều kiện kết nối
    if (!isLoggedIn || !user?.id) {
      if (clientRef.current) {
        console.info('[WS] Logging out, deactivating...');
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setConnected(false);
      setStatusMap({});
      return;
    }

    // 2. Tránh tạo nhiều connection khi component re-render
    if (clientRef.current?.active) return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        userId: String(user.id), // Gửi userId để Backend nhận diện trong SessionConnectedEvent
      },
      
      // CẤU HÌNH HEARTBEAT: Khớp với thông số 10000ms (10s) của Backend
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      
      reconnectDelay: 5000,

      onConnect: () => {
        setConnected(true);
        console.info('[WS] Connected successfully for user:', user.id);

        stompClient.subscribe('/topic/status', (message) => {
          try {
            const data = JSON.parse(message.body);

            updateStatus(data.userId, data.status);

            const isCurrentUser = String(data.userId) === String(user?.id);

            // ✅ force logout cho đúng user hiện tại
            if (isCurrentUser && data.status === 'FORCE_LOGOUT') {
              window.dispatchEvent(new Event('force-logout'));
              return;
            }

            // Nếu muốn giữ ONLINE/OFFLINE để hiển thị badge thì cứ để nguyên
          } catch (err) {
            console.error('[WS] Message parsing error:', err);
          }
        });

        // Đăng ký nhận thông báo real-time của Admin nếu user hiện tại có quyền Admin
        const role = localStorage.getItem('role');
        if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
          console.info('[WS Admin] Subscribing to admin notifications...');
          stompClient.subscribe('/topic/admin-notifications', (message) => {
            try {
              const data = JSON.parse(message.body);
              notificationService.addAdminNotification(data.title, data.message, data.type);
            } catch (err) {
              console.error('[WS Admin] Error parsing admin notification:', err);
            }
          });
        }
      },

      onDisconnect: () => {
        setConnected(false);
        console.info('[WS] Disconnected');
      },

      onStompError: (frame) => {
        console.error('[WS] STOMP Protocol Error:', frame.headers['message']);
      },
      
      onWebSocketClose: () => {
        setConnected(false);
        console.info('[WS] WebSocket Closed');
      }
    });

    stompClient.activate();
    clientRef.current = stompClient;

    // 3. Cleanup function: QUAN TRỌNG để tránh Zombie session
    return () => {
      if (clientRef.current) {
        console.info('[WS] Cleaning up connection...');
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [isLoggedIn, user?.id, updateStatus]);

  return (
    <UserStatusContext.Provider value={{ statusMap, connected, updateStatus, sendAdminNotification }}>
      {children}
    </UserStatusContext.Provider>
  );
};

export const useUserStatusContext = () => {
  const ctx = useContext(UserStatusContext);
  if (!ctx) throw new Error('useUserStatusContext phải dùng trong UserStatusProvider');
  return ctx;
};