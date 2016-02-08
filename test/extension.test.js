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
 var myExtension = require('../src/extension');

// Defines a Mocha test suite to group tests of similar kind together
describe("Extension Tests", function() {

	// Defines a Mocha unit test
	it("Should export activate function", function() {
		assert.equal(typeof myExtension.activate, "function");
	});
    
    it("Should export deactivate function", function() {
		assert.equal(typeof myExtension.deactivate, "function");
	});
});