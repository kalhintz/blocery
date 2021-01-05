import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {Nav, Navbar, NavbarBrand, NavItem } from 'reactstrap'
import { CartLink } from '~/components/common'
import { MarketBlyMainLogo } from '~/components/common/logo'


function Header(){
    return (
        <div>

        <Navbar color="white" expand="sm" sticky="top" className={'shadow-none pt-1 pb-1'}>
            {/*<NavbarToggler onClick={this.toggle} />*/}

            <NavbarBrand tag={Link} to={'/'} className={'d-flex align-items-center'}>
                <MarketBlyMainLogo style={{height: 40}} />
            </NavbarBrand>

            <Nav className="ml-auto" navbar>
                <NavItem className='d-flex'>
                    <div className='mr-3'>
                        {/*<SearchButton />*/}
                    </div>
                    <div>
                        <CartLink />
                    </div>
                    {/*<NavLink tag={Link} to={'/#'} ><FontAwesomeIcon icon={faShoppingCart} size={'sm'}/></NavLink>*/}

                </NavItem>

                {/*<NavItem>*/}

                {/*<Dropdown direction='left' size='sm' isOpen={this.state.isOpen} toggle={this.toggle}>*/}
                {/*<DropdownToggle caret>*/}
                {/*Sample*/}
                {/*</DropdownToggle>*/}
                {/*<DropdownMenu>*/}
                {/*<DropdownItem>*/}
                {/*<NavLink className={'text-info'} tag={Link} to={'/sample/mobx'} >mobx</NavLink>*/}
                {/*</DropdownItem>*/}
                {/*<DropdownItem>*/}
                {/*<NavLink className={'text-info'} tag={Link} to={'/sample/ImageCompressor'} >이미지업로드(압축)</NavLink>*/}
                {/*</DropdownItem>*/}
                {/*<DropdownItem>*/}
                {/*<NavLink className={'text-info'} tag={Link} to={'/sample/SimpleStorageTest'} >SimpleStorageTest</NavLink>*/}
                {/*</DropdownItem>*/}

                {/*<DropdownItem>*/}
                {/*<NavLink className={'text-info'} tag={Link} to={'/sample/TokenTest'} >TokenTest</NavLink>*/}
                {/*</DropdownItem>*/}

                {/*</DropdownMenu>*/}
                {/*</Dropdown>*/}
                {/*</NavItem>*/}
            </Nav>
        </Navbar>
        </div>
    )
}

export default Header
//
// class Header extends Component{
//     constructor(props) {
//         super(props);
//
//         console.log('header props:',props)
//         this.state = {
//             isOpen: false,
//             //displayName: this.props.displayName,
//             userType: 'consumer' // 'producer'
//         }
//     }
//
//     render(){
//
//         return(
//
//             <Navbar color="info" dark expand="sm" sticky="top" className={'shadow-none pt-0 pl-3 pb-0  pr-3'}>
//                 {/*<NavbarToggler onClick={this.toggle} />*/}
//
//                 <NavbarBrand tag={Link} to={'/'} >
//                     <BloceryLogoWhite />
//                 </NavbarBrand>
//
//                 <Nav className="ml-auto" navbar>
//                     <NavItem>
//                         {/*<NavLink tag={Link} to={'/#'} ><FontAwesomeIcon icon={faShoppingCart} size={'sm'}/></NavLink>*/}
//                         <CartLink/>
//                     </NavItem>
//
//                     {/*<NavItem>*/}
//
//                         {/*<Dropdown direction='left' size='sm' isOpen={this.state.isOpen} toggle={this.toggle}>*/}
//                             {/*<DropdownToggle caret>*/}
//                                 {/*Sample*/}
//                             {/*</DropdownToggle>*/}
//                             {/*<DropdownMenu>*/}
//                                 {/*<DropdownItem>*/}
//                                     {/*<NavLink className={'text-info'} tag={Link} to={'/sample/mobx'} >mobx</NavLink>*/}
//                                 {/*</DropdownItem>*/}
//                                 {/*<DropdownItem>*/}
//                                     {/*<NavLink className={'text-info'} tag={Link} to={'/sample/ImageCompressor'} >이미지업로드(압축)</NavLink>*/}
//                                 {/*</DropdownItem>*/}
//                                 {/*<DropdownItem>*/}
//                                     {/*<NavLink className={'text-info'} tag={Link} to={'/sample/SimpleStorageTest'} >SimpleStorageTest</NavLink>*/}
//                                 {/*</DropdownItem>*/}
//
//                                 {/*<DropdownItem>*/}
//                                     {/*<NavLink className={'text-info'} tag={Link} to={'/sample/TokenTest'} >TokenTest</NavLink>*/}
//                                 {/*</DropdownItem>*/}
//
//                             {/*</DropdownMenu>*/}
//                         {/*</Dropdown>*/}
//                     {/*</NavItem>*/}
//                 </Nav>
//             </Navbar>
//
//
//
//
//
//
//
//
//
//
//         );
//     }
// }
//
// export default Header