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

