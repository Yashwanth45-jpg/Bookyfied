'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {usePathname} from "next/navigation";
import { SignInButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import {cn} from "@/lib/utils";

// Custom wrapper components that mimic SignedIn/SignedOut
const SignedOut = ({ children }: { children: React.ReactNode }) => {
    const { isSignedIn, isLoaded } = useAuth();
    return isLoaded && !isSignedIn ? <>{children}</> : null;
};

const SignedIn = ({ children }: { children: React.ReactNode }) => {
    const { isSignedIn, isLoaded } = useAuth();
    return isLoaded && isSignedIn ? <>{children}</> : null;
};

const navItems = [
    { label: "Library", href: "/library" },
    { label: "Add New", href: "/books/new" },
    { label: "Pricing", href: "/subscriptions" },
]

const Navbar = () => {
    const pathName = usePathname();
    const { user } = useUser();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="w-full fixed z-50 bg-(--bg-primary) border-b border-(--border-subtle)">
            <div className="wrapper navbar-height py-4 flex justify-between items-center">
                <Link href="/" className="flex gap-1.5 items-center" onClick={() => setMobileOpen(false)}>
                    <Image src="/assets/logo.png" alt="Bookified" width={42} height={26} />
                    <span className="logo-text">Bookified</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex gap-7 items-center">
                    {navItems.map(({ label, href }) => {
                        const isActive = pathName === href || (href !== '/' && pathName.startsWith(href));
                        return (
                            <Link href={href} key={label} className={cn('nav-link-base', isActive ? 'nav-link-active' : 'text-black hover:opacity-70')}>
                                {label}
                            </Link>
                        )
                    })}

                    <div className="flex gap-6 items-center">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button type="button" className="nav-btn">Sign In</button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <div className="nav-user-link">
                                <UserButton />
                                {user?.firstName && (
                                    <span className="nav-user-name">{user.firstName}</span>
                                )}
                            </div>
                        </SignedIn>
                    </div>
                </nav>

                {/* Mobile right side */}
                <div className="flex md:hidden items-center gap-3">
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    <button
                        className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                        onClick={() => setMobileOpen(v => !v)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown menu */}
            {mobileOpen && (
                <div className="md:hidden bg-(--bg-primary) border-t border-(--border-subtle) px-5 pb-5 flex flex-col gap-1">
                    {navItems.map(({ label, href }) => {
                        const isActive = pathName === href || (href !== '/' && pathName.startsWith(href));
                        return (
                            <Link
                                href={href}
                                key={label}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    'py-3 text-base font-medium border-b border-(--border-subtle) last:border-0',
                                    isActive ? 'text-(--color-brand)' : 'text-black'
                                )}
                            >
                                {label}
                            </Link>
                        )
                    })}
                    <SignedOut>
                        <div className="pt-2">
                            <SignInButton mode="modal">
                                <button
                                    type="button"
                                    className="w-full py-2.5 rounded-xl bg-(--text-primary) text-white font-semibold text-sm"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Sign In
                                </button>
                            </SignInButton>
                        </div>
                    </SignedOut>
                </div>
            )}
        </header>
    )
}

export default Navbar