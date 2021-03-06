import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Categories from '../components/goods/Cate.vue'

Vue.use(VueRouter)

 const router = new VueRouter({
  routes:[
    {
      path:'/login',
      component:Login
    },
     { 
      path: '/', 
       // 重定向
      redirect: '/login' 
    },
    {
      path: '/home',
      component:Home,
      redirect:'/welcome',
      children:[
        {
          path:'/welcome',
          component:Welcome
        },
        {
          path:'/users',
          component:Users
        },{
          path:'/rights',
          component:Rights
        },{
          path:'/roles',
          component:Roles
        },{
          path:'/categories',
          component:Categories
        }
      ]
    },
   
  ]
})

// 挂载路由导航守卫
router.beforeEach((to,from,next) =>{
  // next 是一个函数 表示放行
  // next() 放行 next('/login) 强制跳转
   if(to.path === '/login') return next()

  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})

export default router