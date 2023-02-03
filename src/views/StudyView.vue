<template>
    <div class="result-table-wrapper box">
        <table>
            <tr>
                <th>N°</th>
                <th>Nome</th>
                <th>Media Voti</th>
                <th>Numero voti</th>
            </tr>
            
        </table>
        <button @click="loadVotes()">Ricarica</button>
    </div>
</template>
  
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "StudyView",
    data: function () {
        return {
            
        };
    },
    components: {},
    created: async function () {
        
    },
    methods: {
        loadVotes: async function () {
            
        },
    },
});
</script>
  
  <style lang="scss">
.result-table-wrapper {
    margin: 1em;
    padding: 1em;
    display: inline-block;
}
table {
    text-align: left;
    color: white;
    margin: 1em auto;
    .cell-number {
        text-align: right;
    }
    th,
    td {
        border: 1px solid white;
        border-collapse: collapse;
        padding: 5px;
    }
}
button {
    font-size: 1em;
}
</style>