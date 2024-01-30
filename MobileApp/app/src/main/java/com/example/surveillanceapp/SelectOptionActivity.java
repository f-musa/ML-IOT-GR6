package com.example.surveillanceapp;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import org.json.JSONObject;

public class SelectOptionActivity extends AppCompatActivity implements SocketStreamListener{

    SocketStream socketStream;
    Button btn_camera;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_select_option);
        btn_camera = findViewById(R.id.btn_select_camera);

        //Intent intent = getIntent();
        //socketStream = new SocketStream(getApplicationContext(), SelectOptionActivity.this);

        btn_camera.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent openCameraActivity = new Intent(SelectOptionActivity.this, CameraActivity.class);
                startActivity(openCameraActivity);
            }
        });
    }

    @Override
    public void receiveData(JSONObject data) {

    }
}