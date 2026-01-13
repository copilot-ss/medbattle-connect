# STORE_ASSETS.md - MedBattle Store Assets

## Play Store (Android)
Required:
- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG/JPG
- Screenshots: 2-8 (min 320px, max 3840px, portrait ok)

Current:
- store_assets/play_store_icon_512.png (512x512)
- store_assets/play_store_feature_graphic_1024x500.png (1024x500)
- store_assets/play_store_screenshot_1.png (1080x2400)
- Native launcher icons: android/app/src/main/res/mipmap-*

Missing:
- Additional screenshots

## Capture guide
Android (adb):
- `adb shell screencap -p /sdcard/medbattle_01.png`
- `adb pull /sdcard/medbattle_01.png store_assets/play_store_screenshot_2.png`

Notes:
- Use real in-app screens for final submission.
- Android-only release: iOS assets are not required.

## Notes
- Store icons are generated from `assets/icons_profile/caduceus_1839855.png`.
- Replace with final brand assets if needed.
- `store_assets/app_store_icon_1024.png` is optional and currently unused.
