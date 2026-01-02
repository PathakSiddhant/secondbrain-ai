/** @type {import('next').NextConfig} */
const nextConfig = {
  // Agar koi redirects() function hai toh usse hata de ya empty return kar
  async redirects() {
    return []; 
  },
};

export default nextConfig;