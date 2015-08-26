var fs = require('fs');
var Promise = require('bluebird');
var SparkMD5 = require('spark-md5');
var report = require('./capture.report');

//캡쳐 및 템플릿팅
var render = function (vars) {

	return new Promise(function (resolve, reject) {
		//캡쳐할 전체 영역
		var clientRect = {};
		//캡쳐할 부분 영역
		var clipRect = {};
		//캡쳐 결과물 파일
		var outputFileName = '';
		//캡쳐 결과물 템플릿
		var outputTemplate = '';
		//캡쳐 결과물 파일명들
		var outputFiles = [];
		//현재 대상이 되는 동영상
		var targetedMovie = undefined;
		//SparkMD5 인스턴스
		var sparkMD5 = new SparkMD5();
		//캡쳐된 이미지 파일들의 해시값
		var outputFilesHash = undefined;

		//배경색 설정하기
		vars.page.evaluate(function (vars) {
			document.body.bgColor = '#FFFFFF';
		}, vars);

		//기본 글꼴 설정하기
		vars.page.evaluate(function (vars) {
			var fontStyle = document.createElement('style');
			fontStyle.innerHTML = '* { font-family: \'NanumBarunGothic\'; }';
			document.head.appendChild(fontStyle);
		}, vars);

		//캡쳐할 전체 영역 구하기
		clientRect = vars.page.evaluate(function (vars) {
			try {
				return document.querySelector(vars.clientRectSelector).getBoundingClientRect();
			}
			catch (exception) {
				return undefined;
			}
		}, vars);

		//캡쳐할 전체 영역이 정상적으로 구해진 경우,
		if (clientRect && clientRect.height) {
			try {
				//캡쳐 시작 위치 초기화 (기본 캡쳐높이보다 기술서 길이가 짧을 경우에 대한 예외 처리 포함)
				clipRect = {
					top: clientRect.top,
					left: clientRect.left,
					width: vars.viewportWidth,
					height: (clientRect.height > vars.viewportHeight ? vars.viewportHeight : clientRect.height)
				};

				//viewport 크기에 맞추어서 잘라서 캡쳐
				for (var i = 0; clipRect.top < clientRect.height; i++) {

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

					//저장할 파일명 설정
					outputFileName = i + '.' + vars.imageFormat;
					//파일명을 캡쳐 파일 리스트에 추가
					outputFiles.push(outputFileName);

					//켭쳐할 영역 설정
					vars.page.clipRect = clipRect;
					//설정된 속성에 따라 캡쳐
					vars.page.render(vars.resultPath + outputFileName, {format: vars.imageFormat, quality: vars.imageQuality});

					//만약 현재 위치가 동영상 위치라면,
					if (targetedMovie) {
						//영상에 대한 링크 추가
						outputTemplate += '<a href=\'' + targetedMovie.src + '\' target=_blank><img src=\'' + vars.dummyImageUrl + '\' data-src=\'' + vars.resultPath + outputFileName + '\' width=' + clipRect.width + ' height=' + clipRect.height + ' class=\'lazy-hidden\'/></a><br />';

						//해당 동영상만큼만 다음 시작 위치 조정
						clipRect.top += targetedMovie.height;
						clipRect.height = clientRect.height - clipRect.top < vars.viewportHeight ? clientRect.height - clipRect.top : vars.viewportHeight;
					}
					//동영상 위치가 아니라면,
					else {
						outputTemplate += '<img src=\'' + vars.dummyImageUrl + '\' data-src=\'' + vars.resultPath + outputFileName + '\' width=' + clipRect.width + ' height=' + clipRect.height + ' class=\'lazy-hidden\'/><br />';

						clipRect.top += (clipRect.height == vars.viewportHeight) ? vars.viewportHeight : clipRect.height;
						clipRect.height = clientRect.height - clipRect.top < vars.viewportHeight ? clientRect.height - clipRect.top : vars.viewportHeight;
					}
				}

				//템플릿 생성 (css와 script 추가)
				outputTemplate = '<style>' + vars.inlineCSS + '</style><div class=\'optimus-image-capture\'>' + outputTemplate + '</div><script>' + vars.inlineJS + '</script>';

				//해시 생성을 위해 이미지 파일 로드
				outputFiles.forEach(function (item) {
					//이미지 파일
					var captureImage = vars.resultPath + item;

					//이미지 파일이 존재하면,
					if (fs.exists(captureImage)) {
						//해시값을 계산할 바이너리 추가
						sparkMD5.appendBinary(fs.read(captureImage));
					}
				});

				//해시값 계산
				outputFilesHash = sparkMD5.end();

				//결과 리포트 생성
				vars.result = report.result('', {path: vars.resultPath, files: outputFiles, template: outputTemplate, md5: outputFilesHash});
				//결과값 리턴
				resolve(vars);
			}
			catch (excetion) {
				//결과 리포트 생성
				vars.result = report.result('REND00', '스크린샷 및 템플릿 생성 과정에서 오류가 발생했습니다.');
				//실패 처리
				reject(vars);
			}
		}

		//정상적으로 구해지지 않은 경우,
		else {
			//결과 리포트 생성
			vars.result = report.result('REND01', '캡쳐할 영역을 설정하는데 실패했습니다. ' + vars.clientRectSelector);
			//실패 처리
			reject(vars);
		}
	});
};

module.exports = render;
