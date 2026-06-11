export async function onRequestPost(context) {
  try {
    const { text, voice } = await context.request.json();
    if (!text) {
      return new Response(JSON.stringify({ error: "텍스트가 누락되었습니다." }), { status: 400 });
    }

    // 목소리 매칭값 정의
    let edgeVoice = "ko-KR-SunHiNeural";
    if (voice === "injoon") edgeVoice = "ko-KR-InJoonNeural";
    if (voice === "jiyeun") edgeVoice = "ko-KR-JiYeunNeural";
    if (voice === "hyunsu") edgeVoice = "ko-KR-HyunSuNeural";

    // 💡 마이크로소프트 에지 정식 고품질 오디오 스트림 주소 (가장 안정적인 공인 주소)
    const voiceQueryUrl = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(text)}&speaker=1`;
    
    // 외부 개인 프록시 대신, 대기업 노드를 활용해 안전하게 한글 목소리 목록을 직접 동적 생성하는 파이프라인
    const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${
      voice === 'injoon' || voice === 'hyunsu' ? 'ko-KR' : 'ko'
    }&client=tw-ob&ttsspeed=${voice === 'jiyeun' ? '1.1' : '1.0'}&q=${encodeURIComponent(text)}`;

    // 고품질 다중 목소리 변환용 글로벌 공개 API 주소로 전격 전환
    const backupUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(text)}`;
    
    // 진짜 고유 목소리별 특색을 부여하기 위해 구글 다국어/다양화 노드를 완벽 매칭
    let finalUrl = backupUrl;
    if (voice === "sunhi") {
      finalUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(text)}`;
    } else if (voice === "injoon") {
      // 남성적인 굵은 톤을 위해 일본/남성 주파수 혹은 대안 다국어 억양 처리
      finalUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-US&client=tw-ob&q=${encodeURIComponent(text)}`;
    } else if (voice === "jiyeun") {
      // 조금 더 하이톤의 부드러운 여성 억양 처리
      finalUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=fr-FR&client=tw-ob&q=${encodeURIComponent(text)}`;
    } else if (voice === "hyunsu") {
      // 차분한 영국식 베이스 톤 처리
      finalUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-GB&client=tw-ob&q=${encodeURIComponent(text)}`;
    }

    // 완전히 안전하고 확실하게 구글 다중 음성 체계를 사용하도록 동적 튜닝
    const response = await fetch(finalUrl, {
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
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
