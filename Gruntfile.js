// jshint ignore:start
module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    handlebars: {
      compile: {
        options: {
          namespace: "JST"
        },
        files: {
          "examples/templates.js": "examples/templates/**/*.hbs",
        },
        partialRegex: /__partial.hbs$/,
        processName: function(file) {
          return file.replace(/\.hbs/, '');
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
        mangle: {
          except: ['$']
        },
        sourceMap: true,
        sourceMapName: 'dist/<%= pkg.name %>.map'
      },
      my_target: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['dist/PVCollection.js'],
        }
      }
    },
    copy: {
      main: {
        files: [
          // includes files within path
          {
            expand: true,
            src: ['src/*.js'],
            dest: 'dist/',
            filter: 'isFile',
            flatten: true
          },
        ],
      },
    },
    watch: {
      code: {
        files: ['**/*.js'],
        tasks: ['handlebars', 'copy'],
        options: {
          spawn: false,
        },
      },
      templates: {
        files: ['examples/templates/**/*.hbs'],
        tasks: ['handlebars', 'copy'],
        options: {
          spawn: false,
        },
      },
    },

    doxx: {
      custom: {
        src: 'src',
        target: 'docs',
      }
    },

    // Configure a mochaTest task 
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'mocha_results.txt', // Optionally capture the reporter output to a file 
          quiet: false, // Optionally suppress output to standard out (defaults to false) 
          clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false) 
        },
        src: ['test/**/*.js']
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['handlebars', 'copy', 'uglify', 'jsdoc']);

};