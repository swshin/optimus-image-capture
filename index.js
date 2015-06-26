var spawn = require('child_process').spawn;
var Promise = require("bluebird");
var path = require('path');
var phantomScriptPath = path.join(__dirname, './phantom/phantomjs-script.js');

module.exports = function () {

	var phantomScriptArguments = Array.prototype.slice.call(arguments);
	var spawnArguments = [phantomScriptPath].concat(phantomScriptArguments);

	console.log(spawnArguments)

	//Promise 객체를 리턴
	return new Promise(function (resolve, reject) {

		var phantom = spawn('phantomjs', spawnArguments);
		var phantomStream = phantom.stdout;
		var phantomRawResult = "";
		var phantomResult = {}

		phantomStream.on('data', function (data) {
			phantomRawResult += data;
		});

		phantomStream.on('end', function () {
			console.log(phantomRawResult);
			phantomResult = JSON.parse(phantomRawResult);

			//Promise 성공
			resolve(phantomResult);
		});

		phantomStream.on('error', function (err) {
			phantomResult.error = err;
			phantomResult.errorMessage = "Child process를 통해 PhantomJS를 실행하는데 실패했습니다.";

			//Promise 실패
			reject(phantomResult);
		});
	});
};
