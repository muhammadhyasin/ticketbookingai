<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/layout/AppLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    
    await authStore.login(email.value, password.value)
    router.push('/dashboard')
  } catch (err: any) {
    // Provide user-friendly error messages
    if (err.code === 'auth/invalid-credential') {
      error.value = 'Invalid email or password. Please try again.'
    } else if (err.code === 'auth/user-not-found') {
      error.value = 'No account found with this email. Please register first.'
    } else if (err.code === 'auth/wrong-password') {
      error.value = 'Incorrect password. Please try again.'
    } else {
      error.value = 'Failed to login. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    await authStore.loginWithGoogle()
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h2 class="text-center mb-4">Login</h2>
              
              <!-- Error Alert -->
              <div v-if="error" class="alert alert-danger" role="alert">
                {{ error }}
              </div>

              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input
                    v-model="email"
                    type="email"
                    class="form-control"
                    required
                    :disabled="loading"
                  >
                </div>

                <div class="mb-4">
                  <label class="form-label">Password</label>
                  <input
                    v-model="password"
                    type="password"
                    class="form-control"
                    required
                    :disabled="loading"
                  >
                </div>

                <div class="d-grid mb-3">
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Logging in...' : 'Login' }}
                  </button>
                </div>

                <div class="text-center">
                  <p class="mb-0">
                    Don't have an account? 
                    <router-link to="/register">Register</router-link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.card {
  border-radius: 1rem;
}

.input-group-text {
  border-color: #dee2e6;
}

.form-control:focus {
  box-shadow: none;
  border-color: #dee2e6;
}

.input-group:focus-within {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  border-radius: 0.375rem;
}
</style> 