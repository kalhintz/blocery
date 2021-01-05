import React from 'react'
import {Spin} from "~/styledComponents/shared";
import {FaSpinner} from "react-icons/fa";

export default () =>
    <div className='fadein'>
        <Spin>
            <FaSpinner />
        </Spin>
    </div>