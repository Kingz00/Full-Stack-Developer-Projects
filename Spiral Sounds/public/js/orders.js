import { logout } from './logout.js'
import { checkAuth, renderGreeting, showHideMenuItems } from './authUI.js'

document.getElementById('logout-btn').addEventListener('click', logout)

async function initOrdersPage() {
  const username = await checkAuth()

  renderGreeting(username)
  showHideMenuItems(username)

  if (!username) {
    window.location.href = '/login.html'
    return
  }

  loadOrders()
}

async function loadOrders() {
  const ordersList = document.getElementById('orders-list')
  const ordersMessage = document.getElementById('orders-message')

  ordersList.innerHTML = '<p>Loading orders...</p>'

  try {
    const res = await fetch('/api/orders', {
      credentials: 'include'
    })

    if (!res.ok) {
      throw new Error('Unable to load orders.')
    }

    const { orders } = await res.json()

    if (orders.length === 0) {
      ordersList.innerHTML = '<p>You have no orders yet.</p>'
      return
    }

    renderOrders(orders)
  }
  catch (err) {
    console.error('Error loading orders:', err)
    ordersList.innerHTML =
      '<p>Unable to load your orders. Please try again.</p>'
  }
}

function renderOrders(orders) {
  const ordersList = document.getElementById('orders-list')

  ordersList.innerHTML = orders.map(order => `
    <article class="order-card">
      <div class="order-header">
        <h3>Order #${order.orderId}</h3>
        <time datetime="${order.createdAt}">
          ${formatOrderDate(order.createdAt)}
        </time>
      </div>

      <ul class="order-items">
        ${order.items.map(item => `
          <li>
            <span>
              ${item.title} — ${item.artist}
            </span>
            <span>
              × ${item.quantity}
            </span>
          </li>
        `).join('')}
      </ul>

      <p class="order-total">
        Total: $${order.total.toFixed(2)}
      </p>
    </article>
  `).join('')
}

function formatOrderDate(date) {
  return new Date(date).toLocaleDateString()
}

initOrdersPage()