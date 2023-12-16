import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
const XXSid = 'XX-Sid'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
export function getXXSid() {
  return Cookies.get(XXSid)
}

export function setXXSid(sid) {
  return Cookies.set(XXSid, sid)
}

export function removeXXSid() {
  return Cookies.remove(XXSid)
}


