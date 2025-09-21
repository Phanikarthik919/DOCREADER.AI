import React from 'react';
import { DocReaderLogo } from './DocReaderLogo';
import { ICONS } from '../constants';

interface SidebarProps {
  isSidebarCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarCollapsed }) => {
  return (
    <aside className={`w-72 md:flex flex-col p-6 border-r transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
      <div className="flex items-center gap-3 mb-10 overflow-hidden">
        <DocReaderLogo />
        {!isSidebarCollapsed && <h1 className="text-2xl font-bold">DOCREADER</h1>}
      </div>
      {!isSidebarCollapsed && (
        <div className="flex items-center gap-3 mb-8">
          <img src="https://placehold.co/40x40" alt="User" className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-semibold">Phani</p>
            <p className="text-xs">Pro Member</p>
          </div>
        </div>
      )}
      <div className={`mt-auto transition-all duration-300 ${isSidebarCollapsed ? 'w-full' : ''}`}>
        <button className={`w-full flex items-center gap-2 p-2 bg-purple-600 text-white rounded ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
          <ICONS.Gem className="w-4 h-4" />
          {!isSidebarCollapsed && <span className="pl-1">Upgrade</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;