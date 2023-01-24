import axios from '../../libs/ajax';

import {
    getToken
} from '../../utils/SecurityUtils';

import GeoStoreApi from '../../api/GeoStoreDAO';

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

    let thumbnail;
    const date = Math.round((new Date()).getTime() / 1000) ;
    const url = hookUrl + '?EventType=MAP_CREATED' + '&Date=' + date;
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
    GeoStoreApi.getResourceAttribute(resource.id, 'thumbnail').then(r => {
        const currUrl = window.location.href;
        const data = {
                url: currUrl.includes('openlayers')  ?  currUrl : currUrl + 'viewer/openlayers/' + resource.id,
                title: resource.name,
                thumbnail: r.data
        };
        api.post(url, data, config).then(r => {
            console.log('onEditHook result ', r);
        });
    }).catch(e=>{
        const currUrl = window.location.href;
        const data = {
            url: currUrl.includes('openlayers')  ?  currUrl : currUrl + 'viewer/openlayers/' + resource.id,
            title: resource.name,
            thumbnail
        };
        api.post(url, data, config).then(r => {
            console.log('onEditHook result ', r);
        });
        console.log(e);
    }); 
};


export const onDeleteHook = async (id) => {

    let title;
    const date = Math.round((new Date()).getTime() / 1000) ;
    const url = hookUrl + '?EventType=MAP_DELETED' + '&Date=' + date;
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
    GeoStoreApi.getResource(id).then(r => {
        const currUrl = window.location.href;
        const data = {
            title: r.Resource.name,
            url: currUrl.includes('openlayers')  ?  currUrl : currUrl + 'viewer/openlayers/' + id,
        };
        api.post(url, data, config).then(r => {
            console.log('onDeletehook result ', r);
        });

    }).catch(e=>{
        console.log(e);
    }); 
};
