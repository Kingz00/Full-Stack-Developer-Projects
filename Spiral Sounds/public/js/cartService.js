export function addBtnListeners() {
  document.querySelectorAll('.add-btn').forEach(button => {
    button.addEventListener('click', async (event) => {
      const albumId = event.currentTarget.dataset.id
      const feedback = event.currentTarget
        .closest('.product-card')
        .querySelector('.cart-feedback')

      feedback.textContent = ''

      try {
        const res = await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId: albumId })
        })

        const data = await res.json()

        if (res.status === 401) {
          window.location.href = '/login.html'
          return
        }

        if (res.status === 409) {
          feedback.textContent = 'Not enough stock available.'
          return
        }

        if (res.status === 404) {
          feedback.textContent = 'This product is no longer available.'
          return
        }

        if (!res.ok) {
          feedback.textContent = data.error || 'Unable to add item to cart.'
          return
        }

        await updateCartIcon()
      } catch (err) {
        console.error('Error adding to cart:', err)
        feedback.textContent = 'Unable to add item to cart.'
      }
    })
  })
}

function showCartMessage(dom, message) {
  dom.userMessage.textContent = message
}

export async function updateCartIcon() {
  try {
    const res = await fetch('/api/cart/cart-count')
    const obj = await res.json()
    const totalItems = obj.totalItems

    document.getElementById('cart-banner').innerHTML =
      totalItems > 0
        ? `<a href="/cart.html"><img src="images/cart.png" alt="cart">${totalItems}</a>`
        : ''
  } catch (err) {
    console.error('Error updating cart icon:', err)
  }
}

export async function loadCart(dom) {
  const { checkoutBtn, userMessage, cartList, cartTotal } = dom

  cartList.innerHTML = '<li>Loading cart...</li>'

  try {
    const items = await fetchCartItems(dom)
    renderCartItems(items, cartList)
    updateCartTotal(items, cartTotal, checkoutBtn)
  } catch (err) {
    console.error('Error loading cart:', err)
    cartList.innerHTML = '<li>Unable to load cart data.</li>'
  }
}

async function fetchCartItems({ userMessage, checkoutBtn }) {
  const res = await fetch('/api/cart/', { credentials: 'include' })

  if (res.status === 401) {
    checkoutBtn.disabled = true
    checkoutBtn.classList.add('disabled')
    userMessage.innerHTML = 'Please <a href="login.html">log in</a>.'
    return []
  }

  if (!res.ok) {
    throw new Error('Unable to load cart data.')
  }

  const { items } = await res.json()
  return items
}

function renderCartItems(items, cartList) {
  cartList.innerHTML = ''

  items.forEach(item => {
    const li = document.createElement('li')
    li.className = 'cart-item'

    const itemTotal = item.price * item.quantity

    li.innerHTML = `
      <div>
        <strong>${item.title}: </strong>
        <button data-id="${item.cartItemId}" class="remove-btn">🗑️</button>
      </div>
      <span>× ${item.quantity} = $${itemTotal.toFixed(2)}</span>
    `

    cartList.appendChild(li)
  })
}

function updateCartTotal(items, cartTotal, checkoutBtn) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  cartTotal.innerHTML = `Total: $${total.toFixed(2)}`

  if (total <= 0) {
    checkoutBtn.disabled = true
    checkoutBtn.classList.add('disabled')
  }
}

export async function removeItem(itemId, dom) {
  try {
    const res = await fetch(`/api/cart/${itemId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (res.status === 204) {
      await loadCart(dom)
      return
    }

    const data = await res.json()

    showCartMessage(
      dom,
      data.error || 'Unable to remove item from cart.'
    )

  } catch (err) {
    console.error('Error removing item:', err)
    showCartMessage(
      dom,
      'Unable to remove item. Please try again.'
    )
  }
}

export async function removeAll(dom) {
  try {
    const res = await fetch(`/api/cart/all`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (res.status === 204) {
      await loadCart(dom)
      return
    }

    const data = await res.json()

    showCartMessage(
      dom,
      data.error || 'Unable to clear cart.'
    )

  } catch (err) {
    console.error('Error clearing cart:', err)
    showCartMessage(
      dom,
      'Unable to clear cart. Please try again.'
    )
  }
}

export async function createOrder(dom) {

  dom.checkoutBtn.disabled = true

  dom.checkoutBtn.textContent = "Processing..."

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      credentials: 'include'
    })

    const data = await res.json()

    if (res.status === 401) {
      window.location.href = '/login.html'
      return
    }

    if (res.ok) {
      dom.userMessage.textContent =
        `Your order has been placed successfully. Order #${data.orderId}
         Total: $${data.total}
        `

      dom.checkoutBtn.classList.add('visually-hidden')
      dom.cartTotal.classList.add('visually-hidden')

      await loadCart(dom)
      return
    }

    if (!res.ok) {
      dom.userMessage.textContent =
        data.error || 'Unable to place your order.'

      dom.checkoutBtn.disabled = false
      dom.checkoutBtn.textContent = 'Checkout'
      return
    }

  }
  catch (err) {
    console.error('Error creating order:', err)
    dom.userMessage.textContent =
      'Unable to place your order. Please try again.'

    dom.checkoutBtn.disabled = false
    dom.checkoutBtn.textContent = 'Checkout'
  }
}
