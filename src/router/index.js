import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/Home.vue'
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
      component:Home
    }
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