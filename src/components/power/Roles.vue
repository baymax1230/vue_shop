<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addTableVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 角色列表 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环 嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      closable
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

            <!-- <pre>
              {{scope.row}}
            </pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showRoleDilog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="remoVeeditor(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addTableVisible"
      width="50%"
      @close="roleDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form
        :model="roleForm"
        :rules="addFormRules"
        ref="roleFormRef"
        label-width="80px"
        status-icon
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      @close="editortDialogClosed"
      title="修改角色"
      :visible.sync="editortDialogVisible"
      width="50%"
    >
      <el-form
        :model="editorForm"
        :rules="editorFormRules"
        ref="editorRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editorForm.roleName"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" porp="roleDesc">
          <el-input v-model="editorForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editorDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editorInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="权限分配"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close='setRightDialogClosed'
    >
     <!-- 树形控件 -->
     <el-tree 
     :data=" 
     rightsList" 
     :props="treeProps" 
     default-expand-all 
     node-key='id' 
     show-checkbox 
     :default-checked-keys='defKeys'
     ref="treeRef"
     ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色的列表数据
      rolelist: [],
      addTableVisible: false,
      roleForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },

          {
            min: 3,
            max: 10,
            message: '用户名长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        rolesDesc: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ]
      },
      editorForm: {},
      editortDialogVisible: false,
      editorFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },

          {
            min: 3,
            max: 10,
            message: '用户名长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        rolesDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
    //   控制分配权限对话框
      setRightDialogVisible:false,
    //   所有权限的数据
      rightsList:[],
      treeProps:{
          label:'authName',
          children:'children'
      },
    //   默认选中的节点Id值数组
      defKeys:[],
    //   当前即将分配角色权限的角色id
      roleId:''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolelist = res.data

      //   this.$message.succes('获取角色列表成功')
    },
    roleDialogClosed() {
      this.$refs.roleFormRef.resetFields()
    },
    addRole() {
      this.$refs.roleFormRef.validate(async vaild => {
        if (!vaild) return

        const { data: res } = await this.$http.post('roles', this.roleForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 隐藏用户对话框
        ;(this.addTableVisible = false),
          // 重新获取用户列表数据
          this.getRolesList()
      })
    },
    //    展示编辑角色的对话框
    async showRoleDilog(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)

      if (res.meta.status !== 200) {
        this.$message.error('查询角色信息失败')
      }
      this.editorForm = res.data
      this.editortDialogVisible = true
    },
    editortDialogClosed() {
      this.$refs.editorRef.resetFields()
    },
    // 修改角色并提交
    editorInfo() {
      this.$refs.editorRef.validate(async vaild => {
        console.log(vaild)
        if (!vaild) return
        const { data: res } = await this.$http.put(
          `roles/${this.editorForm.roleId}`,
          {
            roleName: this.editorForm.roleName,
            roleDesc: this.editorForm.roleDesc
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('更新失败')
        }
        this.editortDialogVisible = false
        this.getRolesList()
        this.$message.success('更新成功')
      })
    },
    async remoVeeditor(id) {
      const comfirmeditor = await this.$confirm(
        '此操作将永久删除角色，是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (comfirmeditor !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      this.getRolesList()
    },
    // 根据Id删除对应的权限
    async removeRightById(role, rightsId) {
      //   弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightsId}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error('权限删除失败')
      }
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
        this.roleId = role.id
        // 获取所有权限的数据
     const {data:res} = await  this.$http.get('rights/tree')
     if(res.meta.status !== 200){
         this.$message.error('获取权限数据失败')
     }
        this.rightsList = res.data
        console.log(this.rightsList);
        this.getLeafkeys(role,this.defKeys)
        this.setRightDialogVisible = true
     
    },
    // 通过递归的形式，获取角色下所有三级权限的id并保存到defKefs数组中
    getLeafkeys(node,arr){
        if(!node.children){
            return arr.push(node.id)
        }

        node.children.forEach(item =>
        this.getLeafkeys(item,arr))
    },
    setRightDialogClosed(){
        this.defKeys = []
    },
    // 点击为角色分配权限
   async allotRights(){
        const keys = [
              ...this.$refs.treeRef.getCheckedKeys(),
               ...this.$refs.treeRef.getHalfCheckedNodes(),
        ]
      console.log(keys);

      const idStr = keys.join(',')

     const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})

     if (res.meta.status !== 200) {
         return this.$message.error('分配权限失败')
     }
     this.$message.success('分配权限成功')
     this.getRolesList()
     this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 10px;
}

.el-table-column {
  margin-left: 40px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
