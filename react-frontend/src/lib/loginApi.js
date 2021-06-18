import axios from 'axios'
import { Server, Const } from "../components/Properties";
import ComUtil from '~/util/ComUtil'
import { Webview } from "~/lib/webviewApi";

/**
 * 로그아웃 수행.
 * usage:   await doLogout();
 */
export const doLogout = () => axios(Server.getRestAPIHost() + '/login', { method: "delete", withCredentials: true, credentials: 'same-origin' })
    .then((response) => {
        //autoLogin false,
        //console.log('do Logout');
        if(localStorage.getItem('authType') == 1){
            if(localStorage.getItem('token') != null){
                // 카카오 토큰만료
                if (window.Kakao.Auth.getAccessToken()) {
                    window.Kakao.Auth.logout(function() {
                        //console.log(window.Kakao.Auth.getAccessToken());
                        //마켓블리 로그아웃 처리 (세션등)
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                    });
                }
            }
        }
        localStorage.removeItem('userType');
        localStorage.setItem('autoLogin', 0);  //0=false
        sessionStorage.setItem('logined', 0);


        //userType등 모든정보 제거.(19.9 현재, userType을 이용해서 로그아웃상태에서도 메뉴를 보여주는 기능이 있으므로 막음
        //localStorage.clear();
    });

// 카카오 채널 연결 끊기 테스트용
export const doLogoutChannOut = () => axios(Server.getRestAPIHost() + '/login', { method: "delete", withCredentials: true, credentials: 'same-origin' })
    .then((response) => {
        //console.('do Logout');
        if(localStorage.getItem('authType') == 1){
            if(localStorage.getItem('token') != null){
                // 카카오 토큰만료
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.Kakao.API.request({
                    url: '/v1/user/unlink',
                    success: function(response) {
                        //console.log(response);
                    },
                    fail: function(error) {
                        //console.log(error);
                    }
                });
            }
        }
        localStorage.removeItem('userType');
        localStorage.setItem('autoLogin', 0);  //0=false
        sessionStorage.setItem('logined', 0);
    });

export const doProducerLogout = () => axios(Server.getRestAPIHost() + '/producerLogin', { method: "delete", withCredentials: true, credentials: 'same-origin' })
    .then((response) => {
        //autoLogin false,
        //console.('do Producer Logout');
        localStorage.setItem('producerEmail','');
        sessionStorage.setItem('producerLogined', 0);
        //userType등 모든정보 제거.(19.9 현재, userType을 이용해서 로그아웃상태에서도 메뉴를 보여주는 기능이 있으므로 막음
        //localStorage.clear();
    });

export const doAdminLogout = () => axios(Server.getRestAPIHost() + '/adminLogout', { method: "delete", withCredentials: true, credentials: 'same-origin' })
    .then((response) => {
        //autoLogin false,
        //console.('do AdminLogout');
        localStorage.setItem('adminEmail', '') //20200330 - adminEmail 별도 저장.
        sessionStorage.setItem('adminLogined', 0)
    });

/**
 * 로그인된 userType 가져오기, 로그인 되었는지 여부로도 사용가능.
 * usage:   let {data:userType} = await getLoginUserType();
 * returns:
 *         consumer, producer, admin, '':로그인 안되있는 경우.
 */
export const getLoginUserType = () => axios(Server.getRestAPIHost() + '/login/userType', { method: "get", withCredentials: true, credentials: 'same-origin' })


//자동 로그인시 사용. email,valword,userType 필요.
export const doLogin = (data) => axios(Server.getRestAPIHost() + '/login', {method: "post", data:data, withCredentials: true, credentials: 'same-origin'})

// 생산자 자동 로그인시 사용. email,valword,userType 필요.
export const doProducerLogin = (data) => axios(Server.getRestAPIHost() + '/producerLogin', {method: "post", data:data, withCredentials: true, credentials: 'same-origin'})

// kakao 로그인시 사용. accessToken 필요.
export const doKakaoLogin = (accessToken,refreshToken) => axios(Server.getRestAPIHost() + '/kakaoLogin', {method: "post", params:{ accessKey: accessToken,  refreshKey:refreshToken}, withCredentials: true, credentials: 'same-origin'})

