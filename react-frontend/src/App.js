import React, {Component} from 'react'
import Router from './router'

import {autoLoginCheckAndTryAsync} from '~/lib/loginApi'
import {Server} from "~/components/Properties";

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
        // this.state = {
        //     displayName: '',
        //     userType : 'logout'   //login시: 'producer', 'consumer', 'admin'.  logout시는  'logout'
        // }
    }

    async componentWillMount() {
        await autoLoginCheckAndTryAsync(); //모둔 패이지에서 자동로그인 시도 중. 20200410.

    }

    componentDidMount(){
        //this.storage.getItem('email') && this.props.history.push('/')
        this.getHeadKakaoScript();
    }

    // 외부 jquery, iamport 라이브러리
    getHeadKakaoScript = () => {
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://developers.kakao.com/sdk/js/kakao.js";
        document.head.appendChild(script);

        script.onload = () => {
            window.Kakao.init(Server.getKakaoAppKey());
        }
    }

    render() {
        return (
                <Router></Router>
        );
    }
}

export default App;
