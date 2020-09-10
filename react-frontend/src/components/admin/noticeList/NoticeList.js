import React, { useState, useEffect } from 'react';
import { Button,  Modal, ModalHeader, ModalBody } from 'reactstrap'

import { ModalConfirm } from '~/components/common/index'
import { getNoticeList, delNoticeApi } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'

import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";
import { Cell } from '~/components/common'
import NoticeReg from '../noticeReg/NoticeReg'

const NoticeList = (props) => {

    const [agGrid, setAgGrid] = useState({
        columnDefs: [
            {headerName: "번호", field: "noticeNo", sort:"desc", width: 60},
            {headerName: "예약여부", field: "reserved", width: 90,
                valueGetter: function(params) {
                    return (params.data.reserved === 1 ? '예약' : '')
                }},
            {headerName: "날짜", field: "regDate", width: 200,
                valueGetter: function(params) {
                    return (params.data.reserved > 0 ? params.data.reservedDateHHmm : params.data.regDate)
                }},
            {headerName: "사용자구분", field: "userType"},
            {headerName: "제목", field: "title", cellRenderer: "titleRenderer", width: 300},
            {headerName: "내용", field: "content", width: 700},
            {headername: "삭제", cellRenderer: "delButtonRenderer", width: 100},
            {headername: "푸시여부", field: "sendPush", width: 100},
        ],
        defaultColDef: {
            width: 100,
            resizable: true
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        frameworkComponents: {
            titleRenderer: titleRenderer,
            delButtonRenderer: delButtonRenderer
        },
    })

    const [noticeList, setNoticeList] = useState([]);
    const [isOpen, setIsOpen] = useState(false)
    const [noticeData, setNoticeData] = useState(null)

    useEffect(() => {
        async function fetch(){
            await checkLogin();
            await getData()
        }

        fetch()

    }, []);

    async function checkLogin() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }
    }

    async function getData() {
        const {data} = await getNoticeList('all');

        data.map( (item,index) => {

            let regDate = data[index].regDate ? ComUtil.utcToString(data[index].regDate,'YYYY-MM-DD HH:mm'):null;
            let reservedDateHHmm = data[index].reservedDateHHmm ? ComUtil.utcToString(data[index].reservedDateHHmm,'YYYY-MM-DD HH:mm'):null;

            data[index].regDate = regDate;
            data[index].reservedDateHHmm = reservedDateHHmm;
            item.sendPush = (item.sendPush)? true:'';
        });
        setNoticeList(data);
    }

    const selectNotice = (noticeData) => {
        setNoticeData(noticeData)
        toggle()
    }

    const regNotice = () => {
        setNoticeData({});
        toggle()
    }

    const regNoticeFinished = () => {
        toggle()
        getData();
    }

    function titleRenderer({value, data:rowData}) {
        return (
            <Cell textAlign="left">
                <div onClick={selectNotice.bind(this, rowData)} style={{color: 'blue'}}>
                    <u>{rowData.title}</u>
                </div>
            </Cell>
        );
    }

    function delButtonRenderer({value, data:rowData}) {
        // console.log(rowData);
        return (
            <Cell>
                <div style={{textAlign: 'center'}}>
                    <ModalConfirm title={'공지사항 삭제'} content={<div>선택한 공지사항을 삭제하시겠습니까?</div>} onClick={delNotice.bind(this, rowData.noticeNo)}>
                        <Button block size='sm' color={'info'}>삭제</Button>
                    </ModalConfirm>
                </div>
            </Cell>
        );
    }

    const delNotice = async(noticeNo, isConfirmed) => {
        if (isConfirmed) {
            console.log(noticeNo)
            await delNoticeApi(noticeNo);
            await getData();
        }
    }

    function toggle(){
        setIsOpen(!isOpen)
    }

    return (
        <div
            className="ag-theme-balham"
            style={{
                height: '700px'
            }}
        >
            <Button outline size='sm' color={'info'} onClick={regNotice} className='m-2'>공지사항 등록</Button>

            <AgGridReact
                enableSorting={true}
                enableFilter={true}
                columnDefs={agGrid.columnDefs}
                defaultColDef={agGrid.defaultColDef}
                rowSelection={'single'}  //멀티체크 가능 여부
                enableColResize={true}
                overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                overlayNoRowsTempalte={agGrid.overlayNoRowsTemplate}
                rowData={noticeList}
                // onRowClicked={selectNotice}
                frameworkComponents={agGrid.frameworkComponents}
            />

            <Modal isOpen={isOpen} toggle={toggle} className={''} centered>
                <ModalHeader toggle={toggle}>공지사항</ModalHeader>
                <ModalBody>
                    <NoticeReg noticeData={noticeData} onClose={regNoticeFinished}/>
                </ModalBody>
            </Modal>

        </div>
    )
}

export default NoticeList