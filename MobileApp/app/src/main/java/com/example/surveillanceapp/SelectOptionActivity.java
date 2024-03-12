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

    Button btn_camera_with_tensor;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_select_option);
        btn_camera_with_tensor = findViewById(R.id.btn_select_camera_with_tensor);

        //Intent intent = getIntent();
        //socketStream = new SocketStream(getApplicationContext(), SelectOptionActivity.this);

        Intent intent = new Intent(SelectOptionActivity.this, CameraMLActivity.class);
        startActivity(intent);

        btn_camera_with_tensor.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(SelectOptionActivity.this, CameraMLActivity.class);
                startActivity(intent);
            }
        });
    }

    @Override
    public void receiveData(JSONObject data) {

    }
}