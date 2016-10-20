/*
 * Copyright 2016 Johannes Donath <johannesd@torchmind.com>
 * and other copyright owners as documented in the project's IP log.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import browserSync from 'browser-sync';
import del from 'del';
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import cleancss from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import less from 'gulp-less';
import rename from 'gulp-rename';
import sequence from 'gulp-sequence';
import sourcemaps from 'gulp-sourcemaps';
import template from 'gulp-template';
import merge from 'merge-stream';

const servers = {
    'Caerbannog': 'Internet Relay Chat',
    'BNC':        'Internet Relay Chat Bouncer'
};
const sync = browserSync.create();

/**
 * Collection Tasks
 */
gulp.task('default', ['build']);
gulp.task('build', sequence('clean', 'package'));
gulp.task('development', sequence('clean', 'package', 'serve'));
gulp.task('package', sequence('static', 'copy', 'html', 'less'));

/**
 * Clean previous distribution
 */
gulp.task('clean', () => {
    'use strict';

    return del('dist/');
});

/**
 * Copies all dependencies to the distribution directory.
 */
gulp.task('copy', () => {
    'use strict';

    return gulp.src('node_modules/normalize.css/normalize.css')
        .pipe(sourcemaps.init())
        .pipe(cleancss())
        .pipe(sourcemaps.write('.'))
        .pipe(sync.stream())
        .pipe(gulp.dest('dist/assets/style/'));
});

/**
 * HTML Minification
 */
gulp.task('html', () => {
    'use strict';

    var streams = [];

    for (var name in servers) {
        var type = servers[name];

        streams.push(
            gulp.src('src/html/index.html')
                .pipe(template({'name': name, 'type': type}))
                .pipe(rename(name + '.html'))
                .pipe(htmlmin({collapseWhitespace: true}))
                .pipe(sync.stream())
                .pipe(gulp.dest('dist/'))
        )
    }

    return merge(streams);
});

/**
 * Compiles, prefixes, minifies and generates sourcemaps for the stylesheets
 */
gulp.task('less', () => {
    'use strict';

    return gulp.src('src/less/*.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(cleancss())
        .pipe(sourcemaps.write('.'))
        .pipe(sync.stream())
        .pipe(gulp.dest('dist/assets/style/'));
});

/**
 * Serves an automatically synchronized local version of this page
 */
gulp.task('serve', () => {
    'use strict';

    sync.init({open: false, server: {baseDir: "dist/"}});

    gulp.watch('src/html/*.html', ['html']);
    gulp.watch('src/less/*.less', ['less']);
    gulp.watch('src/static/**/*', ['static']);
});

/**
 * Copies all static files
 */
gulp.task('static', () => {
    'use strict';

    return gulp.src('**/*', {
        cwd: 'src/static/'
    })
        .pipe(sync.stream())
        .pipe(gulp.dest('dist/assets/'));
});
