<img width="128" height="128" alt="image" src="https://github.com/user-attachments/assets/ef12dfac-9ef3-485c-935d-91aeb7b19264" />

# SPOT 개발 환경 설정

## macOS 용 패키지 관리자 brew 설치
`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

## Node.js 설치
`brew install nvm`

## Git 설치
`brew install git`

## Xcode (App Store에서 설치 후 실행)

## ios 의존성 매니저 CocoaPods
`sudo gem install cocoapods`

---

## 프로젝트 내려받기
`git clone https://github.com/BalancingLife/SPOT.git`

## 경로 설정
cd SPOT

## 노드 모듈 인스톨
`npm install`

## 환경변수 설정
루트 디렉토리에 `.env` 파일 생성 및 내용 추가

내용 ->
```
EXPO_PUBLIC_KAKAO_AUTH_ENDPOINT=https://kauth.kakao.com/oauth/authorize
EXPO_PUBLIC_KAKAO_REST_API_KEY=3a29040d229e76dade6b626bbdae933f
EXPO_PUBLIC_KAKAO_REDIRECT_URI=http://3.39.241.53:8080/api/auth/kakao/callback
EXPO_PUBLIC_API_BASE_URL=http://3.39.241.53:8080     
```
## 실행하기
### iOS 네이티브 프로젝트 생성 (첫 빌드시)
`npx expo prebuild -p ios`

## CocoaPods 설치 (첫 빌드시)
`npx pod-install`

## 시뮬레이터 초기 빌드(빌드 시)
`npx expo run:ios`

(그 다음부터)
### 한번 빌드해놨다면 그 후로부터
`npx expo start`
시뮬레이터가 켜졌다면
i를 눌러 ios환경 띄우기

취소하고 싶다면 control + C


