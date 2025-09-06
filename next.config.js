const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'content.stack-auth.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
}

module.exports = nextConfig
