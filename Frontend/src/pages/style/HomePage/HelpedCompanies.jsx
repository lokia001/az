import styles from './HelpedCompanies.module.css';
import googleLogo from '../../../assets/react.svg'; // Đường dẫn tương đối đến logo Google
// import airbnbLogo from '../../assets/airbnb.png'; // Đường dẫn tương đối đến logo Airbnb
// import pfizerLogo from '../../assets/pfizer.png'; // Đường dẫn tương đối đến logo Pfizer
// import spotifyLogo from '../../assets/spotify.png'; // Đường dẫn tương đối đến logo Spotify
// import teslaLogo from '../../assets/tesla.png'; // Đường dẫn tương đối đến logo Tesla
// import uberLogo from '../../assets/uber.png'; // Đường dẫn tương đối đến logo Uber

const companies = [
    { name: 'Google', logo: googleLogo },
    { name: 'Airbnb', logo: googleLogo },
    { name: 'Pfizer', logo: googleLogo },
    { name: 'Spotify', logo: googleLogo },
    { name: 'Tesla', logo: googleLogo },
    { name: 'Uber', logo: googleLogo },
];

function HelpedCompanies() {
    return (
        <div className={styles.helpedCompanies}>
            <h2 className={styles.helpedTitle}>We've helped these great companies</h2>
            <div className={styles.companiesGrid}>
                {companies.map((company) => (
                    <div key={company.name} className={styles.companyLogo}>
                        <img src={company.logo} alt={company.name} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HelpedCompanies;