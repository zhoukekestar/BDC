!(function(){
  var PHONETIC_SYMBOL = {
    "ā": "a1",
    "á": "a2",
    "ǎ": "a3",
    "à": "a4",
    "ē": "e1",
    "é": "e2",
    "ě": "e3",
    "è": "e4",
    "ō": "o1",
    "ó": "o2",
    "ǒ": "o3",
    "ò": "o4",
    "ī": "i1",
    "í": "i2",
    "ǐ": "i3",
    "ì": "i4",
    "ū": "u1",
    "ú": "u2",
    "ǔ": "u3",
    "ù": "u4",
    "ü": "v0",
    "ǘ": "v2",
    "ǚ": "v3",
    "ǜ": "v4",
    "ń": "n2",
    "ň": "n3",
    "": "m2"
  };
  /*
   * 将标准的拼音转换成英文并在最后带上声调
  */
  var pinyinToABC = function(pinyin) {
    for (var i = 0; i < pinyin.length; i++) {
      var temp = PHONETIC_SYMBOL[pinyin[i]];
      if (temp) {
        pinyin = pinyin.replace(pinyin[i], temp[0])
        return pinyin + temp[1];
      }
    }
	return pinyin;
  }

  var proxy = localStorage.getItem('pinyinProxy') || 'https://common.toomao.com/proxy';
  var currenttext = (currenttext = location.search.match(/text=([^&=]*)/)) && currenttext[1];
  currenttext = currenttext ? decodeURIComponent(currenttext) : '';
  
  /*
   * html化又百度翻译返回的json数据
   */
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

  /*
   * 翻译一段中文字符串，通过callback返回百度翻译结果
   */
  window.pinyin = function(text, callback) {

    if (proxy === '') {
      return callback && callback('Proxy is null. Please set pinyinProxy by localStorage.getItem("pinyinProxy") at first.')
    }

    var json = currenttext && localStorage.getItem('TEXT_' + currenttext);
    if (currenttext === text && json) {
      try {

        json = JSON.parse(json);
        htmlIt(json);
        callback && callback(null, json);
        return;

      } catch (e) {
        console.log(e)
      }
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
      cache: 'force-cache',
      body: JSON.stringify(body)
    }).then(response => {

      response.json().then(json => {

        if (currenttext && currenttext === text) {
          localStorage.setItem('TEXT_' + currenttext, JSON.stringify(json));
        }

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
  window.showSingleWorld = function(word, tone) {
    word = word[0];
    if (proxy === '') {
      return callback && callback('Proxy is null. Please set pinyinProxy by localStorage.getItem("pinyinProxy") at first.')
    }

    var cacheData = localStorage.getItem('SW_' + word);
    if (cacheData) {
      showDialog(cacheData, 'http://appcdn.fanyi.baidu.com/zhdict/mp3/' + pinyinToABC(tone) + '.mp3');
      return;
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
      cache: 'force-cache',
      body: JSON.stringify(body)
    }).then(response => {

      response.text().then(function (text) {
        window.text = text;
        window.textBody = text.match(/<body class="module" id="wise-word-body" data-prop="" data-name="">([\s\S]*)<\/body>/)[1];
        window.doc = document.implementation.createHTMLDocument("doc");
        doc.body.innerHTML = textBody;

        // console.log(doc.querySelector('#word_bishun').dataset.gif);
        // console.log(doc.querySelector('#pinyin a').getAttribute('url'));

        cacheData = doc.querySelector('#word_bishun');
		cacheData = (cacheData && cacheData.dataset.gif) || (cacheData && cacheData.dataset.src) || '';
        localStorage.setItem('SW_' + word, cacheData);

        showDialog(cacheData, 'http://appcdn.fanyi.baidu.com/zhdict/mp3/' + pinyinToABC(tone) + '.mp3');
      })

    })

  }

  /* 显示读音弹框 */
  var sDialog = null;
  window.showDialog = function(img, audiosrc) {
    img = img || 'data:image/png;base64,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';
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
    showSingleWorld(u.querySelector('i').innerHTML, u.querySelector('b').innerHTML);
  }

})();
