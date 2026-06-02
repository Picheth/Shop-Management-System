
import React from 'react';
import { Page, NavItem } from '../types';
import { NAV_SECTIONS } from '../../constants';

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    pendingTransfersCount?: number;
    pendingRepairsCount?: number;
    handleNavigation: (page: Page) => void;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    ariaLabel?: string;
    ariaExpanded?: boolean;
    ariaControls?: string;
    ariaHasPopup?: boolean;
    onClick?: () => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    onKeyUp?: (event: React.KeyboardEvent) => void;
    onKeyPress?: (event: React.KeyboardEvent) => void;
    onToggle?: () => void;
    onOpen?: () => void;
    onClose?: () => void;
    role?: string;
    tabIndex?: number;
    'data-testid'?: string;
    'aria-label'?: string;
    'aria-expanded'?: boolean;
    'aria-controls'?: string;
    'aria-haspopup'?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setIsOpen, pendingTransfersCount = 0, pendingRepairsCount = 0 }) => {
    
    const handleNavigation = (page: Page) => {
        setCurrentPage(page);
        if (window.innerWidth < 768) { // md breakpoint
            setIsOpen(false);
            window.scrollTo(0, 0);
        }
    };
    
    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            ></div>

            <aside className={`fixed top-0 left-0 w-64 bg-gray-800 text-white h-full z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 flex items-center justify-between border-b border-gray-700">
                    <h1 className="text-xl font-bold text-white">ShopSystem</h1>
                </div>
                <nav className="mt-4 flex-1 overflow-y-auto h-[calc(100vh-65px)]">
                    {NAV_SECTIONS.map((section) => (
                        <div key={section.title} className="px-2 mb-4">
                            <h2 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.title}</h2>
                            <ul className="mt-2">
                                {section.items.map((item) => (
                                    <li key={item.page}>
                                        <button
                                            onClick={() => handleNavigation(item.page)}
                                            className={`w-full text-left flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                                currentPage === item.page
                                                    ? 'bg-sky-600 text-white'
                                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                {item.icon}
                                                {item.label}
                                            </div>
                                            
                                            {item.page === Page.StockTransfer && pendingTransfersCount > 0 && (
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-gray-800 animate-pulse">
                                                    {pendingTransfersCount > 99 ? '9+' : pendingTransfersCount}
                                                </span>
                                            )}

                                            {item.page === Page.RepairCenter && pendingRepairsCount > 0 && (
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-gray-800 animate-pulse">
                                                    {pendingRepairsCount > 99 ? '9+' : pendingRepairsCount}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
