/* global describe, it, beforeEach, before, after */

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
const Config = require('../src/config');
const config = new Config();

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

        const paths = [
            path.join(gitProjFolder, 'project1/.git'),
            path.join(gitProjFolder, 'project2/.git')
        ]

        before(() => {
            paths.forEach(dir => {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                const configPath = path.join(dir, 'config');
                if (!fs.existsSync(configPath))
                    fs.writeFileSync(configPath, 'fake', { encoding: 'utf8' });
            });
        });

        function checkFoundCount(locator, dirs, count, done) {
            locator.locateGitProjects(dirs)
                .then(repoList => {
                    try {
                        expect(repoList.dirList.length).to.be.equal(count);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        }

        it("Should find 2 repositories", function (done) {
            this.timeout(20000);
            const newConfig = new Config();
            newConfig.maxDepthRecursion = 5;
            const locator = new ProjectLocator(newConfig);
            checkFoundCount(locator, bothFolders, 2, done)
        });

        it("Should find none", function (done) {
            this.timeout(20000);
            const newConfig = new Config();
            newConfig.maxDepthRecursion = 1;

            const locator = new ProjectLocator(newConfig);

            locator.config = newConfig;
            checkFoundCount(locator, [path.resolve(path.join(__dirname, '.'))], 0, done)
        });

    });

    describe('MaxDepthReached', () => {
        it('show return correct depth', () => {
            projectLocator.isMaxDeptReached('/')
        });
    });


});