import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  MenuSquare, 
  MonitorPlay, 
  CreditCard, 
  Download, 
  Settings 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/posts', icon: FileText, label: 'Posts' },
    { to: '/downloads', icon: Download, label: 'Downloads' },
  ];

  if (user?.role === 'superadmin') {
    links.push(
      { to: '/menus', icon: MenuSquare, label: 'Menus' },
      { to: '/ads', icon: MonitorPlay, label: 'Ads' },
      { to: '/payments', icon: CreditCard, label: 'Payments' },
      { to: '/settings', icon: Settings, label: 'Settings' }
    );
  }

  return (
    <aside className="w-64 bg-dark-900 border-r border-dark-700/50 flex flex-col hidden lg:flex h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-dark-700/50">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-500">
          Admin Panel
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all
              ${isActive 
                ? 'bg-primary-500/10 text-primary-400' 
                : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
