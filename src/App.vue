<template>
    <v-app id="inspire">
        <v-navigation-drawer permanent>
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

        <v-main> </v-main>
    </v-app>
</template>


<script lang="ts">
import { defineComponent, ref, watch, onMounted } from "vue";

type Exam = {
    text: string;
    icon: string;
};

const newExamListElement = ref(null);
console.log(newExamListElement);

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

<style lang="scss">
.main {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #207178;
    //background-image: url("/background.jpg");
}
.wrapper {
    background-color: rgb(18, 69, 74);
    backdrop-filter: blur(5px);
    padding: 1.5em 4em;
    border-radius: 1em;
    border: 3px solid white;
}
h2,
h1,
h3,
p {
    text-align: center;
}
h1 {
    font-size: 4em;
}
h2 {
    font-size: 2em;
}
p {
    border-top: 1px solid white;
    margin-top: 2em;
    padding: 2em;
    font-size: 1.5em;
}
</style>