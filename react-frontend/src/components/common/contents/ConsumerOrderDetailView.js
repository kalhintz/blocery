import React, {useState, useEffect} from 'react';
import {getConsumerByConsumerNo, getConsumerVerifyAuth, getOrderDetailByConsumerNo} from '~/lib/adminApi'
import {Div, Flex, Span, GridColumns} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";
import styled from "styled-components";
import {Modal, ModalBody, ModalHeader, Table, Collapse} from "reactstrap";
import KycView from "~/components/common/contents/KycView";
import {useModal} from "~/util/useModal";
const Label = styled(Div)`
    min-width: 150px;
`

const PAYSTATUS = {
    ready: '미결제',
    paid: '결제완료',
    cancelled: '결제취소',
    failed: '결제실패',
}

const width = 110

const Tr = ({d}) => {
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const toggle = () => {
        setModalState(!modalOpen)
    }
    const goodsNm = d.onePlusSubFlag ? `${d.goodsNm} - 증정품` : d.goodsNm;
    return(
        <>
            <tr style={{fontSize:12}}>
                <td>{d.directGoods ? '즉시' : '예약'}</td>
                <td><a href={`/goods?goodsNo=${d.goodsNo}`} target={'_blank'} ><u>{goodsNm}</u></a></td>
                <td style={{textAlign:'center'}}>{d.orderCnt} {d.partialRefundCount > 0 && <Span fg={'danger'}>({d.partialRefundCount})</Span>}</td>
                <td style={{textAlign:'right'}}>{ComUtil.addCommas(d.totalGoodsPrice)}</td>
                <td style={{textAlign:'right'}}>{ComUtil.addCommas(d.deliveryFee)}</td>
                <td style={{textAlign:'right'}}>{ComUtil.addCommas((d.orderPrice))}</td>
                <td>{ComUtil.utcToString(d.orderDate)}</td>
                <td>{ComUtil.utcToString(d.consumerOkDate)}</td>
                <td>{d.consumerRewardBlct}</td>
                <td>{d.orderBlctExchangeRate}</td>
                <td>{d.consumerOkBlctExchangeRate}</td>
                <td onClick={toggle}>
                    <Span cursor><u>{d.payMethod}</u></Span>
                </td>
                <td>{PAYSTATUS[d.payStatus]}</td>
            </tr>
            {
                modalOpen && (
                    <tr>
                        <td colSpan={13}>
                            <Flex alignItems={'flex-start'} fontSize={12} p={5} bg={'white'} bc={'secondary'} rounded={5}>

                                <Div flexGrow={1}>
                                    <Flex>
                                        <Div width={width}>주문일련번호</Div>
                                        <Div>{d.orderSeq}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>주문그룹번호</Div>
                                        <Div>{d.orderGroupNo}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>주문자명</Div>
                                        <Div>{d.consumerNm}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>주문자이메일</Div>
                                        <Div>{d.consumerEmail}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>주문자연락처</Div>
                                        <Div>{d.consumerPhone}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>수령자</Div>
                                        <Div>{d.receiverName}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>수령자연락처</Div>
                                        <Div>{d.receiverPhone}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>수령자우편번호</Div>
                                        <Div>{d.receiverZipNo}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>수령자주소</Div>
                                        <Div>{d.receiverAddr}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>수령자주소상세</Div>
                                        <Div>{d.receiverAddrDetail}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>베송메세지</Div>
                                        <Div>{d.deliveryMsg}</Div>
                                    </Flex>
                                </Div>
                                <Div flexGrow={1}>
                                    <Flex>
                                        <Div width={width}>선물하기 여부</Div>
                                        <Div>{d.gift ? 'Y' : 'N'}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>선물 보내는이</Div>
                                        <Div>{d.senderName}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>선물 메세지</Div>
                                        <Div>{d.giftMsg}</Div>
                                    </Flex>

                                    <Flex>
                                        <Div width={width}>사용 쿠폰번호</Div>
                                        <Div>{d.usedCouponNo}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>쿠폰BLY</Div>
                                        <Div>{d.usedCouponBlyAmount}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>보너스상품여부</Div>
                                        <Div>{d.onePlusSubFlag ? '예' : '아니오'}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>택배사(코드)</Div>
                                        <Div>{d.transportCompanyName}({d.transportCompanyCode})</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>송장번호</Div>
                                        <Div>{d.trackingNumber}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>송장번호입력일</Div>
                                        <Div>{ComUtil.utcToString(d.trackingNumberTimestamp, 'YYYY.MM.DD HH:mm:ss')}</Div>
                                    </Flex>

                                </Div>
                                <Div flexGrow={1}>
                                    <Flex>
                                        <Div width={width}>생산자 주문확인</Div>
                                        <Div>{d.orderConfirm === 'confirmed' ? '주문확인' : '출고(배송중)'}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>블리타임상품 리워드 </Div>
                                        <Div>{d.blyTimeReward}</Div>
                                    </Flex>

                                </Div>

                                <Div flexGrow={1}>
                                    <Flex>
                                        <Div width={width}>소비자 환불</Div>
                                        <Div>{d.refundFlag ? 'Y' : 'N'}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>소비자 부분환불</Div>
                                        <Div>{d.partialRefundCount.toFixed(1)}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>카드사코드</Div>
                                        <Div>{d.cardCode}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>카드사명칭</Div>
                                        <Div>{d.cardName}</Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={width}>PG연동코드</Div>
                                        <Div>{d.impUid}</Div>
                                    </Flex>
                                </Div>
                            </Flex>
                        </td>
                    </tr>
                )
            }
        </>
    )
}

