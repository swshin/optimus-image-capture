var fs = require('fs');
var system = require('system');

module.exports = {
    //현재 디렉토리
    workingDirectory : fs.workingDirectory;
    //userAgent 설정
    userAgent : 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.7 (KHTML, like Gecko) Chrome/7.0.517.44 Safari/534.7',
    //리소스 제한시간 (ms)
    resourceTimeout : 10000,
    //리소스 다운로드 시도 횟수
    resourceRequestAttempts : 5,
    //리로스 다운로드 여부 체크 간격 (ms)
    resourceCheckDuration : 3000,
    //컨텐츠 길이
    contentLength : 0,
    //iframe 로드 체크
    iframeLoadFinished : false,
    //컨텐츠 리소스
    resources : {},
    //jQuery path
    jQueryPath : this.workingDirectory + "/node_modules/jquery/dist/jquery.min.js",
    //이미지 퀄리티
    imageQuality : system.args[2] || 70,
    //캡쳐 결과물 파일명들
    outputFiles : [],
    //캡쳐 결과물 파일 경로
    outputFilePath : this.workingDirectory + "/phantom/output/",
    //캡쳐 결과물 파일
    outputFileName : "",
    //캡쳐 결과물 템플릿
    outputTemplate : "",
    //상품 번호
    prdid : system.args[1],
    //캡쳐할 전체 영역
    clientRect : {},
    //캡쳐할 부분 영역
    clipRect : {},
    //뷰포트(캡쳐할 크기) 가로
    viewportWidth : 700,
    //뷰포트(캡쳐할 크기) 세로
    viewportHeight : system.args[3] || 1000,
    //템플릿에 포함할 인라인 CSS -> 9999로 되어 있는 상품기술서 이미지의 높이를 뷰포트 높이로 치환
    inlineCSS : fs.read(this.workingDirectory + '/phantom/inlines/inline.min.css').replace(/9999/, this.viewportHeight),
    //템플릿에 포함할 인라인 자바스크립트
    inlineJS : fs.read(this.workingDirectory + '/phantom/inlines/inline.min.js'),
    //대상 페이지
    page: null
};
