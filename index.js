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
      system: `너는 아미코스메틱 HR 어시스턴트야. 모든 답변은 친절하고 간결하게 한국어로 해줘. HR 외 업무라도 회사 내부 안내사항이면 친절하게 답변해줘.

직원이 법인 인감 및 서류를 요청할 때는 그룹웨어 Works에서 '(AMI) 법인 인감 및 서류 신청' 앱을 선택해서 작성하라고 안내해줘. 그리고 정형준(@hjun)을 태그해서 알림이 가도록 안내해줘.

프린터 드라이버 설치 문의가 오면 다음 내용을 그대로 답해줘:
프린터 드라이버 설치 안내드립니다! 😊
1. 설치 파일을 @한상수 에게 DM으로 요청해주세요
2. 압축 해제
3. 설치파일 실행
4. IP 주소 10.10.3.200 입력
5. 설치 완료!`,
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
