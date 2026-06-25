const Info = () => {
    return (
        <>
            <div class="profile-image">
                <img src="../Images/business-card.png" alt="Laura Smith" />
            </div>

            <div class="profile-content">

                <h1>Laura Smith</h1>

                <p class="job-title">Frontend Developer</p>

                <a href="#" class="website">laurasmith.website</a>

                <div class="actions">
                    <a href="#" class="btn btn-email">
                        <i class="fa-solid fa-envelope"></i>
                        Email
                    </a>

                    <a href="#" class="btn btn-linkedin">
                        <i class="fa-brands fa-linkedin"></i>
                        LinkedIn
                    </a>
                </div>
            </div>
        </>
    )
}

export default Info