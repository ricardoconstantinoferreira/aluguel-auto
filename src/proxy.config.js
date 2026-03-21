const proxy = [
    {
        context: [
            '/api'
        ],
        target: 'https://auto-1-k9gu.onrender.com/',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
            "^/": ""
        }
    }
];

module.exports = proxy;