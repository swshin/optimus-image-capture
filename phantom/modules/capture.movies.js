var Promise = require('bluebird');
var report = require('./capture.report');

//동영상 관련 처리
var movies = function (vars) {
	return new Promise(function (resolve, reject) {
		//jQuery 삽입
		if (vars.page.injectJs(vars.jQueryPath)) {

			//안과 밖의 변수명 바꾸기..
			var mediaProperties = vars.page.evaluate(function (vars) {
				var __mediaProperties = [];

				//동영상의 절대 위치 -> FIXME var 형태로 할래 ㅋ
				var absolutePostion = function (element, parentBoundingClientRectTop, parentBoundingClientRectLeft) {
					var selectedPosX = 0;
					var selectedPosY = 0;

					while (element != null) {
						selectedPosX += element.offsetLeft;
						selectedPosY += element.offsetTop;
						element = element.offsetParent;
					}

					return [parentBoundingClientRectTop + selectedPosY, parentBoundingClientRectLeft + selectedPosX];
				};

				//flash 관련 정보 추출 및 썸네일로 치환
				var removeFlash = function (currentDocument, parentBoundingClientRectWidth) {
					var params = currentDocument.querySelectorAll('param[name="movie"][value*="swf"]');

					//FIXME 라인이 너무 길다. 읽기 좋게 변경 필요..
					//FIXME jQuery 감싸기..

					[].forEach.call(params, function (item) {
						var object = item.parentNode;
						var $object = $(object);
						var width = ($(object).width() < vars.cautionImage.width) ? vars.cautionImage.width : (($(object).width() > parentBoundingClientRectWidth) ? parentBoundingClientRectWidth : $(object).width()) || parentBoundingClientRectWidth;
						var height = ($(object).height() < vars.cautionImage.height) ? vars.cautionImage.height : $(object).height() || 0 | width / 2;

						$(object).replaceWith("<div style=\"position: relative; width: " + width + "px; height: " + height + "px \"><div style=\"width: " + vars.cautionImage.width + "px;height: " + vars.cautionImage.height + "px;margin-left: -" + vars.cautionImage.halfWidth + "px;margin-top: -" + vars.cautionImage.halfHeight + "px;outline: 0;position: absolute;top: 50%;left: 50%;z-index: 840;\"><img width=" + vars.cautionImage.width + " height=" + vars.cautionImage.height + " src=\"" + vars.cautionImage.url + "\" /></div></div>");
					});
				};

				//video 태그 관련 정보 추출 및 썸네일로 치환
				var replaceVideo = function (currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft, parentBoundingClientRectWidth) {
					var sources = currentDocument.querySelectorAll('source[src][type*="video"]');

					[].forEach.call(sources, function (item) {
						var object = item.parentNode;
						var src = item.src;
						var id = Number(new Date());
						var width = ($(object).width() > parentBoundingClientRectWidth) ? parentBoundingClientRectWidth : $(object).width() || parentBoundingClientRectWidth;
						var height = ($(object).width() > parentBoundingClientRectWidth) ? 0 | parentBoundingClientRectWidth * $(object).height() / $(object).width() : $(object).height() || 0 | width / 2;
						var thumbnail = '';
						var absolutePos = absolutePostion(object, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						$(object).replaceWith("<div style=\"position: relative; background: rgb(0,0,0); width: " + width + "px; height: " + height + "px \"><div style=\"width: " + vars.playButtonImage.width + "px;height: " + vars.playButtonImage.height + "px;margin-left: -" + vars.playButtonImage.halfWidth + "px;margin-top: -" + vars.playButtonImage.halfHeight + "px;outline: 0;position: absolute;top: 50%;left: 50%;z-index: 840;\"><img width=" + vars.playButtonImage.width + " height=" + vars.playButtonImage.height + " src=\"" + vars.playButtonImage.url + "\" /></div></div>");

						__mediaProperties.push({id:id, src:src, width:Number(width), height:Number(height), thumbnail:thumbnail, top:absolutePos[0], left:absolutePos[1]});
					});
				};

				//youtube 관련 정보 추출 및 썸네일로 치환
				var replaceYoutube = function (currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft, parentBoundingClientRectWidth) {
					var iframes = currentDocument.querySelectorAll('iframe[src*="youtube.com"]');
					var embeds = currentDocument.querySelectorAll('embed[src*="youtube.com"]');

					[].forEach.call(iframes, function (item) {
						var src = item.src;
						var id = item.src.match(/.+\/([^\/\?]+)/)[1];
						var width = ($(item).width() > parentBoundingClientRectWidth) ? parentBoundingClientRectWidth : $(item).width() || parentBoundingClientRectWidth;
						var height = ($(item).width() > parentBoundingClientRectWidth) ? 0 | parentBoundingClientRectWidth * $(item).height() / $(item).width() : $(item).height() || 0 | width / 2;
						var thumbnail = "http://img.youtube.com/vi/" + id + "/0.jpg";
						var absolutePos = absolutePostion(item, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						$(item).replaceWith("<div style=\"position: relative;\"><img src='" + thumbnail + "' width=" + width + " height=" + height + "/><div style=\"width: " + vars.playButtonImage.width + "px;height: " + vars.playButtonImage.height + "px;margin-left: -" + vars.playButtonImage.halfWidth + "px;margin-top: -" + vars.playButtonImage.halfHeight + "px;outline: 0;position: absolute;top: 50%;left: 50%;z-index: 840;\"><img width=" + vars.playButtonImage.width + " height=" + vars.playButtonImage.height + " src=\"" + vars.playButtonImage.url + "\" /></div></div>");

						__mediaProperties.push({id:id, src:src, width:Number(width), height:Number(height), thumbnail:thumbnail, top:absolutePos[0], left:absolutePos[1]});
					});

					[].forEach.call(embeds, function (item) {
						var src = item.src;
						var id = item.src.match(/.+\/([^\/\?]+)/)[1];
						var width = ($(item).width() > parentBoundingClientRectWidth) ? parentBoundingClientRectWidth : $(item).width() || parentBoundingClientRectWidth;
						var height = ($(item).width() > parentBoundingClientRectWidth) ? 0 | parentBoundingClientRectWidth * $(item).height() / $(item).width() : $(item).height() || 0 | width / 2;
						var thumbnail = "http://img.youtube.com/vi/" + id + "/0.jpg";
						var absolutePos = absolutePostion(item, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						$(item).replaceWith("<div style=\"position: relative;\"><img src='" + thumbnail + "' width=" + width + " height=" + height + "/><div style=\"width: " + vars.playButtonImage.width + "px;height: " + vars.playButtonImage.height + "px;margin-left: -" + vars.playButtonImage.halfWidth + "px;margin-top: -" + vars.playButtonImage.halfHeight + "px;outline: 0;position: absolute;top: 50%;left: 50%;z-index: 840;\"><img width=" + vars.playButtonImage.width + " height=" + vars.playButtonImage.height + " src=\"" + vars.playButtonImage.url + "\" /></div></div>");

						__mediaProperties.push({id:id, src:src, width:Number(width), height:Number(height), thumbnail:thumbnail, top:absolutePos[0], left:absolutePos[1]});
					});
				};

				//vimeo 관련 정보 추출 및 썸네일로 치환
				var replaceVimeo = function (currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft, parentBoundingClientRectWidth) {
					var iframes = currentDocument.querySelectorAll('iframe[src*="player.vimeo.com"]');

					[].forEach.call(iframes, function (item) {
						var src = item.src;
						var id = item.src.match(/.+\/([^\/\?]+)/)[1];
						var width = ($(item).width() > parentBoundingClientRectWidth) ? parentBoundingClientRectWidth : $(item).width() || parentBoundingClientRectWidth;
						var height = ($(item).width() > parentBoundingClientRectWidth) ? 0 | parentBoundingClientRectWidth * $(item).height() / $(item).width() : $(item).height() || 0 | width / 2;
						var thumbnail = "https://i.vimeocdn.com/video/" + id;
						var absolutePos = absolutePostion(item, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						$(item).replaceWith("<div style=\"position: relative;\"><img src='" + thumbnail + "' width=" + width + " height=" + height + "/><div style=\"width: " + vars.playButtonImage.width + "px;height: " + vars.playButtonImage.height + "px;margin-left: -" + vars.playButtonImage.halfWidth + "px;margin-top: -" + vars.playButtonImage.halfHeight + "px;outline: 0;position: absolute;top: 50%;left: 50%;z-index: 840;\"><img width=" + vars.playButtonImage.width + " height=" + vars.playButtonImage.height + " src=\"" + vars.playButtonImage.url + "\" /></div></div>");

						__mediaProperties.push({id:id, src:src, width:Number(width), height:Number(height), thumbnail:thumbnail, top:absolutePos[0], left:absolutePos[1]});
					});
				};

				//tvpot 관련 정보 추출 및 썸네일로 치환
				var replaceTvpot = function (currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft, parentBoundingClientRectWidth) {
					var iframes = currentDocument.querySelectorAll('iframe[src*="videofarm.daum.net"]');
					var embeds = currentDocument.querySelectorAll('embed[src*="videofarm.daum.net"]');

					[].forEach.call(iframes, function (item) {
						var src = item.src;
						var id = item.src.match(/vid=([^&]+)/)[1];
						var width = ($(item).width() > parentBoundingClientRectWidth) ? parentBoundingClientRectWidth : $(item).width() || parentBoundingClientRectWidth;
						var height = ($(item).width() > parentBoundingClientRectWidth) ? 0 | parentBoundingClientRectWidth * $(item).height() / $(item).width() : $(item).height() || 0 | width / 2;
						var thumbnail = "http://i1.daumcdn.net/svc/image/U03/tvpot_thumb/" + id + "/thumb.png";
						var absolutePos = absolutePostion(item, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						$(item).replaceWith("<div style=\"position: relative;\"><img src='" + thumbnail + "' width=" + width + " height=" + height + "/><div style=\"width: " + vars.playButtonImage.width + "px;height: " + vars.playButtonImage.height + "px;margin-left: -" + vars.playButtonImage.halfWidth + "px;margin-top: -" + vars.playButtonImage.halfHeight + "px;outline: 0;position: absolute;top: 50%;left: 50%;z-index: 840;\"><img width=" + vars.playButtonImage.width + " height=" + vars.playButtonImage.height + " src=\"" + vars.playButtonImage.url + "\" /></div></div>");

						__mediaProperties.push({id:id, src:src, width:Number(width), height:Number(height), thumbnail:thumbnail, top:absolutePos[0], left:absolutePos[1]});
					});

					[].forEach.call(embeds, function (item) {
						var src = item.src;
						var id = item.flashvars.match(/vid=([^&]+)/)[1];
						var width = ($(item).width() > parentBoundingClientRectWidth) ? parentBoundingClientRectWidth : $(item).width() || parentBoundingClientRectWidth;
						var height = ($(item).width() > parentBoundingClientRectWidth) ? 0 | parentBoundingClientRectWidth * $(item).height() / $(item).width() : $(item).height() || 0 | width / 2;
						var thumbnail = "http://i1.daumcdn.net/svc/image/U03/tvpot_thumb/" + id + "/thumb.png";
						var absolutePos = absolutePostion(item, parentBoundingClientRectTop, parentBoundingClientRectLeft);
						$(item).replaceWith("<div style=\"position: relative;\"><img src='" + thumbnail + "' width=" + width + " height=" + height + "/><div style=\"width: " + vars.playButtonImage.width + "px;height: " + vars.playButtonImage.height + "px;margin-left: -" + vars.playButtonImage.halfWidth + "px;margin-top: -" + vars.playButtonImage.halfHeight + "px;outline: 0;position: absolute;top: 50%;left: 50%;z-index: 840;\"><img width=" + vars.playButtonImage.width + " height=" + vars.playButtonImage.height + " src=\"" + vars.playButtonImage.url + "\" /></div></div>");

						__mediaProperties.push({id:id, src:src, width:Number(width), height:Number(height), thumbnail:thumbnail, top:absolutePos[0], left:absolutePos[1]});
					});
				};

				//동영상을 모두 썸네일로 치환하고 iframe을 찾아서 다시 반복 수행
				var iframeFinder = function (currentDocument, parentBoundingClientRectTop, parentBoundingClientRectLeft, parentBoundingClientRectWidth) {
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
				};

				//최상위 window의 body 위치값 추출
				var topBoundingClientRect = document.body.getBoundingClientRect();
				//현재 document부터 썸네일화 시작
				iframeFinder(document, topBoundingClientRect.top, topBoundingClientRect.left, topBoundingClientRect.width);

				//변환된 결과들 리턴
				return __mediaProperties;
			}, vars);

			//썸네일 로딩이 완료되는 타이밍을 고려해서 동영상 처리 완료
			window.setTimeout(function () {
				//동영상의 위치로 정렬하는 함수
				var comparePosition = function (a, b) {
					if (a.top < b.top) {
						return -1;
					}
					else if (a.top > b.top) {
						return 1;
					}
					else {
						if (a.left < b.left) {
							return -1;
						}
						else if (a.left > b.left) {
							return 1;
						}
						else {
							return 0;
						}
					}
				}

				//동영상의 절대 높이에 따라 정렬
				mediaProperties.sort(comparePosition);
				//동영상 관련 정보 저장
				vars.mediaProperties = mediaProperties;
				//Promise 성공
				resolve(vars);

			}, vars.thumbnailDownloadDuration);
		}
		else {
			//오류 리포트 생성
			vars.result = report.result("MOVI00", "페이지에 JQuery를 인젝션하는데 실패했습니다.");
			//실패 처리
			reject(vars);
		}
	});
};

module.exports = movies;
