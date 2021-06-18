//shopTabbar state로 되도록 수정


import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { tabBarData } from '../../Properties'
import {Link} from '~/styledComponents/shared'

//previous version
// import IconMenu from '~/images/icons/tabBar/ic_menu.svg'    //카테고리
// import IconPlan from '~/images/icons/tabBar/ic_plan.svg'    //기획전
import IconHome from '~/images/icons/tabBar/ic_home.svg'    //홈
// import IconMy from '~/images/icons/tabBar/ic_my.svg'        //마이페이지
// import IconImage from '~/images/icons/tabBar/ic_image.svg'  //찜한상품
//
// //선택된 아이콘
// import IconMenuP from '~/images/icons/tabBar/ic_menu_p.svg'  //카테고리
// import IconPlanP from '~/images/icons/tabBar/ic_plan_p.svg'  //기획전
import IconHomeP from '~/images/icons/tabBar/ic_home_p.svg'  //홈
// import IconMyP from '~/images/icons/tabBar/ic_my_p.svg'      //마이페이지
// import IconImageP from '~/images/icons/tabBar/ic_image_p.svg'//찜한상품


import {Icon} from '~/components/common/icons'
import {Div, Flex, Fixed} from '~/styledComponents/shared/Layouts'
import styled from 'styled-components'

const iconStyle = {
    width: 24,
    height: 24
}
const linkStyle = {
    textAlign: 'center',
    textDecoration: 'none',
    color: 'black'
}

const TabBar = styled(Fixed)`
    bottom:0;
    width: 100%;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 20px;
    box-shadow: -1px -3px 6px 0 rgba(0, 0, 0, 0.06);
`;

const Item = styled(Flex)`
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    min-width: 56px;    //정중앙에 맞추기 위해서 가장 긴 글자인 마이페이지 텍스트의 width 기준을 넣어줌
`;
const Text = (props) => <Div fontSize={12} lineHeight={12} fg={!props.selected && 'secondary'}>{props.children}</Div>

class ShopTabBar extends Component{

    constructor(props){
        super(props)
        this.state = {
            tabBarItems: tabBarData.shop,
            // lastMdPickNotSeen: false
        }
    }

    async componentDidMount(){
        // let {data:lastMdPickNotSeen} = await getLastMdPickNotSeen();
        // console.log("&&&& lastMdPickNotSeen : ", lastMdPickNotSeen);
        // this.setState({
        //     lastMdPickNotSeen:lastMdPickNotSeen
        // });
    }

    componentWillReceiveProps(nextProps){

    }



    //탭바를 표시할지 여부
    isIgnored = () => {
        const pathname = this.props.ignoredPathnames.find(ignoredpathname => ignoredpathname === this.props.pathname)
        return pathname ? true : false
    }

    //사이드바 클릭
    onSidebarClick = () =>{
        this.props.onSidebarClick(true)
    }


