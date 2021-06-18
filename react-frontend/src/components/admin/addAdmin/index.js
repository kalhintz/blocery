import React, { useState, useEffect } from 'react';
import { Input } from 'reactstrap'
import { getLoginAdminUser } from "~/lib/loginApi";
import { addAdmin, getAdminList } from "~/lib/adminApi";
import BlctRenderer from '../SCRenderers/BlctRenderer';
import { scOntGetBalanceOfBlctAdmin } from '~/lib/smartcontractApi'
import { Server } from '~/components/Properties';
import axios from 'axios';
import ComUtil from '~/util/ComUtil'
import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-balham.css';

const AddAdmin = (props) => {
    const [email, setEamil] = useState('');
    const [valword, setValword] = useState('');
    const [confirmValword, setConfirmValword] = useState('');
    const [passPhrase, setPassPhrase] = useState('');
    const [confirmPassPhrase, setConfirmPassPhrase] = useState('');
    const [adminList, setAdminList] = useState([]);

    const [agGrid, setAgGrid] = useState({
        columnDefs: [
            {headerName: '이메일', field: 'email'},
            {headerName: 'account', field: 'account', width: 300},
            {headerName: "BLCT", field: "blct", cellRenderer: "blctRenderer", width: 200},
        ],
        defaultColDef: {
            width: 200,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: false,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        frameworkComponents: {
            blctRenderer: BlctRenderer
        },
    })

    useEffect(() => {

        async function fetch(){
            await checkLogin();
            await getAdminData();
        }
        fetch();

    }, []);

    async function checkLogin() {
        let user = await getLoginAdminUser();

        if (!user || user.email.indexOf('ezfarm') < 0) {
            window.location = '/admin/login'
        }
    }

    async function getAdminData() {

        let {data:adminList} = await getAdminList();

        let managerAccount = await getBaseAccount();
        adminList[0].account = managerAccount;


        adminList.map((item) => {
            item.getBalanceOfBlct = scOntGetBalanceOfBlctAdmin;
            return item;
        })

        setAdminList(adminList);
    }

    async function getBaseAccount(){
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

    const onChangeEmail = (e) => {
        setEamil(e.target.value);
    }

    const onChangeValword = (e) => {
        setValword(e.target.value);
    }

    const onChangeConfirmValword = (e) => {
        setConfirmValword(e.target.value);
    }

    const onChangePassPhrase = (e) => {
        setPassPhrase(e.target.value);
    }

    const onChangeConfirmPassPhrase = (e) => {
        setConfirmPassPhrase(e.target.value);
    }

    const checkValidation = () => {

        if(email === '') {
            alert('이메일을 입력해주세요');
            return false;
        }

        if(valword === '' || valword !== confirmValword) {
            alert('비밀번호를 확인해주세요');
            return false;
        }

        if(passPhrase === '' || passPhrase !== confirmPassPhrase) {
            alert('결제 비밀번호를 확인해주세요');
            return false;
        }

        return true;
    }

    const onRegAdmin = async() => {
        if(!checkValidation()) {
            return;
        }

        const adminData = {
            email: email,
            valword: valword,
            passPhrase: passPhrase
        }

        let {data:result} = await addAdmin(adminData);
        if(result === -1) {
            alert ('이미 가입된 관리자 이메일입니다.')
        } else if (result === 0) {
            alert ('로그인이 되어있지 않습니다')
        } else if (result === 1) {
            alert ('가입되었습니다.')
            getAdminData();
        }
    }

    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    return (
        <div className='m-2'>
            <h5> 관리자 계정 생성 </h5>
            <div className='d-flex'>
                <div className='mr-2'>
                    <Input type="text" placeholder="email"
                           value={email} onChange={onChangeEmail}/>
                </div>
                <div className='mr-2'>
                    <Input type="password" placeholder="비밀번호"
                           value={valword} onChange={onChangeValword}/>
                </div>
                <div className='mr-2'>
                    <Input type="password" placeholder="비밀번호 확인"
                           value={confirmValword} onChange={onChangeConfirmValword}/>
                </div>
                <div className='mr-2'>
                    <Input type="password" placeholder="결제 비밀번호"
                           value={passPhrase} onChange={onChangePassPhrase}/>
                </div>
                <div className='mr-2'>
                    <Input type="password" placeholder="결제 비밀번호 확인"
                           value={confirmPassPhrase} onChange={onChangeConfirmPassPhrase}/>
                </div>
                <button onClick = {onRegAdmin}> 계정생성 </button>
            </div>
            <br/>
            <br/>

            <div
                className="ag-theme-balham"
                style={{
                    height: '400px'
                }}
            >
                <AgGridReact
                    // enableSorting={true}
                    // enableFilter={true}
                    columnDefs={agGrid.columnDefs}
                    defaultColDef={agGrid.defaultColDef}
                    rowSelection={'single'}  //멀티체크 가능 여부
                    // enableColResize={true}
                    rowHeight={40}
                    rowData={adminList}
                    frameworkComponents={agGrid.frameworkComponents}
                    onCellDoubleClicked={copy}
                />
            </div>
        </div>
    )
}

export default AddAdmin