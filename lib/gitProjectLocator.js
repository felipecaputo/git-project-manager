
exports.locateGitProjects = (basePath, callBack) => {
	var locator = require('filewalker');
	var path = require('path');
	var dirList = [];

	function addToList(dirPath, repoName) {
		var obj = {
			dir: dirPath,
			repo: repoName
		};
		dirList.push(obj);
		return;
	}

	function extractRepoInfo(basePath) {
		var exec = require('child_process').exec;
		exec('git remote show origin -n', { cwd: basePath }, (error, stdout, stderr) => {
			if (error) {
				return;
			};

			var arr = stdout.toString('utf-8').split('\n');
			for (var i = 0; i < arr.length; i++) {
				var line = arr[i];
				var repoPath = 'Fetch URL: ';
				var idx = line.indexOf(repoPath);
				if (idx == -1) continue;

				addToList(path.normalize(basePath + path.sep + '..'), line.trim().replace(repoPath, ''));
				break;
			}
		})
	}

	function processDirectory(relPath, fsOptions, absPath) {
		var currentDir = path.basename(absPath);

		if (currentDir == '.git') {
			var fileName = path.join(absPath, 'config');
			var fs = require('fs');

			fs.exists(fileName, (exists) => {
				if (!exists) return;
				extractRepoInfo(absPath);
			})

		}
	}

	locator(basePath)
		.on('dir', processDirectory)
		.on('done', () => {
			callBack(dirList);
		})
		.walk();
}