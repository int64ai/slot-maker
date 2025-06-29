# Symbol 이미지 추출 실무 가이드

*작성 날짜: 2024년 12월 28일*

## 브라우저 개발자 도구를 이용한 Symbol 추출

### 1. 크롬 개발자 도구 활용

#### A. Network 탭을 이용한 이미지 파일 수집
```javascript
// 1. F12로 개발자 도구 열기
// 2. Network 탭 선택
// 3. Img 필터 적용
// 4. 게임 로딩 중 이미지 파일들 확인
// 5. 각 이미지 파일 우클릭 -> "Open in new tab"
// 6. 이미지 저장: 우클릭 -> "다른 이름으로 이미지 저장"
```

#### B. Elements 탭을 이용한 CSS 스프라이트 추출
```javascript
// 1. Elements 탭에서 Symbol이 표시되는 요소 선택
// 2. Computed 탭에서 background-image 확인
// 3. 스프라이트 시트 URL 확인
// 4. background-position 값으로 개별 Symbol 위치 파악
```

#### C. Console을 이용한 이미지 일괄 추출
```javascript
// 게임 페이지에서 실행할 스크립트
function extractSymbolImages() {
    const images = document.querySelectorAll('img, [style*="background-image"]');
    const symbolImages = [];
    
    images.forEach((element, index) => {
        let imageUrl = '';
        
        if (element.tagName === 'IMG') {
            imageUrl = element.src;
        } else {
            const bgImage = getComputedStyle(element).backgroundImage;
            const urlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/);
            if (urlMatch) imageUrl = urlMatch[1];
        }
        
        if (imageUrl && (imageUrl.includes('symbol') || imageUrl.includes('icon'))) {
            symbolImages.push({
                index: index,
                url: imageUrl,
                element: element
            });
        }
    });
    
    console.table(symbolImages);
    return symbolImages;
}

// 실행
const symbols = extractSymbolImages();
```

### 2. 특정 게임별 Symbol 추출 방법

#### A. Slotomania 계열 게임
- **파일 위치**: `/assets/symbols/` 또는 `/images/symbols/`
- **파일 형식**: PNG, WebP 스프라이트 시트
- **추출 방법**: 
  1. 개발자 도구 -> Sources 탭
  2. 파일 트리에서 assets/symbols 폴더 찾기
  3. 개별 Symbol 파일들 다운로드

#### B. NetEnt 게임들
- **파일 위치**: CDN 경로 (예: `cdn.netent.com/games/[게임명]/symbols/`)
- **파일 형식**: PNG, SVG
- **추출 방법**:
  1. Network 탭에서 이미지 필터링
  2. Symbol 관련 요청 확인
  3. Response 탭에서 이미지 미리보기

#### C. Pragmatic Play 게임들
- **파일 위치**: `/static/symbols/` 또는 스프라이트 시트
- **파일 형식**: Atlas 형태의 JSON + PNG
- **추출 방법**:
  1. Atlas JSON 파일 다운로드
  2. JSON에서 각 Symbol의 좌표 정보 확인
  3. 스프라이트 시트에서 해당 좌표 영역 크롭

### 3. 자동화 스크립트

#### A. Symbol 자동 다운로드 스크립트
```javascript
async function downloadSymbolImages(symbolData) {
    for (let i = 0; i < symbolData.length; i++) {
        const symbol = symbolData[i];
        try {
            const response = await fetch(symbol.url);
            const blob = await response.blob();
            
            // Blob을 다운로드 링크로 변환
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `symbol_${i}_${symbol.url.split('/').pop()}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
            
            // 요청 간격 조절 (서버 부하 방지)
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Failed to download symbol ${i}:`, error);
        }
    }
}
```

