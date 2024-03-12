package com.example.surveillanceapp;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.DhcpInfo;
import android.net.wifi.WifiManager;
import android.text.format.Formatter;


public class Utils {

    public static Boolean isConnectedToServer = false;

    public static String getServerIpAddress(Context context){
        WifiManager wm = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
        DhcpInfo dhcpInfo = wm.getDhcpInfo();
        String gatewayIp = Formatter.formatIpAddress(dhcpInfo.gateway);
        return gatewayIp;
    }

    public static Bitmap byteToBitmap(byte[] b) {
        return (b == null || b.length == 0) ? null : BitmapFactory
                .decodeByteArray(b, 0, b.length);
    }
}
