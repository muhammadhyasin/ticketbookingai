<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/layout/AppLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  try {
    loading.value = true
    error.value = ''
    await authStore.register(email.value, password.value)
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message
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
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-6 col-lg-4">
          <div class="card border-0 shadow-lg">
            <div class="card-body p-5">
              <!-- Header -->
              <div class="text-center mb-4">
                <i class="bi bi-person-plus display-1 text-primary mb-3"></i>
                <h2 class="fw-bold">Create Account</h2>
                <p class="text-muted">Join EventMaster today</p>
              </div>

              <!-- Error Alert -->
              <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
                {{ error }}
                <button type="button" class="btn-close" @click="error = ''"></button>
              </div>

              <!-- Register Form -->
              <form @submit.prevent="handleRegister">
                <div class="mb-3">
                  <label for="email" class="form-label">Email Address</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-envelope text-muted"></i>
                    </span>
                    <input
                      id="email"
                      type="email"
                      v-model="email"
                      class="form-control border-start-0 ps-0"
                      placeholder="name@example.com"
                      required
                      :disabled="loading"
                    >
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-lock text-muted"></i>
                    </span>
                    <input
                      id="password"
                      :type="showPassword ? 'text' : 'password'"
                      v-model="password"
                      class="form-control border-start-0 border-end-0 ps-0"
                      placeholder="Create a password"
                      required
                      :disabled="loading"
                    >
                    <button 
                      class="input-group-text bg-light border-start-0"
                      type="button"
                      @click="showPassword = !showPassword"
                    >
                      <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                </div>

                <div class="mb-4">
                  <label for="confirmPassword" class="form-label">Confirm Password</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-lock-fill text-muted"></i>
                    </span>
                    <input
                      id="confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      v-model="confirmPassword"
                      class="form-control border-start-0 border-end-0 ps-0"
                      placeholder="Confirm your password"
                      required
                      :disabled="loading"
                    >
                    <button 
                      class="input-group-text bg-light border-start-0"
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <i class="bi" :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                </div>

                <div class="d-grid mb-4">
                  <button
                    type="submit"
                    class="btn btn-primary py-2"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Creating account...' : 'Create account' }}
                  </button>
                </div>

                <div class="position-relative mb-4">
                  <hr>
                  <span class="position-absolute top-50 start-50 translate-middle px-3 bg-white text-muted small">
                    or continue with
                  </span>
                </div>

                <div class="d-grid mb-4">
                  <button
                    type="button"
                    @click="handleGoogleLogin"
                    class="btn btn-outline-secondary py-2"
                    :disabled="loading"
                  >
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      class="me-2"
                      width="18"
                      height="18"
                      alt="Google logo"
                    >
                    Sign up with Google
                  </button>
                </div>

                <p class="text-center mb-0">
                  Already have an account?
                  <router-link to="/login" class="text-decoration-none">Sign in</router-link>
                </p>
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