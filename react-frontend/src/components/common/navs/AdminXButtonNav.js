import React from 'react'
import Style from './AdminXButtonNav.module.scss'
const AdminXButtonNav = (props) => {
    return(
        <div className={Style.wrap}>
            <div className={Style.close} onClick={props.onClose}>×</div>
            <div className={Style.name}>{props.name}</div>
        </div>
    )
};
export default AdminXButtonNav