const axios = require('axios');
const {writeFileSync, existsSync, unlinkSync} = require("fs");
const path = require("path");
const client = axios.create({});
const AK = process.env.AK;
const SK = process.env.SK;

async function main(msg) {
  const res = await client.post('https://tsn.baidu.com/text2audio', {
    'tex': msg,
    'tok': await getAccessToken(),
    'cuid': 'UTxKP6ixdR1jlGFw5ZGgFmYSFSFUKu0h',
    'ctp': '1',
    'lan': 'zh',
    'spd': '5',
    'pit': '5',
    'vol': '5',
    'per': '1',
    'aue': '3'
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    responseType: 'arraybuffer'
  });
  const filename = path.join(__dirname, '_temp', 'audio.mp3');
  if (existsSync(filename)) {
    unlinkSync(filename);
  }
  writeFileSync(filename, new Buffer.from(res.data));
  return filename;
}

/**
 * 使用 AK，SK 生成鉴权签名（Access Token）
 * @return string 鉴权签名信息（Access Token）
 */
function getAccessToken() {
  return new Promise((resolve, reject) => {
    client.post(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${AK}&client_secret=${SK}`).then(res => {
      resolve(res.data.access_token)
    }).then(err => {
      reject(err);
    })
  })
}

module.exports = main;
