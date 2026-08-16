$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$sourceIconPath = Join-Path $projectRoot 'assets\branding\quiz-app-icon-source.png'
$brandingDir = Join-Path $projectRoot 'assets\branding'
$publicDir = Join-Path $projectRoot 'public'
$storeAssetsDir = Join-Path $projectRoot 'store_assets'
$androidResDir = Join-Path $projectRoot 'android\app\src\main\res'

function Ensure-Directory([string] $path) {
  if (-not (Test-Path -LiteralPath $path)) {
    New-Item -ItemType Directory -Path $path | Out-Null
  }
}

function Set-Quality([System.Drawing.Graphics] $graphics) {
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
}

function New-ResizedBitmap(
  [System.Drawing.Bitmap] $source,
  [int] $width,
  [int] $height
) {
  $bitmap = New-Object System.Drawing.Bitmap(
    $width,
    $height,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-Quality $graphics
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.DrawImage($source, 0, 0, $width, $height)
  $graphics.Dispose()
  return $bitmap
}

function New-ResizedOpaqueBitmap(
  [System.Drawing.Bitmap] $source,
  [int] $width,
  [int] $height
) {
  $bitmap = New-Object System.Drawing.Bitmap(
    $width,
    $height,
    [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
  )
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-Quality $graphics
  $graphics.Clear([System.Drawing.Color]::Black)
  $graphics.DrawImage($source, 0, 0, $width, $height)
  $graphics.Dispose()
  return $bitmap
}

function New-TransparentOuterBitmap([System.Drawing.Bitmap] $source) {
  $bitmap = New-ResizedBitmap $source $source.Width $source.Height

  for ($x = 0; $x -lt $bitmap.Width; $x++) {
    for ($y = 0; $y -lt $bitmap.Height; $y++) {
      $pixel = $bitmap.GetPixel($x, $y)
      $isOuterBlack =
        $pixel.R -le 18 -and
        $pixel.G -le 18 -and
        $pixel.B -le 18

      if ($isOuterBlack) {
        $bitmap.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
      }
    }
  }

  return $bitmap
}

function New-ContainedBitmap(
  [System.Drawing.Bitmap] $source,
  [int] $size,
  [float] $relativeSize
) {
  $bitmap = New-Object System.Drawing.Bitmap(
    $size,
    $size,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-Quality $graphics
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $imageSize = [int][Math]::Round($size * $relativeSize)
  $offset = [int][Math]::Round(($size - $imageSize) / 2)
  $graphics.DrawImage($source, $offset, $offset, $imageSize, $imageSize)
  $graphics.Dispose()
  return $bitmap
}

function New-CroppedContainedBitmap(
  [System.Drawing.Bitmap] $source,
  [System.Drawing.Rectangle] $sourceRect,
  [int] $size,
  [float] $relativeHeight
) {
  $bitmap = New-Object System.Drawing.Bitmap(
    $size,
    $size,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-Quality $graphics
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $targetHeight = [int][Math]::Round($size * $relativeHeight)
  $targetWidth = [int][Math]::Round(
    $targetHeight * $sourceRect.Width / $sourceRect.Height
  )
  $targetX = [int][Math]::Round(($size - $targetWidth) / 2)
  $targetY = [int][Math]::Round(($size - $targetHeight) / 2)
  $targetRect = [System.Drawing.Rectangle]::new(
    $targetX,
    $targetY,
    $targetWidth,
    $targetHeight
  )
  $graphics.DrawImage(
    $source,
    $targetRect,
    $sourceRect.X,
    $sourceRect.Y,
    $sourceRect.Width,
    $sourceRect.Height,
    [System.Drawing.GraphicsUnit]::Pixel
  )
  $graphics.Dispose()
  return $bitmap
}

function New-NotificationMask([System.Drawing.Bitmap] $source) {
  $bitmap = New-Object System.Drawing.Bitmap(
    $source.Width,
    $source.Height,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )

  for ($x = 0; $x -lt $source.Width; $x++) {
    for ($y = 0; $y -lt $source.Height; $y++) {
      $pixel = $source.GetPixel($x, $y)
      $insideQuestionArea =
        $x -ge [int]($source.Width * 0.28) -and
        $x -le [int]($source.Width * 0.72) -and
        $y -ge [int]($source.Height * 0.29) -and
        $y -le [int]($source.Height * 0.82)
      $isYellow =
        $pixel.R -ge 130 -and
        $pixel.G -ge 55 -and
        $pixel.B -le 150 -and
        $pixel.R -ge ($pixel.B + 60) -and
        $pixel.G -ge ($pixel.B + 15)

      if ($insideQuestionArea -and $isYellow) {
        $bitmap.SetPixel(
          $x,
          $y,
          [System.Drawing.Color]::FromArgb($pixel.A, 255, 255, 255)
        )
      }
    }
  }

  return $bitmap
}

function Set-WhiteMaskRgb([System.Drawing.Bitmap] $bitmap) {
  for ($x = 0; $x -lt $bitmap.Width; $x++) {
    for ($y = 0; $y -lt $bitmap.Height; $y++) {
      $pixel = $bitmap.GetPixel($x, $y)

      if ($pixel.A -gt 0) {
        $bitmap.SetPixel(
          $x,
          $y,
          [System.Drawing.Color]::FromArgb($pixel.A, 255, 255, 255)
        )
      }
    }
  }
}

function New-RoundBitmap([System.Drawing.Bitmap] $source, [int] $size) {
  $bitmap = New-Object System.Drawing.Bitmap(
    $size,
    $size,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-Quality $graphics
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $clipPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $clipPath.AddEllipse(0, 0, $size, $size)
  $graphics.SetClip($clipPath)
  $graphics.DrawImage($source, 0, 0, $size, $size)
  $clipPath.Dispose()
  $graphics.Dispose()
  return $bitmap
}

function Save-Png([System.Drawing.Image] $image, [string] $path) {
  Ensure-Directory (Split-Path $path -Parent)
  $image.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

if (-not (Test-Path -LiteralPath $sourceIconPath)) {
  throw "Missing source icon: $sourceIconPath"
}

Ensure-Directory $brandingDir
Ensure-Directory $publicDir
Ensure-Directory $storeAssetsDir

$sourceIcon = [System.Drawing.Bitmap]::FromFile($sourceIconPath)
$transparentIcon = New-TransparentOuterBitmap $sourceIcon
$appIcon = New-ResizedOpaqueBitmap $sourceIcon 1024 1024
$webIcon = New-ResizedOpaqueBitmap $sourceIcon 512 512
$adaptiveForeground = New-ContainedBitmap $transparentIcon 1024 0.66
$playStoreIcon = New-ResizedOpaqueBitmap $sourceIcon 512 512
$notificationMask = New-NotificationMask $sourceIcon
$notificationCrop = [System.Drawing.Rectangle]::new(140, 140, 235, 280)
$notificationIcon = New-CroppedContainedBitmap $notificationMask $notificationCrop 96 0.84
$adaptiveMonochrome = New-CroppedContainedBitmap $notificationMask $notificationCrop 1024 0.62
Set-WhiteMaskRgb $notificationIcon
Set-WhiteMaskRgb $adaptiveMonochrome

Save-Png $appIcon (Join-Path $brandingDir 'app-icon.png')
Save-Png $adaptiveForeground (Join-Path $brandingDir 'adaptive-icon-foreground.png')
Save-Png $adaptiveMonochrome (Join-Path $brandingDir 'adaptive-icon-monochrome.png')
Save-Png $transparentIcon (Join-Path $brandingDir 'splash-icon.png')
Save-Png $notificationIcon (Join-Path $brandingDir 'notification-icon.png')
Save-Png $adaptiveForeground (Join-Path $androidResDir 'drawable-nodpi\ic_launcher_foreground.png')
Save-Png $adaptiveMonochrome (Join-Path $androidResDir 'drawable-nodpi\ic_launcher_monochrome.png')
Save-Png $webIcon (Join-Path $publicDir 'quiz-app-icon.png')
Save-Png $playStoreIcon (Join-Path $storeAssetsDir 'play_store_icon_512.png')

$launcherSizes = @{
  'mipmap-mdpi' = 48
  'mipmap-hdpi' = 72
  'mipmap-xhdpi' = 96
  'mipmap-xxhdpi' = 144
  'mipmap-xxxhdpi' = 192
}

foreach ($entry in $launcherSizes.GetEnumerator()) {
  $folderPath = Join-Path $androidResDir $entry.Key
  $launcherPath = Join-Path $folderPath 'ic_launcher.png'
  $roundLauncherPath = Join-Path $folderPath 'ic_launcher_round.png'
  $launcherBitmap = New-ResizedBitmap $transparentIcon $entry.Value $entry.Value
  $roundLauncherBitmap = New-RoundBitmap $transparentIcon $entry.Value

  Save-Png $launcherBitmap $launcherPath
  Save-Png $roundLauncherBitmap $roundLauncherPath
  $launcherBitmap.Dispose()
  $roundLauncherBitmap.Dispose()
}

$notificationSizes = @{
  'drawable-mdpi' = 24
  'drawable-hdpi' = 36
  'drawable-xhdpi' = 48
  'drawable-xxhdpi' = 72
  'drawable-xxxhdpi' = 96
}

foreach ($entry in $notificationSizes.GetEnumerator()) {
  $folderPath = Join-Path $androidResDir $entry.Key
  $notificationPath = Join-Path $folderPath 'notification_icon.png'
  $notificationBitmap = New-ResizedBitmap $notificationIcon $entry.Value $entry.Value
  Set-WhiteMaskRgb $notificationBitmap

  Save-Png $notificationBitmap $notificationPath
  $notificationBitmap.Dispose()
}

$splashSizes = @{
  'drawable-mdpi' = 288
  'drawable-hdpi' = 432
  'drawable-xhdpi' = 576
  'drawable-xxhdpi' = 864
  'drawable-xxxhdpi' = 1152
}

foreach ($entry in $splashSizes.GetEnumerator()) {
  $folderPath = Join-Path $androidResDir $entry.Key
  $splashPath = Join-Path $folderPath 'splashscreen_logo.png'
  $splashBitmap = New-ContainedBitmap $transparentIcon $entry.Value 0.64

  Save-Png $splashBitmap $splashPath
  $splashBitmap.Dispose()
}

$playStoreIcon.Dispose()
$adaptiveMonochrome.Dispose()
$notificationIcon.Dispose()
$notificationMask.Dispose()
$adaptiveForeground.Dispose()
$webIcon.Dispose()
$appIcon.Dispose()
$transparentIcon.Dispose()
$sourceIcon.Dispose()

Write-Host 'Generated MedQuiz icons from the blue-purple quiz logo.'
