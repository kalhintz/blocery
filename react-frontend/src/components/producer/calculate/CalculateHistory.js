import React, { Component, Fragment } from 'react'
import { Table } from 'reactstrap'

import Style from './Calculate.module.scss'

import { getLoginUserType, getLoginUser } from "~/lib/loginApi";
import { Webview } from "~/lib/webviewApi";
import { getProducer, getAllProducerCalculateList } from "~/lib/producerApi";
import classNames from 'classnames';

import ComUtil from '~/util/ComUtil'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

export default class CalculateHistory extends Component {
    constructor(props) {
        super(props);
        this.serverToday=null;
        this.rowHeight=30;
        this.isPcWeb=false;
        this.state = {
            loginUser: '',
            blctBalance: '',    // 잔여 보유적립금
            data: null,
            rowData: [],
            excelData: {
                columns: [],
                data: []
            },

            columnDefs: [
                {
                    headerName: "정산월", field: 'month',
                    width: 80,
                    cellStyle:this.getCellStyle,
                    filterParams: {
                        clearButton: true
                    }
                },
                {
                    headerName: "상품 판매 지급액",
                    cellStyle:this.getCellStyle,
                    children: [
                        {headerName: '상품 판매금액 ⓐ',width: 120, field: 'totalCurrentPrice', cellStyle: this.getCellStyle, filterParams:{clearButton: true}, cellRenderer: 'numberFormatRenderer'},
                        {headerName: '배송비 ⓑ', width: 100, field: 'totalDeliveryFee', cellStyle: this.getCellStyle, filterParams:{clearButton: true}, cellRenderer: 'numberFormatRenderer'},
                        {headerName: '결제금액 ⓒ=ⓐ+ⓑ', field: 'totalOrderPrice', cellStyle: this.getCellStyle, filterParams:{clearButton: true}, cellRenderer: 'numberFormatRenderer'},
                        {headerName: '판매수수료 ⓓ=ⓒ*5%', field: 'totalCommission', cellStyle: this.getCellStyle, filterParams:{clearButton: true}, cellRenderer: 'numberFormatRenderer'},
                        {headerName: '지연보상 ⓔ',width: 100, field: 'totalDelayPenalty', cellStyle: this.getCellStyle, filterParams:{clearButton: true}, cellRenderer: 'numberFormatRenderer'},
                        {headerName: '지급액 ⓕ=ⓒ-(ⓓ+ⓔ)', field: 'totalPayments', cellStyle: this.getCellStyle, filterParams:{clearButton: true}, cellRenderer: 'numberFormatRenderer'},
                    ],
                    filterParams: {
                        clearButton: true
                    }
                },
                {
                    headerName: "취소 수수료 지급액 ⓖ", field: "totalCancelFee",
                    cellStyle:this.getCellStyle,
                    filterParams: {
                        clearButton: true
                    },
                    cellRenderer: 'numberFormatRenderer'
                },
                {
                    headerName: "정산금액 ⓗ=ⓕ+ⓖ",
                    cellStyle:this.getCellStyle,
                    filterParams: {
                        clearButton: true
                    },
                    valueGetter: function(params) {
                        let totalPayout = params.data.totalPayments + params.data.totalCancelFee;
                        return ComUtil.toCurrency(totalPayout) + '원';
                    },
                },
                {
                    headerName: "지급정보", field: "payoutAccount",
                    width: 200,
                    cellStyle:this.getCellStyle,
                    filterParams: {
                        clearButton: true
                    },
                    valueGetter: function(params) {
                        if (params.data.payoutAccount !== undefined) {
                            let bankName = params.data.bankInfo.name;
                            let payoutAccount = params.data.payoutAccount
                            let payoutAccountName = params.data.payoutAccountName
                            return bankName + ' ' + payoutAccount  + '(예금주:' + payoutAccountName + ')';
                        }else{
                            return "-";
                        }
                    }
                },
                {
                    headerName: "상세내역",
                    width: 80,
                    cellStyle:this.getCellStyle,
                    filterParams: {
                        clearButton: true
                    },
                    valueGetter: function(params) {
                        let count = params.data.totalOrderCount + params.data.totalCancelCount
                        return ComUtil.toCurrency(count) + '건'
                    }
                },
            ],
            defaultColDef: {
                width: 150,
                resizable: true
            },
            components: {numberFormatRenderer: this.numberFormatRenderer},
            frameworkComponents: {},
            rowHeight: this.rowHeight,
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            isPcWeb: this.isPcWeb
        }

    }

    async componentDidMount() {
        await this.getUser();
        this.search();
    }

    numberFormatRenderer = ({value, data:rowData}) => {
        return ComUtil.toCurrency(value) + '원'
    }

    getUser = async() => {
        const {data: userType} = await getLoginUserType();
        let loginUser = await getLoginUser();

        if(userType !== 'producer') {
            Webview.openPopup('/login', true);
            return
        }
        this.setState({
            loginUser: loginUser
        })
    }

    // 로그인한 producer의 정산내역 조회
    search = () => {
        if(this.gridApi) {
            this.gridApi.showLoadingOverlay();
        }

        this.getPayoutHistory();
    }

    getPayoutHistory = async () => {

        let tempHistory = [];
        const rowData = []

        const result = [1,2,3,4,5,6,7,8,9,10,11,12].map(async (month, index) => {
            const { status, data } = await getAllProducerCalculateList(0, month)
            data.month = month
            tempHistory.push(data)

            let row = data[0] || {}
            row.month = month + ' 월'

            rowData.push(row)
        })

        await Promise.all(result)

        rowData.sort((a, b) => {
            return parseFloat(a.month) - parseFloat(b.month);
        })

        console.log(rowData)

        this.setState({
            rowData: rowData
        })
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.ColumnApi;
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



    render(){
        return(
            <div>
                <div className='p-1'>

                </div>
                <div
                    id="myGrid"
                    className={classNames('ag-theme-balham', Style.agGridDivCalc)}
                >
                    <AgGridReact
                        enableSorting={true}                //정렬 여부
                        enableFilter={true}                 //필터링 여부
                        floatingFilter={false}               //Header 플로팅 필터 여부
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
                        rowData={this.state.rowData}
                        components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        frameworkComponents={this.state.frameworkComponents}
                        suppressMovableColumns={true} //헤더고정시키
                        //onFilterChanged={this.onGridFilterChanged.bind(this)} //필터온체인지 이벤트
                        // onRowClicked={this.onSelectionChanged.bind(this)}
                        // onRowSelected={this.onRowSelected.bind(this)}
                        // onSelectionChanged={this.onSelectionChanged.bind(this)}
                        // suppressRowClickSelection={true}    //true : 셀 클릭시 체크박스 체크 안됨, false : 셀 클릭시 로우 단위로 선택되어 체크박스도 자동 체크됨 [default 값은 false]
                    ></AgGridReact>
                </div>

            </div>
        );
    }

}