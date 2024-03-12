package com.example.surveillanceapp;

import static android.Manifest.permission.CAMERA;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.hardware.camera2.CameraManager;
import android.os.Bundle;
import android.view.TextureView;
import android.view.View;
import android.widget.Button;

import org.json.JSONObject;

public class CameraActivity extends AppCompatActivity{
    private CameraHandler cameraHandler;
    private TextureView textureView;
    private Button startBtn;
    private SocketStream socketStream;

    private CameraManager cameraManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_camera);

        ActivityCompat.requestPermissions(this,
                new String[]{CAMERA},
                PackageManager.PERMISSION_GRANTED);
        textureView = findViewById(R.id.texture);
        cameraManager = (CameraManager) getSystemService(CAMERA_SERVICE);

        this.cameraHandler = new CameraHandler(getApplicationContext(), textureView, cameraManager);
        this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);

       // SocketStream.connect(getApplicationContext());
        this.cameraHandler.startCamera();
    }


}