# WebView app: keep JS interface members if any are added later.
# Framework-only app; default optimize rules are sufficient.

# Keep the Activity referenced by the manifest.
-keep class xyz.maomaochongmiao.app.MainActivity { *; }

# Standard WebView JS interface safety (no @JavascriptInterface used now,
# but keep the annotation contract robust if added later).
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
