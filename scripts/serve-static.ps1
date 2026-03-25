param(
  [string]$Root = "out",
  [int]$Port = 3001
)

$resolvedRoot = Resolve-Path $Root
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Start()

Write-Output "Serving $resolvedRoot on http://127.0.0.1:$Port/"

function Get-ContentType([string]$path) {
  switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8" }
    ".css" { "text/css; charset=utf-8" }
    ".js" { "application/javascript; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    ".png" { "image/png" }
    ".jpg" { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    ".svg" { "image/svg+xml" }
    ".ico" { "image/x-icon" }
    ".txt" { "text/plain; charset=utf-8" }
    default { "application/octet-stream" }
  }
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart("/"))

    if ([string]::IsNullOrWhiteSpace($requestPath)) {
      $requestPath = "index.html"
    }

    $candidatePaths = @(
      (Join-Path $resolvedRoot $requestPath),
      (Join-Path $resolvedRoot (Join-Path $requestPath "index.html"))
    )

    $targetPath = $candidatePaths | Where-Object { Test-Path $_ -PathType Leaf } | Select-Object -First 1

    if (-not $targetPath) {
      $context.Response.StatusCode = 404
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("Not found")
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $context.Response.Close()
      continue
    }

    $bytes = [System.IO.File]::ReadAllBytes($targetPath)
    $context.Response.StatusCode = 200
    $context.Response.ContentType = Get-ContentType $targetPath
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.Close()
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
