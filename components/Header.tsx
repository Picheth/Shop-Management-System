
import React from 'react';
import { Page } from '../types';

interface HeaderProps {
    currentPage: Page;
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, toggleSidebar }) => {
    // A simple function to add spaces before capital letters
    const formatPageTitle = (title: string) => {
        return title.replace(/([A-Z])/g, ' $1').trim();
    };

    return (
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="text-gray-500 dark:text-gray-400 focus:outline-none md:hidden">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white ml-2 md:ml-0">
                    {formatPageTitle(currentPage)}
                </h1>
            </div>
            <div className="flex items-center">
                {/* User avatar or other header items can go here */}
                <img className="h-8 w-8 rounded-full object-cover" src="https://picsum.photos/100" alt="User avatar" />
            </div>
        </header>
    );
};

export default Header;
