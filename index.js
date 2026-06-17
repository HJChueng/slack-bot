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
      system: '너는 아미코스메틱 HR 담당 어시스턴트야. 직원들의 인사/노무/행정 질문에 친절하게 답변해줘. 모르는 건 모른다고 해줘.',
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
