import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { Webview } from '../lib/webviewApi'

const fakeAuth = {
    isAuthenticated: function(_userType){
        //cookie check
        const userType = localStorage.getItem('userType')
        //const logined = localStorage.getItem('logined');
        const logined = sessionStorage.getItem('logined');

        // console.log('fakeAuth logined:', userType, _userType, logined);

        // console.log(userType, _userType, userType==_userType);

        console.log({
            fakeAuth: {
                '검증 userType': _userType,
                'localStorage.getItem(userType)': userType,
                'sessionStorage.getItem(logined)': logined
            }
        })


        //if (logined == 'false' && userType === _userType ) { //logout을 명시적으로 한 경우는 확실히 false로 리턴.
        if (logined == 0 && userType === _userType ) { //logout을 명시적으로 한 경우는 확실히 0 = false로 리턴.
            console.log('fakeAuth return false');
            return false;
        }

        return (userType === _userType)

        //server session check
        //this.getLoginUser()
    },
    // getLoginUser: async function(){
    //     let {data:userType} = await getLoginUserType();
    // }
}

export function PrivateRoute({ component: Component, userType, ...rest }) {
    return (
        <Route
            {...rest}
            render={
                props => {

                    const isLoggedIn = fakeAuth.isAuthenticated(userType)
                    console.log('in privateRoute: userType, isLoggedIn', userType, isLoggedIn);

                    switch(userType){
                        case 'admin':
                            return isLoggedIn ? (
                                <Component {...props} />
                            ) : (
                                <Redirect
                                    to={{
                                        pathname: '/admin/login',
                                        state: { from: props.location }
                                    }}
                                />
                            )
                            break
                        case 'producer':
                            console.log('in privateRoute:', props.location); //쿠키fake로그인 check라서 자주 로그인되어있는 문제가 있음.
                            console.log('in privateRoute: isLoggedIn: ', isLoggedIn); //쿠키fake로그인 check라서 자주 로그인되어있는 문제가 있음.
                            return (props.location.pathname === '/producer/mypage' || isLoggedIn) ? (
                                <Component {...props} />
                            ) : (
                                Webview.openPopup('/login?userType=producer')
                            )
                            break
                        case 'consumer':
                            console.log('consumer, isLoggedIn? '+isLoggedIn)
                            return isLoggedIn ? (
                                <Component {...props} />
                            ) : (
                                Webview.openPopup('/login')
                            )
                            break
                        case 'buyer':
                            return isLoggedIn ? (
                                <Component {...props} />
                            ) : (
                                Webview.openPopup('/b2b/login')
                            )
                            break
                        case 'seller':
                            console.log('private route===================seller login')
                            return (props.location.pathname === '/b2b/seller/mypage' || isLoggedIn) ? (
                                <Component {...props} />
                            ) : (
                                Webview.openPopup('/b2b/login?userType=seller')
                            )
                            break
                    }
                }
            }
        />
    );
}
