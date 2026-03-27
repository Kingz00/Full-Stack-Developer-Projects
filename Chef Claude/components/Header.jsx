import ChefIcon from "../images/chef-claude-icon.png"

const Header = () => {

    return (
        <header>
            <img src={ChefIcon} className="chef-icon" alt="Chef Icon" />
            <span>Chef Claude</span>
        </header>
    )
}

export default Header