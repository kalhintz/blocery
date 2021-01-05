import React from 'react'
import { FaSpinner } from 'react-icons/fa'
import {Spin} from "~/styledComponents/shared";

export default (props) =>
    props.isLoading &&
    <div className='fadein'>
        <Spin>
            <FaSpinner />
        </Spin>
    </div>