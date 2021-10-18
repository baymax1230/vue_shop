<template>
  <div class="top">
    <div class="session">
      <div class="left"></div>
      <div class="log-in">
        <h2 class="user-login">用户登录</h2>
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          label-width="0px"
          :rules="loginRules"
        >
          <el-form-item prop="username">
            <el-input
              placeholder="用户名"
              prefix-icon="iconfont icon-wode-wode"
              v-model="loginForm.username"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              placeholder="密码"
              prefix-icon="iconfont icon-mima"
              v-model="loginForm.password"
              type="password"
              class="password-inp"
            ></el-input>
          </el-form-item>
          <el-form-item style="  margin-top: 10px;">
            <el-button type="primary" @click="login" class="button-login"
              >登录</el-button
            >
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: "",
        password: ""
      },
      loginRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    //点击重置按钮 重置登录表单
    resetForm() {
      // console.log(this);
      this.$refs.loginFormRef.resetFields();
    },
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post("login", this.loginForm);
        console.log(res);
        if (res.meta.status !== 200) return this.$message.error("登陆失败");
        this.$message.success("登陆成功");

        window.sessionStorage.setItem("token", res.data.token);

        this.$router.push("/home");
      });
    }
  }
};
</script>

<style lang="less" scoped>
.top {
  background: #f3f2f2;
  color: #fff;
  font-family: "Muli", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  overflow: hidden;
  margin: 0;
}
.session {
  display: flex;
  flex-direction: row;

  width: auto;
  height: auto;
  margin: auto auto;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0px 2px 6px -1px rgba(0, 0, 0, 0.12);
}
.left {
  width: 220px;
  height: auto;
  min-height: 100%;
  position: relative;
  background-image: url("../assets/image/img1.jpeg");
  background-size: cover;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
.session p {
  font-size: 30px;
  font-weight: 700;
  color: #000;
  margin: 0 auto;
  padding-bottom: 40px;
}
.log-in {
  padding: 40px 30px;
  background: #fefefe;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-bottom: 20px;
  width: 300px;
}
.user-login {
  color: #000;
  text-align: center;
  margin: 0 auto;
  margin-bottom: 20px;
}
.iconfont {
  font-size: 15px;
  // position: absolute;
  // top: 14px;
  // left: 9px;
  color: rgb(201, 200, 200);
}
label {
  font-size: 12.5px;
  color: #000;
  opacity: 0.8;
  font-weight: 400;
}

button {
  -webkit-appearance: none;
  width: auto;
  min-width: 100px;
  border-radius: 24px;
  text-align: center;
  padding: 15px 40px;
  margin-top: 5px;
  background-color: rgb(189, 188, 188);
  color: #fff;
  font-size: 14px;
  margin-left: auto;
  font-weight: 500;
  box-shadow: 0px 2px 6px -1px rgba(0, 0, 0, 0.13);
  border: none;
  transition: all 0.3s ease;
  outline: 0;
}
.button-login {
  background-color: #b08bf8;
}
button:hover {
  transform: translateY(-3px);
  box-shadow: 0 2px 6px -1px rgba(182, 157, 230, 0.65);
}
button:hover:active {
  transform: scale(0.99);
}

.password-inp:not(:valid):not(:focus) + label + .icon {
  animation-name: shake-shake;
  animation-duration: 0.3s;
}
@keyframes shake-shake {
  0% {
    transform: translateX(-3px);
  }
  20% {
    transform: translateX(3px);
  }
  40% {
    transform: translateX(-3px);
  }
  60% {
    transform: translateX(3px);
  }
  80% {
    transform: translateX(-3px);
  }
  100% {
    transform: translateX(0px);
  }
}
</style>
