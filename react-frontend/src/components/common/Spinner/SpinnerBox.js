import React from 'react'
import classNames from 'classnames'
import { Spinner } from '~/components/common'

const SpinnerBox = (props) =>
    <div className={classNames('bg-light text-center d-flex justify-content-center align-items-center', props.className)} style={{minHeight: props.minHeight || null}}>
        <Spinner size={'lg'}/>
    </div>
export default SpinnerBox
