/* global suite, test */

// 
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
var assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
var vscode = require('vscode');
var projectLocator = require('../src/gitProjectLocator');
var path = require('path');

// Defines a Mocha test suite to group tests of similar kind together
describe("gitProjectLocator Tests", function() {
    describe("#Available functions", function () {
        // Defines a Mocha unit test
        it("Should export locateGitProjects function", function(done) {
            assert.equal(typeof projectLocator.locateGitProjects, "function");
            done();
        });
    });
    
    describe("#Searching without repos", function () {       
        it("Shouldn't find any repositories", function(done)  {
            this.timeout(5000);
            projectLocator.locateGitProjects([path.join(vscode.extensions.getExtension('felipecaputo.git-project-manager').extensionPath, '/test/noGit')], function(repoList) {
                    assert.equal(repoList.length,0);
                    done();
            });
        });
    });       
    
    describe("#Searching repos", function () {       
        it("Should find 2 repositories", function(done)  {
            this.timeout(5000);
            projectLocator.locateGitProjects([path.join(vscode.extensions.getExtension('felipecaputo.git-project-manager').extensionPath, '/test')], function(repoList) {
                    assert.equal(repoList.length,2);
                    done();
            });
        });
    });
});