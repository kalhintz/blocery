import React, {Component} from 'react'
import Router from './router'

import {autoLoginCheckAndTryAsync} from '~/lib/loginApi'

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

    render() {
        return (
                <Router></Router>
        );
    }
}

export default App;
