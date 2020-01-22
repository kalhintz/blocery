import React from 'react'
import PropTypes from 'prop-types'
import { Button, Label } from 'reactstrap';
import { Checkbox } from '@material-ui/core'


import Style from './CartList.module.scss'
const CartHeader  = (props) => {
    const onChange = (e) => {
        // props.onChange(e.target.checked)

        props.onChange({
            type: 'CHECKED_ALL',
            state: {
                checked: e.target.checked
            }
        })

    }

    const onDelete = () => {
        props.onChange({
            type: 'DELETE_ITEMS'
        })
    }

    const checked = props.checkedCount === props.totCount && props.totCount > 0 ? true : false
    return (
    <div className='d-flex align-items-center pl-2 pt-2 pb-2 mb-2' style={{backgroundColor: '#F4F4F4'}}>
        <Checkbox id={'checkAll'} className={Style.mdCheckbox} color={'default'} checked={checked} onChange={onChange} />
        <Label for={'checkAll'} className='font-weight-bold m-0'>전체선택 ({props.checkedCount}/{props.totCount})</Label>
        <div className='ml-auto'>
            {
                props.checkedCount > 0 && props.totCount > 0 && <Button size='sm' color={'info'} outline onClick={onDelete}>삭제({props.checkedCount})</Button>
            }

        </div>
    </div>
    )
}

CartHeader.propTypes = {
    checkedCount: PropTypes.number.isRequired,
    totCount: PropTypes.number.isRequired,
}
CartHeader.defaultProps = {
    checkedCount: 0,
    totCount: 0
}

export default CartHeader