#### B. 스프라이트 시트 분할 스크립트
```javascript
function splitSpriteSheet(imageUrl, atlasData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        atlasData.frames.forEach((frame, index) => {
            canvas.width = frame.frame.w;
            canvas.height = frame.frame.h;
            
            ctx.drawImage(
                img,
                frame.frame.x, frame.frame.y, frame.frame.w, frame.frame.h,
                0, 0, frame.frame.w, frame.frame.h
            );
            
            // Canvas를 Blob으로 변환하여 다운로드
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${frame.filename}.png`;
                a.click();
                URL.revokeObjectURL(url);
            });
        });
    };
    
    img.src = imageUrl;
}
```

### 4. 사운드 파일 추출

#### A. 오디오 파일 탐지
```javascript
// 페이지의 모든 오디오 관련 요소 탐지
function findAudioFiles() {
    const audioElements = document.querySelectorAll('audio');
    const audioUrls = [];
    
    // 직접적인 audio 태그
    audioElements.forEach(audio => {
        if (audio.src) audioUrls.push(audio.src);
        audio.querySelectorAll('source').forEach(source => {
            audioUrls.push(source.src);
        });
    });
    
    // Web Audio API 추적
    const originalCreateBuffer = AudioContext.prototype.createBuffer;
    AudioContext.prototype.createBuffer = function(...args) {
        console.log('Audio buffer created:', args);
        return originalCreateBuffer.apply(this, args);
    };
    
    return audioUrls;
}
```

#### B. Network 탭에서 오디오 파일 필터링
- **필터 조건**: `domain:*.wav OR domain:*.mp3 OR domain:*.ogg`
- **확인 사항**: 
  - Symbol별 효과음 (예: `symbol_wild.wav`)
  - UI 사운드 (예: `button_click.wav`, `spin.wav`)
  - 배경 음악 (예: `bg_theme.mp3`)

### 5. 품질 확보 방안

#### A. 고해상도 이미지 확보
```javascript
// 레티나/고해상도 이미지 탐지
function findHighResImages() {
    const images = document.querySelectorAll('img');
    const highResUrls = [];
    
    images.forEach(img => {
        // @2x, @3x 버전 확인
        let url = img.src;
        if (!url.includes('@')) {
            const extension = url.split('.').pop();
            const baseUrl = url.replace(`.${extension}`, '');
            
            // 고해상도 버전 시도
            const highResVersions = [`${baseUrl}@2x.${extension}`, `${baseUrl}@3x.${extension}`];
            highResVersions.forEach(hrUrl => {
                fetch(hrUrl, {method: 'HEAD'})
                    .then(response => {
                        if (response.ok) highResUrls.push(hrUrl);
                    });
            });
        }
    });
    
    return highResUrls;
}
```

#### B. 투명 배경 확보
- PNG 형식 우선 수집
- SVG 형식 벡터 이미지 수집
- 배경 제거 도구 활용 (remove.bg API)

### 6. 파일 조직화

#### A. 자동 파일명 생성
```javascript
function generateSymbolFileName(symbolData, gameTheme, symbolType) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const cleanName = symbolData.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'unknown';
    
    return `${gameTheme}_${symbolType}_${cleanName}_${timestamp}.png`;
}

// 예시: "egyptian_wild_cleopatra_2024-12-28.png"
```

#### B. 메타데이터 JSON 생성
```javascript
function createSymbolMetadata(symbolData) {
    return {
        filename: symbolData.filename,
        theme: symbolData.theme,
        type: symbolData.type, // 'wild', 'scatter', 'high', 'medium', 'low'
        rarity: symbolData.rarity,
        payout: symbolData.payout,
        dimensions: {
            width: symbolData.width,
            height: symbolData.height
        },
        animations: symbolData.hasAnimation,
        sourceGame: symbolData.sourceGame,
        extractedDate: new Date().toISOString(),
        originalUrl: symbolData.originalUrl
    };
}
```

### 7. 배치 처리 도구

#### A. Python을 이용한 일괄 처리
```python
import requests
import json
from PIL import Image
import os

def batch_download_symbols(symbol_list):
    for symbol in symbol_list:
        try:
            response = requests.get(symbol['url'])
            filename = f"{symbol['theme']}_{symbol['type']}_{symbol['name']}.png"
            
            with open(f"symbols/{filename}", 'wb') as f:
                f.write(response.content)
                
            print(f"Downloaded: {filename}")
        except Exception as e:
            print(f"Error downloading {symbol['name']}: {e}")

def process_sprite_sheet(sprite_path, atlas_path):
    with open(atlas_path, 'r') as f:
        atlas = json.load(f)
    
    sprite = Image.open(sprite_path)
    
    for frame_name, frame_data in atlas['frames'].items():
        x = frame_data['frame']['x']
        y = frame_data['frame']['y']
        w = frame_data['frame']['w']
        h = frame_data['frame']['h']
        
        symbol = sprite.crop((x, y, x+w, y+h))
        symbol.save(f"symbols/{frame_name}.png")
```

## 다음 단계
1. 타겟 게임 목록 작성
2. 각 게임별 Symbol 추출 실행
3. 수집된 이미지들의 품질 검증
4. 메타데이터 정리 및 데이터베이스 구축
5. Symbol 라이브러리 구축 