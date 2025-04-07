document.addEventListener('DOMContentLoaded', () => {
  const geminiKey = "AIzaSyAqJG7difoUuRe64Hg-UfWb-gUOm5vAHAQ";

  document.getElementById('fileInput').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById('codeInput').value = e.target.result;
      };
      reader.readAsText(file);
    }
  });

  document.getElementById('debugBtn').addEventListener('click', async () => {
    const code = document.getElementById('codeInput');
    const language = document.getElementById('language').value;
    const resultDiv = document.getElementById('result');
    const loader = document.getElementById('loader');

    resultDiv.innerText = '';
    loader.classList.remove('hidden');
    code.classList.add("highlight");
    setTimeout(() => code.classList.remove("highlight"), 1200);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `Analyze and debug the following ${language.toUpperCase()} code:\n\n${code.value}`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      loader.classList.add('hidden');

      if (data?.candidates?.length > 0) {
        resultDiv.innerText = data.candidates[0].content.parts[0].text;
      } else {
        resultDiv.innerText = '⚠️ Gemini returned no answer. Please verify your API key and check your quota usage.';
      }
    } catch (error) {
      loader.classList.add('hidden');
      resultDiv.innerText = '❌ Error: ' + error.message;
    }
  });

  document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    document.querySelectorAll('textarea, select, input').forEach(el => el.classList.toggle('dark'));
  });
});

async function runCode() {
  const code = document.getElementById('codeInput').value;
  const language = document.getElementById('language').value;
  const resultDiv = document.getElementById('result');
  resultDiv.innerText = '🚀 Running code...';

  const languageMap = {
    cpp: 54,
    c: 50,
    java: 62,
    python: 71,
    javascript: 63,
    html: 42
  };

  const languageId = languageMap[language];
  if (!languageId) {
    resultDiv.innerText = '❗ Language not supported for execution.';
    return;
  }

  try {
    const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': '0aafbf30c9msh7d566665c65764cp11a289jsndc1e2999c744',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId
      })
    });

    const data = await response.json();
    if (data.stdout) {
      resultDiv.innerText = `🟢 Output:\n${data.stdout}`;
    } else if (data.stderr) {
      resultDiv.innerText = `🔴 Error:\n${data.stderr}`;
    } else if (data.compile_output) {
      resultDiv.innerText = `🛠 Compile Error:\n${data.compile_output}`;
    } else {
      resultDiv.innerText = '⚠️ Unknown response. Please check your code or try again.';
    }
  } catch (error) {
    resultDiv.innerText = '❌ Execution error: ' + error.message;
  }
}