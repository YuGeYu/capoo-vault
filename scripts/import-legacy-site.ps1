param(
  [Parameter(Mandatory = $true)]
  [string]$Source,

  [Parameter(Mandatory = $true)]
  [string]$ApiOrigin,

  [Parameter(Mandatory = $true)]
  [string]$ImportToken,

  [Parameter(Mandatory = $true)]
  [string]$OwnerId,

  [Parameter(Mandatory = $true)]
  [string]$OwnerUsername,

  [string]$OwnerDisplayName,
  [string]$StartAfter,
  [int]$Limit
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Stop'

if (-not $PSBoundParameters.ContainsKey('OwnerDisplayName')) { $OwnerDisplayName = 'owner' }
if (-not $PSBoundParameters.ContainsKey('StartAfter')) { $StartAfter = '' }
if (-not $PSBoundParameters.ContainsKey('Limit')) { $Limit = 0 }

$excludeDirs = @(
  '.git',
  '__pycache__',
  'node_modules',
  'venv',
  'env',
  '.vscode',
  '.idea',
  'dist',
  'build',
  '_dedupe_trash',
  'site-assets',
  '.wrangler'
)

$mimeMap = @{
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.png'  = 'image/png'
  '.gif'  = 'image/gif'
  '.bmp'  = 'image/bmp'
  '.webp' = 'image/webp'
  '.mp4'  = 'video/mp4'
  '.webm' = 'video/webm'
  '.mov'  = 'video/quicktime'
  '.m4v'  = 'video/x-m4v'
}

function New-RandomId {
  param([string]$Prefix)
  $bytes = New-Object byte[] 12
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $rng.GetBytes($bytes)
  } finally {
    $rng.Dispose()
  }
  $hex = -join ($bytes | ForEach-Object { $_.ToString('x2') })
  return "$Prefix`_$hex"
}

function Normalize-Slug {
  param([string]$Value)
  return (($Value.Trim() -replace '\s+', '-') -replace '[\\/#?%]', '')
}

function Get-MediaKind {
  param([string]$MimeType)
  if ($MimeType.StartsWith('video/')) { return 'video' }
  return 'image'
}

function Get-CategoryDescription {
  param([string]$Name)
  return "$Name imported from legacy site"
}

function Invoke-WithRetry {
  param(
    [scriptblock]$Action,
    [int]$MaxAttempts = 4,
    [int]$BaseDelaySeconds = 2
  )

  $lastError = $null
  for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
    try {
      return & $Action
    } catch {
      $lastError = $_
      if ($attempt -eq $MaxAttempts) { break }
      Start-Sleep -Seconds ($BaseDelaySeconds * $attempt)
    }
  }
  throw $lastError
}

function Upload-FileViaApi {
  param(
    [string]$ApiOrigin,
    [string]$ImportToken,
    [string]$R2Key,
    [string]$ContentType,
    [string]$FilePath
  )

  $base = $ApiOrigin.TrimEnd('/')
  $escapedKey = [Uri]::EscapeDataString($R2Key)
  $escapedType = [Uri]::EscapeDataString($ContentType)
  $url = '{0}/api/admin/import/upload?key={1}&contentType={2}' -f $base, $escapedKey, $escapedType

  Invoke-WithRetry -Action {
    Invoke-WebRequest `
      -Uri $url `
      -Method Put `
      -Headers @{ 'x-import-token' = $ImportToken } `
      -ContentType $ContentType `
      -InFile $FilePath `
      -UseBasicParsing | Out-Null
  } | Out-Null
}

function Remove-UploadedKey {
  param([string]$ApiOrigin, [string]$ImportToken, [string]$R2Key)
  $url = '{0}/api/admin/import/r2-object?key={1}' -f $ApiOrigin.TrimEnd('/'), ([Uri]::EscapeDataString($R2Key))
  try { Invoke-RestMethod -Uri $url -Method Delete -Headers @{ 'x-import-token' = $ImportToken } | Out-Null } catch { Write-Warning "Cleanup failed for $R2Key : $($_.Exception.Message)" }
}

function Import-FolderViaApi {
  param(
    [string]$ApiOrigin,
    [string]$ImportToken,
    [hashtable]$Payload
  )

  $url = '{0}/api/admin/import/folder' -f $ApiOrigin.TrimEnd('/')
  $json = $Payload | ConvertTo-Json -Depth 8 -Compress

  return Invoke-WithRetry -Action {
    Invoke-RestMethod `
      -Uri $url `
      -Method Post `
      -Headers @{ 'x-import-token' = $ImportToken } `
      -ContentType 'application/json; charset=utf-8' `
      -Body $json
  }
}

function Test-SlugExistsViaApi {
  param(
    [string]$ApiOrigin,
    [string]$ImportToken,
    [string]$Slug
  )

  $url = '{0}/api/admin/import/check-slug?slug={1}' -f $ApiOrigin.TrimEnd('/'), ([Uri]::EscapeDataString($Slug))
  $result = Invoke-WithRetry -Action {
    Invoke-RestMethod `
      -Uri $url `
      -Method Get `
      -Headers @{ 'x-import-token' = $ImportToken }
  }
  return ($result.exists -eq $true)
}

