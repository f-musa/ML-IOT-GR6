package com.example.surveillanceapp;


import android.content.Context;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;
import java.util.ArrayList;

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
        mListener = listener;
        try {
            String url = ConnectedUser.serverUrl;
            if (url == null){
                serverIpAdress = Utils.getServerIpAddress(mContext);
                url = "http://" + serverIpAdress + ":" + port;
            }
            client_socket = IO.socket(url);
            client_socket.connect();
            client_socket.emit("whoiam", "MOBILE");

            client_socket.on("from_server", ListenToServer);

            client_socket.on("disconnect", onConnectError);


        } catch (Exception e) {
            Log.e("ERROR_SERVER_****", e.toString());
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

    public static void sendMessage(String tag, String message) {
        if (client_socket != null && client_socket.connected()) {
            try {
                client_socket.emit(tag, message);
                Log.d("Data Sent", "Message sent successfully");
            } catch (Exception e) {
                Log.d("Error sending data", "Failed to send data to the server");
            }
        } else {
            Log.d("Socket Error", "Socket is not connected");
        }
    }

    public static  void sendPrediction(String tag, ArrayList<JSONObject> predictions){
        try {
            client_socket.emit(tag, predictions);
            Log.d("prediction send", "predictions send");
        } catch (Exception e) {
            Log.d("Error sending data", "Failed to send data to the server");
        }
    }

    public static Emitter.Listener ListenToServer = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            JSONObject data = (JSONObject) args[0];
            mListener.receiveData(data);
        }
    };

    public static Emitter.Listener onConnectError = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            Log.d("Socket Error", "Socket is not connected");
            JSONObject data = new JSONObject();

            try {
                data.put("code", "disconnected");
                data.put("message", "The server is disconnected");
            } catch (JSONException e) {
                e.printStackTrace();
            }

            mListener.receiveData(data);
        }
    };
}

