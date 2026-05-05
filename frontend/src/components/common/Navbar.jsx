import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  const navLinks = [
    { name: 'SHOP', path: '/' },
    { name: 'EXPLORE', path: '/explore' },
    { name: 'ATHLETES', path: '#' },
    { name: 'TECH', path: '#' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="flex justify-between items-center h-20 px-8 max-w-[1440px] mx-auto">
        <Link to="/" className="text-2xl font-black italic text-zinc-900 tracking-widest font-space-grotesk">AERO-TECH</Link>
        
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-space-grotesk font-bold uppercase tracking-tighter transition-all ${
                location.pathname === link.path 
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button className="material-symbols-outlined text-zinc-900 hover:bg-zinc-100 p-2 rounded-full transition-all duration-200">shopping_cart</button>
          <Link to="/login" className="material-symbols-outlined text-zinc-900 hover:bg-zinc-100 p-2 rounded-full transition-all duration-200">person</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
