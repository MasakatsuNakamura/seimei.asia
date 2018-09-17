module.exports = function(grunt) {

	'use strict';

	grunt.initConfig({
		watch : {
			deploy:{
				files:['**'],
				tasks:['deploy']
			}
		},
		jade: {
			options:{
				data:jadeDataFunc(),
				pretty:true
			},
			deploy:{
				files:[ {
					expand:true,
					cwd:'jade',
					src:[
						'*.jade'
					],
					dest:'deploy',
					ext:'.html'
				}],
			}
		}
	});

	function jadeDataFunc() {
		return function(dest, srcAr) {
			var _ = grunt.util._,
				regDest = /\/([A-Za-z_0-9-]+?)\.html/,
				destName = dest.match(regDest)[1],
				data;
			try {
				data = grunt.file.readJSON("json/_common.json");
			} catch(e) {
				data = {};
			}
			return _.extend({
				page:destName
			}, data);
		};
	}

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.registerTask('deploy', ['jade']);

	grunt.loadTasks('tasks');

	grunt.registerTask('default', ['deploy']);
};
