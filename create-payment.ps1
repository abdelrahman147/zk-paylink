# Create a payment request for 1 USDT
$body = @{
    amount = 1
    currency = "USD"
    token = "USDT"
    merchantAddress = "Hw87YF66ND8v7yAyJKEJqMvDxZrHAHiHy8qsWghddC2Z"
} | ConvertTo-Json

Write-Host "`nCreating payment request...`n"

$response = Invoke-RestMethod -Uri "https://zk-paylink.xyz/api/payments" -Method Post -Body $body -ContentType "application/json"

Write-Host "✅ Payment Created Successfully!`n" -ForegroundColor Green
Write-Host "Payment ID: " -NoNewline
Write-Host $response.payment.id -ForegroundColor Cyan
Write-Host "Amount: " -NoNewline
Write-Host "$($response.payment.amount) $($response.payment.currency)" -ForegroundColor Yellow
Write-Host "Token: " -NoNewline
Write-Host $response.payment.token -ForegroundColor Magenta
Write-Host "Token Amount: " -NoNewline
Write-Host "$($response.payment.solAmount) $($response.payment.token)" -ForegroundColor Yellow
Write-Host "Order ID: " -NoNewline
Write-Host $response.payment.orderId -ForegroundColor Cyan
Write-Host "Status: " -NoNewline
Write-Host $response.payment.status -ForegroundColor Yellow
Write-Host "`nPayment URL: " -NoNewline
Write-Host $response.payment.paymentUrl -ForegroundColor Green
Write-Host "`nShare this URL with the customer to complete payment.`n"

# Open the payment URL in browser
Start-Process $response.payment.paymentUrl

Write-Host "Full Response:" -ForegroundColor Gray
$response | ConvertTo-Json -Depth 10
