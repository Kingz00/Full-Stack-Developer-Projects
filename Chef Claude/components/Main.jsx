const Main = () => {

    let ingredients = ['Chicken', 'Oregano', 'Tomatoes']
    const ingredientElements = ingredients.map((ingredient, index) => {
        return <li key={index}>{ingredient}</li>
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const newIngredient = formData.get("ingredient")
        ingredients.push(newIngredient)
        console.log(ingredients)
    }

    return (
        <main>
            <form onSubmit={handleSubmit} className="add-ingredient-form">
                <input
                    type="text"
                    placeholder="e.g. maggi"
                    aria-label="Add ingredient"
                    name="ingredient"
                />
                <button>Add Ingredient</button>
            </form>
            <ul>
                {ingredientElements}
            </ul>
        </main>
    )
}

export default Main