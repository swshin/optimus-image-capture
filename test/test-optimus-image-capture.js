var colors = require('colors/safe');
var should  = require('should');
var capture = require('../');

// Definition
capture.start.should.be.function;

var captureOptions = {
	url: 'http://www.gsshop.com/mi15/prd/prdImgDesc.gs?prdid=16233854'
};

// Execution
capture.start(captureOptions)
.then(function (result) {
	should.exist(result);
	should.exist(result.code);
	should.exist(result.message);

	result.message.should.have.property('path');
	result.message.should.have.property('files');
	result.message.should.have.property('template');
	result.message.should.have.property('md5');

	console.log(colors.yellow.bold('\n> optimus-image-capture success.'));
})
.catch(function (error) {
	should.exist(error);

	error.should.have.property('code');
	error.should.have.property('message');

	console.log(colors.yellow.bold('\n> optimus-image-capture failure.'));
})
.finally(function () {
	// Done
	console.log(colors.cyan.bold('> optimus-image-capture tests complete.'));
});
