<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/layout/AppLayout.vue'
import { useAuthStore } from '../stores/auth'
import { useEventStore } from '../stores/events'
import type { Event } from '../types/event'
import { useAdminStore } from '../stores/admin'

const authStore = useAuthStore()
const eventStore = useEventStore()
const router = useRouter()
const adminStore = useAdminStore()

// Add screen size detection
const isMobile = ref(window.innerWidth <= 768)

onMounted(async () => {
  eventStore.loadEvents()
  
  // Add window resize listener
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768
  })

  // Check admin status
  await adminStore.checkAdminStatus()
})

onUnmounted(() => {
  window.removeEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768
  })
})

// Dynamic stats
const stats = computed(() => [
  {
    title: 'Active Tickets',
    value: eventStore.activeTickets.toString(),
    icon: 'bi-ticket-perforated',
    color: 'primary'
  },
  {
    title: 'Past Events',
    value: eventStore.pastEvents.toString(),
    icon: 'bi-calendar-check',
    color: 'success'
  },
  {
    title: 'Total Spent',
    value: `$${eventStore.totalSpent.toFixed(2)}`,
    icon: 'bi-wallet2',
    color: 'info'
  },
  {
    title: 'Reward Points',
    value: Math.floor(eventStore.totalSpent).toString(),
    icon: 'bi-star',
    color: 'warning'
  }
])

const handleAddEvent = () => {
  router.push('/admin/events/new')
}
</script>

<template>
  <AppLayout>
    <div class="mobile-dashboard">
      <!-- Top App Bar -->
      <header class="dashboard-header">
        <div class="user-info">
          <div class="avatar">
            {{ authStore.userEmail?.charAt(0).toUpperCase() }}
          </div>
          <div class="user-welcome">
            <span class="greeting">Welcome back</span>
            <h1>
              {{ authStore.userEmail?.split('@')[0] }}
              <span v-if="adminStore.isAdmin" class="admin-badge">Admin</span>
            </h1>
          </div>
        </div>
        <!-- Only show admin actions if user is admin -->
        <button 
          v-if="adminStore.isAdmin" 
          @click="handleAddEvent"
          class="fab"
          type="button"
        >
          <i class="bi bi-plus-lg"></i>
        </button>
      </header>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <router-link to="/tickets" class="action-card">
          <div class="action-icon tickets">
            <i class="bi bi-ticket-perforated"></i>
            <span v-if="eventStore.activeTickets > 0" class="badge">
              {{ eventStore.activeTickets }}
            </span>
          </div>
          <span class="action-label">My Tickets</span>
        </router-link>
        
        <router-link to="/chat" class="action-card">
          <div class="action-icon chat">
            <i class="bi bi-chat-dots"></i>
            <span class="status-dot"></span>
          </div>
          <span class="action-label">Chat Assistant</span>
        </router-link>
      </div>

      <!-- Main Content -->
      <main class="dashboard-content">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div v-for="stat in stats" 
               :key="stat.title" 
               class="stat-card"
               :class="`stat-${stat.color}`"
          >
            <i :class="`bi ${stat.icon}`"></i>
            <div class="stat-info">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-title">{{ stat.title }}</span>
            </div>
          </div>
        </div>

        <!-- Events Section -->
        <section class="events-section">
          <div class="section-header">
            <h2>Events Nearby</h2>
            <button class="filter-button">
              <i class="bi bi-funnel"></i>
            </button>
          </div>
          
          <!-- Loading State -->
          <div v-if="eventStore.loading" class="loading-state">
            <div class="spinner"></div>
            <span>Loading events...</span>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="eventStore.events.length === 0" class="empty-state">
            <i class="bi bi-calendar-x"></i>
            <p>No upcoming events</p>
            <router-link to="/admin" class="add-button">
              Add New Event
            </router-link>
          </div>
          
          <!-- Events List -->
          <div v-else class="events-list">
            <div v-for="event in eventStore.events" 
                 :key="event.id" 
                 class="event-card"
            >
              <img :src="event.image" 
                   :alt="event.title"
                   class="event-image">
              <div class="event-content">
                <span class="event-category">{{ event.category }}</span>
                <h3>{{ event.title }}</h3>
                <div class="event-details">
                  <span>
                    <i class="bi bi-calendar3"></i>
                    {{ new Date(event.date).toLocaleDateString() }}
                  </span>
                  <span>
                    <i class="bi bi-clock"></i>
                    {{ event.time }}
                  </span>
                </div>
                <div class="event-footer">
                  <div class="tickets-info">
                    <span class="tickets-left">
                      {{ event.availableTickets }} tickets left
                    </span>
                    <span class="event-price">${{ event.price.toFixed(2) }}</span>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </AppLayout>
