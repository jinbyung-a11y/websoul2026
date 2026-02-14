# 웹소울랩 웹사이트 로컬 서버 시작 스크립트

Write-Host "웹소울랩 웹사이트 로컬 서버 시작..." -ForegroundColor Green
Write-Host ""
Write-Host "브라우저에서 http://localhost:8000 으로 접속하세요." -ForegroundColor Yellow
Write-Host ""
Write-Host "서버를 종료하려면 Ctrl+C를 누르세요." -ForegroundColor Yellow
Write-Host ""

# 현재 스크립트가 있는 디렉토리로 이동
Set-Location $PSScriptRoot

# Python HTTP 서버 시작
try {
    python -m http.server 8000
} catch {
    Write-Host "Python이 설치되어 있지 않거나 http.server 모듈을 사용할 수 없습니다." -ForegroundColor Red
    Write-Host ""
    Write-Host "대안: Node.js가 설치되어 있다면 다음 명령을 사용하세요:" -ForegroundColor Yellow
    Write-Host "  npx http-server -p 8000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "또는 Visual Studio Code의 Live Server 확장을 사용할 수 있습니다." -ForegroundColor Yellow
    pause
}
