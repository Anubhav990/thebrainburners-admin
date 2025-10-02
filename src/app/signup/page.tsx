"use client"

import Link from "next/link";
import React, { useState } from "react";
import { supabase } from "@/lib/SupabaseClient";
import Image from "next/image";

export default function SignupPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const validateField = (name, value) => {
        switch (name) {
            case "fullName":
                if (!value.trim()) return "Full name is required";
                if (value.trim().length < 2) return "Name must be at least 2 characters";
                if (!/^[a-zA-Z\s]+$/.test(value)) return "Name should only contain letters";
                return "";

            case "email":
                if (!value.trim()) return "Email is required";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email";
                return "";

            case "password":
                if (!value.trim()) return "Password is required";
                if (value.length < 8) return "Password must be at least 8 characters";
                if (!/(?=.*[a-z])/.test(value)) return "Password must contain a lowercase letter";
                if (!/(?=.*[A-Z])/.test(value)) return "Password must contain an uppercase letter";
                if (!/(?=.*\d)/.test(value)) return "Password must contain a number";
                return "";

            case "confirmPassword":
                if (!value.trim()) return "Please confirm your password";
                if (value !== formData.password) return "Passwords do not match";
                return "";

            case "agreeTerms":
                if (!value) return "You must agree to the terms and conditions";
                return "";

            default:
                return "";
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === "checkbox" ? checked : value;
        setFormData(prev => ({ ...prev, [name]: fieldValue }));

        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, fieldValue) }));
        }

        if (name === "password" && touched.confirmPassword) {
            setErrors(prev => ({
                ...prev,
                confirmPassword: formData.confirmPassword && formData.confirmPassword !== value
                    ? "Passwords do not match"
                    : ""
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === "checkbox" ? checked : value;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, fieldValue) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");
        setSubmitSuccess(false);

        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        setErrors(newErrors);
        setTouched({
            fullName: true,
            email: true,
            password: true,
            confirmPassword: true,
            agreeTerms: true
        });

        if (Object.keys(newErrors).length === 0) {
            setIsSubmitting(true);

            try {
                // Step 1: Sign up with Supabase Auth
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                        },
                        emailRedirectTo: `${window.location.origin}/login`,
                    },
                });

                if (authError) {
                    setSubmitError(authError.message);
                    setIsSubmitting(false);
                    return;
                }

                if (authData.user) {
                    // Step 2: Insert user data into users table
                    const { error: insertError } = await supabase
                        .from('users')
                        .insert([
                            {
                                id: authData.user.id,
                                email: formData.email,
                                full_name: formData.fullName,
                                created_at: new Date().toISOString()
                            }
                        ]);

                    if (insertError) {
                        console.error('Error inserting user data:', insertError);
                        setSubmitError('Account created but failed to save profile data. Please contact support.');
                        setIsSubmitting(false);
                        return;
                    }

                    setSubmitSuccess(true);
                    // Reset form
                    setFormData({
                        fullName: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                        agreeTerms: false
                    });
                    setTouched({});

                    // Redirect after success
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                }
            } catch (error) {
                setSubmitError('An unexpected error occurred. Please try again.');
                console.error('Signup error:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="h-screen flex overflow-hidden">
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

            {/* Right Section - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white overflow-y-auto">
                <div className="w-full max-w-md px-6 py-2 md:py-8">
                    <div className="lg:hidden mb-6 text-center">
                        <div className="flex justify-center">
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

                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                        <span className="text-black text-lg font-medium">
                            Sign Up
                        </span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl text-black font-black mb-1">
                        Create Your Account
                    </h2>
                    <p className="text-gray-600 mb-6 text-sm">
                        Fill in your details to get started
                    </p>

                    {submitError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                            {submitError}
                        </div>
                    )}

                    {submitSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">
                            Account created successfully! Please check your email to verify your account.
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={isSubmitting}
                                className={`border ${errors.fullName && touched.fullName ? 'border-red-500' : 'border-gray-300'} rounded-xl p-2.5 w-full placeholder-gray-400 focus:outline-none text-black text-sm focus:ring-2 ${errors.fullName && touched.fullName ? 'focus:ring-red-500' : 'focus:ring-orange-500'} disabled:opacity-50`}
                            />
                            {errors.fullName && touched.fullName && (
                                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                className={`border ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'} rounded-xl p-2.5 w-full placeholder-gray-400 focus:outline-none text-black text-sm focus:ring-2 ${errors.email && touched.email ? 'focus:ring-red-500' : 'focus:ring-orange-500'} disabled:opacity-50`}
                            />
                            {errors.email && touched.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={isSubmitting}
                                    className={`border ${errors.password && touched.password ? 'border-red-500' : 'border-gray-300'} rounded-xl p-2.5 w-full placeholder-gray-400 focus:outline-none text-black text-sm focus:ring-2 ${errors.password && touched.password ? 'focus:ring-red-500' : 'focus:ring-orange-500'} disabled:opacity-50 pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && touched.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={isSubmitting}
                                    className={`border ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-xl p-2.5 w-full placeholder-gray-400 focus:outline-none text-black text-sm focus:ring-2 ${errors.confirmPassword && touched.confirmPassword ? 'focus:ring-red-500' : 'focus:ring-orange-500'} disabled:opacity-50 pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && touched.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>

                        <div>
                            <label className="flex items-start">
                                <input
                                    type="checkbox"
                                    name="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="w-4 h-4 mt-0.5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="ml-2 text-xs text-gray-600">
                                    I agree to the{' '}
                                    <a href="#" className="text-orange-500 hover:text-orange-600 font-medium">
                                        Terms & Conditions
                                    </a>{' '}
                                    and{' '}
                                    <a href="#" className="text-orange-500 hover:text-orange-600 font-medium">
                                        Privacy Policy
                                    </a>
                                </span>
                            </label>
                            {errors.agreeTerms && touched.agreeTerms && (
                                <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-semibold px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Creating Account...' : 'Create Account'}
                        </button>

                        <p className="text-center text-gray-600 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}