import styles from './OfficeCard.module.css';

function OfficeCard({ office }) {
    return (
        <div className={styles.officeCard}>
            <img
                // src={office.image}

                src={office.link}
                alt={office.name} />
            <div className={styles.officeDetails}>
                <h3>{office.name}</h3>
                <p>{office.location}</p>

                <a href={office.link}>View Now :</a>
            </div>
        </div>
    );
}

export default OfficeCard;