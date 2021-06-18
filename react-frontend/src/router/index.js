import React, { Component, useState, useEffect } from 'react'
import loadable, {lazy} from "@loadable/component";
import { Route, Switch, Redirect, withRouter } from 'react-router-dom'
import ComUtil from '../util/ComUtil'
import { Server } from '~/components/Properties'
import { ProducerPrivateRoute } from "./ProducerPrivateRoute";
import { AdminPrivateRoute } from "./AdminPrivateRoute";
import {exchangeWon2BLCTHome} from '~/lib/exchangeApi'
import SecureApi from '~/lib/secureApi'

const ShopContainer = loadable(() => import('./ShopContainer'));
const AdminContainer = loadable(() => import('./AdminContainer'));
const ProducerWebContainer = loadable(() => import('./ProducerWebContainer'));
const SampleContainer = loadable(() => import('./SampleContainer'));
const AdminLogin = loadable(() => import('~/components/admin/AdminLogin'));
const ProducerJoinWeb = loadable(() => import('~/components/shop/join/ProducerJoinWeb'))
const ProducerJoinWebFinish = loadable(() => import('~/components/shop/join/ProducerJoinWebFinish'))
const WebLogin = loadable(() => import('~/components/producer/web/WebLogin'))
const Error = loadable(() => import('~/components/Error'));

const AdminPrivateContainer = () => <AdminPrivateRoute component={AdminContainer} />
const ProducerWebPrivateContainer = () => <ProducerPrivateRoute component={ProducerWebContainer} />

const index = ({history}) => {

    const {pathname} = history.location

    useEffect(() => {
        sessionStorage.setItem("pathname", pathname)
    }, [pathname])

    useEffect(() => {

        //라우터 변경시 callback : 항상 최상단으로 유지
        history.listen((location, action) => {
            //bly 기준가 sessionStorage 에 저장
            exchangeWon2BLCTHome();

            if(action === "POP"){
                //window.scrollTo({top:0, behavior:'smooth'});
                const pageYOffset = sessionStorage.getItem("pageYOffset_"+location.pathname)
                if(pageYOffset){

                    setTimeout(()=>{
                        // if (pageYOffset <= 300){
                        //     window.scrollTo({top:pageYOffset, behavior: 'smooth'})
                        // }
                        // else{
                            window.scrollTo({top:pageYOffset})
                        // }

                    },500)

                }
            }

            if(action === "PUSH") {
                const pageYOffset = window.pageYOffset;
                sessionStorage.setItem("pageYOffset_"+ sessionStorage.getItem("pathname"), pageYOffset)
                // sessionStorage.setItem("scrollPosition_"+ history.location.pathname, 0)
                window.scrollTo(0,0)
            }


            SecureApi.setCsrf().then(()=>{
                SecureApi.getCsrf().then(({data})=>{
                    localStorage.setItem('xToken',data);
                });
            });
        });

    },[]);

    return(
        <Switch>

            <Route exact path='/producerJoinWeb' component={ProducerJoinWeb}/>
            <Route exact path='/producerJoinWeb/finish' component={ProducerJoinWebFinish}/>

            <Route exact path={'/b2c'} render={()=><Redirect to={'/home/1'}/>} />

            {/* 관리자 로그인 검증*/}
            <Route path={'/admin/login'} component={AdminLogin} />
            <Route path={'/admin/:type/:id/:subId'} component={AdminPrivateContainer} />
            <Route path={'/admin'} render={() => (<Redirect to={Server.getAdminShopMainUrl()}/>)} />

            {/* 생산자 웹 로그인 검증*/}
            <Route path={'/producer/web/:id/:subId'} component={ProducerWebPrivateContainer} />
            {/* producer/ 로 접속 하였을 경우 최초 페이지 지정 */}
            <Route exact path={'/producer/web'} render={() => (<Redirect to={'/producer/web/home/home'}/>)} />
            <Route exact path={'/producer/webLogin'} component={WebLogin}/>
            {/* producer 로 접속 하였을 경우 최초 페이지 지정 */}
            <Route exact path={'/producer'} render={() =>
            {
                return <Redirect to={'/producer/web/home/home'}/>
            }
            } />

            <Route path={'/sample'} component={SampleContainer}/>


            <Route path={'/'} component={ShopContainer} />

            <Route component={Error}/>
        </Switch>
    )
}

export default withRouter(index)