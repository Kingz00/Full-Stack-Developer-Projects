import type { JSX } from 'react'

const LanguagesList = ({ langList }: { langList: Array<JSX.Element> }): JSX.Element => {
    return (
        <section className="language-list">
            <ul>{langList}</ul>
        </section>
    )
}

export default LanguagesList