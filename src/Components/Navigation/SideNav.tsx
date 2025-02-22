import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { HoverContainer, ItemHover } from '../Hover';
import { SideNavItem } from './SideNavItem';
import { RiArrowLeftDoubleFill, RiArrowRightDoubleFill } from 'react-icons/ri';
import { useState } from 'react';
import { IoCloseOutline, IoHomeOutline, IoPersonOutline } from 'react-icons/io5';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';
import { FaUsers } from 'react-icons/fa';

const SideNav = () => {
        const menuItems = [
            { icon: IoHomeOutline, label: "Home", to: "/" },
            {icon: IoPersonOutline, label: "Login" ,to: "/login" },
            { icon: FaUsers, label: "Following", to: "/login" }
        ]
    
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    return (
        <>
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-black text-white"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <IoCloseOutline size={24} /> : <HiOutlineMenuAlt2 size={24} />}
          </button>
    
          {/* Backdrop */}
          {isMobileOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileOpen(false)}
            />
          )}
    
          {/* Sidebar */}
          <div className={`
            fixed top-0 left-0 min-h-screen max-h-screen overflow-y-auto
            bg-black text-white z-40 transition-all duration-300 ease-in-out
            ${isExpanded ? 'w-64 md:pr-8 pr-3' : 'w-20 pr-3'}
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            pt-2 flex flex-col gap-3 border-r-[1px] pl-[50px]
          `}>
            {/* Logo Section */}
            <div className="flex flex-col gap-4">
              <HoverContainer>
                <Link to="/">
                  <img src="https://img.logoipsum.com/288.svg" 
                       className={`${isExpanded ? 'w-32' : 'w-8'} transition-all`} 
                       alt="Logo" />
                </Link>
              </HoverContainer>
    
              {/* Menu Items */}
              <SideNavItem/>
             
            </div>
          </div>
        </>
      );
};

export default SideNav;