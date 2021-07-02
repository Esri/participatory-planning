const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    index: [
      // `./src/css/index.css`,
      `./src/index.ts`
    ]
  },
  node: false,
  output: {
    libraryTarget: "amd",
    path: path.join(__dirname, "dist"),
    filename: "[name]/main.[chunkhash].js",
    // chunkFilename: 'chunks/[id].js',
    publicPath: ''
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 3001,
  },
  externals: [
    /^esri\/.*/,
    /^app\/.*/
  ],
  module: {
    rules: [
      {
        test: /\.ejs$/,
        loader: 'ejs-loader',
        options: {
          esModule: false,
        }
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
        ]
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        '**/*',
        '!.git/**',]
    }),
    new HtmlWebpackPlugin({
      title: 'Participatory Planning',
      template: `./src/layout.js`,
      filename: `index.html`,
      entry: "index",
      chunks: ["index"],
      chunksSortMode: 'none',
      inject: false,
    }),
    new MiniCssExtractPlugin({
      filename: "[name]/style.[chunkhash].css",
      chunkFilename: "[id].css"
    }),
    new CopyWebpackPlugin(
      {
        patterns: [{
          from: './src/assets',
          to: './'
        }]
      })
  ],
  resolve: {
    modules: [
      path.resolve(__dirname, "/src"),
      path.resolve(__dirname, "node_modules/")
    ],
    extensions: [".ts", ".tsx", ".js", ".scss", ".css"]
  }
};
