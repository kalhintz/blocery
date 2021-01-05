import React, { Component, Fragment } from 'react'
import CssConsumer from './ShopTabBar.module.scss'
import CssProducer from './TabBarProducer.module.scss'


import PropTypes from 'prop-types'
import { tabBarData } from '../../Properties'
import { getLoginUserType } from '~/lib/loginApi'
import { Link } from 'react-router-dom'

import IconMenu from '~/images/icons/tabBar/ic_menu.svg'    //카테고리
import IconTime from '~/images/icons/tabBar/ic_time.svg'    //타임세일
import IconHome from '~/images/icons/tabBar/ic_home.svg'    //홈
import IconMy from '~/images/icons/tabBar/ic_my.svg'        //마이페이지
import IconImage from '~/images/icons/tabBar/ic_image.svg'  //찜한상품

//선택된 아이콘
import IconMenuP from '~/images/icons/tabBar/ic_menu_p.svg'  //카테고리
import IconTimeP from '~/images/icons/tabBar/ic_time_p.svg'    //타임세일
import IconHomeP from '~/images/icons/tabBar/ic_home_p.svg'  //홈
import IconMyP from '~/images/icons/tabBar/ic_my_p.svg'      //마이페이지
import IconImageP from '~/images/icons/tabBar/ic_image_p.svg'//찜한상품


class TabBar extends Component{

    constructor(props){
        super(props)
        this.state = {
            tabBarItems: null,
            userType: ''
        }
    }

    componentDidMount(){
        this.setUserType()
    }

    componentWillReceiveProps(nextProps){
        this.setUserType()
    }

    setUserType = async () => {
        const {data: userType} = await getLoginUserType()

        if(userType === '' || userType === 'consumer') {
            if(localStorage.getItem('userType') === 'producer') {          // 로그아웃 했을 때 마지막 로그인 유저가 producer였는지 consumer였는지에 따라 하단탭 표시
                this.setState({
                    tabBarItems: tabBarData.producer,
                    userType: 'producer'
                })
            } else {
                this.setState({
                    tabBarItems: tabBarData.shop,
                    userType: 'consumer'
                })
            }
        } else {
            this.setState({
                tabBarItems: tabBarData.producer,
                userType: 'producer'
            })
        }
    }

    // onClick = (idx) => {
    //
    //     window.location = this.state.tabBarItems[idx].pathname// props.data[0].pathname// "/main/recommend"
    //
    // }

    //탭바를 표시할지 여부
    isIgnored = () => {
        const pathname = this.props.ignoredPathnames.find(ignoredpathname => ignoredpathname === this.props.pathname)
        return pathname ? true : false
    }

    render(){
        // 1.0에서 주석처리
        //if(ComUtil.isMobileApp()) return null
        if(this.state.tabBarItems === null) return null
        // if(this.state.tabBarItems === null) return null
        else if(this.isIgnored()) return null

        return(
            <Fragment>

                {
                    (this.state.userType === 'consumer' || this.state.userType === '') &&(
                        <Fragment>
                            <div className={CssConsumer.emptySpace}></div>
                            <div className={CssConsumer.tabBar}>
                                <Link to={this.state.tabBarItems[0].pathname} >
                                    {
                                        this.props.pathname === this.state.tabBarItems[0].pathname ? <img src={IconMenuP} /> : <img src={IconMenu} />
                                    }
                                </Link>

                                <Link to={this.state.tabBarItems[1].pathname} >
                                    {
                                        this.props.pathname === this.state.tabBarItems[1].pathname ? <img src={IconTimeP} /> : <img src={IconTime} />
                                    }
                                </Link>
                                <Link to={this.state.tabBarItems[2].pathname} >
                                    {
                                        this.props.pathname === this.state.tabBarItems[2].pathname ? <img src={IconHomeP} /> : <img src={IconHome} />
                                    }
                                </Link>
                                <Link to={this.state.tabBarItems[3].pathname} >
                                    {
                                        this.props.pathname === this.state.tabBarItems[3].pathname ? <img src={IconMyP} /> : <img src={IconMy} />
                                    }
                                </Link>
                                <Link to={this.state.tabBarItems[4].pathname} >
                                    {
                                        this.props.pathname === this.state.tabBarItems[4].pathname ? <img src={IconImageP} /> : <img src={IconImage} />
                                    }
                                </Link>
                            </div>
                        </Fragment>
                    )
                }
                {
                    this.state.userType === 'producer' && (
                        <Fragment>
                            <div style={{height: '3.5rem'}}></div>
                            <div className={CssProducer.wrap}>
                                {
                                    this.state.tabBarItems.map((item, index)=>{
                                        const isActive = this.props.pathname === item.pathname
                                        return(
                                            <section key={'tabbar'+index} style={{borderRight: index < this.state.tabBarItems.length -1 ? '1px solid whitesmoke': null}}>
                                                <Link to={this.state.tabBarItems[index].pathname} className={'text-dark'}>
                                                    <div>{<item.icon color={isActive ? 'default' : 'action'} fontSize={'small'}/>}</div>
                                                    <div className={isActive ? CssProducer.active : null}>{item.name}</div>
                                                </Link>
                                            </section>
                                        )
                                    })
                                }
                            </div>
                        </Fragment>
                    )
                }


            </Fragment>
        )

        // return(
        //
        //     <Fragment>
        //         <div style={{height: '3.5rem'}}></div>
        //         <div className={Css.wrap}>
        //             {
        //                 this.state.tabBarItems.map((item, index)=>{
        //                     const isActive = this.props.pathname === item.pathname
        //                     return(
        //                         <section key={'tabbar'+index} style={{borderRight: index < this.state.tabBarItems.length -1 ? '1px solid whitesmoke': null}}>
        //                             <Link to={this.state.tabBarItems[index].pathname} className={'text-dark'}>
        //                                 <div>{<item.icon color={isActive ? 'default' : 'action'} fontSize={'small'}/>}</div>
        //                                 <div className={isActive ? Css.active : null}>{item.name}</div>
        //                             </Link>
        //                         </section>
        //                     )
        //                 })
        //             }
        //         </div>
        //     </Fragment>
        //
        //
        // )
    }
}
TabBar.propTypes = {
    pathname: PropTypes.string.isRequired,
    ignoredPathnames: PropTypes.array      //탭바 표시하지 않을 pathname
}
TabBar.defaultProps = {
    ignoredPathnames: []
}
export default TabBar