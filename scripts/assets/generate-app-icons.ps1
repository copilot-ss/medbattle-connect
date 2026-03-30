$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$sourceSymbolPath = Join-Path $projectRoot 'assets\branding\medbattle-symbol-source.png'
$brandingDir = Join-Path $projectRoot 'assets\branding'
$storeAssetsDir = Join-Path $projectRoot 'store_assets'
$androidResDir = Join-Path $projectRoot 'android\app\src\main\res'

function Ensure-Directory([string] $path) {
  if (-not (Test-Path $path)) {
    New-Item -ItemType Directory -Path $path | Out-Null
  }
}

function Set-Quality([System.Drawing.Graphics] $graphics) {
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
}

function New-RoundRectPath(
  [float] $x,
  [float] $y,
  [float] $width,
  [float] $height,
  [float] $radius
) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Remove-NearBlackBackground([System.Drawing.Bitmap] $source, [int] $threshold = 18) {
  $target = New-Object System.Drawing.Bitmap($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

  for ($x = 0; $x -lt $source.Width; $x++) {
    for ($y = 0; $y -lt $source.Height; $y++) {
      $pixel = $source.GetPixel($x, $y)

      if ($pixel.A -eq 0) {
        $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        continue
      }

      $isNearBlack = $pixel.R -le $threshold -and $pixel.G -le $threshold -and $pixel.B -le $threshold
      if ($isNearBlack) {
        $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
      } else {
        $target.SetPixel($x, $y, $pixel)
      }
    }
  }

  return $target
}

function Draw-GradientBackground([System.Drawing.Graphics] $graphics, [int] $size) {
  $backgroundRect = [System.Drawing.RectangleF]::new(0, 0, $size, $size)
  $gradientBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $backgroundRect,
    [System.Drawing.Color]::FromArgb(255, 8, 43, 57),
    [System.Drawing.Color]::FromArgb(255, 4, 18, 28),
    45
  )
  $graphics.FillRectangle($gradientBrush, $backgroundRect)
  $gradientBrush.Dispose()

  $haloRect = [System.Drawing.RectangleF]::new(
    [float]($size * 0.16),
    [float]($size * 0.1),
    [float]($size * 0.68),
    [float]($size * 0.52)
  )
  $haloBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $haloRect,
    [System.Drawing.Color]::FromArgb(125, 52, 192, 188),
    [System.Drawing.Color]::FromArgb(25, 52, 192, 188),
    90
  )
  $graphics.FillEllipse($haloBrush, $size * 0.12, $size * 0.08, $size * 0.76, $size * 0.58)
  $haloBrush.Dispose()

  $panelPath = New-RoundRectPath `
    -x ([float]($size * 0.1)) `
    -y ([float]($size * 0.1)) `
    -width ([float]($size * 0.8)) `
    -height ([float]($size * 0.8)) `
    -radius ([float]($size * 0.22))
  $panelRect = [System.Drawing.RectangleF]::new(
    [float]($size * 0.1),
    [float]($size * 0.1),
    [float]($size * 0.8),
    [float]($size * 0.8)
  )
  $panelBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $panelRect,
    [System.Drawing.Color]::FromArgb(50, 255, 255, 255),
    [System.Drawing.Color]::FromArgb(8, 255, 255, 255),
    90
  )
  $graphics.FillPath($panelBrush, $panelPath)
  $panelBrush.Dispose()

  $panelPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(34, 255, 255, 255), ($size * 0.008))
  $graphics.DrawPath($panelPen, $panelPath)
  $panelPen.Dispose()
  $panelPath.Dispose()
}

function Draw-Symbol(
  [System.Drawing.Graphics] $graphics,
  [System.Drawing.Bitmap] $symbol,
  [int] $size,
  [float] $relativeSize,
  [float] $offsetX,
  [float] $offsetY
) {
  $symbolSize = [int]($size * $relativeSize)
  $x = [int](($size - $symbolSize) / 2 + ($size * $offsetX))
  $y = [int](($size - $symbolSize) / 2 + ($size * $offsetY))

  $shadowAttributes = New-Object System.Drawing.Imaging.ImageAttributes
  $shadowMatrix = New-Object System.Drawing.Imaging.ColorMatrix
  $shadowMatrix.Matrix00 = 0
  $shadowMatrix.Matrix11 = 0
  $shadowMatrix.Matrix22 = 0
  $shadowMatrix.Matrix33 = 0.24
  $shadowAttributes.SetColorMatrix($shadowMatrix)
  $shadowRect = [System.Drawing.Rectangle]::new(
    $x + [int]($size * 0.016),
    $y + [int]($size * 0.024),
    $symbolSize,
    $symbolSize
  )
  $graphics.DrawImage(
    $symbol,
    $shadowRect,
    0,
    0,
    $symbol.Width,
    $symbol.Height,
    [System.Drawing.GraphicsUnit]::Pixel,
    $shadowAttributes
  )
  $shadowAttributes.Dispose()

  $graphics.DrawImage($symbol, $x, $y, $symbolSize, $symbolSize)
}

function Draw-Badge([System.Drawing.Graphics] $graphics, [int] $size, [string] $text) {
  $badgeSize = [int]($size * 0.255)
  $x = [int]($size * 0.62)
  $y = [int]($size * 0.63)
  $shadowOffset = [int]($size * 0.015)

  $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(95, 2, 10, 18))
  $graphics.FillEllipse($shadowBrush, $x + $shadowOffset, $y + $shadowOffset, $badgeSize, $badgeSize)
  $shadowBrush.Dispose()

  $badgeRect = [System.Drawing.RectangleF]::new($x, $y, $badgeSize, $badgeSize)
  $badgeBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $badgeRect,
    [System.Drawing.Color]::FromArgb(255, 255, 126, 94),
    [System.Drawing.Color]::FromArgb(255, 233, 82, 118),
    45
  )
  $graphics.FillEllipse($badgeBrush, $x, $y, $badgeSize, $badgeSize)
  $badgeBrush.Dispose()

  $ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(230, 255, 244, 244), ($size * 0.01))
  $graphics.DrawEllipse($ringPen, $x + [int]($size * 0.006), $y + [int]($size * 0.006), $badgeSize - [int]($size * 0.012), $badgeSize - [int]($size * 0.012))
  $ringPen.Dispose()

  $highlightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(70, 255, 255, 255))
  $graphics.FillEllipse($highlightBrush, $x + [int]($badgeSize * 0.18), $y + [int]($badgeSize * 0.12), [int]($badgeSize * 0.24), [int]($badgeSize * 0.15))
  $highlightBrush.Dispose()

  $fontSize = [int]($size * 0.14)
  $font = New-Object System.Drawing.Font('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 248, 251, 255))
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $textRect = [System.Drawing.RectangleF]::new(
    [float]$x,
    [float]($y - ($size * 0.01)),
    [float]$badgeSize,
    [float]$badgeSize
  )
  $graphics.DrawString($text, $font, $textBrush, $textRect, $format)
  $format.Dispose()
  $textBrush.Dispose()
  $font.Dispose()
}

function Save-Png([System.Drawing.Image] $image, [string] $path) {
  Ensure-Directory (Split-Path $path -Parent)
  $image.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function New-IconBitmap(
  [System.Drawing.Bitmap] $symbol,
  [int] $size,
  [bool] $includeBackground,
  [bool] $roundMask
) {
  $bitmap = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-Quality $graphics

  if ($includeBackground) {
    Draw-GradientBackground $graphics $size
  } else {
    $graphics.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
  }

  $symbolSize = if ($includeBackground) { 0.58 } else { 0.5 }
  Draw-Symbol $graphics $symbol $size $symbolSize 0 -0.03
  Draw-Badge $graphics $size '?'

  if ($roundMask) {
    $rounded = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $roundGraphics = [System.Drawing.Graphics]::FromImage($rounded)
    Set-Quality $roundGraphics
    $ellipsePath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $ellipsePath.AddEllipse(0, 0, $size, $size)
    $roundGraphics.SetClip($ellipsePath)
    $roundGraphics.DrawImage($bitmap, 0, 0, $size, $size)
    $ellipsePath.Dispose()
    $roundGraphics.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
    return $rounded
  }

  $graphics.Dispose()
  return $bitmap
}

if (-not (Test-Path $sourceSymbolPath)) {
  throw "Missing source symbol: $sourceSymbolPath"
}

Ensure-Directory $brandingDir
Ensure-Directory $storeAssetsDir

$rawSource = [System.Drawing.Bitmap]::FromFile($sourceSymbolPath)
$symbol = Remove-NearBlackBackground $rawSource
$rawSource.Dispose()

$appIcon = New-IconBitmap $symbol 1024 $true $false
$roundAppIcon = New-IconBitmap $symbol 1024 $true $true
$adaptiveForeground = New-IconBitmap $symbol 1024 $false $false
$playIcon = [System.Drawing.Bitmap]::new($appIcon, 512, 512)

Save-Png $appIcon (Join-Path $brandingDir 'app-icon.png')
Save-Png $adaptiveForeground (Join-Path $brandingDir 'adaptive-icon-foreground.png')
Save-Png $appIcon (Join-Path $storeAssetsDir 'app_store_icon_1024.png')
Save-Png $playIcon (Join-Path $storeAssetsDir 'play_store_icon_512.png')

$launcherSizes = @{
  'mipmap-mdpi' = 48
  'mipmap-hdpi' = 72
  'mipmap-xhdpi' = 96
  'mipmap-xxhdpi' = 144
  'mipmap-xxxhdpi' = 192
}

foreach ($entry in $launcherSizes.GetEnumerator()) {
  $folderPath = Join-Path $androidResDir $entry.Key
  Ensure-Directory $folderPath

  $launcherPath = Join-Path $folderPath 'ic_launcher.png'
  $roundLauncherPath = Join-Path $folderPath 'ic_launcher_round.png'
  $legacyLauncherPath = Join-Path $folderPath 'ic_launcher.webp'
  $legacyRoundLauncherPath = Join-Path $folderPath 'ic_launcher_round.webp'

  if (Test-Path $legacyLauncherPath) {
    Remove-Item $legacyLauncherPath -Force
  }
  if (Test-Path $legacyRoundLauncherPath) {
    Remove-Item $legacyRoundLauncherPath -Force
  }

  $launcherBitmap = [System.Drawing.Bitmap]::new($appIcon, $entry.Value, $entry.Value)
  $roundLauncherBitmap = [System.Drawing.Bitmap]::new($roundAppIcon, $entry.Value, $entry.Value)

  Save-Png $launcherBitmap $launcherPath
  Save-Png $roundLauncherBitmap $roundLauncherPath

  $launcherBitmap.Dispose()
  $roundLauncherBitmap.Dispose()
}

$playIcon.Dispose()
$adaptiveForeground.Dispose()
$roundAppIcon.Dispose()
$appIcon.Dispose()
$symbol.Dispose()

Write-Host 'Generated MedQuiz app icons.'
