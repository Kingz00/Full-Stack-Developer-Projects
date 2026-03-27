const Main = () => {
    return (
        <main>
            <form className="add-ingredient-form">
                <input
                    type="text"
                    placeholder="e.g. maggi"
                    aria-label="Add ingredient"
                />
                <button>Add Ingredient</button>
            </form>
        </main>
    )
}

export default Main