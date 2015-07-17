var fs = require('fs');
var system = require('system');
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
			//더미 이미지
			vars.dummyImage.url = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
			//지원되지 않는 동영상 이미지
			vars.cautionImage.url = "file:///" + vars.workingDirectory + "/phantom/resources/" + "swf.jpg";
			vars.cautionImage.width = 150;
			vars.cautionImage.halfWidth = 0 | (vars.cautionImage.width/2);
			vars.cautionImage.height = 150;
			vars.cautionImage.halfHeight = 0 | (vars.cautionImage.height/2);
			//재생 버튼 이미지
			vars.playButtonImage.url = "file:///" + vars.workingDirectory + "/phantom/resources/" + "playbutton.png";
			vars.playButtonImage.width = 100;
			vars.playButtonImage.height = 100;
			vars.playButtonImage.halfWidth = 0 | (vars.playButtonImage.width/2);
			vars.playButtonImage.halfHeight = 0 | (vars.playButtonImage.height/2);
			//템플릿에 포함할 인라인 CSS (PhantomJS의 read 함수는 동기 방식으로 동작)
			vars.inlineCSS = fs.read(vars.workingDirectory + '/phantom/resources/inline.min.css');
			//템플릿에 포함할 인라인 자바스크립트 (PhantomJS의 read 함수는 동기 방식으로 동작)
			vars.inlineJS = fs.read(vars.workingDirectory + '/phantom/resources/inline.min.js').replace(/"/g, "'");
			//output 폴더를 삭제 (PhantomJS의 removeTree 함수는 동기 방식으로 동작)
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
