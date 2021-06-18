import React, {Component} from "react";
import { getLoginAdminUser } from "~/lib/loginApi";
import {Div} from '~/styledComponents/shared'
import {getAllBlctToWonCachedLog} from "~/lib/adminApi";
import {AgGridReact} from "ag-grid-react";
import ComUtil from '~/util/ComUtil'

export default class BlySiseList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            columnDefs: [
                {headerName: "날짜", field: "day", cellRenderer: "dateRenderer"},
                {headerName: "시세", field: "blctToWon"},
                {headerName: "지급쿠폰BLY", field: "email", width: 200, cellRenderer: "couponBlyRenderer"},
                // {headerName: "지급쿠폰원화", field: "phone", width: 200, cellRenderer: "fixedWonRenderer"},
            ],
            defaultColDef: {
                width: 130,
                resizable: true,
                filter: true,
                sortable: true,
                floatingFilter: false,
                filterParams: {
                    newRowsAction: 'keep'
                }
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            frameworkComponents: {
                dateRenderer:this.dateRenderer,
                couponBlyRenderer:this.couponBlyRenderer,
                fixedWonRenderer:this.fixedWonRenderer
            },
            fixedWon: props.fixedWon
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

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        this.gridApi = params.api
        this.gridColumnApi = params.columnApi

        //리스트 조회
        this.search()
    }

    search = async () => {
        this.setState({loading: true})
        const {status, data} = await getAllBlctToWonCachedLog();
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }

        this.setState({
            data: data,
            loding: false
        })
    }

    // cell Renderer...
    dateRenderer = ({value, data:rowData}) => {
        return(
            <span>{ComUtil.intToDateString(rowData.day)}</span>
        )

    }
    couponBlyRenderer = ({value, data:rowData}) => {
        return(
            <span>{(this.state.fixedWon/rowData.blctToWon).toFixed(2)}</span>
        )
    }
    fixedWonRenderer = ({}) => {
        return(
            <span>{this.state.fixedWon}</span>
        )
    }

    render() {
        if (this.state.data.length <= 0)
            return null;

        return (
            <Div>
                <Div>지급쿠폰 원화 : {ComUtil.addCommas(this.state.fixedWon)}원</Div>
                <div
                    className="ag-theme-balham"
                    style={{
                        height: '700px'
                    }}
                >
                    <AgGridReact
                        // enableSorting={true}                //정렬 여부
                        // enableFilter={true}                 //필터링 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        rowSelection={'multiple'}
                        defaultColDef={this.state.defaultColDef}
                        // components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        // enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        // onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        frameworkComponents={this.state.frameworkComponents}
                        // onRowClicked={this.onSelectionChanged.bind(this)}       // 클릭된 row
                    >
                    </AgGridReact>
                </div>
            </Div>
        )
    }
}