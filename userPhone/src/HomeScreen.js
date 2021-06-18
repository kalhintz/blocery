import React from 'react';
import { ToastAndroid, View, SafeAreaView, BackHandler, Platform, Alert, Linking, Clipboard } from 'react-native';
import AsyncStorage from "@react-native-community/async-storage";
import { Server } from './Properties';
import BottomNavigation, {FullTab} from 'react-native-material-bottom-navigation';
import WebView from 'react-native-webview';
import axios from 'axios';
import firebase from 'react-native-firebase';
import SplashScreen from 'react-native-splash-screen';
import ComUtil from "./ComUtil";
import ClearCacheModule from './ClearNativeAppCache';
import RNExitApp from 'react-native-exit-app';
//import RNKakaoLink from 'react-native-kakao-links';
import KakaoLink from '@actbase/react-native-kakao-link';

const VERSION_KEY = "version";
const USER_TYPE = {
    CONSUMER: 'consumer',
    PRODUCER: 'producer',
}


const TAB_KEY = {
    HOME: 'home',
    CATEGORY: 'category',
    SEARCH: 'search',
    MY_PAGE: 'mypage'
}

// 아이콘 검색 - https://materialdesignicons.com/

const getLoginUserType = () => axios(Server.getRestAPIHost() + '/login/userType', { method:"get", withCredentials: true, credentials: 'same-origin'});

export default class HomeScreen extends React.Component {

    static navigationOptions = {
        title: 'Home',
        header: null
    };

    webView = {
        canGoBack: false,
        ref: null
    }

    constructor(props){
        super(props);

        console.log('constructor ==== ', props)

        this.state = {
            key: 0,
            isCacheChecked: false,
            //isPopupOnScreen: false,
            source: {uri: Server.getMainPage(false)},  // 소비자용이 default
            pressedTabKey: TAB_KEY.HOME,
            tabs : this.getTabName(false),   //소비자용 TabName이 default.
            serverVersion: '',
            minSupportB2cAndroidVersion: 0,
            minSupportB2cIosVersion: 0
        }
    }

    getTabName = (isProducer) => {
        return (
            [
                {
                    key: TAB_KEY.HOME,
                    icon: 'home-outline',
                    label: '홈',
                    barColor: '#f3f3f3',
                    pressColor: 'rgba(255,255,255,0.16)'
                },
                {
                    key: TAB_KEY.CATEGORY,
                    icon: 'package-variant',
                    label: isProducer? '상품/상점':'카테고리',
                    barColor: '#f3f3f3',
                    pressColor: 'rgba(255,255,255,0.16)'
                },
                {
                    key: TAB_KEY.SEARCH,
                    icon: 'magnify',
                    label: isProducer? '주문/정산':'검색',
                    barColor: '#f3f3f3',
                    pressColor: 'rgba(255,255,255,0.16)'
                },
                {
                    key: TAB_KEY.MY_PAGE,
                    icon: 'account-outline',
                    label: '마이페이지',
                    barColor: '#f3f3f3',
                    pressColor: 'rgba(255,255,255,0.16)'
                }
            ]
        );
    }

    async componentDidMount() {

        if(this.notificationListener)this.notificationListener.remove()
        if(this.notificationOpenedListener)this.notificationOpenedListener.remove()
        if(this.messageListener)this.messageListener.remove()

        console.log('componentDidMount - homeScreen')

        // const fcmToken = await ComUtil._checkPermission();
        // console.log('fcmToken: ', fcmToken);

        if (Platform.OS === 'android') {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.onAndroidBackPress);
        }

        await this.getServerVersion();
        await this.deleteWebviewCache();
        this.alertAppUpdate();

        const isProducer = await this.isProducerUserType();

        console.log('componentDidMount - isProducer:', isProducer);

