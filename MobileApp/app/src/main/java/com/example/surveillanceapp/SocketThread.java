package com.example.surveillanceapp;

import android.media.Image;
import android.media.ImageReader;
import android.os.AsyncTask;
import android.util.Log;

import java.nio.ByteBuffer;

public class SocketThread extends AsyncTask<Void, Void, byte[]> {

    ImageReader imageReader;
    public SocketThread(ImageReader imageReader){
        this.imageReader = imageReader;
    }
    @Override
    protected byte[] doInBackground(Void... voids) {
        // Capturer l'image et la convertir en bytes
        Image image = imageReader.acquireLatestImage();
        if (image != null) {
            ByteBuffer buffer = image.getPlanes()[0].getBuffer();
            byte[] bytes = new byte[buffer.remaining()];
            buffer.get(bytes);
            Thread thread = new Thread(new Runnable() {
                @Override
                public void run() {
                    SocketStream.sendData(bytes);
                }
            });
            thread.start();
            image.close();
            Log.d("video bytes", bytes.toString());
            return bytes;
        }
        return null;
    }

    @Override
    protected void onPostExecute(byte[] bytes) {
        // Ajouter les bytes capturés à la liste
        //if (bytes != null) {
        // videoBytesList.add(bytes);
        //}
    }
}