import styles from './WhyBook.module.css';
import manyWorkspace from '../../../assets/many-workspace.png'; // Đường dẫn đến icon dấu tích
import commimentIcon from '../../../assets/commitment.png';

function WhyBook() {
    return (
        <section className={styles.whyBook}>
            <h2 className={styles.whyBookTitle}>Book space on WorkZen</h2>
            <div className={styles.whyBookContainer}>
                <div className={styles.whyBookItem}>
                    <div className={styles.iconContainer}>
                        <img src={manyWorkspace} alt="Validated Spaces" className={styles.whyBookIcon} />
                    </div>
                    <h3 className={styles.itemTitle}>Covers Spaces</h3>
                    <p className={styles.itemDescription}>
                        Many popular spaces on major platforms nomadlist.com, coworker.com and small spaces. Including all spaces in Vietnam.
                    </p>
                </div>
                <div className={styles.whyBookItem}>
                    <div className={styles.iconContainer}>
                        <img src={commimentIcon} alt="Trusted" className={styles.whyBookIcon} />
                    </div>
                    <h3 className={styles.itemTitle}>Commitment</h3>
                    <p className={styles.itemDescription}>
                        We are committed to providing quality products and experiences to our users.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default WhyBook;