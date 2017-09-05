module.exports = function (grunt) {
  'use strict';

  // load dependencies
  require('load-grunt-tasks')(grunt, {pattern: ['grunt-*']});

  grunt.initConfig({
    eslint: {
      node: {
        options: {
          configFile: '.eslintrc'
        },
        src: [
          '**/*.js',
          '!sample/**/*.js',
          '!template/**/*.js',
          '!coverage/**',
          '!libs/brackets-server/**',
          '!**/node_modules/**',
          '!projects/**',
          '!tools/**/**',
          '!temp/**',
          '!share/**'
        ]
      },
      bracketsServer: {
        options: {
          configFile: 'libs/brackets-server/.eslintrc'
        },
        src: [
          'libs/brackets-server/embedded-ext/**/*.js',
          'libs/brackets-server/hacks/**/*.js',
          'libs/brackets-server/lib/**/*.js',
          '!libs/brackets-server/embedded-ext/brackets-indent-guides/snap.svg-min.js',
          '!libs/brackets-server/embedded-ext/client-fs/thirdparty/**',
          '!libs/brackets-server/embedded-ext/**/node_modules/**'
        ]
      }
    },
    htmllint: {
      node: {
        options: {
          ignore: require('./.htmlignore.json')
        },
        src: [
          'views/**/*.ejs'
        ]
      },
      bracketsServer: {
        options: {
          ignore: [
            'Start tag seen without seeing a doctype first. Expected “<!DOCTYPE html>”.',
            'Element “head” is missing a required instance of child element “title”.',
            'Consider adding a “lang” attribute to the “html” start tag to declare the language of this document.',
            'The “for” attribute of the “label” element must refer to a non-hidden form control.',
            /This document appears to be written in .*[가-힣]+.* Consider adding “lang=".*"” \(or variant\) to the “html” start tag./
          ]
        },
        src: [
          'libs/brackets-server/embedded-ext/**/*.html',
          '!libs/brackets-server/embedded-ext/**/node_modules/**'
        ]
      }
    },
    csslint: {
      node: {
        options: {
          csslintrc: '.csslintrc'
        },
        src: [ 'public/css/**/*.css' ]
      },
      bracketsServer: {
        options: {
          csslintrc: 'libs/brackets-server/.csslintrc'
        },
        src: [ 'libs/brackets-server/embedded-ext/**/*.css' ]
      }
    },
    watch: {
      files: [
        '<%= eslint.node.files.src %>',
        '<%= eslint.bracketsServer.files.src %>',
        '<%= htmllint.node.src %>',
        '<%= htmllint.bracketsServer.src %>',
        '<%= csslint.node.src %>',
        '<%= csslint.bracketsServer.src %>'
      ],
      options: {
        interval: 3000
      }
    }
  });

  grunt.registerTask('check', ['eslint', 'htmllint', 'csslint']);
  grunt.registerTask('diff', ['gitnewer:eslint', 'gitnewer:htmllint', 'gitnewer:csslint']);

  grunt.event.on('watch', function(action, file, target) {
    grunt.log.writeln('[WatchEvent] : "' + file + '" ' + action);
  });
};