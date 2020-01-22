import React, {Component} from 'react';
import {View} from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import HomeScreen from './src/HomeScreen';
import PopupScreen from './src/PopupScreen';
import Payment  from './src/Payment';

export default class App extends Component {
    render() {
        return (
            <View style={{flex: 1}}>
                <AppContainer/>

            </View>
        )
    }
}

const AppNavigator = createStackNavigator(
    {
        Home: HomeScreen,
        Popup: PopupScreen,
        Payment: Payment
    },
    {
        initialRouteName: "Home",
        defaultNavigationOptions: {
            headerStyle: {
                backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        },
    }
);

const AppContainer = createAppContainer(AppNavigator);


/**
 FCM Test 방법
 Firebase Cloud Messaging에서 새알림으로 push 보낼 수 있음

 https://console.firebase.google.com/u/1/project/blocery-b7eef/notification

 ID : ezfarm2015@gmail.com
 PW : ezfarm3414

 */