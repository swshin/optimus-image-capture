var sys = require('sys');
var spawn = require('child_process').spawn;
var Promise = require('bluebird');
var path = require('path');
var phantomScriptPath = path.join(__dirname, './phantom/phantomjs-script.js');

var start = function () {

	var phantomScriptArguments = Array.prototype.slice.call(arguments);
	var spawnArguments = [phantomScriptPath].concat(phantomScriptArguments);

	//Promise 객체를 리턴
	return new Promise(function (resolve, reject) {

		var phantom = spawn('phantomjs', spawnArguments);
		var phantomStream = phantom.stdout;
		var phantomRawResult = '';
		var phantomResult = {};

		phantomStream.on('data', function (data) {
			phantomRawResult += data;
			sys.print(data);

			//child_process 에서 잡을 수 없는 Error: 로 시작하는 PhantomJS 오류가 발생한 경우,
			if (data.toString().match(/^Error: /)) {
				//PhantomJS 강제 종료
				phantom.kill('SIGINT');
			}
		});

		//error 코드 유무에 따라 Promise 실패/성공 리턴
		phantomStream.on('end', function () {
			try {
				phantomResult = JSON.parse(phantomRawResult);

				if (phantomResult.error) {
					return reject(phantomResult);
				}
				else {
					return resolve(phantomResult);
				}
			}
			catch (exception) {
				phantomResult.error = exception;
				phantomResult.errorMessage = 'Child process를 통해 PhantomJS를 실행하는데 실패했습니다.';

				return reject(phantomResult);
			}
		});
	});
};

module.exports.start = start;
