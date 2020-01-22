import React, { Component, Fragment } from 'react'

import FoodsDetail from '~/components/common/b2bFoodsDetail'
import { B2bShopXButtonNav, B2bShopOnlyXButtonNav } from '~/components/common'
import { getFoodsByFoodsNo } from '~/lib/b2bFoodsApi'
import { getSellerBySellerNo } from '~/lib/b2bSellerApi'
import ComUtil from '~/util/ComUtil'
import { BlocerySpinner, B2bCartLink } from '~/components/common'
import { Container, Row, Col } from 'reactstrap'

export default class Foods extends Component {
    constructor(props) {
        super(props)

        // const search = this.props.location.search
        // const params = new URLSearchParams(search)
        // const goodsNo = params.get('goodsNo')

        console.log('foods props : ', this.props)

        let foodsNo = this.props.foodsNo ||  ComUtil.getParams(this.props).foodsNo

        this.state = {
            foodsNo: foodsNo,
            loading: true,
            foods: null,
            seller: null,
            farmDiaries: [],
            images: null
        }
    }

    async componentDidMount(){
        window.scrollTo(0,0)
        await this.search()
    }
    search = async () => {

        this.setState({loading: true})
        const foodsNo = this.state.foodsNo

        const { data:foods } = await getFoodsByFoodsNo(foodsNo)
        console.log('foods:',foods, foods.sellerNo)
        const { data:seller } = await getSellerBySellerNo(foods.sellerNo)

        this.setState({
            loading: false,
            foods: foods,
            seller: seller,
            images: foods.goodsImages
        })
    }

    render() {
        return(
            <Container>
                <Row>
                    <Col className={'p-0'}>
                        <div className='position-relative'>
                            <div className='d-flex position-absolute p-1' style={{top: 0, left: 0, zIndex: 5}}>
                                <B2bShopOnlyXButtonNav back history={this.props.history} style={{filter: 'drop-shadow(2px 2px 2px #343a40)', fontSize: '2rem'}}/>
                            </div>
                            <div className='d-flex position-absolute p-3' style={{top: 0, right: 0, zIndex: 5}}>
                                <B2bCartLink showShadow={true}/>
                            </div>
                            {
                                this.state.loading ? (<BlocerySpinner/>) :
                                    (
                                        <Container>
                                            <Row>
                                                <Col sm={12} className={'p-0'}>
                                                    <FoodsDetail
                                                        foods={this.state.foods}
                                                        seller={this.state.seller}
                                                        images={this.state.images}
                                                        history={this.props.history}
                                                    />
                                                </Col>
                                            </Row>
                                        </Container>
                                    )
                            }

                        </div>
                    </Col>
                </Row>
            </Container>
        )
    }
}