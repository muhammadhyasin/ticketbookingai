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
  <div v-if="show" class="modal-backdrop fade show"></div>
  <div v-if="show" 
       class="modal fade show d-block" 
       tabindex="-1" 
       aria-modal="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Complete Payment</h5>
          <button type="button" 
                  class="btn-close" 
                  @click="onCancel"
                  :disabled="isProcessing">
          </button>
        </div>
        <div class="modal-body">
          <div class="text-center mb-4">
            <div class="h3 mb-0">Total Amount</div>
            <div class="display-4 fw-bold text-primary">${{ amount.toFixed(2) }}</div>
          </div>

          <form @submit.prevent="processPayment">
            <div class="mb-3">
              <label class="form-label">Card Number</label>
              <input v-model="cardNumber"
                     type="text"
                     class="form-control"
                     placeholder="4242 4242 4242 4242"
                     maxlength="19"
                     :disabled="isProcessing"
                     required>
            </div>

            <div class="row g-3 mb-4">
              <div class="col">
                <label class="form-label">Expiry Date</label>
                <input v-model="expiryDate"
                       type="text"
                       class="form-control"
                       placeholder="MM/YY"
                       maxlength="5"
                       :disabled="isProcessing"
                       required>
              </div>
              <div class="col">
                <label class="form-label">CVV</label>
                <input v-model="cvv"
                       type="text"
                       class="form-control"
                       placeholder="123"
                       maxlength="3"
                       :disabled="isProcessing"
                       required>
              </div>
            </div>

            <div class="d-grid">
              <button type="submit" 
                      class="btn btn-primary"
                      :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                {{ isProcessing ? 'Processing...' : 'Pay Now' }}
              </button>
            </div>
          </form>

          <div class="mt-4">
            <div class="alert alert-info mb-0">
              <div class="d-flex">
                <i class="bi bi-info-circle fs-5 me-2"></i>
                <div>
                  <strong>Test Card Details:</strong><br>
                  Card: 4242 4242 4242 4242<br>
                  Expiry: Any future date<br>
                  CVV: Any 3 digits
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>