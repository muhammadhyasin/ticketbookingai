<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../config/firebase'

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
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo/Brand -->
      <div class="brand">
        <div class="brand-icon">
          <i class="bi bi-ticket-perforated-fill"></i>
        </div>
        <h1>Event Booking</h1>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Email</label>
          <div class="input-wrapper">
            <i class="bi bi-envelope"></i>
            <input 
              v-model="email"
              type="email"
              placeholder="Enter your email"
              required
              :disabled="loading"
            >
          </div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-wrapper">
            <i class="bi bi-lock"></i>
            <input 
              v-model="password"
              type="password"
              placeholder="Enter your password"
              required
              :disabled="loading"
            >
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button 
          type="submit" 
          class="login-button"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>Login</span>
        </button>

        <!-- Divider -->
        <div class="divider">
          <span>or</span>
        </div>

        <!-- Google Login -->
        <button 
          type="button"
          class="google-button"
          @click="handleGoogleLogin"
          :disabled="loading"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google">
          Continue with Google
        </button>

        <!-- Register Link -->
        <div class="register-link">
          Don't have an account? 
          <router-link to="/register">Register</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #f8f9fa;
}

.login-card {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
}

.brand {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-icon {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #0d6efd, #0099ff);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  font-size: 2rem;
}

.brand h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a4a4a;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 1rem;
  color: #666;
}

.input-wrapper input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  border: 1px solid #eaeaea;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  background: #fff5f5;
  border-radius: 0.5rem;
}

.login-button {
  padding: 1rem;
  background: #0d6efd;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.login-button:not(:disabled):hover {
  background: #0b5ed7;
  transform: translateY(-1px);
}

.login-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #666;
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #eaeaea;
}

.divider span {
  padding: 0 1rem;
}

.google-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border: 1px solid #eaeaea;
  border-radius: 0.75rem;
  font-weight: 500;
  color: #1a1a1a;
  transition: all 0.2s ease;
}

.google-button img {
  width: 1.25rem;
  height: 1.25rem;
}

.google-button:not(:disabled):hover {
  background: #f8f9fa;
  border-color: #ddd;
}

.register-link {
  text-align: center;
  font-size: 0.875rem;
  color: #666;
}

.register-link a {
  color: #0d6efd;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* iOS safe area support */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .login-container {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style> 