import React from "react"

export default function Main() {

    const [meme, setMeme] = React.useState({
        topText: "One does not simply",
        bottomText: "Walk into Mordor",
        imageUrl: "http://i.imgflip.com/1bij.jpg"
    })

    const { topText, bottomText, imageUrl } = meme

    const handleChange = (e) => {
        const { value, name } = e.currentTarget
        setMeme(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }

    return (
        <main>
            <div className="form">
                <label>Top Text
                    <input
                        type="text"
                        placeholder={topText}
                        name="topText"
                        onChange={handleChange}
                        value={topText}
                    />
                </label>

                <label>Bottom Text
                    <input
                        type="text"
                        placeholder={bottomText}
                        name="bottomText"
                        onChange={handleChange}
                        value={bottomText}
                    />
                </label>
                <button>Get a new meme image 🖼</button>
            </div>
            <div className="meme">
                <img src={imageUrl} />
                <span className="top">{topText}</span>
                <span className="bottom">{bottomText}</span>
            </div>
        </main>
    )
}