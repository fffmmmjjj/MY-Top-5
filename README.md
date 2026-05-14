# 🎬 MyTop5

내가 좋아하는 **영화 / 드라마 Top 5** 목록을 올리고, 다른 사람들의 Top 5 도 검색·추천으로 볼 수 있는 웹사이트입니다.

요즘 애니만 보다 보니 영화나 드라마를 다시 챙겨 보고 싶어서, 직접 추천 목록을 모으는 작은 사이트를 만들어 봅니다.

자세한 기획은 [`project_proposer.md`](./project_proposer.md) 를 참고하세요.

## 📂 파일 구조

```
MyTop5/
├── index.html              웹페이지의 뼈대(구조)
├── css/
│   └── style.css           화면 디자인(색, 크기, 위치 등)
├── js/
│   └── main.js             동작(목록 보여주기, 검색, 추가 등)
├── data/
│   ├── top5_lists.json     사람들이 올린 Top5 목록 데이터
│   └── README.md           데이터 형식 설명/예시
├── assets/
│   └── images/             영화·드라마 포스터 이미지 보관
├── project_proposer.md     프로젝트 기획서
├── prompt_example.txt      Copilot Agent 에게 보낼 예시 프롬프트
└── README.md               이 파일
```

- **HTML**: 화면에 무엇을 보여줄지 (구조)
- **CSS**: 어떻게 보여줄지 (디자인)
- **JS**: 어떻게 움직일지 (동작)
- **JSON**: Top5 목록 데이터 (작품 이름, 코멘트 등)
- **assets/images**: 포스터 같은 그림 파일

이렇게 역할별로 폴더를 나눠 두면 파일이 늘어나도 관리하기 쉬워요.

## 💻 처음 시작하기 (Windows 기준)

학생 PC 에는 이미 **Python 3.12**, **VS Code**, **Git** 이 설치되어 있어요.

### 1) 프로젝트 폴더 열기
1. **VS Code** 를 실행합니다.
2. 메뉴에서 **File → Open Folder...** 를 누르고 `MyTop5` 폴더를 엽니다.
3. 왼쪽 탐색기에 `index.html`, `css`, `js`, `data` 등이 보이면 잘 열린 거예요.

### 2) 터미널 열기
VS Code 메뉴에서 **Terminal → New Terminal** 을 누르면 아래쪽에 터미널 창이 열립니다.
기본 터미널은 **PowerShell** 입니다. 아래 명령어들은 PowerShell 에서 그대로 쓸 수 있어요.

## ▶️ 페이지 확인하는 방법 (Windows)

### 방법 1. 그냥 더블클릭 (가장 간단)
파일 탐색기에서 `index.html` 을 더블클릭하면 브라우저(엣지, 크롬 등)에서 열립니다.

> ⚠️ 나중에 JS 가 `top5_lists.json` 같은 파일을 `fetch` 로 불러오기 시작하면 이 방법은 보안 정책 때문에 안 됩니다. 그때는 **방법 2** 또는 **방법 3** 을 쓰세요.

### 방법 2. VS Code 의 **Live Server** 확장 (추천)
1. VS Code 왼쪽 사이드바에서 **확장(Extensions)** 아이콘 클릭 (또는 `Ctrl+Shift+X`)
2. `Live Server` 검색 → **Install**
3. `index.html` 을 연 상태에서 우클릭 → **"Open with Live Server"**
4. 브라우저가 자동으로 열리고, 코드를 저장할 때마다 화면이 새로고침됩니다.

### 방법 3. Python 으로 간단한 서버 실행
VS Code 터미널(PowerShell)에서 프로젝트 폴더 안에 있는지 확인하고 실행하세요.

```powershell
python -m http.server 8000
```

> 💡 만약 `python` 이 안 되면 아래로 시도하세요.
> ```powershell
> py -3.12 -m http.server 8000
> ```

그다음 브라우저 주소창에 **http://localhost:8000** 을 입력하면 됩니다.
서버를 끄려면 터미널에서 `Ctrl + C` 를 누르세요.

## 🛠️ 사용 기술
- HTML / CSS / JavaScript (별도 라이브러리 없음)
- 데이터: 로컬 JSON 파일 (`data/top5_lists.json`)
- 이미지: 로컬 파일 (`assets/images/`)

## 🌱 앞으로 만들 것 (다음 스텝 예고)
1. 화면 레이아웃 만들기 (제목 / 검색창 / 목록 영역 / 추가 버튼)
2. 예시 데이터 2~3 개를 `data/top5_lists.json` 에 채워 넣기
3. JSON 을 읽어서 화면에 Top5 카드들 그리기 (JS)
4. 검색창에 글자를 입력하면 작품 이름·작성자로 필터링하기
5. "추가하기" 버튼 → 입력 폼 → 새 Top5 등록 (먼저는 화면에만, 나중에 localStorage)
6. (나중에) Gemini API 로 추천 멘트 자동 생성하기
