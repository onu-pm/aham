package com.onupm.aham;

import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Android scales web text with the phone's font size setting. Very large settings
        // break Aham's layout, so follow the setting only up to 110%.
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebSettings settings = getBridge().getWebView().getSettings();
            settings.setTextZoom(Math.min(settings.getTextZoom(), 110));
        }
    }
}
