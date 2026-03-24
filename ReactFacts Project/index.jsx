import { createRoot } from 'react-dom/client'

const Header = () => {
  return (
    <header className='header'>
      <img src="react-logo.png" className="logo" alt="React logo" />
      <h2>ReactFacts</h2>
    </header>
  )
}

const Main = () => {
  return (
    <main className='main'>
      <h1>Fun facts about React!</h1>
      <ul>
        <li>Was first released in 2013</li>
        <li>Was originally created by Jordan Walke</li>
        <li>Has well over 200k stars on Github</li>
        <li>Is maintained by Meta</li>
        <li>Powers thousands of enterprise app, including mobile apps</li>
      </ul>
    </main>
  )
}
const root = createRoot(document.querySelector('#root'))
root.render(
  <>
    <Header />
    <Main />
  </>
)
