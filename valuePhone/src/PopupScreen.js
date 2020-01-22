import React  from 'react';
import { View, Text, Button, SafeAreaView, BackHandler, Platform } from 'react-native';
import { Server } from './Properties';
import WebView from 'react-native-webview';
import DeviceInfo from 'react-native-device-info';
import ComUtil from "./ComUtil";
import queryString from 'query-string';


export default class PopupScreen extends React.Component {

    static navigationOptions = {
        title: '', //ios 결제시에 노출됨. '결제'로 설정해도 됨.
        header: null
    };

    webView = {
        canGoBack: false,
        ref: null
    };

    constructor(props) {
        super(props);

        //console.log('PopupScreen url : ' + this.props.navigation.getParam('url', 'default url'));
        //console.log('############## popup constructor:' + this);
        this.state = {
            url: this.props.navigation.getParam('url', 'default url'),
            key: 0
        };
    }

    componentWillMount() {
        // console.log('Popup componentWillMount()');
        if (Platform.OS === 'android') {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.onAndroidBackPress);
        }
    }
    componentWillUnmount() {

        if (Platform.OS === 'android') {
            this.backHandler.remove();// removeEventListener('hardwareBackPress');
        }
    }


    //iamport의 exampleForWebView useEffect 효과를 componentDidMount, componentDidUpdate에서 동시구현 하다가 onPayResult callback으로 대체.
    //참고  https://github.com/iamport/iamport-react-native/blob/master/exampleForWebView/src/Home.js
    componentDidMount() {
        console.log('PopupScreen - component Did MMount')
    }

    componentDidUpdate() {
        console.log('PopupScreen - componentDidUpdate:');
    }

    doIamportUpdate = async (type, response) => {
        //let type =  this.props.navigation.getParam('type');
        //let response = this.props.navigation.getParam('response');

        console.log('-----> DoImportUpdate:', type, response); //undefined ERROR
        //let response = this.state.response;

        if (response) {

            const query = queryString.stringify(response);
            console.log('query', query);

            //결제 후 buyFinish로 이동. buyFinish?imp_uid=&imp_success=true&merchant_uid='+this.state.orderNo+'&error_msg='+''
            let newUrl = Server.getServerURL() + '/b2b/buyFinish?' + query;
            //alert(newUrl);

            this.setState({
                url:newUrl
            });
        }
    }

    doIamportUpdateCerti = async (type, response) => {
        //let type =  this.props.navigation.getParam('type');
        //let response = this.props.navigation.getParam('response');

        console.log('-----> DoImportUpdate:', type, response); //undefined ERROR
        //let response = this.state.response;

        if (response) {

            const query = queryString.stringify(response);
            console.log('query', query);

            //인증 후 xxFinish로 이동. buyFinish?imp_uid=&imp_success=true&merchant_uid='+this.state.orderNo+'&error_msg='+''
            //let newUrl = Server.getServerURL() + '/certiFinish?' + query; //frontEnd 경유 방식.(컴포넌트 없는 상태)
            let newUrl = Server.getServerURL() + '/iamport/certification?' + query;  //백엔드 직접가는 방식. - 미테스트.(백엔드 파라미터 받는방식 수정필요)
            //alert(newUrl);

            this.setState({
                url:newUrl
            });
        }
    }
    //IamPort 결제완료 후에 호출되는 함수.
    onPayResult = (data) => {
        const { type, response } = JSON.parse(data)

        console.log('-----> onPayResult:'); //undefined ERROR
        this.doIamportUpdate(type, response);

    }

    //IamPort 결제완료 후에 호출되는 함수.
    onCertificationResult = (data) => {
        const { type, response } = JSON.parse(data)

        console.log('-----> onCertificationResult:'); //undefined ERROR
        this.doIamportUpdateCerti(type, response);

    }

    onAndroidBackPress = () => {

        console.log('###################### Popup: onAndroidBackPress:');
        this.props.navigation.goBack(); //popup안에서 back으로만 이동.
        this.props.navigation.state.params.onPopupClose(JSON.stringify({})); //부모(Home or Popup) callback

        return true;
        // if (this.webView.canGoBack && this.webView.ref) {
        //     this.webView.ref.goBack();
        //     return true;
        // }
        // return false;
    };

    onMessage = (event) => {
        console.log('###################### PopupScreen : ');//event.nativeEvent.data)

        const { url, type, param } = JSON.parse(event.nativeEvent.data)

        console.log(JSON.parse(event.nativeEvent.data))

        if(type === 'UPDATE_FCMTOKEN'){
            ComUtil.checkPermission({...param})
            return;
        }

        //Iamport 결제호출되는 경우
        if (type ==='payment') {
            const { userCode, data, type } = JSON.parse(event.nativeEvent.data);
            console.log('###################### PopupScreen : Payment',  data);
            const params = { userCode, data, onPayResult:this.onPayResult };

            //this.props.navigation.push('Payment', params);
            this.props.navigation.navigate('Payment', params);

            return;
        }
        //Iamport 본인인증 호출되는 경우 - 19.11.12 현재 미테스트:코드만 추가
        if (type ==='certification') {
            const { userCode, data, type } = JSON.parse(event.nativeEvent.data);
            console.log('###################### PopupScreen : Certification',  data);
            const params = { userCode, data, onCertificationResult:this.onCertificationResult };

            this.props.navigation.navigate('Certification', params);  //Certification은 추가 - iamport의 exampleForWebView의 Home.js 참고

            return;
        }

        if(type === 'NEW_POPUP') {

            //this.popupDepth += 1;
            //alert('NEW_POPUP on POPUP'+ PopupScreen.popupDepth);

            this.props.navigation.push('Popup', {
                url: Server.getServerURL() + url,
                onPopupClose: this.parentPopupRefresh
            })

        } else if (type === 'JUST_POPUP') {

            this.props.navigation.push('Popup', {
                url: Server.getServerURL() + url,
                onPopupClose: this.popupClosed //no refresh
            });

        }else if(type === 'CLOSE_POPUP'){

            console.log('###################### Popup: CLOSE_POPUP:');
            this.props.navigation.goBack(); //popup닫기.
            this.props.navigation.state.params.onPopupClose(event.nativeEvent.data); //parentPopupRefresh or HomeScreen의 popupCloseAndRefresh

        } else { //APP_LOG
            console.log(url); //url에 변수를 넣어서 찍기
        }
    }

    popupClosed = (data) => {

        const { url, param } = JSON.parse(data)
        console.log('#######################HomeScreen : just popupClosed -' + url);

        //페이지 Redirection : ClosePopupAndMovePage : 발생안할 것으로 예상.
        if (url) { //URL refresh
            const uri = {uri: Server.getServerURL() + url}
            this.setState({
                key: this.getNewKey(),  //새로고침을 위해
                source: uri
            })
        }
    }
    // . string으로 넘어옴
    parentPopupRefresh = (data) => {
        console.log('PopupScreen parentPopupRefresh : ');
        //callback 미사용 : this.webView.ref.postMessage(data);
        this.setState({key: this.state.key + 1});

        //popup2개일 경우 한번 더  닫고, home의 url 변경
        const { url, type, param } = JSON.parse(data);
        if (url) {
            this.props.navigation.goBack(); //마지막 popup닫기
            if (this.props.navigation.state.params && this.props.navigation.state.params.onPopupClose) {//만약을 대비
                this.props.navigation.state.params.onPopupClose(data); //부모 callback - HomeScreen의 popupCloseAndRefresh 호출..
            }
        }
    }

    async _listenForNotifications(){
        // onNotificationDisplayed - ios only

        this.notificationListener = firebase.notifications().onNotification((notification) => {
            console.log('onNotification', notification);
        });

        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            console.log('onNotificationOpened', notificationOpen);
        });

        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            console.log('getInitialNotification', notificationOpen);
        }
    }

    render() {

        return (
            <View style={{flex: 1}}>
                {Platform.select({
                    android: () => <WebView
                        userAgent = {'BloceryApp-Android:'+ DeviceInfo.getUserAgent()}
                        source={{uri: this.state.url}}
                        key={this.state.key}
                        ref={(webView) => {
                            this.webView.ref = webView;
                        }}
                        onNavigationStateChange={(navState) => {
                            this.webView.canGoBack = navState.canGoBack;
                        }}
                        onMessage={(event) => this.onMessage(event)}
                        style={{ flex: 1 }}
                        injectedJavascript={`(function() {
                            window.postMessage = function(data) {
                              window.ReactNativeWebView.postMessage(data);
                            };
                          })()`}
                    />,
                    ios: () =>
                        // https://facebook.github.io/react-native/docs/0.59/safeareaview
                        <SafeAreaView style={{flex: 1, backgroundColor: 'rgb(70,130,180)'}}>
                            <WebView style={{flex: 1}}
                                // iOS WebView 는 AppDelegate.m 에서 설정 https://stackoverflow.com/questions/36590207/set-user-agent-with-webview-with-react-native
                                // iOS WKWebView 는 여기서 설정된 것 사용
                                     userAgent = {'BloceryApp-iOS:'+ DeviceInfo.getUserAgent()}

                                     useWebKit={true}
                                     sharedCookiesEnabled={true}
                                     source={{uri: this.state.url}}
                                     key={this.state.key}
                                     ref={(webView) => {
                                         this.webView.ref = webView;
                                     }}
                                     onNavigationStateChange={(navState) => {
                                         this.webView.canGoBack = navState.canGoBack;
                                     }}
                                     onMessage={(event) => this.onMessage(event)}
                                     injectedJavascript={`(function() {
                                window.postMessage = function(data) {
                                  window.ReactNativeWebView.postMessage(data);
                                };
                            })()`}
                            />
                        </SafeAreaView>
                })()}

            </View>
        )
    }

}