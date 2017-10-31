var _ = require('lodash');
var fs = require('fs');
var del = require('del');
var path = require('path');
var ejs = require('gulp-ejs');
var gulpif = require('gulp-if');
var less = require('gulp-less');
var util = require('./lib/util');
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');
var lazyImageCSS = require('gulp-lazyimagecss');  // 自动为图片样式添加 宽/高/background-size 属性
var minifyCSS = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var tmtsprite = require('gulp-tmtsprite');   // 雪碧图合并
var ejshelper = require('tmt-ejs-helper');
var postcss = require('gulp-postcss');  // CSS 预处理
var postcssPxtorem = require('postcss-pxtorem'); // 转换 px 为 rem
var postcssAutoprefixer = require('autoprefixer');
var posthtml = require('gulp-posthtml');
var posthtmlPx2rem = require('posthtml-px2rem');
var RevAll = require('gulp-rev-all');   // reversion
var revDel = require('gulp-rev-delete-original');
var sass = require('gulp-sass');
var changed = require('./common/changed')();
var webpack = require('webpack-stream');
var babel = require('gulp-babel');

var webpackConfigPath = path.join(process.cwd(), 'webpack.config.js');
var webpackConfig; // webpack 配置
var jsPath = path.join(process.cwd(), 'src', 'js');

if (util.dirExist(jsPath) && util.fileExist(webpackConfigPath)) {
    webpackConfig = require(webpackConfigPath);
}

var paths = {
    src: {
        dir: './src',
        img: './src/img/**/*.{JPG,jpg,png,gif,svg}',
        slice: './src/slice/**/*.png',
        js: './src/js/**/*.js',
        media: './src/media/**/*',
        less: './src/css/style-*.less',
        sass: './src/css/style-*.scss',
        html: ['./src/html/**/*.html', '!./src/html/_*/**.html'],
        htmlAll: './src/html/**/*',
        php: './src/**/*.php'
    },
    tmp: {
        dir: './tmp',
        css: './tmp/css',
        img: './tmp/img',
        html: './tmp/html',
        sprite: './tmp/sprite',
        js: './tmp/js'
    },
    dist: {
        dir: './dist',
        css: './dist/css',
        img: './dist/img',
        html: './dist/html',
        sprite: './dist/sprite'
    }
};

