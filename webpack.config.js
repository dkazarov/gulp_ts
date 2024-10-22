const path = require('path');

module.exports = {
	entry: './src/js/main.ts',
	mode: 'production',
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'main.min.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
};
