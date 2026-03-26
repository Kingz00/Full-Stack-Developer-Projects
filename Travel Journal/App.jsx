import Header from './components/Header.jsx'
import Entry from './components/Entry.jsx'
import data from './data.js'

const App = () => {

    const entryElements = data.map((entryObj) => {
        return (
            <Entry
                key={entryObj.id}
                propObj={entryObj}
            />)
    })

    return (
        <>
            <Header />
            {entryElements}
        </>
    )
}

export default App