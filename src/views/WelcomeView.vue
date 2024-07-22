<template>
  <div class="onboarding-background" :style="{ backgroundImage: `url(${settings.themeSettings?.backgroundImg})` }">
  </div>
  <div class="onboarding">
    <v-card class="onboarding-card d-flex flex-column" max-width="90%" width="1000" height="700" max-height="90%">

      <v-spacer />

      <v-window v-model="step" class="card-window">

        <v-window-item :value="1" class="card-window-item">
          <div class="windows-content card-welcome">
            <v-img class="mb-4" width="128px" src="/images/logo.png" contain></v-img>
            <h3 class="text-h5 font-weight-light mb-2">{{ $t("welcome.welcome") }}</h3>
            <span class="text-caption text-grey">{{ $t("welcome.thanks") }}</span>

            <v-text-field :label="$t('welcome.username')" class="mt-10 username-input" prefix="@"
              v-model="userInfo.username" :rules="[(v: string) => !!v || 'Username is required']" loading>
              <template v-slot:loader>
                <v-progress-linear :active="true"
                  :color="(usernameValidLoading || usernameValid) && !!userInfo.username ? 'success' : 'error'"
                  :model-value="100" height="4"
                  :indeterminate="usernameValidLoading && !!userInfo.username"></v-progress-linear>
              </template>
            </v-text-field>
          </div>
        </v-window-item>

        <v-window-item :value="2" class="card-window-item">
          <div class="windows-content card-uni pa-10">
            <h3 class="text-h5 font-weight-light my-6">{{ $t("welcome.tellus") }}</h3>
            <v-combobox class="uni-input my-5" :label="$t('welcome.uni')" hide-details clearable :items="universities"
              item-title="name" data
              @update:modelValue="(e: DataUniversity) => { userInfo.university = e.id; selectedUni = e }" />
            <v-combobox class="uni-input my-5" :label="$t('welcome.course')" :disabled="!userInfo.university"
              hide-details clearable :items="selectedUni?.courses" item-title="name"
              @update:modelValue="(e: any) => { userInfo.course = e.code }" />

          </div>
        </v-window-item>

        <v-window-item :value="3" class="card-window-item card-window-exams">
          <div class="windows-content card-exams pa-10">
            <!-- <v-list :items="exams"></v-list> -->
            <h3 class="text-h5 font-weight-light my-6">{{ $t("welcome.exams") }}</h3>
            <v-text-field :label="$t('search')" clearable hide-details prepend-inner-icon="mdi-magnify"
              class="mb-6 search-bar" v-model="searchExam" />

            <div class="el-dio-porco">

              <v-list class="exam-list">
                <div v-for="(item, i) in filteredExams()" :key="i">
                  <v-list-item v-if="!item.type" :value="i" color="primary" :active="item.active"
                    @click="item.active = !item.active; addExamToUser(item)" :title="item.title" />
                  <v-list-subheader v-else-if="item.type == 'subheader'" v-text="item.title" />
                  <v-divider v-else-if="item.type == 'divider'" />
                </div>
                <div v-if="searchExam">
                  <v-divider />
                  <v-list-subheader>Add a custom exam:</v-list-subheader>
                  <v-list-item :title="searchExam" @click="addCustomExam(searchExam)" />
                </div>
              </v-list>

              <v-list class="exam-list selected">
                <v-list-subheader>Your exams</v-list-subheader>
                <v-list-item v-for="(item, i) in selectedExams" :key="i" :value="i" :title="item.name"
                  :subtitle="item.info">
                  <template v-slot:append><v-btn icon="mdi-close" variant="text"
                      @click="removeExam(i, item.code)" /></template>
                </v-list-item>
              </v-list>

            </div>
          </div>
        </v-window-item>

      </v-window>

      <v-spacer />

      <v-card-actions class="pa-8">
        <v-btn v-if="step == 1" size="large" variant="plain" @click="step--">{{ $t("welcome.skip") }}</v-btn>
        <v-btn v-if="step > 1" size="large" variant="text" @click="step--">{{ $t("back") }}</v-btn>
        <v-spacer></v-spacer>
        <v-btn v-if="step == 1" size="large" color="primary" variant="flat" @click="step++"
          :disabled="usernameValidLoading || !usernameValid">{{ $t("welcome.start") }}</v-btn>
        <v-btn v-if="step == 2" size="large" color="primary" variant="flat" :disabled="!userInfo.course"
          @click="step++; loadExams()">{{ $t("next") }}</v-btn>
        <v-btn v-if="step == 3" size="large" color="secondary" variant="flat" @click="saveOnboarding()">{{
          $t("welcome.startNow")
          }}</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useSettingsStore } from "@/stores/settings";
