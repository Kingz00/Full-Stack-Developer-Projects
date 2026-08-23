export async function logout() {
  try {
    const res = await fetch('api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    if (res.ok) {
      window.location.href = '/'
    }
  } catch {
    console.log('failed to log out', err)
  }
}