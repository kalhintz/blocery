import React, { Fragment } from 'react'
import Style from './HrGoodsPriceCard.module.scss'
import classNames from 'classnames'
import ComUtil from '~/util/ComUtil'
import PropTypes from 'prop-types'
const HrGoodsPriceCard = ({priceSteps, currentPrice}) => {
    return(
        <Fragment>
            {
                priceSteps.map((item, index)=>{
                  return(
                      <div key={'hrGoodsPriceCard'+index} className={classNames(Style.card, item.price === currentPrice && Style.active )}>
                          <div className={classNames(Style.percentage, item.price === currentPrice && Style.active) }>{Math.round(item.discountRate)}%</div>
                          <div className={Style.date}>{ComUtil.utcToString(item.until)} 까지</div>
                          <div className={Style.price}>{ComUtil.addCommas(item.price)}원</div>
                      </div>
                  )
                })
            }
        </Fragment>
    )
}
HrGoodsPriceCard.propTypes = {
    data: PropTypes.array.isRequired
}
HrGoodsPriceCard.defaultProps = {
    data: []
}

export default HrGoodsPriceCard