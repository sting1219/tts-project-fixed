export async function onRequestPost(context) {
  try {
    const { text } = await context.request.json();
    if (!text) {
      return new Response(
        JSON.stringify({ error: "필수 입력 데이터(text)가 누락되었습니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // OpenAI 대신 구글 번역기 TTS 주소로 우회하여 음성 파일을 가져옵니다 (100% 무료)
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(text)}`;
    
    const googleResponse = await fetch(googleTtsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"
      }
    });

    if (!googleResponse.ok) {
      return new Response(
        JSON.stringify({ error: "구글 TTS 음성을 가져오는데 실패했습니다." }),
        { status: googleResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await googleResponse.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: `서버 내부 오류: ${error.message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
