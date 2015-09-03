## optimus-image-capture

이 프로젝트는 옵티머스 이미지 중 캡쳐 엔진에 해당하는 프로젝트입니다.

### Usage

optimius-image-capture 모듈 사용예는 아래와 같습니다.

```javascript
var capture = require('optimus-image-capture');
var captureOptions = {};
//캡쳐 대상
captureOptions.url = 'http://www.google.com/';
//캡쳐 결과물 경로
captureOptions.resultPath = '/home/optimus-image-capture/';
//캡쳐 이미지 퀄리티
captureOptions.imageQuality = 70;
//기본 캡쳐 단위 높이
captureOptions.viewportHeight = 1000;
//뷰포트(캡쳐할 크기) 가로
captureOptions.viewportWidth = 700;
//이미지 포맷
captureOptions.imageFormat = 'jpeg';
//캡쳐할 전체 영역 셀렉터
captureOptions.clientRectSelector = '#html2image';
//페이지 로딩 타임아웃 (ms)
captureOptions.openpageTimeout = 600000;
//리소스 로딩 제한시간 (ms)
captureOptions.resourceTimeout = 60000;
//페이지 로드 완료 여부 체크 간격 (ms)
captureOptions.openpageCompleteCheckDuration = 2000;
//동영상 썸네일 다운로드 대기시간 (ms)
captureOptions.thumbnailDownloadDuration = 2000;

//대상 URL, 이미지 퀄리티, 슬라이스할 세로 높이, 캡쳐된 이미지가 저장될 절대 경로
capture.start(captureOptions)
.then(function (result) {
	//캡쳐된 파일 위치
	console.log('outputFilePath :' + result.message.path);
	//캡쳐 파일 리스트
	console.log('outputFiles :' + result.message.files);
	//캡쳐된 파일로 구성한 템플릿
	console.log('template :' + result.message.template);
	//캡쳐된 파일의 해시값
	console.log('hash :' + result.message.md5);
})
.catch(function (error) {
	//unhandled error
	if (error instanceof Error) {
		//에러 메시지
		console.log(error.message);
	}
	else {
		//에러 코드
		console.log(error.code);
		//에러 메시지
		console.log(error.message);
	}
});

```

### Dependency

* NodeJS 0.10.x
* PhantomJS 2.x.x
