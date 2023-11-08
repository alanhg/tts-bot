const {existsSync, unlinkSync, promises} = require("fs");
const path = require("path");
/**
 *
 * @type {OpenAI | {AuthenticationError: AuthenticationError, ClientOptions: ClientOptions, PermissionDeniedError: PermissionDeniedError, RateLimitError: RateLimitError, ConflictError: ConflictError, OpenAIError: OpenAIError, APIConnectionError: APIConnectionError, NotFoundError: NotFoundError, BadRequestError: BadRequestError, InternalServerError: InternalServerError, APIConnectionTimeoutError: APIConnectionTimeoutError, fileFromPath: any, APIUserAbortError: APIUserAbortError, toFile: (value: (ToFileInput | PromiseLike<ToFileInput>), name?: (string | null | undefined), options?: (FilePropertyBag | undefined)) => Promise<FileLike>, UnprocessableEntityError: UnprocessableEntityError, OpenAI: OpenAI, APIError: APIError, readonly default: OpenAI} | {AuthenticationError: AuthenticationError, ClientOptions: ClientOptions, PermissionDeniedError: PermissionDeniedError, RateLimitError: RateLimitError, ConflictError: ConflictError, OpenAIError: OpenAIError, APIConnectionError: APIConnectionError, NotFoundError: NotFoundError, BadRequestError: BadRequestError, InternalServerError: InternalServerError, APIConnectionTimeoutError: APIConnectionTimeoutError, fileFromPath: any, APIUserAbortError: APIUserAbortError, toFile: (value: (ToFileInput | PromiseLike<ToFileInput>), name?: (string | null | undefined), options?: (FilePropertyBag | undefined)) => Promise<FileLike>, UnprocessableEntityError: UnprocessableEntityError, OpenAI: OpenAI, APIError: APIError, readonly default: OpenAI}}
 */
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey:process.env.OPENAI_API_KEY,
});

/**
 * 短文本语音合成
 * @param msg
 * @return {Promise<string>}
 */
async function createShortMsgAudio(msg) {
  const filename = path.join(__dirname, '_temp', 'audio.mp3');
  if (existsSync(filename)) {
    unlinkSync(filename);
  }
  try{
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: msg,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await promises.writeFile(filename, buffer);
    return filename;
  }
  catch (e){
    throw new Error(e);
  }
}

async function main(msg) {
    return await createShortMsgAudio(msg);
}

module.exports = main;
