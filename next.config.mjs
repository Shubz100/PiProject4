/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: ['i.imgur.com'], // Allow images from Imgur
    },
};

export default nextConfig;
