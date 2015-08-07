var should  = require('should');
var capture = require('../');

// Definition
capture.start.should.be.function;

// Execution
capture.start(16678490, 70, 1000)
.then(function (result) {
    should.exist(result);
    result.should.have.property('files');
    result.should.have.property('template');
})
.catch(function (error) {
    should.exist(error);
    error.should.have.property('errorCode');
    error.should.have.property('errorMessage');
})
.finally(function () {
    // Done
    console.log( '> optimus-image-capture tests complete.');
});
