const get = (endpoint, queryParams) => {
    const toQueryString = (params) => {
        return Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
    };

    const queryString = queryParams ? `?${toQueryString(queryParams)}` : '';
    
    return new Promise((res, rej) => {
        fetch(`${endpoint}${queryString}`)
            .then(response => response.json().then(body => response.ok ? res({...body, status: response.status}) : rej({...body, status: response.status})))
            .catch(error => rej(error));
    });
}

function isDateWithinInterval(dateToCheckStr, startDateStr, endDateStr) {
    const checkDate = new Date(dateToCheckStr).getTime();
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime();

    return checkDate >= start && checkDate <= end;
}


module.exports = {
    get,
    isDateWithinInterval
}