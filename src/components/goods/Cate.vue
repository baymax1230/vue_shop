<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCate">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        index-text="#"
        show-index
        :selection-type="false"
        :expand-type="false"
        :data="catelist"
        :columns="columns"
        border
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            style="color:lightgreen"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="showCate(scope.row.cat_id)"
            
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="removeCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加商品"
      :visible.sync="addCateDialogVisible"
      @close="addCateDialogClosed"
      width="50%"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        label-width="100px"
        ref="addCateRef"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类">
          <!-- options用来指定数据源 -->
          <!-- props用来指定对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="casCateProps"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addSureCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="showCatedialogVisible"
      width="30%"
      @cole='showCatedialogColsed'
    >
     <el-form
        :model='CateForm'
        :rules='CateFormRules'
        label-width="80px"
        ref="CateFormRef"
      >
        <el-form-item label="分类名称" prop='cat_name'>
          <el-input v-model="CateForm.cat_name"></el-input>
        </el-form-item>
     </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="showCated"
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
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 数据分类的列表，默认为空
      catelist: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',

          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          prop: '',
          type: 'template',
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类表单数据对象
      addCateForm: {
        // 将要添加分类的名称
        cat_name: '',
        cat_id: 0,
        // 默认等级要添加的分类一级分类
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      casCateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      //  选中的父级分类的Id数组
      selectedKeys: [],
      showCatedialogVisible:false,
      CateForm:{},
      CateFormRules:{
         cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCategoriesList()
  },
  methods: {
    async getCategoriesList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品数据失败')
      }
      // 数据列表
      this.catelist = res.data.result
      //  总数据条数
      this.total = res.data.total
    },
    // 监听page-size
    handleSizeChange(newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getCategoriesList()
    },
    // 监听page-named的值
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getCategoriesList()
    },
    addCate() {
      this.getParentCateList()
      // 先获取父级分类列表
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败')
      }
      this.parentCateList = res.data
      console.log(this.parentCateList)
    },
    parentCateChange() {
      console.log(this.selectedKeys)
      // 如果selectkeys 数组中的length 大于0 证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]

        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0

        this.addCateForm.cat_level = 0
      }
    },
    //  点击按钮，添加新的分类
    addSureCate() {
      this.$refs.addCateRef.validate(async valid => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }

        this.$message.success('添加成功')
        this.getCategoriesList()
        this.addCateDialogVisible = false
      })
    },
    addCateDialogClosed() {
      this.$refs.addCateRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_level = 0
    },
    async removeCate(id) {
      const comfirmCate = await this.$confirm(
        '此操作将永久删除角色，是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (comfirmCate !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      this.getCategoriesList()
    },
    async showCate(id) {
      console.log(id);
      const { data: res } = await this.$http.get(`categories/${id}`)
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('用户编辑失败')
      }
      this. CateForm = res.data
      this.showCatedialogVisible = true
    },
    showCatedialogColsed(){
      this.$refs.CateFormRef.resetFields()
    },
   showCated(){
     this.$refs.CateFormRef.validate(async valid =>{
        if(!valid) return
          const {data:res} = await this.$http.put(`categories/${this.CateForm.cat_id}`,{
            cat_name:this.CateForm.cat_name
          })
      if (res.meta.status !== 200) {
         return this.$message.error('分类名称编辑失败')
      }
      this.showCatedialogVisible = false
      // this.getCategoriesList()
      this.$message.success('分类名称编辑成功')
      
     })
    

    },
  }
}
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
.el-pagination {
  margin-top: 20px;
}
.el-cascader {
  width: 100%;
}
</style>
