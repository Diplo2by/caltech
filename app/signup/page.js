'use client'
import { CredentialSignUp } from '@stackframe/stack'
import Link from 'next/link'
import React from 'react'

const page = () => {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gray-800/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gray-700/20 rounded-full blur-3xl"></div>
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full" style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px'
                }}></div>
            </div>

            <div className="relative z-10 w-full max-w-sm sm:max-w-md">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">Min-Max</h1>
                    <p className="text-gray-400 text-base sm:text-lg">Track your nutrition journey</p>
                    <div className="w-12 h-1 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full mx-auto mt-3 sm:mt-4"></div>
                </div>

                {/* Sign in container */}
                <div className="rounded-2xl bg-teal-50 backdrop-blur-sm border border-gray-800 p-6 sm:p-8 shadow-2xl">
                    <div className="mb-6 text-center">
                        <h2 className="text-lg sm:text-xl font-semibold text-black mb-1">Welcome Onboard!</h2>
                        <p className="text-gray-400 text-sm">Sign up to continue tracking</p>
                    </div>

                    {/* Custom styling for CredentialSignIn component */}

                    <div className="credential-signin-container">
                        <CredentialSignUp />
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="text-center">
                            <p className="text-gray-600 text-sm mb-3">Already have an account?</p>
                            <Link
                                href="/signin"
                                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-black border border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-lg"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 sm:mt-8 text-gray-500 text-sm px-4">
                    <p className="mb-3">Start your healthy lifestyle today</p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <span className="text-xs">Secure</span>
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <span className="text-xs">Private</span>
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <span className="text-xs">Fast</span>
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Floating elements - hidden on mobile for cleaner look */}
            <div className="hidden sm:block absolute top-10 right-10 w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
            <div className="hidden sm:block absolute bottom-10 left-10 w-1 h-1 bg-gray-700 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="hidden sm:block absolute top-1/3 left-10 w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
    )
}

export default page