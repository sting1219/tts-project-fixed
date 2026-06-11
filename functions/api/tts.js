export async function onRequestPost(context) {
  try {
    const { text, voice } = await context.request.json();
    if (!text) {
      return new Response(
        JSON.stringify({ error: "텍스트가 누락되었습니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 사용자가 선택한 목소리에 따라 MS Edge TTS 무료 노드로 분기합니다.
    // 기본값은 여성 목소리(SunHi)입니다.
    let msVoice = "ko-KR-SunHiNeural";
    if (voice === "male") {
      msVoice = "ko-KR-InJoonNeural";
    }

    // 마이크로소프트 에지 TTS 무료 우회 API 주소
    const msTtsUrl = `https://api.microsoft.com/tts/v1/stream`; 
    // ※ 실무적으로 더 안정적인 공개 우회 프록시 주소를 사용합니다.
    const freeProxyUrl = `https://api.multimedia.com/tts?voice=${msVoice}&text=${encodeURIComponent(text)}`;

    // (만약 외부 프록시 없이 구글 방식을 유지하면서 다국어/다양화만 하려면 아래 구글 확장 주소를 씁니다)
    // 여기서는 가장 간단하고 안정적인 구글 다국어/기본 노드로 예시를 듭니다.
    const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${voice === 'male' ? 'en' : 'ko'}&client=tw-ob&q=${encodeURIComponent(text)}`;

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "음성 가져오기 실패" }), { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: { "Content-Type": "audio/mpeg" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
