<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  show: boolean
  amount: number
  onSuccess: (navigate: boolean) => void
  onCancel: () => void
}>()

const isProcessing = ref(false)
const cardNumber = ref('')
const expiryDate = ref('')
const cvv = ref('')

const processPayment = async () => {
  isProcessing.value = true
  
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  isProcessing.value = false
  props.onSuccess(true) // Pass true to indicate navigation should happen
}
</script>

<template>
  <div v-if="show" class="payment-modal">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <div class="modal-overlay" @click="onCancel"></div>
    <div class="modal-container">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h5>Complete Payment</h5>
          <button 
            class="close-button"
            @click="onCancel"
            :disabled="isProcessing"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Amount Display -->
        <div class="amount-display">
          <span class="amount-label">Total Amount</span>
          <span class="amount-value">${{ amount.toFixed(2) }}</span>
        </div>

        <!-- Payment Form -->
        <form @submit.prevent="processPayment" class="payment-form">
          <div class="form-group">
            <label>Card Number</label>
            <div class="input-wrapper">
              <i class="bi bi-credit-card"></i>
              <input 
                v-model="cardNumber"
                type="text"
                placeholder="4242 4242 4242 4242"
                maxlength="19"
                :disabled="isProcessing"
                required
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Expiry Date</label>
              <div class="input-wrapper">
                <i class="bi bi-calendar3"></i>
                <input 
                  v-model="expiryDate"
                  type="text"
                  placeholder="MM/YY"
                  maxlength="5"
                  :disabled="isProcessing"
                  required
                >
              </div>
            </div>

            <div class="form-group">
              <label>CVV</label>
              <div class="input-wrapper">
                <i class="bi bi-lock"></i>
                <input 
                  v-model="cvv"
                  type="text"
                  placeholder="123"
                  maxlength="3"
                  :disabled="isProcessing"
                  required
                >
              </div>
            </div>
          </div>

          <button 
            type="submit"
            class="pay-button"
            :disabled="isProcessing"
          >
            <div class="button-content">
              <span v-if="isProcessing" class="spinner"></span>
              <i v-else class="bi bi-shield-lock"></i>
              {{ isProcessing ? 'Processing...' : 'Pay Securely' }}
            </div>
          </button>
        </form>

        <!-- Test Card Info -->
        <div class="test-card-info">
          <div class="info-header">
            <i class="bi bi-info-circle"></i>
            <span>Test Card Details</span>
          </div>
          <div class="info-content">
            <div class="info-row">
              <span class="label">Card:</span>
              <span class="value">4242 4242 4242 4242</span>
            </div>
            <div class="info-row">
              <span class="label">Expiry:</span>
              <span class="value">Any future date</span>
            </div>
            <div class="info-row">
              <span class="label">CVV:</span>
              <span class="value">Any 3 digits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 420px;
  margin: 1rem;
  z-index: 1;
}

.modal-content {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h5 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

.close-button {
  width: 2rem;
  height: 2rem;
  border: none;
  background: #f8f9fa;
  color: #666;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #e9ecef;
  color: #1a1a1a;
}

.amount-display {
  background: linear-gradient(135deg, #0d6efd, #0099ff);
  padding: 1.5rem;
  border-radius: 1rem;
  text-align: center;
  color: white;
  margin-bottom: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.amount-label {
  display: block;
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.amount-value {
  font-size: 2rem;
  font-weight: 700;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
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
  width: 100%;
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
  box-sizing: border-box;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.pay-button {
  margin-top: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 0.75rem;
  background: #0d6efd;
  color: white;
  font-weight: 600;
  transition: all 0.2s ease;
}

.pay-button:not(:disabled):hover {
  background: #0b5ed7;
  transform: translateY(-1px);
}

.pay-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.test-card-info {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  width: 100%;
  box-sizing: border-box;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0d6efd;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  gap: 0.5rem;
}

.info-row .label {
  color: #666;
  min-width: 4rem;
}

.info-row .value {
  color: #1a1a1a;
  font-weight: 500;
}

@media (max-width: 768px) {
  .payment-modal {
    align-items: flex-end;
    padding: 0;
  }

  .modal-container {
    margin: 0;
    max-height: 95vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .modal-content {
    padding: 1.25rem;
    border-radius: 1.5rem 1.5rem 0 0;
    max-height: 95vh;
    overflow-y: auto;
  }

  .form-group {
    width: 100%;
  }

  .input-wrapper {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
    width: 100%;
  }
  
  .test-card-info {
    margin-bottom: 2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .amount-display {
    width: 100%;
    box-sizing: border-box;
  }
}

/* Prevent content from being cut off at the bottom */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .modal-content {
    padding-bottom: calc(1.25rem + env(safe-area-inset-bottom));
  }

  .test-card-info {
    margin-bottom: calc(2rem + env(safe-area-inset-bottom));
  }
}
</style>