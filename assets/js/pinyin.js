!(function(){
  var proxy = localStorage.getItem('pinyinProxy') || 'https://dev-common.toomao.com/proxy';

  var htmlIt = function(json) {
    var html = '<p class="pinyin"><u><b></b><i></i></u>';
    for (var i = 0, len = json.trans_result.phonetic.length; i < len; i++) {
      var t = json.trans_result.phonetic[i];
      if (t.src_str === '\n') {
        html += '<br><u><b></b><i></i></u>'
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

  /*查询单个*/
  window.showSingleWorld = function(word) {
    word = word[0];
    if (proxy === '') {
      return callback && callback('Proxy is null. Please set pinyinProxy by localStorage.getItem("pinyinProxy") at first.')
    }

    var body = {
      url: 'http://hanyu.baidu.com/s?wd=' + encodeURIComponent(word),
      method: 'GET',
      headers: {
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
      }
    }
    fetch(proxy, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify(body)
    }).then(response => {

      response.text().then(function (text) {
        window.text = text;
        window.textBody = text.match(/<body class="module" id="wise-word-body" data-prop="" data-name="">([\s\S]*)<\/body>/)[1];
        window.doc = document.implementation.createHTMLDocument("doc");
        doc.body.innerHTML = textBody;

        // console.log(doc.querySelector('#word_bishun').dataset.gif);
        // console.log(doc.querySelector('#pinyin a').getAttribute('url'));

        showDialog(doc.querySelector('#word_bishun').dataset.gif, doc.querySelector('#pinyin a').getAttribute('url'))
      })

    })

  }

  /* 显示读音弹框 */
  var sDialog = null;
  window.showDialog = function(img, audiosrc) {
    img = img || 'http://app.dict.baidu.com/static/gif/34dd6ef867974b4385894bb0aaeb1c2b.gif';
    audiosrc = audiosrc || 'http://appcdn.fanyi.baidu.com/zhdict/mp3/ni3.mp3';

    if (!sDialog) {
      sDialog = document.createElement('div');
      sDialog.classList.add('dialog');
      sDialog.innerHTML = "<span class='close'></span><div class='content'><img src=''><div class='sound'></div><audio src=''></div>";
      document.body.appendChild(sDialog);

      sDialog.querySelector('.sound').onclick = function(e) {
        e.stopPropagation();
        e.preventDefault();

        sDialog.querySelector('audio').play();
      }
    }

    sDialog.querySelector('img').src = img;
    var audio = sDialog.querySelector('audio').src = audiosrc;
    sDialog.style.display = 'block';
    setTimeout(function(){
      sDialog.classList.add('show');
      sDialog.querySelector('audio').play();
    })

    sDialog.onclick = function() {
      sDialog.classList.remove('show');
      setTimeout(function(){
        sDialog.style.display = 'none';
      }, 500)
    }

  }

  /*点击单个字母*/
  document.querySelector('#res').onclick = function(e) {
    var u = e.target;
    while (u.nodeName !== 'U') {
      u = u.parentNode;
      if (u === document.body) return;
    }
    showSingleWorld(u.querySelector('i').innerHTML);
  }

})();
