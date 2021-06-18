import React, { Component, Fragment } from 'react'
import { Button } from 'reactstrap'

import { CopyToClipboard } from 'react-copy-to-clipboard'
import ComUtil from '~/util/ComUtil'
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import { getAllConfirmedOrder } from "~/lib/producerApi"
import { getConsumerGoodsByProducerNo } from "~/lib/goodsApi"
import { getLoginProducerUser } from '~/lib/loginApi'
import { scOntGetProducerOrderBlctHistory, scOntGetProducerGoodsBlctHistory, scOntGetBalanceOfBlctProducer } from "~/lib/smartcontractApi"
import {getServerToday} from "~/lib/commonApi";

import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";

export default class WebBlctHistory extends Component {
    constructor(props){
        super(props)
        this.state ={
            data: null,
            excelData: {
                columns: [],
                data: []
            },
            columnDefs: this.getColumnDefs(),
            defaultColDef: {
                width: 100,
                resizable: true,
                filter: true,
                sortable: true,
                floatingFilter: false,
                filterParams: {
                    newRowsAction: 'keep'
                }
            },
            components: {

            },
            frameworkComponents: {

            },
            rowHeight: this.rowHeight,
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',

            blctBalance: 0,
            loginUser:'',
            account: '',
            blctList: null,
            copied: false,
            isOpen: false,
            blctToWon: '',

            orderInfoList: [],       // 사용내역 조회시 필요한 주문정보
            goodsInfoList: [],       // 사용내역 조회시 필요한 상품정보
        }
    }

    async componentDidMount() {
        await this.getUser();

        // 보유 blct 조회
        let {data:blct} = await scOntGetBalanceOfBlctProducer(this.state.loginUser.account)
        this.setState({ blctBalance: blct })

        await this.search();
    }

    getUser = async () => {
        const loginUser = await getLoginProducerUser();
        if(!loginUser) {
            this.props.history.push('/producer/webLogin');
        }
        this.setState({
            loginUser: loginUser
        })
    }

    // 적립금 내역 조회
    search = async () => {
        let {data:blctToWon} = await BLCT_TO_WON();

        let { data:serverToday } = await getServerToday();
        this.serverToday = serverToday;

        // 로그인한 생산자의 주문목록 조회
        const { data:orderList } = await getAllConfirmedOrder();
        const { data:goodsList } = await getConsumerGoodsByProducerNo(this.state.loginUser.uniqueNo)  // 로그인된 생산자가 등록한 상품목록 조회

        this.setState({
            blctToWon: blctToWon,
            orderInfoList: orderList,
            goodsInfoList: goodsList
        })

        this.getBlctHistory();
    }

    // Blct 내역조회
    getBlctHistory = async () => {
        const orders = this.state.orderInfoList
        const goods = this.state.goodsInfoList
        const list = []

        const blctListOrder = orders.map(async order => {
            const { data: result } = await scOntGetProducerOrderBlctHistory(order.orderSeq)

            // receiveOrderRewardBlct(+판매보상 blct)
            if(result.receiveOrderRewardBlct > 0){
                const date = order.consumerOkDate
                if(date) {
                    list.push({
                        blct: '+ '+result.receiveOrderRewardBlct,
                        orderSeq: order.orderSeq,
                        date: date,
                        contents: order.goodsNm + ' | 고객명:' + order.consumerNm + '(' + order.consumerEmail + ')',
                        stateName: '소비자 구매확정 보상 적립',
                        gubun: '적립'
                    })
                }
            }

            // receiveReturnOrderDeposit(+걸어뒀던 미배송 보상금 돌려받음)
            if(result.receiveReturnOrderDeposit > 0){
                const date = order.consumerOkDate
                if(date) {
                    list.push({
                        blct: '+ '+result.receiveReturnOrderDeposit,
                        orderSeq: order.orderSeq,
                        date: date,
                        contents: order.goodsNm + ' | 고객명:' + order.consumerNm + '(' + order.consumerEmail + ')',
                        stateName: '구매확정에 따른 미배송 보증금 반환',
                        gubun: '적립'
                    })
                }
            }

            // receivePayoutBlct(+Blct로 결제한 주문건에 대한 정산금액)
            if(result.receivePayoutBlct > 0){
                const date = order.consumerOkDate
                if(date) {
                    list.push({
                        blct: '+ '+result.receivePayoutBlct,
                        orderSeq: order.orderSeq,
                        date: date,
                        contents: order.goodsNm + ' | 고객명:' + order.consumerNm + '(' + order.consumerEmail + ')',
                        stateName: 'BLCT로 결제한 주문 정산',
                        gubun: '적립'
                    })
                }
            }
        })

        await Promise.all(blctListOrder)

        const blctListGoods = goods.map(async good=>{
            const { data:result2 } = await scOntGetProducerGoodsBlctHistory(good.goodsNo)

            // payGoodsDeposit(-판매등록시 거는 미배송 보상금)
            if(result2.payGoodsDeposit > 0){
                const date = good.timestamp
                if(date) {
                    list.push({
                        blct: '- '+result2.payGoodsDeposit,
                        date: date,
                        contents: good.goodsNm + ' 판매등록',
                        stateName: '판매등록(미배송 보증금)',
                        gubun: '사용'
                    })
                }
            }

            // receiveReturnGoodsDeposit(+판매종료시 남은 미배송 보상금 돌려받음)
            if(result2.receiveReturnGoodsDeposit > 0){
                const date = good.returnDepositFinalDate
                if(date) {
                    list.push({
                        blct: '+ '+result2.receiveReturnGoodsDeposit,
                        date: date,
                        contents: good.goodsNm + ' 판매마감',
                        stateName: '잔여 미배송 보증금 반환',
                        gubun: '적립'
                    })
                }
            }
        })

        await Promise.all(blctListGoods)

        ComUtil.sortDate(list, 'date', true);

        if(list.length != 0) {
            this.setState({
                blctListCnt: list.length,
                data: list,
                columnDefs: this.getColumnDefs()
            })
        }

    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.ColumnApi;
    }

