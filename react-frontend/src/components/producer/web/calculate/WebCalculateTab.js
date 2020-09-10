import React, { Component, Fragment } from 'react'
import { FormGroup, Button } from 'reactstrap'
import { Webview } from "~/lib/webviewApi";
import { getPaymentProducer } from '~/lib/producerApi'
import { getLoginUserType, getLoginUser } from "~/lib/loginApi";
import { getProducer } from "~/lib/producerApi";

import ComUtil from '~/util/ComUtil'
import { BlockChainSpinner, BlocerySpinner, ExcelDownload, MonthBox } from '~/components/common'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";

import { Refresh } from '@material-ui/icons'
import 'react-month-picker/css/month-picker.css'
import MonthPicker from 'react-month-picker'
import moment from 'moment-timezone'

const pickerLang = {
    months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
}

export default class WebCalculateTab extends Component {
    constructor(props) {
        super(props);
        const today =  moment();
        const initMonth = today.subtract(1, 'month');
        const limitMonth = {year: initMonth.year(), month: initMonth.month() + 1};

        this.state = {
            loginUser: '',
            loading: false,
            chainLoading: false,
            modalOpen: false,
            selectCheckData: {},
            data: null,
            summaryData: null,
            rowData: [],
            excelData: {
                columns: [],
                data: []
            },
            tipOpen: false,
            showMonthPicker:false,
            searchMonthValue: limitMonth,
            searchProducerNo: 0,
            producerList: [],
            isSearchDataExist:false,

            columnSummaryDefs: [
                {headerName: "과세여부", field: "vatFlag", cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, width: 90},
                {
                    headerName: "매출내역 (소비자판매가 A = B + C + D)",
                    cellStyle:this.getHeaderCellStyle,
                    children: [
                        {headerName: '소비자판매가(A)',width: 150, field: 'summaryConsumerGoodsPrice', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '판매원가(B)',width: 120, field: 'summaryTotalGoodsPrice', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '판매지원금(C)',width: 120, field: 'summaryTotalSupportPrice', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '배송비(D)',width: 110, field: 'summaryDeliveryFee', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                    ]
                },
                {
                    headerName: "수수료",
                    cellStyle:this.getHeaderCellStyle,
                    children: [
                        {headerName: '판매원가 * 수수료율(E)',width: 170, field: 'summaryTotalFeeRateMoney', cellStyle: {"textAlign":"left", 'background-color': '#ffe3ee'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                    ]
                },
                {
                    headerName: "정산내역(소비자판매가 - 수수료)",
                    cellStyle:this.getHeaderCellStyle,
                    children: [
                        {headerName: '총정산금액 (F)=A-E',width: 200, field: 'summarySimplePayoutAmount', cellStyle: {"textAlign":"left", 'font-weight' : 'bold', 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '공급가액(G)=F/1.1',width: 200, field: 'summaryTotalSupplyValue', cellStyle: {"textAlign":"left", 'font-weight' : 'bold', 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '부가세(H)=G*10%',width: 200, field: 'summaryTotalVat', cellStyle: {"textAlign":"left", 'font-weight' : 'bold', 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},},
                    ]
                },
            ],
            columnDefs: [
                {
                    headerName: "주문내역",
                    cellStyle:this.getHeaderCellStyle,
                    children: [
                        {headerName: '주문일',width: 140, field: 'orderDate', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return ComUtil.utcToString(params.data.orderDate,'YYYY-MM-DD HH:mm');
                            }
                        },
                        {headerName: '주문번호',width: 100, field: 'orderSeq', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {headerName: '주문자',width: 90, field: 'consumerNm', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {headerName: '상품번호',width: 90, field: 'goodsNo', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {headerName: '품목',width: 250, field: 'goodsNm', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {headerName: '상품구분',width: 90, field: 'timeSaleGoods', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.timeSaleGoods? "포텐타임" : params.data.blyTimeGoods? "블리타임" : "일반상품";
                            }
                        },
                        {headerName: '환불여부',width: 110, field: 'refundFlag', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.refundFlag? "환불" :
                                    params.data.partialRefundCount > 0 ? `(+부분환불 ${params.data.partialRefundCount}건)` :
                                        "-";
                            }
                        },
                        {headerName: '판매가',width: 80, field: 'currentPrice', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '판매지원금',width: 100, field: 'timeSaleSupportPrice', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.totalSupportPrice / params.data.orderCnt;
                            }
                        },
                        {headerName: '수량',width: 70, field: 'orderCnt', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {headerName: '과세여부',width: 90, field: 'vatFlag', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.vatFlag? "과세" : "비과세";
                            }
                        },
                    ]
                },
                {
                    headerName: "매출내역 (소비자판매가 A = B + C + D)",
                    cellStyle:this.getHeaderCellStyle,
                    children: [
                        {headerName: '소비자판매가(A)',width: 130, field: 'totalGoodsPrice', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'},
                            cellRenderer: 'formatCurrencyRenderer',
                            filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.totalGoodsPrice + params.data.totalSupportPrice + params.data.deliveryFee;
                            }
                        },
                        {headerName: '판매원가(B)',width: 100, field: 'totalGoodsPrice', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '판매지원금(C)',width: 120, field: 'totalSupportPrice', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '배송비(D)',width: 90, field: 'deliveryFee', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                    ]
                },
                {
                    headerName: "수수료(판매원가 * 수수료율)",
                    cellStyle:this.getHeaderCellStyle,
                    children: [
                        {headerName: '수수료율(%)',width: 110, field: 'feeRate', cellStyle: {"textAlign":"left", 'background-color': '#ffe3ee'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.timeSaleGoods ? "-" : params.data.blyTimeGoods ? "-" : params.data.feeRate;
                            }
                        },
                        {headerName: '수수료(E)',width: 100, field: 'totalFeeRateMoney', cellStyle: {"textAlign":"left", 'background-color': '#ffe3ee'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return (params.data.currentPrice * params.data.feeRate / 100).toFixed(0) * params.data.orderCnt;
                            }
                        },
                    ]
                },
                {
                    headerName: "정산금액(F)",
                    cellStyle:this.getHeaderCellStyle,
                    children: [
                        {headerName: '(F)=A-E',width: 100, field: 'simplePayoutAmount', cellStyle: {"textAlign":"left", 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                    ]
                },
                {
                    headerName: "공급가액(G)",
                    cellStyle:this.getHeaderCellStyle,
                    children: [
                        {headerName: '(G)=F/1.1',width: 100, field: 'totalSupplyValue', cellStyle: {"textAlign":"left", 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.vatFlag ? Math.round(params.data.simplePayoutAmount / 1.1) : params.data.simplePayoutAmount;
                            }
                        },
                    ]
                },
                {
                    headerName: "부가세(H)",
                    cellStyle:this.getHeaderCellStyle,
                    children: [
                        {headerName: '(H)=G*10%',width: 110, field: 'totalVat', cellStyle: {"textAlign":"left", 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.vatFlag ? Math.round((params.data.simplePayoutAmount / 1.1) * 0.1) : 0;
                            }
                        },
                    ]
                },
                // {
                //     headerName: "BLCT 기정산내역",
                //     cellStyle:this.getHeaderCellStyle,
                //     children: [
                //         {headerName: '총매출',width: 80, field: 'totalBlctToken', cellStyle: {"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                //         {headerName: '판매수수료',width: 100, field: 'totalFeeRateBlct', cellStyle: {"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                //         {headerName: '정산합계',width: 90, field: 'totalPayoutAmountBlct', cellStyle: {"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                //         {headerName: '원화 환산',width: 100, field: 'totalPaidBlctToWon', cellStyle: {"textAlign":"left", 'background-color': '#f1fff1'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                //     ]
                // }
            ],
            defaultColDef: {
                width: 130,
                resizable: true,
            },
            frameworkComponents: {
                checkModifyRenderer: this.checkModifyRenderer,
            },
            components: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 정산 내역이 없습니다.</span>',
        }
    }

    async componentDidMount() {
        await this.getUser();
        this.search();
    }

    getUser = async() => {

        //로그인 체크
        const {data: userType} = await getLoginUserType();
        if(userType === 'consumer') {
            //소비자용 메인페이지로 자동이동.
            Webview.movePage('/home/1');
        } else if (userType === 'producer') {
            let {data:loginUser} = await getProducer();

            console.log('loginUser : ', loginUser);

            if(!loginUser){
                this.props.history.push('/producer/webLogin')
            } else {
                this.setState({
                    loginUser: loginUser
                })
            }
        } else {
            this.props.history.push('/producer/webLogin')
        }
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

    formatCurrencyRenderer = ({value, data:rowData}) => {
        return ComUtil.addCommas(value);
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    onGridFilterChanged () {
        // this.setExcelData();
    }

    makeTitleText = (m) => {
        return "블로서리 " + this.makeMonthText(m);
    }

    makeMonthText = (m) => {
        // console.log('***********', m);
        if (m && m.year && m.month) return (m.year + "년 " + pickerLang.months[m.month-1])
        return '?'
    }

    handleClickMonthBox = () => {
        this.setState({
            showMonthPicker: true,
        })
    }

    handleAMonthChange = (value, text) => {
        let data = {
            year: value,
            month: text
        }
        this.handleAMonthDismiss(data);
    }
    handleAMonthDismiss= (value) => {
        this.setState({
            showMonthPicker:false,
            searchMonthValue: value,
        });
    }

    onSelectProducer = (e) => {
        this.setState({
            searchProducerNo : e.target.selectedOptions[0].value
        })
    }

    onRefreshClick = async() => {
        this.search();
    }

    search = async() => {
        let {data} = await getPaymentProducer(this.state.loginUser.producerNo, this.state.searchMonthValue.year, this.state.searchMonthValue.month);
        // console.log(data);
        let isSearchDataExist = data.length > 0;

        // summaryData 세팅하기
        let vatSummary = {
            vatFlag: '과세',
            summaryConsumerGoodsPrice:0,
            summaryTotalGoodsPrice:0,
            summaryTotalSupportPrice:0,
            summaryDeliveryFee:0,
            summaryTotalFeeRateMoney:0,
            summarySimplePayoutAmount:0,
            summaryTotalSupplyValue:0,
            summaryTotalVat:0
        };
        let notVatSummary = {
            vatFlag: '비과세',
            summaryConsumerGoodsPrice:0,
            summaryTotalGoodsPrice:0,
            summaryTotalSupportPrice:0,
            summaryDeliveryFee:0,
            summaryTotalFeeRateMoney:0,
            summarySimplePayoutAmount:0,
            summaryTotalSupplyValue:0,
            summaryTotalVat:0
        };

        data.map(orderDetail => {
            let consumerGoodsPrice = orderDetail.totalGoodsPrice + orderDetail.totalSupportPrice + orderDetail.deliveryFee;
            let totalFeeRateMoney = (orderDetail.currentPrice * orderDetail.feeRate / 100).toFixed(0) * orderDetail.orderCnt;

            if(orderDetail.vatFlag && !orderDetail.refundFlag) {
                vatSummary.summaryConsumerGoodsPrice = vatSummary.summaryConsumerGoodsPrice + consumerGoodsPrice;
                vatSummary.summaryTotalGoodsPrice = vatSummary.summaryTotalGoodsPrice + orderDetail.totalGoodsPrice;
                vatSummary.summaryTotalSupportPrice = vatSummary.summaryTotalSupportPrice + orderDetail.totalSupportPrice;
                vatSummary.summaryDeliveryFee = vatSummary.summaryDeliveryFee + orderDetail.deliveryFee;
                vatSummary.summaryTotalFeeRateMoney = vatSummary.summaryTotalFeeRateMoney + totalFeeRateMoney;
                vatSummary.summarySimplePayoutAmount = vatSummary.summarySimplePayoutAmount + orderDetail.simplePayoutAmount;
                vatSummary.summaryTotalSupplyValue = vatSummary.summaryTotalSupplyValue + Math.round(orderDetail.simplePayoutAmount / 1.1);
                vatSummary.summaryTotalVat = vatSummary.summaryTotalVat + Math.round((orderDetail.simplePayoutAmount / 1.1) * 0.1);

            } else if(!orderDetail.refundFlag){
                notVatSummary.summaryConsumerGoodsPrice = notVatSummary.summaryConsumerGoodsPrice + consumerGoodsPrice;
                notVatSummary.summaryTotalGoodsPrice = notVatSummary.summaryTotalGoodsPrice + orderDetail.totalGoodsPrice;
                notVatSummary.summaryTotalSupportPrice = notVatSummary.summaryTotalSupportPrice + orderDetail.totalSupportPrice;
                notVatSummary.summaryDeliveryFee = notVatSummary.summaryDeliveryFee + orderDetail.deliveryFee;
                notVatSummary.summaryTotalFeeRateMoney = notVatSummary.summaryTotalFeeRateMoney + totalFeeRateMoney;
                notVatSummary.summarySimplePayoutAmount = notVatSummary.summarySimplePayoutAmount + orderDetail.simplePayoutAmount;
                notVatSummary.summaryTotalSupplyValue = notVatSummary.summaryTotalSupplyValue + orderDetail.simplePayoutAmount;
            }
        })

        let summaryData = [vatSummary, notVatSummary];
        this.setState({
            loading: false,
            isSearchDataExist: isSearchDataExist,
            data:data,
            summaryData: summaryData
        })

        this.setExcelData();
    }


    setExcelData = () => {
        if(!this.gridApi)
            return;

        var excelData = this.getExcelData();
        this.setState({
            excelData: excelData,
        })
    }

    getExcelData = () => {
        const columns = [
            '주문일', '주문번호', '주문자', '상품번호', '품목', '상품구분', '환불여부', '판매가', '판매지원금', '수량', '과세여부',
            '소비자판매가(A) A = B+C+D', '판매원가(B)', '판매지원금(C)', '배송비(D)',
            '수수료율', '수수료(E)',
            '정산금액(F = A-E)', '공급가액(G = F/1.1)', '부가세(H = G*10%)'
        ]

        const excelData = this.state.data.map((orderDetail) => {
            const orderDate = ComUtil.utcToString(orderDetail.orderDate,'YYYY-MM-DD HH:mm');
            const timeSaleGoods = orderDetail.timeSaleGoods ? "포텐타임" : "일반상품";
            const vatFlag = orderDetail.vatFlag ? "과세" : "비과세";
            const refundFlag = orderDetail.refundFlag ? "환불" : "-";
            const timeSaleSupportPrice = orderDetail.totalSupportPrice / orderDetail.orderCnt;
            const totalGoodsPrice = orderDetail.totalGoodsPrice + orderDetail.totalSupportPrice + orderDetail.deliveryFee;
            const feeRate = orderDetail.timeSaleGoods ? " " : orderDetail.blyTimeGoods ? " " : orderDetail.feeRate;
            const feeRateMoney = (orderDetail.currentPrice * orderDetail.feeRate / 100).toFixed(0) * orderDetail.orderCnt;
            const supplyValue = orderDetail.vatFlag ? Math.round(orderDetail.simplePayoutAmount / 1.1) : 0;
            const vat = orderDetail.vatFlag ? Math.round(orderDetail.simplePayoutAmount / 1.1 * 0.1) : 0;

            return [
                orderDate, orderDetail.orderSeq, orderDetail.consumerNm, orderDetail.goodsNo, orderDetail.goodsNm, timeSaleGoods, refundFlag, orderDetail.currentPrice, timeSaleSupportPrice, orderDetail.orderCnt, vatFlag,
                totalGoodsPrice, orderDetail.totalGoodsPrice, orderDetail.totalSupportPrice, orderDetail.deliveryFee,
                feeRate, feeRateMoney,
                orderDetail.simplePayoutAmount, supplyValue, vat
            ]
        });

        // console.log(JSON.stringify(excelData));
        return [{
            columns: columns,
            data: excelData,
        }]
    }

    toggleTip = () => {
        this.setState({
            tipOpen: !this.state.tipOpen
        })
    }

    render() {
        const state = this.state
        return (
            <Fragment>
                {
                    state.chainLoading && <BlockChainSpinner/>
                }
                {
                    state.loading && <BlocerySpinner/>
                }

                <FormGroup>
                    <div className='p-3'>
                        <div className='p-1 mt-1 d-flex align-items-center'>
                            <div>
                                {
                                    state.showMonthPicker &&
                                    <MonthPicker
                                        show={true}
                                        years={[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029]}
                                        value={state.searchMonthValue}
                                        lang={pickerLang.months}
                                        onChange={this.handleAMonthChange.bind(this)}
                                        onDismiss={this.handleAMonthDismiss.bind(this)}
                                    >
                                    </MonthPicker>
                                }
                                <MonthBox value={this.makeMonthText(state.searchMonthValue)}
                                          onClick={this.handleClickMonthBox.bind(this)}/>
                            </div>

                            <div className="ml-3">
                                <Button color={'info'} size={'sm'} block  style={{width: '100px'}}
                                        onClick={this.onRefreshClick}>
                                    <div className="d-flex">
                                        <Refresh fontSize={'small'}/> 조회
                                    </div>
                                </Button>
                            </div>

                            <div className='d-flex ml-auto'>
                                {
                                    state.isSearchDataExist &&
                                    <div className="ml-5 mr-3">
                                        {/*<label><h6>{this.makeTitleText(this.state.searchMonthValue)}</h6></label>*/}
                                        <ExcelDownload data={state.excelData}
                                                       fileName={this.makeTitleText(state.searchMonthValue)}
                                                       sheetName={this.makeTitleText(state.searchMonthValue)}
                                                       button={
                                                           <Button color={'info'} size={'sm'} style={{width: '100px'}}>
                                                               <div className="d-flex">
                                                                   엑셀 다운로드
                                                               </div>
                                                           </Button>
                                                       }/>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>

                    <div className='border mt-1 ml-2 mr-2 mb-3 p-3'>
                        <div className='p-1'>
                            <div className="d-flex">
                                <h5>MarketBly 정산 tip! </h5>
                                <div className="ml-2">
                                    <Button color={'secondary'} outline size={'sm'} onClick={this.toggleTip}> {this.state.tipOpen ? ' ▲ ' : ' ▼ ' } </Button>
                                </div>
                            </div>

                            {this.state.tipOpen &&
                            <div className='mt-4 text-secondary small'>
                                1. 소비자판매가는 소비자의 총 결제 금액으로 판매원가와 판매지원금, 배송비로 구성되어 있습니다. <br/>
                                * '판매원가'란 결제금액에서 배송비와 판매지원금을 뺀 금액입니다.(수수료 적용 O) <br/>
                                * 배송비와 판매지원금에는 판매수수료가 적용되지 않습니다. <br/>
                                <br/>
                                2. MarketBly는 합포장(묶음배송) 주문건이라도 판매 상품별로 개별주문번호가 생성됩니다. <br/>
                                * 합포장(묶음배송) 상품'의 배송비가 발생할 경우, 가장 빠른 주문번호 한 건에 반영합니다. <br/>
                                * 합포장(묶음배송) 주문은 주문번호를 통해 확인하실수 있습니다.(앞에 4자리가 동일해요!) <br/>
                                <div className='border m-2 p-2 d-inline-block'>
                                    예시) <br/>
                                    1637001, 1637002, 1637003 이렇게 묶음배송으로 3개의 상품을 주문한 경우에는<br/>
                                    1637001 주문건에 배송비가 반영됩니다.
                                </div>
                                <br/> <br/>
                                3. 이벤트, 특가 상품의 경우 수수료가 다르게 적용될 수 있습니다. <br/>
                            </div>
                            }
                        </div>
                    </div>

                    <div
                        className="ag-theme-balham mb-3 ml-2 mr-2"
                        style={{
                            height: '150px'
                        }}
                    >
                        <br/>
                        { this.state.isSearchDataExist &&
                        <div>
                            {`${this.state.searchMonthValue.year}년 ${this.state.searchMonthValue.month}월 내역`}
                        </div>
                        }
                        <AgGridReact
                            enableSorting={true}                //정렬 여부
                            enableFilter={true}                 //필터링 여부
                            floatingFilter={false}               //Header 플로팅 필터 여부
                            columnDefs={state.columnSummaryDefs}  //컬럼 세팅
                            defaultColDef={state.defaultColDef}
                            enableColResize={true}              //컬럼 크기 조정
                            overlayLoadingTemplate={state.overlayNoRowsTemplate}
                            overlayNoRowsTemplate={state.overlayNoRowsTemplate}
                            onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            onFilterChanged={this.onGridFilterChanged.bind(this)}
                            rowData={state.summaryData}
                            components={state.components}
                            frameworkComponents={state.frameworkComponents}
                            suppressMovableColumns={true} //헤더고정시키
                        >
                        </AgGridReact>
                    </div>



                    <div
                        className="ag-theme-balham mb-3 ml-2 mr-2"
                        style={{
                            height: '500px'
                        }}
                    >
                        <br/>
                        <AgGridReact
                            enableSorting={true}                //정렬 여부
                            enableFilter={true}                 //필터링 여부
                            floatingFilter={false}               //Header 플로팅 필터 여부
                            columnDefs={state.columnDefs}  //컬럼 세팅
                            defaultColDef={state.defaultColDef}
                            enableColResize={true}              //컬럼 크기 조정
                            overlayLoadingTemplate={state.overlayNoRowsTemplate}
                            overlayNoRowsTemplate={state.overlayNoRowsTemplate}
                            onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            onFilterChanged={this.onGridFilterChanged.bind(this)}
                            rowData={state.data}
                            components={state.components}
                            frameworkComponents={state.frameworkComponents}
                            suppressMovableColumns={true} //헤더고정시키
                        >
                        </AgGridReact>
                    </div>


                </FormGroup>
            </Fragment>
        )
    }
}