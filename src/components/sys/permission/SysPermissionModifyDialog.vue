<template>
  <el-dialog :title="title" :visible.sync="visible" @open="open" @closed="closed" width="600px">
    <el-form ref="form" v-loading="loading" :model="form" :rules="rules" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="上级目录" prop="parentId">
            <tree-select v-model="form.parentId" :options="permissionOptions" :show-count="true" placeholder="选择上级目录"/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="类型" prop="type">
            <el-radio-group v-model="form.type">
              <el-radio
                v-for="type in typeOptions"
                :key="type.value"
                :label="type.name"
              >{{type.text}}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item v-if="form.type === 'MENU'" label="图标">
            <el-popover placement="bottom-start" width="460" trigger="click" @show="$refs['iconSelect'].reset()">
              <common-icon-select ref="iconSelect" @selected="selected"/>
              <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" readonly>
                <svg-icon
                  v-if="form.icon"
                  slot="prefix"
                  :icon-class="form.icon"
                  class="el-input__icon"
                  style="height: 32px;width: 16px;"
                />
                <i v-else slot="prefix" class="el-icon-search el-input__icon"/>
              </el-input>
            </el-popover>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="权限名称" prop="name">
            <el-input v-model.trim="form.name" placeholder="请输入权限名称"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="form.sort" controls-position="right" :min="0"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.type === 'MENU'" label="路由地址" prop="path">
            <el-input v-model.trim="form.path" placeholder="请输入路由地址"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.type === 'MENU'" label="组件路径" prop="component">
            <el-input v-model.trim="form.component" placeholder="请输入组件路径"/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="权限标识">
            <el-input v-model.trim="form.permission" placeholder="请权限标识" maxlength="50"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="status in statusOptions"
                :key="status.value"
                :label="status.name"
              >{{status.text}}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.type === 'MENU'" label="是否外链" prop="frameFlag">
            <el-radio-group v-model="form.frameFlag">
              <el-radio
                v-for="frameFlag in frameFlagOptions"
                :key="frameFlag.value"
                :label="frameFlag.value"
              >{{frameFlag.text}}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closed">关 闭</el-button>
      <el-button type="primary" :loading="button.save" @click="handleSave">保 存</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import mixin from '@/mixin'
  import TreeSelect from '@riophae/vue-treeselect'
  import '@riophae/vue-treeselect/dist/vue-treeselect.css'
  import CommonIconSelect from '@/components/common/IconSelect'
  import { sysPermissionFrameFlagEnum, sysPermissionStatusEnum, sysPermissionTypeEnum } from '@/utils/enum'
  import { treePermissions, getPermission, savePermission, updatePermission } from '@/api/sys/permission'

  export default {
    name: 'SysPermissionModifyDialog',
    components: { TreeSelect, CommonIconSelect },
    mixins: [
      mixin.visible,
      mixin.button
    ],
    props: {
      title: {
        type: String,
        required: true
      },
      id: {
        type: [String, Number],
        required: true
      },
      parentId: {
        type: [String, Number]
      }
    },
    data() {
      return {
        // 遮罩层
        loading: false,
        // 表单参数
        form: this.initForm(),
        // 表单校验
        rules: {
          parentId: [
            { required: true, message: '清选择上级目录', trigger: 'blur' }
          ],
          type: [
            { required: true, message: '请选择类型', trigger: 'change' }
          ],
          name: [
            { required: true, message: '权限名称不能为空', trigger: 'blur' }
          ],
          sort: [
            { required: true, message: '排序不能为空', trigger: 'blur' }
          ],
          path: [
            { required: true, message: '路由地址不能为空', trigger: 'blur' }
          ],
          status: [
            { required: true, message: '请选择状态', trigger: 'change' }
          ],
          frameFlag: [
            { required: true, message: '请选择是否外链', trigger: 'change' }
          ]
        },
        // 权限树选项
        permissionOptions: [],
        // 类型选项
        typeOptions: sysPermissionTypeEnum,
        // 状态选项
        statusOptions: sysPermissionStatusEnum,
        // 是否外链选项
        frameFlagOptions: sysPermissionFrameFlagEnum
      }
    },
    methods: {
      // 选择图标
      selected(name) {
        this.form.icon = name
      },
      // 初始化表单
      initForm() {
        this.resetForm('form')
        return {
          name: '',
          parentId: 0,
          type: 'MENU',
          path: '',
          component: '',
          permission: '',
          icon: '',
          sort: 99,
          status: 'ENABLE',
          frameFlag: false
        }
      },
      // 打开弹出层
      open() {
        this.loading = true
        treePermissions().then(res => {
          // 初始化树形结构系统权限列表
          this.permissionOptions = []
          const permission = { id: 0, label: '主类目', children: [] }
          permission.children = res.data
          this.permissionOptions.push(permission)
          if (this.id) {
            // 查询系统权限信息
            getPermission(this.id).then(res => {
              this.form = res.data
              this.form.type = res.data.type.name
              this.form.status = res.data.status.name
            })
          } else {
            if (this.parentId) {
              this.form.parentId = this.parentId
            }
          }
        }).catch(() => {
          this.form = this.initForm()
        }).then(() => {
          this.loading = false
        })
      },
      // 关闭弹出层
      closed() {
        this.$refs.form.clearValidate()
        this.$emit('input', false)
        this.$emit('closed')
        this.form = this.initForm()
      },
      // 保存按钮操作
      handleSave() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            this.button.save = true
            if (this.id) {
              updatePermission(this.id, this.form).then(res => {
                this.msgSuccess('修改成功')
                this.closed()
                this.$emit('success')
              }).catch(() => {
              }).then(() => {
                this.clearButtonStatus()
              })
            } else {
              savePermission(this.form).then(res => {
                this.msgSuccess('新增成功')
                this.closed()
                this.$emit('success')
              }).catch(() => {
              }).then(() => {
                this.clearButtonStatus()
              })
            }
          }
        })
      }
    }
  }
</script>
