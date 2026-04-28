# Service Swap — Android Release Guide

This project is wrapped with **Capacitor** for distribution on the Google Play Store.

- **App name:** Service Swap
- **Package ID:** `org.serviceswap.app`
- **Live source:** https://serviceswap.org (loaded as a remote web app)
- **Capacitor config:** `capacitor.config.ts`
- **App icon source:** `resources/icon.png` (1024×1024)
- **Splash source:** `resources/splash.png` (1920×1920, cream `#f6e8e1` background)

> ⚠️ The Android project **must be generated and built on your own machine** — the
> Lovable sandbox cannot run Android Studio, the Android SDK, or `gradle bundleRelease`.
> Follow the steps below in order.

---

## 1. One-time local setup

Install on your computer:
- **Node.js 20+** and **npm** (or **bun**)
- **Java JDK 17** (required by Android Gradle Plugin 8.x)
- **Android Studio** (Hedgehog or newer) — open it once, then in
  *Settings → SDK Manager* install:
  - Android SDK Platform 34 (or later)
  - Android SDK Build-Tools
  - Android SDK Command-line Tools

Set environment variables (`~/.zshrc` / `~/.bashrc`):
```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"   # macOS default
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
export JAVA_HOME=$(/usr/libexec/java_home -v 17)  # macOS
```

---

## 2. Pull the repo & install

```bash
git clone <your-repo>
cd <your-repo>
npm install      # or: bun install
npm run build    # builds /dist (Capacitor needs this even with remote URL)
```

---

## 3. Add the Android platform

```bash
npx cap add android
npx cap sync android
```

This creates the `android/` folder. The `capacitor.config.ts` already contains:
- `appId: org.serviceswap.app`
- `appName: Service Swap`
- `server.url: https://serviceswap.org` → app loads the live site
- Splash screen plugin config (cream `#f6e8e1`, 1.5s, center-crop)

---

## 4. Generate icons + splash

```bash
npx capacitor-assets generate --android
```

This reads `resources/icon.png` and `resources/splash.png` and writes every
required Android density (mdpi → xxxhdpi), adaptive icons, and splash drawables.

---

## 5. Persistent login sessions

Already handled — three layers keep the user signed in across app restarts:

1. **Supabase client** (`src/integrations/supabase/client.ts`) is configured with
   `persistSession: true` and uses `localStorage`. Capacitor's WebView persists
   `localStorage` by default, so the auth token survives app kills.
2. **`@capacitor/preferences`** is installed for any future native-side storage.
3. **WebView cookies** are persisted (default Capacitor behaviour) so any
   server-set session cookies on `serviceswap.org` also survive.

No code changes needed — just verify a real device keeps you logged in after a
force-stop.

---

## 6. Optimised Android back button

Add the snippet below to `android/app/src/main/java/org/serviceswap/app/MainActivity.java`
*after* `npx cap add android` runs. It makes the hardware/gesture back button:
- Navigate back through web history first
- Exit the app only when there is no more history

```java
package org.serviceswap.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Let the WebView consume the back button when it has history
    bridge.getWebView().setOnKeyListener((v, keyCode, event) -> {
      if (keyCode == android.view.KeyEvent.KEYCODE_BACK
          && event.getAction() == android.view.KeyEvent.ACTION_UP) {
        if (bridge.getWebView().canGoBack()) {
          bridge.getWebView().goBack();
          return true;
        }
      }
      return false;
    });
  }
}
```

(Capacitor 8 already wires this up via the `App` plugin in most cases — the
override above guarantees correct behaviour on Android 13+ predictive-back.)

---

## 7. Generate a signing keystore (one-time)

```bash
keytool -genkey -v \
  -keystore ~/keystores/serviceswap-release.jks \
  -alias serviceswap \
  -keyalg RSA -keysize 2048 -validity 10000
```

Save the password somewhere safe (1Password, etc.). **Losing this key means you
can never update the app on Play Store.**

Create `android/key.properties` (gitignored):
```properties
storeFile=/absolute/path/to/serviceswap-release.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=serviceswap
keyPassword=YOUR_KEY_PASSWORD
```

In `android/app/build.gradle`, just above `android { ... }` add:
```gradle
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```
…and inside `android { … }`:
```gradle
signingConfigs {
    release {
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

---

## 8. Build the signed App Bundle (.aab)

```bash
cd android
./gradlew bundleRelease
```

Output:
```
android/app/build/outputs/bundle/release/app-release.aab
```

Upload this file to **Play Console → Release → Production → Create new release**.

---

## 9. Updating later

Whenever you change the web app or `capacitor.config.ts`:
```bash
npm run build
npx cap sync android
cd android && ./gradlew bundleRelease
```

Bump `versionCode` (integer) and `versionName` (string) in
`android/app/build.gradle` for every Play Store upload.
