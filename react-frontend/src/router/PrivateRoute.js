import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { Webview } from '../lib/webviewApi'
import ComUtil from '../util/ComUtil'

const fakeAuth = {
    isAuthenticated: function(){
        //cookie check
        const logined = sessionStorage.getItem('logined');
        if (logined == 0) { //logout을 명시적으로 한 경우는 확실히 0 = false로 리턴.
            //console.log('fakeAuth return false');
            return false;
        }
        return true;
    }
}

export function PrivateRoute({ component: Component, userType, ...rest }) {
    return (
        <Route
            {...rest}
            render={
                props => {
                    const isLoggedIn = fakeAuth.isAuthenticated()
                    //console.log('in privateRoute: userType, isLoggedIn', userType, isLoggedIn);
                    //console.log('consumer, isLoggedIn? '+isLoggedIn)
                    return isLoggedIn ? (
                        <Component {...props} />
                    ) : (
                        Webview.openPopup('/login')
                    )
                }
            }
        />
    );
}
