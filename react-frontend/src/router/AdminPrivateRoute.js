import React from 'react'
import { Route, Redirect } from 'react-router-dom'

const fakeAuth = {
    isAuthenticated: function(){
        const logined = sessionStorage.getItem('adminLogined');
        //if (logined == 'false' && userType === _userType ) { //logout을 명시적으로 한 경우는 확실히 false로 리턴.
        if (logined == 0) { //logout을 명시적으로 한 경우는 확실히 0 = false로 리턴.
            //console.log('fakeAuth return false');
            return false;
        }

        return true
    }
}

export function AdminPrivateRoute({ component: Component, ...rest }) {
    return (
        <Route
            {...rest}
            render={
                props => {
                    const isLoggedIn = fakeAuth.isAuthenticated();
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
                }
            }
        />
    );
}
