'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { AuthModal } from './auth/AuthModal';

export function Header() {
  const { data: session, isPending } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background-primary">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-text-primary">Catch Up🔥</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              {/* Auth Section */}
              {isPending ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
              ) : session?.user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || ''}
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                        {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                      </div>
                    )}
                    <span>{session.user.name || 'ユーザー'}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                      <div className="p-2">
                        <button
                          onClick={handleSignOut}
                          className="w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                        >
                          ログアウト
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  ログイン
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
