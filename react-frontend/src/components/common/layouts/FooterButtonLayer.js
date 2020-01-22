import React from 'react'
import Style from './FooterButtonLayer.module.scss'
import PropTypes from 'prop-types'
const FooterButtonLayer = (props) => {
    return(
        <footer className={Style.wrap}>

            {
                props.data.map((item, index) => item ? <div key={'footer_'+index}>{item}</div> : null)
            }


        </footer>
    )
}

FooterButtonLayer.propTypes = {
    data: PropTypes.array.isRequired
}
FooterButtonLayer.defaultPropTypes = {
    data: []
}

export default FooterButtonLayer