/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],

    theme: {
        extend: {
            animation: {
                // Custom animation for the "AI Hue" button effect.
                'gradient-pan': 'gradient-pan 3s ease infinite',
            },
            keyframes: {
                // Defines the steps for the gradient-pan animation.
                'gradient-pan': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
            },
        },
    },

    plugins: [
    ],
}