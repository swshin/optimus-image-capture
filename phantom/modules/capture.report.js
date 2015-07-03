//결과값 리턴
var result = function (errorCode, errorMessage, files, template) {
	//리턴값
	return {
		"errorCode": errorCode,
		"errorMessage": errorMessage,
		"files": files,
		"template": template
	};
};

var complete = function (arg) {
	console.log(JSON.stringify(arg));
}

var error = function (arg) {
	//정상적인 오류 리턴인 경우
	if (typeof arg === 'object' && arg.errorCode) {
		console.log(JSON.stringify(arg));
	}
	//에러 객체인 경우
	else if (typeof arg === 'object' && arg.message) {
		console.log(JSON.stringify({
			"errorCode": "ETC01",
			"errorMessage": arg.message
		}));
	}
	//문자열인 경우
	else if (typeof arg === 'string') {
		console.log(JSON.stringify({
			"errorCode": "ETC02",
			"errorMessage": arg
		}));
	}
	//그밖의 경우
	else {
		console.log(JSON.stringify({
			"errorCode": "ETC03",
			"errorMessage": "예상치 못한 오류가 발생하였습니다."
		}));
	}
}

exports.result = result;
exports.complete = complete;
exports.error = error;
