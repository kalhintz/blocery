import React from 'react'
import {FaSearch} from 'react-icons/fa'

import { Webview } from '~/lib/webviewApi'

function onClick() {
    Webview.openPopup('/search', true)
}

const SearchButton = () => {
    return(
        <span onClick={onClick}>
            <FaSearch color={'white'}/>
        </span>
    )
}
export default SearchButton