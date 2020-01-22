import React, {Component} from 'react'
import Router from './router'

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

    componentWillMount() {
        //쿠키(localStorage)에서 로그인정보 가져오기(새로고침 대비)
        const userType = localStorage.getItem('loginUserType');

        // if (userType !== 'logout')
        //     this.setState({
        //         userType:userType
        //     })
    }

    render() {
        return (
                <Router></Router>
        );
    }
}

export default App;
