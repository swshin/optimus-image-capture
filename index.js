var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');


var phantom = spawn('phantomjs', [path.join(__dirname, 'phantomjs-script.js')]);
var phantomStream = phantom.stdout;
var phantomResult = '';

phantomStream.on('data', function (data) {
	phantomResult += data;
});

phantomStream.on('end', function () {
	phantomResult = JSON.parse(phantomResult);
	console.log(phantomResult);
});

phantomStream.on('error', function (err) {
	console.log('something is wrong :( ');
});

//var myFile = fs.createWriteStream('myOutput.txt');

//화면으로도 뿌리고,
//phantom.stdout.pipe(process.stdout, { end: false });

//파일로도 뿌리고,
//phantom.stdout.pipe(myFile);

phantom.on('exit', function (code) {
	process.exit(code);
});
