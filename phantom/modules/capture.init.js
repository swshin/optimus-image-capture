var fs = require('fs');
var Promise = require('bluebird');
var vars = require('./phantom/modules/capture.vars');

//초기화
var init = function () {
	//Promise 객체를 리턴
	return new Promise(function (resolve, reject) {
        try {
			//output 폴더를 삭제
            resolve(fs.removeTree(vars.outputFilePath));
        }
        catch (exception) {
            reject(exception);
        }
	});
};

module.exports = init;
