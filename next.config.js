/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.externals.push({
            'isows': 'isows',
            'ws': 'ws'
        });
        
        // Add buffer polyfill
        config.resolve.fallback = {
            ...config.resolve.fallback,
            "buffer": require.resolve("buffer/"),
        };

        return config;
    }
};

module.exports = nextConfig;
