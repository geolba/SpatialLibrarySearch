let mix = require('laravel-mix');

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

mix.js('resources/js/lib.js', 'scripts/js')
.sass('resources/sass/app.scss', 'css');
