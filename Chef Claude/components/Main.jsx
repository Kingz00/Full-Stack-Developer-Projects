import React from "react"
import ClaudeRecipe from "./ClaudeRecipe"
import IngredientsList from "./IngredientsList"
import { getRecipeFromChefClaude, getRecipeFromMistral } from "../ai"

const Main = () => {

    const [ingredients, setIngredients] = React.useState([])
    const [recipe, setRecipe] = React.useState(null)
    // let ingredients = ['Chicken', 'Oregano', 'Tomatoes']
    const ingredientElements = ingredients.map((ingredient, index) => {
        return <li key={index}>{ingredient}</li>
    })

    // using onSubmit attribute in the form
    // const handleSubmit = (e) => {
    //     e.preventDefault()
    //     const formData = new FormData(e.currentTarget)
    //     const newIngredient = formData.get("ingredient")
    //     setIngredients(prevArr => [...prevArr, newIngredient])
    // }

    const addIngredient = (formData) => {
        const newIngredient = formData.get("ingredient")
        setIngredients(prevIngredientArr => [...prevIngredientArr, newIngredient])
    }

    const getRecipe = async () => {
        const recipeFromAI = await getRecipeFromMistral(ingredients)
        setRecipe(prevState => recipeFromAI)
    }

    return (
        <main>
            <form action={addIngredient} className="add-ingredient-form">
                <input
                    type="text"
                    placeholder="e.g. maggi"
                    aria-label="Add ingredient"
                    name="ingredient"
                />
                <button>Add Ingredient</button>
            </form>

            {ingredients.length > 0 ?
                <IngredientsList ingredientsLi={ingredientElements} ingredientsArr={ingredients} showRecipe={getRecipe} />
                : null}

            {recipe != null ? <ClaudeRecipe recipe={recipe} /> : null}
        </main>
    )
}

export default Main