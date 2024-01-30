package com.example.surveillanceapp;

import androidx.appcompat.app.AppCompatActivity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity implements SocketStreamListener{
    Button btn_connect;
    private TextView textStatus;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        textStatus = findViewById(R.id.text_status);
        textStatus.setTextColor(getColor(R.color.black));

        btn_connect = findViewById(R.id.btn_connect);
        btn_connect.setEnabled(false);
        SocketStream.connect(getApplicationContext(), MainActivity.this);


        btn_connect.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                Intent intent = new Intent(MainActivity.this, SelectOptionActivity.class);
                startActivity(intent);
            }
        });
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
                            textStatus.setText("Status: Serveur connecté");
                            textStatus.setTextColor(getColor(R.color.green));
                            btn_connect.setEnabled(true);
                            break;
                        case "disconnected":
                            Utils.isConnectedToServer = true;
                            textStatus.setText("Status: Serveur déconnecté");
                            textStatus.setTextColor(getColor(R.color.red));
                            btn_connect.setEnabled(false);
                            break;
                    }

                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
                Log.d("tester: ", data.toString());
            }
        });

    }
}