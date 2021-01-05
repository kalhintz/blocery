import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'reactstrap';
import Checkbox from '~/components/common/checkboxes/Checkbox'

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

    const {totCount, checkedCount} = props

    return (
    <div className='d-flex align-items-center pl-2 pt-2 pb-2 mb-2' style={{backgroundColor: '#F4F4F4'}}>

        <Checkbox bg={'green'} onChange={onChange} checked={totCount === checkedCount} size={'sm'}>전체선택 ({checkedCount}/{totCount})</Checkbox>

        <div className='ml-auto'>
            {
                checkedCount > 0 && totCount > 0 && <Button size='sm' color={'info'} outline onClick={onDelete}>삭제({checkedCount})</Button>
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
