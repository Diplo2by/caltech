import { AccountSettings } from '@stackframe/stack'
import React from 'react'

const Page = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="w-full max-w-3xl bg-teal-50 shadow-xl rounded-2xl p-4">
                <AccountSettings fullPage />
            </div>
        </div>
    )
}

export default Page
