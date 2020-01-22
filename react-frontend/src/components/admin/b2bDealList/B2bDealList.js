import React, { Component, PropTypes } from 'react';
import "react-table/react-table.css"
import { getAllDealDetailList } from '../../../lib/adminApi'
import { getLoginAdminUser } from '../../../lib/loginApi'

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';


export default class B2bDealList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            isOpen: false,
            orderSeq: null,
            columnDefs: [
                {headerName: "주문일련번호", field: "dealSeq", sort:"desc"},
                {headerName: "주문상태", field: "dealStatus"},
                {headerName: "판매자번호", field: "sellerNo"},
                {headerName: "상품명", field: "goodsNm", width: 150},
                {headerName: "송장번호", field: "trackingNumber"},
                {headerName: "일시", field: "orderDate"},
                {headerName: "주문자", field: "consumerNm"},
                {headerName: "주문수량", field: "orderCnt"},
                {headerName: "이메일", field: "consumerEmail"},
                {headerName: "전화번호", field: "consumerPhone"},

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
        const { status, data } = await getAllDealDetailList();
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }

        data.map(({dealSeq, consumerOkDate, payStatus, trackingNumber}, index) => {
            const deal = {
                dealSeq: dealSeq,
                consumerOkDate: consumerOkDate,
                payStatus: payStatus,
                trackingNumber: trackingNumber
            }

            let dealStatus;
            if(deal.consumerOkDate) {
                dealStatus = '구매확정'
            } else if(deal.payStatus === 'cancelled'){
                dealStatus = '취소완료'
            } else if(deal.trackingNumber) {
                dealStatus = '배송중'
            } else {
                dealStatus = '발송예정'
            }

            data[index].dealStatus = dealStatus
        })

        this.setState({
            data: data,
            loading: false
        })

    }


    render() {

        if(this.state.data.length <= 0)
            return null

        return(
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