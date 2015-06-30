var page = require('webpage').create();
var Promise = require('bluebird');
var vars = require('./capture.vars');
var report = require('./capture.report');

var openpage = function () {
	return new Promise(function (resolve, reject) {

        //페이지 로딩시작 시각
        var openpageTime = Number(new Date());
        //iframe 로드 체크
        var iframeLoadFinished = false;
        //컨텐츠 길이
        var contentLength = 0;
        //컨텐츠 리소스
        var resources = {};

        //페이지가 모두 로드되었는지 체크하는 메서드
        var documentReadyCheck = function () {
            //페이지 타임아웃 이내이면,
            if (Number(new Date()) - openpageTime < vars.openpageTimeout) {
                //현재 페이지 컨텐츠 길이
                var currentLength = page.content.length;
                //더이상 변경이 없으면, 결과 출력 -> 향후에는 nested iframe 까지 모두 체크 필요
                if (iframeLoadFinished && currentLength === contentLength && !Object.keys(resources).length) {
                    window.setTimeout(function () {
                        //로드가 완료된 페이지를 vars에 저장
                        vars.page = page;
                        //Promise Resolve
                        resolve();
                    }, 1000);
                }
                //변경이 있으면 resourceCheckDuration 뒤에 다시 체크
                else {
                    contentLength = currentLength;
                    Object.keys(resources).forEach(function (item, index, array) {
                        if (++resources[item] > vars.resourceRequestAttempts) {
                            delete resources[item];
                        }
                    });
                    window.setTimeout(documentReadyCheck, vars.resourceCheckDuration);
                }
            }
            //제한 시간을 넘었다면,
            else {
                reject(report.result("PHANOM02", "제한 시간 이내에 페이지를 여는데 실패했습니다."));
            }
        };

        //리소스가 요청되면 목록화
        var onResourceRequested = function (request) {
            resources[request.id] = 1;
        };

        //리소스 로드가 완료되면 목록에서 제거
        var onResourceReceived = function (response) {
            if (response.stage == 'end') {
                delete resources[response.id];
            }
        };

        //리소스 로드가 실패하면 목록에서 제거
        var onResourceTimeout = function (request) {
            delete resources[request.id];
        };

        //DOMContentLoaded 이벤트가 발생했을 때
        var onCallback = function (event) {
            if (event == 'DOMContentLoaded') {
                //정말 로딩이 더이상 없는지 체크
                documentReadyCheck();
            }
        };

        //onLoadFinished 이벤트가 발생했을 때
        var onLoadFinished = function  (status) {
            if (status === "success") {
                iframeLoadFinished = page.evaluate(function () {
                    return window === window.top;
                });
            }
        };

        //DOMContentLoaded 이벤트에 콜백 등록
        var onInitialized = function () {
            page.evaluate(function () {
                document.addEventListener('DOMContentLoaded', function () {
                    window.callPhantom('DOMContentLoaded');
                }, false);
            });
        };

        //JavaScript 오류 발생시
        var onError = function (msg) {
            reject(report.result("PHANOM04", "PhantomJS에서 JavaScript 오류가 발생했습니다."));
        };

        //페이지 세팅
        page.settings.userAgent = vars.userAgent
        page.settings.resourceTimeout = vars.resourceTimeout;
        page.viewportSize = { width: vars.viewportWidth, height: vars.viewportHeight };
        page.onResourceRequested = onResourceRequested;
        page.onResourceReceived = onResourceReceived;
        page.onResourceTimeout = onResourceTimeout;
        page.onCallback = onCallback;
        page.onLoadFinished = onLoadFinished;
        page.onInitialized = onInitialized;
        page.onError = onError;

        //페이지 오픈 -> 단품의 경우 상품기술서 URL이 존재
        page.open('http://www.gsshop.com/mi15/prd/prdImgDesc.gs?prdid=' + vars.prdid, function (status) {
            //페이지를 오픈하는데 실패한 경우,
        	if (status !== 'success') {
                //오류 리포트
                reject(report.result("PHANOM01", "상품번호 " + vars.prdid + "에 해당하는 상품기술서페이지를 여는데 실패했습니다."));
        	}
        });
	});
};

module.exports = openpage;
