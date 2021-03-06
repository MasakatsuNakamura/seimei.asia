var gulp = require('gulp');
var zip = require('gulp-zip');
var del = require('del');
var install = require('gulp-install');
var runSequence = require('run-sequence');
var awsLambda = require('node-aws-lambda');

// distディレクトリのクリーンアップと作成済みのdist.zipの削除
gulp.task('clean', function(cb) {
  del(['./dist', './dist.zip'], cb);
});

// AWS Lambdaファンクション本体(index.js)をdistディレクトリにコピー
gulp.task('js', function() {
  return gulp.src(['index.js', 'seimei/*'])
    .pipe(gulp.dest('dist/'));
});

// AWS Lambdaファンクションのデプロイメントパッケージ(ZIPファイル)に含めるnode.jsパッケージをdistディレクトリにインストール
// ({production: true} を指定して、開発用のパッケージを除いてインストールを実施)
gulp.task('node-mods', function() {
  return gulp.src('./package.json')
    .pipe(gulp.dest('dist/'))
    .pipe(install({production: true}));
});

// デプロイメントパッケージの作成(distディレクトリをZIP化)
gulp.task('zip', function() {
  return gulp.src(['dist/**/*', '!dist/package.json'])
    .pipe(zip('dist.zip'))
    .pipe(gulp.dest('./'));
});

// AWS Lambdaファンクションの登録(ZIPファイルのアップロード)
// (既にFunctionが登録済みの場合はFunctionの内容を更新)
gulp.task('upload', function(callback) {
  awsLambda.deploy('./dist.zip', require("./lambda-config.js"), callback);
});

gulp.task('deploy', function(callback) {
  return runSequence(
    ['js', 'node-mods'],
    ['zip'],
    ['upload'],
    ['clean'],
    callback
  );
});

var connect = require('gulp-connect');

gulp.task('connect', function() {
  connect.server({
    root: './',
    livereload: true
  });
});

gulp.task('html', function () {
  gulp.src('./*.html')
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['./*.html'], ['html']);
});

gulp.task('default', ['connect', 'watch']);