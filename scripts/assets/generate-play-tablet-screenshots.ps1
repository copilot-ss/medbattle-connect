Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$storeAssets = Join-Path $repoRoot 'store_assets'

function New-RoundedRectanglePath {
  param(
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )

  $diameter = [Math]::Max(1, $Radius * 2)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-GradientBackground {
  param(
    [System.Drawing.Graphics]$Graphics,
    [int]$Width,
    [int]$Height
  )

  $rect = New-Object System.Drawing.Rectangle 0, 0, $Width, $Height
  $top = [System.Drawing.Color]::FromArgb(255, 7, 36, 60)
  $bottom = [System.Drawing.Color]::FromArgb(255, 4, 16, 31)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $top, $bottom, 90
  $Graphics.FillRectangle($brush, $rect)
  $brush.Dispose()

  $glowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 120, 204, 255))
  $Graphics.FillEllipse($glowBrush, [int]($Width * -0.1), [int]($Height * -0.05), [int]($Width * 0.9), [int]($Height * 0.38))
  $Graphics.FillEllipse($glowBrush, [int]($Width * 0.25), [int]($Height * 0.62), [int]($Width * 0.8), [int]($Height * 0.32))
  $glowBrush.Dispose()
}

function Draw-TabletScreenshot {
  param(
    [string]$InputPath,
    [string]$OutputPath,
    [int]$CanvasWidth,
    [int]$CanvasHeight,
    [string]$DeviceLabel
  )

  $bitmap = New-Object System.Drawing.Bitmap $CanvasWidth, $CanvasHeight
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

  Draw-GradientBackground -Graphics $graphics -Width $CanvasWidth -Height $CanvasHeight

  $outerMargin = [int]([Math]::Round($CanvasWidth * 0.075))
  $frameWidth = $CanvasWidth - ($outerMargin * 2)
  $frameHeight = $CanvasHeight - ($outerMargin * 2)
  $frameX = $outerMargin
  $frameY = $outerMargin
  $frameRadius = [Math]::Round($CanvasWidth * 0.06)

  $shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(95, 0, 0, 0))
  $shadowPath = New-RoundedRectanglePath ($frameX + 24) ($frameY + 30) $frameWidth $frameHeight $frameRadius
  $graphics.FillPath($shadowBrush, $shadowPath)
  $shadowBrush.Dispose()
  $shadowPath.Dispose()

  $frameRect = New-Object System.Drawing.Rectangle $frameX, $frameY, $frameWidth, $frameHeight
  $frameBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $frameRect, ([System.Drawing.Color]::FromArgb(255, 25, 30, 38)), ([System.Drawing.Color]::FromArgb(255, 9, 12, 18)), 90
  $framePath = New-RoundedRectanglePath $frameX $frameY $frameWidth $frameHeight $frameRadius
  $graphics.FillPath($frameBrush, $framePath)
  $frameBrush.Dispose()

  $innerMargin = [int]([Math]::Round($CanvasWidth * 0.03))
  $statusBarHeight = [int]([Math]::Round($CanvasHeight * 0.035))
  $screenX = $frameX + $innerMargin
  $screenY = $frameY + $innerMargin + $statusBarHeight
  $screenWidth = $frameWidth - ($innerMargin * 2)
  $screenHeight = $frameHeight - ($innerMargin * 2) - ($statusBarHeight * 2)
  $screenRadius = [Math]::Round($CanvasWidth * 0.04)
  $screenPath = New-RoundedRectanglePath $screenX $screenY $screenWidth $screenHeight $screenRadius

  $screenBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 12, 18, 28))
  $graphics.FillPath($screenBrush, $screenPath)
  $screenBrush.Dispose()

  $topBarBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(115, 255, 255, 255))
  $speakerWidth = [int]([Math]::Round($CanvasWidth * 0.12))
  $speakerHeight = [int]([Math]::Round($CanvasHeight * 0.006))
  $speakerX = [int]([Math]::Round(($CanvasWidth - $speakerWidth) / 2))
  $speakerY = $frameY + [int]([Math]::Round($innerMargin * 1.15))
  $graphics.FillRectangle($topBarBrush, $speakerX, $speakerY, $speakerWidth, $speakerHeight)
  $graphics.FillEllipse($topBarBrush, $speakerX - 18, $speakerY - 6, 12, 12)
  $topBarBrush.Dispose()

  $sourceImage = [System.Drawing.Image]::FromFile($InputPath)
  $sourceRatio = $sourceImage.Width / $sourceImage.Height
  $targetRatio = $screenWidth / $screenHeight

  if ($sourceRatio -gt $targetRatio) {
    $destWidth = $screenWidth
    $destHeight = [int]([Math]::Round($screenWidth / $sourceRatio))
  } else {
    $destHeight = $screenHeight
    $destWidth = [int]([Math]::Round($screenHeight * $sourceRatio))
  }

  $destX = $screenX + [int]([Math]::Round(($screenWidth - $destWidth) / 2))
  $destY = $screenY + [int]([Math]::Round(($screenHeight - $destHeight) / 2))

  $previousClip = $graphics.Clip
  $graphics.SetClip($screenPath)
  $graphics.DrawImage($sourceImage, $destX, $destY, $destWidth, $destHeight)
  $graphics.Clip = $previousClip
  $sourceImage.Dispose()

  $outlinePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(90, 255, 255, 255), 3)
  $graphics.DrawPath($outlinePen, $framePath)
  $outlinePen.Dispose()
  $framePath.Dispose()
  $screenPath.Dispose()

  $accentPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(80, 110, 198, 255), 2)
  $graphics.DrawRectangle($accentPen, $screenX, $screenY, $screenWidth, $screenHeight)
  $accentPen.Dispose()

  $fontSize = [Math]::Round($CanvasWidth * 0.03)
  $font = New-Object System.Drawing.Font 'Segoe UI Semibold', $fontSize, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
  $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(210, 242, 247, 255))
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Far
  $format.LineAlignment = [System.Drawing.StringAlignment]::Far
  $labelRect = New-Object System.Drawing.RectangleF ($frameX), ($frameY), ($frameWidth - 26), ($frameHeight - 24)
  $graphics.DrawString($DeviceLabel, $font, $textBrush, $labelRect, $format)
  $font.Dispose()
  $textBrush.Dispose()
  $format.Dispose()

  $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

