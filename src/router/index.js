import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
import componentsRouter from './modules/components'
import chartsRouter from './modules/charts'
import tableRouter from './modules/table'
import nestedRouter from './modules/nested'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [{
        path: '/redirect',
        component: Layout,
        hidden: true,
        children: [{
            path: '/redirect/:path(.*)',
            component: () =>
                import ('@/views/redirect/index')
        }]
    },
    {
        path: '/login',
        component: () =>
            import ('@/views/login/index'),
        hidden: true
    },
    {
        path: '/auth-redirect',
        component: () =>
            import ('@/views/login/auth-redirect'),
        hidden: true
    },
    {
        path: '/404',
        component: () =>
            import ('@/views/error-page/404'),
        hidden: true
    },
    {
        path: '/401',
        component: () =>
            import ('@/views/error-page/401'),
        hidden: true
    },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [{
            path: 'dashboard',
            component: () =>
                import ('@/views/dashboard/index'),
            name: 'Dashboard',
            meta: { title: 'dashboard', icon: 'dashboard', affix: true }
        }]
    }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [ {
        path: '/user',
        component: Layout,
        redirect: '/user/list',
        name: 'Example',
        meta: {
            title: '设置中心',
            icon: 'el-icon-s-tools',
            roles: ['admin', 'caiwu', 'yunying', 'edit']
        },
        children: [{
                path: 'base_set',
                component: () =>
                    import ('@/views/base/list'),
                name: 'base_set',
                meta: { title: '基础设置', icon: 'el-icon-setting', roles: ['admin', 'yunying'] }
            },
            // {
            //     path: 'rechargetype',
            //     component: () =>
            //         import ('@/views/rechargetype/list'),
            //     name: 'userlist',
            //     meta: { title: '充值通道', icon: 'el-icon-wallet', roles: ['admin', 'yunying', 'caiwu'] }
            // },
            {
                path: 'message',
                component: () =>
                    import ('@/views/notice/list'),
                name: 'userlist',
                meta: { title: '公告列表', icon: 'el-icon-s-comment', roles: ['admin', 'yunying','edit'] }
            },

        ]
    },{
        path: '/adminlist',
        component: Layout,
        redirect: '/adminlist/list',
        name: 'adminlist',
        meta: {
            title: '管理员',
            icon: 'el-icon-s-custom',
            roles: ['admin', 'yunying', ]
        },
        children: [{
                path: 'adminlist',
                component: () =>
                    import ('@/views/adminlist/list'),
                name: 'adminlist',
                meta: { title: '管理员列表', icon: 'el-icon-s-custom', roles: ['admin', 'yunyin'] }
            }

        ]
    },
    // {
    //     path: '/recharge',
    //     component: Layout,
    //     redirect: '/recharge/list',
    //     name: 'recharge',
    //     meta: {
    //         title: '财务中心',
    //         icon: 'el-icon-s-finance',
    //         roles: ['admin', 'caiwu', 'yunying', 'editor']
    //     },
    //     children: [{
    //             path: 'recharge',
    //             component: () =>
    //                 import ('@/views/recharge/list'),
    //             name: 'recharge',
    //             meta: { title: '充值列表', icon: 'el-icon-s-finance', roles: ['admin', 'yunying', 'caiwu'] }
    //         }
    //         , {
    //             path: 'cash',
    //             component: () =>import ('@/views/cash/list'),
            
    //             name: 'cash',
    //             meta: { title: '提现列表', icon: 'dashboard', roles: ['admin', 'yunying', 'caiwu'] }
    //         }

    //     ]
    // },

    // {
    //   path: '/zhishutype',
    //   component: Layout,
    //   redirect: '/zhishutype/list',
    //   name: 'zhishutype',
    //   meta: {
    //     title: '指数中心',
    //     icon: 'el-icon-s-help',
    //     roles: ['admin','caiwu','yunyin', 'editor']
    //   },
    //   children: [
    //     {
    //       path: 'index',
    //       component: () => import('@/views/zhishutype/list'),
    //       name: 'zhishutype',
    //       meta: { title: '指数类型', icon: 'dashboard',roles: ['admin','yunyin'] }
    //     },{
    //       path: 'zhishulist',
    //       component: () => import('@/views/zhishu/list'),
    //       name: 'zhishulist',
    //       meta: { title: '指数列表', icon: 'dashboard',roles: ['admin','yunyin'] }
    //     }

    //   ]
    // },
    {
        path: '/room',
        component: Layout,
        redirect: '/room/list',
        name: 'room',
        meta: {
            title: '电影记录',
            icon: 'el-icon-video-camera-solid',
            roles: ['admin', 'caiwu', 'yunying', 'editor']
        },
        children: [{
                path: 'type',
                component: () =>
                    import ('@/views/room/type'),
                name: 'room',
                meta: { title: '电影分类', icon: 'el-icon-tickets', roles: ['admin', 'yunying'] }
            },{
                path: 'list',
                component: () =>
                    import ('@/views/room/list'),
                name: 'room',
                meta: { title: '电影列表', icon: 'el-icon-film', roles: ['admin', 'yunying'] }
            },
            {
                path: 'zi_roomlist',
                component: () =>
                    import ('@/views/room/zi_list'),
                hidden: true
            }, {
                path: 'peilvlist',
                component: () =>
                    import ('@/views/room/peilv'),
                hidden: true
            }

        ]
    },
    // {
    //     path: '/meinv',
    //     component: Layout,
    //     redirect: '/meinv/list',
    //     name: 'meinv',
    //     meta: {
    //         title: '美女记录',
    //         icon: 'el-icon-milk-tea',
    //         roles: ['admin', 'caiwu', 'yunying', 'editor']
    //     },
    //     children: [{
    //             path: 'meinvtype',
    //             component: () =>
    //                 import ('@/views/meinv/type'),
    //             name: 'meinv',
    //             meta: { title: '地区', icon: 'el-icon-place', roles: ['admin', 'yunying'] }
    //         },{
    //             path: 'meinvlist',
    //             component: () =>
    //                 import ('@/views/meinv/list'),
    //             name: 'meinv',
    //             meta: { title: '美女列表', icon: 'el-icon-timer', roles: ['admin', 'yunying'] }
    //         },
            

    //     ]
    // },
    // {
    //     path: '/levellist',
    //     component: Layout,
    //     redirect: '/levellist/list',
    //     name: 'Example',
    //     meta: {
    //         title: '等级列表',
    //         icon: 'el-icon-s-flag',
    //         roles: ['admin', 'caiwu', 'yunying', ]
    //     },
    //     children: [{
    //             path: 'levellist',
    //             component: () =>
    //                 import ('@/views/level/list'),
    //             name: 'userlist',
    //             meta: { title: '等级列表', icon: 'el-icon-s-flag', roles: ['admin', 'yunying'] }
    //         }

    //     ]
    // },
    {
        path: '/user',
        component: Layout,
        redirect: '/user/list',
        name: 'Example',
        meta: {
            title: '用户中心',
            icon: 'el-icon-user',
            roles: ['admin', 'caiwu', 'yunying', ]
        },
        children: [{
                path: 'userlist',
                component: () =>
                    import ('@/views/user/list_pian'),
                name: 'userlist',
                meta: { title: '用户列表', icon: 'el-icon-user', roles: ['admin', 'yunying'] }
            }

        ]
    },
    {
        path: '/jiangqi',
        component: Layout,
        redirect: '/jiangqi/list',
        name: 'jiangqi',
        meta: {
            title: '开奖设置',
            icon: 'el-icon-trophy-1',
            roles: ['admin', 'caiwu', 'yunying', 'editor']
        },
        children: [{
                path: 'index',
                component: () =>
                    import ('@/views/jiangqi/list_pian'),
                name: 'room',
                meta: { title: '开奖设置', icon: 'el-icon-trophy-1', roles: ['admin', 'yunying'] }
            },


        ]
    },{
        path: '/order',
        component: Layout,
        redirect: '/order/list',
        name: 'order',
        meta: {
            title: '投注记录',
            icon: 'el-icon-orange',
            roles: ['admin', 'caiwu', 'yunying']

        },
        children: [{
                path: 'order',
                component: () =>
                    import ('@/views/order/list_pian'),
                name: 'order',
                meta: { title: '投注记录', icon: 'el-icon-orange', roles: ['admin','yunying'] }
            }

        ]
    },
    // {
    //     path: '/conversations',
    //     component: Layout,
    //     redirect: '/Conversations',
    //     name: 'im',
    //     meta: {
    //         title: '客服',
    //         icon: 'el-icon-s-help',
    //         roles: ['admin', 'caiwu', 'yunying']

    //     },
    //     children: [{
    //             path: 'GroupList',
    //             component: () =>
    //                 import ('@/views/Im/GroupList.vue'),
    //             name: 'conversations',
    //             meta: { title: '群组列表', icon: 'dashboard',  }
    //         },{
    //             path: 'conversations',
    //             component: () =>
    //                 import ('@/views/Im/form'),
    //             name: 'conversations',
    //             meta: { title: '客服', icon: 'dashboard',  }
    //         },


    //     ]
    // },
    // {
    //   path: '/permission',
    //   component: Layout,
    //   redirect: '/permission/page',
    //   alwaysShow: true, // will always show the root menu
    //   name: 'Permission',
    //   meta: {
    //     title: 'permission',
    //     icon: 'lock',
    //     roles: ['admin', 'editor'] // you can set roles in root nav
    //   },
    //   children: [
    //     {
    //       path: 'page',
    //       component: () => import('@/views/permission/page'),
    //       name: 'PagePermission',
    //       meta: {
    //         title: 'pagePermission',
    //         roles: ['admin'] // or you can only set roles in sub nav
    //       }
    //     },
    //     {
    //       path: 'directive',
    //       component: () => import('@/views/permission/directive'),
    //       name: 'DirectivePermission',
    //       meta: {
    //         title: 'directivePermission'
    //         // if do not set roles, means: this page does not require permission
    //       }
    //     },
    //     {
    //       path: 'role',
    //       component: () => import('@/views/permission/role'),
    //       name: 'RolePermission',
    //       meta: {
    //         title: 'rolePermission',
    //         roles: ['admin']
    //       }
    //     }
    //   ]
    // },

    // {
    //   path: '/icon',
    //   component: Layout,
    //   children: [
    //     {
    //       path: 'index',
    //       component: () => import('@/views/icons/index'),
    //       name: 'Icons',
    //       meta: { title: 'icons', icon: 'icon', noCache: true }
    //     }
    //   ]
    // },

    /** when your routing map is too long, you can split it into small modules **/
    // componentsRouter,
    // chartsRouter,
    // nestedRouter,
    // tableRouter,

    // {
    //   path: '/example',
    //   component: Layout,
    //   redirect: '/example/list',
    //   name: 'Example',
    //   meta: {
    //     title: 'example',
    //     icon: 'el-icon-s-help'
    //   },
    //   children: [
    //     {
    //       path: 'create',
    //       component: () => import('@/views/example/create'),
    //       name: 'CreateArticle',
    //       meta: { title: 'createArticle', icon: 'edit' }
    //     },
    //     {
    //       path: 'edit/:id(\\d+)',
    //       component: () => import('@/views/example/edit'),
    //       name: 'EditArticle',
    //       meta: { title: 'editArticle', noCache: true, activeMenu: '/example/list' },
    //       hidden: true
    //     },
    //     {
    //       path: 'list',
    //       component: () => import('@/views/example/list'),
    //       name: 'ArticleList',
    //       meta: { title: 'articleList', icon: 'list' }
    //     }
    //   ]
    // },

    // {
    //   path: '/tab',
    //   component: Layout,
    //   children: [
    //     {
    //       path: 'index',
    //       component: () => import('@/views/tab/index'),
    //       name: 'Tab',
    //       meta: { title: 'tab', icon: 'tab' }
    //     }
    //   ]
    // },

    // {
    //   path: '/error',
    //   component: Layout,
    //   redirect: 'noRedirect',
    //   name: 'ErrorPages',
    //   meta: {
    //     title: 'errorPages',
    //     icon: '404'
    //   },
    //   children: [
    //     {
    //       path: '401',
    //       component: () => import('@/views/error-page/401'),
    //       name: 'Page401',
    //       meta: { title: 'page401', noCache: true }
    //     },
    //     {
    //       path: '404',
    //       component: () => import('@/views/error-page/404'),
    //       name: 'Page404',
    //       meta: { title: 'page404', noCache: true }
    //     }
    //   ]
    // },

    // {
    //   path: '/error-log',
    //   component: Layout,
    //   children: [
    //     {
    //       path: 'log',
    //       component: () => import('@/views/error-log/index'),
    //       name: 'ErrorLog',
    //       meta: { title: 'errorLog', icon: 'bug' }
    //     }
    //   ]
    // },

    // {
    //   path: '/excel',
    //   component: Layout,
    //   redirect: '/excel/export-excel',
    //   name: 'Excel',
    //   meta: {
    //     title: 'excel',
    //     icon: 'excel'
    //   },
    //   children: [
    //     {
    //       path: 'export-excel',
    //       component: () => import('@/views/excel/export-excel'),
    //       name: 'ExportExcel',
    //       meta: { title: 'exportExcel' }
    //     },
    //     {
    //       path: 'export-selected-excel',
    //       component: () => import('@/views/excel/select-excel'),
    //       name: 'SelectExcel',
    //       meta: { title: 'selectExcel' }
    //     },
    //     {
    //       path: 'export-merge-header',
    //       component: () => import('@/views/excel/merge-header'),
    //       name: 'MergeHeader',
    //       meta: { title: 'mergeHeader' }
    //     },
    //     {
    //       path: 'upload-excel',
    //       component: () => import('@/views/excel/upload-excel'),
    //       name: 'UploadExcel',
    //       meta: { title: 'uploadExcel' }
    //     }
    //   ]
    // },

    // {
    //   path: '/zip',
    //   component: Layout,
    //   redirect: '/zip/download',
    //   alwaysShow: true,
    //   name: 'Zip',
    //   meta: { title: 'zip', icon: 'zip' },
    //   children: [
    //     {
    //       path: 'download',
    //       component: () => import('@/views/zip/index'),
    //       name: 'ExportZip',
    //       meta: { title: 'exportZip' }
    //     }
    //   ]
    // },

    // {
    //   path: '/pdf',
    //   component: Layout,
    //   redirect: '/pdf/index',
    //   children: [
    //     {
    //       path: 'index',
    //       component: () => import('@/views/pdf/index'),
    //       name: 'PDF',
    //       meta: { title: 'pdf', icon: 'pdf' }
    //     }
    //   ]
    // },
    // {
    //   path: '/pdf/download',
    //   component: () => import('@/views/pdf/download'),
    //   hidden: true
    // },

    // {
    //   path: '/theme',
    //   component: Layout,
    //   children: [
    //     {
    //       path: 'index',
    //       component: () => import('@/views/theme/index'),
    //       name: 'Theme',
    //       meta: { title: 'theme', icon: 'theme' }
    //     }
    //   ]
    // },

    // {
    //   path: '/clipboard',
    //   component: Layout,
    //   children: [
    //     {
    //       path: 'index',
    //       component: () => import('@/views/clipboard/index'),
    //       name: 'ClipboardDemo',
    //       meta: { title: 'clipboardDemo', icon: 'clipboard' }
    //     }
    //   ]
    // },

    // {
    //   path: '/i18n',
    //   component: Layout,
    //   children: [
    //     {
    //       path: 'index',
    //       component: () => import('@/views/i18n-demo/index'),
    //       name: 'I18n',
    //       meta: { title: 'i18n', icon: 'international' }
    //     }
    //   ]
    // },

    // {
    //   path: 'external-link',
    //   component: Layout,
    //   children: [
    //     {
    //       path: 'https://github.com/PanJiaChen/vue-element-admin',
    //       meta: { title: 'externalLink', icon: 'link' }
    //     }
    //   ]
    // },

    // 404 page must be placed at the end !!!
    { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
    const newRouter = createRouter()
    router.matcher = newRouter.matcher // reset router
}

export default router