// kakao 소비자 6자리 비번 등록 프로세스
export const doKakaoConsumer = ({consumerNo,passPhrase,recommenderNo}) => axios(Server.getRestAPIHost() + '/kakaoConsumer', {method: "post", params:{ consumerNo: consumerNo, passPhrase: passPhrase, recommenderNo: recommenderNo }, withCredentials: true, credentials: 'same-origin'})

/**
 * 로그인된 user 가져오기
 * return '': 로그인 필요한 상태.
 *        LoginInfo: 백엔드 dbdata참조
 */
export const getLoginUser = () => axios(Server.getRestAPIHost() + '/login', { method: "get", withCredentials: true, credentials: 'same-origin' })
    .then((response)=> {
        //console.(response);
        if (response.data === '') {  //return null
            //console.('NEED to LOGIN');
            return '';
        }
        if (response.data.status === 200) {
            return response.data;

        }else {
            //console.('getLoginUser ERROR:' + response.data.status);
            return '';
        }
    }).catch(function (error) {
        //console.log(error);
    });

/**
 * 로그인된 생산자 user 가져오기
 * return '': 로그인 필요한 상태.
 *        LoginInfo: 백엔드 dbdata참조
 */
export const getLoginProducerUser = () => axios(Server.getRestAPIHost() + '/producerLogin', { method: "get", withCredentials: true, credentials: 'same-origin' })
    .then((response)=> {
        //console.log(response);
        if (response.data === '') {  //return null
            //console.log('NEED to Producer LOGIN');
            return null;
        }
        if (response.data.status === 200) {
            return response.data;

        }else {
            //console.log('getLoginProducerUser ERROR:' + response.data.status);
            return null;
        }
    }).catch(function (error) {
        //console.log(error);
    });

export const checkPassPhrase = (data) => axios(Server.getRestAPIHost() + '/login/passPhrase', { method: "post", params:{ passPhrase: data }, withCredentials: true, credentials: 'same-origin' })

export const checkPassPhraseForProducer = (data) => axios(Server.getRestAPIHost() + '/producerLogin/passPhrase', { method: "post", params:{ passPhrase: data }, withCredentials: true, credentials: 'same-origin' })


//tempProducer@ezfarm.co.kr 이 producer를 강제 로그인하는 기능. data에 producer를 넣으면 그걸로 로그인되고, 안넣으면 producer@ezfarm.co.kr로 로그인 됨.
export const tempAdminProducerLogin = (data) => axios(Server.getRestAPIHost() + '/tempAdminProducerLogin', { method: "post", data:data, withCredentials: true, credentials: 'same-origin' })

