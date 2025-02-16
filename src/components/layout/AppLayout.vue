<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <i class="bi bi-ticket-perforated-fill me-2"></i>
          Event Booking
        </router-link>

        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">
                <i class="bi bi-chat-dots me-1"></i>
                Chat Assistant
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/dashboard">
                <i class="bi bi-speedometer2 me-1"></i>
                Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin">
                <i class="bi bi-calendar-event me-1"></i>
                Events
              </router-link>
            </li>
          </ul>

          <div class="d-flex align-items-center">
            <!-- Add Event Button -->
            <router-link 
              to="/admin" 
              class="btn btn-light me-3"
            >
              <i class="bi bi-plus-lg me-2"></i>
              Add Event
            </router-link>

            <!-- User Menu -->
            <div class="dropdown">
              <button 
                class="btn btn-light dropdown-toggle d-flex align-items-center" 
                type="button" 
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-person-circle me-2"></i>
                {{ authStore.userEmail?.split('@')[0] }}
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link class="dropdown-item" to="/dashboard">
                    <i class="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/admin">
                    <i class="bi bi-calendar-event me-2"></i>
                    Manage Events
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <button 
                    class="dropdown-item text-danger" 
                    @click="handleLogout"
                  >
                    <i class="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <slot></slot>
    </main>
  </div>
</template>

<style scoped>
.navbar {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.dropdown-item {
  padding: 0.5rem 1rem;
}

.dropdown-item i {
  width: 1.2rem;
}

.nav-link.router-link-active {
  font-weight: 500;
}
</style>