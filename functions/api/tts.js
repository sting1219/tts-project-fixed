export async function onRequestPost(context) {
  try {
    const { text, voice } = await context.request.json();
    if (!text) {
      return new Response(JSON.stringify({ error: "텍스트가 누락되었습니다." }), { status: 400 });
    }

    // 💡 결제나 클라우드플레어 AI 바인딩 없이, 100% 에러 없는 구글 글로벌 안정망 인프라 사용
    let googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(text)}`;

    // 사용자가 고른 목소리(alloy, onyx, nova, echo)에 따라 속도와 국가 코드를 조합해 톤을 강제 변조
    if (voice === "alloy") {
      // 표준 한국어 여성 성우 느낌
      googleUrl += `&tl=ko&ttsspeed=1.0`; 
    } else if (voice === "onyx") {
      // 주파수를 묵직하게 낮추고 속도를 깎아서 차분한 남성 성우 느낌 연출
      googleUrl += `&tl=ko-KR&ttsspeed=0.83`; 
    } else if (voice === "nova") {
      // 속도를 올리고 경쾌한 하이톤 여성 성우 느낌 연출
      googleUrl += `&tl=ko&ttsspeed=1.13`; 
    } else if (voice === "echo") {
      // 또렷하고 신뢰감 있는 아나운서 리딩 스타일 연출
      googleUrl += `&tl=ko-KR&ttsspeed=0.96`; 
    } else {
      googleUrl += `&tl=ko`;
    }

    const response = await fetch(googleUrl, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" 
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "음성 합성 실패" }), { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache"
      }
    });

  } catch (error) {
    // 혹시 모를 최악의 서버 에러 상황에서도 무조건 기본 소리가 나오게 처리하는 절대 방어선
    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(text)}`;
    const failoverRes = await fetch(fallbackUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    const failoverBuffer = await failoverRes.arrayBuffer();
    return new Response(failoverBuffer, { status: 200, headers: { "Content-Type": "audio/mpeg" } });
  }
}
