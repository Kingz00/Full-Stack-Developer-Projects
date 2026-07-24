import { createContext, useState, useEffect } from "react";
import supabase from "../supabase-client";

export const AuthContext = createContext()

const AuthContextProvider = ({ children }) => {
    //Session state (user info, sign-in status)
    const [session, setSession] = useState(undefined);

    useEffect(() => {
        //1) Check on 1st render for a session (getSession())
        const getInitialSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession()
                if (error) {
                    throw error
                }
                console.log(data)
                setSession(data.session)
            } catch (err) {
                console.error(`Invalid session: ${err}`)
            }
        }

        getInitialSession()

        //2) Listen for changes in auth state (.onAuthStateChange())
        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            console.log(`Session changed: ${session}`)
        })

    }, []);

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
            console.log('Supabase sign-in success:', data)
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
            console.log('Supabase sign-out success')
            return { success: true };
        } catch (err) {
            // Unexpected error
            console.error('Unexpected error during sign-out:', err.message);
            return { success: false, error: 'An unexpected error occurred during sign out.' };
        }
    }

    // Sign up
    const signUpNewUser = async (email, password) => {
        try {

            const { data, error } = await supabase.auth.signUp(
                {
                    email: email.toLowerCase(),
                    password: password,
                }
            )

            //handle supabase error explicitly
            if (error) {
                console.error('Supabase sign-up error:', error.message);
                return { success: false, error: error.message };
            }

            //success
            console.log('Supabase sign-up success:', data)
            return { success: true, data };
        } catch (err) {
            // Unexpected error
            console.error('Unexpected error during sign-up:', err.message);
            return { success: false, error: 'An unexpected error occurred. Please try again.' };
        }
    }

    return (
        <AuthContext.Provider value={{ session, signInUser, signOut, signUpNewUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider