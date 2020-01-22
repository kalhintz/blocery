import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { Webview } from '~/lib/webviewApi'

function onClick() {
    Webview.openPopup('/search', true)
}

const SearchButton = () => {
    return(
        <span onClick={onClick}>
            <FontAwesomeIcon icon={faSearch} size={'lg'} color={'white'}/>
        </span>
    )
}
export default SearchButton