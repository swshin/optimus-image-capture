var Promise = require('bluebird');
var vars = require('./modules/capture.vars');
var report = require('./modules/capture.report');
var initialize = require('./modules/capture.initialize');
var openpage = require('./modules/capture.openpage');
var render = require('./modules/capture.render');

//output 폴더 비우기, 변수 초기화
initialize()

//옵션에 따라 page를 열어서 완전히 로드가 완료되면 page 객체 리턴
.then(openpage)

//동영상 관련 처리
//.then(movies)

//movies에서 마치면 좋겠지만, 로직이 잘 안풀리면 이미지맵 처리를 여기서 함.
//.then(imagemaps)

//치환된 동영상 이미지와 동영상 위치값 등을 바탕으로 페이지를 캡쳐하고 나누어서 템플릿을 생성해서 리턴
.then(render)

//최종 생성된 이미지 파일 리스트와 템플릿을 리턴 또는 오류를 리턴
.then(report.complete, report.complete)

.done();
