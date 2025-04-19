'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock } from "react-icons/fa";
import Navbar from '../components/navbar/page';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const GRAPHQL_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/graphql/";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/auth/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        mutation Login($username: String!, $password: String!) {
                            login(username: $username, password: $password) {
                                accessToken
                                refreshToken
                                user {
                                    id
                                    username
                                    email
                                }
                            }
                        }
                    `,
                    variables: { username, password },
                }),
            });

            const result = await response.json();
            if (result.errors) {
                setError('Invalid credentials');
            } else {
                const accessToken = result.data?.login?.accessToken;
                const refreshToken = result.data?.login?.refreshToken;
                const userData = result.data?.login?.user;
                
                if (accessToken && refreshToken && userData) {
                    // Use the context login function to store auth data
                    login(userData, accessToken, refreshToken);
                    router.push('/'); // Redirect to home page after login
                } else {
                    setError('Incomplete login data received');
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // If already authenticated, redirect to home page
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-purple-100">
            <Navbar />
            <div className="pt-16 pb-8 mt-16 px-4 flex items-center justify-center">
                <div className="max-w-4xl w-full flex overflow-hidden rounded-xl border shadow-2xl bg-white">
                    <div className="hidden md:flex flex-col justify-center items-center w-1/2 p-10 bg-gradient-to-br from-purple-900 to-purple-700 text-white">
                        <div className="mb-6">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="80" 
                                height="80" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                                className="mx-auto"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h1 className="text-5xl font-bold text-center mb-4">ShopifyFR</h1>
                        <p className="text-xl font-light text-purple-200 mb-6 text-center">Be Bold, Be Fashionable</p>
                        <div className="w-16 h-1 bg-purple-300 rounded-full mb-8"></div>
                        <p className="text-purple-200 text-center">Welcome back! Log in to your account</p>
                    </div>
                    
                    <div className="w-full md:w-1/2 p-8 bg-white">
                        <h2 className="text-3xl font-bold text-center mb-2 text-purple-900">Welcome Back</h2>
                        <p className="text-purple-600 text-center mb-8">Log in to your ShopifyFR account</p>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                                <p>{error}</p>
                            </div>
                        )}
                        
                        <form className="space-y-5" onSubmit={handleLogin}>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="text-purple-500" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-purple-200 rounded-lg bg-purple-50 text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                />
                            </div>
                            
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-purple-500" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-purple-200 rounded-lg bg-purple-50 text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                />
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                                <label className="flex items-center space-x-2 text-purple-800">
                                    <input 
                                        type="checkbox" 
                                        className="form-checkbox w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500" 
                                    />
                                    <span>Remember me</span>
                                </label>
                                <a href="#" className="text-purple-600 hover:text-purple-800 transition">Forgot password?</a>
                            </div>
                            
                            <button 
                                className="w-full py-3 px-4 bg-gradient-to-r from-purple-800 to-purple-600 text-white rounded-lg hover:from-purple-700 hover:to-purple-500 transition transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 shadow-lg"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Log In'}
                            </button>
                        </form>
                        
                        <div className="mt-8 text-center">
                            <p className="text-purple-800">
                                Don&apos;t have an account?{" "}
                                <a 
                                    href="#" 
                                    onClick={() => router.push("/signup")} 
                                    className="font-medium text-purple-600 hover:text-purple-800 transition"
                                >
                                    Sign Up
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}