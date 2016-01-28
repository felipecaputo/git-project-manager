var repoList = [];

function getQuickPickList() {
	var qp = [];
	for(var i=0;i<repoList.length;i++){
		var qpItem = {
			label: repoList[i].dir,
			description: repoList[i].repo
		};
		qp.push(qpItem);
	}
	return qp;
}


exports.getProjectsList = function (basePath) {
	function getProjectListPromised (resolve, reject){
		var projectLocator = require('./gitProjectLocator');
		projectLocator.locateGitProjects(basePath, (dirList) => {
			repoList = dirList;
			resolve(getQuickPickList());
		})
	}
	var promise = new Promise(getProjectListPromised);
	return promise;
}