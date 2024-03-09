package com.example.surveillanceapp;

public class ConnectedUser {

    public static String user_id;
    public static String first_name;
    public static String last_name;
    public static String email;

    public static  String serverUrl;

    public  ConnectedUser(String userInfo){
        String[] userArray = userInfo.split(";");

        if (userArray.length > 0){
            user_id = userArray[0];
            first_name = userArray[1];
            last_name = userArray[2];
            email = userArray[3];
            serverUrl = userArray[4];
        }
    }

}
