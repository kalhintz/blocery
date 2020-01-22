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
        console.log('do Logout');
        localStorage.removeItem('userType');
        localStorage.setItem('autoLogin', 0);  //0=false
        //localStorage.setItem('logined', 0);
        sessionStorage.setItem('logined', 0);

        //userType등 모든정보 제거.(19.9 현재, userType을 이용해서 로그아웃상태에서도 메뉴를 보여주는 기능이 있으므로 막음
        //localStorage.clear();
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

/**
 * 로그인된 user 가져오기
 * return '': 로그인 필요한 상태.
 *        LoginInfo: 백엔드 dbdata참조
 */
export const getLoginUser = () => axios(Server.getRestAPIHost() + '/login', { method: "get", withCredentials: true, credentials: 'same-origin' })
    .then((response)=> {
        console.log(response);
        if (response.data === '') {  //return null
            console.log('NEED to LOGIN');
            return '';
        }
        if (response.data.status === 200) {
            return response.data;

        }else {
            console.log('getLoginUser ERROR:' + response.data.status);
            return '';
        }
    }).catch(function (error) {
        console.log(error);
    });


export const checkPassPhrase = (data) => axios(Server.getRestAPIHost() + '/login/passPhrase', { method: "post", params:{ passPhrase: data }, withCredentials: true, credentials: 'same-origin' })

/**
 * 로그인된 admin user 가져오기
 * return '': 로그인 필요한 상태.
 * LoginAdminInfo: 백엔드 dbdata참조
 */
export const getLoginAdminUser = () => axios(Server.getRestAPIHost() + '/adminLoginInfo', { method: "post", withCredentials: true, credentials: 'same-origin' })
    .then((response)=> {
        console.log(response);
        if (response.data === '') {  //return null
            console.log('NEED to LOGIN ADMIN');
            return '';
        }
        if (response.data.status === 200) {
            return response.data;

        }else {
            console.log('getLoginAdminUser ERROR:' + response.data.status);
            return '';
        }
    }).catch(function (error) {
        console.log(error);
    });


export const autoLoginCheckAndTry = (isForce) => {
    const isLogined = sessionStorage.getItem('logined');

    Webview.appLog('autoLoginCheckAndTry' + localStorage.getItem('autoLogin') );
    if (isLogined == 1 || localStorage.getItem('autoLogin') == 1 || isForce) { //1을 true로 사용 중. '1' 일수도 있으므로 ==두개 사용.  //isForce:가입시 강제 자동로그인
        console.log('====autoLogin 시도:', localStorage.getItem('email'), localStorage.getItem('userType'));
        //Webview.appLog('====autoLogin 시도:' +  localStorage.getItem('autoLogin') +',' + localStorage.getItem('email') + ',' + localStorage.getItem('userType'));

        getLoginUserType()  //로그인이 되어있는지 실제로 check해서 안되어 있을 경우만 수행..
            .then( (res) => {
                let userType = res.data;

                console.log('getLoginUserType:',userType);

                console.log('localStorage Val:' + localStorage.getItem('valword'));
                Webview.appLog('localStorage Val:' + localStorage.getItem('valword'));

                // Webview.appLog('PASSWD Decrypted:' + ComUtil.decrypt(localStorage.getItem('valword')));
                //console.log('PASSWD Decrypted:' + ComUtil.decrypt(localStorage.getItem('valword')));
                // Webview.appLog('PASSWD TEST:' + ComUtil.encrypt('ezfarm#3414') + ',' + localStorage.getItem('valword'));


                // Webview.appLog('getLoginUserType:'+ userType);
                if (isForce || !userType) { //가입직후 이거나 로그인이 안되어 있으면 수행.: consumer가입직후, userType이 세팅되어 있음- 어디에서 로그인되는지 파악필요.
                    console.log('====autoLogin 수행:');
                    // Webview.appLog('====autoLogin 수행:');
                    let user = {
                        email: localStorage.getItem('email'),
                        valword: ComUtil.decrypt(localStorage.getItem('valword')),
                        userType: localStorage.getItem('userType')
                    }
                    console.log({autoLoginUser: user});
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
            });
    }
}