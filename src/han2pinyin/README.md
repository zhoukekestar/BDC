$ fcli shell
cd BDC
upf Han2Pinyin -t nodejs8 -h index.handler -d han2pinyin
sbox -d han2pinyin -t nodejs8



需要修改 node_modules/mdbg/index.js#111 为

```js
// FAAS 没有本地文件的 IO 权限
const init = async (db = '/tmp/cedict_db', url) => {
```
