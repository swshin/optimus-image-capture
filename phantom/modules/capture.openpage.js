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
			page.evaluate(function () {
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
				iframeLoadFinished = page.evaluate(function () {
					return window === window.top;
				});
			}
		};

		//리소스가 요청되면 목록화
		var onResourceRequested = function (requestData, request) {
			resources[requestData.id] = 1;
		};

		//리소스 로드가 완료되면 목록에서 제거하고 하나라도 오류가 있다면 리소스 다운로드 실패로 오류 처리
		var onResourceReceived = function (response) {
			if (response.stage == 'end') {
				//1xx (조건부 응답), 2xx (성공), 3xx (리다이렉션 완료) 는 정상으로 인지
				if (response.status === null || response.status && Number(response.status) < 400) {
					delete resources[response.id];
				}
				//4xx (요청 오류), 5xx (서버 오류) 는 오류로 인지
				else {
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
		var onError = function (errorMessage) {
			//자바스크립트 오류
			onJavaScriptErrror = true;
		};

		//페이지가 모두 로드되었는지 체크하는 메서드
		var documentReadyCheck = function () {
			//페이지 타임아웃 이내이면,
			if (Number(new Date()) - openpageTime < vars.openpageTimeout) {
				//더이상 변경이 없으면, 결과 출력 -> 향후에는 nested iframe 까지 모두 체크 필요
				if (iframeLoadFinished && !Object.keys(resources).length) {

					//리소스 다운로드 중 오류 여부
					if (onResourceReceivedError) {
						//페이지 닫기
						page.close();
						//오류 리포트
						reject(report.result('PHANOM09', '리소스 중 일부가 정상적으로 다운로드되지 않았습니다.'));
					}

					else if (onResourceTimeoutError) {
						//페이지 닫기
						page.close();
						//오류 리포트
						reject(report.result('PHANOM10', '제한 시간 이내에 리소스 중 일부가 다운로드되지 않았습니다.'));
					}

					else if (onJavaScriptErrror) {
						//페이지 닫기
						page.close();
						//오류 내역 리포트하고 종료
						reject(report.result('PHANOM04', 'PhantomJS에서 JavaScript 오류가 발생했습니다. ' + errorMessage));
					}

					else {
						//정상인 경우 페이지를 다음 단계로 전달
						resolve(page);
					}
				}
				//변경이 있으면 resourceCheckDuration 뒤에 다시 체크
				else {
					Object.keys(resources).forEach(function (item, index, array) {
						//재시도 횟수과 초과되면 해당 리소스 다운로드 포기
						if (++resources[item] > vars.resourceRequestAttempts) {
							delete resources[item];
						}
					});
					window.setTimeout(documentReadyCheck, vars.resourceCheckDuration);
				}
			}
			//제한 시간을 넘었다면,
			else {
				//페이지 닫기
				page.close();
				//오류 리포트
				reject(report.result('PHANOM02', '제한 시간 이내에 페이지를 여는데 실패했습니다.'));
			}
		};

		//페이지 세팅
		page.settings.userAgent = vars.userAgent;
		page.settings.resourceTimeout = vars.resourceTimeout;
		page.settings.webSecurityEnabled = false;
		page.settings.XSSAuditingEnabled = false;
		page.settings.localToRemoteUrlAccessEnabled = true;
		page.customHeaders = {
			'Connection': 'close'
		};
		page.viewportSize = {
			width: vars.viewportWidth,
			height: vars.viewportHeight
		};
		page.onInitialized = onInitialized;
		page.onCallback = onCallback;
		page.onLoadFinished = onLoadFinished;
		page.onResourceRequested = onResourceRequested;
		page.onResourceReceived = onResourceReceived;
		page.onResourceTimeout = onResourceTimeout;
		page.onError = onError;

		//모든 세팅을 마치고 페이지 오픈
		page.open(vars.url, function (status) {
			//페이지를 오픈하는데 실패한 경우,
			if (status !== 'success') {
				//페이지 닫기
				page.close();
				//오류 리포트
				reject(report.result('PHANOM01', vars.url + ' 를 여는데 실패했습니다.'));
			}
		});
	});
};

module.exports = openpage;
