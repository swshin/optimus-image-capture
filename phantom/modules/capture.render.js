var Promise = require('bluebird');
var vars = require('./capture.vars');
var report = require('./capture.report');

//캡쳐 및 템플릿팅
var render = function (page) {

	return new Promise(function (resolve, reject) {
		//캡쳐할 전체 영역
		var clientRect = {};
		//캡쳐할 부분 영역
		var clipRect = {};
		//캡쳐 결과물 파일
		var outputFileName = "";
		//캡쳐 결과물 템플릿
		var outputTemplate = "";
		//캡쳐 결과물 파일명들
		var outputFiles = [];
		//현재 대상이 되는 동영상
		var targetedMovie = undefined;

		//배경색 설정하기
		page.evaluate(function (vars) {
			document.body.bgColor = '#FFF';
		}, vars);

		//기본 글꼴 설정하기
		page.evaluate(function (vars) {
			var font = document.createElement("style");
			font.innerHTML = "* { font-family: '나눔바른고딕'; }";
			document.head.appendChild(font);
		}, vars);

		//캡쳐할 전체 영역 구하기
		clientRect = page.evaluate(function (vars) {
			return document.querySelector(vars.clientRectSelector).getBoundingClientRect();
		}, vars);

		//캡쳐 시작 위치 초기화 (기본 캡쳐높이보다 기술서 길이가 짧을 경우에 대한 예외 처리 포함)
		clipRect = {
			top: clientRect.top,
			left: clientRect.left,
			width: vars.viewportWidth,
			height: (clientRect.height > vars.viewportHeight ? vars.viewportHeight : clientRect.height)
		};

		//viewport 크기에 맞추어서 잘라서 캡쳐
		for (var i=0; clipRect.top < clientRect.height; i++) {
			try {
				//대상 동영상 초기화
				targetedMovie = undefined;

				//동영상의 높이와 동일할 경우, 동영상 크기로만 캡쳐 -> 동영상 링크가 포함된 태그로 처리
				vars.mediaProperties.some(function (item) {
					//동영상 위치와 캡쳐 위치가 동일하면, 동영상만 자른다.
					if (item.top === clipRect.top) {
						//현재 동영상으로 설정
						targetedMovie = item;
						//캡쳐 높이를 동영상의 높이로 설정
						clipRect.height = item.height;

						return true;
					}
					//동영상 위치가 캡쳐 범위 내에 있을 경우 조절한다.
					else if (item.top > clipRect.top && item.top - clipRect.top < clipRect.height) {
						//캡쳐 높이를 동영상의 바로 위까지의 높이로 설정
						clipRect.height = item.top - clipRect.top;

						return true;
					}
					else {
						return false;
					}
				});

				outputFileName = i + "." + vars.imageFormat;
				page.clipRect = clipRect;
				page.render(vars.outputFilePath + outputFileName, {format: vars.imageFormat, quality: vars.imageQuality});
				outputFiles.push(outputFileName);

				//만약 현재 위치가 동영상 위치라면,
				if (targetedMovie) {
					//영상에 대한 링크 추가
					outputTemplate += "<a href='" + targetedMovie.src + "' target=_blank><img src='" + vars.dummyImage.url + "' data-src='" + outputFileName + "' width=" + clipRect.width + " height=" + clipRect.height + " class='lazy-hidden'/></a><br />";

					//해당 동영상만큼만 다음 시작 위치 조정
					clipRect.top += targetedMovie.height;
					clipRect.height = clientRect.height - clipRect.top < vars.viewportHeight ? clientRect.height - clipRect.top : vars.viewportHeight;
				}
				//동영상 위치가 아니라면,
				else {
					outputTemplate += "<img src='" + vars.dummyImage.url + "' data-src='" + outputFileName + "' width=" + clipRect.width + " height=" + clipRect.height + " class='lazy-hidden'/><br />";

					clipRect.top += (clipRect.height == vars.viewportHeight) ? vars.viewportHeight : clipRect.height;
					clipRect.height = clientRect.height - clipRect.top < vars.viewportHeight ? clientRect.height - clipRect.top : vars.viewportHeight;
				}
			}
			catch (excetion) {
				//오류 리포트
				reject(report.result("PHANOM02", i + "." + vars.imageFormat + ".파일을 생성하는 과정에서 오류가 발생했습니다."));
			}
		}

		//템플릿 생성
		outputTemplate = "<style>" + vars.inlineCSS + "</style><div class='optimus-image-capture'>" + outputTemplate + "</div><script>" + vars.inlineJS + "</script>";
		//결과값 리턴
		resolve(report.result(false, false, vars.outputFilePath, outputFiles, outputTemplate, vars.md5));
	});
};

module.exports = render;
