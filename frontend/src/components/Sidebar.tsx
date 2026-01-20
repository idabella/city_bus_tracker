import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Home,
  MapPin,
  Building2,
  Route,
  Bus,
  Users,
  Calendar,
  Ticket,
  Wrench,
  AlertTriangle,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { icon: Home, label: 'Home', path: '/', entity: 'home' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', entity: 'dashboard' },
  { icon: MapPin, label: 'Cities', path: '/cities', entity: 'cities' },
  { icon: Building2, label: 'Stations', path: '/stations', entity: 'stations' },
  { icon: Route, label: 'Bus Lines', path: '/bus-lines', entity: 'busLines' },
  { icon: Bus, label: 'Buses', path: '/buses', entity: 'buses' },
  { icon: Users, label: 'Drivers', path: '/drivers', entity: 'drivers' },
  { icon: Calendar, label: 'Trips', path: '/trips', entity: 'trips' },
  { icon: Ticket, label: 'Tickets', path: '/tickets', entity: 'tickets' },
  { icon: Ticket, label: 'Subscriptions', path: '/subscriptions', entity: 'subscriptions' },
  { icon: Wrench, label: 'Maintenance', path: '/maintenance', entity: 'maintenance' },
  { icon: AlertTriangle, label: 'Incidents', path: '/incidents', entity: 'incidents' },
];

export function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, roleDefinition, logout, hasAccess, can } = useAuth();

  const filteredMenu = user
    ? menuItems.filter((item) => {
        if (item.path === '/') return true;
        const canViewEntity = item.entity ? can(item.entity, 'view') : true;
        return hasAccess(item.path) && canViewEntity;
      })
    : menuItems;
  const visibleMenuItems = filteredMenu.length ? filteredMenu : menuItems;

  const SidebarContent = ({ isMobile = false }) => (
    <>
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isCollapsed && (
              <>
                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                {!isMobile && (
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">BusManager</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Management System</p>
                  </div>
                )}
              </>
            )}
            {isCollapsed && isMobile && (
              <>
                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">BusManager</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Management System</p>
                </div>
              </>
            )}
          </div>
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              title={isCollapsed ? 'Ouvrir la sidebar' : 'Fermer la sidebar'}
            >
              {isCollapsed ? (
                <PanelLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          )}
        </div>
      </div>

      {user && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.displayName}</p>
          {roleDefinition && (
            <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-300">{roleDefinition.label}</p>
          )}
          <button
            onClick={logout}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-300 transition"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className="block"
              title={isCollapsed && !isMobile ? item.label : ''}
            >
              <motion.div
                whileHover={{ x: isCollapsed && !isMobile ? 0 : 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                } ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
              >
                <Icon className="flex-shrink-0 w-5 h-5" />
                {(!isCollapsed || isMobile) && <span>{item.label}</span>}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle button at the bottom */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 ${
            isCollapsed && !isMobile ? 'justify-center' : ''
          }`}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun className="flex-shrink-0 w-5 h-5" />
          ) : (
            <Moon className="flex-shrink-0 w-5 h-5" />
          )}
          {(!isCollapsed || isMobile) && (
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg lg:hidden top-4 left-4"
      >
        <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
      </button>

      {/* Sidebar Desktop avec collapse */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="sticky top-0 hidden h-screen bg-white dark:bg-[#1a1f2e] border-r border-gray-200 dark:border-gray-800 lg:flex lg:flex-col"
      >
        <SidebarContent isMobile={false} />
      </motion.aside>

      {/* Sidebar Mobile */}
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-[#1a1f2e] shadow-2xl lg:hidden"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute p-2 rounded-lg top-4 right-4 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5 text-gray-900 dark:text-white" />
            </button>
            <SidebarContent isMobile={true} />
          </motion.aside>
        </>
      )}
    </>
  );
}