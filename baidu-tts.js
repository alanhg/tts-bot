const axios = require('axios');
const {writeFileSync, existsSync, unlinkSync} = require("fs");
const path = require("path");
const client = axios.create({});
const AK = process.env.AK;
const SK = process.env.SK;


/**
 * 短文本语音合成
 */
async function createShortMsgAudio(msg) {
  const res = await client.post('https://tsn.baidu.com/text2audio', {
    'tex': msg,
    'tok': await getAccessToken(),
    'cuid': 'UTxKP6ixdR1jlGFw5ZGgFmYSFSFUKu0h',
    'ctp': '1', // 客户端类型选择，web端填写固定值1
    'lan': 'zh', // 固定值zh。语言选择,目前只有中英文混合模式，填写固定值zh
    'spd': '5', // 语速，取值0-15，默认为5中语速
    'pit': '5', // 音调，取值0-15，默认为5中语调
    'vol': '5', // 音量，取值0-15，默认为5中音量（取值为0时为音量最小值，并非为无声）
    'per': 5003, // 度小宇=1，度小美=0，度逍遥（基础）=3，度丫丫=4 度逍遥（精品）=5003，度小鹿=5118，度博文=106，度小童=110，度小萌=111，度米朵=103，度小娇=5
    'aue': '3' // 3为mp3格式(默认)； 4为pcm-16k；5为pcm-8k；6为wav（内容同pcm-16k）; 注意aue=4或者6是语音识别要求的格式，但是音频内容不是语音识别要求的自然人发音，所以识别效果会受影响。
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }, responseType: 'arraybuffer'
  });
  if (res.headers['content-type'] !== 'audio/mp3') {
    throw new Error('baidu tts error');
  }
  const filename = path.join(__dirname, '_temp', 'audio.mp3');
  if (existsSync(filename)) {
    unlinkSync(filename);
  }
  writeFileSync(filename, new Buffer.from(res.data));
  return filename;
}


/**
 * 长文本语音合成
 */
async function createLongMsgAudio(msg) {
  const res = await client.post('https://aip.baidubce.com/rpc/2.0/tts/v1/create', {
    'text': msg,
    'lang': 'zh',
    "format": "mp3-16k",
    /**
     * 基础音库：度小宇=1，度小美=0，度逍遥（基础）=3，度丫丫=4；
     * 精品音库：度逍遥（精品）=5003，度小鹿=5118，度博文=106，度小童=110，度小萌=111，度米朵=103，度小娇=5。默认为度小美
     */
    "voice": 5003,
    speed: 5,
  }, {
    headers: {
      'Content-Type': 'application/json', 'Accept': 'application/json',
    }, params: {
      access_token: await getAccessToken()
    },
  });
  const {log_id, task_id, task_status, error_code, error_msg} = res.data;
  if (error_code || task_status === 'Failure') {
    throw new Error(error_msg);
  }
  return findLongMsgAudioTaskStatus(task_id);
}


async function findLongMsgAudioTaskStatus(taskId) {
  const {data: {tasks_info}} = await client.post('https://aip.baidubce.com/rpc/2.0/tts/v1/query', {
    "task_ids": [
      taskId
    ]
  }, {
    headers: {
      'Content-Type': 'application/json', 'Accept': 'application/json',
    }, params: {
      access_token: await getAccessToken()
    },
  });

  if (tasks_info.length === 0) {
    throw new Error('task not found');
  }
  const task = tasks_info[0];
  if (task.task_status === 'Success') {
    return axios.get(task.task_result.speech_url, {
      responseType: 'arraybuffer'
    }).then(
      res => {
        const filename = path.join(__dirname, '_temp', 'audio.mp3');
        if (existsSync(filename)) {
          unlinkSync(filename);
        }
        writeFileSync(filename, new Buffer.from(res.data));
        return filename;
      });
  }

  if (task.task_status === 'Running') {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(findLongMsgAudioTaskStatus(taskId));
      }, 1000);
    });
  }
  throw new Error('task error');
}

async function main(msg) {
  if (msg.length < 120) {
    return await createShortMsgAudio(msg);
  } else {
    return await createLongMsgAudio(msg);
  }
}

/**
 * 使用 AK，SK 生成鉴权签名（Access Token）
 * @return string 鉴权签名信息（Access Token）
 */
function getAccessToken() {
  return new Promise((resolve, reject) => {
    client.post('https://aip.baidubce.com/oauth/2.0/token', {}, {
      params: {
        grant_type: 'client_credentials',
        client_id: AK,
        client_secret: SK
      }
    }).then(res => {
      resolve(res.data.access_token);
    }).catch(err => {
      reject(err);
    })
  })
}

module.exports = main;
