import axios from '../../libs/ajax';

import {
    getToken
} from '../../utils/SecurityUtils';

const fileSystemUrl = 'https://beta.topio.market/api/file-system?path=/';
const hookUrl = 'https://beta.topio.market/api/webhooks/topio-maps';

const token = getToken();

export const getFileSystem = async () => {
    const api = axios.create({
        withCredentials: true
    });


    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
    };

    const result = await api.get(fileSystemUrl, config)
    return result;
};

export const getServices = async () => {
    const api = axios.create({
        withCredentials: true
    });

    const token = getToken();

    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
    };

    const servicesUrl = 'https://beta.topio.market/api/user/services';

    const result = await api.get(servicesUrl, config)
        .then(function (response) {
            const services = response.data.result.items;
            return services;
        })
        .catch(function (error) {
            console.log(error);
        });

    return result;
};

export const getSubscriptions = async () => {
    const api = axios.create({
        withCredentials: true
    });

    const token = getToken();

    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
    };
    const subscriptionsUrl = 'https://beta.topio.market/api/consumer/subscriptions';

    const result = await api.get(subscriptionsUrl, config)
        .then(function (response) {
            const subscriptions = response.data.result.items;
            return subscriptions;
        })
        .catch(function (error) {
            console.log(error);
        });

    return result
};


export const onEditHook = async (resource) => {

    const api = axios.create({
        withCredentials: true
    });

    const token = getToken();

    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
    };
    const date = Math.abs((new Date()).getTime() / 1000);
    const data = {
        date,
        'eventType': 'MAP_CREATED',
        'attributes': {
            'id': resource.id,
            'name': resource.name,
            'description': resource.description
        }
    };
    api.post(hookUrl, data, config).then(r => {
        console.log('onEditHook result ', r);
    });
};


export const onDeleteHook = async (resource) => {

    const api = axios.create({
        withCredentials: true
    });

    const token = getToken();

    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
    };
    const date = Math.abs((new Date()).getTime() / 1000);
    const data = {
        date,
        'eventType': 'MAP_DELETED',
        'attributes': {
            'id': resource.id,
        }
    };
    api.post(hookUrl, data, config).then(r => {
        console.log('onDeletehook result ', r);
    });
};
