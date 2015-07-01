var Promise = require('bluebird');
var vars = require('./capture.vars');
var report = require('./capture.report');

//동영상 관련 처리
var movies = function (page) {

	return new Promise(function (resolve, reject) {

		//youtube 관련 태그 모두 selecting (iframe, embed)
		//관련 정보 추출 - 가로/세로, URL, 썸네일..

		//썸네일과 플레이 버튼 합성
		//이미지맵 영역 구하기

		console.log('여기는 오나?')
		//jQuery 삽입
		if (page.injectJs(vars.jQueryPath)) {

			var aaa = page.evaluate(function () {

				var meta = [];

				//동영상의 절대 위치
				function absolutePostion (element, parentBoundingClientRectTop, parentBoundingClientRectLeft) {
					var selectedPosX = 0;
					var selectedPosY = 0;

					while(element != null){
						selectedPosX += element.offsetLeft;
						selectedPosY += element.offsetTop;
						element = element.offsetParent;
					}

					return [parentBoundingClientRectTop + selectedPosY, parentBoundingClientRectLeft + selectedPosX];
				}

				//youtube 관련 정보 추출 및 썸네일로 치환
				function replaceYoutube (currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft) {
					var iframes = currentDocument.querySelectorAll('iframe[src*="youtube.com"]');
					var embeds = currentDocument.querySelectorAll('embed[src*="youtube.com"]');

					[].forEach.call(iframes, function (item) {
						var src = item.src;
						var id = item.src.match(/.+\/([^\/\?]+)/)[1];
						var width = item.width;
						var height = item.height;
						var thumbnail = "http://img.youtube.com/vi/" + id + "/0.jpg";
						var absolutePos = absolutePostion(item, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						var target = $(item).replaceWith("<div><img src='" + thumbnail + "' width=" + width + " height=" + height + "/></div>");

						meta.push({id:id, src:src, width:width, height:height, thumbnail:thumbnail, absolutePos:absolutePos});
					});

					[].forEach.call(embeds, function (item) {
						var src = item.src;
						var id = item.src.match(/.+\/([^\/\?]+)/)[1];
						var width = item.width;
						var height = item.height;
						var thumbnail = "http://img.youtube.com/vi/" + id + "/0.jpg";
						var absolutePos = absolutePostion(item, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						var target = $(item).replaceWith("<div><img src='" + thumbnail + "' width=" + width + " height=" + height + "/></div>");

						meta.push({id:id, src:src, width:width, height:height, thumbnail:thumbnail, absolutePos:absolutePos});
					});
				}

				//vimeo 관련 정보 추출 및 썸네일로 치환
				function replaceVimeo (currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft) {
					var iframes = currentDocument.querySelectorAll('iframe[src*="player.vimeo.com"]');

					[].forEach.call(iframes, function (item) {
						var src = item.src;
						var id = item.src.match(/.+\/([^\/\?]+)/)[1];
						var width = item.width;
						var height = item.height;
						var thumbnail = "https://i.vimeocdn.com/video/" + id;
						var absolutePos = absolutePostion(item, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						var target = $(item).replaceWith("<div><img src='" + thumbnail + "' width=" + width + " height=" + height + "/></div>");

						meta.push({id:id, src:src, width:width, height:height, thumbnail:thumbnail, absolutePos:absolutePos});
					});
				}

				//tvpot 관련 정보 추출 및 썸네일로 치환
				function replaceTvpot (currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft) {
					var iframes = currentDocument.querySelectorAll('iframe[src*="videofarm.daum.net"]');
					var embeds = currentDocument.querySelectorAll('embed[src*="videofarm.daum.net"]');

					[].forEach.call(iframes, function (item) {
						var src = item.src;
						var id = item.src.match(/vid=([^&]+)/)[1];
						var width = item.width;
						var height = item.height;
						var thumbnail = "http://i1.daumcdn.net/svc/image/U03/tvpot_thumb/" + id + "/thumb.png";
						var absolutePos = absolutePostion(item, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						var target = $(item).replaceWith("<div><img src='" + thumbnail + "' width=" + width + " height=" + height + "/></div>");

						meta.push({id:id, src:src, width:width, height:height, thumbnail:thumbnail, absolutePos:absolutePos});
					});

					[].forEach.call(embeds, function (item) {
						var src = item.src;
						var id = item.flashvars.match(/vid=([^&]+)/)[1];
						var width = item.width;
						var height = item.height;
						var thumbnail = "http://i1.daumcdn.net/svc/image/U03/tvpot_thumb/" + id + "/thumb.png";
						var absolutePos = absolutePostion(item, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						var target = $(item).replaceWith("<div><img src='" + thumbnail + "' width=" + width + " height=" + height + "/></div>");

						meta.push({id:id, src:src, width:width, height:height, thumbnail:thumbnail, absolutePos:absolutePos});
					});
				}

				//동영상을 모두 썸네일로 치환하고 iframe을 찾아서 다시 반복 수행
				function iframeFinder (currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft) {
					//현재 document 에서 동영상을 모두 썸네일로 치환
					replaceYoutube(currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft);
					replaceVimeo(currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft);
					replaceTvpot(currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft);

					//남아있는 iframe을 검출한 뒤,
					var iframes = currentDocument.querySelectorAll('iframe');

					//각 iframe마다 iframeFinder를 수행
					[].forEach.call(iframes, function (item) {
						var childBoundingClientRect = item.getBoundingClientRect();
						iframeFinder(item.contentWindow.document, parentBoundingClientRectTop + childBoundingClientRect.top, parentBoundingClientRectLeft + childBoundingClientRect.left);
					});
				}

				//현재 document부터 썸네일화 시작
				var topBoundingClientRect = document.body.getBoundingClientRect();
				iframeFinder(document, topBoundingClientRect.top, topBoundingClientRect.left);

				//변환된 결과들 리턴
				return meta;
			});

			console.log("실행이 끝난건가?")
			console.log(JSON.stringify(aaa));
		}
		else {
			console.log('jQuery 실패했네', vars.jQueryPath)
		}

		console.log("리졸브 직전")
		window.setTimeout(function () {
			resolve(page);
		}, 5000);

    });
};

module.exports = movies;
