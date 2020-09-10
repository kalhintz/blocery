import React, { Component, Fragment } from 'react'
import { ProducerWebNav } from '~/components/common'
import { ProducerWebMenuList, ProducerWebSubMenuList, Server} from '~/components/Properties'
import { doLogout, getLoginUser, getLoginAdminUser, tempAdminProducerLogin, tempAdminProducerList } from '~/lib/loginApi'
import {Input} from 'reactstrap'
import classNames from 'classnames'

import Error from '~/components/Error'

import { Button } from 'reactstrap'

import {} from '~/components/Properties'

import Css from './ProducerWeb.module.scss'

class ProducerWebContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loginUser: {},
            adminUser: '',
            producerList: [],
            selectedProducerEmail: 'producer@ezfarm.co.kr'
        }
    }
    async componentDidMount(){

        //admin용 콤보
        let selectedProducerEmail = this.state.selectedProducerEmail;


        //일반 생산자 로직//////////////////////

        let loginProducer = await getLoginUser();
        console.log('ProducerWebContainer loginProducer', loginProducer);
        if (loginProducer)
            selectedProducerEmail  = loginProducer.email;



        ////////// tempProducer@ezfarm.co.kr 용도///////////////////////////////////
        // => AdminProducer 로그인: adminLoginCheck -  tempProducer일 경우, producer자동로그인 수행.-20200330
        let adminUser = await getLoginAdminUser();
        console.log('ProducerWebContainer - componentDidMount:', adminUser);

        let producerList = [];


        if (adminUser && adminUser.email === 'tempProducer@ezfarm.co.kr') {

            //(WebHome에서 수행) tempProducer@ezfarm.co.kr 로그인시. 생산자 자동로그인 (우선은 producer@ezfarm.co.kr로 자동 로그인?)
            let {data:loginInfo} = await (selectedProducerEmail)? tempAdminProducerLogin({email:selectedProducerEmail}) : tempAdminProducerLogin();
            console.log('tempAdminProducerLogin', loginInfo);

            if (loginInfo) {
                selectedProducerEmail = loginInfo.email;//producer 강제 로그인된 값을 받음.
            }


            let {data:tempProducerList} = await tempAdminProducerList();
            if (!tempProducerList) { //admin 미로그인 - 시간지나서 로그아웃 된 경우
                this.props.history.push('/admin/login')
            }

            tempProducerList.sort(function (a, b) {
                if (a.name > b.name) {
                    return 1;
                }
                if (b.name > a.name) {
                    return -1;
                }
                return 0;
            });
            
            //option List 생성..
            producerList = tempProducerList.map((producer) => {
                let option =  {value: producer.email, name:producer.name};
                return option;
            })


        }else {
            adminUser = '';   //adminUser로 생산자 로그인 방식 실패.

            if (!loginProducer && !adminUser) { //producer도 admin(tempAdmin)도 미로그인 이면
                this.props.history.push('/producer/webLogin')
            }
        }




        this.setState({
                loginUser:loginProducer,
                adminUser:adminUser,
                producerList:producerList,
                selectedProducerEmail: selectedProducerEmail
            })
    }

    onClickLogout = async () => {
        await doLogout();

        //자기 페이지 강제 새로고침()
        window.location = this.props.history.location.pathname
    }

    onItemChange = async (e) => {
        console.log('onItemChange', e.target.value)

        //value(농장명)으로 producer email 찾기.
        //console.log(this.state.producerList);

        let selectedProducer = this.state.producerList.find( prodOption => (prodOption.value === e.target.value));
        console.log('onItemChange - selectedProducer:', selectedProducer)

        //login시도
        let newLogin = {
            email:selectedProducer.value  //email
        }

        let {data:loginInfo} = await tempAdminProducerLogin(newLogin);
        console.log('onItemChange - tempAdminProducerLogin', loginInfo.email);

        this.setState({
            selectedProducerEmail: selectedProducer.value
        });

        window.location.reload(); //콤보 바꾸면, 전체화면 새로 고침

    }

    render() {
        const { id, subId } = this.props.match.params

        const mainMenuItem = ProducerWebMenuList.find(main => main.id === id)
        let subMenuItem = ProducerWebSubMenuList.find(subMenu => subMenu.parentId === id && subMenu.id === subId)

        return(

            <Fragment>
                { /* header */ }
                <div className={Css.header}>
                    <div className={Css.logo}>
                        MarketBly
                    </div>
                    <div className={'p-1 font-weight-bold'}>

                        {(!this.state.adminUser) &&
                            <span>{this.state.loginUser.name}</span>
                        }
                        { (this.state.adminUser)   &&
                            <div className='pl-3' style={{width: 200}}>
                                <Input type='select' name='select' id='producereList' onChange={this.onItemChange}>
                                    { this.state.producerList.map((producerOption,idx) => {
                                        console.log('on select option:', producerOption.value, this.state.selectedProducerEmail);
                                        return <option key={idx} name='producer' value={producerOption.value} selected={(producerOption.value===this.state.selectedProducerEmail)}> {producerOption.name} </option>
                                    })}
                                </Input>
                            </div>
                        }

                    </div>
                    <div className={'ml-auto p-1'}>
                        <span className={'small text-secondary mr-2'}>고객센터 031-421-3414</span>
                        <Button size={'sm'} outline onClick={this.onClickLogout}>로그아웃</Button>
                    </div>
                </div>
                { /* body */ }
                <div className={Css.body}>
                    { /* left */ }
                    <div className={Css.left}>
                        <ProducerWebNav id={id} subId={subId} history={this.props.history}/>
                    </div>
                    { /* content */ }
                    <div className={Css.contentWrap}>
                        <div className={Css.contentHeader}>
                            {
                                `${mainMenuItem.name} > ${subMenuItem.name}`
                            }
                            <div className={Css.contentHeaderExplain}>
                                {subMenuItem.explain}
                            </div>
                        </div>
                        <div className={classNames(Css.contentBody, !subMenuItem.noPadding && Css.padding)}>
                            {
                                subMenuItem ? <subMenuItem.page history={this.props.history} /> : <Error />
                            }
                        </div>

                    </div>
                </div>
            </Fragment>
        )
    }
}

export default ProducerWebContainer