import request from '@/utils/request'

export function login(data) {
    return request({
        url: '/api/admin/public/login',
        method: 'post',
        data
    })
}

export function getInfo() {
    return request({
        url: '/api/admin/account/getInfo',
        method: 'post',
        
    })
}

export function logout() {
    return request({
        url: '/api/admin/public/logout',
        method: 'post'
    })
}