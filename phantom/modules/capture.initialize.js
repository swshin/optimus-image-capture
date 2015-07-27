var fs = require('fs');
var Promise = require('bluebird');
var vars = require('./capture.vars');

//초기화
var initialize = function () {
	//Promise 객체를 리턴
	return new Promise(function (resolve, reject) {
		try {
			if (fs.exists(vars.outputFilePath)) {
				//output 폴더를 삭제 (PhantomJS의 removeTree 함수는 동기 방식으로 동작)
				fs.removeTree(vars.outputFilePath);
			}

			//완료
			resolve(true);
		}
		catch (exception) {
			reject(report.result("PHANOM00", "output 폴더를 비우는데 실패했습니다."));
		}
	});
};

module.exports = initialize;
