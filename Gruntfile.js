var path = require('path');
var modRewrite = require('connect-modrewrite');
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

var folderMount = function folderMount(connect, point) {
  return connect.static(path.resolve(point));
};

module.exports = function(grunt) {

    grunt.initConfig({
        
        pkg: grunt.file.readJSON('package.json'),
        
        settings : {
            appDirectory : "app",
            distDirectory : "dist",
            serverStaticDirectory : "server/static",
            serverTemplateDirectory : "server/templates"
        },

        clean: {
            dist: ["<%= settings.distDirectory %>"]
        },

        copy: {
            prebuild: {
                files: [
                    {expand: true, cwd: '<%= settings.appDirectory %>', src: ['index.html'], dest: '<%= settings.distDirectory %>'},
                    {expand: true, cwd: '<%= settings.appDirectory %>/images', src: ['**/*'], dest: '<%= settings.distDirectory %>/images'}
                ]
            },

            server : {
                files: [
                    {expand: true, cwd: '<%= settings.distDirectory %>', src: ['index.html'], dest: '<%= settings.serverTemplateDirectory %>'},
                    {expand: true, cwd: '<%= settings.distDirectory %>/styles', src: ['**/*'], dest: '<%= settings.serverStaticDirectory %>/styles'},
                    {expand: true, cwd: '<%= settings.distDirectory %>/images', src: ['**/*'], dest: '<%= settings.serverStaticDirectory %>/images'},
                    {expand: true, cwd: '<%= settings.distDirectory %>/scripts', src: ['**/*'], dest: '<%= settings.serverStaticDirectory %>/scripts'},
                    {expand: true, cwd: '<%= settings.appDirectory %>/scripts/vendor', src: ['fabric.js'], dest: '<%= settings.serverStaticDirectory %>/scripts/vendor'}
                ]  
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['<%= settings.appDirectory %>/src/**/*.js'],
                dest: '<%= settings.distDirectory %>/<%= pkg.name %>.js'
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },

            dist: {
                files: {
                    '<%= settings.distDirectory %>/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },

        jshint: {
            files: {
                src: [
                    'Gruntfile.js',
                    '<%= settings.appDirectory %>/scripts/*.js',
                    '<%= settings.appDirectory %>/scripts/models/**/*.js',
                    '<%= settings.appDirectory %>/scripts/views/**/*.js'
                ]
            },
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },

        requirejs: {
            compile: {
                options: {
                    name: 'vendor/almond',
                    include: ['main'],
                    baseUrl: "<%= settings.appDirectory %>/scripts",
                    mainConfigFile: "<%= settings.appDirectory %>/scripts/main.js"
                }
            }
        },

        compass: {    
            dist: {   
                options: {
                    sassDir: '<%= settings.appDirectory %>/styles',
                    cssDir: '<%= settings.distDirectory %>/styles',
                    environment: 'production',
                    force:true
                }
            },
            dev: {                 
                options: {
                    sassDir: '<%= settings.appDirectory %>/styles',
                    cssDir: '<%= settings.appDirectory %>/styles',
                    force:true
                }
            }
        },

        connect: {
            server: {
                options: {
                    port: 9001,
                    base:'<%= settings.appDirectory %>/',
                    middleware: function(connect, options) {
                        return [
                            modRewrite([
                                '^/c /index.html'
                            ]),
                            lrSnippet, folderMount(connect, options.base)
                        ];
                    }
                }
            }            
        },
        
        regarde: {
            server : {
                files: ['<%= settings.appDirectory %>/styles/*.scss', '<%= settings.appDirectory %>/scripts/**/*.js'],
                tasks: ['jshint','compass','livereload']
            },

            test : {
                files: ['<%= settings.appDirectory %>/scripts/**/*.js', '<%= settings.testDirectory %>/spec/**/*.js', '<%= settings.testDirectory %>/index.html'],
                tasks: ['jshint','livereload']  
            }
        },

        'useminPrepare': {
            html: '<%= settings.distDirectory %>/index.html'
        },

        usemin: {
            html: ['<%= settings.distDirectory %>/*.html'],
            css: ['<%= settings.appDirectory %>/styles/*.css'],
            options: {
                dirs: ['<%= settings.distDirectory %>']
            }
        }  
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-requirejs');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-regarde');
    grunt.loadNpmTasks('grunt-contrib-livereload');
    grunt.loadNpmTasks('grunt-usemin-baked');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['jshint','compass','livereload-start', 'connect:server', 'regarde:server']);
    grunt.registerTask('build',['clean:dist','copy:prebuild','useminPrepare','requirejs','compass:dist','usemin','copy:server']);

};