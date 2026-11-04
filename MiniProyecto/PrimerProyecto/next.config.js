const MINI_SERVIDOR_URL = 'http://192.168.20.31:3000';
const BACKEND_URL = 'http://192.168.20.29:4000';

/** @type{import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            { source: '/mini/:path*', destination: `${MINI_SERVIDOR_URL}/:path*` },
            { source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` }
        ];
    },
};

export default nextConfig;