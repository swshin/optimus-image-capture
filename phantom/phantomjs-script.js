/*
    모듈 로딩
*/
var system = require('system');
var page = require('webpage').create();

/*
    변수 선언
*/
//userAgent 설정
var userAgent = 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.7 (KHTML, like Gecko) Chrome/7.0.517.44 Safari/534.7';
//리소스 제한시간 (ms)
var resourceTimeout = 10000;
//리소스 다운로드 시도 횟수
var resourceRequestAttempts = 5;
//리로스 다운로드 여부 체크 간격 (ms)
var resourceCheckDuration = 3000;
//컨텐츠 길이
var contentLength = undefined;
//컨텐츠 리소스
var resources = {};
//jQuery path
var jQueryPath = "jquery-2.1.4.min.js";
//이미지 퀄리티
var imageQuality = system.args[2] || 70;
//캡쳐 결과물 파일명들
var outputFiles = [];
//캡쳐 결과물 파일 경로
var outputFilePath = "./phantom/output/";
//캡쳐 결과물 파일
var outputFileName = "";
//상품 번호
var prdid = system.args[1];
//캡쳐할 전체 영역
var clientRect = undefined;
//캡쳐할 부분 영역
var clipRect = undefined;
//뷰포트(캡쳐할 크기) 가로
var viewportWidth = 700;
//뷰포트(캡쳐할 크기) 세로
var viewportHeight = system.args[3] || 1000;




/*
    페이지 세팅
*/
page.settings.userAgent = userAgent
page.settings.resourceTimeout = resourceTimeout;
page.viewportSize = { width: viewportWidth, height: viewportHeight };

var documentReadyCheck = function () {
    //현재 페이지 컨텐츠 길이
    var currentLength = page.content.length;

    //더이상 변경이 없으면, 결과 출력 -> 향후에는 nested iframe 까지 모두 체크 필요
    if (currentLength === contentLength && !Object.keys(resources).length) {
        window.setTimeout(function () {
            //화면 캡쳐 시작
            renderPage();
        }, 1000);
    }
    //변경이 있으면 resourceCheckDuration 뒤에 다시 체크
    else {
        contentLength = currentLength;
        Object.keys(resources).forEach(function (item, index, array) {
            if (++resources[item] > resourceRequestAttempts) {
                delete resources[item];
            }
        });

        window.setTimeout(documentReadyCheck, resourceCheckDuration);
    }
};

//리소스가 요청되면 목록화
page.onResourceRequested = function (request) {
    resources[request.id] = 1;
};

//리소스 로드가 완료되면 목록에서 제거
page.onResourceReceived = function (response) {
    if (response.stage == 'end') {
        delete resources[response.id];
    }
};
//리소스 로드가 실패하면 목록에서 제거
page.onResourceTimeout = function (request) {
    delete resources[request.id];
};

//페이지가 리페인트
page.repaintRequested = function (e) {
    console.log(e);
};

//DOMContentLoaded 이벤트가 발생했을 때
page.onCallback = function (event) {

    switch (event) {
        case 'DOMContentLoaded':
            //정말 로딩이 더이상 없는지 체크
            documentReadyCheck();
        break;
    }
};

//DOMContentLoaded 이벤트에 콜백 등록
page.onInitialized = function () {
    page.evaluate(function () {
        document.addEventListener('DOMContentLoaded', function () {
            window.callPhantom('DOMContentLoaded');
        }, false);
    });
};


var returnResult = function (errorCode, errorMessage, files, template) {

    //리턴값
    var result = {
        "errorCode": errorCode,
        "errorMessage": errorMessage,
        "files": files,
        "template": template
    };

    //리턴값 전달 후 PhantomJS 종료
    console.log(JSON.stringify(result));
    phantom.exit();
};


var renderPage = function () {

    //배경색 설정하기
    page.evaluate(function () {
        document.body.bgColor = '#FFF';
    });

    //페이지 높이 구하기
    clientRect = page.evaluate(function () {
        return document.querySelector("#html2image").getBoundingClientRect();
    });

    //캡쳐 시작 위치 초기화
    clipRect = {
        top: clientRect.top,
        left: clientRect.left,
        width: viewportWidth,
        height: (clientRect.height > viewportHeight ? viewportHeight : clientRect.height)
    };

    //viewport 크기에 맞추어서 잘라서 캡쳐
    for (var i=0; clipRect.top <= clientRect.height; i++) {

        try {
            outputFileName = prdid + "-" + i + ".jpg";
            page.clipRect = clipRect;
            page.render(outputFilePath + outputFileName, {format: 'jpeg', quality: imageQuality});
            outputFiles.push(outputFileName);

            clipRect.top += viewportHeight;
            clipRect.height = clientRect.height - clipRect.top < viewportHeight ? clientRect.height - clipRect.top : viewportHeight;

            //이미지맵을 포함한 HTML 템플릿도 생성 필요
        }

        catch (excetion) {
            //오류 내용 리턴하고 종료
            returnResult("PHANOM02", prdid + "-" + i + ".jpg 파일을 생성하는 과정에서 오류가 발생했습니다.");
        }
    }

    //결과값 리턴하고 종료
    returnResult(false, false, outputFiles, "");
};


//페이지 오픈 -> 단품의 경우 상품기술서 URL이 존재
page.open('http://www.gsshop.com/mi15/prd/prdImgDesc.gs?prdid=' + prdid, function (status) {
    //페이지를 오픈하는데 실패한 경우,
	if (status !== 'success') {
        //오류 내용 리턴하고 종료
        returnResult("PHANOM01", "상품번호 " + prdid + "에 해당하는 상품기술서페이지를 여는데 실패했습니다.");
	}
});
