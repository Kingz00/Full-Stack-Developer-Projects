const IngredientsList = (props) => {

    const { ingredientsLi, ingredientsArr, showRecipe, useRef } = props

    return (
        <section>
            <h2>Ingredients on hand:</h2>
            <ul className="ingredients-list" aria-live="polite">{ingredientsLi}</ul>
            {ingredientsArr.length > 3 ?
                <div className="get-recipe-container">
                    <div ref={useRef}>
                        <h3>Ready for a recipe?</h3>
                        <p>Generate a recipe from your list of ingredients.</p>
                    </div>
                    <button onClick={showRecipe}>Get a recipe</button>
                </div> :
                null}
        </section>
    )
}

export default IngredientsList