"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import "../../styles/Navbar.css";

const Navbar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const handleLogout = () => {
        logout();
        router.push("/login");
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navigateTo = (path: string) => {
        router.push(path);
        setIsMenuOpen(false);
    };

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/products", label: "Shop" },
        { href: "/about", label: "About" }
    ];

    return (
        <motion.nav 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="navbar"
        >
            <div className="navbar-container">
                {/* Logo */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="logo"
                >
                    <Link href="/">ShopifyFR</Link>
                </motion.div>
                
                {/* Desktop Navigation */}
                <div className="desktop-nav-links">
                    {navLinks.map((link) => (
                        <motion.div 
                            key={link.href}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link 
                                href={link.href} 
                                className={`desktop-nav-link ${pathname === link.href ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        </motion.div>
                    ))}
                </div>
                
                {/* Desktop Auth Controls */}
                <div className="desktop-auth-controls">
                    {isAuthenticated && user ? (
                        <>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push("/cart")}
                                className="desktop-cart-button cursor-pointer"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                    />
                                </svg>
                            </motion.div>
                            <motion.div 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="desktop-auth-link"
                                onClick={() => router.push('/profile')}
                            >
                                Profile
                            </motion.div>
                            <motion.div 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="desktop-auth-link"
                                onClick={handleLogout}
                            >
                                Logout
                            </motion.div>
                        </>
                    ) : (
                        <>
                            <motion.div 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="desktop-auth-link"
                                onClick={() => router.push("/login")}
                            >
                                Login
                            </motion.div>
                            <motion.div 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="desktop-auth-link"
                                onClick={() => router.push("/signup")}
                            >
                                Sign Up
                            </motion.div>
                        </>
                    )}
                </div>
                
                {/* Mobile Menu Button */}
                <button 
                    className={`hamburger-button ${isMenuOpen ? 'hamburger-open' : ''}`} 
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
            </div>
            
            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-links">
                    {navLinks.map((link) => (
                        <div 
                            key={link.href}
                            className={`mobile-nav-link ${pathname === link.href ? 'active' : ''}`}
                            onClick={() => navigateTo(link.href)}
                        >
                            {link.label}
                        </div>
                    ))}
                </div>
                
                <div className="mobile-auth-controls">
                    {isAuthenticated && user ? (
                        <>
                            <div
                                onClick={() => navigateTo("/cart")}
                                className="mobile-cart-button"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                    />
                                </svg>
                            </div>
                            <div 
                                className="mobile-auth-link"
                                onClick={() => navigateTo('/profile')}
                            >
                                Profile
                            </div>
                            <div 
                                className="mobile-auth-link"
                                onClick={handleLogout}
                            >
                                Logout
                            </div>
                        </>
                    ) : (
                        <>
                            <div 
                                className="mobile-auth-link"
                                onClick={() => navigateTo("/login")}
                            >
                                Login
                            </div>
                            <div 
                                className="mobile-auth-link"
                                onClick={() => navigateTo("/signup")}
                            >
                                Sign Up
                            </div>
                        </>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;