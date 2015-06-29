/*
capture.vars //주요 변수들
capture.init //output 폴더 비우기, 변수 초기화
capture.open //옵션에 따라 page를 열어서 완전히 로드가 완료되면 page 객체 리턴
capture.movies //page 객체에서 동영상 관련 처리
capture.imagemaps //movies에서 마치면 좋겠지만, 이미지맵 처리를 여기서 함.
capture.render //치환된 동영상 이미지와 동영상 위치값 등을 바탕으로 페이지를 캡쳐하고 나누어서 템플릿을 생성해서 리턴
*/

/*
    페이지 세팅
*/
page.settings.userAgent = userAgent
page.settings.resourceTimeout = resourceTimeout;
page.viewportSize = { width: viewportWidth, height: viewportHeight };

//페이지가 모두 로드되었는지 체크
var documentReadyCheck = function () {
    //현재 페이지 컨텐츠 길이
    var currentLength = page.content.length;

    //더이상 변경이 없으면, 결과 출력 -> 향후에는 nested iframe 까지 모두 체크 필요
    if (iframeLoadFinished && currentLength === contentLength && !Object.keys(resources).length) {
        window.setTimeout(function () {
            //화면 캡쳐 시작
            renderPage();
        }, 1000); //혹시 몰라 1초 뒤에.. iframe 내부의 요소들까지 모두 완전하게 로드된걸 파악하기란..
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

//DOMContentLoaded 이벤트가 발생했을 때
page.onCallback = function (event) {

    switch (event) {
        case 'DOMContentLoaded':
            //정말 로딩이 더이상 없는지 체크
            documentReadyCheck();
        break;
    }
};

//onLoadFinished 이벤트가 발생했을 때
page.onLoadFinished = function  (status) {
    if (status === "success") {
        iframeLoadFinished = page.evaluate(function () {
            return window === window.top;
        });
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


//결과값 리턴
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

//캡쳐 및 템플릿팅
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
            outputTemplate += "<img src=\"data:image/gif;base64,R0lGODlhAQABAAAAACw=\" data-src=\"" + outputFileName + "\" class=\"lazy-hidden\"/><br />";

            clipRect.top += viewportHeight;
            clipRect.height = clientRect.height - clipRect.top < viewportHeight ? clientRect.height - clipRect.top : viewportHeight;
        }
        catch (excetion) {
            //오류 내용 리턴하고 종료
            returnResult("PHANOM02", prdid + "-" + i + ".jpg 파일을 생성하는 과정에서 오류가 발생했습니다.");
        }
    }

    //템플릿 생성
    outputTemplate = "<style>" + inlineCSS + "</style><div class=\"optimus-image-capture\">" + outputTemplate + "</div><script>" + inlineJS + "</script>";

    //결과값 리턴하고 종료
    returnResult(false, false, outputFiles, outputTemplate);
};


//페이지 오픈 -> 단품의 경우 상품기술서 URL이 존재
page.open('http://www.gsshop.com/mi15/prd/prdImgDesc.gs?prdid=' + prdid, function (status) {
    //페이지를 오픈하는데 실패한 경우,
	if (status !== 'success') {
        //오류 내용 리턴하고 종료
        returnResult("PHANOM01", "상품번호 " + prdid + "에 해당하는 상품기술서페이지를 여는데 실패했습니다.");
	}
});
