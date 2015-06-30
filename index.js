var spawn = require('child_process').spawn;
var Promise = require("bluebird");
var path = require('path');
var phantomScriptPath = path.join(__dirname, './phantom/phantomjs-script.js');

module.exports = function () {

	var phantomScriptArguments = Array.prototype.slice.call(arguments);
	var spawnArguments = [phantomScriptPath].concat(phantomScriptArguments);

	//Promise 객체를 리턴
	return new Promise(function (resolve, reject) {

		var phantom = spawn('phantomjs', spawnArguments);
		var phantomStream = phantom.stdout;
		var phantomRawResult = "";
		var phantomResult = {};

		phantomStream.on('data', function (data) {
			phantomRawResult += data;
		});

		//error 코드 유무에 따라 Promise 실패/성공 리턴
		phantomStream.on('end', function () {
			phantomResult = JSON.parse(phantomRawResult);
			if (phantomResult.error) return reject(phantomResult);
			else return resolve(phantomResult);
		});

		//child process 에서 오류 발생시 Promise 실패 리턴
		phantomStream.on('error', function (err) {
			phantomResult.error = err;
			phantomResult.errorMessage = "Child process를 통해 PhantomJS를 실행하는데 실패했습니다.";
			return reject(phantomResult);
		});
	});
};
