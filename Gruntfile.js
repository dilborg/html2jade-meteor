'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
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

    casper: {
      options: {
        test : true,
        engine: 'slimerjs',
        'fail-fast': true,
        concise: true
      },
      e2e: {
        src: ['tests/e2e.js']
      }
    },

    shell: {
      run_dev: {
        command: 'cd meteor && meteor'
      },
      bundle_prod: {
        command: 'cd meteor && meteor build --directory ..'
      },
      install_npm: {
        command: 'cd bundle/programs/server && npm install'
      },
      run_prod: {
        command: 'cd bundle && node main.js'
      }
    }

  });

  grunt.registerTask('serve:dev', [
    'shell:run_dev'
  ]);

  grunt.registerTask('serve:prod', [
    'shell:bundle_prod',
    'shell:install_npm',
    'shell:run_prod'
  ]);

  grunt.registerTask('test', [
    'jshint:meteor',
    'jshint:tests',
    'casper:e2e'
  ]);

  grunt.registerTask('default', [
    'serve:dev'
  ]);
};
