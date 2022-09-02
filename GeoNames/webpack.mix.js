let mix = require('laravel-mix');
const webpack = require('webpack');
// require('mix-env-file');

// Then pass your file to this plugin
// If this is not set, this plugin won't do anything and the default .env variables will remain
// mix.env(process.env.ENV_FILE)
require('dotenv').config();

;
/*

 |--------------------------------------------------------------------------
 | Mix Asset Management siehe https://laravel.com/docs/5.5/mix
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */
//const mix = require('laravel-mix');

mix.setPublicPath('./');
mix.setResourceRoot('../');
// mix.options({
//     fileLoaderDirs:  {
//         fonts: 'css/fonts'
//     }
// });

mix.webpackConfig({  
    plugins: [
      new webpack.DefinePlugin({
         GEONAME_USER: JSON.stringify(process.env.GEONAME_USER)
      })
    ]  
 })
 .js('resources/js/lib.js', 'scripts/js')
 .js('scripts/app/config.js', 'scripts/js')
.sass('resources/sass/app.scss', 'css');
