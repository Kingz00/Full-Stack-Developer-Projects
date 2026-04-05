const LanguagesList = (props) => {

    const { langList } = props

    return (
        <section className="language-list">
            <ul>{langList}</ul>
        </section>
    )
}

export default LanguagesList