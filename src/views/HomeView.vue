<template>
    <v-navigation-drawer permanent>
        <template v-slot:prepend>
            <!--add logo img -->
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title class="title">
                        <img
                            src="/images/logotxt.png"
                            alt="Studubuddy logo"
                            height="50"
                        />
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
                        <v-btn type="submit" @click="addExam" block class="mt-2"
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
                    prepend-avatar="/images/pippo.webp"
                    title="Pippo"
                    subtitle="Logged in"
                ></v-list-item>
        </template>
    </v-navigation-drawer>

    
        <v-date-picker 
        class="custom-calendar max-w-full"
        disable-page-swipe
        is-expanded
        is-dark
        v-model="date"
        :attributes="attributes"
        />
    

            

</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from "vue";

// new date 20 feb 2023
const newDate = new Date(2023, 1, 20);

type Exam = {
    text: string;
    icon: string;
    deadline?: Date;
};
export default defineComponent({
    name: "App",
    data: () => ({
        drawer: false,
        date: new Date(),
        diocane: "ciao",
        exams: [
            { text: "Matematica", icon: "mdi-math-integral", deadline:  new Date(2023, 1, 20) },
            { text: "Fisica", icon: "mdi-cube", deadline:  new Date(2023, 1, 15) },
            { text: "Informatica", icon: "mdi-laptop", deadline:  new Date(2023, 1, 17) },
        ] as Exam[],
        editingExam: null as Exam | null,
        dialog: false,
        examName: "",
        rules: [(v: string) => !!v || "Exam name is required"],
        attributes:[
            { key: "fisica", highlight: true,dates: [new Date(2023,1,20)], popover: {} }
        ] 
    }),
    mounted() {},
    methods: {
        addExam() {
            this.exams.push({ text: this.examName, icon: "mdi-math-integral" });
            this.examName = "";
            this.dialog = false;
        },
    },
});
</script>

<style lang="ts">
</style>