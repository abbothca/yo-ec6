const gulp = require('gulp');
const sass = require('gulp-sass');
const watch = require('gulp-watch');
const notify = require('gulp-notify');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const fs = require("fs");
const inject = require('gulp-inject');
const data = require('gulp-data');
const imagemin = require('gulp-imagemin');
const fontgen = require('gulp-fontgen');
const GoogleFontlist = require('google-font-installer');
const fontList = new GoogleFontlist("Your_Google_Font_API_Key");

var path = {
    css: {
        'dev': 'dev/assets/scss/*.scss',
        'watch': 'dev/assets/scss/**/*.scss',
        'prod': 'public/assets/css/',
        'inject': 'public/assets/css/*.css'
    },
    js: {
        'dev': 'dev/assets/js/**/*.js',
        'watch': 'dev/assets/js/**/*.js',
        'prod': 'public/assets/js/',
        'inject': 'public/assets/js/*.js'
    },
    bower: {
        source: 'bower_components/**/*.*',
        lib: 'public/assets/library',
        css: 'public/assets/library/*.css',
        scss: 'dev/assets/library/',
        js: 'public/assets/library/*.js'
    },
    html: {
        source: './dev/html/*.html',
        prod: './public/'
    },
    fonts: {
        dev: 'dev/assets/fonts/'
    },
    image: {
        dev: 'dev/assets/images/**/*.*',
        prod: 'public/assets/images/'
    }
};

//------------------------------------------------------------------------------
//----------------------BOWER-------------------------------------------------
//------------------------------------------------------------------------------

/**
 * This task generates folder 'library' for bower_components.
 */
gulp.task('bower_main_file', function () {
    gulp.src("./bower_components/**/bower.json")
            .pipe(data(function (file) {
                var main = JSON.parse(String(file.contents)).main;
                var name = JSON.parse(String(file.contents)).name;
                if (typeof (main) === 'object') {
                    for (var i = 0; i < main.length; i++) {
                        var main_i = "bower_components/" + name + "/" + main[i];
                        if (main[i].indexOf('.scss') !== -1) {
                            gulp.src(main_i)
                                    .pipe(gulp.dest(path.bower.lib));
                        } else {
                            gulp.src(main_i)
                                    .pipe(gulp.dest(path.bower.scss));
                        }
                    }
                } else {
                    main = "bower_components/" + name + "/" + main;
                    gulp.src(main)
                            .pipe(gulp.dest(path.bower.lib));
                }
            }));
});

//------------------------------------------------------------------------------
//----------------------HTML---------------------------------------------------
//------------------------------------------------------------------------------

/**
 * This task inject vendors and custom js/css files to index.html.
 */
gulp.task('inject', ['bower_main_file'], function () {
    return gulp.src(path.html.source)
            //vendors
            .pipe(inject(gulp.src(path.bower.css, {read: false}),
                    {
                        starttag: '<!-- inject:css_lib -->',
                        //relative: true,
                        transform: function (filepath, file, i, length) {
                            return '<link rel="stylesheet" class="blue" href="' + filepath.replace("public/", "") + '">';
                        }
                    }))
            .pipe(inject(gulp.src(path.bower.js, {read: false}),
                    {
                        starttag: '<!-- inject:js_lib -->',
                        transform: function (filepath, file, i, length) {
                            return '<script src="' + filepath.replace("public/", "") + '"></script>';
                        }
                    }
            ))
            //custom files
            .pipe(inject(gulp.src(path.css.inject, {read: false}),
                    {
                        starttag: '<!-- inject:css_custom -->',
                        transform: function (filepath, file, i, length) {
                            return '<link rel="stylesheet" class="blue" href="' + filepath.replace("public/", "") + '">';
                        }
                    }
            ))
            .pipe(inject(gulp.src(path.js.inject, {read: false}),
                    {
                        starttag: '<!-- inject:js_custom -->',
                        transform: function (filepath, file, i, length) {
                            return '<script src="' + filepath.replace("public/", "") + '"></script>';
                        }
                    }
            ))
            .pipe(gulp.dest(path.html.prod));
});


//------------------------------------------------------------------------------
//----------------------CSS-----------------------------------------------------
//------------------------------------------------------------------------------
/**
 * This task generates CSS from all SCSS files and compresses them down.
 */
gulp.task('sass', function () {
    return gulp.src(path.css.dev)
            .pipe(sourcemaps.init())
            .pipe(sass({
                noCache: true,
                outputStyle: "compressed",
                lineNumbers: false
            })).on('error',
            function (error) {
                gutil.log(error);
                this.emit('end');
            })
            .pipe(gulp.dest(path.css.prod))
            .pipe(notify({
                title: "SASS Compiled",
                message: "All SASS files have been recompiled to CSS.",
                onLast: true
            }));
});

