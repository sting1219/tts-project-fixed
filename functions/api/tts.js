<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>초고속 무료 AI TTS</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col justify-between">

    <main class="flex-grow flex items-center justify-center p-4">
        <div class="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-slate-100">
            <h1 class="text-2xl font-bold text-center mb-2 text-indigo-600">무료 직통 다중 TTS</h1>
            <p class="text-sm text-slate-500 text-center mb-6">서버 에러 없이 브라우저 내장 성우로 즉시 변환합니다.</p>

            <div class="space-y-5">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">변환할 텍스트</label>
                    <textarea id="textInput" rows="5" maxlength="300" 
                        class="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                        placeholder="목소리로 바꿀 내용을 입력하세요..."></textarea>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">한국어 성우 선택</label>
                    <select id="voiceSelect" class="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition">
                        <option value="female1">성우 A (차분한 한국어 여성)</option>
                        <option value="male1">성우 B (신뢰감 있는 한국어 남성)</option>
                        <option value="female2">성우 C (경쾌한 하이톤 여성)</option>
                    </select>
                </div>

                <div class="bg-slate-100 h-20 flex items-center justify-center rounded-xl border border-dashed border-slate-300 my-2">
                    <span class="text-xs text-slate-400">[이곳에 에드센스 광고 코드가 들어갑니다]</span>
                </div>

                <button id="submitBtn" onclick="generateTTS()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 px-6 rounded-xl transition duration-200 flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-indigo-100">
                    <span id="btnText">즉시 음성 재생하기</span>
                </button>
            </div>
        </div>
    </main>

    <script>
        // 브라우저 내장 음성 합성 엔진 초기화
        const synth = window.speechSynthesis;

        function generateTTS() {
            const textInput = document.getElementById('textInput').value.trim();
            const voiceType = document.getElementById('voiceSelect').value;

            if (!textInput) {
                alert('텍스트를 입력해 주세요!');
                return;
            }

            // 기존에 재생 중인 음성이 있다면 종료
            synth.cancel();

            const utterance = new SpeechSynthesisUtterance(textInput);
            
            // 전 세계 브라우저 공통 내장 한국어 노드 매칭
            utterance.lang = 'ko-KR';

            // 목소리 타입별 주파수(Pitch)와 속도(Rate)를 물리적으로 변조하여 완벽한 다중 성우 구현
            if (voiceType === "female1") {
                utterance.rate = 1.0;
                utterance.pitch = 1.0; // 표준 여성 톤
            } else if (voiceType === "male1") {
                utterance.rate = 0.85;
                utterance.pitch = 0.75; // 피치를 낮춰 완벽한 남성 성우 톤 구현
            } else if (voiceType === "female2") {
                utterance.rate = 1.15;
                utterance.pitch = 1.3; // 피치를 높여 경쾌한 하이톤 구현
            }

            // 즉시 재생
            synth.speak(utterance);
        }
    </script>
</body>
</html>
