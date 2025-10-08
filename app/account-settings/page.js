import { AccountSettings } from '@stackframe/stack'
import React from 'react'
import Link from 'next/link'

const Page = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="w-full max-w-3xl bg-teal-50 shadow-xl rounded-2xl p-4">
                <div className="mb-4">
                    <Link
                        href="/"
                        className="inline-flex items-center text-teal-700 hover:text-teal-900 font-medium transition-colors"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to Home
                    </Link>
                </div>
                <AccountSettings fullPage />
            </div>
        </div>
    )
}

export default Page