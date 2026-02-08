#!/usr/bin/env bash
# Smoke test: signup → application → upload → submit → extract → score → evaluate → result; then admin merchants/applications.
set -e
API="${API_URL:-http://localhost:3001/api}"

echo "=== 1. Signup (merchant) ==="
SIGNUP=$(curl -s -X POST "$API/auth/signup" -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"Test@123","name":"Smoke Test"}')
echo "$SIGNUP" | head -c 200
echo ""

echo "=== 2. Login (merchant) ==="
LOGIN=$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"Test@123"}')
TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo "Login failed (maybe user exists). Trying login only."
  LOGIN=$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" \
    -d '{"email":"smoke@test.com","password":"Test@123"}')
  TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
fi
[ -n "$TOKEN" ] || { echo "No token"; exit 1; }
echo "Token OK"

echo "=== 3. Create application ==="
APP=$(curl -s -X POST "$API/applications" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"loanType":"working_capital"}')
APP_ID=$(echo "$APP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$APP_ID" ] || { echo "No application id"; echo "$APP"; exit 1; }
echo "Application id: $APP_ID"

echo "=== 3b. Update business details (name, CIBIL, credit amount) ==="
curl -s -X PATCH "$API/applications/$APP_ID" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"businessName\":\"Smoke Business\",\"industry\":\"Retail\",\"city\":\"Mumbai\",\"businessAgeMonths\":24,\"requestedAmount\":500000,\"foundersCibilScore\":750}" | head -c 100
echo ""

echo "=== 4. Upload bank_statement (minimal PDF) ==="
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PDF_FILE="${SCRIPT_DIR}/smoke-doc.pdf"
if [ ! -f "$PDF_FILE" ]; then
  printf '%%PDF-1.0\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF' > "$PDF_FILE"
fi
UPLOAD=$(curl -s -X POST "$API/documents/upload-documents" -H "Authorization: Bearer $TOKEN" \
  -F "file=@$PDF_FILE;type=application/pdf" -F "applicationId=$APP_ID" -F "type=bank_statement")
echo "$UPLOAD" | head -c 200
echo ""

echo "=== 5. Submit application ==="
SUBMIT=$(curl -s -X POST "$API/applications/$APP_ID/submit" -H "Authorization: Bearer $TOKEN")
echo "$SUBMIT" | head -c 200
echo ""

echo "=== 6. Extract financials ==="
curl -s -X POST "$API/extract-financials" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"applicationId\":\"$APP_ID\"}" | head -c 200
echo ""

echo "=== 7. Calculate score ==="
curl -s -X POST "$API/calculate-score" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"applicationId\":\"$APP_ID\"}" | head -c 200
echo ""

echo "=== 8. Evaluate lenders ==="
curl -s -X POST "$API/evaluate-lenders" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"applicationId\":\"$APP_ID\"}" | head -c 200
echo ""

echo "=== 9. Get result (application + score + offers) ==="
RESULT=$(curl -s -X GET "$API/applications/$APP_ID" -H "Authorization: Bearer $TOKEN")
echo "$RESULT" | head -c 400
echo ""

echo "=== 10. Admin login ==="
ADMIN_LOGIN=$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"admin@lendwise.com","password":"Admin@123"}')
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
[ -n "$ADMIN_TOKEN" ] || { echo "Admin login failed"; exit 1; }
echo "Admin token OK"

echo "=== 11. Admin: GET merchants ==="
curl -s -X GET "$API/admin/merchants" -H "Authorization: Bearer $ADMIN_TOKEN" | head -c 300
echo ""

echo "=== 12. Admin: GET applications ==="
curl -s -X GET "$API/admin/applications" -H "Authorization: Bearer $ADMIN_TOKEN" | head -c 300
echo ""

echo "=== Smoke test done ==="
