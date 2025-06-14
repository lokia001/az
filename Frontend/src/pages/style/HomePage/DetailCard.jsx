import styles from './DetailCard.module.css';

function DetailCard({ detail }) {
    return (
        <div className={styles.detailCard}>
            <h3>{detail.title}</h3>
            <p>{detail.content}</p>
            {detail.linkText && <a href={detail.linkHref}>{detail.linkText}</a>}
        </div>
    );
}

export default DetailCard;