import axios from '../../libs/ajax';

import {
    getToken
} from '../../utils/SecurityUtils';

import GeoStoreApi from '../../api/GeoStoreDAO';
import {
    searchAndPaginate as searchAndPaginateWMS,
    parseUrl
} from '../../api/WMS';
import {
    getCatalogRecords as getCatalogRecordsWMS,
    getLayerFromRecord as getLayerFromRecordWMS
} from '../../api/catalog/WMS';
import {
    searchAndPaginate as searchAndPaginateWFS,
    getCatalogRecords as getCatalogRecordsWFS,
    getLayerFromRecord as getLayerFromRecordWFS
} from '../../api/catalog/WFS';
import {
    getCapabilitiesURL
} from '../../api/WFS';


import thumbUrl from '../../components/maps/style/default.jpg';

import xml2js from 'xml2js';

const fileSystemUrl = 'https://beta.topio.market/api/file-system?path=/';
const hookUrl = 'https://beta.topio.market/api/webhooks/topio-maps';

const token = getToken();

const capabilitiesCache = {};

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

export const addWMSRecord = async (url, layerName = '') => {
    const api = axios.create();
    let config;
    if (url.includes('topio')) {
        config = {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            withCredentials: false,
        };
    }
    const topioUrl = url.split('?')[0];
    const parsedUrl = parseUrl(topioUrl);
    api.get(parsedUrl, config).then((response) => {
        let json;
        xml2js.parseString(response.data, {
            explicitArray: false
        }, (ignore, result) => {
            json = result;
        });
        capabilitiesCache[topioUrl] = {
            timestamp: new Date().getTime(),
            data: json
        };

        const paginateResponse = searchAndPaginateWMS(json, 0, 100, layerName);

        const catalogRecords = getCatalogRecordsWMS(paginateResponse, {
            ...paginateResponse.layerOptions,
            url: topioUrl
        })
        getLayerFromRecordWMS(catalogRecords[0], {
                ...paginateResponse.layerOptions
            }, true)
            .then((result) => {
                return result;
            });
    });
}

export const addWFSRecord = async (url, layerName = '') => {
    const api = axios.create();
    const topioUrl = url.split('?')[0];
    /*  if (cached && new Date().getTime() < cached.timestamp + (ConfigUtils.getConfigProp('cacheExpire') || 60) * 1000) {
         return new Promise((resolve) => {
             resolve(searchAndPaginateWFS(cached.data, startPosition, maxRecords, text, info));
         });
     } */
    api.get(getCapabilitiesURL(topioUrl, {
        version: "2.0.0"
    }), config).then((response) => {
        let json;
        xml2js.parseString(response.data, {
            explicitArray: false,
            stripPrefix: true
        }, (ignore, result) => {
            json = {
                ...result,
                url: topioUrl
            };
        });
        /* capabilitiesCache[url] = {
            timestamp: new Date().getTime(),
            data: json
        }; */
        const paginateResponse = searchAndPaginateWFS(json, 0, 100, layerName);

        const catalogRecords = getCatalogRecordsWFS(paginateResponse, {
            ...paginateResponse.layerOptions,
            url: topioUrl
        })
        getLayerFromRecordWFS(catalogRecords[0], {
                ...paginateResponse.layerOptions
            }, true)
            .then((result) => {
                return result;
            });
    });
}


export const onEditHook = async (resource) => {
    const currUrl = window.location.href.split('#/')[0];
    // set default thumbnail
    let thumbnail = thumbUrl;
    const date = Math.round((new Date()).getTime() / 1000);
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
    GeoStoreApi.getResource(resource.id).then(r => {
        r.Resource.Attributes.attribute.forEach(a => {
            if (a.name == 'thumbnail') {
                thumbnail = currUrl + a.value;
            }
        })
        const data = {
            url: currUrl + '#/viewer/openlayers/' + resource.id,
            title: resource.name,
            thumbnail
        };
        api.post(url, data, config).then(r => {
            console.log('onEditHook result ', r);
        });
    }).catch(e => {
        console.log(e);
    });
};


export const onDeleteHook = async (id) => {

    const date = Math.round((new Date()).getTime() / 1000);
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
            url: currUrl.includes('openlayers') ? currUrl : currUrl + 'viewer/openlayers/' + id,
        };
        api.post(url, data, config).then(r => {
            console.log('onDeletehook result ', r);
        });

    }).catch(e => {
        console.log(e);
    });
};
