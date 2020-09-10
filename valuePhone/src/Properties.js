import DeviceInfo from 'react-native-device-info'

export const Server = {

    //private TEST 용도
    _isDeviceEmulator: function() {
        // return true;  //폰에서도 pc개발환경 강제 접속용 - 안드로이드는 adb reverse tcp:8080 tcp:8080 -> 3000, 8080 둘 다 필요
        return DeviceInfo.isEmulatorSync(); // master소스는 항상 이걸로 세팅.   4.0에서 Sync()
    },

    /* 중요: google Play 배포용도 */
    _isDeploy: function () {
        // return false;  //stage server(225 server)용
        return true;   //AWS서버 이용
    },

    majorB2bVersion: 2, //강제업그레이듯시 단말앱 먼저 버전 변경후 배포하고, 한참 시간이 지난 후 서버support버전을 변경하도록 함.

    getServerURL: function() {
        const serverUrl = this._isDeploy() ? 'https://blocery.com' : 'http://210.92.91.225:8080'; //AWS IP: 'http://13.209.43.206'

        return this._isDeviceEmulator() ? 'http://localhost:3000' : serverUrl;
    },
    getMainPage: function(isSeller) {
        return isSeller ? (this.getServerURL()+'/b2b/seller/home') : (this.getServerURL() + '/b2b/home/1');
    },
    getGoodsPage: function(isSeller) {
        return isSeller ? (this.getServerURL()+'/b2b/seller/foodsList') : (this.getServerURL() + '/b2b/category');
    },
    getSearchPage: function(isSeller) {
        return  isSeller ? (this.getServerURL() + '/b2b/seller/dealList') : (this.getServerURL()+'/b2b/findSeller'); // ?x=위도&y=경도 넘겨야함
        // return  isSeller ? (this.getServerURL() + '/b2b/seller/dealList') : (this.getServerURL()+'/b2b/search');
    },
    getMyPage: function(isSeller) {
        return isSeller ? (this.getServerURL()+'/b2b/seller/mypage') : (this.getServerURL()+'/b2b/mypage');
    },
    getRestAPIHost: function() {
        return this._isDeviceEmulator() ? 'http://localhost:8080/restapi/b2b' : this.getServerURL() + '/restapi/b2b';
    }

};
