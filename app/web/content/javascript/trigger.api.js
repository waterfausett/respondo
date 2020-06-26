const triggerApi = (() => {
    const apiUrl = '/triggers';

    function mapResponse(response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }

    return {
        add: (item) => {
            return fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(item)
            })
            .then(mapResponse)
            .then(res => res.json());
        },

        update: (item) => {
            return fetch(`${apiUrl}/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(item)
            })
            .then(mapResponse);
        },

        delete: (item) => {
            return fetch(`${apiUrl}/${item.id}`, {
                method: 'DELETE'
            })
            .then(mapResponse);
        }
    }
})();

Object.freeze(triggerApi);