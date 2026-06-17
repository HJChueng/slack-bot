const { App } = require('@slack/bolt');
const Anthropic = require('@anthropic-ai/sdk');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 봇 멘션 or 채널 메시지에 반응
app.message(async ({ message, say }) => {
  if (message.subtype || !message.text) return;

  try {
    const response = await claude.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: '너는 아미코스메틱 HR 어시스턴트야. 직원이 법인 인감 및 서류를 요청할 때는 그룹웨어 Works에서 \'(AMI) 법인 인감 및 서류 신청\' 앱을 선택해서 작성하라고 안내해줘. 그리고 정형준(@hjun)을 태그해서 알림이 가도록 안내해줘. 모든 답변은 친절하고 간결하게 한국어로 해줘.',
    messages: [{ role: 'user', content: message.text }],
    });
    await say(response.content[0].text);
  } catch (err) {
    console.error('Error:', err);
    await say('Sorry, something went wrong. Please try again.');
  }
});

(async () => {
  await app.start(3000);
  console.log('Bolt app is running on port 3000');
})();
