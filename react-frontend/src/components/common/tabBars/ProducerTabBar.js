import React, { Component, Fragment } from 'react'
import Css from './ProducerTabBar.module.scss'
import PropTypes from 'prop-types'
import { tabBarData } from '../../Properties'
import { Link } from 'react-router-dom'

class ProducerTabBar extends Component{

    constructor(props){
        super(props)
        this.state = {
            tabBarItems: tabBarData.producer,
        }
    }

    componentDidMount(){
        // this.setUserType()
    }

    componentWillReceiveProps(nextProps){
        // this.setUserType()
    }

    // setUserType = async () => {
    //     const {data: userType} = await getLoginUserType()
    //
    //     if(userType === '' || userType === 'consumer') {
    //         if(localStorage.getItem('userType') === 'producer') {          // 로그아웃 했을 때 마지막 로그인 유저가 producer였는지 consumer였는지에 따라 하단탭 표시
    //             this.setState({
    //                 tabBarItems: tabBarData.producer,
    //                 userType: 'producer'
    //             })
    //         } else {
    //             this.setState({
    //                 tabBarItems: tabBarData.shop,
    //                 userType: 'consumer'
    //             })
    //         }
    //     } else {
    //         this.setState({
    //             tabBarItems: tabBarData.producer,
    //             userType: 'producer'
    //         })
    //     }
    // }

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
        if(this.state.tabBarItems === null) return null
        else if(this.isIgnored()) return null
        return(
            <Fragment>
                <div style={{height: '3.5rem'}}></div>
                <div className={Css.wrap}>
                    {
                        this.state.tabBarItems.map((item, index)=>{
                            const isActive = this.props.pathname === item.pathname
                            return(
                                <section key={'tabbar'+index} style={{borderRight: index < this.state.tabBarItems.length -1 ? '1px solid whitesmoke': null}}>
                                    <Link to={this.state.tabBarItems[index].pathname} className={'text-dark'}>
                                        <div>{<item.icon color={isActive ? 'default' : 'action'} fontSize={'small'}/>}</div>
                                        <div className={isActive ? Css.active : null}>{item.name}</div>
                                    </Link>
                                </section>
                            )
                        })
                    }
                </div>
            </Fragment>
        )
    }
}
ProducerTabBar.propTypes = {
    pathname: PropTypes.string.isRequired,
    ignoredPathnames: PropTypes.array      //탭바 표시하지 않을 pathname
}
ProducerTabBar.defaultProps = {
    ignoredPathnames: []
}
export default ProducerTabBar