    render(){
        //console.log({desc: 'ShopTabBar', props: this.props})

        // if(ComUtil.isMobileApp()) return null
        if(this.state.tabBarItems === null) return null
        else if(this.isIgnored()) return null

        const isHome = this.props.pathname === this.state.tabBarItems[2].pathname
        const isMdPick = this.props.pathname === this.state.tabBarItems[1].pathname
        const isCategory = this.props.pathname === this.state.tabBarItems[0].pathname
        const isMy = this.props.pathname === this.state.tabBarItems[3].pathname
        const isNewWin = this.props.menuOpen


        return(
            <Fragment>
                <Div height={54}></Div>
                <TabBar bg={'white'} className={'dom_bottom'}>
                {/*<div className={classNames(Css.tabBar, 'dom_bottom')}>*/}
                    
                    <Item>
                        <Link style={linkStyle} to={this.state.tabBarItems[1].pathname} >
                            {
                                // this.state.tabIndex === 1 ? <img src={IconPlanP} /> : <img src={IconPlan} />
                                isMdPick ? <Icon style={iconStyle} name='planP' /> : <Icon style={iconStyle} name='plan' />
                            }
                            <Text selected={isMdPick}>기획전</Text>
                        </Link>
                    </Item>
                    <Item>
                        <Link style={linkStyle} to={this.state.tabBarItems[0].pathname} >
                            {
                                // this.state.tabIndex === 0 ? <img src={IconMenuP} /> : <img src={IconMenu} />
                                isCategory ? <Icon style={iconStyle} name='menuP' /> : <Icon style={iconStyle} name='menu' />
                            }
                            <Text selected={isCategory}>카테고리</Text>
                        </Link>
                    </Item>
                    <Item>
                        <Link style={linkStyle} to={this.state.tabBarItems[2].pathname} >
                            {
                                isHome ? <img src={IconHomeP} /> : <img src={IconHome} />
                                // isHome ? <Icon style={iconStyle} name='homeNavP' /> : <Icon style={iconStyle} name='homeNav' />
                            }
                            {/*<Text selected={isHome}>홈</Text>*/}
                        </Link>
                    </Item>
                    <Item>
                        <Link style={linkStyle} to={this.state.tabBarItems[3].pathname} >
                            {
                                // this.state.tabIndex === 3 ? <img src={IconMyP} /> : <img src={IconMy} />
                                isMy ? <Icon style={iconStyle} name='myP' /> : <Icon style={iconStyle} name='my' />
                            }
                            <Text selected={isMy}>마이페이지</Text>
                        </Link>
                    </Item>
                    <Item>
                        <Div textAlign={'center'} cursor={1} onClick={this.onSidebarClick}>
                            {
                                isNewWin ? <Icon style={iconStyle} name='newWinP' /> : <Icon style={iconStyle} name='newWin' />
                            }
                            <Text selected={isNewWin}>최근본</Text>
                        </Div>
                    </Item>
                </TabBar>
            </Fragment>

        )

        //previous version
        // return(
        //     <Fragment>
        //         <div className={Css.emptySpace}></div>
        //         <div className={Css.tabBar}>
        //             <Link to={this.state.tabBarItems[0].pathname} >
        //                 {
        //                     // this.state.tabIndex === 0 ? <img src={IconMenuP} /> : <img src={IconMenu} />
        //                     this.props.pathname === this.state.tabBarItems[0].pathname ? <img src={IconMenuP} /> : <img src={IconMenu} />
        //                 }
        //             </Link>
        //
        //             <Link to={this.state.tabBarItems[1].pathname} >
        //                 {
        //                     // this.state.tabIndex === 1 ? <img src={IconPlanP} /> : <img src={IconPlan} />
        //                     this.props.pathname === this.state.tabBarItems[1].pathname ? <img src={IconPlanP} /> : <img src={IconPlan} />
        //                 }
        //             </Link>
        //             <Link to={this.state.tabBarItems[2].pathname} >
        //                 {
        //                     // this.state.tabIndex === 2 ? <img src={IconHomeP} /> : <img src={IconHome} />
        //                     this.props.pathname === this.state.tabBarItems[2].pathname ? <img src={IconHomeP} /> : <img src={IconHome} />
        //                 }
        //             </Link>
        //             <Link to={this.state.tabBarItems[3].pathname} >
        //                 {
        //                     // this.state.tabIndex === 3 ? <img src={IconMyP} /> : <img src={IconMy} />
        //                     this.props.pathname === this.state.tabBarItems[3].pathname ? <img src={IconMyP} /> : <img src={IconMy} />
        //                 }
        //             </Link>
        //             <a
        //                 onClick={this.onSidebarClick}
        //             >
        //                 {
        //                     this.props.menuOpen ? <img src={IconImageP} /> :  <img src={IconImage} />
        //                 }
        //             </a>
        //         </div>
        //     </Fragment>
        // )

    }
}
ShopTabBar.propTypes = {
    pathname: PropTypes.string.isRequired,
    ignoredPathnames: PropTypes.array      //탭바 표시하지 않을 pathname
}
ShopTabBar.defaultProps = {
    ignoredPathnames: []
}
export default ShopTabBar
