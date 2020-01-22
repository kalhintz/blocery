import React, { Component, PropTypes } from 'react';
import { getAllProducers } from '../../../lib/adminApi'
import { scOntGetBalanceOfBlct } from '../../../lib/smartcontractApi'
import { Server } from '../../../components/Properties';
import axios from 'axios';
import { getLoginAdminUser } from '../../../lib/loginApi'

import BlctRenderer from '../SCRenderers/BlctRenderer';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

export default class ProducerList extends Component{

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            columnDefs: [
                {headerName: "회원번호", field: "producerNo", sort:"asc"},
                {headerName: "회원명", field: "name"},
                {headerName: "email", field: "email", width: 200},
                {headerName: "account", field: "account", width: 200},
                {headerName: "BLCT", field: "blct", cellRenderer: "blctRenderer", width: 200},
                {headerName: "가입일", field: "timestamp", width: 200},
            ],
            defaultColDef: {
                width: 100,
                resizable: true
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            frameworkComponents: {
                blctRenderer: BlctRenderer
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

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api
        this.gridColumnApi = params.columnApi

        console.log("onGridReady");
        //리스트 조회
        this.search()
    }


    search = async () => {
        this.setState({loading: true})
        const { status, data } = await getAllProducers()
        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }

        // manager를 data맨 위에 넣기
        let managerAccount = await this.getBaseAccount();
        let manager = {
            producerNo: 0,
            name: '매니저',
            account: managerAccount
        }
        data.unshift(manager);

        data.map((item) => {
            item.getBalanceOfBlct = scOntGetBalanceOfBlct;
            return item;
        })

        this.setState({
            data: data,
            loading: false
        })

    }


    getBaseAccount = async () => {
        //ropsten에서는 getAccounts 동작하지 않을 수도 있기 때문에 안전하게 backend 이용.
        return axios(Server.getRestAPIHost() + '/baseAccount',
            {   method:"get",
                withCredentials: true,
                credentials: 'same-origin'
            }
        ).then((response) => {
            return response.data;
        });
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
                        // components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        // onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        frameworkComponents={this.state.frameworkComponents}

                    >
                    </AgGridReact>
                </div>
            </div>
        )
    }
}
