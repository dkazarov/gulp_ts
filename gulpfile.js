// Импорт пакетов
const gulp = require('gulp');
const less = require('gulp-less');
const stylus = require('gulp-stylus');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
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

// Пути исходных файлов src и пути к результирующим файлам dest
const paths = {
	html: {
		src: ['src/html/*.html', 'src/*.pug'],
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
		src: ['src/js/**/*.coffee', 'src/js/**/*.ts', 'src/js/**/*.js'],
		dest: 'dist/js/',
	},
	images: {
		src: 'src/img/**',
		dest: 'dist/img/',
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
			.pipe(htmlmin({ collapseWhitespace: true }))
			.pipe(
				size({
					showFiles: true,
				}),
			)
			.pipe(gulp.dest(paths.html.dest))
			.pipe(browsersync.stream())
	);
}

// const pages = () => {
// 	return src('src/html-components/**/*.html').pipe(browsersync.stream());
// };

// Обработка препроцессоров стилей
function styles() {
	return (
		gulp
			.src(paths.styles.src)
			.pipe(sourcemaps.init())
			//.pipe(less())
			//.pipe(stylus())
			.pipe(sass().on('error', sass.logError))
			.pipe(
				autoprefixer({
					cascade: false,
				}),
			)
			.pipe(
				cleanCSS({
					level: 2,
				}),
			)
			.pipe(
				rename({
					basename: 'style',
					suffix: '.min',
				}),
			)
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
function img() {
	return gulp
		.src(paths.images.src)
		.pipe(newer(paths.images.dest))
		.pipe(webp())
		.pipe(webpHTML())
		.pipe(
			imagemin({
				progressive: true,
			}),
		)
		.pipe(
			size({
				showFiles: true,
			}),
		)
		.pipe(gulp.dest(paths.images.dest));
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
	gulp
		.watch(['src/html/html-components/*.html', 'src/html/*html'], html)
		.on('all', browsersync.reload);
	gulp.watch(paths.styles.src, styles);
	gulp.watch(paths.scripts.src, scripts);
	gulp.watch(paths.images.src, img);
}

// Таски для ручного запуска с помощью gulp clean, gulp html и т.д.
exports.clean = clean;

exports.html = html;

// exports.pages = pages;
exports.styles = styles;
exports.scripts = scripts;
exports.img = img;
exports.watch = watch;

// Таск, который выполняется по команде gulp
exports.default = gulp.series(clean, html, gulp.parallel(styles, scripts, img), watch);
