import { useEffect, useRef, useCallback } from 'react';
import { useUserStatusContext } from '../contexts/UserStatusContext';

/**
 * Hook tiện lợi để check trạng thái online của một hoặc nhiều user.
 *
 * Cách dùng:
 *   const { isOnline, statusMap } = useUserStatus();
 *   isOnline(123)       // true / false
 *   statusMap[123]      // "ONLINE" / "OFFLINE" / undefined
 */
export function useUserStatus() {
  const { statusMap } = useUserStatusContext();

  const isOnline = useCallback(
    (userId) => statusMap[userId] === 'ONLINE',
    [statusMap]
  );

  return { statusMap, isOnline };
}