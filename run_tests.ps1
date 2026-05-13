# ========================================
# TEST SCRIPT - NestJS Microservices
# ========================================

Write-Host "`n========================================"  -ForegroundColor Cyan
Write-Host "  E-COMMERCE MICROSERVICES TEST SUITE"     -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ---------- STEP 1: GET all products ----------
Write-Host ">> STEP 1: GET /products (Catalog Service)" -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri 'http://localhost:3000/products' -Method Get
    Write-Host "SUCCESS - Products found: $($products.Count)" -ForegroundColor Green
    $products | ForEach-Object { Write-Host "  - [$($_.id)] $($_.name) | Price: $($_.price) DT | Stock: $($_.stock)" }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ---------- STEP 2: POST a new product ----------
Write-Host ">> STEP 2: POST /products (Create new product)" -ForegroundColor Yellow
try {
    $newProduct = @{ name="Smartphone Samsung"; price=800; stock=15 } | ConvertTo-Json
    $created = Invoke-RestMethod -Uri 'http://localhost:3000/products' -Method Post -ContentType 'application/json' -Body $newProduct
    Write-Host "SUCCESS - Product created: ID=$($created.id), Name=$($created.name)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ---------- STEP 3: POST a valid order ----------
Write-Host ">> STEP 3: POST /orders - Valid order (qty=2, productId=1)" -ForegroundColor Yellow
try {
    $orderBody = @{ productId=1; quantity=2; customerEmail="jean@dupont.com" } | ConvertTo-Json
    $order = Invoke-RestMethod -Uri 'http://localhost:3002/orders' -Method Post -ContentType 'application/json' -Body $orderBody
    Write-Host "SUCCESS - Order created: ID=$($order.id), Status=$($order.status)" -ForegroundColor Green
    Write-Host "  -> Check notification-service terminal for Kafka event!" -ForegroundColor Magenta
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ---------- STEP 4: POST order with insufficient stock ----------
Write-Host ">> STEP 4: POST /orders - Insufficient stock (qty=100)" -ForegroundColor Yellow
try {
    $overflowBody = @{ productId=1; quantity=100; customerEmail="test@test.com" } | ConvertTo-Json
    $result = Invoke-RestMethod -Uri 'http://localhost:3002/orders' -Method Post -ContentType 'application/json' -Body $overflowBody
    Write-Host "UNEXPECTED SUCCESS: $($result | ConvertTo-Json)" -ForegroundColor Orange
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "EXPECTED ERROR (HTTP $statusCode) - Stock insuffisant - gRPC validation works!" -ForegroundColor Green
}

Write-Host ""

# ---------- STEP 5: GET all orders ----------
Write-Host ">> STEP 5: GET /orders (Order Service)" -ForegroundColor Yellow
try {
    $orders = Invoke-RestMethod -Uri 'http://localhost:3002/orders' -Method Get
    Write-Host "SUCCESS - Orders found: $($orders.Count)" -ForegroundColor Green
    $orders | ForEach-Object { Write-Host "  - [$($_.id)] ProductID=$($_.productId), Qty=$($_.quantity), Status=$($_.status), Email=$($_.customerEmail)" }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ---------- STEP 6: GraphQL query ----------
Write-Host ">> STEP 6: POST /graphql (Query Service - Dashboard)" -ForegroundColor Yellow
try {
    $gqlBody = @{ query = "{ products { id name price stock } orders { id productId quantity status customerEmail } }" } | ConvertTo-Json
    $gqlResult = Invoke-RestMethod -Uri 'http://localhost:3003/graphql' -Method Post -ContentType 'application/json' -Body $gqlBody
    Write-Host "SUCCESS - GraphQL Response:" -ForegroundColor Green
    Write-Host "  Products: $($gqlResult.data.products.Count) items" -ForegroundColor White
    Write-Host "  Orders: $($gqlResult.data.orders.Count) items" -ForegroundColor White
    $gqlResult.data | ConvertTo-Json -Depth 5
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUITE COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
