"use client"

import Link from "next/link";
import React, { useState } from "react";
import { supabase } from "@/lib/SupabaseClient";
import Image from "next/image";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const validateField = (name, value) => {
        switch (name) {
            case "email":
                if (!value.trim()) return "Email is required";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email";
                return "";

            case "password":
                if (!value.trim()) return "Password is required";
                if (value.length < 6) return "Password must be at least 6 characters";
                return "";

            default:
                return "";
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        setErrors(newErrors);
        setTouched({
            email: true,
            password: true
        });

        if (Object.keys(newErrors).length === 0) {
            setIsSubmitting(true);
            setSubmitError("");

            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });

                if (error) {
                    setSubmitError(error.message);
                    setIsSubmitting(false);
                    return;
                }

                if (data.user) {
                    // Redirect after successful login
                    window.location.href = '/'; // or any route you want
                }
            } catch (err) {
                console.error('Login error:', err);
                setSubmitError("An unexpected error occurred. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Section - Logo/Brand */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute top-20 left-32 w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute top-40 left-20 w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute bottom-20 left-40 w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute bottom-32 right-40 w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute top-32 right-20 w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute bottom-40 right-32 w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="text-center z-10">
                    <div className="mb-8">
                        <div className="w-50 h-50 bg-white rounded-full mx-auto flex items-center justify-center shadow-2xl
                    relative">
                            {/* Pulsing border */}
                            <div className="absolute inset-0 rounded-full border-4 border-orange-500 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-orange-500 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-orange-500 animate-ping"></div>

                            <Image
                                src="/svgs/brainburnerslogo.svg"
                                alt="The Brain Burners"
                                width={140}
                                height={40}
                                priority
                                className="relative"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
                <div className="w-full max-w-md">
                    <div className="lg:hidden mb-8 text-center">
                        <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto flex items-center justify-center mb-4">
                            <span className="text-white text-2xl font-black">L</span>
                        </div>
                        <h2 className="text-2xl font-black text-black">Welcome Back</h2>
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                        <span className="text-black text-xl font-medium">
                            Sign In
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl text-black font-black mb-2">
                        Login to Your Account
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Enter your credentials to access your account
                    </p>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={isSubmitting}
                                className={`border ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'} rounded-xl p-3 w-full placeholder-gray-400 focus:outline-none text-black focus:ring-2 ${errors.email && touched.email ? 'focus:ring-red-500' : 'focus:ring-orange-500'} disabled:opacity-50`}
                            />
                            {errors.email && touched.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={isSubmitting}
                                    className={`border ${errors.password && touched.password ? 'border-red-500' : 'border-gray-300'} rounded-xl p-3 w-full placeholder-gray-400 focus:outline-none text-black focus:ring-2 ${errors.password && touched.password ? 'focus:ring-red-500' : 'focus:ring-orange-500'} disabled:opacity-50 pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && touched.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                                Forgot Password?
                            </a>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </button>

                        <p className="text-center text-gray-600 text-sm mt-6">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-orange-500 hover:text-orange-600 font-medium">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}