import React, { Component, PropTypes } from 'react';
import { Button } from 'reactstrap'
import "react-table/react-table.css"
import { getAllFoodsSaleList } from '../../../lib/adminApi'
import { getLoginAdminUser } from '../../../lib/loginApi'

import { ExcelDownload } from '~/components/common'


import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import ComUtil from "../../../util/ComUtil";



export default class FoodsList extends Component {
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
                {headerName: "상품번호", field: "foodsNo", sort:"desc"},
                {headerName: "생산자No", field: "sellerNo", width: 90},
                {headerName: "생산자", field: "sellerFarmNm", width: 150}, //임시필드로 사용.
                {headerName: "상품명", field: "goodsNm", width: 300},
                {headerName: "판매가", field: "currentPrice", width: 100},
                {headerName: "소비자가", field: "consumerPrice", width: 100},
                {headerName: "할인율", field: "discountRate", width: 100},
                {headerName: "판매종료일", field: "saleEnd", width: 150},


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
        this.setState({loading: true});
        const { status, data } = await getAllFoodsSaleList();
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }

        console.log(data);

        // data.map(({orderSeq, consumerOkDate, payStatus, trackingNumber}, index) => {
        //     const order = {
        //         orderSeq: orderSeq,
        //         consumerOkDate: consumerOkDate,
        //         payStatus: payStatus,
        //         trackingNumber: trackingNumber
        //     }
        //
        //     let orderStatus;
        //     if(order.consumerOkDate) {
        //         orderStatus = '구매확정'
        //     } else if(order.payStatus === 'cancelled') {
        //         orderStatus = '취소완료'
        //     } else if(order.trackingNumber) {
        //         orderStatus = '배송중'
        //     } else {
        //         orderStatus = '발송예정'
        //     }
        //
        //     data[index].orderStatus = orderStatus
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
            '상품번호', '생산자No',
            '상품명', '가격'
        ]
        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.map((item ,index)=> {
            return [
                item.goodsNo, item.producerNo,
                item.goodsNm, item.currentPrice
            ]
        })


        let excelData = data.sort((a, b) => {
            return parseInt(b[2]) - parseInt(a[2]);
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
                                   button={<Button color={'success'} size={'sm'} block>
                                       <div className="d-flex">
                                           엑셀 다운로드
                                       </div>
                                   </Button>}/>
                    <div className="flex-grow-1 text-right">
                        총 {this.state.data.length} 건
                    </div>

                </div>
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
                        // components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
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