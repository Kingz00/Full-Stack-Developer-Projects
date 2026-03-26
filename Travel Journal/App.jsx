import Header from './components/Header.jsx'
import Entry from './components/Entry.jsx'
import data from './data.js'

const App = () => {

    const entryElements = data.map((entryObj) => {
        const { id, img, title, country, googleMapsLink, dates, text } = entryObj
        return (
            <Entry
                key={id}
                img={img}
                title={title}
                country={country}
                googleMapsLink={googleMapsLink}
                dates={dates}
                text={text}
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