const convert = require('pinyin-convert');
const split = require('pinyin-split')
const utils = require('pinyin-utils')


var proxy = localStorage.getItem('pinyinProxy') || 'https://common.toomao.com/proxy';

var htmlIt = function(han, pinyin) {
  var html = '<p class="pinyin"><u><b></b><i></i></u>';
  for (var i = 0, len = han.length; i < len; i++) {

    if (han[i] === '@') {
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
    showDialog(cacheData, 'https://appcdn.fanyi.baidu.com/zhdict/mp3/' + tone + '.mp3', word);
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

      showDialog(cacheData, 'https://appcdn.fanyi.baidu.com/zhdict/mp3/' + tone + '.mp3', word);
    }).catch(e => {
      showDialog('', 'https://appcdn.fanyi.baidu.com/zhdict/mp3/' + tone + '.mp3', word);
    })

  }).catch(e => {
    showDialog('', 'https://appcdn.fanyi.baidu.com/zhdict/mp3/' + tone + '.mp3', word);
  })

}

/* 显示读音弹框 */
var sDialog = null;
window.showDialog = function(img, audiosrc, text) {
  // alert(`${img}#${audiosrc}#${text}`);
  var audio = new Audio(audiosrc);
  audio.autoplay = true;
  audio.play();
  var interval = setInterval(() => {
    audio.play();
  }, 3000);

  if (!sDialog) {
    sDialog = document.createElement('div');
    sDialog.classList.add('dialog');
    document.body.appendChild(sDialog);

    sDialog.onclick = function() {
      sDialog.classList.remove('show');
      setTimeout(function(){
        sDialog.style.display = 'none';
        clearInterval(sDialog.interval);
        // sDialog.audio.remove();
      }, 500)
    }
  }

  sDialog.audio = audio;
  sDialog.interval = interval;

  if (img) {
    sDialog.innerHTML = `
      <div class='content'>
        <img src='${img}' />
      </div>
    `;
  } else {
    sDialog.innerHTML = `
      <div class='content'>
        <h1>${text}</h1>
      </div>
    `;
  }

  sDialog.style.display = 'block';
  setTimeout(function(){
    sDialog.classList.add('show');
  });
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

    convert(text.replace(/，/g, ' ， ').replace(/。/g, ' 。 ').replace(/@/g, ' @ '), {
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
        console.log(han, pinyin)
        alert('汉字和拼音对接错误');
        return;
      }

      // console.log(han, pinyin);
      // console.log(htmlIt(han, pinyin));

      // console.log(JSON.stringify(pinyin));
      document.querySelector('#res').innerHTML = htmlIt(han, pinyin);
    });
  }
})();

