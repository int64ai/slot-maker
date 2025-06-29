# Symbol 수집 계획서

*작성 날짜: 2024년 12월 28일*

## 수집 목표
웹 슬롯 게임의 Symbol들을 테마별, 기능별로 체계적으로 수집하여 Slot Maker 프로젝트의 레퍼런스로 활용

## 1. Symbol 분류 체계

### A. 테마별 분류
1. **이집트 테마** (Cleopatra, Book of Ra 스타일)
   - 고배당: 파라오, 클레오파트라, 아누비스, 호루스의 눈
   - 특수: 스카라브(Scatter), 피라미드(Bonus), 황금 심볼(Wild)
   - 저배당: 이집트 상형문자, A/K/Q/J/10

2. **클래식 과일 테마** (Triple Diamond, 777 스타일)
   - 고배당: BAR (싱글/더블/트리플), 럭키 7, 벨
   - 중배당: 체리, 레몬, 오렌지, 자두
   - 저배당: 포도, 수박

3. **아시아/중국 테마** (88 Fortunes, Dragon 스타일)
   - 고배당: 용(Dragon), 피닉스, 금화, 복주머니
   - 특수: 푸(Fu) 심볼, 잉어, 연꽃
   - 저배당: 중국 문자, 숫자

4. **판타지/마법 테마** (Wizard, Magic 스타일)
   - 고배당: 마법사, 마법책, 크리스탈 볼, 지팡이
   - 특수: 마법진(Wild), 포털(Scatter)
   - 저배당: 마법 재료, 룬 문자

5. **동물/자연 테마** (Buffalo, Wolf 스타일)
   - 고배당: 늑대, 독수리, 곰, 버팔로
   - 특수: 발자국(Wild), 보름달(Scatter)
   - 저배당: 깃털, 화살, 토템

6. **우주/보석 테마** (Starburst 스타일)
   - 고배당: 다이아몬드, 황금 BAR, 럭키 7
   - 특수: Starburst Wild
   - 저배당: 색상별 보석들

## 2. 기능별 분류

### A. Wild 심볼
- **표준 Wild**: 다른 심볼 대체 (Scatter 제외)
- **Expanding Wild**: 전체 릴을 채우는 Wild
- **Sticky Wild**: 여러 스핀 동안 고정되는 Wild
- **Multiplier Wild**: 배수 기능이 있는 Wild

### B. Scatter 심볼
- **Free Spins Scatter**: 무료 스핀 트리거
- **Bonus Scatter**: 보너스 게임 트리거
- **Multiplier Scatter**: 전체 베팅에 배수 적용

### C. Bonus 심볼
- **Pick and Click**: 선택형 보너스 게임
- **Wheel Bonus**: 휠 돌리기 보너스
- **Progressive**: 프로그레시브 잭팟 심볼

## 3. 수집 방법론

### A. 스크린샷 수집
1. **개별 Symbol 캡처**
   - 각 Symbol을 개별적으로 고해상도 캡처
   - 정적 상태와 활성 상태 모두 수집
   - 투명 배경으로 추출 가능한 형태

2. **애니메이션 캡처**
   - 승리 시 애니메이션 GIF 제작
   - Wild/Scatter 활성화 애니메이션
   - 스핀 중 Symbol 움직임

### B. 사운드 수집
1. **Symbol별 사운드**
   - 각 Symbol 착지 시 효과음
   - Wild/Scatter 특수 사운드
   - 승리 조합 완성 시 사운드

2. **게임 사운드**
   - 스핀 버튼 클릭음
   - 릴 회전 사운드
   - 배경 음악 (테마별)
   - 승리/보너스 팬파레

## 4. 파일 구조

```
docs/images/02_Symbols/
├── 이집트_테마/
│   ├── 고배당_심볼/
│   │   ├── 클레오파트라.png
│   │   ├── 파라오.png
│   │   └── 아누비스.png
│   ├── 특수_심볼/
│   │   ├── 스카라브_scatter.png
│   │   └── 피라미드_bonus.png
│   └── 저배당_심볼/
│       ├── A_symbol.png
│       └── K_symbol.png
├── 클래식_과일/
├── 아시아_테마/
├── 판타지_마법/
├── 동물_자연/
└── 우주_보석/

docs/sounds/
├── symbol_sounds/
│   ├── wild_activation.wav
│   ├── scatter_land.wav
│   └── big_win.wav
├── ui_sounds/
│   ├── spin_button.wav
│   ├── reel_stop.wav
│   └── coin_drop.wav
└── background_music/
    ├── egyptian_theme.mp3
    ├── classic_theme.mp3
    └── fantasy_theme.mp3
```

## 5. 수집 우선순위

### Phase 1: 핵심 테마 (1-2주)
1. 이집트 테마 - 가장 인기 있는 테마
2. 클래식 과일 - 전통적인 슬롯 심볼
3. 아시아 테마 - 다양성 확보

### Phase 2: 확장 테마 (2-3주)
1. 판타지/마법 테마
2. 동물/자연 테마
3. 우주/보석 테마

### Phase 3: 특수 기능 (1주)
1. 모든 Wild 변형들
2. 다양한 Scatter 타입
3. 보너스 게임 관련 Symbol

## 6. 기술적 요구사항

### A. 이미지 스펙
- **해상도**: 최소 512x512px
- **포맷**: PNG (투명 배경), WebP (압축)
- **크기**: 각 Symbol당 50KB 이하
- **프레임레이트**: 애니메이션 30fps

### B. 오디오 스펙
- **포맷**: WAV (무손실), MP3 (압축)
- **품질**: 44.1kHz, 16-bit
- **길이**: 효과음 1-3초, 배경음악 30-60초 루프

## 7. 활용 계획

### A. 즉시 활용
- Slot Maker 프로젝트의 기본 Symbol 세트
- 테마별 Symbol 패키지 제작
- UI 디자인 레퍼런스

### B. 향후 확장
- AI 기반 Symbol 생성 시 레퍼런스
- 다양한 테마 조합 실험
- 사용자 커스텀 Symbol 제작 도구

## 8. 법적 고려사항
- 모든 수집 자료는 교육/연구 목적으로만 사용
- 상업적 이용 시 원작자 권리 확인 필요
- Fair Use 원칙 하에 레퍼런스로만 활용

## 다음 단계
1. 브라우저 개발자 도구를 이용한 Symbol 이미지 추출
2. 오디오 캡처 도구 설정
3. 체계적인 파일명 규칙 수립
4. 데이터베이스 구조 설계 