# Release signing (one-time setup)

Google Play requires every upload to be signed with your **upload key**. You create it once and keep it safe. Google then re-signs the app for users (Play App Signing), so if this key is ever lost you can ask Google to reset it, but that takes time. Back it up.

## 1. Create the key

In Terminal:

```bash
cd ~/Downloads/Aham_app/android
"/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/keytool" -genkeypair -v -keystore aham-upload.jks -alias aham -keyalg RSA -keysize 2048 -validity 10000
```

It asks for:
- a **keystore password** (choose a strong one and save it in a password manager)
- your name, organisation and country (any reasonable values are fine)
- a **key password**: press Enter to reuse the keystore password

This creates `android/aham-upload.jks`. It is excluded from git, so it never goes to GitHub.

## 2. Tell the build where it is

Create `android/keystore.properties` (also excluded from git) with:

```
storeFile=aham-upload.jks
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=aham
keyPassword=YOUR_KEY_PASSWORD
```

## 3. Back it up

Copy `aham-upload.jks` and both passwords somewhere safe outside this Mac (a password manager that stores files, or an encrypted drive). Without them you can't publish updates until Google resets the key.

## 4. Build the file to upload

```bash
cd ~/Downloads/Aham_app && npm run android:sync
cd android && JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew bundleRelease
```

The upload file is `android/app/build/outputs/bundle/release/app-release.aab`.

Before each new upload, raise `versionCode` (and usually `versionName`) in `android/app/build.gradle`. Play rejects a versionCode it has already seen.
