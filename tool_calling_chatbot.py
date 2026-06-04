from datetime import datetime
from openai import OpenAI
import json

# API 설정
BASE_URL = "http://121.152.219.135:8000/v1"
STUDENT_ID = "1212"

client = OpenAI(
    base_url=BASE_URL,
    api_key=STUDENT_ID,
)

# 대화 기록을 저장할 리스트 초기화 (기존 코드에서 누락됨)
history = []

# 1. 현재 날짜와 시각을 반환하는 함수
def get_current_time():
    return datetime.now().astimezone().isoformat()

# 2. 수식을 계산하는 함수
def calculate(expression):
    try:
        return str(eval(expression))
    except Exception as e:
        return f"계산 오류: {str(e)}"

# 파일 쓰기 함수
def write_file(filename, content):
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
    return f" '{filename}' 저장완료 ({len(content)}글자)"

# 3. 함수 안내서 작성
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "현재 날짜와 시간을 반환한다. 시간 관련 질문에는 반드시 사용",
            "parameters": {"type": "object", "properties": {}}, 
        }
    }, 
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": "수식을 정확하게 계산한다. 계산이 필요하면 암산하지 말고 반드시 사용.",
            "parameters": {
                "type": "object",
                "properties": {"expression": {"type": "string", "description": "예: '48293 * 71857'"}},
                "required": ["expression"],
            },
        },
    },
    { 
        "type": "function",
        "function": { 
            "name": "write_file",
            "description": "텍스트를 파일로 작성한다. 사용자가 파일로 저장/작성해 달라고 하면 사용",
            "parameters": {
                "type": "object",
                "properties": { 
                    "filename": {"type": "string", "description": "예: memo.txt"},
                    "content": {"type": "string"},
                },
                "required": ["filename", "content"],
            },
        },
    },
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
    if user_input.lower() in ("quit", "exit", "종료"):
        print("안녕! 다음에 또 봐~")
        break

    history.append({"role": "user", "content": user_input})

    # 첫 번째 모델 요청
    response = client.chat.completions.create(
        model="gemini-3.1-flash-lite",
        messages=history,
        max_tokens=1024,
        temperature=0.7,
        tools=TOOLS,
    )
    
    # 4. Tool Call 처리 루프
    while response.choices[0].message.tool_calls:
        msg = response.choices[0].message
        history.append(msg.model_dump(exclude_none=True))
        
        # 단일 for 루프 내에서 모든 도구 분기 처리 및 결과 추가
        for tool_call in msg.tool_calls:
            name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)
            
            if name == "calculate":
                result = calculate(args["expression"])
            elif name == "write_file":
                result = write_file(args["filename"], args["content"])
            elif name == "get_current_time":
                result = get_current_time()
            else:
                result = "알 수 없는 함수 호출"
                
            history.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": result,
            })
            
        # 도구 실행 결과를 담아 다시 모델에게 요청 (루프 제어를 위해 response 업데이트 필수)
        response = client.chat.completions.create(
            model="gemini-3.1-flash-lite",
            messages=history,
            max_tokens=1024,
            temperature=0.7,
            tools=TOOLS,
        )
        
    # Tool Call 검사가 모두 끝난 후 최종 답변 추출 및 저장
    reply = response.choices[0].message.content
    
    if reply:
        history.append({"role": "assistant", "content": reply})
        print(f"AI: {reply}")
        print()