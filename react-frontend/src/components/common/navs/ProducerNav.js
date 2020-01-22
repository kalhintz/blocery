import React, { Fragment } from 'react'
import { Link, NavLink as RouterLink } from 'react-router-dom'
import Style from './ProducerNav.module.scss'
import PropTypes from 'prop-types'
import classnames from 'classnames'

// import { ProducerMenuList } from '../../Properties'
const ProducerNav = ({data, id}) => {

    const {group} = data.find(menu => menu.id === id)

    return(
        <div className={Style.wrap}>
            {
                data.filter(menu => menu.group === group).map((menu, index) => {
                    return(
                        menu.visibility &&
                        (
                            <div key={'producerNav'+index} className={id === menu.id ? Style.active : null}>
                                <RouterLink to={`/${menu.route}/${menu.id}` }>{menu.name}</RouterLink>
                            </div>
                        )
                    )
                })
            }
        </div>
    )
}

ProducerNav.propTypes = {

}
ProducerNav.defaultProp = {
}

export default ProducerNav