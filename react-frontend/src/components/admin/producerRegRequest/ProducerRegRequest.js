import React, { Component, PropTypes } from 'react';
import { getProducerRegRequests } from '~/lib/adminApi'
import { Server } from '~/components/Properties';
import { getLoginAdminUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";

export default class ProducerRegRequest extends Component{

    constructor(props) {
        super(props);
        this.rowHeight=50;
        this.state = {
            loading: false,
            data: [],
            columnDefs: [
                {headerName: "신청번호", field: "regNo", sort:"asc", cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "상품정보", field: "goodsInfo", cellStyle:this.getCellStyle({cellAlign: 'left'})},
                {headerName: "카테고리", field: "category", cellStyle:this.getCellStyle({cellAlign: 'left'})},
                {headerName: "업체명", field: "farmName", width: 200, cellStyle:this.getCellStyle({cellAlign: 'left'})},
                {headerName: "주소", field: "address", width: 250, cellStyle:this.getCellStyle({cellAlign: 'left'})},
                {headerName: "사업자등록번호", field: "coRegistrationNo", width: 150, cellStyle:this.getCellStyle({cellAlign: 'left'})},
                {headerName: "신청일", field: "timestamp", width: 100, cellStyle:this.getCellStyle({cellAlign: 'left'})},
                {headerName: "담당자명", field: "charger", width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "담당자 연락처", field: "chargerPhone", width: 100, cellStyle:this.getCellStyle({cellAlign: 'left'})},
                {headerName: "담당자 이메일", field: "chargerEmail", width: 200, cellStyle:this.getCellStyle({cellAlign: 'left'})},
            ],
            defaultColDef: {
                width: 100,
                resizable: true
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            components: {
            },
            frameworkComponents: {
            },
            getRowNodeId: function(data) {
                return data.id;
            },
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
        this.setState({loading: true})
        const { status, data } = await getProducerRegRequests();
        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }

        data.map((item) => {
            item.timestamp = ComUtil.utcToString(item.timestamp);
            return item;
        })

        console.log({data})
        this.setState({
            data: data,
            loading: false
        })

    }

    // Ag-Grid Cell 스타일 기본 적용 함수
    getCellStyle ({cellAlign,color,textDecoration,whiteSpace, fontWeight}){
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
            whiteSpace: whiteSpace,
            fontWeight: fontWeight
        }
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        console.log("onGridReady");
        //리스트 조회
        // await this.search()
    }

    render() {

        if(this.state.data.length <= 0)
            return null;

        return (
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
                        rowHeight={this.rowHeight}
                        enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        rowData={this.state.data}
                        components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        frameworkComponents={this.state.frameworkComponents}
                        // getRowNodeId={this.state.getRowNodeId}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)

                    >
                    </AgGridReact>

                </div>

            </div>
        )
    }
}
