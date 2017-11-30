const path = require('path');
const webpack = require('webpack'); 
const ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');

const extractSass = new ExtractTextPlugin({
    filename: "[name].css"
});


module.exports = {
    context: __dirname + "/src",
    entry: ["./script/app.js"],
    devtool: 'source-map',
    output: {
        path: __dirname+"/docs",
        filename: "bundle.js"
    },

    plugins:[
        new webpack.optimize.UglifyJsPlugin(),
        extractSass,
        new CopyWebpackPlugin([
            { from: '../static' }
        ])
    ],

    module:{

        loaders:[
            {
                loader: "babel-loader",
                // Skip any files outside of your project's `src` directory
                include: [
                    path.resolve(__dirname, "src/script"),
                ],
                // Only run `.js` and `.jsx` files through Babel
                test: /\.jsx?$/,
                query: {
                    plugins: ['transform-runtime'],
                    presets: ['es2015'],
                  }

            },

            {
                test: /\.scss$/,
                //loaders: ['style-loader', 'css-loader', 'sass-loader']
                loaders:extractSass.extract({
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "sass-loader"
                    }],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            },

            {
                test: /\.(png|jpg|gif|html)$/,
                loader:'file-loader',
                options: {
                    name: '[path][name].[ext]'
                }  
            },


        ]
    }
};