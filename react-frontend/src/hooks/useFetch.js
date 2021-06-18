import React, {useState, useEffect} from 'react';
const useFetch = (fetchFunc, params) => {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetch() {
            setLoading(true)
            const {data} = await fetchFunc(params)
            setData(data)
            setLoading(false)
        }
        fetch()
    }, [])

    return {data, loading}
};

export default useFetch;
