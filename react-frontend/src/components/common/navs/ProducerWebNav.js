import React, {Fragment, useState, useEffect} from 'react'
import {Collapse} from 'reactstrap'
import {FaAngleRight, FaAngleDown} from 'react-icons/fa'
import {ProducerWebMenuList, ProducerWebSubMenuList} from '~/components/Properties'
import Css from './ProducerWebNav.module.scss'
import classNames from 'classnames'

const ProducerWebNav = ({id, subId, history}) => {
    const [menuList, setMenuList] = useState(ProducerWebMenuList)

    // function getMainMenuList(){
    //     return ProducerWebMenuList.filter(menu => menu.type === type)
    // }
    // function getSubMenuList(id) {
    //     return ProducerWebSubMenuList.filter(subMenu => subMenu.type === type && subMenu.parentId === id)
    // }

    // const onMenuClick = (id) => {
    //     const ProducerWebSubMenuList = getSubMenuList(id)
    //
    //     setSubMenuList(ProducerWebSubMenuList)
    // }

    //type 이 바뀌면 다시 메뉴 렌더링
    useEffect(() => {
        // setMenuList(getMainMenuList())\
        const _menuList = Object.assign([], menuList)
        const menu = _menuList.find(menu => menu.id === id)
        menu.isOpen = true
        setMenuList(_menuList)
    }, [])

    // 메뉴 클릭시 서브메뉴 다시 렌더링
    function onMenuClick(id) {
        const _menuList = Object.assign([], menuList)
        const menu = menuList.find(menu => menu.id === id)
        if (menu.isOpen) {
            menu.isOpen = false
        } else {
            menu.isOpen = true
        }

        setMenuList(_menuList)

        // const idx = setArrId.indexOf(id)
        //
        // //추가된 것이 없으면..
        // if(idx === -1){
        //     setArrId.push(id)
        // }
        // //있으면..
        // else{
        //     const _arrId = Object.assign([], arrId)
        //     _arrId.splice(idx, 1)
        //     setArrId(_arrId)
        // }
    }

    function onSubMenuClick(path){
        history.push(path)
    }

    return (
            <div className={Css.wrap}>
                {
                    menuList.map((menu, index) => {
                        return (
                            <Fragment key={"menu_"+index}
                                // style={{backgroundColor: menu.id === id && '#5f8688'}}
                            >
                                <a>
                                    <div className={classNames(Css.main, (menu.id === id || menu.isOpen === true) && Css.mainActive)}
                                         onClick={onMenuClick.bind(this, menu.id)}
                                        // style={{backgroundColor: menu.id === id && '#4f7577'}}

                                    >
                                        {/*<div className={Css.mainLeftBox}>*/}
                                        {/*<span style={{marginLeft: -10, textAlign: 'center', width: 40}}>*/}
                                        {/*<FontAwesomeIcon size={'sm'} icon={menu.icon} className={Css.mainIcon}/>*/}
                                        {/*</span>*/}
                                        {/*{menu.name}*/}
                                        {/*</div>*/}
                                        {/*<FontAwesomeIcon size={'1x'} icon={menu.isOpen ? faAngleDown : faAngleRight} className={'text-light ml-auto'}/>*/}


                                        <div className={Css.mainLeftBox}>
                                        <span style={{marginLeft: -10, textAlign: 'center', width: 40}}>
                                            <menu.icon />
                                            {/*<FontAwesomeIcon size={'sm'} icon={menu.icon} />*/}
                                        </span>
                                            {menu.name}
                                        </div>
                                        {
                                            menu.isOpen ? <FaAngleDown className={'text-light ml-auto'} /> : <FaAngleRight className={'text-light ml-auto'}/>
                                        }
                                    </div>
                                </a>
                                <Collapse isOpen={menu.isOpen}>
                                    {
                                        ProducerWebSubMenuList.filter(subMenu => subMenu.parentId === menu.id).map(subMenu => {
                                            return (
                                                <div key={`subMenu_${subMenu.id}${subMenu.id}`} className={classNames(Css.sub, subMenu.id === subId && Css.subActive)}
                                                    // style={{backgroundColor: subMenu.id === subId && '#3e6365'}}
                                                     onClick={onSubMenuClick.bind(this, `/producer/web/${menu.id}/${subMenu.id}`)}
                                                >
                                                    {subMenu.name}
                                                    {/*<Link className={classNames(Css.subText, subMenu.id === subId && Css.subTextActive) } to={`/producer/web/${menu.id}/${subMenu.id}`}>{subMenu.name}</Link>*/}

                                                </div>
                                            )
                                        })
                                    }
                                </Collapse>
                            </Fragment>
                        )
                    })
                }

            </div>

    )

}

export default ProducerWebNav