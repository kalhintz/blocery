import React, { Component, Fragment } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { SellerNav, SellerXButtonNav } from '../components/common'
import { SellerMenuList } from '../components/Properties'
import { B2bTabBar } from '../components/common'
class SellerContainer extends Component {
    constructor(props) {
        super(props)
    }

    //라우터로부터 넘어온 :id 로 메뉴조회 (Properties.js 참조)
    getMenu = (id) => {
        return SellerMenuList.find(item => item.route === '/b2b/seller' && item.id === id)
    }

    render() {

        console.log(this.props)

        const url = this.props.match.url                        //ex) /producer/farmDiaryList
        const id = this.props.match.params.id                   //ex)           farmDiaryList    //상위 route 에서 /producer/:id 로 지정되어있음(/index.js 참조)
        const { route, name, page, menuNav, closeNav } = this.getMenu(id)     //라우터로부터 넘어온 :id 로 메뉴조회
        console.log({url, page})
        return(

            <div>
                {
                    // Navigation - menu
                    menuNav && (
                        <Fragment>
                            <SellerNav data={SellerMenuList} id={id}/>
                            <div style={{height:'3em'}}></div>
                        </Fragment>
                    )
                }
                {
                    // Navigation - XButton & Title
                    // closeNav && <ProducerXButtonNav name={name}/>
                }

                <Route path={url} component={page} />

                <B2bTabBar
                    pathname={this.props.history.location.pathname}
                />


            </div>

            // <Switch>
            //     <Route path='/producer/join' component={Producer.ProducerJoin} />
            //     <Route path='/producer/goodsReg' component={Producer.GoodsReg} />
            //     <Route path='/producer/diaryReg' component={Producer.DiaryReg} />
            //     <Route path='/producer' component={Producer.FarmDiaryList} />
            //     <Route path='/producer/farmDiaryList' component={Producer.FarmDiaryList} />
            // </Switch>
        )
    }
}

export default SellerContainer