package com.sjigalin.medbattle

import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.IntentSender
import android.net.Uri
import android.os.Build
import android.os.Bundle

import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

import com.google.android.play.core.appupdate.AppUpdateInfo
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.appupdate.AppUpdateManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.UpdateAvailability
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  private val appUpdateManager: AppUpdateManager by lazy {
    AppUpdateManagerFactory.create(this)
  }

  private val updateFlowLauncher = registerForActivityResult(
    ActivityResultContracts.StartIntentSenderForResult()
  ) { result ->
    if (result.resultCode != RESULT_OK) {
      redirectToPlayStoreForMandatoryUpdate()
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    super.onCreate(null)
    applyImmersiveMode()
    maybeStartMandatoryStoreUpdate()
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
  }

  override fun onResume() {
    super.onResume()
    applyImmersiveMode()
    resumeMandatoryStoreUpdateIfNeeded()
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) {
      applyImmersiveMode()
    }
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }

  private fun maybeStartMandatoryStoreUpdate() {
    if (BuildConfig.DEBUG) {
      return
    }

    appUpdateManager
      .appUpdateInfo
      .addOnSuccessListener { appUpdateInfo ->
        if (
          appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE &&
          appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)
        ) {
          startImmediateUpdate(appUpdateInfo)
        } else if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE) {
          redirectToPlayStoreForMandatoryUpdate()
        }
      }
      .addOnFailureListener {
        // Ignore non-Play installs or transient Play Core lookup errors.
      }
  }

  private fun resumeMandatoryStoreUpdateIfNeeded() {
    if (BuildConfig.DEBUG) {
      return
    }

    appUpdateManager
      .appUpdateInfo
      .addOnSuccessListener { appUpdateInfo ->
        if (
          appUpdateInfo.updateAvailability() ==
            UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS
        ) {
          startImmediateUpdate(appUpdateInfo)
        }
      }
      .addOnFailureListener {
        // Ignore non-Play installs or transient Play Core lookup errors.
      }
  }

  private fun startImmediateUpdate(appUpdateInfo: AppUpdateInfo) {
    try {
      appUpdateManager.startUpdateFlowForResult(
        appUpdateInfo,
        updateFlowLauncher,
        AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE).build()
      )
    } catch (_: IntentSender.SendIntentException) {
      redirectToPlayStoreForMandatoryUpdate()
    }
  }

  private fun redirectToPlayStoreForMandatoryUpdate() {
    val marketIntent = Intent(
      Intent.ACTION_VIEW,
      Uri.parse("market://details?id=$packageName")
    ).apply {
      setPackage("com.android.vending")
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }

    val webIntent = Intent(
      Intent.ACTION_VIEW,
      Uri.parse("https://play.google.com/store/apps/details?id=$packageName")
    ).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }

    try {
      startActivity(marketIntent)
    } catch (_: ActivityNotFoundException) {
      try {
        startActivity(webIntent)
      } catch (_: Throwable) {
      }
    } finally {
      finishAffinity()
    }
  }

  private fun applyImmersiveMode() {
    WindowCompat.setDecorFitsSystemWindows(window, true)
    WindowInsetsControllerCompat(window, window.decorView).run {
      systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
      hide(WindowInsetsCompat.Type.systemBars())
    }
  }
}
