const Die = ({ value, isHeld, hold }) => {

    const styles = {
        backgroundColor: isHeld ? "#59E391" : "#FFFFFF"
    }

    return (
        <button
            style={styles}
            onClick={hold}
            aria-pressed={isHeld}
            aria-label={`Die with value ${value}, 
            ${isHeld ? "held" : "not held"}`}
        >{value}</button>
    )
}

export default Die