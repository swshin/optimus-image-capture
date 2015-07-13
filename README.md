## optimus-image-capture

이 프로젝트는 옵티머스 이미지 중 캡쳐 엔진에 해당하는 프로젝트입니다.

* optimius-image-capture 모듈 사용예는 아래와 같습니다.

```javascript
var capture = require('optimus-image-capture');

//상품코드, 이미지 퀄리티, 슬라이스할 세로 높이
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



* optimus-image-capture 모듈에서 리턴하는 결과 객체는 아래와 같습니다.

```javascript
{
   "errorCode": errorCode, //정상이므로 false
   "errorMessage": errorMessage, //정상이므로 false
   "files": files, //캡쳐된 이미지 리스트의 배열 [경로/상품번호-순번.확장자, ...]
   "template": template //캡쳐된 이미지로 구성된 템플릿
}
```



* optimus-image-capture 모듈에서 리턴하는 오류 객체는 아래와 같습니다.

```javascript
{
   "errorCode": errorCode, //에러 코드
   "errorMessage": errorMessage, //에러 상세
   "files": files, //오류이므로 []
   "template": template //오류이므로 ""
}
```
