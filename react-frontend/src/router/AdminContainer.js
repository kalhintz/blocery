import React, { Component, Fragment } from 'react'
import { AdminNav } from '../components/common'
import { AdminSubMenuList, Server} from '../components/Properties'
import { TabBar, RadioButtons } from '../components/common'
import { getLoginAdminUser, doAdminLogout } from '~/lib/loginApi'
import {Link} from 'react-router-dom'

import Error from '../components/Error'

import {Button, Input, Badge} from 'reactstrap'

const bindData = [
    { value: 'shop', label:'마켓블리'},
    { value: 'fintech', label:'나이스푸드'}
];

class AdminContainer extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loginedAdmin: null
        }
    }


    async componentDidMount(){
        let loginedAdmin = await getLoginAdminUser();

        if (!loginedAdmin) {
            this.props.history.push('/admin/login')
        }
        else {
            this.setState({
                loginedAdmin: loginedAdmin
            })
        }
    }

    adminLogout = async () => {
        await doAdminLogout();
        this.props.history.push('/admin/login')
    }

    render() {
        const { type, id, subId } = this.props.match.params
        const ContentMenu = AdminSubMenuList.find(subMenu => subMenu.type === type && subMenu.parentId === id && subMenu.id === subId)
        return(

            <Fragment>

                <div className='p-2 bg-light'>


                    { /* Search Bar */ }
                    <div className='d-flex p-2'>
                        <div className='d-flex align-content-center font-weight-bold text-info f1'>
                            Blocery Admin
                        </div>

                        <div className='d-flex flex-grow-1 justify-content-end align-content-center'>
                            {/*<div className='m-1'>*/}
                                {/*<Badge color='warning' pill>+99</Badge>*/}
                            {/*</div>*/}
                            {/*<div className='m-1'>*/}
                                {/*<Input style={{width:300}} size={'sm'} placeholder='메뉴 조회'/>*/}
                            {/*</div>*/}
                            <div className='m-1'>
                                { (this.state.loginedAdmin && this.state.loginedAdmin.email === 'tempProducer@ezfarm.co.kr') &&
                                    <Link to={'/producer/web'}> [생산자Web으로 이동] </Link>
                                }
                            </div>
                            <div className='m-1'>
                                <RadioButtons size={'sm'}
                                              value={bindData.find(item => item.value === type)}
                                              options={bindData} onClick={ ({value}) =>{

                                    if(value === 'shop'){
                                        // window.location = `/admin/shop/order/orderList`
                                        this.props.history.push(Server.getAdminShopMainUrl())
                                    }else{
                                        // window.location = `/admin/fintech/code/classItemList`
                                        this.props.history.push(Server.getAdminFintechMainUrl())
                                    }

                                }} />
                            </div>
                            <div className='m-1'>
                                <Button size={'sm'} outline onClick={this.adminLogout}>로그아웃</Button>
                            </div>
                        </div>
                    </div>

                    { /* Nav */ }
                    <AdminNav type={type} id={id} subId={subId} />

                </div>

                {
                    /* Content */
                    ContentMenu ? <ContentMenu.page /> : <Error />
                }

            </Fragment>
        )
    }
}

export default AdminContainer