//------------------------------------------------------------------------------
//----------------------JS------------------------------------------------------
//------------------------------------------------------------------------------
/**
 * This task minifies javascript in the js/js-src folder and places them in the js directory.
 */
gulp.task('compress', function () {
    return gulp.src(path.js.dev)
            .on('error', console.log)
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(sourcemaps.write('./map'))
            .pipe(gulp.dest(path.js.prod))
            .pipe(notify({
                title: "JS Minified",
                message: "All JS files in the theme have been minified.",
                onLast: true
            }));
});


//------------------------------------------------------------------------------
//----------------------FONTS---------------------------------------------------
//------------------------------------------------------------------------------
var fontsForDownloaded = [
    {
        family: "Roboto",
        variant: ['300', '300italic']
    },
    {
        family: "Open Sans",
        variant: ['300', '400', '600']
    },
    {
        family: "Lato",
        variant: ['300', '700']
    }
];

/**
 * This task load the GoogleFonts.
 */
gulp.task('fonts_load', function () {
    fontList.on('success', function () {
        for (var i = 0; i < fontsForDownloaded.length; i++) {

            this.searchFontByName(fontsForDownloaded[i].family, function (err, filteredList) {
                if (err)
                    throw err;
                filteredList.getFirst().saveAt(fontsForDownloaded[i].variant, path.fonts.dev+"/"+fontsForDownloaded[i].family, function (err, result) {
                    if (err)
                        throw err;
                    result.forEach(function (el, index) {
                        console.log('Variant %s of %s downloaded in %s', el.variant, el.family, el.path);
                    });
                });
            });
        }
        ;
    });

    fontList.on('error', function (err) {
        throw err;
    });
});
/**
 * This task generete the full stack for each font.
 */
gulp.task('fontgen', function() {
  return gulp.src(path.fonts.dev + "/**/*.{ttf,otf}")
    .pipe(fontgen({
      dest: path.fonts.prod
    }));
});


//------------------------------------------------------------------------------
//----------------------IMAGES--------------------------------------------------
//------------------------------------------------------------------------------
gulp.task('image_min', () =>
    gulp.src(path.image.dev)
        .pipe(imagemin())
        .pipe(gulp.dest(path.image.prod))
);


//------------------------------------------------------------------------------
//----------------------DEFAULT-------------------------------------------------
//------------------------------------------------------------------------------
/**
 * Define a task to spawn Browser Sync.
 */
gulp.task('browser-sync', function () {
    browserSync.init({
        files: [path.css.prod, path.js.prod],
        server: {
            baseDir: "./public"
        }
    });
});

gulp.task('reload', function () {
    browserSync.reload();
});

/**
 * Set up the watcher.
 */
gulp.task('watch', ['sass', 'compress', 'inject'], function () {
    gulp.watch([path.css.watch], ['reload', 'sass']);
    gulp.watch([path.js.watch], ['reload', 'compress']);
    gulp.watch([path.bower.source, path.css.prod, path.js.prod, path.html.source], ['reload', 'inject']);
    //  gulp.watch([path.js.watch], ['compress']);
});

gulp.task('default', ['browser-sync', 'watch', 'inject', 'sass', 'compress', 'bower_main_file'], function () {
    return gulp.src(path.html.source)
            //vendors
            .pipe(inject(gulp.src(path.bower.css, {read: false}),
                    {
                        starttag: '<!-- inject:css_lib -->',
                        //relative: true,
                        transform: function (filepath, file, i, length) {
                            return '<link rel="stylesheet" class="blue" href="' + filepath.replace("public/", "") + '">';
                        }
                    }))
            .pipe(inject(gulp.src(path.bower.js, {read: false}),
                    {
                        starttag: '<!-- inject:js_lib -->',
                        transform: function (filepath, file, i, length) {
                            return '<script src="' + filepath.replace("public/", "") + '"></script>';
                        }
                    }
            ))
            //custom files
            .pipe(inject(gulp.src(path.css.inject, {read: false}),
                    {
                        starttag: '<!-- inject:css_custom -->',
                        transform: function (filepath, file, i, length) {
                            return '<link rel="stylesheet" class="blue" href="' + filepath.replace("public/", "") + '">';
                        }
                    }
            ))
            .pipe(inject(gulp.src(path.js.inject, {read: false}),
                    {
                        starttag: '<!-- inject:js_custom -->',
                        transform: function (filepath, file, i, length) {
                            return '<script src="' + filepath.replace("public/", "") + '"></script>';
                        }
                    }
            ))
            .pipe(gulp.dest(path.html.prod));
});
