package com.example.surveillanceapp;

import static androidx.core.content.ContextCompat.getMainExecutor;

import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.ImageFormat;
import android.graphics.Paint;
import android.graphics.SurfaceTexture;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraCaptureSession;
import android.hardware.camera2.CameraDevice;
import android.hardware.camera2.CameraManager;
import android.hardware.camera2.CameraMetadata;
import android.hardware.camera2.CaptureRequest;
import android.hardware.camera2.params.OutputConfiguration;
import android.hardware.camera2.params.SessionConfiguration;
import android.media.ImageReader;
import android.os.Build;
import android.text.TextPaint;
import android.util.Log;
import android.view.Surface;
import android.view.TextureView;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CameraHandler {

    private Context mContext;

    private TextureView textureView;
    private CameraCaptureSession myCameraCaptureSession;
    private String stringCameraID;
    private CameraManager cameraManager;
    private CameraDevice myCameraDevice;
    private CaptureRequest.Builder captureRequestBuilder;

    private ImageReader imageReader;

    Paint boxPain = new Paint();
    Paint textPain = new Paint();

    Yolov5TFLiteDetector yolov5TFLiteDetector;

    public CameraHandler(Context context, TextureView textureView, CameraManager cameraManager, Yolov5TFLiteDetector yolov5TFLiteDetector, Paint textPaint, Paint boxPaint){
        this.mContext = context;
        this.textureView = textureView;
        this.cameraManager = cameraManager;
        this.yolov5TFLiteDetector = yolov5TFLiteDetector;
        this.textPain = textPaint;
        this.boxPain = boxPaint;
    }

    public void startCamera() {
        try {
            stringCameraID = cameraManager.getCameraIdList()[0];

            if (ActivityCompat.checkSelfPermission(this.mContext, android.Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                // TODO: Consider calling
                //    ActivityCompat#requestPermissions
                // here to request the missing permissions, and then overriding
                //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                //                                          int[] grantResults)
                // to handle the case where the user grants the permission. See the documentation
                // for ActivityCompat#requestPermissions for more details.
                return;
            }
            cameraManager.openCamera(stringCameraID, stateCallback, null);

        } catch (CameraAccessException e) {
            throw new RuntimeException(e);
        }
    }

    private CameraDevice.StateCallback stateCallback = new CameraDevice.StateCallback() {
        @Override
        public void onOpened(@NonNull CameraDevice cameraDevice) {
            myCameraDevice = cameraDevice;
            createCameraPreview();

        }
        @Override
        public void onDisconnected(@NonNull CameraDevice cameraDevice) {
            myCameraDevice.close();
        }
        @Override
        public void onError(@NonNull CameraDevice cameraDevice, int i) {
            myCameraDevice.close();
            myCameraDevice = null;
        }
    };


    private void createCameraPreview() {
        try {
            SurfaceTexture surfaceTexture = textureView.getSurfaceTexture();
            int width = textureView.getWidth();
            int height = textureView.getHeight();


            surfaceTexture.setDefaultBufferSize(640, 360);
            Surface surface = new Surface(surfaceTexture);

            imageReader = ImageReader.newInstance(640, 360, ImageFormat.JPEG, 2);
            imageReader.setOnImageAvailableListener(onImageAvailableListener, null);
            Surface readerSurface = imageReader.getSurface();

            captureRequestBuilder = myCameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW);
            captureRequestBuilder.addTarget(surface);
            captureRequestBuilder.addTarget(readerSurface);
            //captureRequestBuilder.set(CaptureRequest.JPEG_ORIENTATION, 90);


            List<Surface> outputSurfaces = new ArrayList<>();
            outputSurfaces.add(surface);
            outputSurfaces.add(readerSurface);

            myCameraDevice.createCaptureSession(outputSurfaces,
                    new CameraCaptureSession.StateCallback() {
                        @Override
                        public void onConfigured(@NonNull CameraCaptureSession session) {
                            if (myCameraDevice == null) {
                                return;
                            }
                            myCameraCaptureSession = session;
                            try {
                                captureRequestBuilder.set(CaptureRequest.CONTROL_AF_MODE,
                                        CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_PICTURE);
                                myCameraCaptureSession.setRepeatingRequest(
                                        captureRequestBuilder.build(), null, null);
                            } catch (CameraAccessException e) {
                                e.printStackTrace();
                            }
                        }

                        @Override
                        public void onConfigureFailed(@NonNull CameraCaptureSession session) {
                            Log.e("camera", "Camera capture session configuration failed");
                        }
                    }, null);

        } catch (CameraAccessException e) {
            e.printStackTrace();
        }
    }

    private ImageReader.OnImageAvailableListener onImageAvailableListener =
            new ImageReader.OnImageAvailableListener() {
                @Override
                public void onImageAvailable(ImageReader reader) {
                    new SocketThread(imageReader, yolov5TFLiteDetector, textPain, boxPain).execute();
                }
            };



    public void btnStartCamera(){
        SurfaceTexture surfaceTexture = textureView.getSurfaceTexture();
        Surface surface = new Surface(surfaceTexture);
        try {
            captureRequestBuilder = myCameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW);
            captureRequestBuilder.addTarget(surface);
            OutputConfiguration outputConfiguration = new OutputConfiguration(surface);

            SessionConfiguration sessionConfiguration = null;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                sessionConfiguration = new SessionConfiguration(SessionConfiguration.SESSION_REGULAR,
                        Collections.singletonList(outputConfiguration),
                        getMainExecutor(mContext),
                        new CameraCaptureSession.StateCallback() {
                            @Override
                            public void onConfigured(@NonNull CameraCaptureSession cameraCaptureSession) {
                                myCameraCaptureSession = cameraCaptureSession;
                                captureRequestBuilder.set(CaptureRequest.CONTROL_AE_MODE,
                                        CameraMetadata.CONTROL_MODE_AUTO);
                                try {
                                    myCameraCaptureSession.setRepeatingRequest(captureRequestBuilder.build(), null, null);

                                } catch (CameraAccessException e) {
                                    throw new RuntimeException(e);
                                }
                            }
                            @Override
                            public void onConfigureFailed(@NonNull CameraCaptureSession cameraCaptureSession) {
                                myCameraCaptureSession = null;
                            }
                        }
                );
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                myCameraDevice.createCaptureSession(sessionConfiguration);
            }

        } catch (CameraAccessException e) {
            throw new RuntimeException(e);
        }
    }

    public void btnStopCamera(){
        try {
            myCameraCaptureSession.abortCaptures();
        } catch (CameraAccessException e) {
            throw new RuntimeException(e);
        }
    }
}
