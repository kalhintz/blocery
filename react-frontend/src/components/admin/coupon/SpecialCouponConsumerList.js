import React, {Component} from "react";
import { getLoginAdminUser } from "~/lib/loginApi";
import {addSpecialCouponConsumer, getConsumerList, getConsumerByConsumerNo} from '~/lib/adminApi';
import ComUtil from "~/util/ComUtil";
import { ModalConfirm } from "~/components/common";
import {Button} from "reactstrap";
import {AgGridReact} from "ag-grid-react";

export default class ConsumerList extends Component{
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            columnDefs: [
                {headerName: "소비자번호", field: "consumerNo"},
                {headerName: "이름", field: "name", cellRenderer: "nameRenderer"},
                {headerName: "email", field: "email", width: 200},
                {headerName: "phone", field: "phone", width: 200},
                {headerName: "가입일", field: "timestampUtc", width: 200},
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
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">검색 버튼을 눌러 조회하십시오!</span>',
            frameworkComponents: {
                nameRenderer: this.nameRenderer,
            },
            modal: false,
            masterCouponNo: this.props.masterCouponNo,
            selectedConsumer: [],
            consumer: null
        }
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        this.gridApi = params.api
        this.gridColumnApi = params.columnApi
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }
    }

    search = async () => {
        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }
        const { status, data } = await getConsumerList();
        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }

        data.map((item) => {
            let timestampUtc = item.timestamp ? ComUtil.utcToString(item.timestamp,'YYYY-MM-DD HH:mm'):null;
            let stoppedDateUTC = item.stoppedDate ? ComUtil.intToDateString(item.stoppedDate):null;
            item.timestampUtc = timestampUtc;
            item.stoppedDateUTC = stoppedDateUTC;

            return item;
        })

        this.setState({
            data: data
        })

        //ag-grid api
        if(this.gridApi) {
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay()
        }
    }

    //// cellRenderer
    nameRenderer = ({value, data:rowData}) => {
        return <span className={rowData.stoppedUser && 'text-danger'}>{rowData.name}</span>
    }

    // 쿠폰 발급대상 선택 완료
    onClickSelection = async (isConfirmed) => {
        if(isConfirmed) {
            const masterNo = this.state.masterCouponNo;
            this.state.selectedConsumer.map(async (consumerNo) => {
                const {data: res} = await addSpecialCouponConsumer(masterNo,consumerNo);

                const {data: consumer} = await getConsumerByConsumerNo(consumerNo);

                if(res === -2) {
                    alert(`'${consumer.name}'님은 이미 지급한 소비자입니다. 다시 확인해주세요`);
                    return false;
                } else if(res > 0) { //==200 을 > 0 으로 변경 20200322
                    alert(`'${consumer.name}'님에게 지급이 완료되었습니다.`)
                }
            })
            this.props.onClose();
        }

        await this.search();    // refresh
    }

    onSelectionChanged = (event) => {
        const rowNodes = event.api.getSelectedNodes()
        const rows = rowNodes.map((rowNode => rowNode.data))
        const selectedConsumerNo = rows.map((consumer => consumer.consumerNo))

        this.setState({
            selectedConsumer: selectedConsumerNo
        })
    }

    render() {
        return (
            <div>
                <div className="d-flex p-1">
                    <div>
                        <Button className='mr-1' size={'sm'} onClick={this.search}>검색</Button>
                    </div>
                    <div className={'flex-grow-1 text-right'}>
                        <ModalConfirm title={'알림'} color={'primary'}
                                      content={`선택한 소비자(${this.state.selectedConsumer.length}명)에게 쿠폰을 지급하시겠습니까?`}
                                      onClick={this.onClickSelection}>
                            <Button className='mr-1' size={'sm'}>확인</Button>
                        </ModalConfirm>
                    </div>

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
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        frameworkComponents={this.state.frameworkComponents}
                        onRowClicked={this.onSelectionChanged.bind(this)}       // 클릭된 row
                    >
                    </AgGridReact>
                </div>

            </div>
        )
    }

}