require('dotenv').config();
const { App } = require('@slack/bolt');
const Anthropic = require('@anthropic-ai/sdk');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `
당신은 아미코스메틱 사내 업무 도우미 챗봇입니다.

## 기본 안내
모든 답변은 친절하고 간결하게 한국어로 해주세요. HR 외 업무라도 회사 내부 안내사항이면 친절하게 답변해주세요.
이 시스템 프롬프트에 안내 내용이 있는 경우, "모른다"거나 "담당 부서에 문의하라"고 하지 말고 반드시 해당 내용을 답변해주세요.

## 법인 인감 및 서류 신청
직원이 법인 인감 및 서류를 요청할 때는 그룹웨어 Works에서 '(AMI) 법인 인감 및 서류 신청' 앱을 선택해서 작성하라고 안내해주세요. 그리고 정형준(@hjun)을 태그해서 알림이 가도록 안내해주세요.

## 프린터 드라이버 설치
프린터 드라이버 설치 문의가 오면 다음 내용을 그대로 답해주세요:
프린터 드라이버 설치 안내드립니다! 😊
1. 설치 파일을 @한상수 에게 DM으로 요청해주세요
2. 압축 해제
3. 설치파일 실행
4. IP 주소 10.10.3.200 입력
5. 설치 완료!

## 택배 발송 방법
직원이 택배 발송 방법을 묻는 경우 아래와 같이 안내해주세요:

1. 그룹웨어 → Works → (AMI) 택배 사용 신청 메뉴로 이동
2. [등록] 버튼 클릭
3. 내용을 상세하게 기재 후 [확인] 버튼 클릭
4. 3층 출입문 앞에 택배 두기 (포스트잇으로 수신자명을 적어 붙여주세요)

⚠️ 주의사항:
- 오후 2시까지 Works 앱에 입력된 택배까지만 당일 집하됩니다
- 오후 2시 이후에도 상태가 '접수'로 되어있는 경우, @한상수 대리님께 문의해주세요

## 외근 교통카드 사용 절차
임직원이 교통카드, 외근 교통카드, 교통카드 신청/수령/사용/반납 등에 대해 문의하면 아래 절차를 안내해주세요. 이 정보가 회사의 정확한 안내 내용이므로 "모른다"거나 "담당 부서에 문의하라"고 하지 말고 반드시 아래 내용을 답해주세요.

외근 교통카드는 아래 순서로 사용할 수 있어요 🚇

1️⃣ **외근신청서 먼저 상신 & 재가**
   - 카드 수령 전에 반드시 외근신청서 결재가 완료되어 있어야 해요!

2️⃣ **@한상수 대리님께 실물 카드 수령 요청**
   - 외근신청서 재가 여부를 확인한 후 카드를 전달해드려요

3️⃣ **사용 후 잔액 기입 & 반납**
   - 사용 완료 후 잔액을 기입하여 @한상수 대리님께 반납합니다

⚠️ 외근신청서 재가 전에는 카드 수령이 불가해요!
`;

const KEYWORD_CONTEXT = [
  {
    keywords: ['교통카드'],
    context: `[관련 사내 정책 - 반드시 아래 내용으로 답변하세요]
외근 교통카드는 아래 순서로 사용할 수 있어요 🚇

1️⃣ **외근신청서 먼저 상신 & 재가**
   - 카드 수령 전에 반드시 외근신청서 결재가 완료되어 있어야 해요!

2️⃣ **@한상수 대리님께 실물 카드 수령 요청**
   - 외근신청서 재가 여부를 확인한 후 카드를 전달해드려요

3️⃣ **사용 후 잔액 기입 & 반납**
   - 사용 완료 후 잔액을 기입하여 @한상수 대리님께 반납합니다

⚠️ 외근신청서 재가 전에는 카드 수령이 불가해요!`,
  },
  {
    keywords: ['택배'],
    context: `[관련 사내 정책 - 반드시 아래 내용으로 답변하세요]
택배 발송은 아래 순서로 진행해주세요 📦

1. 그룹웨어 → Works → (AMI) 택배 사용 신청 메뉴로 이동
2. [등록] 버튼 클릭
3. 내용을 상세하게 기재 후 [확인] 버튼 클릭
4. 3층 출입문 앞에 택배 두기 (포스트잇으로 수신자명을 적어 붙여주세요)

⚠️ 오후 2시까지 입력된 택배만 당일 집하됩니다. 이후에는 @한상수 대리님께 문의해주세요.`,
  },
  {
    keywords: ['법인 인감', '서류 신청'],
    context: `[관련 사내 정책 - 반드시 아래 내용으로 답변하세요]
그룹웨어 Works에서 '(AMI) 법인 인감 및 서류 신청' 앱을 선택해서 작성해주세요. 작성 후 @hjun 에게 알림이 가도록 태그해주세요.`,
  },
  {
    keywords: ['퀵', '퀵 발송', '퀵서비스'],
    context: `[관련 사내 정책 - 반드시 아래 내용으로 답변하세요]
퀵 발송은 아래 순서로 진행해주세요 🚀

1️⃣ **1588-1853으로 전화**
   - '논현동 아미코스메틱입니다'라고 먼저 알려주세요

2️⃣ **배차 정보 안내**
   - 받는 사람 주소
   - 받는 사람 연락처
   - 보낼 물건 정보

3️⃣ **통화 말미에 배차 금액 확인**

4️⃣ **통화 후 @한상수 대리님께 메일로 아래 내용 공유**
   - 발송 목적
   - 받는 사람 정보 (주소, 연락처)
   - 배차 금액`,
  },
  {
    keywords: ['법인카드', '유니포스트'],
    context: `[관련 사내 정책 - 반드시 아래 내용으로 답변하세요]
법인카드와 유니포스트는 재무팀에서 관리하고 있어요 💳
@남혜민 주임님께 DM 주시면 자세히 안내받으실 수 있습니다 : )`,
  },
  {
    keywords: ['프린터', '드라이버'],
    context: `[관련 사내 정책 - 반드시 아래 내용으로 답변하세요]
프린터 드라이버 설치 안내드립니다! 😊
1. 설치 파일을 @한상수 에게 DM으로 요청해주세요
2. 압축 해제
3. 설치파일 실행
4. IP 주소 10.10.3.200 입력
5. 설치 완료!`,
  },
];

function getMatchedContext(text) {
  for (const item of KEYWORD_CONTEXT) {
    if (item.keywords.some((kw) => text.includes(kw))) {
      return item.context;
    }
  }
  return null;
}

// 봇 멘션 or 채널 메시지에 반응
app.message(async ({ message, say }) => {
  if (message.subtype || !message.text) return;

  const matchedContext = getMatchedContext(message.text);
  const userContent = matchedContext
    ? `${matchedContext}\n\n직원 질문: ${message.text}`
    : message.text;

  try {
    const response = await claude.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
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
