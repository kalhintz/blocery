import React, { Component, Fragment } from 'react'
import { Button } from 'reactstrap'

import 'react-toastify/dist/ReactToastify.css'
import { getFarmDiary, getProducer } from '~/lib/producerApi'
import ComUtil from '~/util/ComUtil'
import { FarmDiaryReg } from '~/components/producer'

import { ProducerFullModalPopupWithNav } from '../../../common'
import { AgGridReact } from 'ag-grid-react';
import { Server } from '../../../Properties'

//ag-grid
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";

export default class WebFarmDiaryList extends Component{
    constructor(props) {
        super(props)

        this.state = {
            isOpen: false,
            loading: true,
            farmDiary: null,
            data: [],
            columnDefs: [
                {headerName: "No", field: "diaryNo"},
                {headerName: "품목", field: "itemName", width: 150},
                {headerName: "품종", field: "itemKindName", width: 150},
                {headerName: "사진", field: "diaryImages", width: 150, cellRenderer: 'diaryImageRenderer'},
                {headerName: "제목", field: "cultivationStepMemo", width: 300},
                // {headerName: "내용", field: "diaryContent", width: 200},
                {headerName: "등록일시", field: "diaryRegDate", width: 200, cellClass: "ag-grid-cell-link", cellRenderer: "diaryRegDateRenderer", sort: 'desc'},
            ],
            defaultColDef: {
                width: 100,
                resizable: true
            },
            components: {
                diaryRegDateRenderer: this.diaryRegDateRenderer
            },
            frameworkComponents: {
                diaryImageRenderer: this.diaryImageRenderer
            },
            rowHeight: 30,
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',

        }
    }

    //이미지 렌더러
    diaryImageRenderer = ({value: images}) => {
        return images.map(image => {
            const src = Server.getThumbnailURL() + image.imageUrl
            const Style = {
                width: 30, height: 30, paddingRight: '1px'
            }
            return <img src={src} style={Style} alt={'사진'}/>
        })
    }

    //등록일시 렌더러
    diaryRegDateRenderer = ({value, data:rowData}) => {
        return ComUtil.utcToString(value, 'YYYY-MM-DD HH:mm')
    }

    onSelectionChanged = (event) => {

        const rowNodes = event.api.getSelectedNodes()
        const rows = rowNodes.map((rowNode => rowNode.data))
        const row = rows[0]

        const farmDiary = this.state.data.find(farmDiary => farmDiary.diaryNo === row.diaryNo)

        this.setState({
            isOpen: true,
            farmDiary: farmDiary
        })
    }

    componentDidMount = async() => {

        //로그인 체크
        let loginUser = await getProducer();
        if(!loginUser){
            this.props.history.push('/producer/webLogin')
        }
        this.search()
    }

    // 조회
    search = async () => {
        const { data } = await getFarmDiary()
        // console.log(data);
        this.setState({data})
    }

    onClose = (data) => {
        this.setState({
            isOpen: false
        })

        this.search()
    }

    onNewPostClick = () => {
        this.setState({
            isOpen: true,
            //goodsNo: goodsNo,
            diaryNo: null,
            farmDiary: null
        })
    }

    render(){
        return(
            <Fragment>
                <div className='mt-2'>
                    <div className='text-secondary small'> - 상품의 품목과 생산일지가 등록된 품목이 같을 경우, 해당 생산일지는 동일 품목에 등록된 모든 상품에 노출이 됩니다.</div>
                    <div className='text-secondary small'> - 생산일지는 내용이 변경되는 경우 일지를 수정하는 것보다는 새롭게 등록하는 것이 좋습니다. (수정은 오타, 사진 변경 등에만 해주세요)</div>
                </div>
                <br/>

                <div className='p-2 d-flex align-items-center'>
                    <div>총 {ComUtil.addCommas(this.state.data.length)} 개</div>
                    <div className='flex-grow-1 text-right'>
                        <Button color={'info'} size={'sm'} onClick={this.onNewPostClick} >생산일지 등록</Button>
                    </div>
                </div>

                <div
                    id="myGrid"
                    style={{
                        height: "calc(100vh - 180px)",
                    }}
                    className="ag-theme-balham"
                >
                    <AgGridReact
                        enableSorting={true}                //정렬 여부
                        enableFilter={true}                 //필터링 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}  //멀티체크 가능 여부
                        rowHeight={this.state.rowHeight}
                        enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        rowData={this.state.data}
                        components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        frameworkComponents={this.state.frameworkComponents}
                        onRowClicked={this.onSelectionChanged.bind(this)}
                    >
                    </AgGridReact>
                </div>

                <ProducerFullModalPopupWithNav show={this.state.isOpen} title={this.state.diaryNo ? '생산일지수정' : '생산일지작성'} onClose={this.onClose}>
                    <FarmDiaryReg
                        farmDiary={this.state.farmDiary} />
                </ProducerFullModalPopupWithNav>
            </Fragment>
        )
    }
}