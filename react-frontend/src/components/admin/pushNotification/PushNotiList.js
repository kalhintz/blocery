import React, { useState, useEffect } from 'react';
import { Button,  Modal, ModalHeader, ModalBody } from 'reactstrap'
import { ModalConfirm } from '~/components/common/index'
import { getPushNotiList, delPushNoti } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'
import moment from 'moment-timezone'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";
import { Cell } from '~/components/common'
import PushNotiReg from '../pushNotification/PushNotiReg'

import DatePicker from "react-datepicker";
import "react-datepicker/src/stylesheets/datepicker.scss";

const PushNotiList = (props) => {

    const [agGrid, setAgGrid] = useState({
        columnDefs: [
            {headerName: "번호", field: "pushNotiNo", sort:"desc", width: 110},
            {
                headerName: "예약여부", field: "reserved", width: 90,
                cellStyle:getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params) {
                    if(params.data.reserved === 0){
                        return '즉시';
                    }
                    else if(params.data.reserved === 1){
                        return '예약';
                    }
                    return '즉시';
                }
            },
            {
                headerName: "날짜", field: "regDate", width: 200,
                valueGetter: function(params) {
                    return (params.data.reserved > 0 ? params.data.reservedDateHHmm : params.data.regDate)
                }
            },
            {headerName: "사용자구분", field: "userType", cellStyle:getCellStyle({cellAlign: 'center'})},
            {headerName: "문구", field: "title", cellRenderer: "titleRenderer", width: 400},
            {headerName: "URL", field: "url", width: 200},
            {headerName: "삭제", cellRenderer: "delButtonRenderer", width: 100},
            {headerName: "푸시전송여부", field: "pushSent", width: 110, cellStyle:getCellStyle({cellAlign: 'center'})},
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
    const [search, setSearch] = useState({
        year:moment().format('YYYY')
    });
    const [pushNotiList, setPushNotiList] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [pushNotiData, setPushNotiData] = useState(null);

    useEffect(() => {
        async function fetch(){
            await checkLogin();
            await getData()
        }

        fetch()

    }, []);

    useEffect(() => {
        async function fetch(){
            await getData()
        }
        fetch()
    }, [search]);

    async function checkLogin() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }
    }

    async function getData() {
        const param = {
            year:search.year
        };
        const {data} = await getPushNotiList(param);

        data.map( (item,index) => {
            let regDate = data[index].regDate ? ComUtil.utcToString(data[index].regDate,'YYYY-MM-DD HH:mm'):null;
            let reservedDateHHmm = data[index].reservedDateHHmm ? ComUtil.utcToString(data[index].reservedDateHHmm,'YYYY-MM-DD HH:mm'):null;

            data[index].regDate = regDate;
            data[index].reservedDateHHmm = reservedDateHHmm;
            item.pushSent = (item.pushSent)? true:false;
        });
        setPushNotiList(data);
    }

    const selectPushNoti = (data) => {
        setPushNotiData(data);
        toggle();
    }

    const regPushNoti = () => {
        setPushNotiData({});
        toggle();
    }

    const regPushNotiFinished = () => {
        toggle();
        getData();
    }

    // Ag-Grid Cell 스타일 기본 적용 함수
    function getCellStyle ({cellAlign,color,textDecoration,whiteSpace, fontWeight}) {
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

    function titleRenderer({value, data:rowData}) {
        return (
            <Cell textAlign="left">
                <div onClick={selectPushNoti.bind(this, rowData)} style={{color: 'blue'}}>
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
                    <ModalConfirm title={'푸시알림 삭제'} content={<div>선택한 푸시알림을 삭제하시겠습니까?</div>} onClick={onDelPushNoti.bind(this, rowData.pushNotiNo)}>
                        <Button block size='sm' color={'info'}>삭제</Button>
                    </ModalConfirm>
                </div>
            </Cell>
        );
    }

    const onDelPushNoti = async(pushNotiNo, isConfirmed) => {
        if (isConfirmed) {
            await delPushNoti(pushNotiNo);
            await getData();
        }
    }

    function toggle(){
        setIsOpen(!isOpen)
    }

    const onSearchDateChange = (date) => {
        //console.log("",date.getFullYear())
        const search = Object.assign({}, search);
        search.year = date.getFullYear();
        setSearch(search);
    }

    const ExampleCustomDateInput = ({ value, onClick }) => (
        <Button
            color="secondary"
            active={true}
            onClick={onClick}>검색 {value} 년</Button>
    );

    return (
        <div>
            <div className="d-flex align-items-center p-1">
                <div className='pl-1'>
                    <DatePicker
                        selected={new Date(moment().set('year',search.year))}
                        onChange={onSearchDateChange}
                        showYearPicker
                        dateFormat="yyyy"
                        customInput={<ExampleCustomDateInput />}
                    />
                </div>
                <div className='ml-2'>
                    <Button color={'info'} onClick={getData}>검색</Button>
                </div>
                <div className="flex-grow-1 text-right">
                    <Button outline size='sm' color={'info'} onClick={regPushNoti} className='m-2'>푸시알림 등록</Button>
                </div>
            </div>
            <div className="p-1">
                <div
                    className="ag-theme-balham"
                    style={{
                        height: '700px'
                    }}
                >
                    <AgGridReact
                        enableSorting={true}
                        enableFilter={true}
                        columnDefs={agGrid.columnDefs}
                        defaultColDef={agGrid.defaultColDef}
                        rowSelection={'single'}  //멀티체크 가능 여부
                        enableColResize={true}
                        overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                        overlayNoRowsTempalte={agGrid.overlayNoRowsTemplate}
                        rowData={pushNotiList}
                        frameworkComponents={agGrid.frameworkComponents}
                    />
                </div>
            </div>
            {
                isOpen &&
                <Modal isOpen={isOpen} toggle={toggle} className={''} centered>
                    <ModalHeader toggle={toggle}>푸시알림</ModalHeader>
                    <ModalBody>
                        <PushNotiReg pushNotiData={pushNotiData} onClose={regPushNotiFinished}/>
                    </ModalBody>
                </Modal>
            }
        </div>
    )
}

export default PushNotiList