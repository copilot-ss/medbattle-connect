package com.sjigalin.medbattle

import android.app.Application
import android.content.Context
import android.content.res.Configuration

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.internal.featureflags.ReactNativeFeatureFlags
import com.facebook.react.internal.featureflags.ReactNativeFeatureFlagsAccessor
import com.facebook.react.internal.featureflags.ReactNativeFeatureFlagsLocalAccessor
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper
import kotlin.jvm.functions.Function0

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost by lazy {
    ReactNativeHostWrapper(
        this,
        object : DefaultReactNativeHost(this) {
          override fun getPackages(): List<ReactPackage> =
              PackageList(this).packages.apply {
                // Packages that cannot be autolinked yet can be added manually here, for example:
                // add(MyReactNativePackage())
              }

            override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        }
    )
  }

  override fun attachBaseContext(base: Context) {
    super.attachBaseContext(base)
    try {
      SoLoader.init(this, OpenSourceMergedSoMapping)
    } catch (_: Throwable) {
      SoLoader.init(this, false)
    }
  }

  override fun onCreate() {
    super.onCreate()
    initReactNativeFeatureFlags()
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      DefaultNewArchitectureEntryPoint.load()
    }
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }

  private fun initReactNativeFeatureFlags() {
    val provider = object : Function0<ReactNativeFeatureFlagsAccessor> {
      override fun invoke(): ReactNativeFeatureFlagsAccessor =
        ReactNativeFeatureFlagsLocalAccessor()
    }
    try {
      val methodNames = listOf(
        "setAccessorProvider\$ReactAndroid_debug",
        "setAccessorProvider\$ReactAndroid_release",
        "setAccessorProvider"
      )
      for (methodName in methodNames) {
        try {
          val method = ReactNativeFeatureFlags::class.java.getDeclaredMethod(
            methodName,
            Function0::class.java
          )
          method.isAccessible = true
          method.invoke(ReactNativeFeatureFlags, provider)
          return
        } catch (_: Throwable) {
          // Try the next method name.
        }
      }
    } catch (_: Throwable) {
      // If the internal API changes, fall back to default behavior.
    }
  }
}
