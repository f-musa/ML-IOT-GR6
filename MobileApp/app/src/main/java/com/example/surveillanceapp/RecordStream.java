package com.example.surveillanceapp;

import android.media.MediaRecorder;
import android.os.AsyncTask;
import android.os.ParcelFileDescriptor;
import android.util.Log;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class RecordStream extends AsyncTask {

    MediaRecorder recorder;
    ByteArrayOutputStream byteArrayOutputStream;
    InputStream inputStream;

    @Override
    protected Object doInBackground(Object[] objects) {

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
            byte[] data = new byte[16384];

            while ((read = inputStream.read(data, 0, data.length)) != -1) {
                byteArrayOutputStream.write(data, 0, read);
                Log.d("audio recording", byteArrayOutputStream.toByteArray().toString());

            }

            byteArrayOutputStream.flush();

        } catch (IOException e) {
            throw new RuntimeException(e);
        }


        return null;
    }
}
