const convert = require('pinyin-convert');
const split = require('pinyin-split')
const utils = require('pinyin-utils')

const han2pinyin = text => (new Promise((resolve, reject) => {

  var han = text.split('').filter(item => item.trim());

  convert(text.replace(/，/g, ' ， ').replace(/。/g, ' 。 ').replace(/@/g, ' @ '), {
    numbered: true,
    everything: true
  }).then(res => {
    var pinyin = [];
    res.map(item => {
      if (typeof item === 'string') {
        pinyin = pinyin.concat(item.split(' ').filter(item => item.trim()));
      } else if (typeof item === 'object') {
        pinyin.push(item);
      } else {
        reject({
          msg: '库解析异常'
        });
      }
    });

    pinyin.forEach((py, i) => {
      py = typeof py === 'string' ? [py] : py;
      py = py.map(item => item.toLowerCase());
      py = Array.from(new Set(py));


      pinyin[i] = {
        mark: py.map(py => utils.numberToMark(py)),
        py,
      }
    });

    if (han.length != pinyin.length) {
      // console.log(han, pinyin)
      reject({
        result: { han, pinyin },
        msg: '汉字和拼音对接错误'
      });
      return;
    }

    resolve(pinyin);
  }).catch(error => {
    reject({
      error,
      msg: '未知错误',
    });
  })

}))

convert.init('/tmp/cedict_db')
.then(() => {
  han2pinyin('你好，我的中国中奖了').then(d => {
    console.log(JSON.stringify(d, null, 2))
  }).catch(e => {
    console.log(JSON.stringify(e, null, 2));
  })
})

module.exports.handler = function(req, resp, context) {

    // resp.setHeader('Content-Type', 'application/json');
    // resp.send(`{"text": "${req.queries.text}"}`);

    han2pinyin(req.queries.text).then(result => {
      // resp.setHeader('Content-Type', 'application/json');
      // resp.send(`{"text": "${req.queries.text}"}`);
      resp.setHeader('Content-Type', "application/json");
      resp.send(JSON.stringify({ result }))
    }).catch(error => {
      // resp.setHeader('Content-Type', 'application/json');
      // resp.send(`{"texterror": "${req.queries.text}"}`);
      resp.setHeader('Content-Type', "application/json");
      resp.send(JSON.stringify(error));
    });
}
