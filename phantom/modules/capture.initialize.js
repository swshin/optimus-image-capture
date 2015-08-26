var fs = require('fs');
var system = require('system');
var Promise = require('bluebird');
var base64 = require('base-64');

//초기화
var initialize = function () {
	//Promise 객체를 리턴
	return new Promise(function (resolve, reject) {
		try {
			//모듈 경로
			var modulePath = fs.absolute(system.args[0].replace(/[^\/]*\/[^\/]*$/, ''));
			//캡쳐 설정값
			var vars = JSON.parse(base64.decode(system.args[1]));
			//userAgent 설정
			vars.userAgent = vars.userAgent || 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.7 (KHTML, like Gecko) Chrome/7.0.517.44 Safari/534.7';
			//jQuery path
			vars.jQueryPath = vars.jQueryPath || modulePath + '/node_modules/jquery/dist/jquery.min.js';
			//캡쳐 대상
			vars.url = vars.url || '';
			//캡쳐 이미지 퀄리티
			vars.imageQuality = Number(vars.imageQuality || 70);
			//기본 캡쳐 단위 높이
			vars.viewportHeight = Number(vars.viewportHeight || 1000);
			//캡쳐 결과물 경로
			vars.resultPath = fs.absolute((vars.resultPath || modulePath + '/phantom') + '/result/');
			//뷰포트(캡쳐할 크기) 가로
			vars.viewportWidth = Number(vars.viewportWidth || 700);
			//이미지 포맷
			vars.imageFormat = vars.imageFormat || 'jpeg';
			//캡쳐할 전체 영역 셀렉터
			vars.clientRectSelector = vars.clientRectSelector || '#html2image';
			//페이지 로딩 타임아웃 (ms)
			vars.openpageTimeout = Number(vars.openpageTimeout || 600000);
			//리소스 제한시간 (ms)
			vars.resourceTimeout = Number(vars.resourceTimeout || 60000);
			//페이지 로드 완료 여부 체크 간격 (ms)
			vars.openpageCompleteCheckDuration = Number(vars.openpageCompleteCheckDuration || 2000);
			//동영상 썸네일 다운로드 대기 시간
			vars.thumbnailDownloadDuration = Number(vars.thumbnailDownloadDuration || 2000);
			//템플릿에 포함할 인라인 CSS 파일 경로
			vars.stylesheetFilePath = vars.stylesheetFilePath || modulePath + '/phantom/resources/inline.min.css';
			//템플릿에 포함할 인라인 자바스크립트 파일 경로
			vars.javascriptFilePath = vars.javascriptFilePath || modulePath + '/phantom/resources/inline.min.js';
			//템플릿에 포함할 인라인 CSS
			vars.inlineCSS = '';
			//템플릿에 포함할 인라인 자바스크립트
			vars.inlineJS = '';
			//더미 이미지
			vars.dummyImageUrl = vars.dummyImageUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEXCwsK592mkAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';
			//지원되지 않는 동영상 이미지
			vars.cautionImage = vars.cautionImage || {
				width: 150,
				height: 150,
				halfWidth: 75,
				halfHeight: 75,
				url: 'file:///' + modulePath + '/phantom/resources/' + 'swf.jpg'
			};
			//재생 버튼 이미지
			vars.playButtonImage = vars.playButtonImage || {
				width: 100,
				height: 100,
				halfWidth: 50,
				halfHeight: 50,
				url: 'file:///' + modulePath + '/phantom/resources/' + 'playbutton.png'
			};

			//결과물을 저장할 outputFilePath가 존재하면,
			if (fs.exists(vars.resultPath)) {
				//output 폴더를 비워준다 (PhantomJS의 removeTree 함수는 동기 방식으로 동작)
				fs.removeTree(vars.resultPath);
			}

			//템플릿에 포함할 인라인 CSS
			vars.inlineCSS = fs.read(vars.stylesheetFilePath);
			//템플릿에 포함할 인라인 자바스크립트
			vars.inlineJS = fs.read(vars.javascriptFilePath).replace(/"/g, '\'');

			//초기화 완료
			resolve(vars);
		}
		catch (exception) {
			reject({result: report.result('INIT00', '옵티머스 이미지 캡쳐를 초기화하는데 실패했습니다. ' + exception)});
		}
	});
};

module.exports = initialize;
