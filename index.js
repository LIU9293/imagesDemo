var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var request = require('request');
var EventEmitter = require('events').EventEmitter

// clear folder and make a download folder
if(fs.existsSync('./download')){
  fse.emptyDirSync('./download', function(err){
    if(err){
      console.log(err);
    } else {
      console.log('clear download folder success !');
    }
  })
} else {
  fs.mkdirSync('./download', function(err){
    if(err){
      console.log(err)
    } else {
      console.log('create download folder success !');
    }
  });
}


// read the csv data and get the images array
var data = fs.readFileSync('./images.csv', 'UTF8');
var images = data.split(',,,,,,,,,,,,,\r').filter(x => x !== '');


//loop and download the file
var nextDownload = 0;
var MyEmitter = new EventEmitter();
MyEmitter.on('downloadFinished', function(){
  if(nextDownload < data.length){
    nextDownload++;
    download(nextDownload);
  } else {
    console.log('download finished !');
  }
})

function download(i){
  var name= images[i].split(',')[0]+'.jpg';
  var url = images[i].split(',')[1];
  var file = path.join('./download', name);
  console.log(`start downloading ${name} to ${file}`);
  fse.createFile(file, function(err){
    if(err){
      console.log(err)
    } else {
      request.get(url)
        .pipe(fs.createWriteStream(file))
        .on('error', function(err) {
          console.log(err)
        })
        .on('close', () => {
          console.log('download image: ' + name + ' is success !!!');
          MyEmitter.emit('downloadFinished');
        })
    }
  });
}

download(0);
