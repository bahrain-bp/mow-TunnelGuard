import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  FaChevronLeft, FaChevronRight, FaTachometerAlt, FaList, 
  FaUsers, FaBell, FaUserShield, FaCog, FaShieldAlt, FaFileAlt,
  FaDatabase, FaInfoCircle, FaUser, FaMapMarkedAlt, FaArrowRight,
  FaHistory, FaMicrochip
} from 'react-icons/fa';

interface SidebarProps {
  expanded: boolean;
  toggleSidebar: () => void;
}

// Menu item interface
interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: string;
  badgeColor?: string;
}

// Group menu items by category
interface MenuItemGroup {
  groupTitle: string;
  items: MenuItem[];
}

/**
 * Sidebar Component - Streamlined sidebar with smooth animations and tooltips
 */
const Sidebar: React.FC<SidebarProps> = ({ expanded, toggleSidebar }) => {
  const [location] = useLocation();
  const { userRole, hasPermission } = useAuth();
  const isMobile = useIsMobile();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile && expanded) {
      toggleSidebar();
    }
  }, [location, isMobile]);

  // Determine if a menu item is active based on current location
  const isActive = (path: string) => {
    if (path === '/') {
      return location === path;
    }
    // Check if the current path starts with menu item path (handles nested routes)
    return location.startsWith(path);
  };
  
  // Menu item definitions with role-based access control
  const menuGroups: MenuItemGroup[] = [
    {
      groupTitle: 'Main',
      items: [
        {
          title: 'Dashboard',
          path: '/dashboard',
          icon: <FaTachometerAlt />,
          roles: ['public', 'traffic', 'ministry', 'admin'],
          badge: '3',
          badgeColor: 'danger'
        },
        {
          title: 'Tunnels',
          path: '/tunnels',
          icon: <FaList />,
          roles: ['public', 'traffic', 'ministry', 'admin']
        },
        {
          title: 'Map View',
          path: '/map',
          icon: <FaMapMarkedAlt />,
          roles: ['traffic', 'ministry', 'admin']
        }
      ]
    },
    {
      groupTitle: 'User',
      items: [
        {
          title: 'User Management',
          path: '/users',
          icon: <FaUsers />,
          roles: ['admin']
        },
        {
          title: 'Alerts',
          path: '/alerts',
          icon: <FaBell />,
          roles: ['traffic', 'ministry', 'admin'],
          badge: '5',
          badgeColor: 'warning'
        },
        {
          title: 'Profile',
          path: '/profile',
          icon: <FaUser />,
          roles: ['public', 'traffic', 'ministry', 'admin']
        }
      ]
    },
    {
      groupTitle: 'System',
      items: [
        {
          title: 'Sensors',
          path: '/sensors',
          icon: <FaDatabase />,
          roles: ['ministry', 'admin']
        },
        {
          title: 'Operations Logs',
          path: '/logs',
          icon: <FaHistory />,
          roles: ['traffic', 'ministry', 'admin'],
          badge: 'New',
          badgeColor: 'success'
        },
        {
          title: 'Hardware Impact',
          path: '/logs?tab=hardware',
          icon: <FaMicrochip />,
          roles: ['traffic', 'ministry', 'admin']
        },
        {
          title: 'Settings',
          path: '/settings',
          icon: <FaCog />,
          roles: ['admin']
        },
        {
          title: 'Documentation',
          path: '/docs',
          icon: <FaFileAlt />,
          roles: ['traffic', 'ministry', 'admin']
        },
        {
          title: 'About',
          path: '/about',
          icon: <FaInfoCircle />,
          roles: ['public', 'traffic', 'ministry', 'admin']
        }
      ]
    }
  ];
  
  // Filter menu items based on user role permissions
  const filteredMenuGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      !item.roles || hasPermission(item.roles)
    )
  })).filter(group => group.items.length > 0);
  
  return (
    <aside className={`sidebar-container ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-nav">
        {/* Logo section */}
        <div className="sidebar-logo">
          <div className="d-flex align-items-center">
            <FaShieldAlt className="logo-icon" />
            {expanded && (
              <span className="logo-text ms-2">
                TunnelGuard
                <span className="text-primary fw-bold">Pro</span>
              </span>
            )}
          </div>
          
          {/* Improved toggle button with better positioning */}
          <button 
            className="sidebar-toggle-btn" 
            onClick={toggleSidebar} 
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? <FaChevronLeft size={14} /> : <FaChevronRight size={14} />}
          </button>
        </div>
        
        {/* Menu sections */}
        <div className="sidebar-menu">
          {filteredMenuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="menu-section">
              {/* Only show group titles when expanded */}
              {expanded && (
                <h6 className="menu-section-title">{group.groupTitle}</h6>
              )}
              
              {/* Menu items */}
              <ul className="menu-items">
                {group.items.map((item, itemIndex) => {
                  const itemKey = `${group.groupTitle}-${item.title}`;
                  const isItemActive = isActive(item.path);
                  
                  return (
                    <li key={itemIndex} className="menu-item-wrapper">
                      <Link
                        href={item.path}
                        className={`menu-item ${isItemActive ? 'active' : ''}`}
                        onMouseEnter={() => setHoveredItem(itemKey)}
                        onMouseLeave={() => setHoveredItem(null)}
                        data-tooltip={!expanded ? item.title : undefined}
                      >
                        <div className="d-flex align-items-center justify-content-between w-100">
                          <div className="d-flex align-items-center">
                            <span className="item-icon">{item.icon}</span>
                            {expanded && <span className="item-text">{item.title}</span>}
                          </div>
                          
                          {/* Badge (notifications, etc.) */}
                          {expanded && item.badge && (
                            <span className={`badge bg-${item.badgeColor || 'primary'} rounded-pill ms-2`}>
                              {item.badge}
                            </span>
                          )}
                          
                          {/* Only show badges on collapsed sidebar when hovered */}
                          {!expanded && item.badge && hoveredItem === itemKey && (
                            <span className={`badge bg-${item.badgeColor || 'primary'} position-absolute top-0 end-0 translate-middle rounded-circle`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;