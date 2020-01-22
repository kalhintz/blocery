import React, { Fragment } from 'react'
import { Link, NavLink as RouterLink } from 'react-router-dom'
import Style from './SellerNav.module.scss'
import PropTypes from 'prop-types'
import classnames from 'classnames'

// import { ProducerMenuList } from '../../Properties'

const SellerNav = ({data, id}) => {

    const {group} = data.find(menu => menu.id === id)

    return(
        <div className={Style.wrap}>
            {
                data.filter(menu => menu.group === group).map(menu => {
                    return(
                        menu.visibility &&
                        (
                            <div key={menu.route+menu.id} className={id === menu.id ? Style.active : null}>
                                <RouterLink to={`${menu.route}/${menu.id}` }>{menu.name}</RouterLink>
                            </div>
                        )
                    )
                })
            }
        </div>
    )
}

SellerNav.propTypes = {

}
SellerNav.defaultProp = {
}

export default SellerNav