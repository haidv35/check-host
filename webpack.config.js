const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: './src/js/index.js',
	// watch: true,
	output: {
		filename: './js/bundle.js',
		path: path.resolve(__dirname,"dist")
	},
	plugins: [
		new webpack.ProvidePlugin({
	    	$: "jquery",
	    	jQuery: "jquery",
	    	'window.jQuery': 'jquery'
		})
	],
	module: {
        rules: [
        	{
                test: require.resolve('jquery'),
                use: [{
                        loader: 'expose-loader',
                        options: 'jQuery'
                    },
                    {
                        loader: 'expose-loader',
                        options: '$'
                    }
                ]
            },
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