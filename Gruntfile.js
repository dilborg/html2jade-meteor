'use strict';

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  grunt.initConfig({

    jshint: {
      options: {
        reporter: require('jshint-stylish')
      },
      meteor: {
        options: {
          jshintrc: 'meteor/.jshintrc'
        },
        src: [
          'meteor/**/*.js',
          '!meteor/client/lib/js/**/*.js',
          '!meteor/packages/**/*.js'
        ]
      },
      tests: {
        options: {
          jshintrc: 'tests/.jshintrc'
        },
        src: ['tests/**/*.js', '*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      public: 'public'
    },

    shell: {
      run_dev: {
        command: 'cd meteor && meteor'
      },
      run_prod: {
        command: 'meteor build project'
      }
    }

  });

  grunt.registerTask('serve:dev', [
    'shell:run_dev'
  ]);

  grunt.registerTask('serve:prod', [
    'clean:public',
    'build',
    'shell:run_prod'
  ]);

  grunt.registerTask('test', [
    'jshint:tests',
    'jshint:meteor',
//    'test:laika'
  ]);

  grunt.registerTask('build', [
//    'meteor:build',
//    'meteor:deploy'
  ]);

  grunt.registerTask('default', [
    'test',
    'build',
    'serve:dev'
  ]);

};
