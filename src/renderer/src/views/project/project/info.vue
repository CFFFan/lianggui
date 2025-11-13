<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <span>项目详细信息</span>
      </template>
      <el-form ref="projectInfoRef" :model="form" :rules="rules" label-width="100px" v-loading="loading">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="桥梁名称" prop="bridgeName">
              <el-input v-model="form.bridgeName" placeholder="请输入桥梁名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="软件版本" prop="softwareVersion">
              <el-input v-model="form.softwareVersion" placeholder="请输入软件版本" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目名称" prop="projectName">
              <el-input v-model="form.projectName" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="桥梁位置" prop="bridgeLocation">
              <el-input v-model="form.bridgeLocation" placeholder="请输入桥梁位置" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="起点标号" prop="startMark">
              <el-input v-model="form.startMark" placeholder="请输入起点标号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="终点标号" prop="endMark">
              <el-input v-model="form.endMark" placeholder="请输入终点标号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设计单位" prop="designUnit">
              <el-input v-model="form.designUnit" placeholder="请输入设计单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="施工单位" prop="constructionUnit">
              <el-input v-model="form.constructionUnit" placeholder="请输入施工单位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设计日期" prop="designDate">
              <el-input v-model="form.designDate" placeholder="请输入设计日期" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设计人员" prop="designer">
              <el-input v-model="form.designer" placeholder="请输入设计人员" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="审核" prop="reviewer">
              <el-input v-model="form.reviewer" placeholder="请输入审核" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-space>
            <el-button type="primary" :loading="saving" @click="submitForm">保 存</el-button>
            <el-button @click="goBack">取消本次更改</el-button>
          </el-space>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="ProjectInfo">
import { computed, getCurrentInstance, reactive, ref, toRefs, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getProject, updateProject } from "@/api/project/project";
import useProjectStore from "@/store/modules/project";

const { proxy } = getCurrentInstance();
const router = useRouter();
const projectStore = useProjectStore();

const loading = ref(false);
const saving = ref(false);

const state = reactive({
  form: {
    id: null,
    bridgeName: "",
    softwareVersion: "",
    startMark: "",
    endMark: "",
    bridgeLocation: "",
    projectName: "",
    designDate: "",
    designer: "",
    reviewer: "",
    designUnit: "",
    constructionUnit: "",
    remark: ""
  },
  rules: {
    bridgeName: [
      { required: true, message: "桥梁名称不能为空", trigger: "blur" }
    ]
  }
});

const { form, rules } = toRefs(state);

const projectId = computed(() => projectStore.selectedProjectId);

async function fetchProjectDetail(id) {
  if (!id) {
    proxy.$modal?.msgError?.("请先选择项目");
    router.push({ path: "/project-entry" });
    return;
  }
  loading.value = true;
  try {
    const { data } = await getProject(id);
    Object.assign(form.value, data || {});
  } finally {
    loading.value = false;
  }
}

function submitForm() {
  proxy.$refs.projectInfoRef.validate(async valid => {
    if (!valid) {
      return;
    }
    saving.value = true;
    try {
      await updateProject(form.value);
      proxy.$modal?.msgSuccess?.("保存成功");
    } finally {
      saving.value = false;
    }
  });
}

function goBack() {
  fetchProjectDetail(projectId.value);
}

watch(projectId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchProjectDetail(newId);
  }
});

onMounted(() => {
  fetchProjectDetail(projectId.value);
});
</script>

