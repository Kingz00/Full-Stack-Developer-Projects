const Main = () => {
    return (
        <main className="profile-content">

            <h1 className="profile-name">Laura Smith</h1>

            <p className="profile-role">Frontend Developer</p>

            <a href="#" className="profile-website">
                laurasmith.website
            </a>

            <div className="profile-actions">

                <a href="#" className="btn btn-secondary">
                    <i className="fa-solid fa-envelope"></i>
                    <span>Email</span>
                </a>

                <a href="#" className="btn btn-primary">
                    <i className="fa-brands fa-linkedin"></i>
                    <span>LinkedIn</span>
                </a>

            </div>

            <section className="profile-section">
                <h2>About</h2>

                <p>
                    I am a frontend developer with a particular interest in
                    making things simple and automating daily tasks. I try
                    to keep up with security and best practices, and am
                    always looking for new things to learn.
                </p>
            </section>

            <section className="profile-section">
                <h2>Interests</h2>

                <p>
                    Food expert. Music scholar. Reader. Internet fanatic.
                    Bacon buff. Entrepreneur. Travel geek. Pop culture ninja.
                    Coffee fanatic.
                </p>
            </section>

        </main>
    )
}

export default Main