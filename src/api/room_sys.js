import request from '@/utils/request'

export function fetchadminlist(data) {
  return request({
    url: '/api/admin/account/index',
    method: 'post',
    data
  })
}
export function deladminlist(data) {
  return request({
    url: '/api/admin/account/del',
    method: 'post',
    data
  })
}
export function addadminlist(data) {
  return request({
    url: '/api/admin/account/edit',
    method: 'post',
    data
  })
}
export function fetchbase_set(data) {
  return request({
    url: '/api/admin/config/getBaseConfig',
    method: 'post',
    data
  })
}

export function savebase_set(data) {
  return request({
    url: '/api/admin/config/saveBaseConfig',
    method: 'post',
    data
  })
}

export function fetchnoticelist(data) {
  return request({
    url: '/api/admin/notice/getList',
    method: 'post',
    data
  })
}
export function createnotice(data) {
  return request({
    url: '/api/admin/notice/saveData',
    method: 'post',
    data
  })
}
export function delnotice(data) {
  return request({
    url: '/api/admin/notice/remove',
    method: 'post',
    data
  })
}

export function fetchbigroomlist(data) {
  return request({
    url: '/api/admin/room/getList',
    method: 'post',
    data
  })
}
export function addbigroom(data) {
  return request({
    url: '/api/admin/room/saveRoom',
    method: 'post',
    data
  })
}
export function delbigroom(data) {
  return request({
    url: '/api/admin/room/remove',
    method: 'post',
    data
  })
}

export function fetchxiaoroomlist(data) {
  return request({
    url: '/api/admin/room/getSubList',
    method: 'post',
    data
  })
}

export function addxiaoroom(data) {
  return request({
    url: '/api/admin/room/saveSubRoom',
    method: 'post',
    data
  })
}
export function delxiaoroom(data) {
  return request({
    url: '/api/admin/room/removeSubRoom',
    method: 'post',
    data
  })
}

export function fetchuserlist(data) {
  return request({
    url: '/api/admin/user/getList',
    method: 'post',
    data
  })
}
export function adduserlist(data) {
  return request({
    url: '/api/admin/user/saveData',
    method: 'post',
    data
  })
}

export function fetchpaylist(data) {
  return request({
    url: '/api/admin/recharge/getList',
    method: 'post',
    data
  })
}
export function addpaylist(data) {
  return request({
    url: '/api/admin/recharge/saveData',
    method: 'post',
    data
  })
}
export function delpaylist(data) {
  return request({
    url: '/api/admin/recharge/remove',
    method: 'post',
    data
  })
}

export function fetchpeilvlist(data) {
  return request({
    url: '/api/admin/room/getMultipleList',
    method: 'post',
    data
  })
}

export function addpeilv(data) {
  return request({
    url: '/api/admin/room/saveMultiple',
    method: 'post',
    data
  })
}
export function delpeilv(data) {
  return request({
    url: '/api/admin/room/removeMultiple',
    method: 'post',
    data
  })
}
export function fetchjiangqilist(data) {
  return request({
    url: '/api/admin/room/getOpenList',
    method: 'post',
    data
  })
}
export function fetchqishu(data) {
  return request({
    url: '/api/admin/room/getOpenSearchOptions',
    method: 'post',
    data
  })
}

export function fetchrechargelist(data) {
  return request({
    url: '/api/admin/recharge/getRecordList',
    method: 'post',
    data
  })
}
export function fetchtiixanlist(data) {
  return request({
    url: '/api/admin/recharge/getRecordList',
    method: 'post',
    data
  })
}

export function tixian_list(data) {
  return request({
    url: '/api/admin/recharge/getWithdrawalList',
    method: 'post',
    data
  })
}

export function setracharge_ok(data) {
  return request({
    url: '/api/admin/recharge/doRecordAction',
    method: 'post',
    data
  })
}
export function settixian_ok(data) {
  return request({
    url: '/api/admin/recharge/doWithdrawalRecordAction',
    method: 'post',
    data
  })
}
export function fetorderlist(data) {
  return request({
    url: '/api/admin/order/getList',
    method: 'post',
    data
  })
}
export function editjiangqi(data) {
    return request({
        url: '/api/admin/room/saveOpenData',
        method: 'post',
        data
    })
}
export function kill_user(data) {
    return request({
        url: '/api/admin/order/saveData',
        method: 'post',
        data
    })
}
export function build_jiangqi(data) {
  return request({
      url: '/api/admin/room/createOpenData',
      method: 'post',
      data
  })
}
export function home_top(data) {
  return request({
      url: '/api/admin/index/getCountData',
      method: 'post',
      data
  })
}
export function home_line(data) {
  return request({
      url: '/api/admin/index/getRechargeChartData',
      method: 'post',
      data
  })
}
export function home_zhu(data) {
  return request({
      url: '/api/admin/index/getOrderChartData',
      method: 'post',
      data
  })
}

export function movice_type(data) {
  return request({
      url: '/api/admin/movie/getTypes',
      method: 'post',
      data
  })
}
export function movice_type_edit(data) {
  return request({
      url: '/api/admin/movie/saveType',
      method: 'post',
      data
  })
}
export function movice_type_del(data) {
  return request({
      url: '/api/admin/movie/remove',
      method: 'post',
      data
  })
}

export function movice_list(data) {
  return request({
      url: '/api/admin/movie/getMovieList',
      method: 'post',
      data
  })
}
export function movice_list_edit(data) {
  return request({
      url: '/api/admin/movie/saveMovie',
      method: 'post',
      data
  })
}
export function movice_list_del(data) {
  return request({
      url: '/api/admin/movie/removeMovie',
      method: 'post',
      data
  })
}



export function get_movie_getOpenList(data) {
  return request({
      url: '/api/admin/movie/getOpenList',
      method: 'post',
      data
  })
}
export function create_new_jiangqi(data) {
  return request({
      url: '/api/admin/movie/createOpenData',
      method: 'post',
      data
  })
}

export function get_movie_getOpenList_edit(data) {
  return request({
      url: '/api/admin/movie/saveOpenData',
      method: 'post',
      data
  })
}