var Promise = require('bluebird');

//결과값 리턴
var result = function (code, message) {
	//리턴값
	return {
		code: code,
		message: message
	};
};

var complete = function (parameter) {
	return new Promise(function (resolve, reject) {
		console.log(JSON.stringify(parameter.result));

		resolve(parameter);
	});
};

var error = function (parameter) {
	return new Promise(function (resolve, reject) {
		//에러 객체인 경우
		if (parameter instanceof Error) {
			console.log(JSON.stringify(result('PHAN00', parameter.message)));
		}

		//정상적인 오류 리턴인 경우
		else if (parameter && typeof parameter.result === 'object' && parameter.result.code && parameter.result.code.length) {
			console.log(JSON.stringify(parameter.result));
		}

		//그밖의 경우
		else {
			console.log(JSON.stringify(result('PHAN01', '예상치 못한 오류가 발생했습니다.')));
		}

		resolve(parameter);
	});
};

exports.result = result;
exports.complete = complete;
exports.error = error;
