import { createContext, useState, useEffect } from "react";
import supabase from "../supabase-client";

export const AuthContext = createContext()

const AuthContextProvider = ({ children }) => {
    //Session state (user info, sign-in status)
    const [session, setSession] = useState(undefined);
    const [users, setUsers] = useState([])

    useEffect(() => {
        //1) Check on 1st render for a session (getSession())
        const getInitialSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession()
                if (error) {
                    throw error
                }
                setSession(data.session)
            } catch (err) {
                console.error(`Invalid session: ${err}`)
            }
        }

        getInitialSession()

        //2) Listen for changes in auth state (.onAuthStateChange())
        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })


    }, []);

    useEffect(() => {

        // Query user_profiles
        const fetchUsers = async () => {
            try {

                const { data, error } = await supabase.from('user_profiles')
                    .select("id, name, account_type")

                if (error) {
                    throw new Error(error.message)
                }
                setUsers(data)
            } catch (err) {
                console.error(`Error fetching user profiles: ${err}`)
            }
        }

        fetchUsers()
    }, [session])

    //Auth functions (signin, signup, logout)

    //Sign in (success, data, error)
    const signInUser = async (email, password) => {
        try {

            const { data, error } = await supabase.auth.signInWithPassword(
                {
                    email: email.toLowerCase(),
                    password: password,
                }
            )

            //handle supabase error explicitly
            if (error) {
                console.error('Supabase sign-in error:', error.message);
                return { success: false, error: error.message };
            }

            //success
            return { success: true, data };
        } catch (err) {
            // Unexpected error
            console.error('Unexpected error during sign-in:', err.message);
            return { success: false, error: 'An unexpected error occurred. Please try again.' };
        }
    }

    // Sign out
    const signOut = async () => {
        try {

            const { error } = await supabase.auth.signOut()

            //handle supabase error explicitly
            if (error) {
                console.error('Supabase sign-out error:', error.message);
                return { success: false, error: error.message };
            }

            //success
            return { success: true };
        } catch (err) {
            // Unexpected error
            console.error('Unexpected error during sign-out:', err.message);
            return { success: false, error: 'An unexpected error occurred during sign out.' };
        }
    }

    // Sign up
    const signUpNewUser = async (name, email, password, accountType) => {
        try {

            const { data, error } = await supabase.auth.signUp(
                {
                    email: email.toLowerCase(),
                    password: password,
                    // options property for users metadata
                    options: {
                        data: {
                            name: name,
                            account_type: accountType,
                        }
                    }
                }
            )

            //handle supabase error explicitly
            if (error) {
                console.error('Supabase sign-up error:', error.message);
                return { success: false, error: error.message };
            }

            //success
            return { success: true, data };
        } catch (err) {
            // Unexpected error
            console.error('Unexpected error during sign-up:', err.message);
            return { success: false, error: 'An unexpected error occurred. Please try again.' };
        }
    }

    return (
        <AuthContext.Provider value={{ session, signInUser, signOut, signUpNewUser, users }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider