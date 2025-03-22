import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoHomeOutline, IoPersonOutline } from "react-icons/io5";
import { ItemHover } from '../Hover';

export function SideNavItem() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const location = useLocation();

    // Check if user is logged in
    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem('userId'); 
            setIsLoggedIn(!!token);
        };

        checkLoginStatus();
        // You might want to add event listeners or subscribe to auth state changes here
    }, []);

    // Dynamically generate menu items based on login status
    const getMenuItems = () => {
        const items = [
            { icon: IoHomeOutline, label: "Home", to: "/" },
        ];

        // Add either Login or Profile based on login status
        if (isLoggedIn) {
            items.push({ icon: IoPersonOutline, label: "Profile", to: "/profile" });
        } else {
            items.push({ icon: IoPersonOutline, label: "Login", to: "/login" });
        }

        return items;
    };

    const menuItems = getMenuItems();

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
    );
}