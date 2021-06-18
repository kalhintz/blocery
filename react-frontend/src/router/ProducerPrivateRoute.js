import React from 'react'
import { Route } from 'react-router-dom'
const fakeAuth = {
    isAuthenticated: function(){
        const logined = sessionStorage.getItem('producerLogined');
        if (localStorage.getItem('adminEmail') === 'tempProducer@ezfarm.co.kr' &&
            sessionStorage.getItem('adminLogined') == 1) {
            return true;
        }
        if (logined == 0) {
            //console.log('fakeAuth return false');
            return false;
        }
        return true;
    }
}
export function ProducerPrivateRoute({ component: Component, ...rest }) {
    return (
        <Route
            {...rest}
            render={
                props => {
                    const isLoggedIn = fakeAuth.isAuthenticated();
                    //console.log('in privateRoute:', props.location); //쿠키fake로그인 check라서 자주 로그인되어있는 문제가 있음.
                    //console.log('in privateRoute: isLoggedIn: ', isLoggedIn); //쿠키fake로그인 check라서 자주 로그인되어있는 문제가 있음.
                    return (isLoggedIn) ? (
                            <Component {...props} />
                        ) :
                        (
                            props.history.push('/producer/webLogin')
                        );
                }
            }
        />
    );
}
