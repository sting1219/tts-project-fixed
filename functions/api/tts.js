export async function onRequestPost(context) {
  try {
    const { text, voice } = await context.request.json();
    if (!text) {
      return new Response(JSON.stringify({ error: "텍스트가 누락되었습니다." }), { status: 400 });
    }

    // OpenAI의 공식 목소리 라인업을 그대로 매칭합니다.
    // (alloy, echo, fable, onyx, nova, shimmer 모두 공식 지원합니다!)
    let selectedVoice = "alloy";
    if (["alloy", "echo", "fable", "onyx", "nova", "shimmer"].includes(voice)) {
      selectedVoice = voice;
    } else {
      // 프론트엔드 구버전(sunhi 등) 명칭이 올 경우를 대비한 자동 매칭 예외처리
      if (voice === "sunhi" || voice === "jiyeun") selectedVoice = "nova";
      if (voice === "injoon" || voice === "hyunsu") selectedVoice = "onyx";
    }

    // 💡 클라우드플레어 내장 내장 OpenAI TTS-1 엔진을 직접 호출합니다. (가장 빠르고 무료!)
    const ttsResponse = await context.env.AI.run("@cf/openai/tts-1", {
      text: text,
      voice: selectedVoice,
      response_format: "mp3"
    });

    // 결과 데이터를 바이너리 버퍼로 변환하여 브라우저에 전달
    const audioBuffer = await ttsResponse.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache"
      }
    });

  } catch (error) {
    // 💡 혹시라도 계정 내 AI 바인딩 설정이 안 되어 있을 경우를 대비한 2차 안전장치
    try {
      // 바인딩이 안 열려있을 땐 기본 구글 다국어 인프라를 타되, 목소리 구분을 위해 억양 및 속도를 동적으로 다르게 줌
      let googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(text)}`;
      if (voice === "injoon" || voice === "onyx") {
        googleUrl += `&ttsspeed=0.85`; // 남성 톤 느낌을 내기 위해 속도를 묵직하게 조절
      } else if (voice === "jiyeun" || voice === "nova") {
        googleUrl += `&ttsspeed=1.1`;  // 여성 톤 느낌을 위해 경쾌하게 조절
      }
      
      const backupResponse = await fetch(googleUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      const backupBuffer = await backupResponse.arrayBuffer();
      return new Response(backupBuffer, { status: 200, headers: { "Content-Type": "audio/mpeg" } });
    } catch (innerError) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
}
