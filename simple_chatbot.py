from openai import OpenAI

BASE_URL = "http://121.152.219.135:8000/v1"
STUDENT_ID = "1212"

from openai import OpenAI

client = OpenAI(
    base_url=BASE_URL,
    api_key=STUDENT_ID,
)

SYSTEM_PROMPT = "너는 친절한 AI 비서야. 항상 반말로 대답해."

history = [
    {"role": "system", "content": SYSTEM_PROMPT},
]

print("=" * 50)
print(" Gemini Chatbot")
print(" 'quit' 입력 시 종료")
print("=" * 50)
print()

while True:
    user_input = input("나: ").strip()

    if not user_input:
        continue
    if user_input.lower() in("quit", "exit", "종료"):
        print("안녕! 다음에 또 봐~")
        break

    history.append({"role": "user", "content": user_input})

    response = client.chat.completions.create(
        model="gemini-3.1-flash-lite",
        messages=history,
        max_tokens=1024,
        temperature=0.7,
    )

    reply = response.choices[0].message.content
    
    history.append({"role": "assistant", "content": reply})

    print(f"AI: {reply}")
    print()