//tempProducer@ezfarm.co.kr 이  로그인가능한 producer list가져오는 기능 (LoginInfo 의 형태로 리턴됨)
export const tempAdminProducerList = (data) => axios(Server.getRestAPIHost() + '/tempAdminProducerList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 106 바른먹거리연구소, 108 바른먹거리(가공)
export const barunProducerLogin = (email) => axios(Server.getRestAPIHost() + '/barunProducerLogin', { method: "post", params:{ producerEmail: email }, withCredentials: true, credentials: 'same-origin' })


/**
 * 로그인된 admin user 가져오기
 * return '': 로그인 필요한 상태.
 * LoginAdminInfo: 백엔드 dbdata참조
 */
export const getLoginAdminUser = () => axios(Server.getRestAPIHost() + '/adminLoginInfo', { method: "post", withCredentials: true, credentials: 'same-origin' })
    .then((response)=> {
        //console.log(response);
        if (response.data === '') {  //return null
            //console.log('NEED to LOGIN ADMIN');
            return '';
        }
        if (response.data.status === 200) {
            return response.data;

        }else {
            //console.log('getLoginAdminUser ERROR:' + response.data.status);
            return '';
        }
    }).catch(function (error) {
        //console.log(error);
    });

export const isTokenAdminUser = () => axios(Server.getRestAPIHost() + '/isTokenAdminUser', { method: "post", withCredentials: true, credentials: 'same-origin' })

//await으로 기다릴 수 있게 autoLogin 추가 작성 20200410 => App.js에서 항상호출 -> 자동login ///////////////////////////////////////////////////////////
export const autoLoginCheckAndTryAsync = async () => {
    if (ComUtil.isPcWeb() && localStorage.getItem('userType') !== 'consumer') return; //admin <-> 생산자간 전환등 용도 때문에 return.
    const isLogined = sessionStorage.getItem('logined');
    if (isLogined == 1 || localStorage.getItem('autoLogin') == 1) {
        // kakao (authType:1)
        if(localStorage.getItem('authType') == 1){
            const access_token = localStorage.getItem('token');
            const refresh_token = localStorage.getItem('refreshToken')||"";
            if(access_token != null) {
                const {data: res} = await doKakaoLogin(access_token,refresh_token)
                if (res.code == 0) {
                    //const consumer = res.consumer;
                    sessionStorage.setItem('logined', 1);  //로그인 완료.
                }
            }
        }else {
            let user = {
                email: localStorage.getItem('email'),
                valword: ComUtil.decrypt(localStorage.getItem('valword')),
                userType: localStorage.getItem('userType')
            }
            let {data: ret} = await doLogin(user);
            if (ret.status !== Server.ERROR) {
                sessionStorage.setItem('logined', 1);  //로그인 완료.
            }
        }
    }
}


export const autoLoginCheckAndTry = (isForce) => {
    const isLogined = sessionStorage.getItem('logined');

    Webview.appLog('autoLoginCheckAndTry' + localStorage.getItem('autoLogin') );
    if (isLogined == 1 || localStorage.getItem('autoLogin') == 1 || isForce) { //1을 true로 사용 중. '1' 일수도 있으므로 ==두개 사용.  //isForce:가입시 강제 자동로그인
        //Webview.appLog('====autoLogin 시도:' +  localStorage.getItem('autoLogin') +',' + localStorage.getItem('email') + ',' + localStorage.getItem('userType'));

        getLoginUserType()  //로그인이 되어있는지 실제로 check해서 안되어 있을 경우만 수행..
            .then( (res) => {
                let userType = res.data;
                Webview.appLog('localStorage Val:' + localStorage.getItem('valword'));
                if (isForce || !userType) { //가입직후 이거나 로그인이 안되어 있으면 수행.: consumer가입직후, userType이 세팅되어 있음- 어디에서 로그인되는지 파악필요.
                    if(localStorage.getItem('authType') == 1){
                        const access_token = localStorage.getItem('token');
                        const refresh_token = localStorage.getItem('refreshToken')||"";
                        if(access_token != null) {
                            doKakaoLogin(access_token,refresh_token)
                                .then((res)=>{
                                    if (res.data.code == 0) {
                                        if (res.data.status !== Server.ERROR) { //100이면 로그인 실패

                                            if (isForce) {  //자동로그인 무한루프 걸리는 문제가 있어 일단 가잆시에만 적용. 단말을 2버전으로 강제업데이트 이후에는 풀어도 뙴.
                                                Webview.loginUpdate();
                                            }
                                            sessionStorage.setItem('logined', 1);  //로그인 완료.
                                        }
                                    }
                                })
                        }
                    }else {

                        let user = {
                            email: localStorage.getItem('email'),
                            valword: ComUtil.decrypt(localStorage.getItem('valword')),
                            userType: localStorage.getItem('userType')
                        }
                        doLogin(user)
                            .then((res) => {
                                if (res.data.status !== Server.ERROR) { //100이면 로그인 실패
                                    if (isForce) {  //자동로그인 무한루프 걸리는 문제가 있어 일단 가잆시에만 적용. 단말을 2버전으로 강제업데이트 이후에는 풀어도 뙴.
                                        Webview.loginUpdate();
                                    }
                                    sessionStorage.setItem('logined', 1);  //로그인 완료.
                                }
                            })
                    }
                }
            });
    }
}
