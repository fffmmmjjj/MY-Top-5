# data 폴더

이 폴더에는 사이트에서 사용할 **Top 5 목록 데이터**를 저장합니다.

- `top5_lists.json` : 사람들이 올린 Top5 목록들이 들어가는 파일. 처음에는 빈 배열 `[]` 입니다.

## 데이터 형식 예시

`top5_lists.json` 은 아래와 같은 형식으로 채웁니다. (주석은 실제 JSON 에 넣지 마세요!)

```json
[
  {
    "id": 1,
    "author": "지민",
    "category": "영화",
    "title": "내 인생 영화 Top 5",
    "items": [
      { "rank": 1, "name": "인터스텔라", "comment": "우주 + 가족 = 눈물" },
      { "rank": 2, "name": "라라랜드", "comment": "음악이 너무 좋음" },
      { "rank": 3, "name": "기생충", "comment": "반전이 충격" },
      { "rank": 4, "name": "어바웃 타임", "comment": "잔잔하고 따뜻함" },
      { "rank": 5, "name": "미드나잇 인 파리", "comment": "분위기 최고" }
    ]
  },
  {
    "id": 2,
    "author": "민수",
    "category": "드라마",
    "title": "정주행 추천 드라마 Top 5",
    "items": [
      { "rank": 1, "name": "시그널", "comment": "긴장감 최고" },
      { "rank": 2, "name": "나의 아저씨", "comment": "여운이 길다" },
      { "rank": 3, "name": "비밀의 숲", "comment": "각본이 탄탄" },
      { "rank": 4, "name": "스카이캐슬", "comment": "몰입감 굿" },
      { "rank": 5, "name": "이상한 변호사 우영우", "comment": "따뜻함" }
    ]
  }
]
```

### 필드 설명

- `id` : 각 Top5 묶음을 구분하는 번호 (1, 2, 3 … 겹치지 않게)
- `author` : 누가 만든 목록인지 (이름/닉네임)
- `category` : `"영화"` 또는 `"드라마"`
- `title` : 이 Top5 묶음의 제목
- `items` : 5개의 작품 (rank 1~5)
  - `rank` : 순위 (1이 1위)
  - `name` : 작품 이름
  - `comment` : 짧은 한 줄 감상평

## Google Sheets 에서 데이터 사용하기

Google Sheets에서 데이터를 관리하려면 아래 열을 만든 뒤, 시트를 공개하고 `js/main.js`의 `GOOGLE_SHEET_ID`에 시트 ID를 넣으세요.

- `id`
- `title`
- `item1`
- `item2`
- `item3`
- `item4`
- `item5`
- `comment`
- `date`

이후 `main.js`는 Google Sheets의 CSV 형식 데이터를 읽어 `items` 배열로 변환합니다.
