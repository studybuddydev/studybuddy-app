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
            <div class="tile-selector-wrapper">
              <h4 class="text-h6 font-weight-light mt-2">{{ $t("welcome.uni") }}</h4>
              <div class="tile-selector">
                <div :class="`pa-5 ${userInfo.university !== uni.id ? 'bg-background' : 'bg-primary'}`"
                  v-for="uni in [...universities, { id: '', name: 'Other', courses: [] }]" :key="uni.id" v-ripple
                  @click="selectUni(uni)">
                  {{ uni.name }}
                </div>
              </div>
            </div>

            <div v-if="userInfo.university === ''">

              <v-text-field class="uni-input my-5" label="University name" hide-details clearable
                v-model="userInfo.customUniversity" />
              <v-text-field class="uni-input my-5" label="Course name" hide-details clearable
                v-model="userInfo.customCourse" />

            </div>

            <div class="tile-selector-wrapper" v-else-if="userInfo.university">
              <h4 class="text-h6 font-weight-light mt-2">{{ $t("welcome.course") }}</h4>
              <div class="tile-selector">
                <div :class="`pa-5 ${selectedCourseType !== type.value ? 'bg-background' : 'bg-primary'}`"
                  v-for="type in courseTypes" :key="type.value" v-ripple @click="selectType(type.value)">
                  {{ type.title }}
                </div>
              </div>
              
              <v-combobox class="uni-input my-5" :label="$t('welcome.course')"
                  :disabled="!selectedCourseType" hide-details clearable
                  :items="selectedUniCourses?.filter(c => c.type === selectedCourseType)"
                  item-title="name" item-value="id" :return-object="false"
                  v-model="userInfo.course"
                />
            </div>
          </div>
        </v-window-item>

        <v-window-item :value="3" class="card-window-item card-window-exams">

          <div class="windows-content card-exams pa-10">
            <!-- <v-list :items="exams"></v-list> -->
            <h3 class="text-h5 font-weight-light my-6">{{ $t("welcome.exams") }}</h3>
            <v-text-field v-if="!isOnlyCustomExams" :label="$t('search')" clearable hide-details prepend-inner-icon="mdi-magnify"
              class="mb-6 search-bar" v-model="searchExam" />
            <v-text-field v-else label="Add exam" hide-details
              class="mb-6 search-bar" v-model="searchExam" append-icon="mdi-send"
              @click:append="addCustomExam(searchExam)"
              @keydown.enter="addCustomExam(searchExam)" />

            <div :class="`list-wrapper ${!isOnlyCustomExams ? 'list-wrapper-double' : 'list-wrapper-single'}`">

              <v-list class="exam-list" v-if="!isOnlyCustomExams">
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
        <v-btn v-if="step == 1" size="large" variant="plain" @click="saveOnboardingOnSkip()">{{ $t("welcome.skip")
          }}</v-btn>
        <v-btn v-if="step > 1" size="large" variant="text" @click="step--">{{ $t("back") }}</v-btn>
        <v-spacer></v-spacer>
        <v-btn v-if="step == 1" size="large" color="primary" variant="flat" @click="step++"
          :disabled="usernameValidLoading || !usernameValid">{{ $t("welcome.start") }}</v-btn>
        <v-btn v-if="step == 2" size="large" color="primary" variant="flat" :disabled="!(userInfo.course || userInfo.customUniversity)"
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
import { useDataAPIStore, useUsersAPIStore, type UserOnboarding } from "@/stores/api";
import { debounce } from '../utils/common';
import { useAuth0 } from "@auth0/auth0-vue";
import { useRouter } from 'vue-router'
import * as DBO from '@/types/dbo';

const { user, isLoading } = useAuth0();
const router = useRouter()
const step = ref(1);
const settings = useSettingsStore();
const apiData = useDataAPIStore();
const apiUsers = useUsersAPIStore();

const userInfo = ref<UserOnboarding>({
  username: '',
})
async function loadData() {
  userInfo.value.username = await apiUsers.generateUsername(user.value?.nickname)
  usernameValidLoading.value = false;
  universities.value = await apiData.getUniversities();
}
if (isLoading.value)
  watch(isLoading, (loading) => !loading && loadData());