module.exports = function (gulp, config) {
    var webp = require('./common/webp')(config);

    var lazyDir = config.lazyDir || ['../slice'];

    var postcssOption = [];

    if (config.supportREM) {
        postcssOption = [
            postcssAutoprefixer({browsers: ['last 5 versions']}),
            postcssPxtorem({
                root_value: '20', // 基准值 html{ font-zise: 20px; }
                prop_white_list: [], // 对所有 px 值生效
                minPixelValue: 2 // 忽略 1px 值
            })
        ]
    } else {
        postcssOption = [
            postcssAutoprefixer({browsers: ['last 5 versions']})
        ]
    }

    // 清除 dist 目录
    function delDist() {
        return del([paths.dist.dir]);
    }

    // 清除 tmp 目录
    function delTmp() {
        return del([paths.tmp.dir]);
    }

    //编译 less
    function compileLess() {
        return gulp.src(paths.src.less)
            .pipe(less({relativeUrls: true}))
            .pipe(lazyImageCSS({imagePath: lazyDir}))
            .pipe(tmtsprite({margin: 4}))
            .pipe(gulpif('*.png', gulp.dest(paths.tmp.sprite), gulp.dest(paths.tmp.css)));
    }

    //编译 less
    function compileSass() {
        return gulp.src(paths.src.sass)
            .pipe(sass())
            .on('error', sass.logError)
            .pipe(lazyImageCSS({imagePath: lazyDir}))
            .pipe(tmtsprite({margin: 4}))
            .pipe(gulpif('*.png', gulp.dest(paths.tmp.sprite), gulp.dest(paths.tmp.css)));
    }

    //自动补全
    function compileAutoprefixer() {
        return gulp.src('./tmp/css/style-*.css')
            .pipe(postcss(postcssOption))
            .pipe(gulp.dest('./tmp/css/'));
    }

    //CSS 压缩
    function miniCSS() {
        return gulp.src('./tmp/css/style-*.css')
            .pipe(minifyCSS({
                safe: true,
                reduceTransforms: false,
                advanced: false,
                compatibility: 'ie7',
                keepSpecialComments: 0
            }))
            .pipe(gulp.dest('./tmp/css/'));
    }

    //图片压缩
    function imageminImg() {
        return gulp.src(paths.src.img)
            .pipe(imagemin({
                use: [pngquant()]
            }))
            .pipe(gulp.dest(paths.tmp.img));
    }

    //复制媒体文件
    function copyMedia() {
        return gulp.src(paths.src.media, {base: paths.src.dir}).pipe(gulp.dest(paths.tmp.dir));
    }

    //编译 JS
    function compileJs() {
        var condition = webpackConfig ? true : false;

        return gulp.src(paths.src.js)
            .pipe(gulpif(
                condition,
                webpack(webpackConfig),
                babel({
                    presets: ['es2015', 'stage-2']
                })
            ))
            .pipe(uglify())
            .pipe(gulp.dest(paths.tmp.js));
    }

    //雪碧图压缩
    function imageminSprite() {
        return gulp.src('./tmp/sprite/**/*')
            .pipe(imagemin({
                use: [pngquant()]
            }))
            .pipe(gulp.dest(paths.tmp.sprite));
    }

    //html 编译
    function compileHtml() {
        return gulp.src(paths.src.html)
            .pipe(ejs(ejshelper()))
            .pipe(gulpif(
                config.supportREM,
                posthtml(
                    posthtmlPx2rem({
                        rootValue: 20,
                        minPixelValue: 2
                    })
                ))
            )
            .pipe(gulp.dest(paths.tmp.html))
            .pipe(usemin())
            .pipe(gulp.dest(paths.tmp.html));
    }


    //webp 编译
    function supportWebp() {
        if (config['supportWebp']) {
            return webp();
        } else {
            return function noWebp(cb) {
                cb();
            }
        }
    }

    //新文件名(md5)
    function reversion(cb) {
        var revAll = new RevAll({
            fileNameManifest: 'manifest.json',
            dontRenameFile: ['.html', '.php'],
            dontUpdateReference: ['.html'],
            transformFilename: function (file, hash) {
                var filename = path.basename(file.path);
                var ext = path.extname(file.path);

                if (/^\d+\..*\.js$/.test(filename)) {
                    return filename;
                } else {
                    return path.basename(file.path, ext) + '.' + hash.substr(0, 8) + ext;
                }

            }
        });

        if (config['reversion']) {
            return gulp.src(['./tmp/**/*'])
                .pipe(revAll.revision())
                .pipe(gulp.dest(paths.tmp.dir))
                .pipe(revDel({
                    exclude: /(.html|.htm)$/
                }))
                .pipe(revAll.manifestFile())
                .pipe(gulp.dest(paths.tmp.dir));
        } else {
            cb();
        }
    }

    function findChanged(cb) {

        if (!config['supportChanged']) {
            return gulp.src('./tmp/**/*', {base: paths.tmp.dir})
                .pipe(gulp.dest(paths.dist.dir))
                .on('end', function () {
                    delTmp();
                })
        } else {
            var diff = changed('./tmp');
            var tmpSrc = [];

            if (!_.isEmpty(diff)) {

                //如果有reversion
                if (config['reversion'] && config['reversion']['available']) {
                    var keys = _.keys(diff);

                    //先取得 reversion 生成的manifest.json
                    var reversionManifest = require(path.resolve('./tmp/manifest.json'));

                    if (reversionManifest) {
                        reversionManifest = _.invert(reversionManifest);

                        reversionManifest = _.pick(reversionManifest, keys);

                        reversionManifest = _.invert(reversionManifest);

                        _.forEach(reversionManifest, function (item, index) {
                            tmpSrc.push('./tmp/' + item);
                            console.log('[changed:] ' + util.colors.blue(index));
                        });

                        //将新的 manifest.json 保存
                        fs.writeFileSync('./tmp/manifest.json', JSON.stringify(reversionManifest));

                        tmpSrc.push('./tmp/manifest.json');
                    }
                } else {
                    _.forEach(diff, function (item, index) {
                        tmpSrc.push('./tmp/' + index);
                        console.log('[changed:] ' + util.colors.blue(index));
                    });
                }

                return gulp.src(tmpSrc, {base: paths.tmp.dir})
                    .pipe(gulp.dest(paths.dist.dir))
                    .on('end', function () {
                        delTmp();
                    })

            } else {
                console.log('Nothing changed!');
                delTmp();
                cb();
            }
        }

    }


    //加载插件
    function loadPlugin(cb) {
        util.loadPlugin('build_dist');
        cb();
    }

    //注册 build_dist 任务
    gulp.task('build_dist', gulp.series(
        delDist,
        gulp.parallel(
            compileLess,
            compileSass,
            imageminImg,
            copyMedia,
            compileJs
        ),
        compileAutoprefixer,
        imageminSprite,
        miniCSS,
        compileHtml,
        reversion,
        supportWebp(),
        findChanged,
        loadPlugin
    ));
};

