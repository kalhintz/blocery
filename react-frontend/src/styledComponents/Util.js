const basePixel = 15
// const toRem = (num) => num / basePixed
export const toRem = (num) => {
    //console.log({num, basePixel, res: num / basePixel})
    return num / basePixel
}


export const getValue = (value) => {
    if(!isNaN(value) && value == 0) return value + 'px'
    if(!value) return null
    if(isNaN(value)) return value
    return toRem(value) + "rem" 
}

export const hasValue = (value) => {
    if (value === null || value === undefined) {
        return false
    }
    return true
}