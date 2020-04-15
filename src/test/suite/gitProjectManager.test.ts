/* global describe, it, beforeEach, afterEach */

import { expect } from 'chai';
import { createSandbox, SinonSandbox } from 'sinon';
import * as vscode from 'vscode';

import ProjectManager from '../../gitProjectManager';
import Config from '../../domain/config';
import StateMock from './stateMock';
const projectManager = new ProjectManager(new Config(), new StateMock());

suite("gitProjectManager", function () {
    var sandbox: SinonSandbox;
    setup(function () {
        // create sandbox environment for mocking about
        sandbox = createSandbox();
    });

    teardown(function () {
        // restore the environment as it was before
        sandbox.restore();
    });

    suite("#Available functions", function () {
        test("Should export showProjectList function", function (done) {
            expect(typeof projectManager.showProjectList).to.be.equals("function");
            done();
        });

        test("Should export openProject function", function (done) {
            expect(typeof projectManager.openProject).to.be.equals("function");
            done();
        });

        test("Should export getProjectsList function", function (done) {
            expect(typeof projectManager.getProjectsList).to.be.equals("function");
            done();
        });

        test("Should export refreshSpecificFolder function", function (done) {
            expect(typeof projectManager.refreshSpecificFolder).to.be.equals("function");
            done();
        });

        test("Should export refreshList function", function (done) {
            expect(typeof projectManager.refreshList).to.be.equals("function");
            done();
        });
    });

    test('should call open project without new windows if vscode has no open folder', () => {
        sandbox.stub(vscode.workspace, 'workspaceFolders').callsFake(() => undefined);
        let mockCommand = sandbox.stub(vscode.commands, 'executeCommand');
        projectManager.openProject('test', true);
        mockCommand.getCall(0).calledWith('vscode.openFolder', 'test', false);
    });

    test('should call open project with new windows if vscode has an open folder', () => {
        sandbox.stub(vscode.workspace, 'workspaceFolders').callsFake(() => 'a');;
        let mockCommand = sandbox.stub(vscode.commands, 'executeCommand');
        projectManager.openProject('test', true);
        mockCommand.getCall(0).calledWith('vscode.openFolder', 'test', true);
    });
});
