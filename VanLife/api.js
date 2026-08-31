import { db, auth } from "./firebase"
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore/lite';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut } from "firebase/auth"


const vanCollectionRef = collection(db, "vans")

/* Firebase Functions */
export async function getVans() {
    const querySnapshot = await getDocs(vanCollectionRef)
    const dataArr = querySnapshot.docs.map(doc => {
        return {
            ...doc.data(),
            id: doc.id
        }
    })
    return dataArr
}

export async function getVan(id) {
    const vanDocRef = doc(db, "vans", id)
    const vanSnapshot = await getDoc(vanDocRef)
    if (!vanSnapshot.exists()) {
        throw new Response("Van not found", {
            status: 404
        })
    }
    return {
        ...vanSnapshot.data(),
        id: vanSnapshot.id
    }
}

export async function getHostVans() {
    const user = auth.currentUser

    if (!user) {
        throw new Error("You must be logged in to view your host vans.")
    }

    const hostVansRef = collection(
        db,
        "users",
        user.uid,
        "hostVans"
    )

    const hostVansSnapshot = await getDocs(hostVansRef)

    const vanIds = hostVansSnapshot.docs.map(
        doc => doc.data().vanId
    )

    const vans = await Promise.all(
        vanIds.map(vanId => getVan(vanId))
    )

    return vans
}

export async function getHostVan(id) {
    const user = auth.currentUser

    if (!user) {
        throw new Error("You must be logged in to view this van.")
    }

    // Check whether this van is part of the current user's host vans
    const hostVanRef = doc(
        db,
        "users",
        user.uid,
        "hostVans",
        id
    )

    const hostVanSnapshot = await getDoc(hostVanRef)

    if (!hostVanSnapshot.exists()) {
        throw new Response("Van not found.", {
            status: 404
        })
    }

    // Retrieve the canonical van data
    return getVan(id)
}

export async function isHostVan(vanId) {
    const user = auth.currentUser

    if (!user) {
        return false
    }

    const hostVanRef = doc(
        db,
        "users",
        user.uid,
        "hostVans",
        vanId
    )

    const snapshot = await getDoc(hostVanRef)

    return snapshot.exists()
}

export async function addHostVan(vanId) {
    const user = auth.currentUser

    if (!user) {
        throw new Error("You must be logged in to add a van.")
    }

    await setDoc(
        doc(db, "users", user.uid, "hostVans", vanId),
        {
            vanId
        }
    )
}

export async function removeHostVan(vanId) {
    const user = auth.currentUser

    if (!user) {
        throw new Error("You must be logged in to remove a van.")
    }

    await deleteDoc(
        doc(db, "users", user.uid, "hostVans", vanId)
    )
}

export async function registerUser({ name, email, password }) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    const { user } = userCredential

    await updateProfile(user, {
        displayName: name
    })

    await setDoc(doc(db, "users", user.uid), {
        name,
        email: user.email,
        role: "host"
    })

    return user
}

export async function loginUser({ email, password }) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)

    return userCredential.user
}

export async function logoutUser() {
    await signOut(auth)
}