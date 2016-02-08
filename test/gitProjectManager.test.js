/* global suite, test */

var assert = require('assert');

var vscode = require('vscode');
var projectLocator = require('../src/gitProjectManager');

suite("gitProjectManager Tests", function() {

	test("Should export showProjectList function", function(done) {
		assert.equal(typeof projectLocator.showProjectList, "function");
        done();
	});
    
	test("Should export openProject function", function(done) {
		assert.equal(typeof projectLocator.openProject, "function");
        done();
	});
    
    test("Should export getProjectsList function", function(done) {
		assert.equal(typeof projectLocator.getProjectsList, "function");
        done();
	});
    
    test("Should export refreshSpecificFolder function", function(done) {
		assert.equal(typeof projectLocator.refreshSpecificFolder, "function");
        done();
	});
    
    test("Should export refreshList function", function(done) {
		assert.equal(typeof projectLocator.refreshList, "function");
        done();
	});
    
});