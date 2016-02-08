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

// Defines a Mocha test suite to group tests of similar kind together
suite("gitProjectLocator Tests", function() {

	// Defines a Mocha unit test
	test("Should export locateGitProjects function", function(done) {
		assert.equal(typeof projectLocator.locateGitProjects, "function");
        done();
	});
    
    test("Should find 2 repositories", (done) => {
        this.timeout(5000);
        projectLocator.locateGitProjects(['./test'], (repoList) => {
                assert.equal(repoList.length,2);
                done();
        });
    });
});