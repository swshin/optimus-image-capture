var Promise = require('bluebird');
var report = require('./capture.report');

var openpage = function (vars) {
	return new Promise(function (resolve, reject) {
		//페이지 생성 및 저장
		vars.page = require('webpage').create();
		//페이지 로딩시작 시각
		var openpageTime = Number(new Date());
		//iframe 로드 체크
		var iframeLoadFinished = false;
		//리소스 다운로드 중 오류 여부
		var onResourceReceivedError = false;
		//리소스 로드 중 타임아웃 오류 여부
		var onResourceTimeoutError = false;
		//자바스크립트 오류 여부
		var onJavaScriptErrror = false;
		//컨텐츠 리소스
		var resources = {};

		//page.open 실행이 완료되면 호출되는 콜백
		var onInitialized = function () {
			vars.page.evaluate(function () {
				//DOMContentLoaded 이벤트에 콜백 등록
				document.addEventListener('DOMContentLoaded', function () {
					window.callPhantom('DOMContentLoaded');
				}, false);
			});
		};

		//DOMContentLoaded 이벤트가 발생했을 때
		var onCallback = function (event) {
			if (event == 'DOMContentLoaded') {
				//정말 로딩이 더이상 없는지 체크
				documentReadyCheck();
			}
		};

		//onLoadFinished 이벤트가 발생했을 때 호출되는 콜백
		var onLoadFinished = function  (status) {
			if (status === 'success') {
				//최상위 iframe까지 로드가 완료되면 iframeLoadFinished 값에 반영
				iframeLoadFinished = vars.page.evaluate(function () {
					return window === window.top;
				});
			}
		};

		//리소스가 요청되면 목록화
		var onResourceRequested = function (requestData, request) {
			resources[requestData.id] = 1;
		};

		//리소스 로드가 완료되면
		var onResourceReceived = function (response) {
			if (response.stage == 'end') {
				//목록에서 제거하고
				delete resources[response.id];

				//4xx (요청 오류), 5xx (서버 오류) 는 오류로 인지
				if (response.status !== null && response.status && Number(response.status) >= 400) {
					//이미지 파일인 경우에만,
					if (typeof response.url === 'string' && response.url.match(/\.(gif|jpg|jpeg|tiff|png)$/gi)) {
						//리소스 다운로드 실패로 처리
						onResourceReceivedError = true;
					}
				}
			}
		};

		//리소스 로드가 실패하면,
		var onResourceTimeout = function (request) {
			//목록에서 제거
			delete resources[request.id];
			//리소스 중 일부가 다운로드 실패
			onResourceTimeoutError = true;
		};

		//JavaScript 오류 발생시
		var onError = function () {
			//자바스크립트 오류
			onJavaScriptErrror = true;
		};

		//페이지가 모두 로드되었는지 체크하는 메서드
		var documentReadyCheck = function () {
			//페이지 타임아웃 이내이면,
			if (Number(new Date()) - openpageTime < vars.openpageTimeout) {
				//페이지에 더이상 변경이 없으면,
				if (iframeLoadFinished && !Object.keys(resources).length) {

					//주요 리소스 다운로드 중 오류가 발생한 경우,
					if (onResourceReceivedError) {
						//오류 리포트 생성
						vars.result = report.result('OPEN01', '리소스 중 일부가 정상적으로 다운로드되지 않았습니다.');
						//실패 처리
						reject(vars);
					}

					//리소스가 Timeout으로 다운로드 실패한 경우
					else if (onResourceTimeoutError) {
						//오류 리포트 생성
						vars.result = report.result('OPEN02', '제한 시간 이내에 리소스 중 일부가 다운로드되지 않았습니다.');
						//실패 처리
						reject(vars);
					}
					/*
					//페이지에서 자바스크립트 에러가 발생한 경우,
					else if (onJavaScriptErrror) {
						//오류 리포트 생성
						vars.result = report.result('OPEN03', 'PhantomJS에서 JavaScript 오류가 발생했습니다. ');
						//실패 처리
						reject(vars);
					}
					*/
					else {
						//페이지 로드가 완료되면 다음 단계로 진행
						resolve(vars);
					}
				}
				//로드가 완료되지 않았다면,
				else {
					//resourceCheckDuration 뒤에 다시 체크
					window.setTimeout(documentReadyCheck, vars.openpageCompleteCheckDuration);
				}
			}
			//제한 시간을 넘었다면,
			else {
				//오류 리포트 생성
				vars.result = report.result('OPEN04', '제한 시간 이내에 페이지를 여는데 실패했습니다.');
				//실패 처리
				reject(vars);
			}
		};

		//페이지 세팅
		vars.page.settings.userAgent = vars.userAgent;
		vars.page.settings.resourceTimeout = vars.resourceTimeout;
		vars.page.settings.webSecurityEnabled = false;
		vars.page.settings.XSSAuditingEnabled = false;
		vars.page.settings.localToRemoteUrlAccessEnabled = true;
		vars.page.customHeaders = {
			'Connection': 'close'
		};
		vars.page.viewportSize = {
			width: vars.viewportWidth,
			height: vars.viewportHeight
		};
		vars.page.onInitialized = onInitialized;
		vars.page.onCallback = onCallback;
		vars.page.onLoadFinished = onLoadFinished;
		vars.page.onResourceRequested = onResourceRequested;
		vars.page.onResourceReceived = onResourceReceived;
		vars.page.onResourceTimeout = onResourceTimeout;
		vars.page.onError = onError;

		//모든 세팅을 마치고 페이지 오픈
		vars.page.open(vars.url, function (status) {
			//페이지를 오픈하는데 실패한 경우,
			if (status !== 'success') {
				//오류 리포트 생성
				vars.result = report.result('OPEN00', vars.url + ' 를 여는데 실패했습니다.');
				//실패 처리
				reject(vars);
			}
		});
	});
};

module.exports = openpage;
