import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {Nav, Navbar, NavbarBrand, NavItem } from 'reactstrap'
import { MarketBlyMainLogo } from '~/components/common/logo'

function Header(){
    return (
        <Navbar color="white" expand="sm" sticky="top" className={'shadow-none pt-1 pb-1'}>
            {/*<NavbarToggler onClick={this.toggle} />*/}

            <NavbarBrand tag={Link} to={'/producer/home'} className={'d-flex align-items-center'}>
                <MarketBlyMainLogo style={{height: 40}} />
            </NavbarBrand>

            <Nav className="ml-auto" navbar>
                <NavItem className='d-flex'>
                    <div className='mr-3'>
                    </div>
                    <div>
                    </div>
                </NavItem>
            </Nav>
        </Navbar>

    )
}

export default Header