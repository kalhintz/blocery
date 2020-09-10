import React, { Component, PropTypes } from 'react';
import { getAllConsumers, getSemiConsumerCount } from '~/lib/adminApi'
import { scOntGetBalanceOfBlct } from '~/lib/smartcontractApi'
import { Server } from '~/components/Properties';
import axios from 'axios';
import { getLoginAdminUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'

import BlctRenderer from '../SCRenderers/BlctRenderer';
import { ModalWithNav, ExcelDownload } from '~/components/common'
import StoppedConsumer from './StoppedConsumer'
import { Button } from 'reactstrap'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";

export default class ConsumerList extends Component{

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            excelData: {
                columns: [],
                data: []
            },
            columnDefs: [
                {headerName: "소비자번호", field: "consumerNo", sort:"asc"},
                {headerName: "이름", field: "name", cellRenderer: "nameRenderer"},
                {headerName: "email", field: "email", width: 200, cellRenderer: "emailRenderer"},
                {headerName: "phone", field: "phone", width: 200},
                {headerName: "account", field: "account", width: 300},
                {headerName: "BLCT", field: "blct", cellRenderer: "blctRenderer", width: 200},
                {headerName: "가입일", field: "timestampUtc", width: 200},
            ],
            defaultColDef: {
                width: 130,
                resizable: true
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            frameworkComponents: {
                blctRenderer: BlctRenderer,
                emailRenderer: this.emailRenderer,
                nameRenderer: this.nameRenderer
            },
            modal: false,
            selectedConsumer: {},
            showBlctBalance: false  //default로 false로 해서 속도 향상.20200819
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
        const { status, data } = await getAllConsumers()
        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }

        // manager를 data맨 위에 넣기
        let managerAccount = await this.getBaseAccount();
        let manager = {
            consumerNo: 0,
            name: '매니저',
            account: managerAccount
        }
        data.unshift(manager);

        data.map((item) => {

            if (this.state.showBlctBalance) {
                item.getBalanceOfBlct = scOntGetBalanceOfBlct;
            } else {
                item.getBalanceOfBlct = null;
            }

            let timestampUtc = item.timestamp ? ComUtil.utcToString(item.timestamp,'YYYY-MM-DD HH:mm'):null;
            item.timestampUtc = timestampUtc;
            return item;
        })

        let {data:giftReceiverAccount} = await getSemiConsumerCount();
        console.log('giftReceiverAccount', giftReceiverAccount)

        this.setState({
            data: data,
            semiConsumerCount: giftReceiverAccount, //준회원 수 추가 202008
            loading: false
        })

        this.setExcelData();

    }

    //// cellRenderer
    nameRenderer = ({value, data:rowData}) => {
        return (rowData.stoppedUser ? <span className='text-danger'>{rowData.name}</span> : <span>{rowData.name}</span>)
    }

    emailRenderer = ({value, data:rowData}) => {
        return (<span href="#" onClick={this.onEmailClick.bind(this, rowData)}><u>{rowData.email}</u></span>);
    }

    onEmailClick = (data) => {
        this.setState({
            modal: true,
            selectedConsumer: data
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

    toggle = async () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));

        await this.search();    // refresh
    }

    showBlctBalanceButtonClick = async () => {
        alert('잔고출력 On: 잠시 기다려 주세요')
        await this.setState({showBlctBalance:true});

        this.search();    // refresh
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
            '소비자번호', '이름', '이메일', '전화번호', 'account', '가입일'
        ]

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.map((item ,index)=> {
            return [
                item.consumerNo, item.name, item.email, item.phone, item.account, item.timestampUtc
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }


    render() {
        if(this.state.data.length <= 0)
            return null;

        return (
            <div>

                <div className="d-flex p-1">
                    <div  className="d-flex">
                        <ExcelDownload data={this.state.excelData}
                                       fileName="소비자전체목록확인"
                                       buttonName = "Excel 다운로드"
                        />
                        <div className="ml-3">
                            <Button color="secondary" onClick={this.showBlctBalanceButtonClick.bind(this)}> Blct잔고 출력 </Button>
                        </div>

                    </div>
                    <div className="flex-grow-1 text-right">총 {this.state.data.length}명  +  준회원(선물수령자) {this.state.semiConsumerCount}명</div>
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
                        frameworkComponents={this.state.frameworkComponents}

                    >
                    </AgGridReact>
                </div>

                <ModalWithNav show={this.state.modal} onClose={this.toggle} title={'회원상세'} noPadding={true}>
                    <div className='p-2' style={{width: '100%',minHeight: '150px'}}>
                        <StoppedConsumer data={this.state.selectedConsumer} onClose={this.toggle} />
                    </div>
                </ModalWithNav>
            </div>
        )
    }
}
