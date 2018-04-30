const convert = require('pinyin-convert');
const split = require('pinyin-split')
const utils = require('pinyin-utils')

var proxy = localStorage.getItem('pinyinProxy') || 'https://common.toomao.com/proxy';

var htmlIt = function(han, pinyin) {
  var html = '<p class="pinyin"><u><b></b><i></i></u>';
  for (var i = 0, len = han.length; i < len; i++) {

    if (han[i] === '\n') {
      html += '<br><u><b></b><i></i></u>'
    } else {
      var py = pinyin[i];
      py = py[0];
      var multiple = pinyin[i].length > 1 ? true : false;
      html += `<u data-n="${i}" data-pinyins="${pinyin[i]}" data-pinyin="${py}" class="${multiple ? "multiple-pinyin" : ""}"><b>${utils.numberToMark(py)}</b><i>${han[i]}</i></u>`;
    }
  }
  html += '</p>'
  return html;
}

 /*查询单个*/
 window.showSingleWorld = function(word, tone) {
  word = word[0];
  if (proxy === '') {
    return callback && callback('Proxy is null. Please set pinyinProxy by localStorage.getItem("pinyinProxy") at first.')
  }

  var cacheData = localStorage.getItem('SW_' + word);
  if (cacheData) {
    showDialog(cacheData, 'http://appcdn.fanyi.baidu.com/zhdict/mp3/' + tone + '.mp3');
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

      showDialog(cacheData, 'http://appcdn.fanyi.baidu.com/zhdict/mp3/' + tone + '.mp3');
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
    sDialog.innerHTML = "<span class='close'></span><div class='content'><img src=''></div><audio src=''></div>";
    document.body.appendChild(sDialog);
  }

  sDialog.querySelector('img').src = img;
  var audio = sDialog.querySelector('audio').src = audiosrc;
  sDialog.style.display = 'block';

  sDialog.onclick = function() {
    sDialog.classList.remove('show');
    setTimeout(function(){
      sDialog.style.display = 'none';
    }, 500)
  }

  setTimeout(function(){
    sDialog.classList.add('show');
    sDialog.querySelector('audio').play();
  })

  var interval = setInterval(function() {
    if (sDialog.classList.contains('show')) {
      sDialog.querySelector('audio').play();
    } else {
      clearInterval(interval);
    }
  }, 3000);

}

/*点击单个字母*/
document.querySelector('#res').onclick = function(e) {
  var u = e.target;
  while (u.nodeName !== 'U') {
    u = u.parentNode;
    if (u === document.body) return;
  }
  showSingleWorld(u.querySelector('i').innerHTML, u.dataset.pinyin);
}


// 初始化代码
!(() => {
  var text = (text = location.search.match(/text=([^&=]*)/)) && text[1];
  if (text) {
    text = decodeURIComponent(text);
    var han = text.split('').filter(item => item.trim());

    convert(text.replace(/，/g, ' ， ').replace(/。/g, ' 。 '), {
      numbered: true,
    }).then(res => {
      var pinyin = [];
      res.map(item => {
        if (typeof item === 'string') {
          pinyin = pinyin.concat(item.split(' ').filter(item => item.trim()));
        } else if (typeof item === 'object') {
          pinyin.push(item);
        } else {
          alert('库解析异常');
        }
      });

      pinyin.forEach((py, i) => {
        py = typeof py === 'string' ? [py] : py;
        py = py.map(item => item.toLowerCase());
        py = Array.from(new Set(py));
        pinyin[i] = py;
      });

      if (han.length != pinyin.length) {
        alert('汉字和拼音对接错误');
        return;
      }

      console.log(han, pinyin);
      console.log(htmlIt(han, pinyin));

      // console.log(JSON.stringify(pinyin));
      document.querySelector('#res').innerHTML = htmlIt(han, pinyin);
    });
  }
})();

