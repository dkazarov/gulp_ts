// Импорт пакетов
const gulp = require('gulp');
const less = require('gulp-less');
const stylus = require('gulp-stylus');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const ts = require('gulp-typescript');
//const coffee = require('gulp-coffee')
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size');
//const gulppug = require('gulp-pug')
const newer = require('gulp-newer');
const browsersync = require('browser-sync').create();
const del = require('del');
const webpack = require('webpack-stream');
const fileinclude = require('gulp-file-include');
const webp = require('gulp-webp');
const webpHTML = require('gulp-webp-html');
const cssnano = require('gulp-cssnano');

// Пути исходных файлов src и пути к результирующим файлам dest
const paths = {
	html: {
		src: ['src/*.html', 'src/*.pug'],
		dest: 'dist/',
	},
	styles: {
		src: [
			'src/styles/**/*.sass',
			'src/scss/**/*.scss',
			'src/styles/**/*.styl',
			'src/styles/**/*.less',
			'src/styles/**/*.css',
		],
		dest: 'dist/css/',
	},
	scripts: {
		src: ['src/js/**/*.ts', 'src/js/**/*.js', 'src/js/**/*.coffee'],
		dest: 'dist/js/',
	},
	images: {
		src: 'src/assets/**',
		dest: 'dist/assets/',
	},
	fonts: {
		src: 'src/fonts/**',
		dest: 'dist/fonts/',
	},
};

// Очистить каталог dist, удалить все кроме изображений
function clean() {
	return del(['dist/*', '!dist/img']);
}

// Обработка html и pug
function html() {
	return (
		gulp
			.src(paths.html.src)
			//.pipe(gulppug())
			.pipe(
				fileinclude({
					prefix: '@',
					basepath: '@file',
				}),
			)
			.pipe(webpHTML())
			// .pipe(htmlmin({ collapseWhitespace: true }))
			.pipe(
				size({
					showFiles: true,
				}),
			)
			.pipe(gulp.dest(paths.html.dest))
			.pipe(browsersync.stream())
	);
}

// Обработка препроцессоров стилей
function styles() {
	return (
		gulp
			.src(paths.styles.src)
			.pipe(sourcemaps.init())
			.pipe(concat('style.min.css'))
			//.pipe(less())
			//.pipe(stylus())
			.pipe(sass().on('error', sass.logError))
			.pipe(
				autoprefixer({
					cascade: false,
				}),
			)
			// .pipe(cssnano())
			.pipe(sourcemaps.write('.'))
			.pipe(
				size({
					showFiles: true,
				}),
			)
			.pipe(gulp.dest(paths.styles.dest))
			.pipe(browsersync.stream())
	);
}

// Обработка Java Script, Type Script и Coffee Script
function scripts() {
	return (
		gulp
			.src(paths.scripts.src)
			// .pipe(sourcemaps.init())
			//.pipe(coffee({bare: true}))
			.pipe(webpack(require('./webpack.config.js')))
			// .pipe(
			// 	ts({
			// 		noImplicitAny: true,
			// 		outFile: 'main.min.js',
			// 	}),
			// )
			// .pipe(
			// 	babel({
			// 		presets: ['@babel/env'],
			// 	}),
			// )
			// .pipe(uglify())
			// .pipe(concat('main.min.js'))
			// .pipe(sourcemaps.write('.'))
			.pipe(
				size({
					showFiles: true,
				}),
			)
			.pipe(gulp.dest(paths.scripts.dest))
			.pipe(browsersync.stream())
	);
}

// Сжатие изображений
const img = () => {
	return gulp
		.src(paths.images.src)
		.pipe(newer(paths.images.dest))
		.pipe(webp())
		.pipe(newer(paths.images.dest))
		.pipe(gulp.src(paths.images.src))
		.pipe(newer(paths.images.dest))
		.pipe(
			imagemin(
				{
					verbose: true,
				},
				[
					imagemin.gifsicle({ interlaced: true }),
					imagemin.mozjpeg({ quality: 75, progressive: true }),
					imagemin.optipng({ optimizationLevel: 3 }),
					imagemin.svgo({
						plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
					}),
				],
			),
		)
		.pipe(
			size({
				showFiles: true,
			}),
		)
		.pipe(gulp.dest(paths.images.dest))
		.pipe(browsersync.stream());
};

function fonts() {
	return gulp.src(paths.fonts.src).pipe(newer(paths.images.dest)).pipe(gulp.dest(paths.fonts.dest));
}

// Отслеживание изменений в файлах и запуск лайв сервера
function watch() {
	browsersync.init({
		server: {
			baseDir: './dist',
		},
	});
	gulp.watch(paths.html.dest).on('change', browsersync.reload);
	gulp.watch(paths.html.src, html);
	gulp.watch(['src/html-components/*.html', 'src/*html'], html).on('all', browsersync.reload);
	gulp.watch(paths.styles.src, styles);
	gulp.watch(paths.scripts.src, scripts);
	gulp.watch(paths.images.src, img);
	gulp.watch(paths.fonts.src, fonts);
}

// Таски для ручного запуска с помощью gulp clean, gulp html и т.д.
exports.clean = clean;

exports.html = html;

// exports.pages = pages;
exports.styles = styles;
exports.scripts = scripts;
exports.img = img;
exports.fonts = fonts;
exports.watch = watch;

// Таск, который выполняется по команде gulp
exports.default = gulp.series(clean, fonts, html, gulp.parallel(styles, scripts, img), watch);
