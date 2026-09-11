'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User as UserIcon, FolderCheck, ExternalLink, HardDrive } from 'lucide-react';
import { APP_FOLDER_NAME } from '@/lib/drive/folder';

export const UserMenu: React.FC<{ driveFolderId?: string | null }> = ({ driveFolderId }) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const user = session.user;
  const displayName = user.name || (user.email ? user.email.split('@')[0] : 'Note Creator');
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  const folderLink = driveFolderId
    ? `https://drive.google.com/drive/folders/${driveFolderId}`
    : 'https://drive.google.com';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#2d2d2d] transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full border border-[#3d3d3d] object-cover shadow-sm"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {initials}
          </div>
        )}
        <div className="hidden sm:block text-left text-xs">
          <div className="font-semibold text-slate-100 truncate max-w-[130px]">
            {displayName}
          </div>
          <div className="text-slate-400 truncate max-w-[130px]">
            {user.email}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-64 bg-[#252525] rounded-xl shadow-2xl border border-[#333333] py-2 z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-[#333333]">
            <p className="text-sm font-semibold text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {user.email}
            </p>
          </div>

          <div className="px-2 py-1.5">
            <a
              href={folderLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-[#2d2d2d] rounded-lg transition-colors group"
            >
              <HardDrive className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div className="flex-1 truncate">
                <span>Google Drive Folder</span>
                <p className="text-[10px] text-slate-500">{APP_FOLDER_NAME}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          <div className="border-t border-[#333333] px-2 pt-1.5">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