$specs = @(
  @{ Prefix = 'play_store_7in_tablet_screenshot'; Width = 1600; Height = 2560; Label = '7" Tablet' },
  @{ Prefix = 'play_store_10in_tablet_screenshot'; Width = 1920; Height = 3072; Label = '10" Tablet' }
)

$preferredSources = @(
  Join-Path $storeAssets 'play_store_screenshot_2.png'
  Join-Path $storeAssets 'play_store_screenshot_3.png'
)

$sources = $preferredSources |
  Where-Object { Test-Path $_ } |
  ForEach-Object { Get-Item $_ }

if ($sources.Count -lt 2) {
  $sources = Get-ChildItem -Path $storeAssets -Filter 'play_store_screenshot_*.png' |
    Sort-Object Name |
    Select-Object -First 2
}

if (-not $sources -or $sources.Count -lt 2) {
  throw 'At least two phone screenshots are required before generating tablet screenshots.'
}

foreach ($spec in $specs) {
  Get-ChildItem -Path $storeAssets -Filter ('{0}_*.png' -f $spec.Prefix) -ErrorAction SilentlyContinue |
    Remove-Item -Force
  $index = 1
  foreach ($source in $sources) {
    $outputName = '{0}_{1}.png' -f $spec.Prefix, $index
    $outputPath = Join-Path $storeAssets $outputName
    Draw-TabletScreenshot -InputPath $source.FullName -OutputPath $outputPath -CanvasWidth $spec.Width -CanvasHeight $spec.Height -DeviceLabel $spec.Label
    $index += 1
  }
}

Write-Output 'Tablet screenshots generated successfully.'
