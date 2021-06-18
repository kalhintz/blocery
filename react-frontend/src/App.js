import React, {Component} from 'react'
import Router from './router'
import { BrowserRouter } from 'react-router-dom'

import {autoLoginCheckAndTryAsync} from '~/lib/loginApi'
import {Server} from "~/components/Properties";
import SecureApi from "~/lib/secureApi";
//redux 대체용 전역 state 관리
import {RecoilRoot} from 'recoil';

require('~/plugin/bloceryCustom')

// react-native에서 현재 url을 반환받기 위해 추가
document.addEventListener('message', ()=>{
    // url type
    let url = window.location.href;
    const data = {url: url, type: "CURRENT_URL"}
    window.ReactNativeWebView.postMessage(JSON.stringify(data))
})

class App extends Component {

    constructor(props) {
        super(props);
    }
    componentDidMount(){
        window.clog = function() {
            if(Server._serverMode() === "stage") {
                var i;
                const logs = []
                for (i = 0; i < arguments.length; i++) {
                    logs.push(arguments[i])
                }
                console.log(logs);
            }
        }
        this.getHeadKakaoScript();
        this.initializeInfo();
    }
    initializeInfo = () => {
        //csrf 세팅
        SecureApi.setCsrf().then(()=>{
            SecureApi.getCsrf().then(({data})=>{
                localStorage.setItem('xToken',data);
            });
        });

        //앱시작시 한번만 실행됨... 자동로그인 시도 중. 20200410.
        autoLoginCheckAndTryAsync();
    }


    // 외부 jquery, iamport 라이브러리
    getHeadKakaoScript = () => {
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
        document.head.appendChild(script);

        script.onload = () => {
            window.Kakao.init(Server.getKakaoAppKey());
        }
    }

    render() {
        return (
            <RecoilRoot>
                <BrowserRouter>
                    <Router></Router>
                </BrowserRouter>
            </RecoilRoot>
        );
    }
}

export default App;
