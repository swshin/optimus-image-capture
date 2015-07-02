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
		var onVideo = undefined;
		//간격에 걸쳐있는 상태
		var nearVideo = false;

        //배경색 설정하기
        page.evaluate(function () {
            document.body.bgColor = '#FFF';
        });

        //페이지 높이 구하기
        clientRect = page.evaluate(function () {
            return document.querySelector("#html2image").getBoundingClientRect();
        });

        //캡쳐 시작 위치 초기화 (기본 캡쳐높이보다 기술서 길이가 짧을 경우에 대한 예외 처리 포함)
        clipRect = {
            top: clientRect.top,
            left: clientRect.left,
            width: vars.viewportWidth,
            height: (clientRect.height > vars.viewportHeight ? vars.viewportHeight : clientRect.height)
        };

        //viewport 크기에 맞추어서 잘라서 캡쳐
        for (var i=0; clipRect.top <= clientRect.height; i++) {

			console.log((i+1) + "번째 시도. clipRect.top : " + clipRect.top);

			try {
				//대상 동영상 초기화
				targetMovie = undefined;

				//동영상의 높이와 동일할 경우, 동영상 크기로만 캡쳐 -> 동영상 링크가 포함된 태그로 처리
				vars.mediaProperties.some(function (item) {
					//동영상 위치와 캡쳐 위치가 동일하면, 동영상만 자른다.
					if (item.top === clipRect.top) {
						console.log("[동영상 위치]" + item.id + "의 높이가 " + item.top + "이고 현재 클립 높이는 " + clipRect.top);
						//현재 동영상으로 설정
						targetMovie = item;
						//캡쳐 높이를 동영상의 높이로 설정
						clipRect.height = item.height;

						console.log("[동영상 위치] 아이템 높이는 " + item.height);
						return true;
					}
					//동영상 위치가 캡쳐 범위 내에 있을 경우 조절한다.
					else if (item.top - clipRect.top < clipRect.height) {
						console.log("[동영상 근처]");
						//캡쳐 높이를 동영상의 바로 위까지의 높이로 설정
						clipRect.height = item.top - clipRect.top;
						return true;
					}
					else {
						return false;
					}
				});

                outputFileName = vars.prdid + "-" + i + ".jpg";
                page.clipRect = clipRect;
                page.render(vars.outputFilePath + outputFileName, {format: vars.imageFormat, quality: vars.imageQuality});
                outputFiles.push(vars.outputFilePath + outputFileName);

				//만약 현재 위치가 동영상 위치라면,
				if (targetMovie) {
					console.log("[동영상 위치에서 마크업 부분]");
					//영상에 대한 링크 추가
					//outputTemplate += "<a href=\"" + targetMoive.src + "\"><img src=\"data:image/gif;base64,R0lGODlhAQABAAAAACw=\" data-src=\"" + outputFileName + "\" class=\"lazy-hidden\"/></a><br />";

					console.log('asdfasdfasdfasdfsdaf')
					//해당 동영상만큼만 다음 시작 위치 조정
	                clipRect.top += targetMovie.height;

					console.log('!@#!@#%$!@$#!@#!@#')
	                clipRect.height = clientRect.height - clipRect.top < vars.viewportHeight ? clientRect.height - clipRect.top : vars.viewportHeight;

					console.log("[동영상 위치에서 마크업 부분] 무비가 있네?? 다음 clipRect.top은 " + clipRect.top + "  그리고 다음 clipRect.height는 " + clipRect.height );
					//해당 영상 정보 삭제
					vars.mediaProperties.splice(vars.mediaProperties.indexOf(targetMovie), 1);
				}
				//동영상 위치가 아니라면,
				else {
					//outputTemplate += "<img src=\"data:image/gif;base64,R0lGODlhAQABAAAAACw=\" data-src=\"" + outputFileName + "\" class=\"lazy-hidden\"/><br />";

	                clipRect.top += (clipRect.height == vars.viewportHeight) ? vars.viewportHeight : clipRect.height;
	                clipRect.height = clientRect.height - clipRect.top < vars.viewportHeight ? clientRect.height - clipRect.top : vars.viewportHeight;

					console.log("일반 케이스 다음 clipRect.top은 " + clipRect.top + "  그리고 다음 clipRect.height는 " + clipRect.height );
				}
            }
            catch (excetion) {
                //오류 리포트
                reject(report.result("PHANOM02", vars.prdid + "-" + i + ".jpg 파일을 생성하는 과정에서 오류가 발생했습니다."));
            }
        }

        //템플릿 생성
        outputTemplate = "<style>" + vars.inlineCSS + "</style><div class=\"optimus-image-capture\">" + outputTemplate + "</div><script>" + vars.inlineJS + "</script>";
        //결과값 리턴
        resolve(report.result(false, false, outputFiles, outputTemplate));
    });
};

module.exports = render;
