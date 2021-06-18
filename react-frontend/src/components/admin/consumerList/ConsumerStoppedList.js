import React, { Component } from 'react';
import { getStoppedConsumers } from '~/lib/adminApi'
import { scOntGetBalanceOfBlctAdmin } from '~/lib/smartcontractApi'
import { Server } from '~/components/Properties';
import axios from 'axios';
import { getLoginAdminUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'

import BlctRenderer from '../SCRenderers/BlctRenderer';
import { ExcelDownload } from '~/components/common'

import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";
import {Span} from "~/styledComponents/shared";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import AbuserRenderer from "~/components/common/agGridRenderers/AbuserRenderer";
import StoppedUserRenderer from "~/components/common/agGridRenderers/StoppedUserRenderer";

export default class ConsumerStoppedList extends Component{

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            modalValue: null,
            loading: false,
            data: [],
            excelData: {
                columns: [],
                data: []
            },
            columnDefs: [
                {headerName: "소비자번호", field: "consumerNo",width: 100},
                {headerName: "이름", field: "name", cellRenderer: "nameRenderer",width: 100},
                {headerName: "어뷰저", field: "abuser",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellRenderer: "abuserRenderer"},
                {headerName: "email", field: "email", width: 150},
                {headerName: "phone", field: "phone", width: 100},
                {headerName: "구분", field: "authType", width: 100, cellRenderer: "authTypeRenderer"},
                {headerName: "카카오ID", field: "authId", width: 100, cellRenderer: "authIdRenderer"},
                {headerName: "account", field: "account", width: 200 },
                {headerName: "BLY", field: "blct", cellRenderer: "blyRenderer", width: 150},
                {headerName: "탈퇴일", field: "stoppedDateUTC", width: 100},
                {headerName: "가입일", field: "timestampUtc", width: 150}
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
                blyRenderer: BlctRenderer,
                emailRenderer: this.emailRenderer,
                nameRenderer: this.nameRenderer,
                abuserRenderer: AbuserRenderer,
                authTypeRenderer: this.authTypeRenderer,
                authIdRenderer: this.authIdRenderer
            },
            showBlctBalance: false,  //default로 false로 해서 속도 향상.20200819
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
        console.log('consumerList: search start');

        this.setState({loading: true})
        const { status, data } = await getStoppedConsumers()
        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }

        // manager를 data맨 위에 넣기
        // let managerAccount = await this.getBaseAccount();
        // let manager = {
        //     consumerNo: 0,
        //     name: '매니저',
        //     account: managerAccount
        // }
        // data.unshift(manager);

        data.map((item) => {

            if (this.state.showBlctBalance) {
                item.getBalanceOfBlct = scOntGetBalanceOfBlctAdmin;
            } else {
                item.getBalanceOfBlct = null;
            }

            let timestampUtc = item.timestamp ? ComUtil.utcToString(item.timestamp,'YYYY-MM-DD HH:mm'):null;
            let stoppedDateUTC = item.stoppedDate ? ComUtil.intToDateString(item.stoppedDate):null;
            item.timestampUtc = timestampUtc;
            item.stoppedDateUTC = stoppedDateUTC;

            return item;
        })

        this.setState({
            data: data,
            loading: false
        })

        this.setExcelData();

    }

    onNameClick = (data) => {
        // console.log({data})
        this.setState({
            modalValue: data.consumerNo
        }, () => this.toggle())
    }

    //// cellRenderer
    nameRenderer = ({value, data:rowData}) => {
        return <Span fg={'primary'} onClick={this.onNameClick.bind(this, rowData)}><u>{rowData.name}</u></Span>
    }

    toggle = () => {

        const isOpen = !this.state.isOpen

        this.setState({
            isOpen: isOpen
        })

        if (!isOpen)
            this.search();
    }


    emailRenderer = ({value, data:rowData}) => {
        return (<span><u>{rowData.email}</u></span>);
    }

    authTypeRenderer = ({value, data:rowData}) => {
        return (rowData.authType == 1 ? <span>카카오</span> : <span>일반</span>)
    }

    authIdRenderer = ({value, data:rowData}) => {
        return (rowData.authType == 1? <span className='text-danger'>{rowData.authId}</span> : <span></span>)
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

    showBlctBalanceButtonClick = async () => {
        alert('잔고출력 On: 잠시 기다려 주세요')
        await this.setState({showBlctBalance:true});

        this.search();    // refresh
    }

    onSelectionChanged = (event) => {
        //const selected = Object.assign([], this.state.selectedConsumer)
        const rowNodes = event.api.getSelectedNodes()
        const rows = rowNodes.map((rowNode => rowNode.data))
        const selectedConsumerNo = rows.map((consumer => consumer.consumerNo))

        this.setState({
            selectedConsumer: selectedConsumerNo
        })
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
            '소비자번호', '이름', '이메일', '전화번호', 'account', '탈퇴일', '가입일'
        ]

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.map((item ,index)=> {
            return [
                item.consumerNo, item.name, item.email, item.phone, item.account, item.stoppedDate, item.timestampUtc
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    render() {
        if(this.state.data.length <= 0)
            return null;

        return (
            <div>

                <div className="d-flex p-1">
                    <div  className="d-flex">
                        <ExcelDownload data={this.state.excelData}
                                       fileName="탈퇴회원조회"
                                       buttonName = "Excel 다운로드"
                        />
                        <div className="ml-3">
                            <Button color="secondary" onClick={this.showBlctBalanceButtonClick.bind(this)}> Blct잔고 출력 </Button>
                        </div>
                    </div>
                    <div className="flex-grow-1 text-right">총 {this.state.data.length}명</div>
                </div>


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
                        onRowClicked={this.onSelectionChanged.bind(this)}       // 클릭된 row
                        onCellDoubleClicked={this.copy}
                    >
                    </AgGridReact>
                </div>
                <Modal size="lg" isOpen={this.state.isOpen}
                       toggle={this.toggle} >
                    <ModalHeader toggle={this.toggle}>
                        소비자 상세 정보
                    </ModalHeader>
                    <ModalBody>
                        <ConsumerDetail consumerNo={this.state.modalValue}
                                        onClose={this.toggle} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggle}>닫기</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}
