<template>
    <v-container>
        <v-row>
            <v-col cols="3">
                <!-- Your small left column content goes here -->
                <v-list dense>
                    <v-list-item
                        v-for="topic in topics"
                        :key="topic.text"
                        @click="selectTopic(topic)"
                        >{{ topic.text }}</v-list-item
                    >
                </v-list>
            </v-col>
            <v-col cols="9">
                <!-- Your large right column content goes here -->
                <div v-if="selectedTopic">
                    {{ selectedTopic.text }}
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>
  
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "StudyView",
    data: function () {
        return {
            topics: [
                { text: "Topic 1" },
                { text: "Topic 2" },
                // ...
            ],
            selectedTopic: null,
        };
    },
    components: {},
    created: async function () {},
    methods: {
        loadVotes: async function () {},
        selectTopic: function (topic: any) {
            this.selectedTopic = topic;
        },
     
    },
    onMounted: async function () {},
});
</script>
  
<style lang="scss">
</style>