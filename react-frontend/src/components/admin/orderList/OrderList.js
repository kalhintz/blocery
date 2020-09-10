import React, { Component, PropTypes } from 'react';
import { Button } from 'reactstrap'
import "react-table/react-table.css"
import { getAllOrderDetailList } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import { getProducerByProducerNo } from "~/lib/producerApi";
import ExcelUtil from '~/util/ExcelUtil'
import { ProducerFullModalPopupWithNav, ProducerProfileCard, ExcelDownload } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import Goods from '~/components/shop/goods/Goods'

import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";

export default class OrderList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            excelData: {
                columns: [],
                data: []
            },
            isOpen: false,
            modalType: '',
            orderSeq: null,
            goodsNo: null,
            producerInfo: null,
            frameworkComponents: {
                goodsNmRenderer: this.goodsNmRenderer,
                farmNmRenderer: this.farmNmRenderer,
                vatRenderer: this.vatRenderer,
                timeSaleRenderer: this.timeSaleRenderer
            },
            columnDefs: [
                {headerName: "주문일련번호", field: "orderSeq", sort:"desc"},
                {headerName: "주문상태", field: "orderStatus", width: 80},
                {headerName: "농가명", field: "farmName", cellRenderer: "farmNmRenderer", width: 100},
                // {headerName: "생산자번호", field: "producerNo", width: 90},
                {headerName: "상품명", field: "goodsNm", cellRenderer: "goodsNmRenderer", suppressMenu: "false", width: 150},
                {headerName: "결제수단", field: "payMethod", width: 80},
                {headerName: "총주문금액(원)", field: "orderPrice", width: 120},
                {headerName: "상품구분", field: "timeSaleGoods", width: 100, cellRenderer: "timeSaleRenderer" },
                {headerName: "커미션(%)", field: "feeRate", width: 90},
                {headerName: "부가세", field: "vatFlag", cellRenderer: "vatRenderer", width: 80},
                {headerName: "카드결제(원)", field: "cardPrice", width: 110},
                {headerName: "토큰결제(blct)", field: "blctToken", width: 130},
                {headerName: "주문당시환율", field: "orderBlctExchangeRate", width: 110},
                {headerName: "택배사", field: "transportCompanyName"},
                {headerName: "송장번호", field: "trackingNumber"},
                {headerName: "주문일시", field: "orderDate"},
                {headerName: "출고일시", field: "trackingNumberTimestamp"},
                {headerName: "구매확정일시", field: "consumerOkDate"},
                {headerName: "주문수량", field: "orderCnt", width: 120,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        // console.log(params.data.partialRefundCount);
                        return (params.data.partialRefundCount > 0 ? `${params.data.orderCnt} (+부분환불 ${params.data.partialRefundCount}건)` : params.data.orderCnt);
                    }
                },
                {headerName: "주문자", field: "consumerNm", width: 80},
                {headerName: "이메일", field: "consumerEmail"},
                {headerName: "주문자전화번호", field: "consumerPhone"},
                {headerName: "수령자명", field: "receiverName", width: 80},
                {headerName: "수령자전화번호", field: "receiverPhone"},
                {headerName: "예상배송 시작일", field: "expectShippingStart"},
                {headerName: "예상배송 종료일", field: "expectShippingEnd"},

            ],
            defaultColDef: {
                width: 120,
                resizable: true
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        }
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        await this.search();
    }

    search = async () => {
        this.setState({ loading: true });

        const { status, data } = await getAllOrderDetailList();
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }

        console.log(data);

        data.map(({orderSeq, consumerOkDate, payStatus, trackingNumber, orderConfirm}, index) => {
            const order = {
                orderSeq: orderSeq,
                consumerOkDate: consumerOkDate,
                payStatus: payStatus,
                trackingNumber: trackingNumber,
                orderConfirm: orderConfirm,
            }

            let orderStatus = this.getOrderStatus(order);
            let orderDateToString = data[index].orderDate ? ComUtil.utcToString(data[index].orderDate,'YYYY-MM-DD HH:mm'):null;
            let expectShippingStartToString = data[index].expectShippingStart ? ComUtil.utcToString(data[index].expectShippingStart,'YYYY-MM-DD HH:mm'):null;
            let expectShippingEndToString = data[index].expectShippingEnd ? ComUtil.utcToString(data[index].expectShippingEnd,'YYYY-MM-DD HH:mm'):null;
            let consumerOkDateToString = data[index].consumerOkDate ? ComUtil.utcToString(data[index].consumerOkDate,'YYYY-MM-DD HH:mm'):null;
            let trackingNumberTimeToString = data[index].trackingNumberTimestamp ? ComUtil.utcToString(data[index].trackingNumberTimestamp,'YYYY-MM-DD HH:mm'):null;


            let cardPrice = (data[index].cardPrice == 0)? null: data[index].cardPrice;
            let blctToken = (data[index].blctToken == 0)? null: data[index].blctToken;

            data[index].expectShippingStart = expectShippingStartToString
            data[index].expectShippingEnd = expectShippingEndToString
            data[index].orderDate = orderDateToString
            data[index].orderStatus = orderStatus
            data[index].consumerOkDate = consumerOkDateToString
            data[index].trackingNumberTimestamp = trackingNumberTimeToString

            data[index].cardPrice = cardPrice;
            data[index].blctToken = blctToken;

        })

        this.setState({
            data: data,
            loading: false
        })

        this.setExcelData();
    }

    getOrderStatus = (order) => {
        let orderStatus = '';

        if(order.consumerOkDate) {
            orderStatus = '구매확정'
        } else if(order.payStatus === 'cancelled') {
            orderStatus = '취소완료'
        } else if(order.trackingNumber) {
            orderStatus = '배송중'
        } else if(order.orderConfirm === 'confirmed'){
            orderStatus = '출고대기'
        } else {
            orderStatus = '미확인'
        }

        return orderStatus;
    }

    goodsNmRenderer = ({value, data:rowData}) => {
        return (<span className='text-primary' a href="#" onClick={this.onGoodsNmClick.bind(this, rowData)}><u>{rowData.goodsNm}</u></span>);
    }

    // 상품상세정보 조회
    onGoodsNmClick = (data) => {
        console.log(data)
        this.setState({
            goodsNo: data.goodsNo,
            isOpen: true,
            modalType: 'goodsInfo'
        })
    }

    farmNmRenderer = ({value, data:rowData}) => {
        return (<span className='text-primary' a href="#" onClick={this.onFarmNmClick.bind(this, rowData)}><u>{rowData.farmName}</u></span>);
    }

    vatRenderer = ({value, data:rowData}) => {
        return (value ? "과세" : "면세");
    }

    timeSaleRenderer = ({value, data:item}) => {
        return item.timeSaleGoods ? "포텐타임" : ( item.blyTimeGoods? "블리타임" : "일반상품" );
    }

    // Ag-Grid Cell 스타일 기본 적용 함수
    getCellStyle ({cellAlign,color,textDecoration,whiteSpace}){
        if(cellAlign === 'left') cellAlign='flex-start';
        else if(cellAlign === 'center') cellAlign='center';
        else if(cellAlign === 'right') cellAlign='flex-end';
        else cellAlign='flex-start';
        return {
            display: "flex",
            alignItems: "center",
            justifyContent: cellAlign,
            color: color,
            textDecoration: textDecoration,
            whiteSpace: whiteSpace
        }
    }

    // 농가정보 조회
    onFarmNmClick = async (data) => {
        const { data : producerInfo } = await getProducerByProducerNo(data.producerNo)
        console.log(producerInfo)
        this.setState({
            producerInfo: producerInfo,
            producerNo: data.producerNo,
            isOpen: true,
            modalType: 'farmInfo'
        })
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    onClose = () => {
        this.setState({
            modalType: ''
        })
        this.toggle();
    }

    setExcelData = () => {
        let excelData = this.getExcelData();
        //console.log("excelData",excelData)
        this.setState({
            excelData: excelData
        })
    }

    getExcelData = () => {
        const columns = [
            '주문번호', '주문확인', '농가명',
            '상품명', '결제수단', '주문수량', '[받는]사람', '[받는]연락처', '[받는]주소', '[받는]우편번호','배송메세지', '택배사', '송장번호',
            '주문일시', '출고일시', '구매확정일시', '총주문금액(원)', '상품구분', '판매지원금(원)', '커미션(%)', '부가세', '카드결제(원)', '토큰결제(BLCT)', '주문당시 환율', '배송비', '위약금',
            '수수료(보상포함금액)', '소비자 구매보상(BLCT)', '생산자 판매보상(BLCT)', '지연보상', 'Blocery BLCT 수익',
            '취소수수료(원)', '취소수수료(BLCT)','생산자 지급액(원)', '생산자 지급 BLCT',
            '포장 양', '포장단위', '판매개수', '품목명',
            '주문자명', '주문자이메일', '주문자연락처',
            '예상배송시작일', '예상배송종료일'
        ]

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.map((item ,index)=> {
            let orderStatus = this.getOrderStatus(item);
            let orderDate = item.orderDate ? ComUtil.utcToString(item.orderDate,'YYYY-MM-DD HH:mm'):null;
            let consumerOkDate = item.consumerOkDate ? ComUtil.utcToString(item.consumerOkDate,'YYYY-MM-DD HH:mm'):null;
            let trackingNumberTimestamp = item.trackingNumberTimestamp ? ComUtil.utcToString(item.trackingNumberTimestamp,'YYYY-MM-DD HH:mm'):null;
            let bloceryOnlyFeeBlct = item.payMethod === 'blct' ? item.bloceryOnlyFeeBlct : 0;
            let timeSale = item.timeSaleGoods ? "포텐타임" : ( item.blyTimeGoods? "블리타임" : "일반상품" );
            let vatFlag = item.vatFlag ? "과세" : "면세";
            let expectShippingStart = item.expectShippingStart ? ComUtil.utcToString(item.expectShippingStart):null;
            let expectShippingEnd = item.expectShippingEnd ? ComUtil.utcToString(item.expectShippingEnd):null;

            return [
                item.orderSeq, orderStatus, item.farmName,
                item.goodsNm, item.payMethod, item.orderCnt, item.receiverName, item.receiverPhone, `${item.receiverAddr} ${item.receiverAddrDetail || ''}`, item.zipNo,item.deliveryMsg, item.transportCompanyName, item.trackingNumber,
                orderDate, trackingNumberTimestamp, consumerOkDate, item.orderPrice, timeSale, item.timeSaleSupportPrice, item.feeRate, vatFlag, item.cardPrice, item.blctToken, item.orderBlctExchangeRate ,item.deliveryFee, item.deposit,
                item.bloceryOnlyFee+item.consumerReward+item.producerReward, item.consumerRewardBlct, item.producerRewardBlct, item.delayPenalty, bloceryOnlyFeeBlct,
                item.cancelFee, item.cancelBlctTokenFee, item.payoutAmount, item.payoutAmountBlct,
                item.packAmount, item.packUnit, item.packCnt, item.itemName,
                item.consumerNm, item.consumerEmail, item.consumerPhone,
                expectShippingStart, expectShippingEnd
            ]
        })

        let excelData = data.sort((a, b) => {
            return parseInt(b[0]) - parseInt(a[0]);
        })

        return [{
            columns: columns,
            data: excelData
        }]
    }

    render() {
        if(this.state.data.length <= 0)
            return null

        return(
            <div>
                <div className="d-flex p-1">

                    <ExcelDownload data={this.state.excelData}
                                   fileName="관리자전체주문확인"
                                   buttonName = "Excel 다운로드"
                                  />

                    {/*<ExcelDownload data={this.state.excelData}*/}
                                   {/*fileName="관리자전체주문확인"*/}
                                   {/*sheetName="주문확인"*/}
                                   {/*button={<Button color={'success'} size={'sm'} block>*/}
                                       {/*<div className="d-flex">*/}
                                           {/*엑셀 다운로드*/}
                                       {/*</div>*/}
                                   {/*</Button>}/>*/}
                    <div className="flex-grow-1 text-right">
                        총 {this.state.data.length} 건
                    </div>

                </div>
                <div>
                    <div
                        className="ag-theme-balham"
                        style={{
                            height: '700px'
                        }}
                    >
                        <AgGridReact
                            enableSorting={true}                //정렬 여부
                            enableFilter={true}                 //필터링 여부
                            columnDefs={this.state.columnDefs}  //컬럼 세팅
                            defaultColDef={this.state.defaultColDef}
                            frameworkComponents={this.state.frameworkComponents}
                            // components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                            enableColResize={true}              //컬럼 크기 조정
                            overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                            //onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            rowData={this.state.data}
                        >
                        </AgGridReact>
                    </div>

                    {/* 상품상세 조회 */}
                    <ProducerFullModalPopupWithNav show={this.state.isOpen && this.state.modalType === 'goodsInfo'} title={'상품정보'} onClose={this.onClose}>
                        <Goods goodsNo={this.state.goodsNo} />
                    </ProducerFullModalPopupWithNav>

                    {/* 농가정보 조회 */}
                    <ProducerFullModalPopupWithNav show={this.state.isOpen && this.state.modalType === 'farmInfo'} title={'농가정보'} onClose={this.onClose}>
                        <ProducerProfileCard {...this.state.producerInfo} />
                    </ProducerFullModalPopupWithNav>
                </div>
            </div>
        );
    }
}