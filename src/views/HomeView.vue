<template>

<v-navigation-drawer permanent >
            <template v-slot:prepend>
                <!--add logo img -->
                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title class="title">
                            <img
                                src="/images/logotxt.png"
                                alt="Studubuddy logo"
                                height="50">
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </template>

            <v-divider></v-divider>

            <v-list nav density="compact">
                <v-list-item
                    v-for="exam in exams"
                    link
                    :key="exam.text"
                    :to="`/exam?name=${exam.text}`"
                    :prepend-icon="exam.icon"
                    :title="exam.text"
                    :value="exam.text"
                />


                <v-dialog v-model="dialog" width="auto">
                    <v-sheet width="300" class="mx-auto">
                        <v-form @submit.prevent>
                            <v-text-field
                                v-model="examName"
                                :rules="rules"
                                label="Exam name"
                            ></v-text-field>
                            <v-btn
                                type="submit"
                                @click="addExam"
                                block
                                class="mt-2"
                                >Confirm</v-btn
                            >
                        </v-form>
                    </v-sheet>
                </v-dialog>
                <v-btn color="primary" width="100%" @click="dialog = true"
                    >Add new exam</v-btn
                >
            </v-list>

            <template v-slot:append>
                <v-list-item
                    lines="two"
                    prepend-avatar="https://randomuser.me/api/portraits/women/81.jpg"
                    title="Jane Smith"
                    subtitle="Logged in"
                ></v-list-item>
            </template>
        </v-navigation-drawer>
        <v-calendar
            class="custom-calendar max-w-full"
            disable-page-swipe
            is-expanded
            is-dark
        ></v-calendar>
            

</template>

<script lang="ts">
    import { defineComponent, ref, watch, onMounted } from "vue";

    type Exam = {
        text: string;
        icon: string;
    };
    export default defineComponent({
    name: "App",
    data: () => ({
        drawer: false,
        diocane: "ciao",
        exams: [
            { text: "Matematica", icon: "mdi-math-integral" },
            { text: "Fisica", icon: "mdi-cube" },
            { text: "Informatica", icon: "mdi-laptop" },
        ] as Exam[],
        editingExam: null as Exam | null,
        dialog: false,
        examName: "",
        rules: [(v: string) => !!v || "Exam name is required"],
    }),
    mounted() {
        
    },
    methods: {
        addExam() {
            this.exams.push({ text: this.examName, icon: "mdi-math-integral"});
            this.examName = "";
            this.dialog = false;
        },
    },
});

</script>

<style lang="ts">

</style>