import { useUsersAPIStore, type UserOnboarding } from "@/stores/api/users";
import { useDataAPIStore, type DataUniversity, type DataCourse } from "@/stores/api/data";

type ListItem = {
  type?: 'subheader' | 'divider';
  title?: string;
  value?: string;
  active?: boolean;
  custom?: boolean;
  info?: string;
}


const settings = useSettingsStore();
const usersAPI = useUsersAPIStore();
const dataAPI = useDataAPIStore();

const step = ref(1);

const userInfo = ref<UserOnboarding>({
  username: 'pippo',
  university: null,
  course: null,
  exams: [],
})
const selectedExams = ref<{ name: string, code: string, info: string }[]>([]);
const usernameValidLoading = ref(false);
const usernameValid = ref(true);

const universities = ref<DataUniversity[]>([]);
const selectedUni = ref<DataUniversity | null>(null);

async function loadUniData() {
  universities.value = await dataAPI.getUniversities();
}
loadUniData();

const searchExam = ref('');
const exams = ref<ListItem[]>([])
const customExams = ref<ListItem[]>([])

async function loadExams() {
  if (!userInfo.value.course) return;
  const course = await dataAPI.getCourse(userInfo.value.course ?? '');
  const courseExams = course.exams.sort((a, b) => a.year - b.year);

  let currYear = courseExams[0].year;
  exams.value.push({ type: 'subheader', title: `Year ${currYear}` });

  for (const e of courseExams) {
    if (e.year !== currYear) {
      currYear = e.year;
      exams.value.push({ type: 'divider' });
      exams.value.push({ type: 'subheader', title: `Year ${currYear}` });
    }
    exams.value.push({ title: e.title, value: e.id, info: `Year ${e.year}` });
  }
}

const allExams = computed(() => [...customExams.value, ...exams.value]);

function addExamToUser(exam: ListItem) {
  if (!exam.title || !exam.value) return;
  const atIndex = selectedExams.value.findIndex((e) => e.code === exam.value);
  if (atIndex >= 0) selectedExams.value.splice(atIndex, 1);
  else selectedExams.value.push({ name: exam.title, code: exam.value, info: exam.info ?? '' });
}

function addCustomExam(name: string) {
  if (customExams.value.length === 0) {
    customExams.value.push({ type: 'subheader', title: 'Custom exams' });
  }
  const exam = { title: name, value: `custom-${customExams.value.length - 1}`, custom: true, active: true };
  customExams.value.push(exam);
  addExamToUser(exam);
  searchExam.value = '';
}

function filteredExams() {
  if (!searchExam.value) return allExams.value;
  return allExams.value.filter((e) =>
    e.type ||
    !e.title ||
    (e.title.toLowerCase().includes(searchExam.value.toLowerCase()))
  );
}

function removeExam(i: number, code: string) {
  selectedExams.value.splice(i, 1);
  customExams.value = customExams.value.filter((e) => e.value !== code);
  if (customExams.value.length === 1) customExams.value = [];

  const exam = exams.value.find((e) => e.value === code);
  if (exam) exam.active = false;
}


watch(() => userInfo.value.username, async (newUser) => checkUsername(newUser));

async function checkUsername(username: string) {
  usernameValidLoading.value = true;
  usernameValid.value = await usersAPI.checkUsername(username);
  usernameValidLoading.value = false;
}

async function saveOnboarding() {
  userInfo.value.exams = selectedExams.value.map((e) => e.code);
  await usersAPI.saveOnboarding(userInfo.value);
}
</script>

<style scoped lang="scss">
.onboarding-background {
  position: fixed;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  z-index: -1;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  filter: blur(20px);
  -webkit-filter: blur(20px);
  opacity: 0.7;
}

.onboarding {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.card-window {
  ::v-deep(.v-window__container) {
    height: 100%;
  }

  .card-window-item {
    height: 100%;
  }
}

.windows-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  &.card-welcome {
    .username-input {
      width: 15rem;
    }
  }

  &.card-uni {
    .uni-input {
      max-width: 100%;
      width: 30rem;
    }
  }

  &.card-exams {
    >* {
      width: 100%;

    }

    .el-dio-porco {
      overflow: auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }
}
</style>
