import firebase from 'react-native-firebase';

import { updateFCMToken } from './lib/notificationApi'

export default ComUtil = {
    checkPermission: async function(userInfo){
        const enabled = await firebase.messaging().hasPermission();
        //알림 설정여부
        if(enabled) {
            this.updateTokenToServer(userInfo);

        } else {
            this.requestPermission(userInfo);
        }
    },
    requestPermission: async function(userInfo){
        try{
            await firebase.messaging().requestPermission();
            await this.updateTokenToServer(userInfo);
        } catch (error) {
            alert("you can't handle push notification");
        }
    },
    //사용자별 FCM Token 을 DB에 업데이트
    updateTokenToServer: async function(userInfo){

        const { userType, userNo } = userInfo;
        const fcmToken = await firebase.messaging().getToken();

        //DB 등록 및 업데이트
        await updateFCMToken({
            userType,
            uniqueNo: userNo,
            fcmToken
        });
    }
}