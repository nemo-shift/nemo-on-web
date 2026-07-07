#!/usr/bin/env bash
# [V69.LaunchReady] STEP 7 — svh 폴백 셀렉터 정합성 검증
#
# 마크업(tsx)에서 Tailwind 형식의 svh 클래스를 추출한 뒤,
# globals.css @supports not (height: 100svh) 블록에 모두 커버되는지 확인합니다.
#
# 사용:  bash scripts/check-svh-fallback.sh
# 자동:  pnpm build 전 자동 실행 (package.json "build" 스크립트 참고)
#
# 참고:
#  - min(1vw,1.5svh) 같은 복합값 함수는 탐지 범위에서 제외됩니다.
#  - 인라인 style prop의 svh 값('100svh')은 Tailwind 클래스가 아니므로 제외됩니다.
#  - GSAP/builder 코드의 svh 문자열도 제외됩니다.

set -e

CSS_FILE="src/app/globals.css"
SRC_DIR="src/components"

if [ ! -f "$CSS_FILE" ]; then
  echo "[check:svh] ERROR: $CSS_FILE 을 찾을 수 없습니다."
  exit 1
fi

# 1. 마크업(tsx)에서 Tailwind svh 클래스 추출
#    패턴: (prefix:)?property-[N.svh] — 숫자/소수/음수만 허용 (min() 등 제외)
PREFIXED=$(grep -rEoh '[a-zA-Z_-]+:[a-zA-Z_-]+\[[-0-9.]+svh\]' \
  "$SRC_DIR" --include="*.tsx" 2>/dev/null || true)
BARE=$(grep -rEoh '(^|[^a-zA-Z_-])[a-zA-Z_-]+\[[-0-9.]+svh\]' \
  "$SRC_DIR" --include="*.tsx" 2>/dev/null \
  | grep -oE '[a-zA-Z_-]+\[[-0-9.]+svh\]' || true)

ALL_CLASSES=$(printf '%s\n%s' "$PREFIXED" "$BARE" | sort -u | grep -v '^$')

if [ -z "$ALL_CLASSES" ]; then
  echo "[check:svh] 탐지된 svh 클래스 없음. 통과."
  exit 0
fi

FAIL=0
MISSING_LIST=""

while IFS= read -r cls; do
  [ -z "$cls" ] && continue

  # CSS 셀렉터 escaped 형식으로 변환: [ → \[, ] → \], : → \:, . → \.
  escaped=$(printf '%s' "$cls" \
    | sed 's/\[/\\[/g; s/\]/\\]/g; s/:/\\:/g; s/\./\\./g')

  if grep -qF "$escaped" "$CSS_FILE"; then
    : # 커버됨 — 통과
  else
    MISSING_LIST="${MISSING_LIST}  - ${cls}\n"
    FAIL=1
  fi
done <<< "$ALL_CLASSES"

COUNT=$(echo "$ALL_CLASSES" | wc -l | tr -d ' ')

if [ "$FAIL" -eq 1 ]; then
  echo "[check:svh] FAIL — globals.css 폴백 누락:"
  printf '%b' "$MISSING_LIST"
  echo "  -> src/app/globals.css [V68.LegacyWebViewFallback] 블록을 업데이트하세요."
  exit 1
else
  echo "[check:svh] OK — ${COUNT}개 Tailwind svh 클래스 모두 폴백 커버됨."
fi
