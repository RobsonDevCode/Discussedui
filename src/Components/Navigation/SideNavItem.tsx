import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoHomeOutline, IoPersonOutline  } from "react-icons/io5";
import { FaUsers } from "react-icons/fa";
import { ItemHover } from '../Hover';
import { RiArrowLeftDoubleFill } from 'react-icons/ri';

export function SideNavItem() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const menuItems = [
        { icon: IoHomeOutline, label: "Home", to: "/" },
        {icon: IoPersonOutline, label: "Login" ,to: "/login" },
        { icon: FaUsers, label: "Following", to: "/login" }
    ]

    return (
        <div className="flex flex-col mt-4 gap-2 cursor-pointer">
          <nav className="flex flex-col gap-2">
                {menuItems.map((item) => (
                  <ItemHover key={item.label}>
                    <Link
                      to={item.to}
                      className={`
                        flex items-center px-2 py-2 text-gray-300 transition-colors no-underline
                        ${location.pathname === item.to ? 'text-white' : ''}
                      `}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <item.icon size={24} />
                      {isExpanded && (
                        <span className="ml-4">{item.label}</span>
                      )}
                    </Link>
                  </ItemHover>
                ))}
              </nav>
        </div>

    )
}