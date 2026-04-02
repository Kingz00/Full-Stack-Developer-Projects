import Markdown from "react-markdown"

const ClaudeRecipe = ({ recipe }) => {
    return (

        <section className="suggested-recipe-container" aria-live="polite" >
            <h2>Chef Claude Recommends:</h2>
            <Markdown>{recipe}</Markdown>
        </section>

    )
}

export default ClaudeRecipe