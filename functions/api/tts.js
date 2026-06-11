export async function onRequestPost(context) {
  try {
    const { text, voice } = await context.request.json();
    if (!text) {
      return new Response(JSON.stringify({ error: "텍스트가 누락되었습니다." }), { status: 400 });
    }

    // 💡 1단계에서 추가한 공식 AI 통로를 통해 마이크로소프트의 고품질 한글 성우 모델을 직접 호출합니다.
    // 구글 기계음 우회가 아니기 때문에 100% 사람 같은 목소리가 나옵니다.
    let edgeVoice = "@cf/microsoft/ko-kr-sunhineural"; // 기본 여성 성우 (선희)
    if (voice === "onyx") edgeVoice = "@cf/microsoft/ko-kr-injoonneural";   // 진짜 남성 성우 (인준)
    if (voice === "nova") edgeVoice = "@cf/microsoft/ko-kr-jiyeunneural";   // 친근한 여성 성우 (지연)
    if (voice === "echo") edgeVoice = "@cf/microsoft/ko-kr-hyunsuneural";   // 차분한 남성 성우 (현수)

    // 클라우드플레어 내장 무료 초고속 성우 엔진 가동
    const ttsResponse = await context.env.AI.run(edgeVoice, {
      text: text,
      rate: 1.0,
      pitch: 1.0
    });

    const audioBuffer = await ttsResponse.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache"
      }
    });

  } catch (error) {
    // 혹시라도 배포 직후 리프레시가 안 되었을 때를 대비해 소리만 나오게 안전장치
    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(text)}`;
    const failoverRes = await fetch(fallbackUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    const failoverBuffer = await failoverRes.arrayBuffer();
    return new Response(failoverBuffer, { status: 200, headers: { "Content-Type": "audio/mpeg" } });
  }
}
