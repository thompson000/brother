$adapters = Get-NetAdapter | Where-Object Status -eq 'Up' | Select-Object -ExpandProperty Name
$backup = @()
foreach($a in $adapters){
  $addr = (Get-DnsClientServerAddress -InterfaceAlias $a -AddressFamily IPv4 -ErrorAction SilentlyContinue).ServerAddresses
  $backup += @{Name=$a;Servers=($addr -join ',')}
  try{ Set-DnsClientServerAddress -InterfaceAlias $a -ServerAddresses @('1.1.1.1','1.0.0.1') -ErrorAction SilentlyContinue } catch {}
}
Start-Sleep -Seconds 2
Write-Output 'DNS_TEMP_SET'
node .\scripts\test_mongo_connect.js
Write-Output 'RESTORING_DNS'
foreach($b in $backup){
  if($b.Servers -and $b.Servers -ne ''){
    $s = $b.Servers.Split(',')
    try{ Set-DnsClientServerAddress -InterfaceAlias $b.Name -ServerAddresses $s -ErrorAction SilentlyContinue } catch {}
  } else {
    try{ Set-DnsClientServerAddress -InterfaceAlias $b.Name -ResetServerAddresses -ErrorAction SilentlyContinue } catch {}
  }
}
Write-Output 'DNS_RESTORED'
