import React, { Component, Fragment } from 'react';
import { ShopXButtonNav, ModalConfirm } from '../../../common/index'
import {IconStore, IconStar} from '~/components/common/icons'

import { getConsumer, getRegularShopList, delRegularShop } from '~/lib/shopApi'

import { Button } from '~/styledComponents/shared/Buttons'
import { Link } from '~/styledComponents/shared/Links'
import { Div, Img, Flex, Span } from '~/styledComponents/shared/Layouts'
import { HrThin } from '~/styledComponents/mixedIn'

import { Server } from "~/components/Properties";
import Skeleton from '~/components/common/cards/Skeleton'
export default class RegularShopList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loginUser: '',
            shopList: undefined,
            cancelModal: false,
            selectedShopNo: 0
        }
    }

    async componentDidMount() {
        await this.loginCheck();

        await this.regularShopList();

        //await this.getCountRegular(this.state.shopList.producerNo);
    }

    // 로그인 체크
    loginCheck = async () => {
        let loginUser;

        loginUser = await getConsumer();

        this.setState({
            loginUser: (loginUser) ? loginUser.data : ''
        })
    }

    // 단골농장 리스트 조회
    regularShopList = async () => {
        const { data } = await getRegularShopList();

        this.setState({
            shopList: data
        })
    }

    // 생산자별 단골고객 수 조회 - 현재 미사용
    // getCountRegular = async (producerNo) => {
    //     const {data:count} = await countRegularConsumer(producerNo)
    //     return count;
    // }

    // 별 클릭시 단골 농장 삭제
    onClickStar = (shopNo) => {
        this.setState(prevState => ({
            cancelModal: !prevState.cancelModal,
            selectedShopNo: shopNo
        }));
    }

    modalOk = async (isConfirmed) => {
        if(isConfirmed) {
            await delRegularShop(this.state.selectedShopNo);

            alert('단골상점 취소가 완료되었습니다.')
            this.regularShopList();
        }
    }

    render() {
        const data = this.state.shopList
        return (
            <Fragment>
                <ShopXButtonNav underline history={this.props.history} historyBack>단골상점</ShopXButtonNav>
                <Flex fontSize={14} m={16}>
                    <Div bold>총 <Span fg='green'>{(data)?data.length + '개':'0개'}</Span> 단골상점</Div>
                </Flex>
                {
                    !data ? <Skeleton.ProductList count={5}/> :
                        data.length <= 0 ? (
                                <div>
                                    <HrThin m={0} />
                                    <div className={'w-100 h-100 bg-light d-flex justify-content-center align-items-center p-5 text-dark'}>{(data===undefined)?'':'등록된 단골 상점이  없습니다.'}</div>
                                </div>) :
                            data.map(({farmName, producerNo, producerName, shopNo, countConsumer, countSellingItems, producerImage}, index)=>{
                                return(
                                    <Div key={'shopItem'+index}>
                                        <Flex m={16}>
                                            <Link to={'/farmersDetailActivity?producerNo=' + producerNo}>
                                                <Div width={100} height={100} rounded={5}>
                                                    <Img src={ (!producerImage[0])? '': Server.getImageURL() + producerImage[0].imageUrl} alt={'사진'} />
                                                </Div>
                                            </Link>
                                            <Div ml={15}>
                                                <Link to={'/farmersDetailActivity?producerNo=' + producerNo}>
                                                    <Div mb={3} fontSize={12} fg={'green'}><IconStore /> {farmName} | {producerName} </Div>
                                                </Link>
                                                <Flex mb={2} fontSize={14}>
                                                    <Div fg={'adjust'} minWidth={90}>현재 판매상품</Div>
                                                    <Div>{countSellingItems}개</Div>
                                                </Flex>
                                                <Flex mb={7} fontSize={14}>
                                                    <Div fg={'adjust'} minWidth={90}>단골고객</Div>
                                                    <Div>{countConsumer}명</Div>
                                                </Flex>
                                                <Div>
                                                    <ModalConfirm title={'단골상점 취소'} content={'단골상점 취소 시 주요 소식 및 혜택을 받아보실 수 없습니다. 단골 상점을 취소하시겠습니까?'} onClick={this.modalOk}>
                                                        <Button height={30} bc={'secondary'} onClick={this.onClickStar.bind(this,shopNo)}>
                                                            <Flex fontSize={12}><IconStar /> &nbsp;단골취소</Flex>
                                                        </Button>
                                                    </ModalConfirm>
                                                </Div>
                                            </Div>
                                        </Flex>
                                        <HrThin m={0} />
                                    </Div>

                                )
                            })
                }

            </Fragment>
        )
    }

}