/* global describe, it, before, after */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// const vscode = require('vscode');
const ProjectLocator = require('../../gitProjectLocator');
const path = require('path');
const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;
const rimraf = require('rimraf');

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
            this.timeout(30000);
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
            path.join(gitProjFolder, 'project2/.git'),
            path.join(gitProjFolder, 'project3/.hg'),
            path.join(gitProjFolder, 'project4/.hg'),
            path.join(gitProjFolder, 'project5/.svn'),
            path.join(gitProjFolder, 'project6/.svn'),
            path.join(gitProjFolder, 'project7/.svn')
        ]

        before(() => {
            paths.forEach(dir => {
                if (!fs.existsSync(path.resolve(dir, '..'))) {
                    fs.mkdirSync(path.resolve(dir, '..'));
                }

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                const configPath = path.join(dir, 'config');
                if (!fs.existsSync(configPath))
                    fs.writeFileSync(configPath, 'fake', { encoding: 'utf8' });
            });
        });

        after(() => {
            paths.forEach(dir => rimraf.sync(path.resolve(dir, '..')))
        })

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

        it("Should find 4 repositories", function (done) {
            this.timeout(20000);
            const newConfig = new Config();
            newConfig.maxDepthRecursion = 5;
            newConfig.supportsMercurial = true;
            const locator = new ProjectLocator(newConfig);
            checkFoundCount(locator, bothFolders, 4, done)
        });

        it("Should find 5 repositories", function (done) {
            this.timeout(20000);
            const newConfig = new Config();
            newConfig.maxDepthRecursion = 5;
            newConfig.supportsSVN = true;
            const locator = new ProjectLocator(newConfig);
            checkFoundCount(locator, bothFolders, 5, done)
        });

        it("Should find 7 repositories", function (done) {
            this.timeout(20000);
            const newConfig = new Config();
            newConfig.maxDepthRecursion = 5;
            newConfig.supportsSVN = true;
            newConfig.supportsMercurial = true;
            const locator = new ProjectLocator(newConfig);
            checkFoundCount(locator, bothFolders, 7, done)
        });

    });

    describe('MaxDepthReached', () => {
        it('show return correct depth', () => {
            projectLocator.isMaxDeptReached('/')
        });
    });


});
