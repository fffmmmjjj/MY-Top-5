from openai import OpenAI

BASE_URL = "http://121.152.219.135:8000/v1"
STUDENT_ID = "1212"

client = OpenAI(
    base_url=BASE_URL,
    api_key=STUDENT_ID,
    )

response = client.chat.completions.create(
    model="gemini-3.1-flash-lite",
    messages=[
        {"role": "user", "content": "안녕 너는 누구야?"},
    ],
    max_tokens=10,
    temperature=0.7
)

print(response.choices[0].message.content)