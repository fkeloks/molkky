const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const dev = process.env.NODE_ENV === 'dev'

let configuration = {

    mode: 'production',
    watch: dev,

    entry: {
        app: './public/js/app.js'
    },
    output: {
        path: path.resolve('./dist'),
        filename: '[name].js',
        publicPath: '/dist/'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    {loader: MiniCssExtractPlugin.loader}, {
                        loader: 'css-loader',
                        options: {
                            minimize: true
                        }
                    }, 'sass-loader'
                ]
            }
        ]
    },

    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        })
    ]

}

module.exports = configuration