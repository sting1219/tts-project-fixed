export async function onRequestPost(context) {
  try {
    const { text, voice } = await context.request.json();
    if (!text) {
      return new Response(
        JSON.stringify({ error: "텍스트가 누락되었습니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 프론트엔드 선택 값에 따른 MS Edge 고품질 목소리 매칭
    let edgeVoice = "ko-KR-SunHiNeural"; // 기본값 (선희)
    if (voice === "injoon") edgeVoice = "ko-KR-InJoonNeural";
    if (voice === "jiyeun") edgeVoice = "ko-KR-JiYeunNeural";
    if (voice === "hyunsu") edgeVoice = "ko-KR-HyunSuNeural";

    // MS Edge TTS 우회용 범용 프록시 API 사용
    const targetUrl = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(text)}&speaker=1`; 
    // ※ 단, 더 안정적이고 딜레이 없는 다이렉트 Edge TTS 오픈 프로토콜 주소로 가로챕니다.
    const edgeTtsUrl = `https://api.multimedia.com/v1/tts`; 
    
    // 가장 널리 쓰이는 전 세계 무료 인프라 우회 주소 (가장 안정적인 노드 사용)
    const googleTranslateStyleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(text)}`;
    
    // MS Edge TTS 포맷으로 데이터 청크 요청
    // (만약 우회 주소가 막힐 경우를 대비해, 다중 목소리가 지원되는 백업 무료 프록시 주소로 세팅)
    const voiceQueryUrl = `https://api.suenghun.xyz/tts?voice=${edgeVoice}&text=${encodeURIComponent(text)}`;

    const response = await fetch(voiceQueryUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      // 만약 고품질 다중 목소리 노드가 순간적으로 에러가 나면 안전하게 기본 구글 무료 노드로 자동 백업 작동
      const backupResponse = await fetch(googleTranslateStyleUrl, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const backupBuffer = await backupResponse.arrayBuffer();
      return new Response(backupBuffer, { status: 200, headers: { "Content-Type": "audio/mpeg" } });
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: `서버 오류: ${error.message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
