!(function(){
  var proxy = localStorage.getItem('pinyinProxy') || 'https://dev-common.toomao.com/proxy';

  var htmlIt = function(json) {
    var html = '<p class="pinyin"><u></u><u></u>';
    for (var i = 0, len = json.trans_result.phonetic.length; i < len; i++) {
      var t = json.trans_result.phonetic[i];
      if (t.src_str === '\n') {
        html += '<br><u></u><u></u>'
      } else {
        html += '<u><b>' + t.trg_str + '</b><i>' + t.src_str  + '</i></u>'
      }
    }
    html += '</p>'
    json.html = html;

  }

  window.pinyin = function(text, callback) {

    if (proxy === '') {
      return callback && callback('Proxy is null. Please set pinyinProxy by localStorage.getItem("pinyinProxy") at first.')
    }

    var body = {
      url: 'http://fanyi.baidu.com/v2transapi',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      body: 'from=cht&to=zh&query=' + encodeURIComponent(text) + '&transtype=realtime&simple_means_flag=3'
    }
    fetch(proxy, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify(body)
    }).then(response => {

      response.json().then(json => {
        htmlIt(json);
        callback && callback(null, json)
      }).catch (function(e){
        callback && callback(e)
      })

    })
  }

  var audio;
  window.playPinyinSound = function(text) {
    audio = audio || document.createElement('audio');
    audio.src = 'http://tts.baidu.com/text2audio?lan=zh&pid=101&ie=UTF-8&text=' + encodeURIComponent(text);
    audio.play();
  }

})();
