export async function onRequestPost(context) {
  try {
    // 1. 환경 변수에서 OpenAI API 키 가져오기
    const apiKey = context.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "서버에 OpenAI API 키가 설정되지 않았습니다." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. 프론트엔드로부터 요청 데이터(텍스트, 목소리) 받기
    const { text, voice } = await context.request.json();
    if (!text || !voice) {
      return new Response(
        JSON.stringify({ error: "필수 입력 데이터(text, voice)가 누락되었습니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. OpenAI TTS API 호출
    const openAiResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1", // 기본 고속 모델 (품질 향상을 원하면 tts-1-hd 로 변경 가능)
        input: text,
        voice: voice,
        response_format: "mp3",
      }),
    });

    // OpenAI 에러 핸들링
    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      return new Response(
        JSON.stringify({ error: `OpenAI API 오류: ${errorText}` }),
        { status: openAiResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. OpenAI가 돌려준 MP3 바이너리 데이터를 그대로 브라우저로 전송
    const audioBuffer = await openAiResponse.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });

  } catch (error) {
    // 예기치 못한 서버 내부 에러 캐치
    return new Response(
      JSON.stringify({ error: `서버 내부 오류: ${error.message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}