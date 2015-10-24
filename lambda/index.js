var kanji = require('kanji.js');
//var choise = require('choise.js');
//var kenkou = require('kenkou.js');
//var meimei = require('meimei.js');
var reii_mongon = require('reii_mongon.js');
//var reii_score = require('reii_score.js');
//var seikaku = require('seikaku.js');

exports.handler = function(event, context) {
  var kakusu = null;
  var resp = {};
  var sei = event.sei;
  resp["sei"] = sei;
  var kakusu = 0;
  for (var i = 0; i < sei.length; i++) {
    var moji = sei.substr(i, 1);
    for (var kakusu in kanji) {
      if (kanji[kakusu].indexOf(moji) != -1) {
        var k = Number(kakusu);
        resp[moji] = k;
        kakusu += k;
        break;
      }
    }
  }
  resp['天画'] = kakusu;
  resp['天画による運勢'] = reii_mongon[kakusu].join("\n");
  context.succeed(resp);
};
