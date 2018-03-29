/* global describe, it */

var assert = require('assert');

const ProjectManager = require('../src/gitProjectManager');
const Config = require('../src/config');
const config = new Config();
const projectManager = new ProjectManager(config)

describe("gitProjectManager", function () {
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
});