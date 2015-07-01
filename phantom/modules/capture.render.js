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

        //배경색 설정하기
        vars.page.evaluate(function () {
            document.body.bgColor = '#FFF';
        });

        //페이지 높이 구하기
        clientRect = vars.page.evaluate(function () {
            return document.querySelector("#html2image").getBoundingClientRect();
        });

        //캡쳐 시작 위치 초기화
        clipRect = {
            top: clientRect.top,
            left: clientRect.left,
            width: vars.viewportWidth,
            height: (clientRect.height > vars.viewportHeight ? vars.viewportHeight : clientRect.height)
        };


        //viewport 크기에 맞추어서 잘라서 캡쳐
        for (var i=0; clipRect.top <= clientRect.height; i++) {
            try {
                outputFileName = vars.prdid + "-" + i + ".jpg";
                vars.page.clipRect = clipRect;
                vars.page.render(vars.outputFilePath + outputFileName, {format: 'jpeg', quality: vars.imageQuality});

                outputFiles.push(vars.outputFilePath + outputFileName);
                outputTemplate += "<img src=\"data:image/gif;base64,R0lGODlhAQABAAAAACw=\" data-src=\"" + outputFileName + "\" class=\"lazy-hidden\"/><br />";

                clipRect.top += vars.viewportHeight;
                clipRect.height = clientRect.height - clipRect.top < vars.viewportHeight ? clientRect.height - clipRect.top : vars.viewportHeight;
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
