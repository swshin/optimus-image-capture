//초기화
var close = function (vars) {
	try {
		//페이지가 오픈되어 있으면,
		if (vars && vars.page !== undefined && vars.page.hasOwnProperty('close')) {
			//페이지를 닫아서 메모리 정리
			vars.page.close();
		}
	}
	finally {
		//PhantomJS 종료
		phantom.exit();		
	}
};

module.exports = close;
