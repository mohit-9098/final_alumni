import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import {
  Home,
  Users,
  Briefcase,
  FileText,
  Calendar,
  Bell,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen,
  Award,
  BarChart3,
  UserCheck
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Layout = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        current: location.pathname === '/dashboard',
      },
      {
        name: 'Profile',
        href: '/profile',
        icon: User,
        current: location.pathname === '/profile',
      },
      {
        name: 'Messages',
        href: '/messages',
        icon: MessageSquare,
        current: location.pathname.startsWith('/messages'),
      },
      {
        name: 'Notifications',
        href: '/notifications',
        icon: Bell,
        current: location.pathname === '/notifications',
        badge: unreadCount > 0 ? unreadCount : null,
      },
      {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
        current: location.pathname === '/settings',
      },
    ];

    const roleSpecificItems = [];

    if (user?.role === 'student') {
      roleSpecificItems.push(
        {
          name: 'Alumni Directory',
          href: '/alumni',
          icon: Users,
          current: location.pathname === '/alumni',
        },
        {
          name: 'Jobs',
          href: '/jobs',
          icon: Briefcase,
          current: location.pathname.startsWith('/jobs'),
        },
        {
          name: 'MOUs',
          href: '/mou',
          icon: FileText,
          current: location.pathname.startsWith('/mou'),
        },
        {
          name: 'Events',
          href: '/events',
          icon: Calendar,
          current: location.pathname.startsWith('/events'),
        },
        {
          name: 'Notices',
          href: '/notices',
          icon: BookOpen,
          current: location.pathname.startsWith('/notices'),
        }
      );
    }

    if (user?.role === 'alumni') {
      roleSpecificItems.push(
        {
          name: 'Student Directory',
          href: '/alumni',
          icon: Users,
          current: location.pathname === '/alumni',
        },
        {
          name: 'Connection Requests',
          href: '/connections',
          icon: UserCheck,
          current: location.pathname === '/connections',
        },
        {
          name: 'Jobs',
          href: '/jobs',
          icon: Briefcase,
          current: location.pathname.startsWith('/jobs'),
        },
        {
          name: 'Post Job',
          href: '/jobs/post',
          icon: Briefcase,
          current: location.pathname === '/jobs/post',
        },
        {
          name: 'MOUs',
          href: '/mou',
          icon: FileText,
          current: location.pathname.startsWith('/mou'),
        },
        {
          name: 'Events',
          href: '/events',
          icon: Calendar,
          current: location.pathname.startsWith('/events'),
        },
        {
          name: 'Notices',
          href: '/notices',
          icon: BookOpen,
          current: location.pathname.startsWith('/notices'),
        }
      );
    }

    if (user?.role === 'admin') {
      roleSpecificItems.push(
        {
          name: 'User Management',
          href: '/admin/users',
          icon: Users,
          current: location.pathname === '/admin/users',
        },
        {
          name: 'Job Management',
          href: '/admin/jobs',
          icon: Briefcase,
          current: location.pathname === '/admin/jobs',
        },
        {
          name: 'MOU Management',
          href: '/admin/mou',
          icon: FileText,
          current: location.pathname === '/admin/mou',
        },
        {
          name: 'Event Management',
          href: '/admin/events',
          icon: Calendar,
          current: location.pathname === '/admin/events',
        },
        {
          name: 'Notice Management',
          href: '/admin/notices',
          icon: BookOpen,
          current: location.pathname === '/admin/notices',
        },
        {
          name: 'Analytics',
          href: '/admin/analytics',
          icon: BarChart3,
          current: location.pathname === '/admin/analytics',
        }
      );
    }

    return [...baseItems, ...roleSpecificItems];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-x-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={
        `fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 shadow-soft-lg dark:shadow-none border-r border-slate-100 dark:border-slate-700 transform transition-all duration-300 ease-in-out lg:static lg:inset-0 lg:shadow-none
        ${isCollapsed ? 'w-20 lg:w-20' : 'w-64 lg:w-64'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        scrollbar-thin overflow-hidden lg:overflow-y-auto lg:h-screen lg:sticky top-0 lg:flex-shrink-0
      `}>
        <div className="flex flex-col h-full min-h-screen">
          {/* Logo */}

  <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
    <div className="flex items-center min-w-0">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-soft flex-shrink-0">
        <Award className="w-5 h-5 text-white" />
      </div>
      <span className={`ml-3 truncate transition-all duration-200 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-200 ${isCollapsed ? 'hidden' : 'block'}`}>
        Alumni Portal
      </span>
    </div>
    {/* Collapse toggle (desktop) */}
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className="lg:block hidden p-1.5 rounded-md text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
    </button>
    {/* Mobile close */}
    <button
      onClick={() => setSidebarOpen(false)}
      className="lg:hidden p-1 rounded-md text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <X className="w-5 h-5" />
    </button>
  </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={
                    `sidebar-item flex items-center justify-between group relative
                    ${item.current ? 'sidebar-item-active' : 'sidebar-item-inactive'}`
                  }
                  onClick={() => setSidebarOpen(false)}
                  title={item.name}
                >
                  <div className="flex items-center truncate">
                    <Icon className={`w-5 h-5 mr-2 lg:mr-3 flex-shrink-0 transition-transform group-hover:scale-110 ${isCollapsed ? 'scale-110' : ''}`} />
                    <span className={`truncate transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 lg:hidden' : 'block'}`}>
                      {item.name}
                    </span>
                  </div>
                  {item.badge && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-error-500 rounded-full min-w-[1.25rem] h-5 flex-shrink-0 ml-2">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">
                  {user?.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 dark:text-slate-300 hover:text-error-600 hover:bg-error-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 relative z-10 overflow-hidden min-h-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-all duration-300">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page title */}
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
                {navigationItems.find(item => item.current)?.name || 'Dashboard'}
              </h1>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative p-2 rounded-full text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-300 dark:hover:text-primary-400 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 border-2 border-white rounded-full"></span>
                )}
              </Link>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* Profile dropdown */}

              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-slate-700 pr-2">
                    {user?.name}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-xl shadow-soft-lg border border-slate-200/60 dark:border-slate-700/80 py-1 z-50 transform origin-top-right transition-all">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
