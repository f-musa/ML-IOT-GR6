package com.example.surveillanceapp;


import android.content.Context;
import android.util.Log;

import org.json.JSONObject;

import java.net.URISyntaxException;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public  class SocketStream {
    public static Socket client_socket;
    public static SocketStreamListener mListener;

    public static String serverIpAdress;

    public static Context mContext;
    public static int port = 5000;

    public static void connect(Context context, SocketStreamListener listener) {
        mContext = context;
        serverIpAdress = Utils.getServerIpAddress(mContext);
        mListener = listener;
        try {
            String url = "http://" + serverIpAdress + ":" + port;
            //String url = "https://f514-2a09-bac1-27a0-48-00-214-2c.ngrok-free.app/";
            client_socket = IO.socket(url);
            client_socket.connect();
            Log.d("url", url);
            client_socket.on("from_server", ListenToServer);

            //this.client_socket.on(Socket.EVENT_CONNECT_ERROR, onConnectError);


        } catch (URISyntaxException e) {
            Log.e("error", e.toString());
            throw new RuntimeException(e);
        }
    }


    public static void sendData(String tag, byte[] data) {
        if (client_socket != null && client_socket.connected()) {
            try {
                client_socket.emit(tag, data);
                Log.d("Data Sent", "Message sent successfully");
            } catch (Exception e) {
                Log.d("Error sending data", "Failed to send data to the server");
            }
        } else {
            Log.d("Socket Error", "Socket is not connected");
        }
    }

    public static Emitter.Listener ListenToServer = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            JSONObject data = (JSONObject) args[1];
            mListener.receiveData(data);
        }
    };
}

