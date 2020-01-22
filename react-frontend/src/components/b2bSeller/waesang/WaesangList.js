import React, { Component, PropTypes } from 'react';
import { getSeller, getWaesangBySellerNo, setWaesangPayStatConfirm } from '~/lib/b2bSellerApi'
import { getB2bLoginUserType, getB2bLoginUser, autoLoginCheckAndTry } from '~/lib/b2bLoginApi'
import { getServerToday } from '~/lib/commonApi'
import "react-table/react-table.css"
import ComUtil from '~/util/ComUtil'
import { Container, Row, Col, Table, Modal, ModalHeader, ModalBody, ModalFooter, Button, Badge } from 'reactstrap'
import { Cell } from '~/components/common'
import { Refresh } from '@material-ui/icons'
import { Webview } from '~/lib/webviewApi'
import classNames from 'classnames';
//ag-grid
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import Style from './WaesangList.module.scss'

export default class WaesangList extends Component {

    constructor(props) {
        super(props);

        this.serverToday=null;
        this.rowHeight=30;
        this.isPcWeb=false;
        this.state = {
            isDidMounted: false,
            waesangTotAmt : 0,
            waesangTotReadyAmt : 0,
            waesangTotPaidAmt : 0,
            waesangAccounts:[],     //판매자 외상계좌정보리스트
            dataList: null,
            dataListCnt:0,
            columnDefs: this.getColumnDefs(),
            defaultColDef: {
                width: 100,
                resizable: true
            },
            components: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatDateRenderer: this.formatDateRenderer
            },
            frameworkComponents: {
                incomeConfirmRenderer : this.incomeConfirmRenderer
            },
            rowHeight: this.rowHeight,
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            isPcWeb: this.isPcWeb,

            isIncomeModal: false,
            dealSeq: null,
            buyerNm:'',
            buyerWaesangAmt:0
        }
    }

    //주문상태 명칭 가져오기
    static getPayStatusNm = (data) => {
        let payStatusNm = "";
        if(data.payMethod === "waesang"){
            if(data.payStatus === "ready"){
                payStatusNm = '미입금';
            } else if(data.payStatus === "paid"){
                payStatusNm = '입금확인';
            } else if(data.payStatus === "cancelled"){
                payStatusNm = '주문취소';
            }
        }
        return payStatusNm;
    }

    //금액 천자리 포맷터
    static formatCurrencyFormatter = ({value}) => {
        return ComUtil.addCommas(value);
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        //console.log("onGridReady");
        /*
        //리사이징 기능
        params.api.sizeColumnsToFit();
        window.addEventListener("resize", function() {
            setTimeout(function() {
                params.api.sizeColumnsToFit();
            });
        });
        params.api.sizeColumnsToFit();
        */
    }

    // Ag-Grid column Info
    getColumnDefs () {

        // 결제구분 field
        let waesangPayMethodColumn = {
            headerName: "결제구분", field: "payMethod",
            suppressSizeToFit: true,
            width: 120,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true //클리어버튼
            },
            valueGetter: function(params) {
                let payMethodTxt = "";
                if(params.data.payMethod === "card" ){
                    payMethodTxt = "카드결제";
                }else if(params.data.payMethod === "waesang" ){
                    payMethodTxt = "외상거래";
                }
                return payMethodTxt
            }
        };

        // 입금상태 field
        let sttColumn = {
            headerName: "입금상태", field: "payStatus",
            width: 100,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "incomeConfirmRenderer",
            suppressMenu: "false",
            filterParams: {
                clearButton: true //클리어버튼
            },
            valueGetter: function(params) {
                return WaesangList.getPayStatusNm(params.data)
            }
        };

        // 주문번호 field
        let dealSeqColumn = {
            headerName: "주문번호", field: "dealSeq",
            width: 120,
            cellStyle: this.getCellStyle,
            filterParams: {
                clearButton: true
            }
        };


        // 주문일자 field
        let dealDateColumn = {
            headerName: "주문일시", field: "orderDate",
            sort:"desc",
            width: 180,
            suppressSizeToFit: true,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "formatDateRenderer",
            /*filterParams: {
                clearButton: true //클리어버튼
            },*/
            valueGetter: function(params) {
                //console.log("params",params);
                //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                return ComUtil.utcToString(params.data.orderDate);
            },
            filter: "agDateColumnFilter",
            filterParams: {
                comparator: function (filterLocalDateAtMidnight, cellValue) {
                    let dateAsString = cellValue;
                    if (dateAsString == null) return -1;

                    let filterLocalDate = ComUtil.utcToString(filterLocalDateAtMidnight);
                    let cellDate = ComUtil.utcToString(dateAsString);

                    if (filterLocalDate == cellDate) {
                        return 0;
                    }
                    if (cellDate < filterLocalDate) {
                        return -1;
                    }
                    if (cellDate > filterLocalDate) {
                        return 1;
                    }
                },
                browserDatePicker: true, //달력
                clearButton: true //클리어버튼
            }
        };

        // 외상(주문)금액 field
        let dealAmtColumn = {
            headerName: "외상금액", field: "orderPrice",
            suppressFilter: true, //no filter
            suppressMenu: true, suppressSorting: false,
            width: 120,
            cellStyle:this.getCellStyle({cellAlign: 'right'}),
            valueFormatter: WaesangList.formatCurrencyFormatter,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let columnDefs = [
            waesangPayMethodColumn,
            sttColumn,
            dealSeqColumn,
            {
                headerName: "주문명", field: "dealDetailName",
                width: 150,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            dealDateColumn,
            {
                headerName: "주문자", field: "consumerNm",
                suppressSizeToFit: true,
                width: 100,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "이메일", field: "consumerEmail",
                suppressSizeToFit: true,
                width: 150,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "전화번호", field: "consumerPhone",
                suppressSizeToFit: true,
                width: 100,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            dealAmtColumn,
            {
                headerName: "입금시작일", field: "waesangPayFrom",
                suppressFilter: true, //no filter
                suppressMenu: true, suppressSorting: false,
                width: 120,
                cellStyle:this.getCellStyle({cellAlign: 'center'}),
                filterParams: {
                    clearButton: true //클리어버튼
                },
                valueGetter: function(params) {
                    //console.log("params",params);
                    //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                    if(params.data.waesangPayFrom) {
                        return ComUtil.utcToString(params.data.waesangPayFrom);
                    }
                }
            },
            {
                headerName: "입금종료일", field: "waesangPayTo",
                suppressFilter: true, //no filter
                suppressMenu: true, suppressSorting: false,
                width: 120,
                cellStyle:this.getCellStyle({cellAlign: 'center'}),
                filterParams: {
                    clearButton: true //클리어버튼
                },
                valueGetter: function(params) {
                    //console.log("params",params);
                    //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                    if(params.data.waesangPayTo) {
                        return ComUtil.utcToString(params.data.waesangPayTo);
                    }
                }
            },
            {
                headerName: "입금자명", field: "waesangPayerName",
                suppressFilter: true, //no filter
                suppressMenu: true, suppressSorting: false,
                width: 120,
                cellStyle:this.getCellStyle({cellAlign: 'center'}),
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "계좌정보", field: "waesangPayAcccount",
                suppressFilter: true, //no filter
                suppressMenu: true, suppressSorting: false,
                width: 200,
                cellStyle:this.getCellStyle({cellAlign: 'left'}),
                filterParams: {
                    clearButton: true //클리어버튼
                }
            }
        ];

        return columnDefs
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

    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data:rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    }
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value) : '-')
    }

    //Ag-Grid Cell 입금상태 버튼 렌더러
    incomeConfirmRenderer = ({value, data:rowData}) => {
        if (rowData.payStatus === "ready") {
            return (
                <Cell height={this.rowHeight}>
                    <div style={{textAlign: 'center'}}>
                        <Button size={'sm'} color={'warning'}
                                onClick={this.openWaesangConfirmPopup.bind(this, rowData)}><span
                            style={{color: 'red'}}>{'미입금'}</span></Button>
                    </div>
                </Cell>
            )
        }
        else if (rowData.payStatus === "paid") {
            return (
                <Cell height={this.rowHeight}>
                    <div style={{textAlign: 'center', color: 'blue'}}>{'입금확인'}</div>
                </Cell>
            )
        }

        return null;
    }

    async componentDidMount(){
        //자동로그인 check & try
        await autoLoginCheckAndTry();

        //로그인 체크
        const {data: userType} = await getB2bLoginUserType();
        if(userType == 'buyer') {
            //소비자용 mypage로 자동이동.
            Webview.movePage('/b2b');
        } else if (userType == 'seller') {
            let loginUser = await getSeller();
            //console.log(loginUser);
            if(!loginUser){
                Webview.openPopup('/b2b/login?userType=seller', true); // 생산자 로그인 으로 이동팝업
            }else{

                this.setState({
                    waesangAccounts : loginUser.data.waesangAccounts
                });
            }
        } else {
            Webview.openPopup('/b2b/login?userType=seller', true); // 생산자 로그인 으로 이동팝업
        }

        await this.search()
    }

    //새로고침 버튼
    onRefreshClick = async () => {
        await this.search();
    }

    // 주문조회 (search)
    search = async () => {
        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        //let { data:serverToday } = await getServerToday();
        //this.serverToday = serverToday;

        const { status, data } = await getWaesangBySellerNo();
        //console.log("외상거래내역==",data);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        //PC용으로 화면을 크게 그릴때 사용
        let isPcWeb = ComUtil.isPcWeb();//window.innerWidth > 760// ComUtil.isPcWeb();

        let rowHeight = (isPcWeb?30:220);
        this.isPcWeb = isPcWeb;
        this.rowHeight = rowHeight;

        this.setState({
            waesangTotAmt:data.totalWaesangAmt,
            waesangTotReadyAmt:data.totalWaesangReadyAmt,
            waesangTotPaidAmt:data.totalWaesangPaidAmt,
            dataListCnt: data.waesangListCnt,
            dataList: data.waesangList,
            isPcWeb:isPcWeb,
            rowHeight:rowHeight,
            columnDefs: this.getColumnDefs()
        })

        //ag-grid api
        if(this.gridApi){
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay();

            //ag-grid 높이 리셋 및 렌더링
            this.gridApi.resetRowHeights();
        }
        this.setState({
            isDidMounted: true
        });
    }

    openWaesangConfirmPopup = (deal) => {
        if(this.state.isDidMounted) {
            this.setState({
                dealSeq: deal.dealSeq,
                buyerNm: deal.receiverName,
                buyerWaesangAmt: deal.orderPrice,
                isIncomeModal: true
            });
        }
    }

    incomeCancel = () => {
        this.setState({
            isIncomeModal: false
        })
    }
    incomeConfirm = async () => {

        await setWaesangPayStatConfirm(this.state.dealSeq);

        await this.search();

        this.setState({
            isIncomeModal: false
        })
    }

    render() {
        if(!this.state.isDidMounted) return null;
        return(
            <div>
                <div className='pl-2 pt-2 pr-2 pb-0'>
                    <ul>
                        <li>외상거래에 대한 모든 내역을 확인할 수 있습니다.</li>
                        <li>각 외상거래 건에 대해서 <span style={{color:'red'}}>실제 입금이 확인이 된 경우 [확인] 버튼</span>을 눌러 완료로 처리해 주세요.</li>
                        <li>[설명]총 외상금액 : 외상거래로 구매가 이루어진 총 금액, 미입금 외상금액 : 외상거래 구매건 중 미입금 된 총 금액, 입금 외상금액 : 외상거래 구매건 중 입금이 확인된 총 금액</li>
                    </ul>
                </div>
                <div>
                    <div className='ml-2 mt-0 mr-1 p-1'>
                        <Container fluid>
                            <Row>
                                <Col xs={4} xl={2} className='p-0 mb-1'>
                                    <div className='mr-1'>
                                        <div className='p-2 bg-secondary text-white'>
                                            <div className='text-center f3 font-weight-bold'>총 외상금액</div>
                                        </div>
                                        <div className='p-2 bg-light'>
                                            <div className='text-center f5 font-weight-bold'>{ComUtil.addCommas(this.state.waesangTotAmt)} 원</div>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={4} xl={2} className='p-0 mb-1'>
                                    <div className='mr-1'>
                                        <div className='p-2 bg-secondary text-white'>
                                            <div className='text-center f3 font-weight-bold'>미입금 외상금액</div>
                                        </div>
                                        <div className='p-2 bg-light'>
                                            <div className='text-center f5 font-weight-bold'><span style={{color:'red'}}>{ComUtil.addCommas(this.state.waesangTotReadyAmt)}</span> 원</div>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={4} xl={2} className='p-0 mb-1'>
                                    <div className='mr-1'>
                                        <div className='p-2 bg-secondary text-white'>
                                            <div className='text-center f3 font-weight-bold'>입금 외상금액</div>
                                        </div>
                                        <div className='p-2 bg-light'>
                                            <div className='text-center f5 font-weight-bold'><span style={{color:'blue'}}>{ComUtil.addCommas(this.state.waesangTotPaidAmt)}</span> 원</div>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12} xl={6} className='p-0 mb-1'>
                                    <div className='mr-1'>
                                        <Container>
                                            <Row>
                                                <Col xs={2} className='p-2 text-center d-flex justify-content-center align-items-center bg-secondary' style={{borderTopLeftRadius: 5, borderBottomLeftRadius: 5}}>
                                                    <div className='text-center f3 font-weight-bold text-white'>계좌정보</div>
                                                </Col>
                                                <Col xs={10} className='p-2 text-left bg-light' style={{borderTopRightRadius: 5, borderBottomRightRadius: 5}}>
                                                    <div className='display-4 f5 font-weight-light'>
                                                        {
                                                            (this.state.waesangAccounts != null && this.state.waesangAccounts.length > 0) ?
                                                                this.state.waesangAccounts.map(({bank, account, owner }, index)=>{
                                                                    return (
                                                                    <div key={'waesangAccounts'+index}>
                                                                        {bank} {account} {owner}
                                                                    </div>
                                                                    )
                                                                })
                                                                : null
                                                        }
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Container>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </div>
                <div className="d-flex p-1">
                    <div className="">
                        <Button className={'bg-primary'} size={'sm'} block onClick={this.onRefreshClick}>
                            <div className="d-flex">
                                <Refresh fontSize={'small'}/>새로고침
                            </div>
                        </Button>
                    </div>
                    <div className="pl-1">
                    </div>
                    <div className="flex-grow-1 text-right">
                        {this.state.dataListCnt} 건
                    </div>
                </div>
                <div
                    id="myGrid"
                    className={classNames('ag-theme-balham',Style.agGridDivCalc)}
                >
                    <AgGridReact
                        enableSorting={true}                //정렬 여부
                        enableFilter={true}                 //필터링 여부
                        floatingFilter={true}               //Header 플로팅 필터 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}  //멀티체크 가능 여부
                        rowHeight={this.state.rowHeight}
                        //gridAutoHeight={true}
                        //domLayout={'autoHeight'}
                        enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.dataList}
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
                {/* 입금확인 */}
                <Modal isOpen={this.state.isIncomeModal} centered>
                    <ModalHeader>해당 외상거래 건에 대해서 입금이 확인되었나요?</ModalHeader>
                    <ModalBody>
                        실제 입금이 확인된 경우에만 [확인] 버튼을 눌러주세요 <br/>
                        * [확인]버튼을 누르면 외상거래 내역에 반영이 되며, <br/>구매자 내역에도 동시에 반영이 됩니다.
                        <hr/>
                        - 주문자 : {this.state.buyerNm} <br/>
                        - 외상거래금액 : {ComUtil.addCommas(this.state.buyerWaesangAmt)} 원
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.incomeCancel}>취소</Button>
                        <Button color="info" onClick={this.incomeConfirm}>확인</Button>
                    </ModalFooter>
                </Modal>

            </div>
        );
    }
}