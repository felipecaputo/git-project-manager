/* global describe, it */

// 
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// const vscode = require('vscode');
const ProjectLocator = require('../src/gitProjectLocator');
const path = require('path');
const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;

const noGitFolder = path.join(__dirname, '/noGit');
const gitProjFolder = path.join(__dirname, '/projects');
const bothFolders = [noGitFolder, gitProjFolder];

const projectLocator = new ProjectLocator(config);

// Defines a Mocha test suite to group tests of similar kind together
describe("gitProjectLocator Tests", function () {

    describe("#Available functions", function () {
        // Defines a Mocha unit test
        it("Should export locateGitProjects function", function (done) {
            assert.equal(typeof projectLocator.locateGitProjects, "function");
            done();
        });
    });

    describe("#Searching without repos", function () {
        it("Shouldn't find any repositories", function (done) {
            this.timeout(20000);
            projectLocator.locateGitProjects([noGitFolder])
                .then(repoList => {
                    expect(repoList.dirList.length).to.be.equal(0);
                    done();
                });
        });
    });

    describe("#Searching repos", function () {
        it("Should find 2 repositories", function (done) {
            this.timeout(20000);

            [
                path.join(gitProjFolder, 'project1/.git'),
                path.join(gitProjFolder, 'project2/.git')
            ].forEach(dir => {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                    fs.writeFileSync(path.join(dir, 'config'), 'fake', { encoding: 'utf8' });
                }
            });

            projectLocator.locateGitProjects(bothFolders)
                .then(repoList => {
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