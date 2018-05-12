/* global describe, it, beforeEach, afterEach */

var assert = require('assert');
const sinon = require('sinon');
const vscode = require('vscode');

const ProjectManager = require('../src/gitProjectManager');
const Config = require('../src/config');
const config = new Config();
const projectManager = new ProjectManager(config)

describe("gitProjectManager", function () {
    var sandbox;
    beforeEach(function () {
        // create sandbox environment for mocking about
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        // restore the environment as it was before
        sandbox.restore();
    });

    describe("#Available functions", function () {
        it("Should export showProjectList function", function (done) {
            assert.equal(typeof projectManager.showProjectList, "function");
            done();
        });

        it("Should export openProject function", function (done) {
            assert.equal(typeof projectManager.openProject, "function");
            done();
        });

        it("Should export getProjectsList function", function (done) {
            assert.equal(typeof projectManager.getProjectsList, "function");
            done();
        });

        it("Should export refreshSpecificFolder function", function (done) {
            assert.equal(typeof projectManager.refreshSpecificFolder, "function");
            done();
        });

        it("Should export refreshList function", function (done) {
            assert.equal(typeof projectManager.refreshList, "function");
            done();
        });
    });

    it('should call open project without new windows if vscode has no open folder', () => {
        sandbox.stub(vscode.workspace, 'workspaceFolders').callsFake([]);
        let mockCommand = sandbox.stub(vscode.commands, 'executeCommand');
        projectManager.openProject('test', true);
        mockCommand.getCall(0).calledWith('vscode.openFolder', 'test', false);
    })

    it('should call open project with new windows if vscode has an open folder', () => {
        let mockFolders = sandbox.stub(vscode.workspace, 'workspaceFolders').callsFake(['a']);;
        let mockCommand = sandbox.stub(vscode.commands, 'executeCommand');
        projectManager.openProject('test', true);
        mockCommand.getCall(0).calledWith('vscode.openFolder', 'test', true);
    })
});
