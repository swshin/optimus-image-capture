var Promise = require('bluebird');
var vars = require('./capture.vars');
var report = require('./capture.report');

//동영상 관련 처리
var movies = function (page) {

	return new Promise(function (resolve, reject) {

		//jQuery 삽입
		if (page.injectJs(vars.jQueryPath)) {

			var media = page.evaluate(function (vars) {
				var mediaProperties = [];

				//동영상의 절대 위치
				function absolutePostion (element, parentBoundingClientRectTop, parentBoundingClientRectLeft) {
					var selectedPosX = 0;
					var selectedPosY = 0;

					while (element != null) {
						selectedPosX += element.offsetLeft;
						selectedPosY += element.offsetTop;
						element = element.offsetParent;
					}

					return [parentBoundingClientRectTop + selectedPosY, parentBoundingClientRectLeft + selectedPosX];
				}

				//flash 관련 정보 추출 및 썸네일로 치환
				function removeFlash (currentDocument, parentBoundingClientRectWidth) {
					var params = currentDocument.querySelectorAll('param[name="movie"][value*="swf"]');

					[].forEach.call(params, function (item) {
						var object = item.parentNode;
						var width = (object.width < vars.cautionImage.width) ? vars.cautionImage.width : ((object.width > parentBoundingClientRectWidth) ? parentBoundingClientRectWidth : object.width);
						var height = (object.height < vars.cautionImage.height) ? vars.cautionImage.height : object.height;

						$(object).replaceWith("<div style=\"position: relative; width: " + width + "px; height: " + height + "px \"><div style=\"width: " + vars.cautionImage.width + "px;height: " + vars.cautionImage.height + "px;margin-left: -" + vars.cautionImage.halfWidth + "px;margin-top: -" + vars.cautionImage.halfHeight + "px;outline: 0;position: absolute;top: 50%;left: 50%;z-index: 840;\"><img width=" + vars.cautionImage.width + " height=" + vars.cautionImage.height + " src=\"" + vars.cautionImage.data + "\" /></div></div>");
					});
				}


				//video 태그 관련 정보 추출 및 썸네일로 치환
				function replaceVideo (currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft, parentBoundingClientRectWidth) {
					var sources = currentDocument.querySelectorAll('source[src][type*="video"]');

					[].forEach.call(sources, function (item) {
						var object = item.parentNode;
						var src = item.src;
						var id = Number(new Date());
						var width = (object.width > parentBoundingClientRectWidth) ? parentBoundingClientRectWidth : object.width || parentBoundingClientRectWidth;
						var height = (object.width > parentBoundingClientRectWidth) ? 0 | parentBoundingClientRectWidth * object.height / object.width : object.height || 0 | parentBoundingClientRectWidth / 2;
						var thumbnail = "";
						var absolutePos = absolutePostion(object, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						$(object).replaceWith("<div style=\"position: relative; background: rgb(0,0,0); width: " + width + "px; height: " + height + "px \"><div style=\"width: " + vars.playButtonImage.width + "px;height: " + vars.playButtonImage.height + "px;margin-left: -" + vars.playButtonImage.halfWidth + "px;margin-top: -" + vars.playButtonImage.halfHeight + "px;outline: 0;position: absolute;top: 50%;left: 50%;z-index: 840;\"><img width=" + vars.playButtonImage.width + " height=" + vars.playButtonImage.height + " src=\"" + vars.playButtonImage.data + "\" /></div></div>");

						mediaProperties.push({id:id, src:src, width:width, height:height, thumbnail:thumbnail, absolutePos:absolutePos});
					});
				}


				//youtube 관련 정보 추출 및 썸네일로 치환
				function replaceYoutube (currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft, parentBoundingClientRectWidth) {
					var iframes = currentDocument.querySelectorAll('iframe[src*="youtube.com"]');
					var embeds = currentDocument.querySelectorAll('embed[src*="youtube.com"]');

					[].forEach.call(iframes, function (item) {
						var src = item.src;
						var id = item.src.match(/.+\/([^\/\?]+)/)[1];
						var width = (item.width > parentBoundingClientRectWidth) ? parentBoundingClientRectWidth : item.width || parentBoundingClientRectWidth;
						var height = (item.width > parentBoundingClientRectWidth) ? 0 | parentBoundingClientRectWidth * item.height / item.width : item.height || 0 | parentBoundingClientRectWidth / 2;
						var thumbnail = "http://img.youtube.com/vi/" + id + "/0.jpg";
						var absolutePos = absolutePostion(item, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						$(item).replaceWith("<div style=\"position: relative;\"><img src='" + thumbnail + "' width=" + width + " height=" + height + "/><div style=\"width: " + vars.playButtonImage.width + "px;height: " + vars.playButtonImage.height + "px;margin-left: -" + vars.playButtonImage.halfWidth + "px;margin-top: -" + vars.playButtonImage.halfHeight + "px;outline: 0;position: absolute;top: 50%;left: 50%;z-index: 840;\"><img width=" + vars.playButtonImage.width + " height=" + vars.playButtonImage.height + " src=\"" + vars.playButtonImage.data + "\" /></div></div>");

						mediaProperties.push({id:id, src:src, width:width, height:height, thumbnail:thumbnail, absolutePos:absolutePos});
					});

					[].forEach.call(embeds, function (item) {
						var src = item.src;
						var id = item.src.match(/.+\/([^\/\?]+)/)[1];
						var width = (item.width > parentBoundingClientRectWidth) ? parentBoundingClientRectWidth : item.width || parentBoundingClientRectWidth;
						var height = (item.width > parentBoundingClientRectWidth) ? 0 | parentBoundingClientRectWidth * item.height / item.width : item.height || 0 | parentBoundingClientRectWidth / 2;
						var thumbnail = "http://img.youtube.com/vi/" + id + "/0.jpg";
						var absolutePos = absolutePostion(item, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						$(item).replaceWith("<div style=\"position: relative;\"><img src='" + thumbnail + "' width=" + width + " height=" + height + "/><div style=\"width: " + vars.playButtonImage.width + "px;height: " + vars.playButtonImage.height + "px;margin-left: -" + vars.playButtonImage.halfWidth + "px;margin-top: -" + vars.playButtonImage.halfHeight + "px;outline: 0;position: absolute;top: 50%;left: 50%;z-index: 840;\"><img width=" + vars.playButtonImage.width + " height=" + vars.playButtonImage.height + " src=\"" + vars.playButtonImage.data + "\" /></div></div>");

						mediaProperties.push({id:id, src:src, width:width, height:height, thumbnail:thumbnail, absolutePos:absolutePos});
					});
				}

				//vimeo 관련 정보 추출 및 썸네일로 치환
				function replaceVimeo (currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft, parentBoundingClientRectWidth) {
					var iframes = currentDocument.querySelectorAll('iframe[src*="player.vimeo.com"]');

					[].forEach.call(iframes, function (item) {
						var src = item.src;
						var id = item.src.match(/.+\/([^\/\?]+)/)[1];
						var width = (item.width > parentBoundingClientRectWidth) ? parentBoundingClientRectWidth : item.width || parentBoundingClientRectWidth;
						var height = (item.width > parentBoundingClientRectWidth) ? 0 | parentBoundingClientRectWidth * item.height / item.width : item.height || 0 | parentBoundingClientRectWidth / 2;
						var thumbnail = "https://i.vimeocdn.com/video/" + id;
						var absolutePos = absolutePostion(item, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						$(item).replaceWith("<div style=\"position: relative;\"><img src='" + thumbnail + "' width=" + width + " height=" + height + "/><div style=\"width: " + vars.playButtonImage.width + "px;height: " + vars.playButtonImage.height + "px;margin-left: -" + vars.playButtonImage.halfWidth + "px;margin-top: -" + vars.playButtonImage.halfHeight + "px;outline: 0;position: absolute;top: 50%;left: 50%;z-index: 840;\"><img width=" + vars.playButtonImage.width + " height=" + vars.playButtonImage.height + " src=\"" + vars.playButtonImage.data + "\" /></div></div>");

						mediaProperties.push({id:id, src:src, width:width, height:height, thumbnail:thumbnail, absolutePos:absolutePos});
					});
				}

				//tvpot 관련 정보 추출 및 썸네일로 치환
				function replaceTvpot (currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft, parentBoundingClientRectWidth) {
					var iframes = currentDocument.querySelectorAll('iframe[src*="videofarm.daum.net"]');
					var embeds = currentDocument.querySelectorAll('embed[src*="videofarm.daum.net"]');

					[].forEach.call(iframes, function (item) {
						var src = item.src;
						var id = item.src.match(/vid=([^&]+)/)[1];
						var width = (item.width > parentBoundingClientRectWidth) ? parentBoundingClientRectWidth : item.width || parentBoundingClientRectWidth;
						var height = (item.width > parentBoundingClientRectWidth) ? 0 | parentBoundingClientRectWidth * item.height / item.width : item.height || 0 | parentBoundingClientRectWidth / 2;
						var thumbnail = "http://i1.daumcdn.net/svc/image/U03/tvpot_thumb/" + id + "/thumb.png";
						var absolutePos = absolutePostion(item, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						$(item).replaceWith("<div style=\"position: relative;\"><img src='" + thumbnail + "' width=" + width + " height=" + height + "/><div style=\"width: " + vars.playButtonImage.width + "px;height: " + vars.playButtonImage.height + "px;margin-left: -" + vars.playButtonImage.halfWidth + "px;margin-top: -" + vars.playButtonImage.halfHeight + "px;outline: 0;position: absolute;top: 50%;left: 50%;z-index: 840;\"><img width=" + vars.playButtonImage.width + " height=" + vars.playButtonImage.height + " src=\"" + vars.playButtonImage.data + "\" /></div></div>");

						mediaProperties.push({id:id, src:src, width:width, height:height, thumbnail:thumbnail, absolutePos:absolutePos});
					});

					[].forEach.call(embeds, function (item) {
						var src = item.src;
						var id = item.flashvars.match(/vid=([^&]+)/)[1];
						var width = (item.width > parentBoundingClientRectWidth) ? parentBoundingClientRectWidth : item.width || parentBoundingClientRectWidth;
						var height = (item.width > parentBoundingClientRectWidth) ? 0 | parentBoundingClientRectWidth * item.height / item.width : item.height || 0 | parentBoundingClientRectWidth / 2;
						var thumbnail = "http://i1.daumcdn.net/svc/image/U03/tvpot_thumb/" + id + "/thumb.png";
						var absolutePos = absolutePostion(item, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						$(item).replaceWith("<div style=\"position: relative;\"><img src='" + thumbnail + "' width=" + width + " height=" + height + "/><div style=\"width: " + vars.playButtonImage.width + "px;height: " + vars.playButtonImage.height + "px;margin-left: -" + vars.playButtonImage.halfWidth + "px;margin-top: -" + vars.playButtonImage.halfHeight + "px;outline: 0;position: absolute;top: 50%;left: 50%;z-index: 840;\"><img width=" + vars.playButtonImage.width + " height=" + vars.playButtonImage.height + " src=\"" + vars.playButtonImage.data + "\" /></div></div>");

						mediaProperties.push({id:id, src:src, width:width, height:height, thumbnail:thumbnail, absolutePos:absolutePos});
					});
				}

				//동영상을 모두 썸네일로 치환하고 iframe을 찾아서 다시 반복 수행
				function iframeFinder (currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft, parentBoundingClientRectWidth) {
					//현재 document 에서 플래시를 모두 제거
					removeFlash(currentDocument, parentBoundingClientRectWidth);
					//현재 document 에서 동영상을 모두 썸네일로 치환
					replaceVideo(currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft, parentBoundingClientRectWidth);
					replaceYoutube(currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft, parentBoundingClientRectWidth);
					replaceVimeo(currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft, parentBoundingClientRectWidth);
					replaceTvpot(currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft, parentBoundingClientRectWidth);

					//남아있는 iframe을 검출한 뒤,
					var iframes = currentDocument.querySelectorAll('iframe');

					//각 iframe마다 iframeFinder를 수행
					[].forEach.call(iframes, function (item) {
						//탐색할 iframe의 위치값 추출
						var childBoundingClientRect = item.getBoundingClientRect();
						//iframe 탐색
						iframeFinder(item.contentWindow.document, parentBoundingClientRectTop + childBoundingClientRect.top, parentBoundingClientRectLeft + childBoundingClientRect.left, childBoundingClientRect.width);
					});
				}

				//최상위 window의 body 위치값 추출
				var topBoundingClientRect = document.body.getBoundingClientRect();
				//현재 document부터 썸네일화 시작
				iframeFinder(document, topBoundingClientRect.top, topBoundingClientRect.left, topBoundingClientRect.width);

				//변환된 결과들 리턴
				return mediaProperties;
			}, vars);

			//썸네일 로딩이 완료되는 타이밍을 고려해서 동영상 처리 완료
			window.setTimeout(function () {
				resolve(page);
			}, vars.thumbnailDownloadDuration);
		}
		else {
			reject();
		}
    });
};

module.exports = movies;
