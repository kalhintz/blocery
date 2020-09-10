// import React, {useState, useEffect} from 'react'
// import { Container, Row, Col } from 'reactstrap'
// import { ProducerMenuList, ProducerWebSubMenuList } from '../../Properties'
// import classNames from 'classnames'
//
// const LeftMenu = (props) => {
//
//     const [menuList, setMenuList] = useState(getMainMenuList())
//     //const [subMenuList, setSubMenuList] = useState(getSubMenuList(id))
//
//     function getMainMenuList(){
//         return ProducerMenuList.filter(menu => menu.menuNav === true)
//     }
//
//     // function getSubMenuList(id) {
//     //     return ProducerMenuList.filter(subMenu => subMenu.type === type && subMenu.parentId === id)
//     // }
//
//     const onMenuClick = (id) => {
//
//         console.log('onMenuClick:' + id);
//
//
//         // const producerSubMenuList = getSubMenuList(id)
//         // setSubMenuList(producerSubMenuList)
//     }
//
//     useEffect(()=>{
//         setMenuList(getMainMenuList())
//         // setSubMenuList(getSubMenuList(id))
//
//     }, [])
//
//     return(
//         <div style={{
//             //backgroundImage: `url(${Background})`,
//             height: '100vh',
//             width: '30vh',
//             backgroundPosition: 'center',
//             backgroundRepeat: 'no-repeat',
//             backgroundSize: 'cover'
//         }}>
//             {
//                 menuList.map((menu, index) => {
//
//                     return(
//                         <div>
//                             <a href={'#'} key={'producerNav' + index}
//                                className={classNames('d-flex justify-content-center align-items-center p-2 text-dark font-weight-bold')}
//                                onClick={onMenuClick.bind(this, menu.id)}>
//                                 {menu.name}
//                             </a>
//                             <br/>
//                         </div>
//                     )
//                 })
//             }
//
//         </div>
//
//     )
// }
// export default LeftMenu