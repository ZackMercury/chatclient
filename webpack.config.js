const path = require("path");

const config = {
    entry: "./src/index.tsx",

    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: "/",
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: [ path.resolve(__dirname, "src") ],
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    presets: ["@babel/preset-react", "@babel/preset-typescript", "@babel/preset-env"]
                }
            },
            {
                test: /\.css$/,
                include: [ path.resolve(__dirname, "src") ],
                exclude: /node_modules/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.svg$/,
                issuer: /\.[jt]sx?$/,
                use: [{
                    loader: '@svgr/webpack',
                    options: {
                        typescript: true
                    }
                }]
            }
        ]
    },
    resolve: {
        extensions: [".js", ".ts", ".tsx"]
    },

    devServer: {
        proxy: {
            "/api": {
                target: "http://localhost:5000/",
                pathRewrite: { "^/api": ""},
                secure: false
            }
        },
        static: {
            directory: path.join(__dirname, "public")
        },
        historyApiFallback: true,
        hot: true,
        port: 3000
    }
}

module.exports = config;