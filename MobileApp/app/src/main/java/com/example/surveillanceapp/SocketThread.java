package com.example.surveillanceapp;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.media.Image;
import android.media.ImageReader;
import android.os.AsyncTask;
import android.util.Log;

import org.json.JSONObject;

import java.nio.ByteBuffer;
import java.util.ArrayList;

public class SocketThread extends AsyncTask<Void, Void, byte[]> {

    ImageReader imageReader;
    Yolov5TFLiteDetector yolov5TFLiteDetector;

    Paint boxPaint = new Paint();
    Paint textPain = new Paint();
    public SocketThread(ImageReader imageReader, Yolov5TFLiteDetector yolov5TFLiteDetector, Paint textPain, Paint boxPaint){
        this.imageReader = imageReader;
        this.yolov5TFLiteDetector = yolov5TFLiteDetector;
        this.textPain = textPain;
        this.boxPaint = boxPaint;
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
                    SocketStream.sendData("transfer", bytes);
                }
            });
            thread.start();

            // prediction
            Bitmap bitmap = Utils.byteToBitmap(bytes);
            ArrayList<Recognition> recognitions =  yolov5TFLiteDetector.detect(bitmap);

            ArrayList<JSONObject> predictions = new ArrayList<>();

            Bitmap mutableBitmap = bitmap.copy(Bitmap.Config.ARGB_8888, true);
            Canvas canvas = new Canvas(mutableBitmap);

            for(Recognition recognition: recognitions){
                JSONObject jsonObject = new JSONObject();
                if(recognition.getConfidence() > 0.4){

                    try {
                        jsonObject.put("label_name",recognition.getLabelName());
                        jsonObject.put("label_score",recognition.getLabelScore());
                        jsonObject.put("confidence",recognition.getConfidence());
                    }catch (Exception e){

                    }
                    predictions.add(jsonObject);

                    RectF location = recognition.getLocation();
                    canvas.drawRect(location, boxPaint);
                    canvas.drawText(recognition.getLabelName() + ":" + recognition.getConfidence(), location.left, location.top, textPain);

                }
            }



            Thread thread_prediction = new Thread(new Runnable() {
                @Override
                public void run() {
                    SocketStream.sendPrediction("object_detection", predictions);
                }
            });
            thread_prediction.start();



            image.close();
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