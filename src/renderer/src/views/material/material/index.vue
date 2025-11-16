<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="材料号" prop="materialCode">
        <el-input
          v-model="queryParams.materialCode"
          placeholder="请输入材料号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="位置" prop="location">
        <el-select v-model="queryParams.location" placeholder="请选择位置" clearable>
          <el-option
            v-for="dict in sys_location"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['material:material:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['material:material:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['material:material:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['material:material:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="materialList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />

      <el-table-column label="材料号" align="center" prop="materialCode" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="材料类型" align="center" prop="materialType" />
      <el-table-column label="位置" align="center" prop="location">
        <template #default="scope">
          <dict-tag :options="sys_location" :value="scope.row.location"/>
        </template>
      </el-table-column>
      <el-table-column label="数据库" align="center" prop="materialDb" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['material:material:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['material:material:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改材料管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="materialRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="材料号" prop="materialCode">
          <el-input v-model="form.materialCode" placeholder="请输入材料号" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-select v-model="form.location" placeholder="请选择位置">
            <el-option
              v-for="dict in sys_location"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="弹性模量" prop="elasticModulus">
          <el-input v-model="form.elasticModulus" placeholder="请输入弹性模量" />
        </el-form-item>
        <el-form-item label="泊松比" prop="poissonRatio">
          <el-input v-model="form.poissonRatio" placeholder="请输入泊松比" />
        </el-form-item>
        <el-form-item label="质量密度" prop="density">
          <el-input v-model="form.density" placeholder="请输入质量密度" />
        </el-form-item>
        <el-form-item label="比热" prop="specificHeat">
          <el-input v-model="form.specificHeat" placeholder="请输入比热" />
        </el-form-item>
        <el-form-item label="热传导率" prop="thermalConductivity">
          <el-input v-model="form.thermalConductivity" placeholder="请输入热传导率" />
        </el-form-item>
        <el-form-item label="阻尼比" prop="dampingRatio">
          <el-input v-model="form.dampingRatio" placeholder="请输入阻尼比" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Material">
import { listMaterial, getMaterial, delMaterial, addMaterial, updateMaterial } from "@/api/material/material";
import useProjectStore from "@/store/modules/project";

const { proxy } = getCurrentInstance();
const { sys_location } = proxy.useDict('sys_location');
const projectStore = useProjectStore();

const materialList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    materialCode: null,
    name: null,
    materialType: null,
    location: null,
    materialDb: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询材料管理列表 */
function getList() {
  loading.value = true;
  listMaterial({
    ...queryParams.value,
    projectId: projectStore.selectedProjectId
  }).then(response => {
    materialList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    materialCode: null,
    name: null,
    materialType: null,
    location: null,
    materialDb: null,
    elasticModulus: null,
    poissonRatio: null,
    density: null,
    specificHeat: null,
    thermalConductivity: null,
    dampingRatio: null,
    userId: null,
    projectId: null,
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("materialRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加材料管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getMaterial(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改材料管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["materialRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateMaterial({
          ...form.value,
          projectId: projectStore.selectedProjectId
        }).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addMaterial({
          ...form.value,
          projectId: projectStore.selectedProjectId
        }).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除材料管理编号为"' + _ids + '"的数据项？').then(function() {
    return delMaterial(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('material/material/export', {
    ...queryParams.value,
    projectId: projectStore.selectedProjectId
  }, `material_${new Date().getTime()}.xlsx`)
}

getList();
</script>
