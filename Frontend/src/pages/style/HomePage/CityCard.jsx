import styles from './CityCard.module.css';

function CityCard({ name, image }) {
    return (
        <div className={styles.cityCard}>
            <img src={image} alt={name} />
            <div className={styles.cityInfo}>{name}</div>
        </div>
    );
}

export default CityCard;