import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken, getXXSid, setXXSid, } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  sid: getXXSid(),
  name: '',
  avatar: '',
  introduction: '',
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_xxsid: (state, sid) => {
    state.sid = sid
  },

  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response

        commit('SET_TOKEN', data.token)
        commit('SET_xxsid', data.sid)
        setToken(data.token)
        setXXSid(data.sid)


        const role_data = {
          roles: [],
          introduction: 'I am a super administrator',
          avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
          name: 'Super Admin'
        }
        role_data.roles.push(data.user.username)

        resolve(role_data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {


      // const data = {
      //   roles: ['admin'],
      //   introduction: 'I am a super administrator',
      //   avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
      //   name: 'this is name'
      // }

      // const { roles, name, avatar, introduction } = data
      // commit('SET_ROLES', roles)
      // commit('SET_NAME', name)
      // commit('SET_AVATAR', 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif')
      // commit('SET_INTRODUCTION', '这是简介')

      // resolve(data)


      // return


      getInfo(state.token).then(response => {
        const { data_res } = response

        // if (!data) {
        //     reject('Verification failed, please Login again.')
        // }

        // const { roles, name, avatar, introduction } = data

        // if (!roles || roles.length <= 0) {
        //     reject('getInfo: roles must be a non-null array!')
        // }
        var role_val
        if (Number(response.data.role_id) == 1) {
          role_val = 'admin'
        } else if (Number(response.data.role_id) == 2) {
          role_val = 'edit'
        } else if (Number(response.data.role_id) == 3) {
          role_val = 'yunying'
        }else if (Number(response.data.role_id) ==4) {
          role_val = 'caiwu'
        }
        const data = {
          roles: [role_val],
          introduction: 'I am controll',
          avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
          name: response.data.nickname
        }
        const { roles, name, avatar, introduction } = data

        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)

        console.log('fffffff', role_val)

        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        commit('SET_xxsid', '')
        removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_xxsid', '')
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
