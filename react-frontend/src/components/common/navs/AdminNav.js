import React, { Fragment, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { AdminMenuList, AdminSubMenuList } from '../../Properties'

import classNames from 'classnames'

const AdminNav = ({type, id, subId}) => {


    const [menuList, setMenuList] = useState(getMainMenuList())
    const [subMenuList, setSubMenuList] = useState(getSubMenuList(id))

    function getMainMenuList(){
        return AdminMenuList.filter(menu => menu.type === type)
    }
    function getSubMenuList(id) {
        return AdminSubMenuList.filter(subMenu => subMenu.type === type && subMenu.parentId === id)
    }

    const onMenuClick = (id) => {
        const adminSubMenuList = getSubMenuList(id)

        setSubMenuList(adminSubMenuList)
    }

    //type 이 바뀌면 다시 메뉴 렌더링
    useEffect(()=>{
        setMenuList(getMainMenuList())
        setSubMenuList(getSubMenuList(id))

    }, [type])

    return (
        <Fragment>
            { /* 메인 */ }

            <ul className='d-flex p-0 m-0'>
                {
                    menuList.map((menu, index) => {
                        return(

                            <a href={'#'} key={'adminNav'+index} className={classNames('d-flex justify-content-center align-items-center p-2 text-dark', menu.id === id && 'font-weight-bold')} onClick={onMenuClick.bind(this, menu.id)}>
                                {menu.name}
                            </a>

                            // <div key={`${menu.route}${menu.id}`} className={classNames('d-flex justify-content-center align-items-center p-2 text-info', menu.id === id && 'font-weight-bold')} onClick={onMenuClick.bind(this, menu.id)}>
                            //     {menu.name}
                            // </div>
                        )
                    })


                }
            </ul>

            { /* 서브 */ }
            <div className='d-flex p-0 m-0'>
                {
                    subMenuList.map((menu,index) => {
                        const url = `/admin/${menu.type}/${menu.parentId}/${menu.id}`
                        return (
                                <Link key={'adminNavLink'+index} style={{fontSize:'12px'}} className={classNames('d-flex justify-content-center align-items-center p-2 m-1', menu.id === subId ? 'bg-dark text-white' : 'text-dark')} to={url}>{menu.name}</Link>
                        )
                    })
                }
            </div>
        </Fragment>
    )
}

export default AdminNav
