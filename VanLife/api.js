import { firebaseApp } from "./firebase"
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore/lite';

const db = getFirestore(firebaseApp)

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
    return {
        ...vanSnapshot.data(),
        id: vanSnapshot.id
    }
}

// export async function getHostVans() {
//     const filteredCollection = query(vanCollectionRef, where("hostId", "==", "123"))
//     const querySnapshot = await getDocs(filteredCollection)
//     const dataArr = querySnapshot.docs.map(doc => {
//         return {
//             ...doc.data(),
//             id: doc.id
//         }
//     })
//     return dataArr
// }


/* Mirage JS functions*/

// export async function getVans(id) {
//     const url = id ? `/api/vans/${id}` : "/api/vans"
//     const res = await fetch(url)
//     if (!res.ok) {
//         throw {
//             message: "Failed to fetch vans",
//             statusText: res.statusText,
//             status: res.status
//         }
//     }
//     const data = await res.json()
//     return data.vans
// }

export async function getHostVans(id) {
    const url = id ? `/api/host/vans/${id}` : "/api/host/vans"
    const res = await fetch(url)
    if (!res.ok) {
        throw {
            message: "Failed to fetch vans",
            statusText: res.statusText,
            status: res.status
        }
    }
    const data = await res.json()
    return data.vans
}

export async function loginUser(creds) {
    const res = await fetch("/api/login",
        { method: "post", body: JSON.stringify(creds) }
    )
    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message,
            statusText: res.statusText,
            status: res.status
        }
    }

    return data
}