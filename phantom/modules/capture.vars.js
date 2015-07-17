var fs = require('fs');
var system = require('system');

module.exports = {
	//userAgent 설정
	userAgent : 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.7 (KHTML, like Gecko) Chrome/7.0.517.44 Safari/534.7',
	//페이지 타임아웃 (ms)
	openpageTimeout : 600000,
	//리소스 제한시간 (ms)
	resourceTimeout : 10000,
	//리소스 다운로드 시도 횟수
	resourceRequestAttempts : 5,
	//리로스 다운로드 여부 체크 간격 (ms)
	resourceCheckDuration : 2000,
	//썸네일 다운로드 예상 시간 (ms)
	thumbnailDownloadDuration : 2000,
	//jQuery path
	jQueryPath : fs.workingDirectory + "/node_modules/jquery/dist/jquery.min.js",
	//이미지 퀄리티
	imageQuality : Number(system.args[2]) || 70,
	//이미지 포맷
	imageFormat : "jpeg",
	//캡쳐 결과물 파일 경로
	outputFilePath : fs.workingDirectory + "/phantom/output/",
	//상품 번호
	prdid : system.args[1],
	//기존 MD5
	md5 : system.args[4],
	//뷰포트(캡쳐할 크기) 가로
	viewportWidth : 700,
	//뷰포트(캡쳐할 크기) 세로
	viewportHeight : Number(system.args[3]) || 1000,
	//템플릿에 포함할 인라인 CSS
	inlineCSS : fs.read(fs.workingDirectory + '/phantom/resources/inline.min.css'),
	//템플릿에 포함할 인라인 자바스크립트
	inlineJS : fs.read(fs.workingDirectory + '/phantom/resources/inline.min.js').replace(/"/g, "'"),
	//더미 이미지
	dummyImage : {
		url : "data:image/gif;base64,R0lGODlhAQABAAAAACw="
	},
	//지원되지 않는 동영상 이미지
	cautionImage : {
		width : 150,
		height : 150,
		halfWidth : 75,
		halfHeight : 75,
		url : "file:///" + fs.workingDirectory + "/phantom/resources/" + "swf.jpg"
	},
	//재생 버튼 이미지
	playButtonImage : {
		width : 100,
		height : 100,
		halfWidth : 50,
		halfHeight : 50,
		url : "file:///" + fs.workingDirectory + "/phantom/resources/" + "playbutton.png"
	},
	mediaProperties : []
};
