import React from 'react';
import { useUserStatus } from '../../hooks/useUserStatus';

/**
 * OnlineBadge
 *
 * Hiển thị chấm xanh/xám chỉ trạng thái online của một user.
 *
 * Props:
 *   userId  {number|string}  - ID user cần check
 *   size    {'sm'|'md'|'lg'} - Kích thước dot (mặc định 'md')
 *   className {string}       - Class tuỳ chỉnh thêm
 *
 * Ví dụ dùng:
 *   <OnlineBadge userId={user.id} size="sm" />
 */
const sizeMap = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3.5 h-3.5',
};

const OnlineBadge = ({ userId, size = 'md', className = '' }) => {
  const { isOnline } = useUserStatus();
  const online = isOnline(userId);

  return (
    <span
      className={`
        inline-block rounded-full border-2 border-white flex-shrink-0
        ${sizeMap[size] ?? sizeMap.md}
        ${online ? 'bg-emerald-500' : 'bg-zinc-300'}
        ${className}
      `}
      title={online ? 'Đang online' : 'Offline'}
      aria-label={online ? 'Đang online' : 'Offline'}
    />
  );
};

export default OnlineBadge;