const ModalContent = ({data}) => {

    let totalGoodsPrice = 0;
    let deliveryFee = 0;
    let orderPrice = 0;
    let consumerRewardBlct = 0;

    data.map(item => {
        totalGoodsPrice += item.totalGoodsPrice;
        deliveryFee += item.deliveryFee;
        orderPrice += item.orderPrice;
        consumerRewardBlct += item.consumerRewardBlct;
    })

    return(
        <Div>

            <Div maxHeight={500} overflow={'auto'}>
                <Table striped size={'sm'}>
                    <thead>
                    <tr style={{fontSize:12}}>
                        <th>구분</th>
                        <th>상품명</th>
                        <th>주문수량(환불)</th>
                        <th>상품가</th>
                        <th>배송비</th>
                        <th>결제금액</th>
                        <th>주문일시</th>
                        <th>구매확정일</th>
                        <th>리워드</th>
                        <th>주문당시환율</th>
                        <th>구매확정환율</th>
                        <th>결제방법</th>
                        <th>결제상태</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        data.map(d =>
                            <Tr d={d} />
                        )
                    }
                    {
                        data.length > 0 && (
                            <tr style={{fontWeight: 700, fontSize: 12}}>
                                <td colSpan={3} style={{textAlign:'right'}}>합계</td>
                                <td style={{textAlign:'right'}}>{ComUtil.addCommas(totalGoodsPrice)}</td>
                                <td style={{textAlign:'right'}}>{ComUtil.addCommas(deliveryFee)}</td>
                                <td style={{textAlign:'right'}}>{ComUtil.addCommas((orderPrice))}</td>
                                <td colSpan={2}></td>
                                <td>{ComUtil.addCommas(consumerRewardBlct)}</td>
                                <td colSpan={4}></td>
                            </tr>
                        )
                    }
                    </tbody>
                </Table>
            </Div>


        </Div>
    )
}

const ConsumerOrderDetailView = ({consumerNo}) => {
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    const [orderDetailList, setOrderDetailList] = useState()

    useEffect(() => {
        getOrderDetailList()
    }, [])

    const getOrderDetailList = async () => {
        const {data} = await getOrderDetailByConsumerNo(consumerNo)
        setOrderDetailList(data)
    }
    const modalToggle = () => {
        setModalState(!modalOpen)
    }
    if (!orderDetailList) return null

    return (
        <div>
            <Flex mb={16}>
                <Label>상품주문</Label>
                <Div cursor onClick={modalToggle}>
                    <u>{orderDetailList.length}건</u>
                </Div>
            </Flex>
            <Modal
                size={'lg'}
                style={{maxWidth: '100vw', width: '80%'}}
                isOpen={modalOpen}
                toggle={modalToggle}>
                <ModalHeader toggle={modalToggle}>
                    주문내역
                </ModalHeader>
                <ModalBody>
                    {
                        modalOpen && <ModalContent data={orderDetailList} />
                    }
                </ModalBody>
            </Modal>
        </div>
    );
};

export default ConsumerOrderDetailView;
