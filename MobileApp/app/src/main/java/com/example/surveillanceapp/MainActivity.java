package com.example.surveillanceapp;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.PowerManager;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity implements SocketStreamListener{
    Button btn_scan_qr_code;
    TextView textStatus,connect_help, user_id, full_name, email,status_title,label_connected_user;
    private PowerManager.WakeLock wakeLock;
    private Handler handler;
    private Runnable runnable;


    ImageView imageView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        textStatus = findViewById(R.id.text_status);
        textStatus.setTextColor(getColor(R.color.black));
        connect_help = findViewById(R.id.connect_help);
        label_connected_user = findViewById(R.id.label_connected_user);
        status_title = findViewById(R.id.status_title);

        //user
        user_id = findViewById(R.id.user_id);
        full_name = findViewById(R.id.full_name);
        email = findViewById(R.id.email);


        btn_scan_qr_code = findViewById(R.id.btn_scan);
        imageView = findViewById(R.id.imageView);


        // bloquer la mise en veille de l'application:
        PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
        if (powerManager != null) {
            // Obtenez un verrou de veille pour maintenir l'écran allumé
            wakeLock = powerManager.newWakeLock(PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP, "MyApp::MyWakelockTag");
            wakeLock.acquire();
        }



        btn_scan_qr_code.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {


                IntentIntegrator intentIntegrator = new IntentIntegrator(MainActivity.this);
                intentIntegrator.setCaptureActivity(AnyOrientationCaptureActivity.class);
                intentIntegrator.setOrientationLocked(false);
                intentIntegrator.setPrompt("Scanner le QR Code");
                intentIntegrator.setDesiredBarcodeFormats(IntentIntegrator.QR_CODE);
                intentIntegrator.initiateScan();
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {

        IntentResult intentResult = IntentIntegrator.parseActivityResult(requestCode,resultCode,data);
        if(intentResult != null){
            String contents = intentResult.getContents();
            if(contents != null){
                new ConnectedUser(contents);
                SocketStream.connect(getApplicationContext(), MainActivity.this);





                //Intent intent = new Intent(MainActivity.this, SelectOptionActivity.class);
                //startActivity(intent);
            }
        }else{
            super.onActivityResult(requestCode, resultCode, data);
        }
    }


    @Override
    public void receiveData(JSONObject data){

        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    String code = data.getString("code");
                    String message = data.getString("message");

                    switch (code){
                        case "connection_successful":
                            // go to next Activity and choose option



                            Utils.isConnectedToServer = true;
                            textStatus.setText("Status: Téléphone connecté à l'ordinateur");
                            textStatus.setTextColor(getColor(R.color.green));
                            connect_help.setVisibility(View.GONE);

                            //imageView.setImageResource(R.drawable.user_connected);

                            btn_scan_qr_code.setEnabled(false);
                            label_connected_user.setVisibility(View.VISIBLE);
                            user_id.setText("ID: "+ ConnectedUser.user_id);
                            user_id.setVisibility(View.VISIBLE);
                            full_name.setText("Prénom et nom: "+ ConnectedUser.first_name + " " + ConnectedUser.last_name);
                            full_name.setVisibility(View.VISIBLE);
                            email.setText("Email: "+ ConnectedUser.email);
                            email.setVisibility(View.VISIBLE);

                            break;
                        case "disconnected":
                            Utils.isConnectedToServer = false;
                            textStatus.setText("Status: Téléphone déconnecté ");
                            textStatus.setTextColor(getColor(R.color.red));
                            btn_scan_qr_code.setEnabled(true);

                            if(ConnectedUser.serverUrl != null){
                                // tentative de reconnexion
                                 handler = new Handler();
                                runnable = new Runnable() {
                                    @Override
                                    public void run() {
                                        try {
                                            SocketStream.connect(getApplicationContext(), MainActivity.this);

                                            if (Utils.isConnectedToServer) {
                                                // La connexion est établie, vous pouvez arrêter le Handler
                                                handler.removeCallbacks(this);
                                                Toast.makeText(MainActivity.this, "Connexion rétablie.", Toast.LENGTH_SHORT).show();

                                            } else {
                                                // La connexion n'est pas encore établie, planifiez une nouvelle tentative
                                                Toast.makeText(MainActivity.this, "Tentative de reconnexion dans 15 secondes...", Toast.LENGTH_SHORT).show();
                                                handler.postDelayed(this, 15000);
                                            }
                                        } catch (Exception e) {
                                            // Gérer les exceptions ici
                                        }
                                    }
                                };

                                handler.post(runnable);
                            }
                            break;

                        case "open_camera":
                            Toast.makeText(MainActivity.this, "Open camera", Toast.LENGTH_SHORT).show();

                            Intent intent = new Intent(MainActivity.this, SelectOptionActivity.class);
                            startActivity(intent);
                            break;
                    }

                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
                Log.d("tester: ", data.toString());
            }
        });

    }


    protected void onDestroy() {
        super.onDestroy();
        // Assurez-vous de relâcher le verrou de veille lorsque votre activité est détruite
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
    }
}