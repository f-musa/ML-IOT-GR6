package com.example.surveillanceapp;

import static android.Manifest.permission.CAMERA;

import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Paint;
import android.hardware.camera2.CameraManager;
import android.os.Bundle;
import android.text.TextPaint;
import android.view.TextureView;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

public class CameraMLActivity extends AppCompatActivity{
    private CameraHandler cameraHandler;
    private TextureView textureView;
    private Button startBtn;
    private SocketStream socketStream;

    private CameraManager cameraManager;

    private  Yolov5TFLiteDetector yolov5TFLiteDetector;

    Paint boxPaint = new Paint();
    Paint textPain = new Paint();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_camera_ml);

        ActivityCompat.requestPermissions(this,
                new String[]{CAMERA},
                PackageManager.PERMISSION_GRANTED);
        textureView = findViewById(R.id.texture);
        cameraManager = (CameraManager) getSystemService(CAMERA_SERVICE);

        boxPaint.setStrokeWidth(5);
        boxPaint.setStyle(Paint.Style.STROKE);
        boxPaint.setColor(Color.RED);

        textPain.setTextSize(50);
        textPain.setColor(Color.GREEN);
        textPain.setStyle(Paint.Style.FILL);

        this.yolov5TFLiteDetector =  new Yolov5TFLiteDetector();
        yolov5TFLiteDetector.setModelFile("yolov5s-fp16.tflite");
        yolov5TFLiteDetector.initialModel(this);

        this.cameraHandler = new CameraHandler(getApplicationContext(), textureView, cameraManager, yolov5TFLiteDetector, textPain, boxPaint);
        this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);

       // SocketStream.connect(getApplicationContext());
        this.cameraHandler.startCamera();
    }


}