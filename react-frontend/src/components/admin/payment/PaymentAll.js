import React, { Component, Fragment } from 'react';
import { FormGroup, Button, Modal, ModalHeader, ModalBody } from 'reactstrap'
import { getAllProducerPayoutList, getProducerPaymentCheck, savePaymentCheck, setProducerPayoutStatus, getAllTempProducerBlctMonth } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'
import { BlockChainSpinner, BlocerySpinner, ExcelDownload, MonthBox } from '~/components/common'
import PaymentCheck from './PaymentCheck';

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

export default class PaymentAll extends Component{

    constructor(props) {
        super(props);

        const today =  moment();
        const initMonth = today.subtract(1, 'month');
        const limitMonth = {year: initMonth.year(), month: initMonth.month() + 1};

        this.payoutLimitMonth =  limitMonth;

        this.state = {
            loading: false,
            chainLoading: false,
            modalOpen: false,
            selectCheckData: {},
            data: null,
            rowData: [],
            excelData: {
                columns: [],
                data: []
            },
            showMonthPicker:false,
            searchMonthValue: limitMonth,
            isSearchDataExist:false,
            columnDefs: [
                {
                    headerName: "업체정보",
                    cellStyle:this.getHeaderCellStyle,
                    children: [
                        {headerName: '생산자번호',width: 100, field: 'producerNo', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {headerName: '업체명',width: 180, field: 'producerFarmName', cellStyle:{"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                    ]
                },
                {
                    headerName: "매출내역",
                    cellStyle:this.getHeaderCellStyle,
                    children: [
                        {headerName: '판매원가',width: 100, field: 'totalGoodsPrice', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '배송비 + 지원금',width: 120, field: 'totalSupportPrice', cellStyle: {"textAlign":"left", 'background-color': '#fafab4'},
                            cellRenderer: 'formatCurrencyRenderer',
                            filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.totalSupportPrice + params.data.totalDeliveryFeeNew;
                            }
                        },
                    ]
                },
                {
                    headerName: "차감내역",
                    cellStyle:this.getHeaderCellStyle,
                    children: [
                        {headerName: '판매수수료',width: 100, field: 'totalFeeRateMoney', cellStyle: {"textAlign":"left", 'background-color': '#ffe3ee'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                    ]
                },
                {
                    headerName: "정산합계",
                    cellStyle:this.getHeaderCellStyle,
                    children: [
                        {headerName: '합계',width: 100, field: 'totalSimplePayoutAmount', cellStyle: {"textAlign":"left", 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '공급가액',width: 100, field: 'totalSupplyValue', cellStyle: {"textAlign":"left", 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                        {headerName: '부가세',width: 80, field: 'totalVat', cellStyle: {"textAlign":"left", 'background-color': '#EBFBFF'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                    ]
                },
                {
                    headerName: "BLCT 기정산내역",
                    cellStyle:this.getHeaderCellStyle,
                    children: [
                        {headerName: '총매출',width: 80, field: 'totalBlctToken', cellStyle: {"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {headerName: '판매수수료',width: 100, field: 'totalFeeRateBlct', cellStyle: {"textAlign":"left", 'background-color': '#f1fff1'},
                            filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return ComUtil.roundDown(params.data.totalFeeRateBlct,2);
                            }
                        },
                        {headerName: '정산합계',width: 90, field: 'totalPayoutAmountBlct', cellStyle: {"textAlign":"left", 'background-color': '#f1fff1'}, filterParams:{clearButton: true}},
                        {headerName: '원화 환산',width: 100, field: 'totalPaidBlctToWon', cellStyle: {"textAlign":"left", 'background-color': '#f1fff1'}, cellRenderer: 'formatCurrencyRenderer', filterParams:{clearButton: true}},
                    ]
                },
                {
                    headerName: "check",
                    cellStyle:this.getHeaderCellStyle,
                    children: [
                        {headerName: '계산서',width: 80, field: 'invoice', cellStyle: this.getCellStyle,
                            filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.invoice ? '발행' : '미발행';
                            }
                        },
                        {headerName: '입금확인',width: 90, field: 'paymentStatus', cellStyle: this.getCellStyle,
                            filterParams:{clearButton: true},
                            valueGetter: function(params) {
                                return params.data.paymentStatus === 0 ? '정산예정' : params.data.paymentStatus === 1 ? '계좌입금' : '이월';
                            }
                        },
                        {headerName: '전월이월',width: 90, field: 'lastForwardAmount', cellStyle: this.getCellStyle, cellRenderer: 'formatCurrencyRenderer',  filterParams:{clearButton: true}},
                        {headerName: '수정',width: 90, field: 'totalPaidBlctToWon', cellStyle: this.getCellStyle, cellRenderer: 'checkModifyRenderer', filterParams:{clearButton: true}},
                    ]
                },
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
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            this.props.history.push('/admin');
        }
        await this.search();
    }

    onRefreshClick = async () => {
        await this.search()
    }

    search = async () => {
        if(!this.state.searchMonthValue)
            return;

        // console.log('search :  this.state.searchMonthValue ',  this.state.searchMonthValue)

        let searchMonthValue = this.state.searchMonthValue;
        let year = searchMonthValue.year;
        let month = searchMonthValue.month;

        let limitYear = this.payoutLimitMonth.year;
        let limitMonth = this.payoutLimitMonth.month;
        let limitMonthText  = this.makeMonthText(this.payoutLimitMonth);

        let searchMode = this.state.searchMode;
        if(year > limitYear ||
            (year >= limitYear && month > limitMonth) )
        {
            alert(limitMonthText + "까지만 정산할 수 있습니다. (현재달은 조회만 가능)")
            searchMode = true;
            //return - 20200320 searchMode추가
        } else {
            searchMode = false; //정산가능한 달.
        }

        this.setState({loading: true})

        const { status, data } = await getAllProducerPayoutList(year, month)
        if(status !== 200){
            alert('정산 리스트 조회에 실패 하였습니다')
            return
        }

        // console.log(data);

        data.sort((b,a) => {
            return parseInt(a.totalSimplePayoutAmount) - parseInt(b.totalSimplePayoutAmount);
        });

        let searchYearMonth = year + '' + month;
        if(month < 10) {
            searchYearMonth = year + '0' + month;
        }
        // console.log(searchYearMonth);

        if(data.length === 0) {
            this.setState({
                data: data,
                loading: false,
                isSearchDataExist: false,
                searchMode: searchMode,
            })
            return;
        }

        const {data:tempProducerNotyetBlct} = await getAllTempProducerBlctMonth(year, month)
        console.log("tempProducerNotyetBlct : ", tempProducerNotyetBlct);

        // paymentCheck 조회 후 data에 붙여야 함..
        const result = data.map(async(producerPayout) => {
            let {data:checkData} = await getProducerPaymentCheck(producerPayout.producerNo, year, month);
            // console.log('checkData : ', checkData);
            producerPayout.invoice = checkData.invoice;
            producerPayout.paymentStatus = checkData.paymentStatus;
            producerPayout.forwardAmount = checkData.forwardAmount;
            producerPayout.lastForwardAmount = checkData.lastForwardAmount;
            producerPayout.memoList = checkData.memoList;
            producerPayout.producerNoDotMonth = checkData.producerNoDotMonth;
            producerPayout.yearMonth = searchYearMonth;
            // 은행명도 추가
            producerPayout.bankName = producerPayout.bankInfo.name;
        })

        Promise.all(result).then((response) => {
            // console.log('withCheck : ', data);
            let isSearchDataExist = data.length > 0;
            this.setState({
                data: data,
                loading: false,
                isSearchDataExist: isSearchDataExist,
                searchMode: searchMode,
                tempProducerNotyetBlct: tempProducerNotyetBlct
            })

            this.setExcelData();
        })
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
            '생산자번호', '업체명', '매출_판매원가', '매출_배송비+지원금', '차감내역_판매수수료',
            '정산합계', '공급가액', '부가세',
            'BLCT_기정산 총매출', 'BLCT_기정산 판매수수료', 'BLCT_기정산합계', 'BLCT_원화 환산',
            '게산서', '입금확인', '전월이월'
        ]

        const excelData = this.state.data.map((payout) => {
            const invoice = payout.invoice ? "발행" : "미발행";
            const paymentStatus = payout.paymentStatus === 0 ? '정산예정' : payout.paymentStatus === 1 ? '계좌입금' : '이월';
            return [
                payout.producerNo, payout.producerFarmName, payout.totalGoodsPrice, payout.totalSupportPrice + payout.totalDeliveryFeeNew, payout.totalFeeRateMoney,
                payout.totalSimplePayoutAmount, payout.totalSupplyValue, payout.totalVat,
                payout.totalBlctToken, payout.totalFeeRateBlct, payout.totalPayoutAmountBlct, payout.totalPaidBlctToWon,
                invoice, paymentStatus,
                payout.lastForwardAmount
            ]
        });

        // console.log(JSON.stringify(excelData));
        return [{
            columns: columns,
            data: excelData,
        }]
    }


    // Ag-Grid Cell 스타일 기본 적용 함수
    getHeaderCellStyle ({cellAlign,color,textDecoration,whiteSpace}){
        return {
            display: "flex",
            alignItems: "center",
            justifyContent: 'center',
            color: color,
            textDecoration: textDecoration,
            whiteSpace: whiteSpace
        }
    }

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

    checkModifyRenderer = ({value, data:rowData}) => {
        // let count = rowData.totalOrderCount;
        // console.log(rowData);
        return (
            <div className="d-flex">
                <Button size={'sm'} style={{width: '40px'}} onClick={this.modifyCheckData.bind(this, rowData)}>
                        수정
                </Button>
            </div>
        )
    }

    modifyCheckData = (rowData) => {
        console.log('modifyCheckData ', rowData);
        this.setState({
            selectCheckData: rowData
        })
        this.toggle();
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        //console.log("onGridReady");
    }

    onGridFilterChanged () {
        // this.setExcelData();
    }

    makeMonthText = (m) => {
        // console.log('***********', m);
        if (m && m.year && m.month) return (m.year + "년 " + pickerLang.months[m.month-1])
        return '?'
    }

    makeTitleText = (m) => {
        return "블로서리 " + this.makeMonthText(m) + " 정산";
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
        // console.log('handleAMonthDismiss : ', value);
        this.setState({
            showMonthPicker:false,
            searchMonthValue: value,
        });
    }

    toggle = () => {
        // console.log('this.state.modalOpen : ', this.state.modalOpen);
        // const modalState = this.state.modalOpen;
        this.setState({
            modalOpen: !this.state.modalOpen
        })
    }

    regNoticeFinished = () => {
        this.toggle();
        this.search();
    }

    onSaveCheckData = async(checkData) => {

        // console.log('all : ', checkData);
        let {data:result} = await savePaymentCheck(checkData);
        // console.log(result);
        if(result) {
            alert("정보를 등록했습니다");
            this.regNoticeFinished()
        } else {
            alert("정보 등록에 실패했습니다. 다시 시도해주세요.");
        }
    }

    onManualCompletePayout = async () => {
        if(!window.confirm('블록체인에 정산 완료가 요청되면 되돌릴 수 없습니다. 조회된 미정산(NotYet) 상태의 정산 금액이 펌뱅킹으로 이체한 리스트와 맞는지 확인하시기 바랍니다. 수동 정산 완료를 지금 하시겠습니까?')) {
            return;
        }

        let searchMonthValue = this.state.searchMonthValue;
        let year = searchMonthValue.year;
        let month = searchMonthValue.month;

        const finishComplete = await this.manualCompletePayout(year, month)
        if(finishComplete) {
            await this.search()
        }
    }

    manualCompletePayout = async (year, month)=> {
        console.log("manualCompletePayout")

        //backend에 year, month만 넘기면 notYet인 데이터 다시 조회 후 complete로 처리
        const notyetPayoutAmount = this.getTotalCompletePayoutBlctAmount();

        console.log(year, month, "tempProducerNotyetBlct : ", this.state.tempProducerNotyetBlct,  " notyetPayoutAmount :  ", notyetPayoutAmount);

        if(notyetPayoutAmount !== this.state.tempProducerNotyetBlct) {
            let confirmResult = window.confirm('tempProducer계좌와 현재 blct가 맞지 않습니다 그래도 전송하시겠습니까? ');
            if(!confirmResult)
                return false;
        }


        this.setState({chainLoading: true})
        const {status, data} = await setProducerPayoutStatus(year, month)

        if(status !== 200) {
            return false
        }

        this.setState({chainLoading: false})
        if(data) {
            alert("수동 정산 프로세스가 완료되었습니다.")
        } else {
            alert("수동 정산 프로세스가 실패하였습니다.")
        }

        return data;

    }

    getTotalCompletePayoutBlctAmount = () => {
        if (!this.state.isSearchDataExist) {
            return null;
        }

        var data = this.state.data;
        let totalBlctNotYetPayoutAmount = 0;

        console.log(data);
        data.forEach((node) => {
            if (node.blctNotYetPayoutAmount > 0) {
                totalBlctNotYetPayoutAmount = totalBlctNotYetPayoutAmount + node.blctNotYetPayoutAmount;
            }
        });

        return totalBlctNotYetPayoutAmount;
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
                    <div className='border p-3'>
                        <div className='p-1 d-flex'>
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

                                {
                                    state.isSearchDataExist &&
                                        <div>
                                            { !state.searchMode &&
                                            <Button color={'danger'} size={'sm'} block style={{width: '150px'}}
                                                    onClick={this.onManualCompletePayout}>
                                                <div className="d-flex">
                                                    수동 정산 완료 처리
                                                </div>
                                            </Button>
                                            }
                                        </div>
                                }
                            </div>
                        </div>
                    </div>

                    <br/>
                    {
                        <div
                            className="ag-theme-balham"
                            style={{
                                height: '700px'
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
                                overlayLoadingTemplate={state.overlayLoadingTemplate}
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
                    }
                </FormGroup>

                <Modal isOpen={state.modalOpen} toggle={this.toggle} className={'modal-lg'} centered>
                    <ModalHeader toggle={this.toggle} className=''>
                        { state.selectCheckData.producerFarmName }
                        </ModalHeader>
                    <ModalBody>
                        <PaymentCheck selectCheckData={state.selectCheckData} searchYearMonth={state.searchYearMonth} onClose={this.regNoticeFinished} onSave = {this.onSaveCheckData}/>
                    </ModalBody>
                </Modal>
            </Fragment>
        )
    }
}

