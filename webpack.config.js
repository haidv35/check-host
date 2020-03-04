const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: './js/index.js',
	// watch: true,
	output: {
		filename: './js/bundle.js',
		path: path.resolve(__dirname,"dist")
	},
	plugins: [
		new webpack.ProvidePlugin({
	    	$: "jquery",
	    	jQuery: "jquery"
		})
	],
	externals: {
		jquery: 'jQuery'
	},
	module: {
        rules: [
	        {
	            test: /\.css$/,
	            use: ['style-loader', 'css-loader']
	        },
	        {
	            test: /\.(png|woff|woff2|eot|ttf|svg)$/,
	            loader: 'url-loader?limit=100000'
	        }
        ]
    }
};