    // Ag-Grid column Info
    getColumnDefs () {
        let columnDefs = [];

        columnDefs = [
            {
                headerName: "No.",
                width: 70,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                },
                valueGetter: function(params) {
                    let rowNo = params.node.rowIndex + 1;
                    return rowNo;
                }
            },
            {
                headerName: "구분", field: "gubun",
                width: 100,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "일시", field: "date",
                width: 180,
                cellStyle:this.getCellStyle,
                valueGetter: function(params) {
                    //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                    return ComUtil.utcToString(params.data.date, 'YYYY-MM-DD HH:mm');
                },
                filter: "agDateColumnFilter",
                filterParams: {
                    filterParams: {
                        // comparator: function (filterLocalDateAtMidnight, cellValue) {
                        //     let dateAsString = cellValue;
                        //     if (dateAsString == null) return -1;
                        //
                        //     let filterLocalDate = ComUtil.utcToString(filterLocalDateAtMidnight);
                        //     let cellDate = ComUtil.utcToString(dateAsString);
                        //
                        //     if (filterLocalDate == cellDate) {
                        //         return 0;
                        //     }
                        //     if (cellDate < filterLocalDate) {
                        //         return -1;
                        //     }
                        //     if (cellDate > filterLocalDate) {
                        //         return 1;
                        //     }
                        // },
                        browserDatePicker: true, //달력
                        clearButton: true //클리어버튼
                    }
                }
            },
            {
                headerName: "금액(BLCT)", field: "blct",
                width: 100,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "항목", field: "stateName",
                width: 200,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "내용", field: "contents", // 상품명, 고객명
                width: 350,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },

        ]
        return columnDefs
    }

    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data:rowData}) => {
        return ComUtil.addCommas(value);
    }
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value) : '미지정')
    }

    // Ag-Grid Cell 스타일 기본 적용 함수
    getCellStyle({cellAlign,color,textDecoration,whiteSpace}) {
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

    onCopy = () => {
        this.setState({copied: true})
        this.notify('클립보드에 복사되었습니다', toast.success);
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    render() {
        return (
            <Fragment>
                <div className='border p-3'>
                    <div className='d-flex'>
                        <div className='d-flex'>
                            <div className='d-flex justify-content-center align-items-center font-weight-bold f3'>보유 적립금</div>
                            <div className='pl-3 d-flex justify-content-center align-items-center'>
                                {this.state.blctBalance} BLCT / {ComUtil.addCommas(ComUtil.roundDown(this.state.blctBalance * this.state.blctToWon, 2))} 원
                            </div>
                        </div>
                        <div className='d-flex justify-content-center align-items-center'>
                            <div className='pl-5 font-weight-bold f3'>Public Account</div>
                            <div className='pl-3'>
                                <CopyToClipboard text={this.state.loginUser.account} onCopy={this.onCopy}>
                                    <Button outline block >{this.state.loginUser.account}</Button>
                                </CopyToClipboard>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex pt-3 pb-1">
                    <div className="flex-grow-1 text-left">
                        총 {this.state.data ? ComUtil.addCommas(this.state.data.length) : 0} 개
                    </div>
                    {/*<ExcelDownload data={this.state.excelData}*/}
                                   {/*button={<Button color={'success'} size={'sm'} block>*/}
                                       {/*<div className="d-flex">*/}
                                           {/*엑셀 다운로드*/}
                                       {/*</div>*/}
                                   {/*</Button>}/>*/}
                </div>

                <div
                    id="myGrid"
                    className='ag-theme-balham'
                    style={{height: 'calc(100vh - 180px)'}}
                >
                    <AgGridReact
                        // enableSorting={true}                //정렬 여부
                        // enableFilter={true}                 //필터링 여부
                        floatingFilter={true}               //Header 플로팅 필터 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}  //멀티체크 가능 여부
                        rowHeight={this.state.rowHeight}
                        //gridAutoHeight={true}
                        //domLayout={'autoHeight'}
                        // enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        frameworkComponents={this.state.frameworkComponents}
                        suppressMovableColumns={true} //헤더고정시키
                        //onFilterChanged={this.onGridFilterChanged.bind(this)} //필터온체인지 이벤트
                        // onRowClicked={this.onSelectionChanged.bind(this)}
                        // onRowSelected={this.onRowSelected.bind(this)}
                        // onSelectionChanged={this.onSelectionChanged.bind(this)}
                        // suppressRowClickSelection={true}    //true : 셀 클릭시 체크박스 체크 안됨, false : 셀 클릭시 로우 단위로 선택되어 체크박스도 자동 체크됨 [default 값은 false]
                    >
                    </AgGridReact>
                </div>


                <ToastContainer/>
            </Fragment>
        )
    }

}
