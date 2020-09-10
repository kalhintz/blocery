import React, { Component, PropTypes } from 'react';
import { Button, Input } from 'reactstrap'
import "react-table/react-table.css"
import { getAllBlctToWonCachedLog, } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'


import { ExcelDownload, ModalConfirm } from '~/components/common'


import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import ComUtil from "~/util/ComUtil";



export default class BlctToWon extends Component {
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
            goodsNo: null,
            columnDefs: [
                {headerName: "날짜", field: "day", sort:"desc", width:150 , valueGetter: function(params) {
                    return ComUtil.yyyymmdd2DateStr(''+params.data.day)
                }},
                {headerName: "blct 적용가격(원) = A * B", field: "blctToWon", width: 200},

                {headerName: "A: 전일 USD환율 종가", field: "usdRate", width: 170},
                {headerName: "B: 전일 bly종가(달러) ", field: "blyPrice", width: 170},

                {headerName: "bly종가 기록시간", field: "blyPriceeTimestamp", width: 200, valueGetter: function(params) {
                    return ComUtil.utcToString(params.data.blyPriceTimestamp, 'YYYY.MM.DD HH:mm:ss')
                }},

                {headerName: "Cache시간 (BLCT원 계산시간)", field: "cachedTime", width: 200, valueGetter: function(params) {
                    return ComUtil.utcToString(params.data.cachedTime, 'YYYY.MM.DD HH:mm:ss')
                }},

                {headerName: "USD환율 날짜", field: "usdDay", width: 200, valueGetter: function(params) {
                    return ComUtil.yyyymmdd2DateStr(''+params.data.usdDay)
                }},

            ],
            defaultColDef: {
                width: 110,
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
        this.setState({loading: true});
        const { status, data } = await getAllBlctToWonCachedLog();
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }

        console.log(data);

        //항목 변경
        // data.map((item, index) => {
        //     item.saleEnd = ComUtil.utcToString(item.saleEnd);
        //     item.discountRate = ComUtil.roundDown(item.discountRate,2);
        //     item.inTimeSalePeriod = (item.inTimeSalePeriod)?'true':'';
        //     item.noDirectGoods = (item.directGoods)?'':'true';
        //     item.salePausedButton = (!item.salePaused && item.directGoods)?true:false
        //
        //     return item;
        // })

        this.setState({
            data: data,
            loading: false
        })

        this.setExcelData();
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
            '날짜', 'bly 가격(원)', '전일 USD환율 종가', '전일 bly종가(달러)'
        ]
        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.map((item ,index)=> {
            //let date = ComUtil.getDate(day);

            return [
                item.day, item.blctToWon, item.usdRate, item.blyPrice
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

        // if(this.state.data.length <= 0)
        //     return null

        return(
            <div>
                <div className="d-flex p-1">
                    <ExcelDownload data={this.state.excelData}
                                   fileName="BLY일별가격"
                                   sheetName="BLY일별가격"
                    />

                    <div className="flex-grow-1 text-right">
                        총 {this.state.data.length} 건
                    </div>

                </div>
                <div
                    id="myGrid"
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
                        // components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        //frameworkComponents={this.state.frameworkComponents}
                        enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        // onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                    >
                    </AgGridReact>
                </div>
            </div>
        );
    }
}