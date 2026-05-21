import React from 'react';
import OnlineBadge from './OnlineBadge';

/**
 * UserAvatar
 *
 * Avatar tròn tích hợp sẵn chấm online realtime.
 *
 * Props:
 *   userId      {number|string}   - ID user
 *   avatarUrl   {string}          - URL ảnh avatar
 *   name        {string}          - Tên hiển thị (dùng làm alt)
 *   size        {'sm'|'md'|'lg'}  - Kích thước tổng thể
 *   showBadge   {boolean}         - Có hiển thị badge online không (default: true)
 *   className   {string}
 *
 * Ví dụ:
 *   <UserAvatar userId={user.id} avatarUrl={user.avatarUrl} name={user.fullName} />
 */

const containerSize = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};

const badgePosition = {
  sm: 'bottom-0 right-0',
  md: 'bottom-0 right-0',
  lg: 'bottom-0.5 right-0.5',
};

const badgeSize = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

const UserAvatar = ({
  userId,
  avatarUrl,
  name = 'User',
  size = 'md',
  showBadge = true,
  className = '',
}) => {
  return (
    <div className={`relative inline-flex flex-shrink-0 ${containerSize[size]} ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        // Fallback: hiển thị chữ cái đầu tên
        <div className="w-full h-full rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-sm select-none">
          {name.charAt(0).toUpperCase()}
        </div>
      )}

      {showBadge && userId && (
        <OnlineBadge
          userId={userId}
          size={badgeSize[size]}
          className={`absolute ${badgePosition[size]}`}
        />
      )}
    </div>
  );
};

export default UserAvatar;