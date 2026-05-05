import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const user = {
    name: "Alex Mitchell",
    email: "alex.mitchell@velocity.com",
    phone: "+1 (555) 012-3456",
    address: "1248 Innovation Way, Suite 400, San Francisco, CA 94105",
    memberSince: "February 2024",
    avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  };

  const recentOrders = [
    {
      id: "#VL-90821",
      product: "VELOCITY AIR MAX X1",
      date: "May 12, 2024",
      total: 220.00,
      status: "DELIVERED",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM"
    },
    {
      id: "#VL-88219",
      product: "CLOUD RACER 2.0",
      date: "May 08, 2024",
      total: 185.00,
      status: "IN TRANSIT",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAz8dC1bhFHEAQ2mtNFLQZxqJmpjz1uJPQ9tyYXoNc7rwV15o7-D75288YdtAAKKdypNXvg0TQPkXwx4KrxVYtGLy1Y8QFAJn59CzNJ5ZIWzxeEPSWLJfwOaVcrAYiFm2wa2WCcg3BqmSlLGKsurmYPaiVyBpPBX8RxDPfdD_cljsNm3rmYifWKbkTaYmRTu4dlqrzVuyXY6Dwy_rNMSZ7ANnXgxhHwSNqWEo--SpdWOepwnSFNzUCcqqtmsZdRJbbjCUv5yW_MigY"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/50">
      <Navbar />

      <main className="flex-1 pt-24 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1100px] mx-auto w-full">
        {/* Top Section: Info & Security */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Personal Info Card */}
          <div className="lg:col-span-2 bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="flex justify-between items-start mb-10">
              <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">Personal Information</h2>
              <button className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-6 py-2 rounded-full text-xs font-bold transition-all">Edit Profile</button>
            </div>

            <div className="flex items-center gap-8 mb-12">
              <div className="relative group cursor-pointer">
                <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-zinc-50" />
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-container text-white rounded-full flex items-center justify-center border-2 border-white">
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black font-space-grotesk text-zinc-900 tracking-tight">{user.name}</h1>
                <p className="text-zinc-400 text-sm font-medium">Member since {user.memberSince}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Email Address</p>
                <p className="font-bold text-zinc-900">{user.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Phone Number</p>
                <p className="font-bold text-zinc-900">{user.phone}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Primary Address</p>
                <p className="font-bold text-zinc-900 max-w-sm">{user.address}</p>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-primary-container rounded-[40px] p-10 text-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-white">verified_user</span>
              </div>
              <h2 className="text-2xl font-black font-space-grotesk mb-4 uppercase italic">Account Security</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-10">
                Keep your credentials updated to ensure secure transactions and early access drops.
              </p>
            </div>
            
            <div className="space-y-4">
              <button className="w-full bg-white text-primary-container font-black py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all">
                Change Password
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
              <button className="w-full bg-white/10 border border-white/10 backdrop-blur-md text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
                Two-Factor Auth
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Orders */}
        <section className="bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">Recent Orders</h2>
            <Link to="/orders" className="text-primary-container font-black text-xs uppercase tracking-widest hover:text-zinc-900 transition-colors">View All Orders</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-zinc-100">
                  <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Product</th>
                  <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Order ID</th>
                  <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Date</th>
                  <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Total</th>
                  <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => (
                  <tr key={idx} className="border-b border-zinc-50 last:border-0 group cursor-pointer">
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-50 rounded-xl p-1 flex items-center justify-center">
                          <img src={order.image} alt={order.product} className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold text-sm text-zinc-900 group-hover:text-primary-container transition-colors">{order.product}</span>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className="text-sm font-bold text-zinc-400">{order.id}</span>
                    </td>
                    <td className="py-6 text-center">
                      <span className="text-sm font-bold text-zinc-900">{order.date}</span>
                    </td>
                    <td className="py-6 text-center">
                      <span className="text-sm font-black text-zinc-900 italic">${order.total.toFixed(2)}</span>
                    </td>
                    <td className="py-6 text-right">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${
                        order.status === 'DELIVERED' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-100 text-blue-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
