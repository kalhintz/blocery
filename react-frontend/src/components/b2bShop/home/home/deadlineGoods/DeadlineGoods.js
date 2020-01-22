import React, { Component, Fragment } from 'react';

import { Container, Row, Col, Alert } from 'reactstrap'
import farmDiary from '~/images/mainFarmers.jpeg'

import { MainGoodsCarousel, BlocerySpinner, RectangleNotice, ModalConfirm} from '~/components/common'
import { getBuyerFoodsSorted } from '~/lib/b2bFoodsApi'
import { Webview } from '~/lib/webviewApi'
import { getLoginUserType } from '~/lib/loginApi'

const style = {
    image: {
        width: '100%',
        height: '170px'
    },
    noPadding: { paddingLeft: 0, paddingRight: 0 }
}



const sectionStyle = {
    width: "100%",
    height: "400px",
    backgroundImage: `url(${farmDiary})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    paddingLeft: '20px',
    paddingTop: '320px'

}

export default class DeadlineGoods extends Component{
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            goods: null,
            userType: ''
        }
    }

    componentDidMount(){
        this.loginCheck()
        this.search()
        window.scrollTo(0,0)
    }
    search = async () => {
        this.setState({loading: true})

        const sorter = {direction: 'ASC', property: 'saleEnd'}
        const { data } = await getBuyerFoodsSorted(sorter, false)
        this.setState({
            loading: false,
            goods:data
        })
    }
    //[onClick] MD 카테고리 클릭
    onMdCategoryClicked = (props) =>{
        console.log(props)
    }

    movePage = (goods) => {

        console.log(goods)

        const pathName = this.props.history.location.pathname
        console.log('pathname:', pathName)
        // this.props.history.push(`${pathName}?goodsNo=3`)
        this.props.history.push(`/b2b/foods?foodsNo=${goods.foodsNo}`)
    }

    openLoginPopup = (isConfirmed) => {
        isConfirmed && Webview.openPopup(`/b2b/login`);// , this.loginCheck)
    }
    //로그인 여부 조회
    loginCheck = async () => {
        let {data:userType} = await getLoginUserType();
        this.setState({
            userType: userType
        })

    }

    checkLocalStorage =()=>{

    }
    render(){
        // localStorage.removeItem('eventNewPopup')
        return(
            <Fragment>
                {
                    this.state.loading && <BlocerySpinner/>
                }
                <br/>
            <Container fluid>

                <Row>
                    <Col>
                        {/*<h6>오늘의 추천 상품</h6>*/}
                        <h6 className={'text-secondary'}>오늘의 마감임박 상품</h6>
                    </Col>
                </Row>
                <Row>
                    <Col style={style.noPadding}>
                        {
                            this.state.goods && <MainGoodsCarousel
                                                    data={this.state.goods}
                                                    onClick={this.movePage}
                                                />
                        }
                    </Col>
                </Row>
                <Row>
                    <Col style={style.noPadding}>
                        {
                            /*
                            this.state.userType === '' && (
                                <ModalConfirm onClick={this.openLoginPopup} title={'α-BLCT 지급 이벤트'} content={<div>회원가입 후 자동 지급됩니다.<br/>회원가입 페이지로 이동 하시겠습니까?</div>}>
                                    <RectangleNotice>
                                        지금 <a className="alert-link">회원가입</a> 하면 <a className="alert-link">{ComUtil.addCommas(Const.INITIAL_TOKEN)}</a> α-BLCT토큰 자동 지급!
                                    </RectangleNotice>
                                </ModalConfirm>
                            )
                            */
                        }

                    </Col>
                </Row>

            </Container>

            </Fragment>
        )
    }
}
