import { useActionState, useContext } from "react";
import supabase from "../supabase-client";
import { AuthContext } from "../context/AuthContext";


function Form() {

    const { users, session } = useContext(AuthContext)

    const action = async (prevState, formData) => {
        // Action logic
        const submittedName = formData.get('name')

        // Find the user object from 'users' array that matches 'submittedName'
        const user = users.find(user => user.name === submittedName)

        const newDeal = {
            user_id: user.id,
            name: user.name,
            value: formData.get('value')
        }
        //Async operation
        const { error } = await supabase.from('sales_deals').insert([newDeal])

        // Return error state
        if (error) {
            console.error(`Error adding a deal: ${error.message}`)
            return new Error("Failed to add a deal")
        }

        return null
    }

    const [error, submitAction, isPending] = useActionState(action, null)

    const currentUser = users.find(user => user.id === session?.user?.id)

    const generateOptions = () => {
        return users
            .filter(user => user.account_type === 'rep')
            .map((user) => (
                <option key={user.id} value={user.name}>
                    {user.name}
                </option>
            ));
    };

    return (
        <div className="add-form-container">
            <form action={submitAction} aria-label="Add new sales deal" aria-describedby="form-description">
                <div id="form-description" className="sr-only">
                    Use this form to add a new sales deal. Select a sales rep and enter
                    the amount.
                </div>

                {currentUser?.account_type === 'rep' ? (
                    <label htmlFor="deal-name">
                        Name:
                        <input
                            id="deal-name"
                            type="text"
                            name="name"
                            value={currentUser?.name || ''}
                            readOnly
                            className="rep-name-input"
                            aria-label="Sales representative name"
                            aria-readonly="true"
                        />
                    </label>
                ) : (
                    <label htmlFor="deal-name">
                        Name:
                        <select id="deal-name" name="name" defaultValue={users?.[0]?.name || ''} aria-required="true"
                            aria-invalid={error ? 'true' : 'false'}
                            disabled={isPending}
                        >
                            {generateOptions()}
                        </select>
                    </label>
                )}


                <label htmlFor="deal-value">
                    Amount: $
                    <input id="deal-value" type="number" name="value" defaultValue={0} className="amount-input" min="0"
                        step="10" aria-required="true"
                        aria-invalid={error ? 'true' : 'false'}
                        aria-label="Deal amount in dollars"
                        disabled={isPending}
                    />
                </label>

                <button type="submit"
                    disabled={isPending}
                    aria-busy={isPending}
                >
                    {isPending ? "Adding..." : "Add Deal"}
                </button>
            </form>

            {error && (
                <div role="alert" className="error-message">
                    {error.message}
                </div>
            )}
        </div>
    );
};

export default Form;