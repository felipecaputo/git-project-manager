/* global suite, test */

// 
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode');
const projectLocator = require('../src/gitProjectLocator');
const path = require('path');
const chai = require('chai');
const expect = chai.expect;

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
            this.timeout(20000);
            projectLocator.locateGitProjects([path.join(vscode.extensions.getExtension('felipecaputo.git-project-manager').extensionPath, '/test/noGit')])
                .then(repoList => {
                    expect(repoList.dirList.length).to.be.equal(0);
                    done();
                });
        });
    });       
    
    describe("#Searching repos", function () {       
        it("Should find 2 repositories", function(done)  {
            this.timeout(20000);
            projectLocator.locateGitProjects([path.join(vscode.extensions.getExtension('felipecaputo.git-project-manager').extensionPath, '/test')])
                .then( repoList => {
                    try {
                        expect(repoList.dirList.length).to.be.equal(2);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        });
    });
    
    
});