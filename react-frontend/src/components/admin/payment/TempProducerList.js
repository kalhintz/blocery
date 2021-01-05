import React, { Component } from 'react';
import ComUtil from '~/util/ComUtil'
import { getAllTempProducer } from '~/lib/adminApi'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";

export default class TempProducerList extends Component {

    constructor(props) {
        super(props);
        this.rowHeight = 50;
        this.state = {
            loading: false,
            data: [],
            columnDefs: [
                {headerName: "id", field: "producerDotOrder"},
                {headerName: "생산자번호", field: "producerNo"},
                {headerName: "주문번호", field: "orderSeq"},
                {headerName: "결제방법", field: "payMethod"},
                {headerName: "blctToken", field: "blctToken"},
                {headerName: "구매시점환율", field: "orderBlctExchangeRate"},
                {headerName: "등록일", field: "regDate", width: 200, cellRenderer: "dateRenderer"},
                {headerName: "토큰전송", field: "sentComplete"},
            ],
            defaultColDef: {
                width: 150,
                resizable: true
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            frameworkComponents: {
                dateRenderer: this.dateRenderer
            },
        }
    }

    async componentDidMount() {

        await this.search();
    }

    search = async() => {

        let {data} = await getAllTempProducer();

        console.log(data);

        data.sort((a,b) => {
            return b.regDate - a.regDate;
        });

        this.setState({
            data:data
        })
    }

    dateRenderer = ({value, data: rowData}) => {
        return value ? ComUtil.utcToString(value, 'YYYY-MM-DD HH:mm') : null;
    }

    render() {

        if (this.state.data.length <= 0)
            return null;

        return (
            <div>
                <div
                    className="ag-theme-balham"
                    style={{
                        height: '1000px'
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
                        rowData={this.state.data}
                        frameworkComponents={this.state.frameworkComponents}
                        // onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)

                    >
                    </AgGridReact>
                </div>
            </div>
        )
    }
}