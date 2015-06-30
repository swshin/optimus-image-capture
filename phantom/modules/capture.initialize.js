var fs = require('fs');
var Promise = require('bluebird');
var vars = require('./capture.vars');

//초기화
var initialize = function () {
	//Promise 객체를 리턴
	return new Promise(function (resolve, reject) {

        try {
			//jQuery path
			vars.jQueryPath = vars.workingDirectory + "/node_modules/jquery/dist/jquery.min.js";
			//캡쳐 결과물 파일 경로
			vars.outputFilePath = vars.workingDirectory + "/phantom/output/";
			//템플릿에 포함할 인라인 CSS -> 9999로 되어 있는 상품기술서 이미지의 높이를 뷰포트 높이로 치환
			vars.inlineCSS = fs.read(vars.workingDirectory + '/phantom/inlines/inline.min.css').replace(/9999/, vars.viewportHeight);
			//템플릿에 포함할 인라인 자바스크립트
			vars.inlineJS = fs.read(vars.workingDirectory + '/phantom/inlines/inline.min.js');
			//output 폴더를 삭제
			fs.removeTree(vars.outputFilePath);
			//완료
            resolve(true);
        }
        catch (exception) {
            reject(report.result("PHANOM00", "output 폴더를 비우는데 실패했습니다."));
        }
	});
};

module.exports = initialize;
