<template>
  <div class="language-selector">
    <div class="language-modal">
      <div class="modal-header">
        <h2 class="text-center mb-0">Select Language</h2>
        <button class="close-button" @click="$emit('language-selected')">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="language-grid">
        <button 
          v-for="lang in languages" 
          :key="lang.code"
          class="btn btn-outline-primary language-btn"
          :class="{ active: chatStore.selectedLanguage === lang.code }"
          @click="selectLanguage(lang.code)"
        >
          <span class="lang-name">{{ lang.name }}</span>
          <span class="lang-native">{{ lang.native }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '../../stores/chat'

const emit = defineEmits(['language-selected'])
const chatStore = useChatStore()

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' }
]

const selectLanguage = (lang: string) => {
  chatStore.selectedLanguage = lang
  emit('language-selected')
}
</script>

<style scoped>
.language-selector {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.language-modal {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.language-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.language-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid #dee2e6;
  transition: all 0.2s ease;
}

.language-btn:hover {
  transform: translateY(-2px);
  border-color: #0d6efd;
}

.lang-name {
  font-size: 1rem;
  font-weight: 500;
}

.lang-native {
  font-size: 1.2rem;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .language-grid {
    grid-template-columns: 1fr;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #dc3545;
}

.language-btn.active {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}
</style> 