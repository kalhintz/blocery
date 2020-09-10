import React, { Fragment, Component, PropTypes } from 'react';
import { getAllProducerPayoutList, setProducerPayoutStatus, getAllTempProducerBlctMonth } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";
// only available in ag-Grid Enterprise!!!
// https://www.ag-grid.com/javascript-grid-excel/
// https://www.ag-grid.com/javascript-grid-filter-set/
import { ExcelDownload, MonthBox } from '~/components/common'
import { Button, Row, Col, Container, Label} from 'reactstrap'
import '~/styles/agGridStyle.css'
import { Refresh } from '@material-ui/icons'
import 'react-month-picker/css/month-picker.css'
import MonthPicker from 'react-month-picker'
import moment from 'moment-timezone'

import { BlockChainSpinner, BlocerySpinner } from '~/components/common'

import Enumerable from 'linq'
import { ProducerPayOutStatusEnum } from '~/lib/bloceryConst'

const pickerLang = {
    months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    from: 'From',
    to: 'To'
}


export default class ProducerPayout extends Component{

   constructor(props) {
        super(props);

        const today =  moment();
        const initMonth = today.subtract(1, 'month');
        const limitMonth = {year: initMonth.year(), month: initMonth.month() + 1};

        this.payoutLimitMonth =  limitMonth;

        this.state = {
            loading: false,
            chainLoading: false,
            data: [],
            excelData: [],
            columnDefs: [
                {headerName: "판매자상호", field: "producerFarmName", width: 100},
                {headerName: "판매자이름", field: "producerName", width: 100},
                {headerName: "입금은행", field: "bankInfo.name", width: 90},
                {headerName: "입금계좌", field: "payoutAccount"},
                {headerName: "에금주", field: "payoutAccountName"},
                {headerName: "[총정산예정금액]", field: "sumNotYetPayoutPrice", cellRenderer: 'formatCurrencyRenderer'},
                {headerName: "[총판매금액]", field: "sumNotYetOrderPrice", cellRenderer: 'formatCurrencyRenderer'},

                {headerName: "카드미정산건수", field: "totalNotyetPayoutCount", width: 100},
                {headerName: "미정산결제금액", field: "totalNotyetOrderPrice", cellRenderer: 'formatCurrencyRenderer'},
                {headerName: "미정산수수료", field: "totalNotyetCommission", width: 110, cellRenderer: 'formatCurrencyRenderer'},
                {headerName: "미정산지급예정금액", field: "totalNotyetPayoutAmount", width: 140, cellRenderer: 'formatCurrencyRenderer'},
                {headerName: "미정산구매취소건수", field: "totalNotyetCancelCount", width: 150},
                {headerName: "미정산취소수수료", field: "totalNotyetCancelFee", cellRenderer: 'formatCurrencyRenderer'},

                {headerName: "BLCT미정산건수", field: "notYetBlctPayoutCount", width: 140, cellRenderer: 'formatCurrencyRendererWithBracket'}, //wrong
                {headerName: "BLCT결제금", field: "blctNotYetOrderToken", cellRenderer: 'formatCurrencyRendererWithBracket'},
                {headerName: "BLCT수수료", field: "blctNotYetCommission", width: 110, cellRenderer: 'formatCurrencyRendererWithBracket'},
                {headerName: "BLCT지급금", field: "blctNotYetPayoutAmount", width: 110, cellRenderer: 'formatCurrencyRendererWithBracket'},
                {headerName: "BLCT->원", field: "notYetBlctToWon", width: 110, cellRenderer: 'formatCurrencyRendererWithBracket'},

            ],
            columnFinishedDefs: [
                {headerName: "판매자상호", field: "producerFarmName", width: 100},
                {headerName: "판매자이름", field: "producerName", width: 100},
                {headerName: "입금은행", field: "bankInfo.name", width: 90},
                {headerName: "입금계좌", field: "payoutAccount"},
                {headerName: "에금주", field: "payoutAccountName"},
                {headerName: "[총정산금액]", field: "sumCompletePayoutPrice", cellRenderer: 'formatCurrencyRenderer'},
                {headerName: "[총판매금액]", field: "sumCompleteOrderPrice", cellRenderer: 'formatCurrencyRenderer'},

                {headerName: "정산완료건수", field: "totalPayoutCompletedCount", width: 110},
                {headerName: "정산완료결제금액", field: "totalOrderPrice", cellRenderer: 'formatCurrencyRenderer'},
                {headerName: "정산완료수수료", field: "totalCommission", cellRenderer: 'formatCurrencyRenderer'},
                {headerName: "정산완료지급금", field: "totalPayoutAmount", cellRenderer: 'formatCurrencyRenderer'},

                {headerName: "정산완료구매취소건수", field: "totalCancelCount", width: 150},
                {headerName: "정산완료취소수수료", field: "totalCancelFee", width: 150, cellRenderer: 'formatCurrencyRenderer'},

                {headerName: "BLCT정산완료건수", field: "totalBlctPayoutCount", width: 140},
                {headerName: "BLCT결제금", field: "blctTotalOrderToken", cellRenderer: 'formatCurrencyRenderer'},
                {headerName: "BLCT수수료", field: "blctTotalCommission", width: 110, cellRenderer: 'formatCurrencyRenderer'},
                {headerName: "BLCT지급금", field: "blctTotalPayoutAmount", width: 110, cellRenderer: 'formatCurrencyRenderer'},
                {headerName: "BLCT->원", field: "totalBlctToWon", width: 110, cellRenderer: 'formatCurrencyRenderer'},

            ],
            defaultColDef: {
                width: 130,
                resizable: true,
            },
            components: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatCurrencyRendererWithBracket: this.formatCurrencyRendererWithBracket,
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 정산 내역이 없습니다.</span>',

            showMonthPicker:false,
            searchMonthValue: limitMonth,

            isSearchDataExist:false,
            searchMode:false,  //true일경우 정산버튼 제거 - 현재달(정산이 불가능한 달) 조회시 정산버튼없이 조회만 가능
            tempProducerNotyetBlct: 0,  // 조회달의 tempProducer의 미정산 BLCT 총액
        }
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            this.props.history.push('/admin');
        }
    }

    formatCurrencyRenderer = ({value, data:rowData}) => {
        return ComUtil.addCommas(value);
    }

    formatCurrencyRendererWithBracket = ({value, data:rowData}) => {
       let commaValue = ComUtil.addCommas(value);
       return rowData.payoutBlct ? "(" + commaValue + ")" : commaValue;
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api
        this.gridColumnApi = params.columnApi

        console.log("onGridReady.....")

        this.setExcelData();
    }

    onGridFilterChanged () {
        this.setExcelData();
    }

    onRefreshClick = async () => {
        await this.search()
        this.setExcelData();
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
            this.setExcelData();
        }
    }

    onCompletePayout  = async () => {
       alert('신한은행 이체 API 연동은 추후 제공됩니다')
    }

    setExcelData() {
        if(!this.gridApi)
            return;

        var excelData = this.getExcelData();

        this.setState({
            excelData: excelData,
        })
    }

    search = async () => {
        if(!this.state.searchMonthValue)
            return;

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

        const {data:tempProducerNotyetBlct} = await getAllTempProducerBlctMonth(year, month)
        console.log("tempProducerNotyetBlct : ", tempProducerNotyetBlct);

        let isSearchDataExist = data.length > 0;

        this.setState({
            data: data,
            loading: false,
            isSearchDataExist: isSearchDataExist,
            searchMode: searchMode,
            tempProducerNotyetBlct: tempProducerNotyetBlct
        })
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


    getExcelData = () => {
        const columns = this.state.columnDefs.map((element)=> {
            return element.headerName;
        });

        var payoutDataList = [];

        this.gridApi.forEachNodeAfterFilter((node) => {
            payoutDataList.push(node.data);
        });

        const data = payoutDataList.map((payout) => {
            return [
                // this.makePayoutCategory(payout),
                payout.producerFarmName, payout.producerName, payout.bankInfo.name, payout.payoutAccount, payout.payoutAccountName,
                payout.sumNotYetPayoutPrice, payout.sumNotYetOrderPrice, payout.totalNotyetPayoutCount, payout.totalNotyetOrderPrice,
                payout.totalNotyetCommission, payout.totalNotyetPayoutAmount, payout.totalNotyetCancelCount, payout.totalNotyetCancelFee,
                payout.notYetBlctPayoutCount, payout.blctNotYetOrderToken, payout.blctNotYetCommission, payout.blctNotYetPayoutAmount, payout.notYetBlctToWon
            ]
        });

        // console.log(JSON.stringify(data));

        return [{
            columns: columns,
            data: data,
        }]
    }

    makeMonthText = (m) => {
        if (m && m.year && m.month) return (m.year + "년 " + pickerLang.months[m.month-1])
        return '?'
    }

    makeTitleText = (m) => {
        return "블로서리 " + this.makeMonthText(m) + " 정산";
    }

    handleClickMonthBox() {
         this.setState({
            showMonthPicker: true,
        })
    }
    handleAMonthChange(value, text) {
        //
    }
    handleAMonthDismiss(value) {
        this.setState({
            showMonthPicker:false,
            searchMonthValue: value,
        });
    }

    render() {

        return (
            <Fragment>
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                {
                    this.state.loading && <BlocerySpinner/>
                }

                <Container>
                    <hr/>
                    <Row>
                        <Label size="sm"> * 정산은 월 단위로 NotYet 상태의 미정산 건에 대해서 정상적으로 처리된 경우 (은행 이체를 수행 한 후) Complete 상태로 변경합니다.</Label>
                    </Row>
                    <hr/>
                    <Row>
                         <Col>
                            {
                                this.state.showMonthPicker &&
                                <MonthPicker
                                    show={true}
                                    years={[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029]}
                                    value={this.state.searchMonthValue}
                                    lang={pickerLang.months}
                                    onChange={this.handleAMonthChange.bind(this)}
                                    onDismiss={this.handleAMonthDismiss.bind(this)}
                                >
                                </MonthPicker>
                            }
                            <MonthBox value={this.makeMonthText(this.state.searchMonthValue)}
                                      onClick={this.handleClickMonthBox.bind(this)}/>
                        </Col>

                        <Col>
                            <Button color={'info'} size={'sm'} block  style={{width: '100px'}}
                                    onClick={this.onRefreshClick}>
                                <div className="d-flex">
                                    <Refresh fontSize={'small'}/> 조회
                                </div>
                            </Button>
                        </Col>
                    </Row>

                    <hr/>
                    {
                        this.state.isSearchDataExist &&
                            <Row>
                                <Col>
                                    <label><h6>{this.makeTitleText(this.state.searchMonthValue)}</h6></label>
                                </Col>
                                <Col>
                                    <ExcelDownload data={this.state.excelData}
                                                   fileName={this.makeTitleText(this.state.searchMonthValue)}
                                                   sheetName={this.makeTitleText(this.state.searchMonthValue)}
                                                   button={
                                        <Button color={'info'} size={'sm'} style={{width: '100px'}}>
                                            <div className="d-flex">
                                                엑셀 다운로드
                                            </div>
                                        </Button>
                                    }/>
                                </Col>
                            </Row>
                    }

                    {
                        this.state.isSearchDataExist &&
                            <Row>
                                <Col>
                                    {/*<Button color={'info'} size={'sm'} block  style={{width: '150px'}}*/}
                                            {/*onClick={this.onCompletePayout}>*/}
                                        {/*<div className="d-flex">*/}
                                            {/*신한은행 즉시 이체 요청*/}
                                        {/*</div>*/}
                                    {/*</Button>*/}
                                </Col>
                                <Col>
                                    { !this.state.searchMode &&
                                        <Button color={'info'} size={'sm'} block style={{width: '150px'}}
                                                onClick={this.onManualCompletePayout}>
                                            <div className="d-flex">
                                                수동 정산 완료 처리
                                            </div>
                                        </Button>
                                    }
                                </Col>
                             </Row>
                    }
                </Container>

                {
                    <div
                        className="ag-theme-balham"
                        style={{
                            height: '500px'
                        }}
                    >
                        <div className="d-flex align-items-center">
                            <h4> 미정산 내역 </h4> &nbsp;(card+Blct 결제: 건수가 card와 blct양쪽에 중복 반영됨)
                        </div>
                        <br/>
                        <AgGridReact
                            enableSorting={true}                //정렬 여부
                            enableFilter={true}                 //필터링 여부
                            columnDefs={this.state.columnDefs}  //컬럼 세팅
                            defaultColDef={this.state.defaultColDef}
                            enableColResize={true}              //컬럼 크기 조정
                            overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                            onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            onFilterChanged={this.onGridFilterChanged.bind(this)}
                            rowData={this.state.data}
                            components={this.state.components}
                        >
                        </AgGridReact>
                    </div>
                }

                <br/>
                <br/>
                {
                    <div
                        className="ag-theme-balham"
                        style={{
                            height: '500px'
                        }}
                    >
                        <br/>
                        <br/>

                        <h4> 정산완료 내역 </h4>
                        <br/>
                        <AgGridReact
                            enableSorting={true}                //정렬 여부
                            enableFilter={true}                 //필터링 여부
                            columnDefs={this.state.columnFinishedDefs}  //컬럼 세팅
                            defaultColDef={this.state.defaultColDef}
                            enableColResize={true}              //컬럼 크기 조정
                            overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                            onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            onFilterChanged={this.onGridFilterChanged.bind(this)}
                            rowData={this.state.data}
                            components={this.state.components}
                        >
                        </AgGridReact>
                    </div>
                }


            </Fragment>

         )
    }
}
