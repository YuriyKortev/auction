var gulp=require('gulp'),
    less=require('gulp-less'),
    min_css=require('gulp-minify-css'),
    min_js=require('gulp-uglify'),
    babel=require('gulp-babel'),
    clean=require('gulp-clean-css'),
    watch=require('gulp-watch');

var path = {
    build: {
        js: 'public/javascripts/',
        css: 'public/stylesheets/'
    },
    src: {
        js: 'src/js/*.js',
        less: 'src/less/*.less'
    },
    watch: {
        js: 'src/js/**/*.js',
        less: 'src/style/**/*.less'
    },
    clean: './build'
};

gulp.task('js',(cb)=>{
    gulp.src(path.src.js)
        .pipe(babel({
            presets:['@babel/env']
        }))
        .pipe(min_js())
        .pipe(gulp.dest(path.build.js));
    cb();
});

gulp.task('css',(cb)=>{
   gulp.src(path.src.less)
       .pipe(less())
       .pipe(clean())
       .pipe(min_css())
       .pipe(gulp.dest(path.build.css));
   cb();
});

gulp.task('build',gulp.series('js','css'));

gulp.task('watch',()=>{
    watch([path.watch.js],function (event,cb) {
        gulp.start('js');
    });
    watch([path.watch.less],function (event,cb) {
        gulp.start('less');
    });
})

gulp.task('default',gulp.series('build','watch'));