</template>

<style scoped>
.mobile-dashboard {
  min-height: 100vh;
  background: #fafafa;
  position: relative;
  z-index: 1;
}

.dashboard-header {
  background: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #0d6efd, #0099ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
}

.user-welcome {
  display: flex;
  flex-direction: column;
}

.greeting {
  font-size: 0.75rem;
  color: #666;
}

.user-welcome h1 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

.fab {
  width: 2.75rem;
  height: 2.75rem;
  background: #0d6efd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  border: none;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
  transition: transform 0.2s;
  cursor: pointer;
}

.fab:hover {
  transform: scale(1.05);
}

.admin-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #0d6efd;
  color: white;
  border-radius: 1rem;
  margin-left: 0.5rem;
  font-weight: 500;
}

.dashboard-content {
  padding: 0 1rem 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.25rem;
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.stat-card i {
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.stat-title {
  font-size: 0.75rem;
  color: #666;
}

.stat-primary i { color: #0d6efd; }
.stat-success i { color: #198754; }
.stat-info i { color: #0dcaf0; }
.stat-warning i { color: #ffc107; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

.filter-button {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 1.125rem;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  background: white;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.event-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.event-content {
  padding: 1.25rem;
}

.event-category {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: #f0f7ff;
  color: #0d6efd;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.event-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: #1a1a1a;
}

.event-details {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1.25rem;
}

.event-details i {
  color: #0d6efd;
  margin-right: 0.375rem;
}

.event-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tickets-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tickets-left {
  font-size: 0.75rem;
  color: #666;
}

.event-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.book-button {
  padding: 0.75rem 1.5rem;
  background: #0d6efd;
  color: white;
  border: none;
  border-radius: 1rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e9ecef;
  border-top-color: #0d6efd;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.empty-state i {
  font-size: 3.5rem;
  color: #666;
  margin-bottom: 1rem;
  display: block;
}

.add-button {
  display: inline-flex;
  align-items: center;
  padding: 0.875rem 1.5rem;
  background: #0d6efd;
  color: white;
  border-radius: 1rem;
  text-decoration: none;
  font-weight: 500;
  margin-top: 1rem;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Tablet and larger screens */
@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .events-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Update iOS safe area support */
@supports (padding-top: env(safe-area-inset-top)) {
  .dashboard-header {
    padding-top: calc(1rem + env(safe-area-inset-top));
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.action-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.action-card:active {
  transform: scale(0.98);
  background: #f8f9fa;
}

.action-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  position: relative;
}

.action-icon.tickets {
  background: #f0f7ff;
  color: #0d6efd;
}

.action-icon.chat {
  background: #e8f5e9;
  color: #198754;
}

.action-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a1a1a;
}

.badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: #dc3545;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  border: 2px solid white;
  min-width: 1.5rem;
  text-align: center;
}

.status-dot {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 0.75rem;
  height: 0.75rem;
  background: #22c55e;
  border-radius: 50%;
  border: 2px solid white;
}

.status-dot::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
  opacity: 0.5;
}
</style> 