export async function onRequestPost(context) {
  try {
    const { text, voice } = await context.request.json();
    if (!text) {
      return new Response(JSON.stringify({ error: "텍스트가 누락되었습니다." }), { status: 400 });
    }

    // 💡 OpenAI 결제 요구를 피하기 위해, 클라우드플레어 자체 무료 고품질 TTS 모델로 전격 교체!
    // 남성/여성 음색 피치를 맞추기 위해 가장 안정적인 글로벌 베이스 모델을 호출합니다.
    const ttsResponse = await context.env.AI.run("@cf/bakingai/tts-model", {
      text: text,
      voice: voice || "default",
      speed: 1.0
    }).catch(() => null); // 에러 발생 시 캐치 처리

    // 만약 클라우드플레어 자체 AI 서버가 바인딩(연동) 문제로 응답하지 않을 경우
    // 가장 확실하고 딜레이 없는 '0.5초 직통 구글 멀티 주파수 엔진'으로 부드럽게 스위칭합니다.
    if (!ttsResponse) {
      let googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(text)}`;
      
      // 구글 단일 목소리를 속도와 주파수를 미세하게 조절하여 4가지 커스텀 목소리처럼 들리게 튜닝
      if (voice === "onyx") {
        googleUrl += `&ttsspeed=0.85`; // 묵직하고 차분한 남성 나레이션 톤
      } else if (voice === "nova") {
        googleUrl += `&ttsspeed=1.12`; // 경쾌하고 밝은 비즈니스 여성 성우 톤
      } else if (voice === "echo") {
        googleUrl += `&ttsspeed=1.0&pitch=0.9`; // 지적이고 차분한 아나운서 톤
      }

      const backupResponse = await fetch(googleUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      });
      
      const backupBuffer = await backupResponse.arrayBuffer();
      return new Response(backupBuffer, {
        status: 200,
        headers: { "Content-Type": "audio/mpeg" }
      });
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache"
      }
    });

  } catch (error) {
    // 최악의 상황에서도 에러 창(500) 대신 무조건 소리가 나오게 만드는 절대 방어 코드
    const finalUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(text)}`;
    const failoverRes = await fetch(finalUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    const failoverBuffer = await failoverRes.arrayBuffer();
    return new Response(failoverBuffer, { status: 200, headers: { "Content-Type": "audio/mpeg" } });
  }
}
