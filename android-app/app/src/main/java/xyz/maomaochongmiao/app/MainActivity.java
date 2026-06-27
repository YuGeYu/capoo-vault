package xyz.maomaochongmiao.app;

import android.annotation.SuppressLint;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.util.Locale;

/**
 * Lightweight WebView shell for the 猫猫虫仓库 site.
 *
 * Pure-framework implementation (no AndroidX / appcompat) to keep the APK tiny
 * and free of Google Play Services. All UI is built programmatically so no
 * layout XML is required.
 */
public class MainActivity extends android.app.Activity {

    /** Site host kept inside the WebView; everything else opens externally. */
    private static final String SITE_HOST = "maomaochongmiao.600318.xyz";
    private static final String HOME_URL =
            "https://maomaochongmiao.600318.xyz/?utm_source=android_app";

    private WebView webView;
    private FrameLayout rootLayout;
    private View errorView;
    private boolean loadFailed = false;

    // File chooser callback for <input type="file"> on the page.
    private ValueCallback<Uri[]> filePathCallback;
    private static final int REQUEST_FILE_CHOOSER = 1001;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        rootLayout = new FrameLayout(this);
        rootLayout.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));

        webView = new WebView(this);
        webView.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        rootLayout.addView(webView);

        configureWebView();
        setContentView(rootLayout);

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            String startUrl = HOME_URL;
            // Debug-only: allow loading an arbitrary URL for verification.
            // This branch is compiled out of release behavior (BuildConfig.DEBUG=false).
            if (BuildConfig.DEBUG) {
                String override = getIntent() != null
                        ? getIntent().getStringExtra("debug_url") : null;
                if (override != null && override.length() > 0) {
                    startUrl = override;
                }
            }
            webView.loadUrl(startUrl);
        }
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadsImagesAutomatically(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        // Allow mixed content disabled: site is HTTPS-only (usesCleartextTraffic=false).
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        }

        // Cookies (needed for login sessions).
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(webView, true);
        }

        // Release: never expose WebView contents debugging.
        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true);
        } else {
            WebView.setWebContentsDebuggingEnabled(false);
        }

        webView.setWebViewClient(new AppWebViewClient());
        webView.setWebChromeClient(new AppWebChromeClient());
        webView.setDownloadListener(new AppDownloadListener());
    }

    /** Navigation + error handling. */
    private class AppWebViewClient extends WebViewClient {

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return handleUrl(request.getUrl());
        }

        @SuppressWarnings("deprecation")
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return handleUrl(Uri.parse(url));
        }

        private boolean handleUrl(Uri uri) {
            if (uri == null) {
                return false;
            }
            String scheme = uri.getScheme();
            String host = uri.getHost();

            // Standard web pages: keep our site in-app, push everything else out.
            if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) {
                if (host != null && (host.equals(SITE_HOST) || host.endsWith("." + SITE_HOST))) {
                    return false; // load inside WebView
                }
                // Debug-only: keep the emulator loopback in-WebView so the
                // DownloadListener path can be exercised against a local server.
                if (BuildConfig.DEBUG && "10.0.2.2".equals(host)) {
                    return false;
                }
                openExternally(uri);
                return true;
            }

            // Non-http schemes (mqq:, tel:, mailto:, intent:, etc.) -> system handler.
            // QQ contact links must not be forced into the WebView.
            openExternally(uri);
            return true;
        }

        @Override
        public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
            loadFailed = false;
            super.onPageStarted(view, url, favicon);
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            // Only hide the error overlay if this load actually succeeded.
            if (!loadFailed) {
                hideErrorView();
            }
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            // Only treat main-frame failures as full-page errors.
            if (request != null && request.isForMainFrame()) {
                loadFailed = true;
                showErrorView();
            }
        }

        @SuppressWarnings("deprecation")
        @Override
        public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
            // Pre-API-23 fallback path.
            if (failingUrl != null && failingUrl.equals(view.getUrl())) {
                loadFailed = true;
                showErrorView();
            }
        }
    }

    /** Handles file chooser for site uploads (avatars, submissions). */
    private class AppWebChromeClient extends WebChromeClient {
        @Override
        public boolean onShowFileChooser(WebView webView,
                                         ValueCallback<Uri[]> callback,
                                         FileChooserParams params) {
            // Cancel any pending callback to avoid leaking a stuck chooser.
            if (filePathCallback != null) {
                filePathCallback.onReceiveValue(null);
            }
            filePathCallback = callback;

            Intent intent;
            try {
                intent = params.createIntent();
            } catch (Exception e) {
                intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*");
            }
            // Respect multi-select if the page allows it.
            if (params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) {
                intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
            }

            try {
                startActivityForResult(Intent.createChooser(intent, "选择文件"), REQUEST_FILE_CHOOSER);
            } catch (ActivityNotFoundException e) {
                filePathCallback = null;
                Toast.makeText(MainActivity.this, "未找到可用的文件选择器", Toast.LENGTH_LONG).show();
                return false;
            }
            return true;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQUEST_FILE_CHOOSER) {
            return;
        }
        if (filePathCallback == null) {
            return;
        }
        Uri[] results = null;
        if (resultCode == RESULT_OK && data != null) {
            results = parseFileChooserResult(data);
        }
        filePathCallback.onReceiveValue(results);
        filePathCallback = null;
    }

    private Uri[] parseFileChooserResult(Intent data) {
        // Multiple selection.
        if (data.getClipData() != null) {
            int count = data.getClipData().getItemCount();
            Uri[] uris = new Uri[count];
            for (int i = 0; i < count; i++) {
                uris[i] = data.getClipData().getItemAt(i).getUri();
            }
            return uris;
        }
        // Single selection.
        if (data.getData() != null) {
            return new Uri[]{data.getData()};
        }
        return null;
    }

    /** Routes site downloads through Android DownloadManager with cookies. */
    private class AppDownloadListener implements DownloadListener {
        @Override
        public void onDownloadStart(String url, String userAgent, String contentDisposition,
                                    String mimeType, long contentLength) {
            try {
                Uri uri = Uri.parse(url);
                if (uri.getScheme() == null
                        || !(uri.getScheme().equalsIgnoreCase("http")
                          || uri.getScheme().equalsIgnoreCase("https"))) {
                    // Non-http download (e.g. data: / blob:) -> let system try.
                    openExternally(uri);
                    return;
                }

                String fileName = URLUtil.guessFileName(url, contentDisposition, mimeType);

                DownloadManager.Request request = new DownloadManager.Request(uri);
                request.setMimeType(mimeType);
                request.addRequestHeader("User-Agent", userAgent);
                String cookie = CookieManager.getInstance().getCookie(url);
                if (cookie != null) {
                    request.addRequestHeader("Cookie", cookie);
                }
                request.setTitle(fileName);
                request.setDescription("猫猫虫仓库 下载中");
                request.setNotificationVisibility(
                        DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(
                        Environment.DIRECTORY_DOWNLOADS, fileName);
                request.allowScanningByMediaScanner();

                DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                if (dm == null) {
                    Toast.makeText(MainActivity.this, "下载服务不可用", Toast.LENGTH_LONG).show();
                    return;
                }
                dm.enqueue(request);
                Toast.makeText(MainActivity.this, "已开始下载：" + fileName, Toast.LENGTH_SHORT).show();
            } catch (SecurityException se) {
                Toast.makeText(MainActivity.this, "下载失败：缺少必要权限", Toast.LENGTH_LONG).show();
            } catch (Exception e) {
                Toast.makeText(MainActivity.this, "下载失败，请稍后重试", Toast.LENGTH_LONG).show();
            }
        }
    }

    private void openExternally(Uri uri) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "没有可以打开该链接的应用", Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            Toast.makeText(this, "无法打开链接", Toast.LENGTH_LONG).show();
        }
    }

    /** Builds (once) and shows a Chinese error overlay with a retry button. */
    private void showErrorView() {
        if (errorView == null) {
            LinearLayout layout = new LinearLayout(this);
            layout.setOrientation(LinearLayout.VERTICAL);
            layout.setGravity(Gravity.CENTER);
            layout.setBackgroundColor(Color.WHITE);
            int pad = dp(24);
            layout.setPadding(pad, pad, pad, pad);
            layout.setLayoutParams(new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT));

            TextView title = new TextView(this);
            title.setText("网络连接失败");
            title.setTextColor(Color.parseColor("#333333"));
            title.setTextSize(20);
            title.setGravity(Gravity.CENTER);

            TextView msg = new TextView(this);
            msg.setText("无法加载页面，请检查网络后重试。");
            msg.setTextColor(Color.parseColor("#888888"));
            msg.setTextSize(14);
            msg.setGravity(Gravity.CENTER);
            LinearLayout.LayoutParams msgParams = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT);
            msgParams.topMargin = dp(12);
            msg.setLayoutParams(msgParams);

            Button retry = new Button(this);
            retry.setText("重试");
            retry.setAllCaps(false);
            LinearLayout.LayoutParams btnParams = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT);
            btnParams.topMargin = dp(24);
            retry.setLayoutParams(btnParams);
            retry.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    loadFailed = false;
                    hideErrorView();
                    String current = webView.getUrl();
                    if (current != null && !current.startsWith("data:")) {
                        webView.reload();
                    } else {
                        webView.loadUrl(HOME_URL);
                    }
                }
            });

            layout.addView(title);
            layout.addView(msg);
            layout.addView(retry);
            errorView = layout;
            rootLayout.addView(errorView);
        }
        errorView.setVisibility(View.VISIBLE);
        errorView.bringToFront();
    }

    private void hideErrorView() {
        if (errorView != null) {
            errorView.setVisibility(View.GONE);
        }
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // Back key: navigate web history, else exit the app.
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            if (webView != null && webView.canGoBack()) {
                webView.goBack();
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.onPause();
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            CookieManager.getInstance().flush();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            rootLayout.removeView(webView);
            webView.removeAllViews();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
