const proxy = [
    {
        context: [
            '/api'
        ],
        target: 'http://localhost:9090/',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
            "^/": ""
        }
    }
];

module.exports = proxy;