else
  loadData();

// ----- STEP 1
const usernameValidLoading = ref(true);
const usernameValid = ref(true);
watch(() => userInfo.value.username, async (newUser) => checkUsername(newUser));
function isUsernameValid(username: string) {
  return !(!/^[a-z0-9_]+$/.test(username));
}
async function checkUsername(username: string) {
  usernameValidLoading.value = true;

  if (!isUsernameValid(username)
    || username.length < 3
    || username.length > 30
  ) {
    usernameValid.value = false;
    usernameValidLoading.value = false;
    return;
  }

  debounce('checkUsername', async () => {
    usernameValid.value = await apiUsers.checkUsername(username);
    usernameValidLoading.value = false;
  }, 500);
}

type ListItem = {
  type?: 'subheader' | 'divider';
  title?: string;
  value?: string;
  active?: boolean;
  custom?: boolean;
  info?: string;
}

// ----- STEP 2
const universities = ref<DBO.DataUniversityLiteDBO[]>([]);
const selectedUni = ref<DBO.DataUniversityLiteDBO | null>(null);
const selectedUniCourses = ref<DBO.DataCourseLiteDBO[]>([]);
const courseTypes = [{ value: 'triennale', title: 'Triennale' }, { value: 'magistrale', title: 'Magistrale' }, { value: 'cicloUnico', title: 'Ciclo Unico' }]
const selectedCourseType = ref<string | null>(null);

async function selectUni(uni: DBO.DataUniversityLiteDBO) {
  if (selectedUni.value === uni) {
    return;
  }
  selectedUni.value = uni;
  userInfo.value.university = uni.id;
  delete userInfo.value.customUniversity;
  delete userInfo.value.customCourse;
  delete userInfo.value.exams;
  selectedExams.value = [];
  selectType(null);

  if (!uni.id) {
    selectedUniCourses.value = [];
    return;
  }
  apiData.getCoursesByUniversity(uni.id).then((courses) => {
    selectedUniCourses.value = courses;
  });
}

function selectType(type: string | null) {
  if (type && selectedCourseType.value === type) {
    return;
  }
  selectedCourseType.value = type;
  delete userInfo.value.course;
  delete userInfo.value.exams;
  selectedExams.value = [];
}

// ----- STEP 3
const selectedExams = ref<{ name: string, code: string, info: string }[]>([]);
const searchExam = ref('');
const exams = ref<ListItem[]>([])
const customExams = ref<ListItem[]>([])
const allExams = computed(() => [...customExams.value, ...exams.value]);
const isOnlyCustomExams = computed(() => !userInfo.value.course || exams.value.length === 0);

async function loadExams() {
  exams.value = []
  customExams.value = []
  if (!userInfo.value.course) return;
  const courseExams = (await apiData.getCourseExams(userInfo.value.course ?? '')).sort((a, b) => +(a.year ?? 0) - +(b.year ?? 0));

  let currYear = courseExams[0].year;
  exams.value.push({ type: 'subheader', title: `Year ${currYear}` });

  for (const e of courseExams) {
    if (e.year !== currYear) {
      currYear = e.year;
      exams.value.push({ type: 'divider' });
      exams.value.push({ type: 'subheader', title: `Year ${currYear}` });
    }
    exams.value.push({ title: e.name, value: e.id, info: `Year ${e.year}` });
  }
}

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

async function saveOnboarding() {
  userInfo.value.exams = selectedExams.value.map((e) => e.code);
  await apiUsers.saveOnboarding(userInfo.value);
  router.push('/')
}

async function saveOnboardingOnSkip() {
  await apiUsers.saveOnboarding({ username: userInfo.value.username });
  router.push('/')
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

    .tile-selector-wrapper {

      .tile-selector {
        display: flex;
        gap: 1rem;
        margin: 1rem;

        > div {
          border-radius: 1rem;
          cursor: pointer;
          border: 1px solid rgb(var(--v-theme-primary));
          text-align: center;
          width: 8rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
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

    .list-wrapper {
      overflow: auto;
      display: grid;
      grid-template-columns: 1fr 1fr;

      &.list-wrapper-single {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
