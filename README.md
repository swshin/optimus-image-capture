## optimus-image-capture

이 프로젝트는 옵티머스 이미지 중 캡쳐 엔진에 해당하는 프로젝트입니다.
optimius-image-capture 모듈은 Proimse를 리턴하는 함수입니다. 파라메터는 순서대로, 상품코드, 이미지 퀄리티, 슬라이스할 세로 높이입니다.

```javascript
var capture = require('optimus-image-capture');

capture(1603020, 70, 1000)
.then(function (result) {
  //켭쳐된 이미지파일 리스트, 템플릿
  console.log(result);
})
.catch(function (error) {
  //오류 메시지
  console.log(error);
});

```
