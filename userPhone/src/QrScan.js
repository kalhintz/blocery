import React from 'react';
import { Text, TouchableOpacity, View, Platform, BackHandler } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

export default class QrScan extends React.Component {

    static navigationOptions = {
        title: 'QRCode',
        header: null
    };

    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        if (Platform.OS === 'android') {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.onAndroidBackPress);
        }
    }

    onAndroidBackPress = () => {
        this.props.navigation.goBack();
        return true;
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            this.backHandler.remove();// removeEventListener('hardwareBackPress');
        }
    }

    onSuccess = e => {
        // console.log(e.data);
        this.props.navigation.goBack();
        this.props.navigation.state.params.onQrScanResult({ accountFromPhone : e.data })
    };

    render() {
        return (
            <View style={{flex: 1}}>

            <QRCodeScanner
                onRead={this.onSuccess}
                flashMode={RNCamera.Constants.FlashMode.off}
                topContent={
                    <Text>
                        Scan the Account
                    </Text>
                }

                bottomContent={
                    <TouchableOpacity>
                        {/*<Text> OK. Got it! </Text>*/}
                    </TouchableOpacity>
                }
            />
            </View>
        );
    }
}