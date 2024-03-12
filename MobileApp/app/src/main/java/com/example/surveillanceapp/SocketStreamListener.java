package com.example.surveillanceapp;

import org.json.JSONObject;

public interface SocketStreamListener {

    void receiveData(JSONObject data);

}
