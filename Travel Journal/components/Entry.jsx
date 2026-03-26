import Marker from "../images/marker.png"

export default function Entry(props) {

    const { img, title, country, googleMapsLink, dates, text } = props

    return (
        <article className="journal-entry">
            <div className="article-img-container">
                <img src={img.src} className="article-img" alt={img.alt} />
            </div>
            <div className="details-container">
                <div className="location-container">
                    <img src={Marker} className="location-icon" alt="location icon" />
                    <span>{country}</span>
                    <a href={googleMapsLink}>View on Google Maps</a>
                </div>
                <h2>{title}</h2>
                <p id="entry-dates">{dates}</p>
                <p id="entry-text">{text}</p>
            </div>
        </article>
    )
}