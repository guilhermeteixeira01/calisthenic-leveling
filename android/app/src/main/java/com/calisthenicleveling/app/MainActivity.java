package com.calisthenicleveling.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {

    @Override
    public void onResume() {
        super.onResume();

        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            webView.clearCache(true);
            webView.clearHistory();
        }
    }
}
