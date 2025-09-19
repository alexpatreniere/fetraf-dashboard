param([string]$TargetHost = "api.fetraf.uptechti.com.br")
Write-Host "Acompanhando DNS de $TargetHost (Ctrl+C para parar)..."
while ($true) {
  try {
    $dns = Resolve-DnsName $TargetHost -Type A -ErrorAction Stop
    $ips = ($dns | Select-Object -ExpandProperty IPAddress) -join ", "
    Write-Host "Resolvido: $ips"
  } catch {
    Write-Host "Ainda não resolveu..."
  }
  Start-Sleep -Seconds 15
}
