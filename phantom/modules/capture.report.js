//결과값 리턴
var result = function (errorCode, errorMessage, files, template) {
    //리턴값
    return {
        "errorCode": errorCode,
        "errorMessage": errorMessage,
        "files": files,
        "template": template
    };
};

var complete = function (arg) {
    //리턴값 전달 후 PhantomJS 종료
    console.log(JSON.stringify(arg));
    phantom.exit();
}

exports.result = result;
exports.complete = complete;