        if (isProducer) {
            this.setState({
                key: this.getNewKey(),
                isCacheChecked: true,
                tabs: this.getTabName(true)
            }, () => {
                this._listenForNotifications();
            });
        }
        else {
            this.setState({
                key: this.getNewKey(),
                isCacheChecked: true
            }, () => {
                this._listenForNotifications();
            });
        }
        /* 여기가지 */
    }


    componentWillUnmount() {

        if (Platform.OS === 'android') {
            this.exitApp = false;
            this.backHandler.remove();// removeEventListener('hardwareBackPress');
        }

        this.notificationListener.remove()
        this.notificationOpenedListener.remove()
        this.messageListener.remove()
    }

    getServerVersion = async() => {
        const response = await axios(Server.getRestAPIHost() + '/version', { method: "get", withCredentials: true, credentials: 'same-origin' });
        let versionResult = response.data;
        console.log('============= versionResult : ', versionResult);

        this.setState({
            serverVersion: versionResult.serverVersion,
            minSupportB2cAndroidVersion: versionResult.minSupportB2cAndroidVersion,
            minSupportB2cIosVersion: versionResult.minSupportB2cIosVersion
        })
    }

    alertAppUpdate = () => {
        let minPhoneVersion = Platform.OS === 'android' ? this.state.minSupportB2cAndroidVersion : this.state.minSupportB2cIosVersion;
        if (Server.majorB2cVersion < minPhoneVersion) {
            let alertTitle = '업데이트 안내';
            let alertContent = '중요한 업데이트가 있습니다. 새로운 기능이 추가되었으니, 스토어에서 업데이트 후 실행해 주세요';
            Alert.alert(
                alertTitle,
                alertContent,
                [
                    {
                        text: '확인',
                        onPress: () => this.goAppStoreAndExit()
                    }
                ],
                {cancelable: false},
            )
        }
    }

    goAppStoreAndExit = () => {
        let url = '';
        if (Platform.OS === 'android') {
            url = "market://details?id=com.blocery";
        } else {
            url = 'itms-apps://itunes.apple.com/us/app/%EB%A7%88%EC%BC%93%EB%B8%94%EB%A6%AC/id1471609293?l=ko&ls=1';
        }

        Linking.canOpenURL(url).then(supported => {
            console.log(supported);
            supported && Linking.openURL(url);
            if (Platform.OS === 'android') {
                RNExitApp.exitApp();
            } else {
                setTimeout(() => {
                    RNExitApp.exitApp();
                }, 1000)
            }
        }, (err) => console.log(err));

    }

    deleteWebviewCache = async() => {
        let oldVersion = await AsyncStorage.getItem(VERSION_KEY);
        console.log('=============== oldVersion', oldVersion);

        if(oldVersion === null || oldVersion !== this.state.serverVersion) {
            if(this.state.serverVersion)
                AsyncStorage.setItem(VERSION_KEY, this.state.serverVersion);
            console.log('============= is different Version');
            const kakaoUpdateTime = new Date(2020, 11, 30, 9, 0, 0); // ios는 2020년 12월 18일 금요일 오전 9시 이후에 update 하도록
            const now = new Date();
            const isOverStartTime = kakaoUpdateTime.getTime() - now.getTime();
            if(isOverStartTime < 0 || Platform.OS === 'android') {
                ClearCacheModule.deleteCache();
            }
            return true;
        }
        console.log('=============== version is not updated');
        return false;
    };


    onAndroidBackPress = () => {

        if (this.webView.ref) {  //this.webView.canGoBack 오작동 -
            this.webView.ref.postMessage();
            this.webView.ref.goBack();
        }
        return true;
    }

    finishApp = async (currentUrl) => {
        if (this.exitApp === undefined || !this.exitApp) {
            let isProducerUserType = await this.isProducerUserType();
            let mainUrl = Server.getMainPage(isProducerUserType);
            let goodsUrl = Server.getGoodsPage(isProducerUserType);
            let searchUrl = Server.getSearchPage(isProducerUserType);
            let consumerMypageUrl = Server.getMyPage(false);
            let producerMypageUrl = Server.getMyPage(true);

            const res = [{url:mainUrl},{url:goodsUrl},{url:searchUrl},{url:consumerMypageUrl},{url:producerMypageUrl}].find(obj => obj.url === currentUrl)

            if (res) {
                ToastAndroid.show('한 번 더 누르시면 종료됩니다.', ToastAndroid.SHORT);
                this.exitApp = true;

                this.timeout = setTimeout(
                    () => {
                        this.exitApp = false;
                    }, 2000
                );
            }
        } else {
            clearTimeout(this.timeout);
            BackHandler.exitApp();
        }
    }

    // renderIcon = icon => ({ isActive }) => (
    //     <Icon size={24} color='gray' name={icon} />
    // )
    //
    // renderTab = ({ tab }) =>{
    //     //renderTab 의 arguments 로 tab, isActive 를 받지만 isActive를 수동으로 제어하기 위해 state.pressedTabkey를 사용하도록 변경함
    //     const isActive = this.state.pressedTabKey === tab.key
    //     return <FullTab
    //         isActive={isActive}
    //         key={tab.key}
    //         label={tab.label}
    //         labelStyle={{ color: '#313131' }}
    //         renderIcon={this.renderIcon(tab.icon)}
    //     />
    // }


    getNewKey = () => {
        return this.state.key +1
    }


    // sendInfoToWebView = async (tabKey) => {
    //     this.changeTab(tabKey)
    // }

    /* FCM ComUtil.js 에서 별도 구성함 */
    /*
    _checkPermission = async() => {
        console.log(' _checkPermission() ');
        const enabled = await firebase.messaging().hasPermission();
        if(enabled) {
            console.log('enabled : ', enabled);
            this._updateTokenToServer();
        } else {
            this._requestPermission();
        }
    };

    _requestPermission = async() => {
        try{
            await firebase.messaging().requestPermission();
            await this._updateTokenToServer();
        } catch (error) {
            alert("you can't handle push notification");
        }
    };

    _updateTokenToServer = async() => {
        const fcmToken = await firebase.messaging().getToken();
        console.log('fcmToken: ', fcmToken);

        const header = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache': 'no-cache'
            },
            body: JSON.stringify({
                user_id:"CURRENT_USER_ID",
                firebase_token: fcmToken
            }),
            credentials: 'include',
        };
        const url = "http://SERVER_URL";
        // if you want to notification using server,
        // do registry current user token

        // await fetch(url, header);
    };
    */
    _listenForNotifications = async() => {
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            console.log('onNotification ', notification);  // 앱이 실행되어있을 때 푸쉬가 오면 실행됨
            const { _title, _subtitle, _body, _data, _notificationId, _sound, _android, _ios } = notification

            alert('푸시알림 '+_title + _body)
        });

        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            console.log('onNotificationOpened ', notificationOpen);
            // ?? 앱이 foreground나 background에 있을 때 호출된다고 하는데.. 실제로 테스트해보니 아래의 getInit이 호출되고 있음
        });

        this.messageListener = firebase.messaging().onMessage((message) => {
            console.log('messageListener : ', message);
            // background에서 message를 핸들링 할 수 있다고 하는데. 콘솔이 안찍힘 필요할 경우 추가 테스트 필요
        })

        //TODO: notificationOpen 에 값들이 들어오지 않는 이슈가 있음
        const notificationOpen = await firebase.notifications().getInitialNotification();
        if(notificationOpen) {

            console.log('getInitNotification ', notificationOpen); // 앱 종료상태, 앱 백그라운드상태 에서 푸쉬를 타고 앱이 실행되면 실행됨

            const { notificationType } = notificationOpen.notification._data
            const { url } = notificationOpen.notification._data

            // console.log(url);
            if(url) {
                await this.changeConsumerUrl(Server.getServerURL() + url);
                return;
            }


            //각 해당하는 탭으로 이동
            switch (notificationType){
                case 'deliveryStart': //배송시작
                case 'producerCancelOrder': //생산자 주문취소
                    await this.changeConsumerUrl( Server.getServerURL() + '/mypage?moveTo=orderList' ,TAB_KEY.MY_PAGE);
                    break;

                case 'favoriteNewGoods':
                    await this.changeConsumerUrl( Server.getServerURL() + '/home/7' ,TAB_KEY.HOME);
                    break;
                case 'goodsQnaAnswer':
                    await this.changeConsumerUrl( Server.getServerURL() + '/mypage?moveTo=goodsQnaList' ,TAB_KEY.MY_PAGE);
                    break;
                case 'noticePush': //공지사항을 푸시하는 경우
                    await this.changeConsumerUrl( Server.getServerURL() + '/noticeList' ,TAB_KEY.HOME);
                    break;

                case 'favoriteNewFarmDiary': //생산일지
                    //await this.changeTab(TAB_KEY.HOME);
                    //break;
                case 'delayShippingGoods':  //배송지연, 생산일지는 그냥 알림으로 이동
                    //await this.changeTab(TAB_KEY.MY_PAGE);
                    await this.changeConsumerUrl( Server.getServerURL() + '/mypage?moveTo=notificationList' ,TAB_KEY.MY_PAGE);
                    break;

                case 'kycAuth':
                case 'transferBly':
                    await this.changeConsumerUrl( Server.getServerURL() + '/mypage' ,TAB_KEY.MY_PAGE);
                    break;


                //생산자 --
                case 'goodsQnaAsk':
                case 'saleEndGoods':
                    await this.changeTab(TAB_KEY.CATEGORY);
                    break;

                case 'newOrder':
                case 'cancelOrder':
                case 'alertProducerCalculate':
                case 'firstNotDelivery':
                case 'notDelivery':
                case 'delayDelivery':
                case 'shippingStartWaring':
                    await this.changeTab(TAB_KEY.SEARCH);
                    break;

                default:
                    await this.changeTab(TAB_KEY.HOME);
                    break;
            }
        }
    };

    changeConsumerUrl = async (uri, tabKey) => {
        this.setState({
            key: this.getNewKey(),
            pressedTabKey: tabKey,
            source: {uri: uri}
        });
    }


    // //유저타입이 맞는지 반환 - 미사용
    // userTypeOf = async (userType) => {
    //     const {data} = await getLoginUserType()
    //     return data === userType
    // }

    //userType을 localStorage에 저장해서 get하는 로직: 미로그인시에 오류방지용.
    isProducerUserType = async () => {
        let {data:userType} = await getLoginUserType();
        console.log('get userType', userType );

        if (!userType) { //미로그인시
            userType = await AsyncStorage.getItem('userType');
            console.log('get AsyncStorageUserType', userType );

            if (!userType) { //로컬에 저장 안되어 있을시 ..
                console.log('no login history exists: defulat consumer' );
            }
        }

        // https://github.com/react-native-community/async-storage/issues/190
        // null 을 저장하려고 하면 iOS 에서 crash
        if(userType) {
            console.log('AsyncStorage.setItem ' + userType );
            AsyncStorage.setItem('userType', userType); //userType 저장
        }

        return (userType === USER_TYPE.PRODUCER); //default consumer
    }

    changeTab = async (tabKey) => {

        let uri;

        switch (tabKey){
            case TAB_KEY.HOME :
                uri = Server.getMainPage(await this.isProducerUserType())
                break;
            case TAB_KEY.CATEGORY :
                uri = Server.getGoodsPage(await this.isProducerUserType())
                break;
            case TAB_KEY.SEARCH :
                uri = Server.getSearchPage(await this.isProducerUserType())
                break;
            case TAB_KEY.MY_PAGE :
                uri = Server.getMyPage(await this.isProducerUserType())
                break;
        }

        this.setState({
            key: this.getNewKey(),
            pressedTabKey: tabKey,
            source: {uri: uri}
        });
    }

    /* 여기까지 */

    kakaoLink = async (urlObject) => {
        console.log(urlObject);

        const linkObject = {
            webURL: urlObject.url,
            mobileWebURL : urlObject.url
        };

        const contentObject = {
            title     : urlObject.title,
            link      : linkObject,
            imageURL  : urlObject.imageUrl,
            desc      : urlObject.desc
        }

        try {
            const options = {
                content: contentObject,
            };

            const response = await KakaoLink.sendFeed(options);
            console.log(response);
        } catch (e) {
            // alert("catch : " + e);
            console.warn(e);
        }
    };

    // popup
    onMessageFromFront = async(event) => {
        console.log({eventData: event.nativeEvent.data});
        if (!event.nativeEvent.data) {
            return; //empty URL - 왜 호출되는지..
        }

        const { url, type } = JSON.parse(event.nativeEvent.data);

        if(type === 'CURRENT_URL') {
            console.log('url : ', url);
            this.finishApp(url);
            return;
        }

        if(type === 'UPDATE_FCMTOKEN'){
            ComUtil.checkPermission({...param})
            return;
        }

        if(type === 'KAKAO_LINK') {
            this.kakaoLink(url);
            return;

        } else if (type === 'APP_REFRESH') { //isNoUsePopup 용도로 추가. 로그인후 refresh문제 해결. - 현재 미사용.
            this.setState({key: this.getNewKey()});
            //alert('app_refresh');

        } else if (type === 'JUST_POPUP') {

            this.props.navigation.navigate('Popup', {
                url: Server.getServerURL() + url,
                onPopupClose: this.popupClosed //no refresh
            });

        } else if (type === 'NEW_POPUP') {

            this.props.navigation.navigate('Popup', {
                url: Server.getServerURL() + url,
                onPopupClose: this.popupCloseAndRefresh //callback-refresh
            });

        }else if (type === 'CLOSE_POPUP') {
            console.log('###  HomeScreen: CLOSE_POPUP');

        }else if (type === 'MOVE_PAGE') {
            console.log('###  HomeScreen: MOVE PAGE:,', url);

            const uri = {uri: Server.getServerURL() + url};
            //uri가 /mypage 및 /producer/mypage 간 이동때문에 최초 추가.

            let isProducer = url.includes('/producer/');
            let tabs = this.getTabName(isProducer);
            this.setState({
                tabs: tabs,
                key: this.getNewKey(),
                source: uri
            });
        }else if (type === 'LOGIN_UPDATE') {
            console.log('###  HomeScreen: LOGIN_UPDATE:');

            getLoginUserType()
                .then((res)=>{
                    let userType = res.data;
                    let isProducer = (userType === USER_TYPE.PRODUCER); //default consumer
                    console.log('###  HomeScreen: LOGIN_UPDATE: isProducer', isProducer);

                    let tabs = this.getTabName(isProducer);
                    this.setState({
                        tabs: tabs//,
                        //무한루프문제로 막음  key: this.getNewKey()
                    });

                });
        } else if(type === 'LOGOUT_UPDATE') {
            console.log('###  HomeScreen: LOGOUT_UPDATE:');

            AsyncStorage.setItem('userType', 'consumer');

            let tabs = this.getTabName(false);
            this.setState({
                tabs: tabs,
                key: this.getNewKey()
            });

        } else if(type === 'QRCODE_SCAN') {
            this.props.navigation.navigate('Qrcode', {
                onQrScanResult: this.qrcodeScanResult
            });
        } else if(type === 'CLIPBOARD_TEXT') {

            this.copyFromClipboard();

        } else if(type === 'CAMERA_PERMISSION') {

            let data = await ComUtil.askCameraPermission();
            const jsonData = JSON.stringify(data)
            this.webView.ref.postMessage(jsonData)

        } else { //APP_LOG
            console.log(url); //url에 변수를 넣어서 찍기
        }
    };

    copyFromClipboard = async() => {
        let accountData = await Clipboard.getString();

        let data = ({
            accountFromPhone: accountData
        })
        console.log("copyFromClipboard : ", data);

        const jsonData = JSON.stringify(data)
        this.webView.ref.postMessage(jsonData)

    }

    qrcodeScanResult = (data) => {
        console.log('HomeScreen qrcodeResult : ', data)

        // { qrcodeResult: 'I love you' }  이렇게 들어오는 데이터 중에 value만 webView로 넘겨야 하는디.....
        const jsonData = JSON.stringify(data)
        this.webView.ref.postMessage(jsonData)

    }

    popupClosed = (data) => {

        const { url, param } = JSON.parse(data)
        console.log('#######################HomeScreen : just popupClosed -' + url);

        //페이지 Redirection : ClosePopupAndMovePage
        if (url) { //URL refresh
            const uri = {uri: Server.getServerURL() + url}
            this.setState({
                key: this.getNewKey(),  //새로고침을 위해
                source: uri
            })
        }
    }


    //popup이 닫힐 때 callback.   string으로 넘어옴
    popupCloseAndRefresh = (data) => {

        console.log('#######################HomeScreen : popupClosed');

        const { url, param } = JSON.parse(data)
        console.log('#######################HomeScreen : popupClosed -' + url);
        const isRefresh = (param && param.isRefresh) ? param.isRefresh : true;

        //페이지 Redirection : ClosePopupAndMovePage
        if (url) { //URL refresh
            const uri = {uri: Server.getServerURL() + url}
            this.setState({
                key: this.getNewKey(),  //새로고침을 위해
                source: uri
            })
        } else {
            //팝업 닫을 때 refresh. : CLOSE_POPUP
            //this.setState({key: this.state.key + 1});// - 혹시 refresh 필요시. 호출
            if (isRefresh) {
                this.webView.ref.reload();
            }
        }
        // else { //fronEnd로 전달.
        //     this.webView.ref.postMessage(data);
        // }

    }

    //웹뷰가 완전히 로드 되었을 경우
    onLoadEnd = () => {
        //스플래시 이미지가 너무 빨리 닫히면 볼 수가 없어서 1초의 여유를 줌
        setTimeout(SplashScreen.hide, 1000)
    }

    render() {

        if(!this.state.isCacheChecked) return null

        return (
            <View style={{flex: 1}}>
                {Platform.select({
                    android: () =>
                        <WebView
                            //source={{ uri: 'https://mobilehtml5.org/ts/?id=23' }}
                            userAgent = {'BloceryAppQR-Android'}
                            key={this.state.key}
                            source={this.state.source}
                            ref={(webView) => {
                                this.webView.ref = webView;
                            }}
                            onNavigationStateChange={(navState) => {
                                this.webView.canGoBack = navState.canGoBack;
                            }}
                            onMessage={this.onMessageFromFront}
                            onLoadEnd={this.onLoadEnd}
                        />,

                    ios:  () =>
                        // https://facebook.github.io/react-native/docs/0.59/safeareaview
                        <SafeAreaView style={{flex: 1, backgroundColor: 'rgb(255,255,255)'}}>
                            <WebView
                                style={{flex: 1}}
                                //source={{ uri: 'https://mobilehtml5.org/ts/?id=23' }}
                                // iOS WebView 는 AppDelegate.m 에서 설정 https://stackoverflow.com/questions/36590207/set-user-agent-with-webview-with-react-native
                                // iOS WKWebView 는 여기서 설정된 것 사용
                                userAgent = {'BloceryAppQR-iOS'}
                                useWebKit={true}
                                sharedCookiesEnabled={true}
                                key={this.state.key}
                                source={this.state.source}
                                ref={(webView) => {
                                    this.webView.ref = webView;
                                }}
                                onNavigationStateChange={(navState) => {
                                    this.webView.canGoBack = navState.canGoBack;
                                }}
                                onMessage={this.onMessageFromFront}
                                onLoadEnd={this.onLoadEnd}
                            />
                        </SafeAreaView>
                })()}

            </View>

        );
    }
}