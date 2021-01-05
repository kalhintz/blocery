import React, { Component } from 'react';
import { Button, Input } from 'reactstrap'
import { getAllProducers, changeProducerPayoutBlct, getProducerFeeRate, reserveFeeRateToProducer } from '~/lib/adminApi'
import { scOntGetBalanceOfBlct } from '~/lib/smartcontractApi'
import { Server } from '~/components/Properties';
import axios from 'axios';
import { getLoginAdminUser } from '~/lib/loginApi'
import { Cell } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import BlctRenderer from '../SCRenderers/BlctRenderer';
import { SingleDatePicker } from 'react-dates';
import moment from 'moment'
import {Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";

export default class ProducerList extends Component{

    constructor(props) {
        super(props);
        this.rowHeight=50;
        this.state = {
            loading: false,
            data: [],
            columnDefs: [
                {headerName: "회원번호", field: "producerNo", sort:"asc", cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "회원명", field: "name", cellStyle:this.getCellStyle({cellAlign: 'left'})},
                {headerName: "농장명", field: "farmName", cellStyle:this.getCellStyle({cellAlign: 'left'})},
                {headerName: "email", field: "email", width: 200, cellStyle:this.getCellStyle({cellAlign: 'left'})},
                {headerName: "account", field: "account", width: 250, cellStyle:this.getCellStyle({cellAlign: 'left'})},
                {headerName: "BLCT", field: "blct", cellRenderer: "blctRenderer", width: 150, cellStyle:this.getCellStyle({cellAlign: 'left'})},
                {headerName: "가입일", field: "timestamp", width: 100, cellStyle:this.getCellStyle({cellAlign: 'left'})},
                {headerName: "커미션(%)", field: "producerFeeRate", width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "커미션 변경", field: "producerFeeRate", width: 100, cellRenderer: "feeRateRenderer", cellStyle:this.getCellStyle({cellAlign: 'left'})},
                {headerName: "blct정산여부", field: "payoutBlct", cellRenderer: "payoutRenderer", width: 200, cellStyle:this.getCellStyle({cellAlign: 'left'})},

                {headerName: "예약된 커미션(%)", field: "applyProducerFeeRate", width: 200, valueGetter: (params) => {

                    if(this.state.producerFeeRateList.length > 0 && params.data.applyDate){
                        const item = this.state.producerFeeRateList.find(item => item.applyProducerRateId === params.data.applyProducerRateId)
                        return `${item.explain} ${params.data.applyProducerFeeRate}%`
                    }
                    return null


                }},
                {headerName: "예약일", field: "applyDate", width: 200, cellRenderer: "applyDateRenderer"},
            ],
            defaultColDef: {
                width: 100,
                resizable: true
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            components: {
                applyDateRenderer: this.applyDateRenderer
            },
            frameworkComponents: {
                blctRenderer: BlctRenderer,
                payoutRenderer: this.payoutRenderer,
                feeRateRenderer: this.feeRateRenderer
            },
            getRowNodeId: function(data) {
                return data.id;
            },

            focused: false,
            producerNo: null,


            isOpen: false,
            selectedItem: null,


            producerFeeRateList: []
        }
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        this.getProducerFeeRateList();
        await this.search();
    }

    //[이벤트] 그리드 로드 후 callback 이벤트


    getProducerFeeRateList = async() => {
        const { data } = await getProducerFeeRate();
        console.log({feeRate: data});
        this.setState({
            producerFeeRateList: data
        })
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
            item.timestamp = ComUtil.utcToString(item.timestamp);
            return item;
        })

        console.log({data})
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

    payoutRenderer = ({value, data:rowData}) => {
        let v_payoutBlct = rowData.payoutBlct ? 'BLCT정산':'현금정산';
        let v_buttonText = rowData.payoutBlct ? '현금정산으로 변경':'BLCT정산으로 변경';
        return (
            <Cell>
                { rowData.producerNo === 0 ? null :
                    <div style={{textAlign: 'center'}}>
                        <span className='mr-3'>{v_payoutBlct}</span>
                        <Button size={'sm'} color={'info'}
                                onClick={this.changePayoutBlct.bind(this, rowData.producerNo, rowData.payoutBlct)}>{v_buttonText}</Button>
                    </div>
                }
            </Cell>
        );
    }

    changePayoutBlct = async(producerNo, payoutBlct) => {
        console.log(producerNo, payoutBlct);
        let result = await changeProducerPayoutBlct(producerNo, !payoutBlct);
        if(result) {
            this.search();
        }
    }

    changeProducerRateFee = async(e) => {

        const index = e.target.value
        const applyProducerRateId = this.state.producerFeeRateList[index].producerRateId;
        const applyProducerFeeRate = this.state.producerFeeRateList[index].rate;


        const selectedItem = Object.assign({}, this.state.selectedItem)
        selectedItem.applyProducerRateId = applyProducerRateId
        selectedItem.applyProducerFeeRate = applyProducerFeeRate

        this.setState({selectedItem})
    }

    onDateChange = (date) => {

        const selectedItem = Object.assign({}, this.state.selectedItem)

        selectedItem.applyDate = date

        this.setState({
            selectedItem
        })

        // const data = Object.assign([], this.state.data)
        // const item = data.find(item => item.producerNo === this.state.producerNo)
        // item.applyDate = date
        // console.log({producerNo: this.state.producerNo, date, data, item, gridApi: this.gridApi});
        // this.setState({data})

        // var rowNode = this.gridApi.getRowNode('modDate');
        // // var newPrice = Math.floor(Math.random() * 100000);
        // rowNode.setDataValue('price', date);
        // rowNode.setData(item)
        // var res = this.gridApi.updateRowData({ update: data });

        //this.setState({goods})
    }

    feeRateChangeReserve = async (producerNo) => {

        const item = this.state.selectedItem

        console.log(item.producerNo, item.applyProducerRateId, item.applyProducerFeeRate, item.applyDate, item.applyDate.format('YYYY-MM-DD'))

        const date = item.applyDate.format('YYYY-MM-DD')

        const reserveResult = await reserveFeeRateToProducer(item.producerNo, item.applyProducerRateId, item.applyProducerFeeRate, date);

        // let date = '2020-03-12';  //선택된 날짜로 변경필요.


        if(reserveResult) {
            alert(date + '날짜에 변경예약이 완료되었습니다.');

            this.search()
            this.modalToggle()


        } else {
            alert('변경에 실패했습니다. 다시 시도해주세요.')
        }


    }

    applyDateRenderer = ({value, data: rowData}) => {
        console.log(value)
        if(value){
            return moment(value).format('YYYY-MM-DD')
        }
        return value
    }


    feeRateRenderer = ({value, data:rowData}) => {
        if(rowData.producerNo === 0)
            return null

        return(
            <Button size={'sm'} color={'info'}
                    disabled={rowData.applyDate}
                    onClick={this.openModal.bind(this, rowData)}> 변경예약
            </Button>
        )

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

    modalToggle = () => {
        const isOpen = !this.state.isOpen
        if(isOpen){
            this.setState({
                isOpen: isOpen
            })
        }else{
            this.setState({
                isOpen: isOpen,
                selectedItem: null
            })
        }

    }

    openModal = (item) => {
        this.setState({
            selectedItem: item
        }, ()=> this.modalToggle())
    }

    render() {

        if(this.state.data.length <= 0)
            return null;

        const {selectedItem} = this.state

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




                {
                    selectedItem && (
                        <Modal isOpen={this.state.isOpen} centered>
                            <ModalHeader toggle={this.modalToggle}>커미션 변경</ModalHeader>
                            <ModalBody className={'p-0'}>
                                <div className={'m-3'}>
                                    <div className={'d-flex'} >
                                        <img className={'rounded-circle mr-3'} style={{width: 50, height: 50}} src={selectedItem.profileImages[0] ? Server.getThumbnailURL() + selectedItem.profileImages[0].imageUrl : null} alt=""/>
                                        <div>
                                            <div>
                                                {selectedItem.name}
                                            </div>
                                            <div>
                                                {selectedItem.farmName}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                <div className={'m-3'}>


                                    <div>
                                        {selectedItem.email}
                                    </div>
                                    <div>
                                        {selectedItem.account}
                                    </div>
                                    <div>
                                        {selectedItem.blct}
                                    </div>
                                    <div>
                                        {selectedItem.payoutBlct}
                                    </div>
                                    <div>
                                        {
                                            selectedItem.shopAddress
                                        }
                                    </div>
                                </div>
                                <div className={'m-3'}>
                                    <Input type='select' name='select' id='producerRateFee' className='mr-2' onChange={this.changeProducerRateFee}>
                                        {
                                            this.state.producerFeeRateList.map((feeRate, index) => {
                                                return (
                                                    <option key={'radio' + index} selected={feeRate.producerRateId === selectedItem.applyProducerRateId} name='radio' value={index}>{feeRate.explain} {feeRate.rate}%</option>
                                                )
                                            })
                                        }
                                    </Input>
                                </div>
                                <div className={'m-3'}>



                                    <SingleDatePicker
                                        placeholder="적용시작일"
                                        date={selectedItem.applyDate ? moment(selectedItem.applyDate) : null}
                                        onDateChange={this.onDateChange}
                                        focused={this.state[`focused`]} // PropTypes.bool
                                        onFocusChange={({ focused }) => this.setState({ [`focused`]:focused })} // PropTypes.func.isRequired
                                        id={"feeRateChangeDate"} // PropTypes.string.isRequired,
                                        numberOfMonths={1}
                                        withPortal={false}
                                        small
                                        readOnly
                                        // calendarInfoPosition="top"
                                        // enableOutsideDays
                                        //verticalHeight={700}
                                    />

                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={this.feeRateChangeReserve}>확인</Button>
                                <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                            </ModalFooter>
                        </Modal>

                    )
                }

            </div>
        )
    }
}
