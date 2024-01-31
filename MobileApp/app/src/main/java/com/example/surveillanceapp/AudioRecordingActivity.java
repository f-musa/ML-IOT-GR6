package com.example.surveillanceapp;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;

import androidx.core.app.ActivityCompat;

import android.Manifest;
import android.content.pm.PackageManager;
import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioRecord;
import android.media.AudioTrack;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.os.ParcelFileDescriptor;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class AudioRecordingActivity extends AppCompatActivity {

    private TextView textViewStatus;

    private AudioRecord audioRecord;

    private int intBufferSize;
    private short[] shortAudioData;

    private int intGain = 20;
    private Boolean isActive = false;

    private Thread thread;


    private Button btn_start;

    MediaRecorder recorder;
    ByteArrayOutputStream byteArrayOutputStream;
    InputStream inputStream;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_audio_recording);

        ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, PackageManager.PERMISSION_GRANTED);

        textViewStatus = findViewById(R.id.textViewStatus);
        btn_start = findViewById(R.id.button_start);

    }


    // Start recording method


    public void buttonStart(View view) {

        if (isActive.equals(false)){
            isActive = true;
            textViewStatus.setText("Enregistrement en cours...");
            btn_start.setText("Arrêter");
            btn_start.setBackgroundColor(getColor(R.color.red));

            thread = new Thread(new Runnable() {
                @Override
                public void run() {
                    threadLoop();
                }
            });

            thread.start();
            //startRecording();

        }else {
            isActive = false;
            //audioRecord.stop();
            //stopRecording();
            recorder.stop();
            recorder.reset();
            recorder.release();
            textViewStatus.setText("Enregistrement arrêté");
            btn_start.setText("Démarrer");
            btn_start.setBackgroundColor(getColor(R.color.black));

        }

    }

    public void buttonStop(View view) {


    }

    private void threadLoop() {

        byteArrayOutputStream = new ByteArrayOutputStream();

        ParcelFileDescriptor[] descriptors = new ParcelFileDescriptor[0];
        try {
            descriptors = ParcelFileDescriptor.createPipe();
            ParcelFileDescriptor parcelRead = new ParcelFileDescriptor(descriptors[0]);
            ParcelFileDescriptor parcelWrite = new ParcelFileDescriptor(descriptors[1]);

            inputStream = new ParcelFileDescriptor.AutoCloseInputStream(parcelRead);

            recorder = new MediaRecorder();
            recorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            recorder.setOutputFormat(MediaRecorder.OutputFormat.AMR_NB);
            recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB);
            recorder.setOutputFile(parcelWrite.getFileDescriptor());
            recorder.prepare();

            recorder.start();


            int read;
            byte[] data = new byte[163];

            while ((read = inputStream.read(data, 0, data.length)) != -1 && isActive) {
                byteArrayOutputStream.write(data, 0, read);
                SocketStream.sendData("transfer_audio", byteArrayOutputStream.toByteArray());

            }


            byteArrayOutputStream.flush();


        } catch (IOException e) {
            throw new RuntimeException(e);
        }


    }
}