var kanji = require('kanji.js');
var kenkou = require('kenkou.js');
var meimei = require('meimei.js');
var reii_mongon = require('reii_mongon.js');
var reii_score = require('reii_score.js');
var seikaku = require('seikaku.js');

exports.handler = function(event, context) {

  'use strict';

  var sei = decodeURIComponent(event.sei);
  var mei = decodeURIComponent(event.mei);
  var sex = decodeURIComponent(event.gendar);

  var tenkaku = 0;
  var jinkaku = 0;
  var chikaku = 0;
  var error = [];

  var sei1 = kanji(sei.substr(0, 1));
  var sei2 = kanji(sei.substr(-1, 1));

  // 々ゝ仝の処理
  sei = sei.replace(/(.)(々ゝ仝)/g, "$1$1");
  mei = mei.replace(/(.)(々ゝ仝)/g, "$1$1");

  // 天画の算出
  for (var i = 0; i < sei.length; i++) {
    var c = sei.substr(i, 1);
    var k = kanji(c);
    if (k === 0) {
      error.push(c);
    } else {
      tenkaku += k;
    }
  }

  // 一文字姓の処理
  if (sei.length == 1) {
    tenkaku++; // 一画借りる
    gaikaku++;
    soukaku--; // 一画返す
  }

  // 人画の算出
  jinkaku = kanji(sei.substr(-1, 1)) + kanji(mei.substr(0, 1));

  // 地画の算出
  for (var i = 0; i < mei.length; i++) {
    var c = mei.substr(i, 1);
    var k = kanji(c);
    if (k === 0) {
      error.push(c);
    } else {
      chikaku += k;
    }
  }

  // 一文字名の処理
  if (mei.length == 1) {
    chikaku++; // 一画借りる
    gaikaku++;
    soukaku--; // 一画返す
  }

  // 総画・外画の算出
  var soukaku = tenkaku + chikaku;
  var gaikaku = soukaku - jinkaku;

  // オーバーフロー処理 - ちなみに > 81は間違いではない。
  if (tenkaku > 81) {
    tenkaku %= 80;
  }
  if (jinkaku > 81) {
    jinkaku %= 80;
  }
  if (chikaku > 81) {
    chikaku %= 80;
  }
  if (gaikaku > 81) {
    gaikaku %= 80;
  }
  if (soukaku > 81) {
    soukaku %= 80;
  }

  var sex_as_number = (sex === 'F') ? 1 : 0;

  // 出力雛形
  var resp = {
    '天画': { '画数': tenkaku },
    '人画': { '画数': jinkaku },
    '外画': { '画数': gaikaku },
    '地画': { '画数': chikaku },
    '総画': { '画数': soukaku },
    '性格': {},
    '健康': {}
  };

  // 文言セットおよび加工処理
  for (var item in resp) {
    var obj = resp[item];
    var mongon = null;
    if (item.match(/^(天画|人画|外画|地画|総画)$/)) {
      obj['説明'] = reii_mongon[obj['画数']][0];
      mongon = reii_mongon[obj['画数']][1];
      obj['スコア'] = reii_score[obj['画数']][sex_as_number];
    } else if (item === '健康') {
      var kenkou_data = kenkou(tenkaku % 10, jinkaku % 10, chikaku % 10);
      obj['陰陽五行'] = kenkou_data[0];
      obj['スコア'] = kenkou_data[1];
      mongon = kenkou_data[2];
      if (jinkaku != 6) {
        mongon = mongon.replace(/\+6.*\-6/g, "");
      }
      if (jinkaku != 16) {
        mongon = mongon.replace(/\+16.*\-16/g, "");
      }
      if (jinkaku != 26) {
        mongon = mongon.replace(/\+26.*\-26/g, "");
      }
      if (jinkaku != 36) {
        mongon = mongon.replace(/\+36.*\-36/g, "");
      }
      if (jinkaku != 46) {
        mongon = mongon.replace(/\+46.*\-46/g, "");
      }
      if (jinkaku != 24) {
        mongon = mongon.replace(/\+24.*\-24/g, "");
      }
      if (jinkaku != 32) {
        mongon = mongon.replace(/\+32.*\-32/g, "");
      }
    } else if (item === '性格') {
      var seikaku_data = seikaku[jinkaku % 10];
      obj['説明'] = seikaku_data[0];
      mongon = seikaku_data[1];
    }
    if (mongon) {
      if (sex !== "F") {
        mongon = mongon.replace(/\+w.*\-w/g, "");
      }
      if (sex !== "M") {
        mongon = mongon.replace(/\+m.*\-m/g, "");
      }
      if (item !== "人画") {
        mongon = mongon.replace(/\+j.*\-j/g, "");
      }
      if (item !== "総画") {
        mongon = mongon.replace(/\+s.*\-s/g, "");
      }
      if (item != "外画") {
        mongon = mongon.replace(/\+o.*\-o/g, "");
      }
      if (chikaku != 11) {
        mongon = mongon.replace(/\+e.*\-e/g, "");
      }
      if (jinkaku != 26) {
        mongon = mongon.replace(/\+t.*\-t/g, "");
      }
      if (jinkaku != 10 && jinkaku != 20) {
        mongon = mongon.replace(/\+g.*\-g/g, "");
      }
      mongon = mongon.replace(/[\-\+][0-9a-z]+/g, "");
      obj['文言'] = mongon;
    }
  }

  var kenkou_score = { '◎': 1, '○': 0.9, '△': 0.7, '×': 0.5 };
  if (sex == 'F') {
    resp['総スコア'] = (resp['天画']['スコア'] + resp['人画']['スコア'] + resp['外画']['スコア']) / 3 * kenkou_score[resp['健康']['スコア']];
  } else {
    resp['総スコア'] = (resp['天画']['スコア'] + resp['人画']['スコア'] + resp['外画']['スコア'] + resp['総画']['スコア']) / 4 * kenkou_score[resp['健康']['スコア']];
  }

  resp['命名候補'] = meimei(sei, sei1, sei2);
  resp['エラー漢字'] = error;

  context.succeed(resp);
};
/*
  var c = kenkou_data[1];
  if ($param == 0) {
    return $c;
  } elseif ($param == 1) {
    $array = ["◎" => "すごく良い", "○" => "良い", "△" => "ふつう", "×" => "悪い"];
    return $array[$c];
  } else {
    $array = ['◎' => 1, '○' => 0.9, '△' => 0.7, '×' => 0.5];
    return $array[$c];
  }
}
*/