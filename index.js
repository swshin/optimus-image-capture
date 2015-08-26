var sys = require('sys');
var path = require('path');
var spawn = require('child_process').spawn;
var Promise = require('bluebird');
var base64 = require('base-64');

var start = function (captureOptions) {

	//Promise 객체를 리턴
	return new Promise(function (resolve, reject) {

		//PhantomJS 스크립트 경로
		var phantomScriptPath = path.join(__dirname, './phantom/phantomjs-script.js');
		//Capture 설정
		var phantomScriptArguments = [base64.encode(JSON.stringify(captureOptions))];
		//child_process 옵션과 캡쳐 옵션 병합
		var spawnArguments = [phantomScriptPath].concat(phantomScriptArguments);
		//child_process 로 PhantomJS 실행
		var phantom = spawn('phantomjs', spawnArguments);
		//PhantomJS의 output stream
		var phantomStream = phantom.stdout;
		//PhantomJS의 raw output stream을 담을 변수
		var phantomRawResult = '';
		//PhantomJS 작업 결과
		var phantomResult = {};

		//PhantomJS의 raw output stream을 보내면,
		phantomStream.on('data', function (data) {
			//phantomRawResult에 저장하고 console에 출력
			phantomRawResult += data;
			sys.print(data);

			//child_process 에서 잡을 수 없는 Error: 로 시작하는 PhantomJS 오류가 발생한 경우,
			if (data.toString().match(/^.*Error: /)) {
				//PhantomJS 강제 종료
				phantom.kill('SIGINT');
			}
		});

		//error 코드 유무에 따라 Promise 실패/성공 리턴
		phantomStream.on('end', function () {
			try {
				phantomResult = JSON.parse(phantomRawResult);

				if (phantomResult.code && phantomResult.code.length > 0) {
					return reject(phantomResult);
				}
				else {
					return resolve(phantomResult);
				}
			}
			catch (exception) {
				phantomResult.code = 'CAPT00';
				phantomResult.message = 'Child process를 통해 PhantomJS를 실행하는데 실패했습니다.';

				return reject(phantomResult);
			}
		});
	});
};

module.exports.start = start;
