import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { useAlert } from '../contexts/AlertContext';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert('Không thể tải danh sách người dùng!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = (id) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const newStatus = u.status === 'Active' ? 'Blocked' : 'Active';
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-container mx-auto mb-4"></div>
          <p className="text-zinc-500 font-bold">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 w-full">
      {/* Header */}
      <div>
        <span className="bg-primary-container/10 text-primary-container text-xs px-4 py-1.5 rounded-full font-black uppercase tracking-widest mb-4 inline-block">
          Access Control
        </span>
        <h1 className="text-4xl font-space-grotesk font-black text-zinc-900 leading-none uppercase italic">
          Registered Users
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">
          Xem danh sách người dùng đã đăng ký và quản lý trạng thái tài khoản.
        </p>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Họ & Tên / Email</th>
                <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Quyền hạn (Role)</th>
                <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ngày đăng ký</th>
                <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Trạng thái</th>
                <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold font-space-grotesk text-xs border border-zinc-200">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 leading-tight">{user.fullName || 'N/A'}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      user.role === 'ADMIN' || user.role === 'ROLE_ADMIN' ? 'bg-primary-container text-white' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {user.role || 'USER'}
                    </span>
                  </td>
                  <td className="py-5 text-sm font-bold text-zinc-600">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td className="py-5">
                    <span className={`px-3 py-1 rounded-md text-[9px] font-black tracking-widest ${
                      user.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-5 text-right">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        user.status === 'Active'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {user.status === 'Active' ? 'BLOCK USER' : 'UNBLOCK'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
