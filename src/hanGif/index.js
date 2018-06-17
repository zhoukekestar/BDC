const https = require('https');
const URL = require('url');

const request = (url, headers) => (new Promise((resolve, reject) => {

  const options = URL.parse(url);
  options.headers = headers;

  const req = https.request(options, res => {
    res.setEncoding('utf8');
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      resolve(body);
    });
  })
  req.on('error', e => {
    reject(e);
  })

  req.end();
}))

module.exports.handler = function(req, resp, context) {
  request(`https://hanyu.baidu.com/zici/s?wd=${encodeURIComponent(req.queries.wd)}`, {
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36'
  }).then(body => {
    const img = body.match(/data-gif="([^"]*)"/)[1];
    // resp.setHeader('Content-Type', "application/json");
    resp.setHeader('Location', img)
    resp.setStatusCode(302);
    resp.send('');
    // resp.send(JSON.stringify({img}));
  })
}