function Get-Categories {
  param([string]$Root)

  $dirs = Get-ChildItem -LiteralPath $Root -Directory |
    Where-Object { $excludeDirs -notcontains $_.Name } |
    Sort-Object Name

  $categories = New-Object System.Collections.Generic.List[object]

  foreach ($dir in $dirs) {
    $files = Get-ChildItem -LiteralPath $dir.FullName -File |
      Where-Object { $mimeMap.ContainsKey($_.Extension.ToLowerInvariant()) } |
      Sort-Object Name

    if ($files.Count -gt 0) {
      $categories.Add([pscustomobject]@{
        Name = $dir.Name
        Files = $files
      })
    }
  }

  return $categories
}

$categories = Get-Categories -Root $Source
if ($StartAfter) {
  $startIndex = -1
  for ($i = 0; $i -lt $categories.Count; $i++) {
    if ($categories[$i].Name -eq $StartAfter) {
      $startIndex = $i
      break
    }
  }
  if ($startIndex -ge 0) {
    if ($startIndex + 1 -lt $categories.Count) {
      $categories = $categories[($startIndex + 1)..($categories.Count - 1)]
    } else {
      $categories = @()
    }
  }
}

if ($Limit -gt 0 -and $categories.Count -gt $Limit) {
  $categories = $categories[0..($Limit - 1)]
}

$totalFiles = ($categories | ForEach-Object { $_.Files.Count } | Measure-Object -Sum).Sum
if (-not $totalFiles) { $totalFiles = 0 }

Write-Host "Preparing $($categories.Count) categories and $totalFiles media files."
Write-Host "Owner: $OwnerUsername ($OwnerId)"

$migratedFolders = 0
$skippedFolders = 0
$processedFiles = 0

foreach ($category in $categories) {
  $folderId = New-RandomId -Prefix 'folder'
  $slug = Normalize-Slug -Value $category.Name
  $now = [DateTime]::UtcNow.ToString('o')
  $assets = New-Object System.Collections.Generic.List[object]
  $uploadedKeys = New-Object System.Collections.Generic.List[string]

  if (Test-SlugExistsViaApi -ApiOrigin $ApiOrigin -ImportToken $ImportToken -Slug $slug) {
    $skippedFolders += 1
    Write-Host "Skip existing $($category.Name)"
    continue
  }

  Write-Host "Importing $($category.Name) with $($category.Files.Count) files"

  try {
  for ($index = 0; $index -lt $category.Files.Count; $index++) {
    $file = $category.Files[$index]
    $extension = $file.Extension.ToLowerInvariant()
    $mimeType = $mimeMap[$extension]
    $assetId = New-RandomId -Prefix 'asset'
    $r2Key = "published/$folderId/$assetId$extension"

    Upload-FileViaApi -ApiOrigin $ApiOrigin -ImportToken $ImportToken -R2Key $r2Key -ContentType $mimeType -FilePath $file.FullName
    $uploadedKeys.Add($r2Key)

    $assets.Add([ordered]@{
      id = $assetId
      folderId = $folderId
      uploaderUserId = $OwnerId
      r2Key = $r2Key
      originalName = $file.Name
      mimeType = $mimeType
      mediaKind = (Get-MediaKind -MimeType $mimeType)
      sizeBytes = [int64]$file.Length
      sortOrder = $index
      createdAt = $now
      publishedAt = $now
    })

    $processedFiles += 1
    if ($index -eq 0 -or (($index + 1) % 50) -eq 0 -or ($index + 1) -eq $category.Files.Count) {
      Write-Host "  Progress $($index + 1)/$($category.Files.Count)"
    }
  }

  $payload = [ordered]@{
    folder = [ordered]@{
      id = $folderId
      ownerUserId = $OwnerId
      name = $category.Name
      slug = $slug
      description = (Get-CategoryDescription -Name $category.Name)
      reviewNote = 'legacy import'
      reviewedByUserId = $OwnerId
      reviewedAt = $now
      publishedAt = $now
      createdAt = $now
      updatedAt = $now
    }
    assets = $assets
    reviewLog = [ordered]@{
      id = New-RandomId -Prefix 'log'
      actorUserId = $OwnerId
      note = 'legacy import direct publish'
      createdAt = $now
    }
  }

  $result = Import-FolderViaApi -ApiOrigin $ApiOrigin -ImportToken $ImportToken -Payload $payload
  } catch {
    foreach ($key in $uploadedKeys) { Remove-UploadedKey -ApiOrigin $ApiOrigin -ImportToken $ImportToken -R2Key $key }
    throw
  }
  if ($result.skipped -eq $true) {
    $skippedFolders += 1
    Write-Host "Skipped $($category.Name): $($result.reason)"
    continue
  }

  $migratedFolders += 1
  Write-Host "Done $($category.Name)"
}

Write-Host "Finished. Imported $migratedFolders folders, skipped $skippedFolders, processed $processedFiles files."
