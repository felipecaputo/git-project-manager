/* global suite, test */

var assert = require('assert');

var vscode = require('vscode');
var projectLocator = require('../src/gitProjectManager');

describe("gitProjectManager", function() {
    describe("#Available functions", function () {
        it("Should export showProjectList function", function(done) {
            assert.equal(typeof projectLocator.showProjectList, "function");
            done();
        });
        
        it("Should export openProject function", function(done) {
            assert.equal(typeof projectLocator.openProject, "function");
            done();
        });
        
        it("Should export getProjectsList function", function(done) {
            assert.equal(typeof projectLocator.getProjectsList, "function");
            done();
        });
        
        it("Should export refreshSpecificFolder function", function(done) {
            assert.equal(typeof projectLocator.refreshSpecificFolder, "function");
            done();
        });
        
        it("Should export refreshList function", function(done) {
            assert.equal(typeof projectLocator.refreshList, "function");
            done();
        });
    });
});