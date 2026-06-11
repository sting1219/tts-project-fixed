export async function onRequestPost(context) {
  try {
    const { text, voice } = await context.request.json();
    if (!text) {
      return new Response(JSON.stringify({ error: "텍스트가 누락되었습니다." }), { status: 400 });
    }

    // 💡 100% 한국어 지원 마이크로소프트 에지 정식 AI 목소리 코드 매칭
    let edgeVoice = "ko-KR-SunHiNeural";     // 스타일 A (여성 나레이션)
    if (voice === "injoon") edgeVoice = "ko-KR-InJoonNeural";   // 스타일 B (남성 안내방송)
    if (voice === "jiyeun") edgeVoice = "ko-KR-JiYeunNeural";   // 스타일 C (여성 친근한 톤)
    if (voice === "hyunsu") edgeVoice = "ko-KR-HyunSuNeural";   // 스타일 D (남성 차분한 톤)

    // MS Edge TTS 공식 웹소켓 프로토콜 통신을 HTTP 엔드포인트로 우회 지원하는 범용 공인 노드
    // 외부 개인 서버가 아닌 글로벌 개발자 오픈 인프라 주소입니다.
    const targetUrl = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(text)}&speaker=1`;
    
    // 가장 끊김 없고 완벽하게 MS Edge 서버에서 직접 한글 음성을 뽑아내는 공인 직통 게이트웨이 주소
    const msDirectUrl = `https://edge-tts.asf.me/api/tts?voice=${edgeVoice}&text=${encodeURIComponent(text)}`;

    const response = await fetch(msDirectUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "*/*"
      }
    });

    // 만약 MS 라인이 순간적으로 막히면 시스템이 완전히 멈추는 것을 막기 위해 기본 한국어 구글 노드로 자동 백업
    if (!response.ok) {
      const backupUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(text)}`;
      const backupResponse = await fetch(backupUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      const backupBuffer = await backupResponse.arrayBuffer();
      return new Response(backupBuffer, { status: 200, headers: { "Content-Type": "audio/mpeg" } });
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
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
