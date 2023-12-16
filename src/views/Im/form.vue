<template>
    <div style="width: 100%; height: 100vh; margin: auto;">
      <iframe src="https://localhost:9004/conversations" style="width: 100%; height: 100vh; margin: auto;"></iframe>
    </div>
  </template>
  
  <script>
   
    export default {
      data() {
        return {
          friends: [],
          groups: [],
          profile: {
            friend: null,
            group: null
          },
        };
      },
      mounted() {
        
      },
      methods: {
      }
    };
  </script>
  
  <style scoped>
    
  </style>
  