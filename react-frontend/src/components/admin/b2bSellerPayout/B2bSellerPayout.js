import React, { Fragment, Component, PropTypes } from 'react';
//import { getAllProducerPayoutList, setProducerPayoutStatus } from '~/lib/adminApi'
import { getAllSellerPayoutList, setSellerPayoutStatus } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
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


export default class B2bSellerPayout extends Component{

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
                {headerName: "매출구분", cellRenderer: "categoryRederer"},
                {headerName: "정산상태", field: "producerPayoutStatus", cellRenderer: "payoutStatusEnumRenderer", cellClassRules: {
                    grayBackground: function(params) {
                        return params.value === ProducerPayOutStatusEnum.Complete;
                    }
                }},
                {headerName: "정산상태일시", field: "producerPayoutStatusTimestamp", cellRenderer: "timestampRenderer"},
                {headerName: "판매자상호", field: "producerFarmName"},
                {headerName: "판매자이름", field: "producerName"},
                {headerName: "입금은행", field: "bankInfo.name"},
                {headerName: "입금계좌", field: "payoutAccount", width: 150},
                {headerName: "에금주", field: "payoutAccountName"},
                {headerName: "구매확정건수", field: "totalOrderCount"},
                {headerName: "구매취소건수", field: "totalCancelCount"},
                {headerName: "정산금액", field: "totalPayout", sort:"desc"},
                {headerName: "결제금액", field: "totalOrderPrice"},
                {headerName: "수수료", field: "totalBloceryOnlyFee"},
                {headerName: "소비자보상", field: "totalConsumerReward"},
                {headerName: "생산자보상", field: "totalProducerReward"},
                {headerName: "지연배송보상", field: "totalDelayPenalty"},
                {headerName: "신용카드수수료", field: "totalCreditCardCommission"},
            ],
            defaultColDef: {
                width: 100,
                resizable: true,
            },
            components: {
                payoutStatusEnumRenderer: this.payoutStatusEnumRenderer,
                timestampRenderer: this.timestampRenderer,
                categoryRederer: this.categoryRederer,
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 정산 내역이 없습니다.</span>',

            showMonthPicker:false,
            searchMonthValue: limitMonth,

            isSearchDataExist:false,
        }
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            this.props.history.push('/admin');
        }
    }

    payoutStatusEnumRenderer = ({value}) => {
        return value;
        // TODO: enum 을 JsonFormat 이용해서 사용하는 경우 JsonObject 로 부터 displayName 을 추출하여 리턴하는 것으로 수정
        // console.log(JSON.stringify(value));
        // console.log(value);
        // return JSON.stringify(value);
    }

    timestampRenderer = ({value}) => {
        return !value ? "-" : ComUtil.utcToString(value, 'YYYY-MM-DD HH:mm:ss');
    }

    categoryRederer = ({data}) => {
        return this.makePayoutCategory(data);
    }

    makePayoutCategory = (data) => {
        return data.totalOrderCount > 0 ? "구매확정" : "취소수수료";
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
        await this.manualCompletePayout()
        await this.search()
        this.setExcelData();
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
        
        if(year > limitYear ||
            (year >= limitYear && month > limitMonth) )
        {
            alert(limitMonthText + "까지만 정산할 수 있습니다.")
            return
        }

        this.setState({loading: true})

        const { status, data } = await getAllSellerPayoutList(year, month)

        console.log(data);
        if(status !== 200){
            alert('정산 리스트 조회에 실패 하였습니다')
            return
        }

        let isSearchDataExist = data.length > 0;

        this.setState({
            data: data,
            loading: false,
            isSearchDataExist: isSearchDataExist
        })
    }

    makePayoutListGroupByProducer = () => {
        if (!this.state.isSearchDataExist) {
            return null;
        }

        var data = this.state.data;
        var payoutDataList = [];

        data.forEach((node) => {
            if (node.producerPayoutStatus === ProducerPayOutStatusEnum.NotYet)
                payoutDataList.push(node);
        });

        if (payoutDataList.length <= 0) {
            return null;
        }

        // 생산자별 burn 요청하기 위한 그룹핑
        // https://stackoverflow.com/questions/23705077/linq-js-to-group-by-array-of-objects-in-javascript
        let payoutListGroupByProducer = Enumerable.from(payoutDataList)
            .groupBy(
                x => x.sellerNo,
                null,
                (key, g) => {
                    return {
                        sellerNo: key,
                        //ethAccount: g.first().producerEthAccount,
                        bankInfo: g.first().bankInfo,
                        orderSeqList: g.selectMany(x => x.orderSeqList).distinct().toArray(),
                        totalPayout: g.sum(x => x ? x.totalPayout : 0),

                    }
                })
            .toArray();

        return payoutListGroupByProducer;
    }

    processOrderDetailPayoutStatus = async (orderSeqList, payoutStatus, totalPayout) => {
        const { status, isSuccess } = await setSellerPayoutStatus(orderSeqList, payoutStatus, totalPayout)
        if(status !== 200) {
            return false
        }

        return isSuccess;
    }

    manualCompletePayout = async ()=> {
       console.log("manualCompletePayout")

        var payoutListGroupByProducer = this.makePayoutListGroupByProducer();
        if(!payoutListGroupByProducer || payoutListGroupByProducer.length <= 0)
        {
            alert('더 이상 정산할 항목이 없습니다.')
            return;
        }

        this.setState({chainLoading: true})

        // TODO: 프로세스 중간에 브라우저를 닫더라도 한번 요청작업이 시작된 작업은 진행되는 것을 보장하기 위해서 정산 프로세스 벡엔드로 이동
        // https://medium.com/@trustyoo86/async-await%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%9C-%EB%B9%84%EB%8F%99%EA%B8%B0-loop-%EB%B3%91%EB%A0%AC%EB%A1%9C-%EC%88%9C%EC%B0%A8-%EC%B2%98%EB%A6%AC%ED%95%98%EA%B8%B0-315f31b72ccc
        // forEach의 경우 해당 loop가 종료되는 것에 대한 결과를 기다려주지 않으므로 for...of 사용함
        for(const x of payoutListGroupByProducer)
        {
            // 블록체인 호출 전에 OrderDetail의 payoutStatus를  PendingBurnBls 로 변경  => 블록체인 호출 안해도 되기에 PendingBurnBls단계 삭제함.
            var isSuccess = await this.processOrderDetailPayoutStatus(x.orderSeqList, ProducerPayOutStatusEnum.Complete, x.totalPayout);
            if(isSuccess === false) {
                this.setState({chainLoading: false})
                alert("주문 정보 테이블의 정산 상태를 PendingBurnBls로 변경에 실패했습니다. db 연결 상태를 확인 후 시스템 관리자에게 연락해 주세요.")
                return;
            }
        };

        this.setState({chainLoading: false})
        alert("수동 정산 프로세스가 완료되었습니다.")
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
                this.makePayoutCategory(payout),
                payout.producerPayoutStatus, payout.producerPayoutStatusTimestmap,
                payout.producerFarmName, payout.producerName, payout.bankInfo.name, payout.payoutAccount, payout.payoutAccountName,
                payout.totalOrderCount, payout.totalPayout,
                payout.totalOrderPrice,
                payout.totalBloceryOnlyFee, payout.totalConsumerReward, payout.totalProducerReward, payout.totalDelayPenalty, payout.totalCreditCardCommission
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
                        <Label size="sm"> * 정산은 월 단위로 NotYet 상태의 미정산 건에 대해서 블록체인에 Bls Burn을 요청한 후 정상적으로 처리된 경우 (은행 이체를 수행 한 후) Complete 상태로 변경합니다.</Label>
                        <Label size="sm"> * Pending 상태의 정산 건에 대해서는 수작업으로 확인 후 정산 완료 처리하시기 바랍니다.</Label>
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
                                        <Button color={'info'} size={'sm'} block style={{width: '100px'}}>
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
                                    <Button color={'info'} size={'sm'} block  style={{width: '150px'}}
                                            onClick={this.onCompletePayout}>
                                        <div className="d-flex">
                                            신한은행 즉시 이체 요청
                                        </div>
                                    </Button>
                                </Col>
                                <Col>
                                    <Button color={'info'} size={'sm'} block  style={{width: '150px'}}
                                            onClick={this.onManualCompletePayout}>
                                        <div className="d-flex">
                                            수동 정산 완료 처리
                                        </div>
                                    </Button>
                                </Col>
                             </Row>
                    }
                </Container>

                {
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
