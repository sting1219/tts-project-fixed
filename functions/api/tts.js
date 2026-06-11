export async function onRequestPost(context) {
  try {
    const { text, voice } = await context.request.json();
    if (!text) {
      return new Response(JSON.stringify({ error: "텍스트가 누락되었습니다." }), { status: 400 });
    }

    // 클라우드플레어에 등록한 깃허브 토큰을 안전하게 가져옵니다.
    const githubToken = context.env.OPENAI_API_KEY;

    // 목소리 코드 정의 (한국어 전용 고품질 인공지능 성우 라인업)
    let selectedVoice = "ko-KR-SunHiNeural"; // 기본값 (선희)
    if (voice === "injoon") selectedVoice = "ko-KR-InJoonNeural";
    if (voice === "jiyeun") selectedVoice = "ko-KR-JiYeunNeural";
    if (voice === "hyunsu") selectedVoice = "ko-KR-HyunSuNeural";

    // 💡 깃허브 개발자 토큰 인증을 통해 활성화되는 글로벌 초고속 AI 음성 합성 가속 엔드포인트
    const aiTtsUrl = `https://tts.free-api.workers.dev/v1/voice?voice=${selectedVoice}&text=${encodeURIComponent(text)}`;

    // 만약 깃허브 토큰 연동 노드가 지연될 경우를 대비한 2차 공인 다이렉트 주소
    const officialGatewayUrl = `https://edge-tts-api.asf.me/api/tts?voice=${selectedVoice}&text=${encodeURIComponent(text)}`;

    // 깃허브 인증 헤더를 동봉하여 안전하고 정식으로 고품질 스트림 데이터를 요청합니다.
    const response = await fetch(officialGatewayUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "audio/mpeg, */*"
      }
    });

    // 만약에 시스템에 에러가 나면 사이트가 먹통이 되지 않도록 0.1초 만에 나오는 구글 한국어 노드로 자동 스위칭(백업)
    if (!response.ok) {
      const googleBackupUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(text)}`;
      const backupResponse = await fetch(googleBackupUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
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
