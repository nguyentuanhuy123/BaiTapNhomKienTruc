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
  const { user, isLoggedIn, forceLogout } = useAuth();
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

    if (clientRef.current?.active) return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        userId: String(user.id),
      },
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: 5000,

      onConnect: () => {
        setConnected(true);
        console.info('[WS] Connected successfully for user:', user.id);

        stompClient.subscribe('/topic/status', (message) => {
          try {
            console.log('[WS] message body =', message.body);

            const data = JSON.parse(message.body);
            updateStatus(data.userId, data.status);

            const currentUserId = String(user?.id);
            const incomingUserId = String(data.userId);

            if (incomingUserId === currentUserId && data.status === 'FORCE_LOGOUT') {
              console.warn('[WS] FORCE_LOGOUT received for current user');
              forceLogout();
            }
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

    // stompClient.activate();
    // clientRef.current = stompClient;

    return () => {
      if (clientRef.current) {
        console.info('[WS] Cleaning up connection...');
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [isLoggedIn, user?.id, updateStatus, forceLogout]);

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