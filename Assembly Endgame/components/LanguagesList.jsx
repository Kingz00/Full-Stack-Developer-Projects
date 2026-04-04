const LanguagesList = (props) => {

    const { langList } = props

    return (
        <ul className="language-list">
            {langList}
        </ul>
    )
}

export default LanguagesList