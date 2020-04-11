const {
    CleanWebpackPlugin
} = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin')

module.exports = {
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: true,
                cache: false,
            }),
        ],
    },
    entry: {
        app: "./src/main.js",
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "Video Chat",
            template: "./src/index.html",
            filename: "index.html",
            favicon: "./assets/icons/favicon.png",
        }),
        new HtmlWebpackExternalsPlugin({
            externals: [{
                    module: 'dist',
                    entry: '/RTCMultiConnection.min.js',
                    global: 'RTCMultiConnection',
                },
                {
                    module: 'dist',
                    entry: '/socket.io.js',
                    global: 'io',
                },
                {
                    module: 'rtcmulticonnection',
                    entry: '/dev/CodecsHandler.js',
                    global: 'CodecsHandler',
                },
            ],
        })
    ],
    module: {
        rules: [{
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ["file-loader"],
            },
            {
                test: /\.(woff|ttf|woff2)$/,
                use: {
                    loader: "url-loader",
                    options: {
                        limit: 50000,
                    },
                },
            },
            {
                test: /\.script\.js$/,
                use: ["script-loader"],
            },
        ],
    },
};