<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/admin'

const authStore = useAuthStore()
const router = useRouter()
const adminStore = useAdminStore()
const showMenu = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}
</script>

<template>
  <div class="app-layout">
    <!-- Modern App Navigation -->
    <nav class="app-nav">
      <div class="nav-container">
        <router-link to="/dashboard" class="nav-brand">
          <div class="brand-icon">
            <i class="bi bi-ticket-perforated-fill"></i>
          </div>
          <span class="brand-text">Events</span>
        </router-link>

        <div class="nav-actions">
          <div class="dropdown">
            <button 
              class="action-button" 
              type="button"
              @click="toggleMenu"
            >
              <i class="bi bi-three-dots-vertical"></i>
            </button>

            <div 
              class="dropdown-menu" 
              :class="{ show: showMenu }"
            >
              <router-link 
                v-if="adminStore.isAdmin"
                to="/admin" 
                class="menu-item"
                @click="showMenu = false"
              >
                <i class="bi bi-gear"></i>
                <span>Manage Events</span>
              </router-link>
              
              <router-link 
                to="/dashboard" 
                class="menu-item"
                @click="showMenu = false"
              >
                <i class="bi bi-speedometer2"></i>
                <span>Dashboard</span>
              </router-link>
              
              <router-link 
                to="/chat" 
                class="menu-item"
                @click="showMenu = false"
              >
                <i class="bi bi-chat-dots"></i>
                <span>Chat Assistant</span>
              </router-link>
              
              <div class="menu-divider"></div>
              
              <button 
                @click="handleLogout"
                class="menu-item text-danger"
              >
                <i class="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="app-main">
      <slot></slot>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #fafafa;
  position: relative;
}

.app-nav {
  background: white;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0.5rem 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  max-width: 768px;
  margin: 0 auto;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.brand-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #0d6efd, #0099ff);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.action-button {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #1a1a1a;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-button:hover {
  background: #f8f9fa;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: none;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 200px;
  padding: 0.5rem;
  transform: none !important;
  z-index: 101;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  color: #1a1a1a;
  text-decoration: none;
  border-radius: 0.75rem;
  transition: background-color 0.2s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-size: 0.9375rem;
}

.menu-item i {
  font-size: 1.25rem;
}

.menu-item:hover {
  background: #f8f9fa;
}

.menu-item.text-danger {
  color: #dc3545;
}

.menu-item.text-danger:hover {
  background: #fff5f5;
}

.menu-divider {
  height: 1px;
  background: #eaeaea;
  margin: 0.5rem 0;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .dropdown-menu {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    border-radius: 1.25rem 1.25rem 0 0;
    padding: 1rem;
    box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
    z-index: 1000;
  }

  .menu-item {
    padding: 1rem;
  }
}

/* iOS safe area support */
@supports (padding-top: env(safe-area-inset-top)) {
  .app-nav {
    padding-top: calc(0.5rem + env(safe-area-inset-top));
  }
  
  @media (max-width: 768px) {
    .dropdown-menu {
      padding-bottom: calc(1rem + env(safe-area-inset-bottom));
    }
  }
}
</style>