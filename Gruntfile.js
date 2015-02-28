// jshint ignore:start
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    handlebars: {
      compile: {
        options: {
          namespace: "JST"
        },
        files: {
          "test/templates.js": "test/templates/**/*.hbs",
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
        files: ['test/templates/**/*.hbs'],
        tasks: ['handlebars', 'copy'],
        options: {
          spawn: false,
        },
      },
    },
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-handlebars');

  grunt.loadNpmTasks('grunt-jsdoc');

  // Default task(s).
  grunt.registerTask('default', ['handlebars', 'copy', 'uglify']);

};