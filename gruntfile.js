// 将movie模型[构造函数]导出
module.exports=function(grunt){

    //大多数grunt任务所依赖的配置数据都是要被定义之后传递给initConfig里面传入对象
    //对象里面会有各个要定义的任务
    /**
     * concurrent
     * tasks传入任务tasks: ['nodemon', 'watch'],
     * watch
     * jade，js,styles有一些静态的html页面需要来前台直接使用文件变更触发服务重启比较方便
     * files是视图文件改变监听的目录
     * livereload: true意识是当文件改动会重新启动服务
     *
     * nodemon的dev是开发环境，options下有
     * file指向入口文件
     */
    grunt.initConfig({
        watch: {
            jade: {
                files: ['views/**'],
                options: {
                    livereload: true
                }
            },
            js: {
                files: ['public/js/**', 'models/**/*.js', 'schemas/**/*.js'],
                //tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            uglify: {
                files: ['public/**/*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            styles: {
                files: ['public/**/*.less'],
                tasks: ['less'],
                options: {
                    nospawn: true
                }
            }
        },
        nodemon: {
            dev: {
                options: {
                    file: 'app.js',
                    args: [],
                    ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
                    watchedExtensions: ['js'],
                    watchedFolders: ['./'],
                    debug: true,
                    delayTime: 1,
                    env: {
                        PORT: 3000
                    },
                    cwd: __dirname
                }
            }
        },
        concurrent: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        }
    })

    //加载任务grunt-contrib-watch 是只要有文件添加修改或者删除他就会重新执行在这里注册好的任务
    grunt.loadNpmTasks('grunt-contrib-watch');
    //加载任务grunt-contrib-nodemon 用来实时监听app.js也就是入口文件
    //入口文件出现改动会自动重启，可以看作对app.js的一个包装，
    grunt.loadNpmTasks('grunt-contrib-nodemon');
    //针对main任务开发的一个插件，优化构建时间
    grunt.loadNpmTasks('grunt-concurrent');

    //便于开发时因为语法错误而中断整个grunt的服务
    grunt.option('force',true);

    //注册默认的任务
    //注册default任务，对他传入数组，里面concurrent任务
    grunt.registerTask('default',['concurrent']);
};