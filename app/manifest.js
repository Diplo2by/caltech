export default function manifest() {
    return {
        name: 'Calibra',
        short_name: 'Calibra',
        description: 'Your Calorie Compass',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/icon1.png',
                sizes: '96x96',
                type: 'image/png',
            },
            {
                src: '/icon0.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
            {
                src: '/apple-icon.png',
                sizes: '180x180', 
                type: 'image/png',
            },
        ],
    }
}