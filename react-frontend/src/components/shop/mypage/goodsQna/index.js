import React, { Component, Fragment } from 'react'
import { ShopXButtonNav } from '~/components/common'
import {IconReload} from '~/components/common/icons'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getGoodsQna } from '~/lib/shopApi'
import {getLoginUserType} from "~/lib/loginApi";
import {Webview} from "~/lib/webviewApi";
import ComUtil from "~/util/ComUtil";
import {Server} from "~/components/Properties";

import { Div, Span, Img, Flex, Right } from '~/styledComponents/shared/Layouts';
import { Badge, HrThin } from '~/styledComponents/mixedIn';
import { color } from '~/styledComponents/Properties'
import styled from 'styled-components'
import {getValue} from '~/styledComponents/Util'
import Skeleton from '~/components/common/cards/Skeleton'

const Answer = styled(Div)`
    font-size: ${getValue(12)};
    line-height: ${getValue(18)};
    background-color: ${color.background};
    padding: ${getValue(10)}};
`;
// border-bottom: 1px solid ${color.light};
export default class GoodsQnaList extends Component {
    constructor(props) {
        super(props);
        this.state= {
            qnaList: undefined,
            isVisible: false,
            index: null
        }

    }

    async componentDidMount() {
        const {data: userType} = await getLoginUserType();

        if(userType !== 'consumer'){
            Webview.openPopup('/login', true);
            return
        }

        this.search()
    }

    search = async () => {
        const {data : qnaList} = await getGoodsQna();

        this.setState({
            qnaList: (qnaList) ? qnaList : ''
        })
    }

    // 이미지 클릭 시 상품상세로
    moveToGoodsDetail = (goodsNo) => {
        this.props.history.push(`/goods?goodsNo=${goodsNo}`)
    }

    // goodsNo로 goodsImageUrl 조회
    getGoodsImage = async (goodsNo) => {
        const imgUrl = await getGoodsByGoodsNo(goodsNo)
        console.log(imgUrl)
    }

    // 다른 문의의 답글이 열리면 원래 열려 있던 답글은 닫힘
    toggle = (index) => {
        this.setState({
            isVisible: !this.state.isVisible,
            index: index
        })
    }

    render() {
        const data = this.state.qnaList
        return(
            <Fragment>
                <ShopXButtonNav underline historyBack>상품문의</ShopXButtonNav>
                <Flex fontSize={14} m={16}>
                    <Div bold>총 <Span fg='green'>{(data)?data.length + '개':'0개'}</Span> 문의</Div>
                </Flex>
                <Div>
                    {
                        !data ? <Skeleton count={5}/> :
                            data.length <= 0 ? <div className='w-100 h-100 d-flex justify-content-center align-items-center p-5 text-dark'>{(data===undefined)?'':'상품문의 내역이 없습니다.'}</div> :
                                data.map(({goodsNo, goodsName, goodsQue, goodsQueDate, goodsQnaStat, goodsAns, goodsAnsDate, producerName, goodsImages}, index) => (
                                    <Div m={16}>
                                        <Flex bg={'background'}>
                                            <Div m={10} width={36} height={36} flexShrink={0} onClick={this.moveToGoodsDetail.bind(this, goodsNo)}>
                                                <Img src={Server.getThumbnailURL()+goodsImages[0].imageUrl} alt={'사진'} />
                                            </Div>
                                            <Div>
                                                <Div fg={'dark'} fontSize={12}>{goodsName}</Div>
                                            </Div>
                                        </Flex>
                                        <Div fontSize={14} mb={8} mt={8} onClick={this.toggle.bind(this, index)}>{goodsQue}</Div>
                                        <Flex mt={8} onClick={this.toggle.bind(this, index)}>
                                            <Div fontSize={12} fg={'dark'}>{ComUtil.utcToString(goodsQueDate, 'YYYY.MM.DD HH:mm')}</Div>
                                            <Right>{(goodsQnaStat) === 'success' ? <Badge fg={'white'} bg={'green'}>답변완료</Badge> : <Badge fg={'white'} bg={'secondary'}>대기</Badge>}</Right>
                                        </Flex>
                                        {
                                            (this.state.isVisible && goodsQnaStat === 'success' && this.state.index === index)&& (
                                                <Answer mt={16}>
                                                    <Flex>
                                                        <IconReload />
                                                        <Div mb={4} fg='adjust'>판매자 답변</Div>
                                                    </Flex>
                                                    <Div mb={7} ml={18}>{goodsAns}</Div>
                                                    <Div ml={18} fontSize={12} fg={'dark'}>{ComUtil.utcToString(goodsAnsDate, 'YYYY.MM.DD HH:mm')}</Div>
                                                </Answer>
                                            )
                                        }
                                        <HrThin mt={15} />
                                    </Div>
                                ))
                    }
                </Div>

            </Fragment>
        )
    }

}